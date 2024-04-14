import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiErrors } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js"
const registeredUser = asyncHandler(async (req,res)=>{

    //1>get the user details from front end
    //2>validation - not empty and other type of validation
    //3>check if the user already exists :-- username ,email
    //4>check for images,check for avatar (this is mandatory)
    //5>upload them to cloudinary avatar
    //6>create user obj , create entry in db 
    //7>check for user creation
    //8>remove password and refresh token field from response
    //return res

    //1> destructuring  data
    // console.log("req Check ********1")
    // console.log(req.body,"req body")
    const {username,fullName,email,password} = req.body
    //2>
    if([username,email,fullName,password].some((el)=> el.trim() === '')){
        throw new ApiErrors(400,"All fields are required")
    }
    //3> User.findOne({email}) but we want if username/email exists
    const existedUser = await User.findOne({
        $or :[{username},{email}]
    })
    if(existedUser){
        throw new ApiErrors(400,`User with ${username} already exists`)
    }
    //4>
    const avatarLocal = req.files?.avatar[0]?.path
    // const coverImageLocal = req.files?.coverImage[0]?.path
    let coverImageLocal ;
    if(req.files && Array.isArray(req.files.coverImage) && req.files?.coverImage.length>0){
        coverImageLocal = req.files?.coverImage[0]?.path
    }
    if(!avatarLocal){
        throw new ApiErrors(400,`Avatar file is required!.`)
    }
    //5>
    const avatarUploadImg = await uploadOnCloudinary(avatarLocal)
    if(!avatarUploadImg){
        throw new ApiErrors(400,`Avatar file in cloudinary failed`)
    }
    const coverUploadImg = await uploadOnCloudinary(coverImageLocal)
    //6>
    const user = await User.create({
        fullName,
        avatar : avatarUploadImg?.url,
        coverImage :coverUploadImg?.url ||"",
        email,
        password,
        username :username.toLowerCase()
    })
    //7 & 8>._id is auto created by mongo
    // here firstly we are confirming that user entry made and 
    // then we will chain select()
    //select -- returns all the fields by default
    //so inside the string specify which fields not to return 
    // here we are specifying we do not need password refreshToken
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        //500 as this is a server failure 
        throw new ApiErrors(500,`Failed while creating user!!.`)
    }


    return res.status(201).json(new ApiResponse(200,createdUser,"User Registered Successfully!"))
})

const generatedAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)  
        const accessToken = user.generateAccessToken()       
        const refreshToken = user.generateRefreshToken()
        //saving refreshToken
        user.refreshToken = refreshToken
        //save is given by mongo instance
        //we need to save the user instance but we wont save the password 
        //hence will use {validateBeforeSave:false}
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    }   catch (error) {
        throw new ApiErrors(500,"Error in generating refresh and access token")
    }
}


const loginUser = asyncHandler(async(req,res)=>{
        //1>req body ->data
        //2>username or email check
        //3>find the user
        //4>password check
        //5>access and refresh token
        //6>send cookies 
        //1>
        const {email,username,password} = req.body
        //2>
        if(!username || !email){
            throw new ApiErrors (400,"Username or email is required!")
        }
        //3>
        const user = await User.findOne({
            $or:[{username},{password}]
        })
        if(!user){
            throw new ApiErrors (404,"User does not exist!")
        }
        //4>
        const isPasswordValid = await user.isPasswordCorrect(password)
        if(!isPasswordValid){
            throw new ApiErrors (401,"Invalid user credentials!")
        }
        //5>
       const {accessToken,refreshToken} =  await generatedAccessAndRefreshToken(user._id)
       const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
        //6>
        const options = {
            httpOnly:true, //httpOnly signifies it cannot be edited in front end , will only be edited in server
            secure:true 
        }
        //return response 
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    user:loggedInUser,accessToken,refreshToken
                },
                "user logged in successfully!"
            )
        )
})


//for logout we need to clear the cookies from the server 
//remove the refresh token
const logoutUser  =asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,{
            $set:{
                refreshToken : undefined
            }
        },{
            new:true // to get the new updated value in response
        }
    )
    const options = {
        httpOnly:true, 
        secure:true 
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out"))
})

export {registeredUser,loginUser,logoutUser}