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
export default app