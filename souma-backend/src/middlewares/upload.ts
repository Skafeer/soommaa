import multer from "multer";
import { AppError } from "@/middlewares/errorHandler";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 5;

export const uploadImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new AppError("نوع الملف غير مدعوم، يسمح فقط بصور JPEG أو PNG أو WEBP", 422));
    }
    cb(null, true);
  },
});