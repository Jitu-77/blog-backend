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
    const {username ,fullName,email,password} = res.body
    console.log(req,"req")
    console.log(req.body,"req body")
    console.log(req.files,"req files")
    //2>
    if([username,email,fullName,password].some((el)=> el.trim() === '')){
        throw new ApiErrors(400,"All fields are required")
    }
    //3> User.findOne({email}) but we want if username/email exists
    const existedUser = User.findOne({
        $or :[{username},{email}]
    })
    if(existedUser){
        throw new ApiErrors(400,`User with ${username} already exists`)
    }
    //4>
    const avatarLocal = req.files?.avatar[0]?.path
    const coverImageLocal = req.files?.coverImage[0]?.path
    if(!avatarLocal){
        throw new ApiErrors(400,`Avatar file is required!.`)
    }
    //5>
    const avatarUploadImg = await uploadOnCloudinary(avatarLocal)
    if(!avatarUploadImg){
        throw new ApiErrors(400,`Avatar file is required!.`)
    }
    const coverUploadImg = await uploadOnCloudinary(coverImageLocal)
    //6>
    const user = User.create({
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

export {registeredUser}