import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userDetails = req?.user
    const channelVideo = await Video.find({
        owner : userDetails?._id
    })
    const totalVideoViews =channelVideo?.length > 0 ? channelVideo.reduce((acc,current)=>{
       return acc = acc + current?.views
    },0) : 0
    const channelSubscribersData = await Subscription.aggregate([
        {
            $match:{
                channel : userDetails?._id,
            },
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as : "subscribersList"
            }
        },
        {
          $unwind: "$subscribersList", // Flatten the likedVideoList array
        },
        {
          $group: {
            _id: null,
            subscribersList: { $push: "$subscribersList" }, // Push all documents into a single array
          },
        },
        {
            $project:{
                subscribersList:1,
                _id:0
            }
        }
    ])
    let channelSubscribersList= channelSubscribersData ? channelSubscribersData[0]?.subscribersList : []
    let channelSubscribersDetails =channelSubscribersList?.length ?  channelSubscribersList?.map((el)=>{
          return el ={_id:el?._id ,username:el?.username,email:el?.email,
                      fullName :el?.fullName,avatar:el?.avatar,coverImage:el?.coverImage
                      }
    }) : []
    const likedVideo = await Like.aggregate([
        {
          $match: { likedBy: userDetails?._id ,video: { $exists: true }},
        },
        {
          $lookup: {
            from: "videos",
            localField: "video",
            foreignField: "_id",
            as: "likedVideoList",
          },
        },
        {
          $unwind: "$likedVideoList", // Flatten the likedVideoList array
        },
        {
          $group: {
            _id: null,
            likedVideoList: { $push: "$likedVideoList" }, // Push all documents into a single array
          },
        },
        {
          $project: {
            likedVideoList: 1,
            _id:0
          },
        },
    ]);
    const channelLikeVideoDetails = await Video.aggregate([
        {
            $match: { owner: userDetails?._id },
        },
        {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "channelLikeVideoList",
            },
        },
        {
            $unwind: "$channelLikeVideoList", // Flatten the likedVideoList array
        },
          {
            $group: {
              _id: null,
              channelLikeVideoList: { $push: "$channelLikeVideoList" }, // Push all documents into a single array
            },
          },
          {
            $project: {
                channelLikeVideoList: 1,
              _id:0
            },
          },
    ])
    let data = {
        channelVideo,
        totalVideoViews,
        channelSubscribersDetails,
        likedVideo,
        channelLikeVideoDetails
    }
    res.status(201)
        .json(new ApiResponse(201,data,"Data fetched successfully"))
})
const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userDetails = req?.user
    const channelVideo = await Video.find({
        owner : userDetails?._id
    })
    if(!channelVideo){
        throw new ApiErrors(500,"Failed to fetch channel video!!")
    }
    return res.status(201)
    .json(
        new ApiResponse(201,channelVideo,"Video details fetched successfully")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }