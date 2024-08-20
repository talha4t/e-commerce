import { diskStorage } from "multer"
import { v4 as uuidv4 } from "uuid";
import * as path from "path";
import * as fs from "fs";
import { Request } from "express";
import { BadRequestException } from "@nestjs/common";

export const multerOptions = {
    storage: diskStorage({
        destination: (req, res, cb) => {
            const uploadPath = path.join(__dirname, "../../public/temp");
            
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, {
                    recursive: true,
                });
            }

            cb(null, uploadPath);
        },

        filename: (req: Request, file: Express.Multer.File, cb) => {
            const fileExtName = path.extname(file.originalname);
            const fileName = `${uuidv4()}${fileExtName}`;

            cb(null, fileName);
        },
    }),

    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(
                new BadRequestException('only image files are allowed!!'), 
                false
            );
        }
        cb(null, true);
    },
    limits: { 
        fileSize:  5 * 1024 * 1024 // 5 MB
    },
};