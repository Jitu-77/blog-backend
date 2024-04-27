import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { uploadVideo } from "../controllers/video.controller.js";

const videoRouter = Router();

videoRouter.route("/uploadVideo").post(
  verifyJwt,
  upload.fields([
    {
    name: "videoFile",
    maxCount: 1,
    required:true
    },
    {
    name: "thumbnail",
    maxCount: 1,
    required:true
    }
]),
  uploadVideo
);

export { videoRouter };
