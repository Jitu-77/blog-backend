import {asyncHandler} from "../utils/asyncHandler.js"

const registeredUser = asyncHandler(async (req,res)=>{
    res.status(200).json({
        message:"chai aur code"
    })
})

export {registeredUser}