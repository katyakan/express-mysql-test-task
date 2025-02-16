import { Router } from "express";
import { upload } from "../middlewares/upload";
import {
  uploadFile,
  listFiles,
  getFile,
  downloadFile,
  deleteFile,
  updateFile,
} from "../controllers/file";
import {
  validateFileId, validateFile
} from "../middlewares/validators"

const router = Router();

router.post("/upload", validateFile, upload.single("file"), uploadFile);
router.get("/list", listFiles);
router.get("/:id", validateFileId, getFile);
router.get("/download/:id", validateFileId, downloadFile);
router.delete("/:id", validateFileId, deleteFile);
router.put("/:id", validateFileId, upload.single("file"), updateFile);

export default router;
