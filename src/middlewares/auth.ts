
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/UnauthorizedError";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export const auth = (req: Request & { user?: { _id: string } }, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return next(new UnauthorizedError("Требуется авторизация"));
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { _id: string };
    req.user = { _id: payload._id };
    next();
  } catch (err) {
    return next(new UnauthorizedError("Неверный токен"));
  }
};
