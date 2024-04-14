import { ApiErrors } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJwt = asyncHandler(async(req,res,next)=>{
// export const verifyJwt = asyncHandler(async(req,_,next)=>{
 // _ instead of res is used as res is not used through out 
    try {
        //get the token
        const token = req.cookies?.accessToken // req has access to all the middlewares
                        || req.header("Authorization")?.replace("Bearer ","") 
                        // android does not support cookies    
        if(!token){
            throw new ApiErrors(401,"Unauthorized request!")
        }                                
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken._id).select(
            "-password -refreshToken"
        )
        if(!user){
            throw new ApiErrors(401,"Invalid access token")
        }
        req.user = user
        next()
    } catch (error) {
        throw new ApiErrors(401,error?.message || "Invalid access token")
    }
})