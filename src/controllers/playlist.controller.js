import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Playlist } from "../models/playlist.model.js";
import { ApiErrors } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlayList = asyncHandler(async (req, res) => {
  const userDetail = req.user
  console.log(userDetail,"user")

  let {name,description,video}=req.body
  console.log(name,description,video,"details")

  const playList = await Playlist.create({
    name,
    description,
    owner : userDetail?._id ,
  })
  console.log(playList,"playList")
  if(playList){
    if(video){
      const updatePlayList = await Playlist.findByIdAndUpdate(
        playList?._id,
        {
        $push :{
          video: video
          }
        },{
          new :true
        }
      )
      if(!updatePlayList){
        throw new ApiErrors(500,"Failed to create playlist!")
      }
      return res.status(201).json(new ApiResponse(201,updatePlayList,"Playlist successfully created"))
    }
    return res.status(201).json(new ApiResponse(201,playList,"Playlist successfully created"))
  }
  throw new ApiErrors(500,"Failed to create playlist!")
});

const updatePlayList = asyncHandler(async (req, res) => {
  const {_id,name,description}=req.body
  const updatePlayList = await Playlist.findByIdAndUpdate(
    _id,
    {
      $set :{name,description}
    },
    {
      new:true
    }
  )
  if(!updatePlayList){
    throw new ApiErrors(500,"Failed to update")
  }
  return res.status(201).json(new ApiResponse(201,updatePlayList,"Playlist details updated!"))
});

const deletePlayList = asyncHandler(async (req, res) => {
  const {_id} = req.body
  console.log(_id)
  const deletePlayList = await Playlist.findByIdAndDelete(
    _id
    // new mongoose.Types.ObjectId(_id)
  )
  if(!deletePlayList){
    throw new ApiErrors(500,"Delete playlist failed")
  }
  return res.status(201)
            .json(new ApiResponse(201,[],"playlist deleted successfully!!"))
});

const getById = asyncHandler(async (req, res) => {
  const {_id} = req.params
  const playlist = await Playlist.findById(_id)
  if(!playlist){
    throw new ApiErrors (500,"Play list deleted!")
  }
  return res.status(201)
            .json(
              new ApiResponse(201,playlist,"Playlist returned successfully")
            )
});

const getAllPlayList = asyncHandler(async (req, res) => {
    const playlistList = await Playlist.find({owner:req.user._id })
    if(!playlistList){
      throw new ApiErrors (500,"Play list cannot be fetched!")
    }
    return res.status(201)
              .json(
                new ApiResponse(201,playlistList,"Playlist list returned successfully")
              )
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  let {_id,video}=req.body
  let updatedPlayList = undefined
  if(Array.isArray(video)){
    updatedPlayList  = await Playlist.findByIdAndUpdate(
      _id,
      {
        $addToSet:{
          video : { $each: video } 
        }
      },
      {
        new :true
      }
    )
  }else{
    updatedPlayList  = await Playlist.findByIdAndUpdate(
      _id,
      {
        $addToSet:{
          video : video
        }
      },
      {
        new :true
      }
    )
  }
  if(!updatePlayList){
    throw new ApiErrors(500,"Failed to add in playlist!")
  }
  return res.status(201)
  .json(
    new ApiResponse(201,updatedPlayList,"Video added successfully")
  )
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  let {_id,video}=req.body
  let updatedPlayList = undefined
  if(Array.isArray(video)){
    updatedPlayList  = await Playlist.findByIdAndUpdate(
      _id,
      {
        $pull:{
          video : { $in: video } 
        }
      },
      {
        new :true
      }
    )
  }else{
    updatedPlayList  = await Playlist.findByIdAndUpdate(
      _id,
      {
        $pull:{
          video : video
        }
      },
      {
        new :true
      }
    )
  }
  if(!updatePlayList){
    throw new ApiErrors(500,"Failed to add in playlist!")
  }
  return res.status(201)
  .json(
    new ApiResponse(201,updatedPlayList,"Video added successfully")
  )

});


export {
  createPlayList,
  updatePlayList,
  deletePlayList,
  getById,
  getAllPlayList,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
};
