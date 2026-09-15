import { v2, ConfigOptions } from 'cloudinary';
import { CLOUDINARY } from '../common/cloudinary.constants';

export const CloudinaryProvider = {
    provide: CLOUDINARY,
    useFactory: (): ConfigOptions => {
        return v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    },
};
