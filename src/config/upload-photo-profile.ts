import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 } from 'uuid';

export const profileFileFields = [{ name: 'photo_profile', maxCount: 1 }];

export const profileUploadConfig = {
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(
        new BadRequestException('Only image files are allowed!'),
        false,
      );
    }
    cb(null, true);
  },
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, `${process.env.IMAGE_STORAGE}`);
    },
    filename: (req, file, cb) => {
      // Generate UUID untuk nama file
      cb(null, `Profile/${v4()}${extname(file.originalname)}`);
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
};
