import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { uploadVideo ,deleteVideosById,getAllVideosById,
  getAllVideosByUserName,publishVideo,updateView,updateVideoDetails,
  updateVideo, updateImage} from "../controllers/video.controller.js";

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

videoRouter.route("/deleteVideo/:_id").delete(verifyJwt,deleteVideosById)
videoRouter.route("/all").get(verifyJwt,getAllVideosById)
videoRouter.route("/publish").patch(verifyJwt,publishVideo)
videoRouter.route("/updateVideoDetails").patch(verifyJwt,updateVideoDetails)
videoRouter.route("/allVideos/:username").get(getAllVideosByUserName)
videoRouter.route("/view").patch(updateView)
videoRouter.route("/updateVideo").patch(verifyJwt,
  upload.single("videoFile"),updateVideo)
videoRouter.route("/updateImage").patch(verifyJwt,
  upload.single("thumbnail"),updateImage)

export { videoRouter };
