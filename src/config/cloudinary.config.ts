import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary } from "cloudinary";
import { promises as fs } from "fs";


@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);

    constructor(private configService: ConfigService) {
        this.configureCloudinary();
    }

    private configureCloudinary() {
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
        });
    }

    async uploadImage(localFilePath: string): Promise<string | null> {
        try {
            if (!localFilePath) {
                return null;
            }

            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: 'image',
            });

            await fs.unlink(localFilePath);

            return response.secure_url;

        } catch (error) {
            this.logger.error('file upload failed!!', error);

            await fs.unlink(localFilePath);

            throw new InternalServerErrorException('file upload failed!!', error.message);
        }
    }
}