import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 } from 'uuid';

export const topicFileFields = {
  photo: [{ name: 'photos_topic', maxCount: 4 }],
  news: [{ name: 'new_photos', maxCount: 4 }],
};

console.log(process.env.IMAGE_STORAGE);

export const topicUploadConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, process.env.IMAGE_STORAGE);
    },
    filename: (req, file, cb) => {
      console.log(file);
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
