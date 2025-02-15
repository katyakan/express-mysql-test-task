import express from "express";
import { createUser, login, refreshToken } from "../controllers/users"

const router = express.Router();

router.post("/signup", createUser);
router.post("/login", login);
router.post("/refresh", refreshToken);

export default router;
