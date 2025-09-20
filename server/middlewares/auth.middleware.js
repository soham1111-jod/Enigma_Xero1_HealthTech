
// import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiError } from "../utils/APIError.js";
// import jwt from "jsonwebtoken";
// import { User } from "../models/User.model.js";

// export const verifyJWT = asyncHandler(async (req, res, next) => {
//   try {
//     const token = req.cookies?.accessToken;
  
//     if (!token) {
//       throw new ApiError(401, "Unauthorized request");
//     }
  
//     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
//     const user = await User.findById(decodedToken?._id).select(
//       "-password -refreshToken"
//     );
//     if (!user) {
//       throw new ApiError(401, "Invalid Token");
//     }
//     req.user = user;
//     next();
//   } catch (error) {
//     throw new ApiError(401,"Invalid Access Token")
//   }
// });



import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APIError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    
    if (!user) {
      throw new ApiError(401, "Invalid Token");
    }
    
    req.user = user;
    next();
  } catch (error) {
    // Handle JWT-specific errors
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, "Invalid Access Token");
    } else if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, "Access Token Expired");
    } else {
      // Re-throw ApiError instances or create new one
      throw error instanceof ApiError ? error : new ApiError(401, "Token verification failed");
    }
  }
});
