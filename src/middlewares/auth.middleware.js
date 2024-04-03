// Ye middleware check karega user login hai ya nahi.
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from 'jsonwebtoken';


export const veryfyJwt = asyncHandler( async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        console.log( "token", token);

        if(!token) {
            throw new ApiError(401, "Unauthorized request 111")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log("Decode Token>>", decodedToken);
        
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )
    
        if (!user) {            
            //Todo discuss about frontend
            throw new ApiError(401, "Invalid Access Token.")
        }
        // I will add user into user
        req.user = user
    
        next()
    } catch (error) {
        throw new ApiError(401, error?.message, "Invalid user access token.")
    }
})