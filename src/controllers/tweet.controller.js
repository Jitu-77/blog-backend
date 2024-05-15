import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Tweet} from "../models/tweets.model.js"
import { ApiErrors } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const createTweet = asyncHandler(async (req, res) => {
    const userDetails = req?.user;
    const { content } = req.body;
    const createTweet = await Tweet.create({
      content,
      owners: userDetails?._id,
    });
    if (!createTweet) {
      throw new ApiErrors(500, "Failed to post tweet!");
    }
    return res
      .status(201)
      .json(new ApiResponse(201, createTweet, "Tweet successfully posted"));
});
const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const _id = req.params;
    const updateTweet = await Tweet.findByIdAndUpdate(
      _id,
      {
        $set: {
          content,
        },
      },
      {
        new: true,
      }
    );
    if (!updateTweet) {
      throw new ApiErrors(500, "Failed to update tweet!");
    }
    return res
      .status(201)
      .json(new ApiResponse(201, updateTweet, "Tweet successfully  updated"));
});
const deleteTweet = asyncHandler(async (req, res) => {
    const _id = req.params;
    const deleteTweet = await Tweet.findByIdAndDelete(_id);
    if (!deleteTweet) {
      throw new ApiErrors(500, "Failed to delete tweet!");
    }
    return res
      .status(201)
      .json(new ApiResponse(201, deleteTweet, "Tweet successfully  deleted"));
});
const getAllTweets = asyncHandler(async (req, res) => {
    const userDetails = req?.user;
    const getAllTweets = await Tweet.find({
        owners: userDetails?._id
    });
    if (!getAllTweets) {
      throw new ApiErrors(500, "Failed to get comment!");
    }
    return res
      .status(201)
      .json(
        new ApiResponse(201, getAllTweets, "Tweets successfully  fetched")
      );
});

export { createTweet, updateTweet, deleteTweet, getAllTweets };
