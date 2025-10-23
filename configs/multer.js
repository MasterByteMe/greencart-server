import multer from 'multer';

// 'upload' will be used to upload images to Cloudinary
export const upload = multer({
    // Use multer's built-in disk storage engine
    // This temporarily stores uploaded files on the server before uploading to Cloudinary
    storage: multer.diskStorage({})
});