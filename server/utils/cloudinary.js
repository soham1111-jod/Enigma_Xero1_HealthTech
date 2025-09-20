import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uplodOnCloudinary = async (localFilePath) => {
  try {
    if (localFilePath) {
      const response=await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
      });
      // console.log("File is Uploded successfully",response.url)
      fs.unlinkSync(localFilePath)
      return response

    } else {
      return null;
    }
  } catch (error) {
    fs.unlinkSync(localFilePath)
    return null
  }
};


export default uplodOnCloudinary