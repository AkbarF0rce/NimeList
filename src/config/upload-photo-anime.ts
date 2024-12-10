import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const animeUploadConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, `${process.env.IMAGE_STORAGE}`);
    },
    filename: (req, file, cb) => {
      const pathCustom =
        file.fieldname === 'photo_cover' ? 'Anime/Cover' : 'Anime/Content';
      cb(null, `${pathCustom}/${uuidv4()}${extname(file.originalname)}`);
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
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
};

export const animeFileFields = [
  { name: 'photos_anime', maxCount: 4 },
  { name: 'photo_cover', maxCount: 1 },
];
