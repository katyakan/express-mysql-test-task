import { Request, Response, NextFunction } from "express";
import Card from "../models/card";
import { NotFoundError } from "../errors/NotFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";

// Интерфейс с добавленным user
interface CustomRequest extends Request {
  user?: {
    _id: string;
  };
}

const STATUS_CODES = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

const ERROR_MESSAGES = {
  DEFAULT_ERROR: "На сервере произошла ошибка",
  CARD_NOT_FOUND: "Карточка с указанным _id не найдена",
  INVALID_DATA: "Переданы некорректные данные",
  FORBIDDEN_ACTION: "Вы не можете удалить чужую карточку"
};

export const getCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cards = await Card.find({});
    res.json(cards);
  } catch (err) {
    next(err);
  }
};

export const createCard = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { name, link } = req.body;
    const newCard = await Card.create({ name, link, owner: req.user?._id });
    res.status(201).json(newCard);
  } catch (err) {
    next(err);
  }
};

export const deleteCard = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const card = await Card.findById(req.params.cardId);

    if (!card) {
      return next(new NotFoundError(ERROR_MESSAGES.CARD_NOT_FOUND));

    }


    if (card.owner.toString() !== req.user?._id) {
      return next( new ForbiddenError(ERROR_MESSAGES.FORBIDDEN_ACTION))
    }

    await card.deleteOne();
    res.json({ message: "Карточка удалена" });
  } catch (err) {
    next(err);
  }
};

export const likeCard = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user?._id } },
      { new: true }
    );
    if (!card) return next(new NotFoundError(ERROR_MESSAGES.CARD_NOT_FOUND));
    res.json(card);
  } catch (err) {
    next(err);
  }
};

export const dislikeCard = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user?._id } },
      { new: true }
    );
    if (!card) return next(new NotFoundError(ERROR_MESSAGES.CARD_NOT_FOUND));
    res.json(card);
  } catch (err) {
    next(err);
  }
};
