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

const router = Router();

router.post("/upload", upload.single("file"), uploadFile);
router.get("/list", listFiles);
router.get("/:id", getFile);
router.get("/download/:id", downloadFile);
router.delete("/:id", deleteFile);
router.put("/:id", upload.single("file"), updateFile);

export default router;
