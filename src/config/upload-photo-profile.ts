import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 } from 'uuid';

export const fileFields = [{ name: 'photo_profile', maxCount: 1 }];

export const fileUploadConfig = {
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
      cb(null, './images/photo-profile');
    },
    filename: (req, file, cb) => {
      // Generate UUID untuk nama file
      cb(null, `${v4()}${extname(file.originalname)}`);
    },
  }),
};
