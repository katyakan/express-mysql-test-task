import { Request, Response, NextFunction } from "express";
import File from "../models/file";
import path from "path";
import fs from "fs";
import { NotFoundError } from "../errors/NotFoundError";
import { BadRequestError } from "../errors/BadRequestError";
import { UnauthorizedError } from "../errors/UnauthorizedError";

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(new BadRequestError("Файл не загружен"));
    }

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
    return next(new Error("Ошибка загрузки файла"));
  }
};

export const listFiles = async (req: Request, res: Response, next: NextFunction) => {
  const page = Number(req.query.page) || 1;
  const listSize = Number(req.query.list_size) || 10;
  const offset = (page - 1) * listSize;

  try {
    const { rows, count } = await File.findAndCountAll({ limit: listSize, offset });

    res.json({ total: count, page, listSize, files: rows });
  } catch (error) {
    console.error("Ошибка получения списка файлов:", error);
    return next(new Error("Ошибка получения списка файлов"));
  }
};

export const getFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) {
      return next(new NotFoundError("Файл не найден"));
    }

    res.json(file);
  } catch (error) {
    console.error("Ошибка получения файла:", error);
    return next(new Error("Ошибка получения файла"));
  }
};

export const downloadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) {
      return next(new NotFoundError("Файл не найден"));
    }

    const filePath = path.resolve(__dirname, "../../uploads", file.name);
    if (!fs.existsSync(filePath)) {
      return next(new NotFoundError("Файл отсутствует на сервере"));
    }

    res.download(filePath, file.name);
  } catch (error) {
    console.error(error);
    return next(new Error("Ошибка скачивания файла"));
  }
};

export const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) {
      return next(new NotFoundError("Файл не найден"));
    }

    const filePath = path.resolve(__dirname, "../../uploads", file.name);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await file.destroy();
    res.json({ message: "Файл удален" });
  } catch (error) {
    console.error("Ошибка удаления файла:", error);
    return next(new Error("Ошибка удаления файла"));
  }
};

export const updateFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) {
      return next(new NotFoundError("Файл не найден"));
    }

    if (!req.file) {
      return next(new BadRequestError("Новый файл не загружен"));
    }

    const oldFilePath = path.resolve(__dirname, "../../uploads", file.name);
    if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);

    const { filename, mimetype, size, originalname } = req.file;
    const extension = path.extname(filename);
    await file.update({ name: filename, originalName: originalname, extension, mimeType: mimetype, size });

    res.json({ message: "Файл обновлен", file });
  } catch (error) {
    console.error("Ошибка обновления файла:", error);
    return next(new Error("Ошибка обновления файла"));
  }
};
