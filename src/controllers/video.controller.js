import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const uploadVideo = asyncHandler (async (req,res)=>{
    const {title,description,isPublished} = req.body
    if([title,description,isPublished].some((el)=>el.trim()=="")){
        throw new ApiErrors (401,"All the parameters are required")
    }
    const ownerDetails =  req.user
    let videoFilePath =""
    let imageFilePath =""
    if( req.files && 
        Array.isArray(req.files.videoFile)&&
        req.files.videoFile.length>0){
            videoFilePath =  req.files.videoFile[0]?.path
      }
    if( req.files && 
      Array.isArray(req.files.thumbnail)&&
      req.files.thumbnail.length>0){
        imageFilePath =  req.files.thumbnail[0]?.path
    }
    if(!videoFilePath){
        throw new ApiErrors (401,"video file is required")
    }
    if(!imageFilePath){
        throw new ApiErrors (401,"Thumbnail file is required")
    }
    // console.log(videoFilePath,imageFilePath,"UPLOADED DETAILS")

    const imageUploadDetails = await uploadOnCloudinary(imageFilePath);
    const videoUploadDetails = await uploadOnCloudinary(videoFilePath );
    // console.log(videoUploadDetails,imageUploadDetails,"UPLOADED DETAILS")
    const videoDetails = await Video.create
    ({
        title,
        description,
        isPublished,
        owner:ownerDetails?._id,
        duration:videoUploadDetails?.duration,
        videoFile: videoUploadDetails?.url,
        thumbnail :imageUploadDetails?.url,
        views:0
    })
    if(!videoDetails){
        new ApiErrors(500,"Something went wrong in creating record!!")
    }
    res.status(201)
    .json(new ApiResponse(201,{
        videoDetails
    },"video uploaded successfully"))

})

const updateVideoDetails =asyncHandler(async(req,res)=>{
    console.log(req.body)
    const {title,description,isPublished,_id} = req.body
    console.log(title,description,isPublished,_id)
    const videoDetails = await Video.findByIdAndUpdate(
        _id,
        {
            $set:{
                title,
                description,
                isPublished
            }

        },
        {
            new:true
        }
    )
    if(!videoDetails){
        throw new ApiErrors(500,"Unable to update!.")
    }
    return res.status(201)
    .json(new ApiResponse(201,videoDetails,"Updated successfully"))
})
const updateVideo =asyncHandler(async (req,res)=>{
    let {_id} = req.body
    let videoLocalPath  = req.file.path
    if(!videoLocalPath){
        throw new ApiErrors(500,"Video is required")
    }
    const videoUploadDetails = await uploadOnCloudinary(videoLocalPath)
    const videoUpdateDetails = await Video.findByIdAndUpdate(_id,
        {
            $set:{
                videoFile :  videoUploadDetails?.url,
                duration:videoUploadDetails?.duration
            }
        },
        {
            new:true
        })
    if(!videoUpdateDetails){
        throw new Error (ApiErrors(500,"Failed to updated video!"))
    }
    return res.status(201)
    .json(
        new ApiResponse(201,videoUpdateDetails,"Video updated successfully!")
    )
})
const updateImage = asyncHandler(async (req,res)=>{
    let {_id} = req.body
    let imageLocalPath  = req.file.path
    if(!imageLocalPath){
        throw new ApiErrors(500,"Thumbnail image is required")
    }
    const imageUploadDetails = await uploadOnCloudinary(imageLocalPath)
    const imageUpdateDetails = await Video.findByIdAndUpdate(_id,
        {
            $set:{
                thumbnail :  imageUploadDetails?.url
            }
        },
        {
            new:true
        })
    if(!imageUpdateDetails){
        throw new Error (ApiErrors(500,"Fialed to updated thumbnail image!"))
    }
    return res.status(201)
    .json(
        new ApiResponse(201,imageUpdateDetails,"Thumbnail updated successfully!")
    )

})
const getAllVideosByUserName = asyncHandler(async (req,res)=>{
    console.log("here in get by username")
    const {username} = req.params
    console.log("here in get by username",username)
   const user = await User.aggregate([
    {
        $match : {username:username}
    },
    {
     $lookup:{
        from : "videos",
        localField:"_id",
        foreignField:"owner",
        as :"videoList"
     }
    }
   ])
   console.log(user[0].videoList,"user---+++----")
   if(!user){
    throw new ApiErrors(500,"something went wrong while fetching data!.")
   }
   return res.status(201)
   .json(new ApiResponse(201,user[0].videoList,"Fetching video successfully"))
})
const getAllVideosById = asyncHandler(async(req,res)=>{
    console.log("here in get by id")
    const videoList = await Video.find({owner:req.user._id })
    if(!videoList){
        throw new ApiErrors(500,"Some went wrong while fetching data")
    }
    return res.status(201)
    .json(new ApiResponse(201,videoList,"data fetched successfully"))
})
const deleteVideosById = asyncHandler(async(req,res)=>{
    const conditionVideoId = {id:req.params.id };
    const conditionOwnerId = { owner: req.user._id };
    const videoDetails = await Video.findOneAndDelete({
        $and:[conditionVideoId,conditionOwnerId]
    })
    if(!videoDetails){
        throw new ApiErrors (500,"Something went wrong while deleting video!")
    }
    res.status(201)
    .json(new ApiResponse(201,videoDetails,"Deleted successfully"))
    console.log(videoDetails,"videoDetails----")
})
const updateView = asyncHandler(async(req,res)=>{
        const token = req.cookies?.accessToken // req has access to all the middlewares
                  || req.header("Authorization")?.replace("Bearer ","") 
        let user =   {}
        if(token) {
            const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
            user = await User.findById(decodedToken._id).select(
                "-password -refreshToken")
        }
        const{_id} = req.body
        const videoDetails = await Video.findByIdAndUpdate(
            _id,
            {
                $inc:{
                    views :1
                }
            },
            {
                new : true
            }
        )
        if(user){
            console.log(user)
            const userDetails = await User.findByIdAndUpdate(
                // new mongoose.Types.ObjectId(user._id),
                user._id,
                {
                    $push:{
                        watchHistory:_id
                    }
                }
            )
        }
        if(!videoDetails){
            throw new ApiErrors(500,"View Update failing")
        }
        return res.status(201)
            .json(new ApiResponse(201,videoDetails,"view updated successfully"))
})
const publishVideo = asyncHandler(async(req,res)=>{
    const {isPublished,_id} = req.body
    let videoDetails = await Video.findByIdAndUpdate(
        _id,
        {
            $set:{
                isPublished : isPublished
            }
        },
        {
            new:true
        }
    )
    if(!videoDetails){
        throw new ApiErrors(500,"Something went wrong while updating video")
    }
    return res.status(201)
    .json(new ApiResponse(201,videoDetails,"Details updated successfully"))
})


export {
    uploadVideo,
    updateVideoDetails,
    getAllVideosById,
    deleteVideosById,
    updateView,
    publishVideo,
    getAllVideosByUserName,
    updateVideo,
    updateImage
}