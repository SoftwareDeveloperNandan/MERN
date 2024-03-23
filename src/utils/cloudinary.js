import { v2 as cloudinary } from "cloudinary";
import {fs} from 'fs'

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret:  process.env.CLOUDINARY_API_SECRECT
});

const uploadOnCloudnary = async (localFilePath) => {
    try {
        if( !localFilePath) return null;
        // upload the filepath on cloudnary
        const responseCloudnary =  await cloudinary.uploader.upload(
            localFilePath, {resource_type: "auto"}
        )
        // file has been uploaded successfully.
        console.log("file is uploaded successfully.", responseCloudnary.url);
        return responseCloudnary;
    } catch (error) {
        fs.unLinkSync(localFilePath) //remove the file link path
        return null
    }
}
