import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudnary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async(userId) => {
    try {
      const user = await User.findById(userId);
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save( {validateBeforeSave: false} )

        return { accessToken, refreshToken }
    } catch (error) {
      throw new ApiError(500, "Something went wrong while generating refresh and access token.")  
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // get firstname, password, email, Username
    // validation all details from frontend
    // check if user already exist or not
    //check for images, check for avtar
    //upload them cloudnary, avtar
    // create user object- create entry in db
    //remove password and refresh token field from response
    //check for user creation \
    // return response

    const { username, fullname, email, password } = req.body
    if (!(username || email)) {
        throw new ApiError(401, "Username and email id required.")
    }
        
    // I want to check all field are required
    if(
        [fullname, email, password, username].some((field) => 
            field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All field are required!")
    }

    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if( existingUser ) {
        throw new ApiError( 409, "Username and email already exist.")
    }

    const avtarLocalPath = req.files?.avtar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
 
    console.log("avtarLocaPath is::::", avtarLocalPath, coverImageLocalPath);

    if (!(avtarLocalPath || coverImageLocalPath)) {
        throw new ApiError(400, "Both 'avtar' and 'coverImage' files are required.");
    }

    const avtar = await uploadOnCloudnary( avtarLocalPath )
    const coverImage = await uploadOnCloudnary( coverImageLocalPath )
    console.log("avtar Url>>>>", avtar.url);

    // Check if files were uploaded successfully
    if (!( avtar || coverImage )) {
        throw new ApiError(400, "Error uploading files to Cloudinary.");
    }

   const user =  await User.create({
        fullname: fullname,
        avatar: avtar.url,
        coverImage: coverImage.url || "",
        email: email,  
        password: password,
        username: username
    })
    console.log("User me kya hai>>>>.", user);
    const creatdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
        console.log("created User>>>>>", creatdUser);
    if(!creatdUser) {
        throw new ApiError(500, "Register nahi hua hai.")
    }

    return res.status(201).json(
        new ApiResponse(200, creatdUser, "User registed successfully.")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    // Todo
    // req.body aa raha hai ya nahi
    // Mach username or email id from database
    // Check password correct or not
    // find the user if exist in our database
    // add cookies in user browser
    // access and refresh token generate

    const { email, username, password } = req.body

    if (!(email || username)) {
        throw new ApiError(400, "Username or email id required.")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if( !user ){
        throw new ApiError(400, "Username or email id doesn't exist.")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if (!isPasswordCorrect) {
        throw new ApiError("400", "Invalid user credentials.")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

   const logedInUser = await User.findById(user._id).select("-password -refreshToken")

    //Mai yahan pe user ko accessToken and modified nahi karne de raha hun because ye server se modified hoga.
   const options = {
        httpOnly: true,
        secure: true
   }

   return res.status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
        new ApiResponse(200, {
            user: logedInUser, accessToken, refreshToken
        },
        "User Logged In Successfully")
   )
})

const logoutUser = asyncHandler(async(req, res) => {
    // pahle hum find karenge user ko wo login hai ya nahi.
    // delete accessToken and refreshToken karenge user ke browser se.
     await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
     )

     const options = {
        httpOnly: true,
        secure: true
   }

   return res
   .status(200)
   .clearCookie("refreshToken", options)
   .clearCookie("accessToken", options)
   .json(new ApiResponse(200, {}, "User logged out successfully."))
})

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incommingRefreshToken) {
        throw new ApiError("402", "Unathorized access token.")
    }
    // handle for failiure.
    try {
        const decodedRefreshToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = User.findById(decodedRefreshToken?._id)
    
        if(!user){
            throw new ApiError("401", "Unathorized user.")
        }
    
        if(incommingRefreshToken !== user?.refreshToken) {
            throw new ApiError(400, "Refresh token is expired or used.")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, {accessToken, refreshToken: newRefreshToken}
            ),
            "Access Token refreshed."
        )
    } catch (error) {
        throw new ApiError(400, "Invalid user" || error.message)
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password.")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

   return res
   .status(200)
   .json(new ApiResponse(200, {}, "Password Changed successfully."))
})


const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(200, req.user, "current user factched successfully.")
})

const updateAccountDetails = asyncHandler(async(req, res) =>{
    const { fullname, email} = req.body

    if (!(fullname|| email)) {
        throw new  ApiError(400, "All fields are required.")
    }

    const user = User.findByIdAndUpdate(
        req.User?._id,
    {
        $set: {
            fullname,
            email: email
        }
    },
    {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avtarLocalPath = req.file?.path;

    if(!avtarLocalPath) {
        throw new ApiError(400, "Avtar file is missing.")
    }

    const avatar = await uploadOnCloudnary(avtarLocalPath);
    
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar.")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar is updated successfully.")
    )
})

const updateCoverImage = asyncHandler(async(req, res) => {
   const coverImagePath = req.file?.path;
   if (!coverImagePath) {
        throw new ApiError(400, "CoverImage file is missing")
   }

    const coverImage = await uploadOnCloudnary(coverImagePath);

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            coverImage: coverImage.url
        },
        {new: true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "CoverImage updated successfully.")
    )
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateCoverImage
}