import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getProfile=asyncHandler(async(req,res)=>{
    const {_id}=req.user
    const user=await User.findById(_id).select("-password -refreshToken")
    if(!user) throw new ApiError(404,"user not found")
    
    return res 
    .json(
        new ApiResponse(200,user,"user profile")
    )
})

const updateProfile=asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    if (!user) throw new ApiError(404, "user not found");
    
    const {name}=req.body
    if (name) user.name = name;
    await user.save()

    return res.json(new ApiResponse(200, user, "user profile updated"));    
})


const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if(!oldPassword || !newPassword) throw new ApiError(403,"old and new password required")
    
    const user=await User.findById(req.user._id).select("+password")

    const isCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isCorrect) throw new ApiError(403,"password not match, please enter correct password")
    
    user.password=newPassword
    await user.save()

    return res.json(new ApiResponse(200, {}, "password changed successfully"));    
});

export { getProfile, updateProfile, changePassword };