import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        owners:{
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    }, 
    {
        timestamps: true
    }
)
commentSchema.plugin(mongooseAggregatePaginate)
export const comment = mongoose.model("Comment",commentSchema)