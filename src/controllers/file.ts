// import { File } from "../models/File.js";
// import multer from "multer";
// import fs from "fs";
// import path from "path";

// // Настройка multer для хранения файлов в папке uploads/
// const storage = multer.diskStorage({
//   destination: "uploads/",
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage }).single("file");

// // 🚀 Загрузка файла
// export const uploadFile = async (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) return res.status(500).json({ message: "Upload error", error: err });

//     const { filename, mimetype, size } = req.file;
//     const newFile = await File.create({
//       userId: req.user.id,
//       filename,
//       mime_type: mimetype,
//       size,
//     });

//     res.json({ message: "File uploaded", file: newFile });
//   });
// };

// // 🚀 Получение списка файлов с пагинацией
// export const getFiles = async (req, res) => {
//   const listSize = parseInt(req.query.list_size) || 10;
//   const page = parseInt(req.query.page) || 1;
//   const offset = (page - 1) * listSize;

//   const files = await File.findAndCountAll({
//     where: { userId: req.user.id },
//     limit: listSize,
//     offset,
//   });

//   res.json({
//     total: files.count,
//     pages: Math.ceil(files.count / listSize),
//     data: files.rows,
//   });
// };

// // 🚀 Удаление файла
// export const deleteFile = async (req, res) => {
//   const file = await File.findByPk(req.params.id);
//   if (!file) return res.status(404).json({ message: "File not found" });

//   fs.unlinkSync(`uploads/${file.filename}`); // Удаляем файл из системы
//   await file.destroy(); // Удаляем запись из базы

//   res.json({ message: "File deleted" });
// };

// // 🚀 Получение информации о файле
// export const getFileInfo = async (req, res) => {
//   const file = await File.findByPk(req.params.id);
//   if (!file) return res.status(404).json({ message: "File not found" });

//   res.json(file);
// };

// // 🚀 Скачивание файла
// export const downloadFile = async (req, res) => {
//   const file = await File.findByPk(req.params.id);
//   if (!file) return res.status(404).json({ message: "File not found" });

//   res.download(`uploads/${file.filename}`, file.filename);
// };

// // 🚀 Обновление файла
// export const updateFile = async (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) return res.status(500).json({ message: "Upload error", error: err });

//     const file = await File.findByPk(req.params.id);
//     if (!file) return res.status(404).json({ message: "File not found" });

//     fs.unlinkSync(`uploads/${file.filename}`); // Удаляем старый файл

//     const { filename, mimetype, size } = req.file;
//     file.filename = filename;
//     file.mime_type = mimetype;
//     file.size = size;
//     await file.save();

//     res.json({ message: "File updated", file });
//   });
// };
