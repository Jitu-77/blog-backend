import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            index: true,
            trim: true,
        },
        avatar: {
            type: String,
            required: true, //cloud url
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required!.']
        },
        refreshToken: {
            type: String
        }
    }, { timestamps: true }
)
//now to encrypt the pwd we will use mongo hook -- pre hook 
// just before saving data
// we cannot use arrow function as call back here as context this is unknown in arrow function
//as save event is always running in some context+
//next is due to the middle ware to pass the next
userSchema.pre("save",async function (next){
    if(!this.isModified("password")) return next()  // to check the password has modified or not
    this.password = await bcrypt.hash(this.password,10)
    next()
})

//######## SYNTAX TO WRITE CUSTOM METHODS FOR A CLASS OR ADD NEW METHODS TO A CLASS ############
//designing custom method to inject in mongoose
// we will make function that will return the true/false as per pwd
/**
 * to check password
 * @param {*} password 
 * @returns 
 */
userSchema.method.isPasswordCorrect = async function (password){
    // here bcrypt takes 2 args password (unencrypted passed from front end)as string and the encoded value (this.password(got by context))_
    return await bcrypt.compare(password,this.password) 
}
/**
 * generate Access token
 * @returns 
 */
userSchema.method.generateAccessToken = function (){
   return jwt.sign(
        {
            _id:this._id,  //this context will automatically get the information via mongo property
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
/**
 * generate Refresh Token
 * @returns 
 */
userSchema.method.generateRefreshToken = function (){
   return jwt.sign(
        {
            _id:this._id,  //this context will automatically get the information via mongo property
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)