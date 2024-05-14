import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { ApiErrors } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const createComment = asyncHandler(async (req, res) => {
  const userDetails = req?.user;
  const { video, content } = req.body;
  const createComment = await Comment.create({
    video,
    content,
    owners: userDetails?._id,
  });
  if (!createComment) {
    throw new ApiErrors(500, "Failed to post comment!");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createComment, "Comment successfully posted"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const _id = req.params;
  const updateComment = await Comment.findByIdAndUpdate(
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
  if (!updateComment) {
    throw new ApiErrors(500, "Failed to update comment!");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, updateComment, "Comment successfully  updated"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const _id = req.params;
  const deleteComment = await Comment.findByIdAndDelete(_id);
  if (!deleteComment) {
    throw new ApiErrors(500, "Failed to delete comment!");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, deleteComment, "Comment successfully  deleted"));
});

const getAllComments = asyncHandler(async (req, res) => {
  const {video} = req.params;
  const getAllComments = await Comment.find({
    video: video,
  });
  if (!getAllComments) {
    throw new ApiErrors(500, "Failed to get comment!");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(201, getAllComments, "Comments successfully  fetched")
    );
});

export { createComment, updateComment, deleteComment, getAllComments };
