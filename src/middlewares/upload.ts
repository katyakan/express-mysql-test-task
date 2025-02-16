import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: path.resolve(__dirname, "../../uploads"), // абсолютный путь
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage });
