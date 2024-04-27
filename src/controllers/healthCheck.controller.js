import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const heathCheck = asyncHandler((req,res) =>{
    
    return res.status(200)
    .json(new ApiResponse(200,{},"Server is up"))
})
export {
    heathCheck
}