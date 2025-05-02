import { v2 as cloudinary } from 'cloudinary';

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload an image
export const uploadResult = async (file: Express.Multer.File) => {
    const res = await cloudinary.uploader.upload(file.path, {
        resource_type: 'raw',
        folder: 'syllabus',
        format: 'pdf',
        public_id: file.originalname+'-'+Date.now()
    });


    return res;
}