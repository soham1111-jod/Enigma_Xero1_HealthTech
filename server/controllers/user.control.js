import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APIError.js";
import ApiResponse from "../utils/APIResponse.js";
import { User } from "../models/User.model.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Enable to gerate Token");
  }
};

const userRegister = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;

  if (
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are require");
  }
  console.log(fullname, username, email, password);

  const userExist = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (userExist) {
    throw new ApiError(409, "Username or Email is already exists.");
  }

  //const AvatarLocalPath = req.files?.avatar[0]?.path;
  //const CoverImageLocalPath = req.files?.coverImage[0]?.path;
  // let CoverImageLocalPath;
  // if (
  //   req.files &&
  //   Array.isArray(req.files.coverImage) &&
  //   req.files.coverImage.length > 0
  // ) {
  //   CoverImageLocalPath = req.files.coverImage.path;
  // }

  // if (!AvatarLocalPath) {
  //   throw new ApiError(400, "Avatar is require");
  // }

  // const avatar = await uplodOnCloudinary(AvatarLocalPath);
  // const coverImage = await uplodOnCloudinary(CoverImageLocalPath);

  // if (!avatar) {
  //   throw new ApiError(400, "Avatar is require");
  // }

  const user = await User.create({
    fullname,
    email,
    password,
    username: username.toLowerCase(),
    // avatar: avatar.url,
    // coverImage: coverImage?.url || "",
  });

  const userCreated = await User.findById(user._id).select(
    "-password -refereshToken"
  );
  console.log("userCreated : ", userCreated);
  if (!userCreated) {
    throw new ApiError(500, "Failed to store user in database");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, userCreated, "User created Successfully"));
});

const userLogin = asyncHandler(async (req, res) => {
  //First take emai,password from frontend
  //check the input fields are enter or not
  //Check the email,password to data base
  //if email is in database and password is wrong then tell the user password is wrong
  //if email is not present is DB then tell user that user is not exits
  //when use is validated then give a accept token to the user.
  const { email, password } = req.body;
  // const password  = req.body;
  if ([email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are require");
  }
  const user = await User.findOne({ email });
  console.log(user);
  if (!user) {
    throw new ApiError(400, "User is not Exist");
  }

  const isPasswordValide = await user.isPasswordCorrect(password);

  if (!isPasswordValide) {
    throw new ApiError(401, "Password is in correct");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: accessToken,
          refreshToken,
          loggedInUser,
        },
        "User Is LoggedIn"
      )
    );
});

const userLogOut = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
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
    .json(new ApiResponse(200, "User Is LogOut"));
});

const refereshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefereshToken = req.cookies.refereshToken;

  if (!incommingRefereshToken) {
    throw new ApiError(400, "Invalide Refresh Token");
  }

  try {
    const decoded = jwt.verify(
      incommingRefereshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoded._id);

    if (!user) {
      throw new ApiError(401, "Invalid Token");
    }

    if (incommingRefereshToken !== user?.refereshToken) {
      throw new ApiError(401, "Referesh Token is expire or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefereshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refereshToken", newRefereshToken, options)
      .json(
        new ApiResponse(200, {
          accessToken,
          refereshToken: newRefereshToken,
        })
      );
  } catch (error) {
    throw new ApiError(400, "Invalide Refresh Token", error);
  }
});

export {
  userRegister,
  userLogin,
  userLogOut,
  refereshAccessToken,
}