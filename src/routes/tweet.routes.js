import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import  { createTweet, updateTweet, deleteTweet, getAllTweets } from "../controllers/tweet.controller.js"
const tweetRouter = Router()

tweetRouter.use(verifyJwt)
tweetRouter.route("/add").post(createTweet)
tweetRouter.route("/update/:_id").patch(updateTweet)
tweetRouter.route("/delete/:_id").delete(deleteTweet)
tweetRouter.route("/getAll").get(getAllTweets)


export {
    tweetRouter
}