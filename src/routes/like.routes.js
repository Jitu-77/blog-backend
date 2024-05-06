import {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideo,
} from "../controllers/like.controller.js";
import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const likeRouter = Router();
likeRouter.use(verifyJwt);
likeRouter.route("/getLikedVideo").get(getLikedVideo);
likeRouter.route("/toggleTweetLike").post(toggleTweetLike);
likeRouter.route("/toggleCommentLike").post(toggleCommentLike);
likeRouter.route("/toggleVideoLike").post(toggleVideoLike);

export { likeRouter };
