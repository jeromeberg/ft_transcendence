import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';

export const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@Injectable()
export class CloudinaryService {
    async uploadAvatar(file: Express.Multer.File, oldAvatarUrl?: string): Promise<string> {
        if (!file) throw new BadRequestException('NO_FILE_PROVIDED');
        if (file.size > MAX_SIZE_BYTES) throw new BadRequestException('AVATAR_TOO_LARGE');
        if (!ALLOWED_MIMETYPES.includes(file.mimetype))
            throw new BadRequestException('AVATAR_MIMETYPE_NOT_ALLOWED');

        if (oldAvatarUrl && oldAvatarUrl.includes('https://res.cloudinary.com')) {
            const clean = oldAvatarUrl.split('?')[0];
            const parts = clean.split('/');
            const publicId = parts
                .slice(-2)
                .join('/')
                .replace(/\.[^.]+$/, '');
            await v2.uploader.destroy(publicId);
        }

        try {
            const result = await new Promise<UploadApiResponse | UploadApiErrorResponse>(
                (resolve, reject) => {
                    v2.uploader
                        .upload_stream(
                            {
                                folder: 'avatars',
                                transformation: [
                                    {
                                        width: 200,
                                        height: 200,
                                        crop: 'fill',
                                        format: 'webp',
                                    },
                                ],
                            },
                            (error, uploadResult) => {
                                if (error) return reject(error);
                                return resolve(uploadResult!);
                            },
                        )
                        .end(file.buffer);
                },
            );
            return (result as UploadApiResponse).secure_url;
        } catch {
            throw new InternalServerErrorException('AVATAR_UPLOAD_FAILED');
        }
    }
}
