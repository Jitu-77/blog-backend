
//ONE WAY
/* 
//we can follow this syntax but there is a better way of doing so
// hence we will write all the db connection details in src/db/index.js
//require('dotenv').config({path:'../env'}) // this type of syntax will give import error
import dotenv from "dotenv" //new syntax
import mongoose from "mongoose"
import {DB_NAME} from "./constants.js"
import express from "express"
dotenv.config({path:'./env'}) //new syntax
const app =express ()
// here we need to write a IIFE with a ; at start to reduce any chances of error 
 ;(async()=>{
    try {
        console.log(process.env.MONGODB_URI,"--")
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        
        app.on('error',()=>{
            console.error("error :",error)       
            throw error 
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is listening to port ${process.env.PORT}`)       
            console.log(`connectionInstance : ${{...connectionInstance}}`)       
        })
    } catch (error) {
        console.error("error :",error)       
        throw error 
    }
 })()
 */

//ANOTHER WAY IS TO WRITE ALL THE CODE IN db/index.js AND IMPORT

import dotenv from "dotenv"
import connectDB from "./db/index.js"
import app from "./app.js"

dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 4000,()=>{
        console.log(`Server stared at port : ${process.env.PORT || 4000}`)
    })
})
.catch((error)=>{
    console.error("MongoDB connection failed",error);
})