import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const userDetail = req.user;
  const { _id } = req.body;
  const toggleVideoLike = await Like.find({
    $and: [{ video: _id, likedBy: userDetail?._id }],
  });
  if (toggleVideoLike?.length) {
    console.log("Video like present ----> absent");
    const toggleVideo = await Like.findOneAndDelete({
      $and: [{ video: _id, likedBy: userDetail?._id }],
    });
    if (!toggleVideo) {
      throw new ApiErrors(500, "Failed to unlike the video");
    }
    return res
      .status(201)
      .json(new ApiResponse(201, toggleVideo, "video un-liked"));
  } else {
    console.log("Video like absent --> present ");
    const toggleVideo = await Like.create({
      video: _id,
      likedBy: userDetail?._id,
    });
    if (!toggleVideo) {
      throw new ApiErrors(500, "Failed to like the video");
    }
    return res
      .status(201)
      .json(new ApiResponse(201, toggleVideo, "video liked"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const userDetail = req.user;
  const { _id } = req.body;
  const toggleCommentLike = await Like.find({
    $and: [{ comment: _id, likedBy: userDetail?._id }],
  });
  if (toggleCommentLike?.length) {
    const toggleComment = await Like.findOneAndDelete({
      $and: [{ comment: _id, likedBy: userDetail?._id }],
    });
    if (!toggleComment) {
      throw new ApiErrors(500, "Failed to unlike the video");
    }
    return res
      .status(201)
      .json(new ApiResponse(201, toggleComment, "video un-liked"));
  } else {
    const toggleComment = await Like.create({
      comment: _id,
      likedBy: userDetail?._id,
    });
    if (!toggleComment) {
      throw new ApiErrors(500, "Failed to like the comment");
    }
    return res
      .status(201)
      .json(new ApiResponse(201, toggleComment, "Comment liked"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const userDetail = req.user;
    const { _id } = req.body;
    const toggleTweetLike = await Like.find({
      $and: [{ tweet: _id, likedBy: userDetail?._id }],
    });
    if (toggleTweetLike?.length) {
      console.log("Tweet like present ----> absent");
      const toggleTweet = await Like.findOneAndDelete({
        $and: [{ tweet: _id, likedBy: userDetail?._id }],
      });
      if (!toggleTweet) {
        throw new ApiErrors(500, "Failed to unlike the tweet");
      }
      return res
        .status(201)
        .json(new ApiResponse(201, toggleTweet, "Tweet un-liked"));
    } else {
      const toggleTweet = await Like.create({
        tweet: _id,
        likedBy: userDetail?._id,
      });
      if (!toggleTweet) {
        throw new ApiErrors(500, "Failed to like the tweet");
      }
      return res
        .status(201)
        .json(new ApiResponse(201, toggleTweet, "Tweet liked"));
    }
});

const getLikedVideo = asyncHandler(async (req, res) => {
  console.log(req.user)
  const userDetail = req.user;

  const likedVideo = await Like.aggregate([
    {
      $match: { likedBy: userDetail?._id ,video: { $exists: true }},
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
  console.log(likedVideo)
  if (!likedVideo) {
    throw new ApiErrors(500, "Unable to fetch video files");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        likedVideo,
        "Liked video list fetched successfully"
      )
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideo };
