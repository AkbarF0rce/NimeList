import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 } from 'uuid';

export const fileFields = [{ name: 'photos_topic', maxCount: 4 }];

export const fileUploadConfig = {
  storage: diskStorage({
    destination: './images/topic',
    filename: (req, file, cb) => {
      cb(null, `${v4()}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
    }
    cb(null, true);
  },
};
