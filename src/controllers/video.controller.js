import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import { Video } from "../models/video.model.js";
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
    console.log(title,description,isPublished,ownerDetails,"###BODY#########")
    console.log(req.files,"#FILES###########")
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
    res.status(200)
    .json(new ApiResponse(201,{
        videoDetails
    },"Done"))

})

export {uploadVideo}