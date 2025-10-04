import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import crypto from "crypto"
import { Otp } from "../models/otp.model.js";
import { sendEmail } from "../utils/email.js";


const generateAccessAndRefereshTokens = async (user) => {
  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error("Token generation failed: " + error.message);
  }
};



const refreshController = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    const options={
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    }
    res.cookie("refreshToken", newRefreshToken,options);
    res.json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: "Refresh token expired/invalid" });
  }
};

const logout=(req,res)=>{
    const options={
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    }
    res.clearCookie("accessToken",options);
    res.clearCookie("refreshToken", options);
    res.status(200).json({ message: "Cookies cleared" });
}

const meController = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  res.json({ user: req.user });
};


const login=asyncHandler(async(req,res)=>{
  const {fullname,email,password}=req.body
  
  if(!fullname && !email) throw new ApiError(403,"provide fullname or email")
  if(!password) throw new ApiError(403,"provide password")
  
  let user=await User.findOne({
    $or:[
      {name:fullname},
      {email:email}
    ]
  }).select("+password")
  if(!user) throw new ApiError(500,"user not found,please register")
  
  const isCorrect=await user.isPasswordCorrect(password)
  if(!isCorrect) throw new ApiError(403,"incorrect password")
  
    console.log(user);
    
  if(!user.isVerified) throw new ApiError(403,"user not verified,please verify email")

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user)

  const options={
    httpOnly:true,
    secure:true
  }

  user=await User.findById(user._id).select("-googleId -role -avatar")

  return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
      new ApiResponse(200,user,"user logged in successfully")
    )
})

const generateOtp = ()=> crypto.randomInt(100000,999999).toString()

const expiry= () => new Date(Date.now() + 60*5*1000)

const register = asyncHandler(async (req, res) => {
  const { fullname, email, password, role } = req.body;
  if (!fullname || !email || !password) throw new ApiError(403, "provide all fields");

  if (role === "admin") throw new ApiError(403, "You cannot register as admin");
  
  let user = await User.findOne({ email }).select("-password -role -__v");
  if(user) throw new ApiError(401,"user already registered.please login or verify email")

  user = await User.create({
    name: fullname,
    email: email,
    password: password,
    role:role || "user"
  });
  if (!user) throw new ApiError(500, "user creation failed");


  const otp=await Otp.create({
    purpose: "signup",
    user: user._id,
    email: user.email,
    code: generateOtp(),
    expiresAt: expiry(),
  });

  await sendEmail(user.email,otp.code)  

  return res
    .status(201)
    .json(new ApiResponse(201, user, "user registered successfully"));
});


const verifyOtp=asyncHandler(async(req,res)=>{
  const { email, otp } = req.body;
  if (!otp|| !email) throw new ApiError(403, "provide all fields");

  const user=await User.findOne({email}).select("-password -role -__v")
  if(!user) throw new ApiError(404,"no user registered with this email")

  if(user.isVerified) throw new ApiError(403,"user already verified")

  let otpDoc =await Otp.findOne({email,purpose:"signup",used:false}).sort({createdAt:-1})
  if(!otpDoc) throw new ApiError(404,"no otp send")
  
  if(otpDoc.expiresAt<new Date()) throw new ApiError(404,"opt already expired")
  if(otpDoc.code!=otp) throw new ApiError(403,"incorrect otp")

  otpDoc.used=true
  await otpDoc.save()
  user.isVerified=true;

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, user, "otp verified successfully"));
})

const resendOtp= asyncHandler(async(req, res) => {
    const { email } = req.body;
    if (!email) throw new ApiError(403, "provide all fields");

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "no user registered with this email");

    if (user.isVerified) throw new ApiError(403, "user already verified");

    let otpDoc = await Otp.findOne({ email });
    if (!otpDoc) {
        await Otp.create({
          purpose: "signup",
          user: user._id,
          email: user.email,
          code: generateOtp(),
          expiresAt: expiry(),
        });
    }
    else{
      const diff=(new Date()-otpDoc.updatedAt)/1000
      if(diff<60) throw new ApiError(429,`Please wait ${60 - Math.floor(diff)}s before requesting another OTP`);

      otpDoc.code=generateOtp()
      otpDoc.expiresAt=expiry()
      await otpDoc.save()
    }

    await sendEmail(user.email, otpDoc.code);  

    return res
      .json(new ApiResponse(200, {}, "otp resend successfully"));
});


const userRegisterUsingEmail = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    throw new ApiError(403, "provide all fields");
  let user = await User.create({
    name: username,
    email: email,
    password: password,
  });
  if (!user) throw new ApiError(500, "user creation failed");

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  user = await User.findById(user._id).select(
    "-password -googleId -role -avatar"
  );

  return res
    .status(201)
    .cookie(accessToken, "accessToken", options)
    .cookie(refreshToken, "refreshToken", options)
    .json(new ApiResponse(201, user, "user registered successfully"));
});

const loginUsingEmail = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) throw new ApiError(403, "provide username or email");
  if (!password) throw new ApiError(403, "provide password");

  let user = await User.findOne({
    $or: [{ name: username }, { email: email }],
  }).select("+password");
  if (!user) throw new ApiError(500, "user not found,please register");

  const isCorrect = await user.isPasswordCorrect(password);
  if (!isCorrect) throw new ApiError(403, "incorrect password");

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  user = await User.findById(user._id).select("-googleId -role -avatar");

  return res
    .status(200)
    .cookie(accessToken, "accessToken", options)
    .cookie(refreshToken, "refreshToken", options)
    .json(new ApiResponse(200, user, "user logged in successfully"));
});

const adminRegisterUsingEmail = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    throw new ApiError(403, "provide all fields");
  let user = await User.create({
    name: username,
    email: email,
    password: password,
    role: "admin",
  });
  if (!user) throw new ApiError(500, "user creation failed");

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  user = await User.findById(user._id).select(
    "-password -googleId -role -avatar"
  );

  return res
    .status(201)
    .cookie(accessToken, "accessToken", options)
    .cookie(refreshToken, "refreshToken", options)
    .json(new ApiResponse(201, user, "user registered successfully"));
});


export {
  refreshController,
  logout,
  meController,
  register,
  login,
  verifyOtp,
  resendOtp,
  authenticateController,
  callbackController,
  userRegisterUsingEmail,
  loginUsingEmail,
  adminRegisterUsingEmail,
};