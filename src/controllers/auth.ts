import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/user";
import { BadRequestError } from "../errors/BadRequestError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { ForbiddenError } from "../errors/ForbiddenError";
import { ConflictError } from "../errors/ConflictError";
import { NotFoundError } from "../errors/NotFoundError";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "your_refresh_secret";

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      throw new BadRequestError("ID и пароль обязательны");
    }

    const existingUser = await User.findByPk(id);
    if (existingUser) {
      throw new ConflictError("Пользователь уже существует");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ id, password: hashedPassword });

    res.status(201).json({ message: "Пользователь зарегистрирован" });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      throw new BadRequestError("ID и пароль обязательны");
    }

    const user = await User.findByPk(id);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedError("Неверный ID или пароль");
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "10m" });
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: "7d" });

    user.refreshToken = refreshToken;
    await user.save();

    res.json({ token, refreshToken });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new UnauthorizedError("Refresh токен обязателен");
    }

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as { id: string };
    const user = await User.findByPk(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      throw new ForbiddenError("Недействительный refresh токен");
    }

    const newToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "10m" });

    res.json({ token: newToken });
  } catch (error) {
    next(error);
  }
};

// export const logout = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const user = req.user;

//     if (!user) {
//       throw new NotFoundError("Пользователь не найден");
//     }

//     user.refreshToken = null;
//     await user.save();

//     res.json({ message: "Выход выполнен" });
//   } catch (error) {
//     next(error);
//   }
// };
