import { Request, Response, NextFunction } from "express";
import { User } from "../models/user";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NotFoundError } from "../errors/NotFoundError";
import { BadRequestError } from "../errors/BadRequestError";
import { ConflictError } from "../errors/ConflictError";
import { UnauthorizedError } from "../errors/UnauthorizedError";

export interface IUser {
  id: string;
}

const ERROR_MESSAGES = {
  DEFAULT_ERROR: "На сервере произошла ошибка",
  USER_NOT_FOUND: "Пользователь с указанным _id не найден",
  INVALID_DATA: "Переданы некорректные данные",
};
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your_secret_key";
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ _id: userId }, JWT_SECRET, { expiresIn: "10m" });

  const refreshToken = jwt.sign({ _id: userId }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};
// login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { id, password } = req.body;

  try {
    const user = await User.findOne({ where: { id } });

    if (!user) {
      return next(new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new BadRequestError(ERROR_MESSAGES.INVALID_DATA));
    }

    const { accessToken, refreshToken } = generateTokens(user.id);


    user.refreshTokens = [...user.refreshTokens, refreshToken];
    await user.save();

    res.status(200).json({ message: "Успешный вход", accessToken, refreshToken });
  } catch (error) {
    console.error("Ошибка при логине:", error);
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return next(new BadRequestError("Отсутствуют обязательные данные: id или password"));
    }

    const existingUser = await User.findOne({ where: { id } });
    if (existingUser) {
      return next(new ConflictError("Пользователь с таким id уже существует"));
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ id, password: hashedPassword, refreshTokens: [] });
   const { accessToken, refreshToken } = generateTokens(user.id);
  res.status(201).json({ id: user.id, accessToken, refreshToken });

  } catch (err) {
    console.error("Ошибка при создании пользователя:", err);
    next(err);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new UnauthorizedError("Требуется refresh-токен"));
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { _id: string };
    const user = await User.findOne({ where: { id: decoded._id } });
    if (!user) {
      return next(new UnauthorizedError("Пользователь не найден"));
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);
    res.status(200).json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    return next(new UnauthorizedError("Refresh-токен недействителен"));
  }
};
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new UnauthorizedError("Требуется refresh-токен 1"));
    }
    const refreshToken = authHeader.split(" ")[1];
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { _id: string };
    const user = await User.findOne({ where: { id: decoded._id } });

    if (!user || !user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
      return next(new UnauthorizedError("Пользователь не найден или токен недействителен 2"));
    }

    user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
    await user.save();
    res.status(200).json({ message: "Вы успешно вышли из системы на этом устройстве" });
  } catch (error) {
    console.error("Ошибка при выходе:", error);
    return next(new UnauthorizedError("Ошибка при выходе"));
  }
};

export const getUserInfo = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as { user?: { _id: string } }).user;
  if (user) {
    return res.json({ userId: user._id });
  } else {
    return next(new UnauthorizedError("Пользователь не авторизован"));
  }
};
