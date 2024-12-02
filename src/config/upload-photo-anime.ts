import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const fileUploadConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'photo_cover') {
        cb(null, './images/anime/cover');
      } else if (file.fieldname === 'photos_anime') {
        cb(null, './images/anime/content');
      }
    },
    filename: (req, file, cb) => {
      cb(null, `${uuidv4()}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(
        new BadRequestException('Only image files are allowed!'),
        false,
      );
    }
    cb(null, true);
  },
};

export const fileFields = [
  { name: 'photos_anime', maxCount: 4 },
  { name: 'photo_cover', maxCount: 1 },
];
