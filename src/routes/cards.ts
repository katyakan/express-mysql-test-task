import express from "express";
import { getCards, createCard, deleteCard } from "../controllers/cards";
import { likeCard, dislikeCard } from "../controllers/cards";
import { validateCard, validateCardId } from "../middlewares/validators";

const router = express.Router();

router.get("/", getCards);
router.post("/",  validateCard, createCard);
router.delete("/:cardId",  validateCardId, deleteCard);
router.put("/:cardId/likes", likeCard);
router.delete("/:cardId/likes", dislikeCard);
export default router;
