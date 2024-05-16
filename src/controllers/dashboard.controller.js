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
            $project:{
                subscribersList:1
            }
        }
    ])
    let channelSubscribersList= channelSubscribersData ? channelSubscribersData[0]?.subscribersList : []
    let channelSubscribersDetails =channelSubscribersList?.length ?  channelSubscribersList?.map((el)=>{
          return el ={_id:el?._id ,username:el?.username,email:el?.email,
                      fullName :el?.fullName,avatar:el?.avatar,coverImage:el?.coverImage
                      }
    }) : []
    let likeDetails = await Video.aggregate([
        {
            $match : {owner:userDetails?._id}
        },
        {
            $lookup:{
                from:"likes",
                localField:"owner",
                foreignField:"video",
                as : "likedVideo"
            }
        }
    ])
    console.log(channelVideo,"channelVideo 1")
    console.log(totalVideoViews,"totalVideoViews 1")
    console.log(channelSubscribersDetails,"channelSubscribersDetails 1")
    console.log(likeDetails,"likeDetails 1")
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