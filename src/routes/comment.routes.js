import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {createComment, updateComment, deleteComment, getAllComments} from "../controllers/comment.controller.js"

const commentRouter = Router()
commentRouter.use(verifyJwt)
commentRouter.route("/add").post(createComment)
commentRouter.route("/update/:_id").patch(updateComment)
commentRouter.route("/delete/:_id").delete(deleteComment)
commentRouter.route("/get/:video").get(getAllComments)

export {commentRouter}