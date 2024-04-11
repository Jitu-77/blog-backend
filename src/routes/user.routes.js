import { Router } from "express";
import { registeredUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const userRouter = Router()

userRouter.route("/register").post(
    upload.fields([
        {
            name:avatar,
            maxCount:1
        },
        {
            name:coverImage,
            maxCount:1
        }
    ]),
    registeredUser)

export {userRouter}
// export default userRouter