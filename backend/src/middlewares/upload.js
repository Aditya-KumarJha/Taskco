import multer from 'multer';
import { BadRequest } from '../utils/ApiError.js';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; 

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(BadRequest('Invalid file type. Allowed: JPEG, PNG, GIF, WebP'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

export const singleImage = upload.single('image');

export default upload;
