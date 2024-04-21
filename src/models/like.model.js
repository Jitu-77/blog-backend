import mongoose ,{Schema} from "mongoose";
const likesSchema = new Schema(
    {
        comment :{
            type:Schema.Types.ObjectId,
            ref:"comments"
        },
        video:{
            type:Schema.Types.ObjectId,
            ref:"videos"
        },
        likedBy : {
            type:Schema.Types.ObjectId,
            ref:"users"
        },
        tweet : {
            type:Schema.Types.ObjectId,
            ref:"tweets"
        },
    },
    {
        timestamps : true
    }
)

export const like = mongoose.model("like",likesSchema)