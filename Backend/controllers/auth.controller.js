import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import crypto from "crypto"
import { Otp } from "../models/otp.model.js";
import { sendEmail } from "../utils/email.js";
import { Company } from "../models/company.model.js";
import { getCurrencyByCountry } from "../utils/currencyHelper.js";

function generatePassword(length = 8) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}


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


const register = asyncHandler(async (req, res) => {
  const { name, email, password,confirmPassword,country } = req.body;

  if (!name || !email || !password || !confirmPassword || !country) throw new ApiError(403, "provide all fields");
  
  const currency = await getCurrencyByCountry(country);
  if (!currency) throw new ApiError(400,"incorrect country")

  if(password!=confirmPassword) throw new ApiError(400,"passworwd not matched")

  let company = await Company.create({
    name: name,
    email: email,
    country: country,
    currency:{code:currency.code,name:currency.name,symbol:currency.symbol}
  })
  if (!company) throw new ApiError(500, "company creation failed");

  let user = await User.create({
    name: `Admin_${company.name}`,
    email: email,
    password: password,
    role: "admin",
    companyId: company._id,
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
    "-password -role"
  );

  return res
    .status(201)
    .cookie(accessToken, "accessToken", options)
    .cookie(refreshToken, "refreshToken", options)
    .json(new ApiResponse(201, user, "user registered successfully"));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) throw new ApiError(403, "provide username or email");
  if (!password) throw new ApiError(403, "provide password");

  let user = await User.findOne({ email: email })
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

  user = await User.findById(user._id).select("-password")

  return res
    .status(200)
    .cookie(accessToken, "accessToken", options)
    .cookie(refreshToken, "refreshToken", options)
    .json(new ApiResponse(200, user, "user logged in successfully"));
});


export {
  refreshController,
  logout,
  meController,
  register,
  login
};


// const emailText = `
//     Hello Admin,

//     Your admin account has been created successfully.

//     Email: ${adminEmail}
//     Password: ${randomPassword}

//     Please login and change your password immediately.
//   `;
// await sendEmail(email, "Your Admin Account Password", emailText, null);