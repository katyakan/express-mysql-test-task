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
  DEFAULT_ERROR: "На сервере произошла ошибка ussers",
  USER_NOT_FOUND: "Пользователь с указанным _id не найден",
  INVALID_DATA: "Переданы некорректные данные",
};
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your_refresh_secret";
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ _id: userId }, JWT_SECRET, { expiresIn: "10m" });

  const refreshToken = jwt.sign({ _id: userId }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

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

    // Добавляем новый refreshToken в массив
    user.refreshTokens = [...user.refreshTokens, refreshToken];
    await user.save();

    res.status(200).json({ message: "Успешный вход", accessToken, refreshToken });
  } catch (error) {
    console.error("Ошибка при логине:", error);
    next(error);
  }
};

// export const login = async (req: Request, res: Response, next: NextFunction) => {
//   const { id, password } = req.body;

//   try {
//     // Find the user by email
//     const user = await User.findOne({
//       where: { id },
//       attributes: ['id', 'password', 'refreshToken']
//     });

//     if (!user) {
//       return next(new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND));
//     }

//     // Check if the provided password matches the stored hash
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return next(new NotFoundError(ERROR_MESSAGES.INVALID_DATA));
//     }
//  // Генерируем токены
//  const { accessToken, refreshToken } = generateTokens(user.id);

//  res.status(200).json({ message: "Успешный вход", accessToken, refreshToken });
//     // Generate JWT token
//     // const token = jwt.sign({ _id: user.id }, JWT_SECRET, { expiresIn: '7d' });

//     // // Set the token in cookies
//     // res.cookie('token', token, {
//     //   httpOnly: true,
//     //   secure: process.env.NODE_ENV === 'production',
//     //   sameSite: 'strict',
//     //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     // });

//     // return res.status(200).json({ message: 'Успешный вход', token });
//   } catch (error) {
//     console.error("Ошибка при логине:", error);
//     next(error);
//   }
// };

// export const login = async (req: Request, res: Response, next: NextFunction) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email }).select('+password');
//     if (!user) {

//       return next( new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND));
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {

//          return next( new NotFoundError(ERROR_MESSAGES.INVALID_DATA));
//     }
//     const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });

//     res.cookie('token', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
//     });
//     return res.status(200).json({ message: 'Успешный вход', token });
//   } catch (error) {
//     next(error);
//   }
// };



// export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const users = await User.find({});
//     res.json(users);
//   } catch (err) {
//     next(err);
//   }
// };


// export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const user = await User.findById(req.params.userId);
//     if (!user) {
//       throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND );
//     }
//     res.json(user);
//   } catch (err) {
//     next(err);

//   }
// };
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, password } = req.body;

    // Проверка на наличие обязательных данных
    if (!id || !password) {
      return next(new BadRequestError("Отсутствуют обязательные данные: id или password"));
    }

    // Проверка на уникальность ID (если нужно)
    const existingUser = await User.findOne({ where: { id } });
    if (existingUser) {
      return next(new ConflictError("Пользователь с таким id уже существует"));
    }

    // Создание пользователя
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создание пользователя с хешированным паролем
    const user = await User.create({ id, password: hashedPassword, refreshTokens: [] });

    // const user = await User.create({ id, password });
  // Генерируем токены
  const { accessToken, refreshToken } = generateTokens(user.id);

  res.status(201).json({ id: user.id, accessToken, refreshToken });
    // Возвращаем результат
    // res.status(201).json({ id: user.id });

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

    // Проверяем, есть ли пользователь
    const user = await User.findOne({ where: { id: decoded._id } });
    if (!user) {
      return next(new UnauthorizedError("Пользователь не найден"));
    }

    // Генерируем новый access-токен
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

    res.status(200).json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    return next(new UnauthorizedError("Refresh-токен недействителен"));
  }
};
// export const logout = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { refreshToken } = req.body;

//     if (!refreshToken) {
//       return next(new UnauthorizedError("Требуется refresh-токен 1"));
//     }

//     const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { _id: string };

//     const user = await User.findOne({ where: { id: decoded._id } });

//     if (!user || !user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
//       return next(new UnauthorizedError("Пользователь не найден или токен недействителен2"));
//     }

//     // Удаляем только этот refreshToken, а не все
//     user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
//     await user.save();

//     res.status(200).json({ message: "Вы успешно вышли из системы на этом устройстве" });
//   } catch (error) {
//     console.error("Ошибка при выходе:", error);
//     return next(new UnauthorizedError("Ошибка при выходе"));
//   }
// };
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
