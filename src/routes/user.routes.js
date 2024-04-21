import { Router } from "express";
import {
  registeredUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUSer,
  updateAccountDetails,
  updateUserAvatar,
  updateUserImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registeredUser
);

userRouter.route("/login").post(loginUser);

//secured Routes
//verifyJwt a middle ware to track is the user verified
//next() is to ensure the middle ware has finished its task
//now please run the second function int route
userRouter.route("/logout").post(verifyJwt, logoutUser);
//we could have jwt verify as middle ware but we have already written our logic in controllers
//so not required
//userRouter.route("/refresh-token").post(verifyJwt,refreshAccessToken)
userRouter.route("/refresh-token").post(refreshAccessToken);

userRouter.route("/changePassword").post(verifyJwt, changeCurrentPassword);
userRouter.route("/current-user").get(verifyJwt, getCurrentUSer);
userRouter.route("/update-account").patch(verifyJwt, updateAccountDetails);
userRouter
  .route("/update-avatar")
  .patch(verifyJwt, upload.single("avatar"), updateUserAvatar);
userRouter
  .route("/update-cover-image")
  .patch(verifyJwt, upload.single("coverImage"), updateUserImage);

//using url params
userRouter.route("/name/:username").get(verifyJwt, getUserChannelProfile);

userRouter.route("/history").get(verifyJwt, getWatchHistory);
export { userRouter };
// export default userRouter
