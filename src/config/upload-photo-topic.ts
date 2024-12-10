import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 } from 'uuid';

export const topicFileFields = {
  photo: [{ name: 'photos_topic', maxCount: 4 }],
  news: [{ name: 'new_photos', maxCount: 4 }],
};

export const topicUploadConfig = {
  storage: diskStorage({
    destination: process.env.IMAGE_STORAGE,
    filename: (req, file, cb) => {
      cb(null, `Topic/${v4()}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
};
