import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import jwt from "jsonwebtoken";
import { subscribe } from "diagnostics_channel";
import mongoose from "mongoose";

const registeredUser = asyncHandler(async (req, res) => {
  //1>get the user details from front end
  //2>validation - not empty and other type of validation
  //3>check if the user already exists :-- username ,email
  //4>check for images,check for avatar (this is mandatory)
  //5>upload them to cloudinary avatar
  //6>create user obj , create entry in db
  //7>check for user creation
  //8>remove password and refresh token field from response
  //return res

  //1> destructuring  data
  // console.log("req Check ********1")
  // console.log(req.body,"req body")
  const { username, fullName, email, password } = req.body;
  //2>
  if ([username, email, fullName, password].some((el) => el.trim() === "")) {
    throw new ApiErrors(400, "All fields are required");
  }
  //3> User.findOne({email}) but we want if username/email exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiErrors(400, `User with ${username} already exists`);
  }
  //4>
  //the access to req.files is by multer middle ware
  const avatarLocal = req.files?.avatar[0]?.path;
  // const coverImageLocal = req.files?.coverImage[0]?.path
  let coverImageLocal;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files?.coverImage.length > 0
  ) {
    coverImageLocal = req.files?.coverImage[0]?.path;
  }
  if (!avatarLocal) {
    throw new ApiErrors(400, `Avatar file is required!.`);
  }
  //5>
  const avatarUploadImg = await uploadOnCloudinary(avatarLocal);
  if (!avatarUploadImg) {
    throw new ApiErrors(400, `Avatar file in cloudinary failed`);
  }
  const coverUploadImg = await uploadOnCloudinary(coverImageLocal);
  //6>
  const user = await User.create({
    fullName,
    avatar: avatarUploadImg?.url,
    coverImage: coverUploadImg?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  //7 & 8>._id is auto created by mongo
  // here firstly we are confirming that user entry made and
  // then we will chain select()
  //select -- returns all the fields by default
  //so inside the string specify which fields not to return
  // here we are specifying we do not need password refreshToken
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    //500 as this is a server failure
    throw new ApiErrors(500, `Failed while creating user!!.`);
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully!"));
});

const generatedAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    //saving refreshToken
    user.refreshToken = refreshToken;
    //save is given by mongo instance
    //we need to save the user instance but we wont save the password
    //hence will use {validateBeforeSave:false}
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiErrors(500, "Error in generating refresh and access token");
  }
};

const loginUser = asyncHandler(async (req, res) => {
  //1>req body ->data
  //2>username or email check
  //3>find the user
  //4>password check
  //5>access and refresh token
  //6>send cookies
  //1>
  console.log(req.body);
  const { email, username, password } = req.body;
  console.log(email, username, password);
  //2>
  if (!username && !email) {
    throw new ApiErrors(400, "Username or email is required!");
  }
  //3>
  const user = await User.findOne({
    $or: [{ username }, { password }],
  });
  console.log(user, "***");
  if (!user) {
    throw new ApiErrors(404, "User does not exist!");
  }
  //4>
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiErrors(401, "Invalid user credentials!");
  }
  //5>
  const { accessToken, refreshToken } = await generatedAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  //6>
  const options = {
    httpOnly: true, //httpOnly signifies it cannot be edited in front end , will only be edited in server
    secure: true,
  };
  //return response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully!"
      )
    );
});

//for logout we need to clear the cookies from the server
//remove the refresh token
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true, // to get the new updated value in response
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      throw new ApiErrors(401, "Unauthorized request!");
    }
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    console.log(decodedToken);
    //we have made our refresh token using _id , do the decoded token payload will contain mongo db id
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiErrors(401, "Invalid user token!");
    }
    //refreshToken is already stored in db
    //so we will search for stored refresh token if already logged in , this must be saved

    if (incomingRefreshToken !== user?.refreshAccessToken) {
      throw new ApiErrors(401, "Refresh token is expired or used");
    }

    const { accessToken, newRefreshToken } =
      await generatedAccessAndRefreshToken(user._id);
    const options = {
      httpsOnly: true,
      secure: true,
    };
    //return response
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken: accessToken,
            refreshToken: newRefreshToken,
          },
          "token successfully generated"
        )
      );
  } catch (error) {
    throw new ApiErrors(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  //req.user?._id is got/returned by the middle ware verifyJwt
  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiErrors(400, "Invalid old password!");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully!"));
});

//to get the current user we will just use the verifyJwt return value
const getCurrentUSer = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiErrors(400, "Email & FullName are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName, //same as  fullName :fullName,
        email, //same as email:email
      },
    },
    {
      new: true, //returns the object
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file.path;
  if (!avatarLocalPath) {
    throw new ApiErrors(400, "Avatar file is missing");
  }
  const avatarUploadDetails = await uploadOnCloudinary(avatarLocalPath);
  if (!avatarUploadDetails.url) {
    throw new ApiErrors(400, "Error while uploading file");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        //use patch for multiple
        avatar: avatarUploadDetails.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res.status(200)
            .json(
                new ApiResponse(200,user,"Avatar updated successfully")
            )
});

const updateUserImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file.path;
  if (!coverImageLocalPath) {
    throw new ApiErrors(400, "Cover file is missing");
  }
  const coverUploadDetails = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverUploadDetails.url) {
    throw new ApiErrors(400, "Error while uploading file");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        //use patch for multiple
        coverImage: coverUploadDetails.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res.status(200)
  .json(
      new ApiResponse(200,user,"Cover image updated successfully")
  )
});

const getUserChannelProfile = asyncHandler(async (req,res)=>{
        //this triggering point is by url parsing
        //front end url is by sending url as params 
        //eg:https://www.youtube.com/@HT-Videos

        const {username} = req.params
        if(!username?.trim()){
              throw new ApiErrors(400,"Username is missing")
        }
        //now find the user in db and apply aggregation pipeline
        //the process will be lengthy hence we will use aggregation pipeline by match
        //match will parse the entire collection and returns a single object
        //aggregate ia method already defined in mongo
        const channel = await User.aggregate([
          {
            $match :{
              username : username?.toLowerCase()
            }
          },
          {
            $lookup:{
              from:"subscriptions" ,//from Subscription collection
              localField:"_id",
              foreignField:"channel",
              as : "subscribers"
            }
          },
          {
            $lookup:{
              from:"subscriptions" ,//from Subscription collection
              localField:"_id",
              foreignField:"subscriber",
              as : "subscribedTo"
            }
          },
          {
            $addFields:{
              subscribersCount:{
                $size:"$subscribers" //from line no 362  $ sign here signifies it is field
              },
              channelsSubscribedToCount:{
                $size:"$subscribedTo" //from line no 370 $ sign here signifies it is field
              },
              isSubscribedTo:{ // will return true/false based on calculation
                $cond:{  //  to make a if else run $ sign here signifies it is field
                  if:{ 
                    // in helps to parse an array or obj  here ( $subscribers.subscriber)          
                    $in  :[req.user._id,"$subscribers.subscriber"] ,
                    then: true,
                    else:false
                  }
                }
              }
            }
          },
          {
            $project :{ //helps us to project or return selected data only
              fullName :1, //1 to enable
              username :1,
              subscribersCount :1 ,
              channelsSubscribedToCount :1 ,
              isSubscribedTo :1 ,
              avatar :1 ,
              coverImage :1,
              email:1
            }
          }
        ])
        console.log(channel,"CHANNEL VALUE")
        if(!channel?.length){ //aggregate returns an array
          throw new ApiErrors ( 400 ,"Channel does not exist")
        }
        return res.status(200)
        .json(
          new ApiResponse (200,channel[0],"user channel fetched successfully")
        )
})

const getWatchHistory = asyncHandler(async(req,res)=>{
  const user =await User.aggregate([
     {
      $match:{ // got the user
        _id:new mongoose.Types.ObjectId(req.user._id)
      }
     }, //now set up pipe line for watch history with videos
     {
      $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory" ,//now we have got the list of videos in watchHistory but need a sub-pipe-line for owners
        pipeline:[
          {
            $lookup : {
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner" ,// now we will again implement a pipeline to return specific values
              pipeline:[
                {
                  $project : {  //project in owner only
                    fullName :1 ,
                    username:1,
                    avatar:1
                  }
                }
              ]
            }
          },
          {    //now manipulating the first projection data i.e owner
            $addFields : {
              owner:{
                $first:"$owner"
              }
            }
          }
        ]
      }
     } , 
  ])
    console.log(user,"USER DATA")
    return res.status(200)
              .json(
                new ApiResponse(200,user[0].watchHistory,"User information retrieved successfully")
              )
})

export {
  registeredUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUSer,
  updateAccountDetails,
  updateUserAvatar,
  updateUserImage,
  getUserChannelProfile,
  getWatchHistory
};
