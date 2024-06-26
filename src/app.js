import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16kb"})) // helps to parse form data
app.use(express.urlencoded({ //helps to parse data from url , it can also parse nested objects (extended:true)
    extended:true,
    limit:"16kb"
}))
app.use(express.static('public')) //helps to serve assets from <public> folder
app.use(cookieParser())


//routes import
import {userRouter} from "./routes/user.routes.js"
import { healthCheckRouter } from "./routes/healthCheck.routes.js" 
import { videoRouter } from "./routes/video.routes.js"
import {subscriptionRoute} from "./routes/subscription.routes.js"
import {playListRouter} from "./routes/playlist.routes.js"
import { likeRouter } from "./routes/like.routes.js"
import { commentRouter } from "./routes/comment.routes.js"
import { tweetRouter } from "./routes/tweet.routes.js"
import { dashboardRouter } from "./routes/dashboard.routes.js"
// import userCustomRouters from "./routes/user.routes.js"

app.use("/api/v1/healthCheck",healthCheckRouter)
//routes declaration
//app.get() -- this will not work as we have separated routes so now we need to use it as middleware by app.use()
//USER ROUTE
app.use("/api/v1/users",userRouter)
// app.use("/api/v1/users",userCustomRouters)

//VIDEO ROUTE 
app.use("/api/v1/videos",videoRouter)

//SUBSCRIPTION ROUTES
app.use("/api/v1/subscriptions",subscriptionRoute)

//PLAYLIST ROUTE
app.use("/api/v1/playlist",playListRouter)

//LIKED ROUTE
app.use("/api/v1/like",likeRouter)

//COMMENT ROUTE
app.use("/api/v1/comments",commentRouter)

//TWEET ROUTE
app.use("/api/v1/tweet",tweetRouter)

//DASHBOARD ROUTE
app.use("/api/v1/dashboard", dashboardRouter)
export default app