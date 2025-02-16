import { Request, Response } from "express";
import File from "../models/file";
import path from "path";
import fs from "fs";

// 1. Загрузка файла
export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Файл не загружен" });

    const { filename, mimetype, size, originalname } = req.file;
    const extension = path.extname(filename);

    const newFile = await File.create({
      name: filename,
      originalName: originalname,
      extension,
      mimeType: mimetype,
      size,
    });

    res.status(201).json({ message: "Файл загружен", file: newFile });
  } catch (error) {
    console.error("Ошибка загрузки файла:", error);
    res.status(500).json({ message: "Ошибка загрузки файла" });
  }
};

// 2. Получение списка файлов с пагинацией
export const listFiles = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const listSize = Number(req.query.list_size) || 10;
  const offset = (page - 1) * listSize;

  try {
    const { rows, count } = await File.findAndCountAll({ limit: listSize, offset });

    res.json({ total: count, page, listSize, files: rows });
  } catch (error) {
    console.error("Ошибка получения списка файлов:", error);
    res.status(500).json({ message: "Ошибка получения списка файлов" });
  }
};

// 3. Получение информации о файле
export const getFile = async (req: Request, res: Response) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) return res.status(404).json({ message: "Файл не найден" });

    res.json(file);
  } catch (error) {
    console.error("Ошибка получения файла:", error);
    res.status(500).json({ message: "Ошибка получения файла" });
  }
};

// 4. Скачивание файла
export const downloadFile = async (req: Request, res: Response) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) return res.status(404).json({ message: "Файл не найден" });

    const filePath = path.resolve(__dirname, "../../uploads", file.name);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "Файл отсутствует на сервере" });

    res.download(filePath, file.name); // Используем file.name для отправки файла
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка скачивания файла" });
  }
};


// 5. Удаление файла
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) return res.status(404).json({ message: "Файл не найден" });

    const filePath = path.resolve(__dirname, "../../uploads", file.name);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await file.destroy();
    res.json({ message: "Файл удален" });
  } catch (error) {
    console.error("Ошибка удаления файла:", error);
    res.status(500).json({ message: "Ошибка удаления файла" });
  }
};

// 6. Обновление файла
export const updateFile = async (req: Request, res: Response) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) return res.status(404).json({ message: "Файл не найден" });

    if (!req.file) return res.status(400).json({ message: "Новый файл не загружен" });


    const oldFilePath = path.resolve(__dirname, "../../uploads", file.name);
    if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);


    const { filename, mimetype, size, originalname } = req.file;
    const extension = path.extname(filename);
    await file.update({ name: filename, originalName: originalname, extension, mimeType: mimetype, size });

    res.json({ message: "Файл обновлен", file });
  } catch (error) {
    console.error("Ошибка обновления файла:", error);
    res.status(500).json({ message: "Ошибка обновления файла" });
  }
};
