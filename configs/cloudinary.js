import { v2 as cloudinary } from "cloudinary";

const connectCloudinary = async () => {
    // Set up Cloudinary configuration using environment variables
    // These values are stored securely in the .env file
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Cloudinary account name
        api_key: process.env.CLOUDINARY_API_KEY,       // Cloudinary API key
        api_secret: process.env.CLOUDINARY_API_SECRET  // Cloudinary API secret
    });
};

export default connectCloudinary;