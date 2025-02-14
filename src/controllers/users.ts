import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NotFoundError } from "../errors/NotFoundError";
import { BadRequestError } from "../errors/BadRequestError";
import { ConflictError } from "../errors/ConflictError";


export interface IUser {
  _id: string;
  name?: string;
  about?: string;
  avatar?: string;

}

const ERROR_MESSAGES = {
  DEFAULT_ERROR: "На сервере произошла ошибка",
  USER_NOT_FOUND: "Пользователь с указанным _id не найден",
  INVALID_DATA: "Переданы некорректные данные",
};
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {

      return next( new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND));
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {

         return next( new NotFoundError(ERROR_MESSAGES.INVALID_DATA));
    }
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    });
    return res.status(200).json({ message: 'Успешный вход', token });
  } catch (error) {
    next(error);
  }
};



export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    next(err);
  }
};


export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND );
    }
    res.json(user);
  } catch (err) {
    next(err);

  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, about, avatar, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ConflictError("Пользователь с таким email уже существует"));
    }
    const user = await User.create({
      name,
      about,
      avatar,
      email,
      password
    });
    res.status(201).json({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
    });
  } catch (err) {
    console.error("Ошибка при создании пользователя:", err);
    next(err);
  }
};


export const updateUserProfile = async (req: Request & { user?: IUser }, res: Response, next: NextFunction) => {
  const { name, about } = req.body;

  if (!name && !about) {
    return next(new BadRequestError(ERROR_MESSAGES.INVALID_DATA));
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { name, about },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND)); return
    }

    res.json(user);
  } catch (err) {
    next(err);

  }
};

export const updateUserAvatar = async (req: Request & { user?: IUser }, res: Response, next: NextFunction) => {
  const { avatar } = req.body;
  if (!avatar) {
    return next(new BadRequestError(ERROR_MESSAGES.INVALID_DATA));
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { avatar },

      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND)); return
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};



export const getCurrentUser = async (req: Request & { user?: { _id: string } }, res: Response, next: NextFunction) => {
  try {
    const userIdFromToken = req.user?._id;
    if (!userIdFromToken) {
      return next(new BadRequestError("Пользователь не авторизован"));
    }
    const user = await User.findById(userIdFromToken);

    if (!user) {
      return next(new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND));
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};
