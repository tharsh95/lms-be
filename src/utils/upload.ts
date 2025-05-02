import { v2 as cloudinary } from 'cloudinary';

// Configuration
cloudinary.config({
    cloud_name: 'dplsckp4p',
    api_key: '515655718461938',
    api_secret: 'yXKC9YBtSUYZlApX_iJ0rah9YgQ'
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