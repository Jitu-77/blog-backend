import { Router } from "express";
import { registeredUser,loginUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const userRouter = Router()

userRouter.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registeredUser)
    
userRouter.route("/login").post(loginUser)

//secured Routes
//verifyJwt a middle ware to track is the user verified
//next() is to ensure the middle ware has finished its task 
//now please run the second function int route
userRouter.route("/logout").post(verifyJwt,logoutUser)


export {userRouter}
// export default userRouter