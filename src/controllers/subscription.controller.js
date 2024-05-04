import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

//1>> post toggle subscription
//2>    get subscribers list
//3>get subscriber to list
const toggleSubscription = asyncHandler(async (req, res) => {
  const userDetails = req.user;
  if (!userDetails) {
    throw new ApiErrors(401, "Please sign in to subscribe!");
  }
  const { _id } = req.body;
  if (userDetails?._id.toString() == _id) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "You cannot subscribe you own account!"));
  } else {
    const subscriptionDetails = await Subscription.find({
      $and: [{ subscriber: userDetails?._id }, { channel: _id }],
    });
    if (subscriptionDetails.length) {
      console.log("DELETE");
      const subscription = await Subscription.findOneAndDelete({
        subscriber: userDetails?._id,
        channel: _id,
      });
      if (subscription) {
        return res
          .status(200)
          .json(new ApiResponse(200, {}, "Successfully un-subscribed"));
      }
    } else {
      console.log("CREATE");
      const subscription = await Subscription.create({
        subscriber: userDetails?._id,
        channel: _id,
      });
      if (subscription) {
        return res
          .status(200)
          .json(new ApiResponse(200, {}, "Successfully subscribed"));
      }
    }
  }
 });

const getSubscribersList = asyncHandler(async (req, res) => {
  const userDetails = req.user;
  console.log(userDetails,"getSubscribersList")
  // w.r.t Channel --subscriber count
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
    console.log(channelSubscribersData,"subscribedData")
    if(!channelSubscribersData){
      throw new ApiErrors(500,"Failed to fetch list!!")
    }
    let channelSubscribersList= channelSubscribersData ? channelSubscribersData[0]?.subscribersList : []
  console.log(channelSubscribersList,"channelSubscribersList")
  let finalResponse =channelSubscribersList?.length ?  channelSubscribersList?.map((el)=>{
        return el ={_id:el?._id ,username:el?.username,email:el?.email,
                    fullName :el?.fullName,avatar:el?.avatar,coverImage:el?.coverImage
                    }
  }) : []
  return res.status(201)
            .json(
                new ApiResponse(201,finalResponse,"Details fetched successfully")
            )
});

const getSubscribedToList = asyncHandler(async (req, res) => {
  const userDetails = req.user;
  console.log(userDetails,"getSubscribedToList")
  //w.r.t subscriber -- channel count 
  const subscribedData = await Subscription.aggregate([
    {
        $match:{
            subscriber : userDetails?._id,
        }
    },
    {
        $lookup:{
            from:"users",
            localField:"channel",
            foreignField:"_id",
            as : "subscribedList"
        }
    },
    {
        $project:{
             subscribedList:1
        }
    }
    ])
    console.log(subscribedData,"subscribedData")
    if(!subscribedData){
      throw new ApiErrors(500,"Failed to fetch list!!")
    }
    let subscribedList= subscribedData ? subscribedData[0]?.subscribedList : []
  console.log(subscribedList,"subscribedList")
  let finalResponse =subscribedList?.length ? subscribedList.map((el)=>{
        return el ={_id:el?._id ,username:el?.username,email:el?.email,
                    fullName :el?.fullName,avatar:el?.avatar,coverImage:el?.coverImage
                    }
  }) :[]
  return res.status(201)
            .json(
                new ApiResponse(201,finalResponse,"Details fetched successfully")
            )
});

export { toggleSubscription, getSubscribersList, getSubscribedToList };
