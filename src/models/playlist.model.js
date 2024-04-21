import mongoose, { Schema, model } from "mongoose";

const playListSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    video: [
      {
        type: Schema.Types.ObjectId,
        ref: "videos",
      },
    ],
    owners: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
  },
  {
    timeStamps: true,
  }
);

export const playList = mongoose.model("Playlist",playListSchema)