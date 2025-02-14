import express from "express";
import { getUsers, getUserById,  updateUserProfile, updateUserAvatar, getCurrentUser } from "../controllers/users";
import { auth } from "../middlewares/auth";
import { validateAvatarUpdate, validateUserUpdate } from "../middlewares/validators";

const router = express.Router();

router.get("/", getUsers);
router.get("/me", auth, getCurrentUser);
router.get("/:userId", getUserById);
router.patch("/me", auth, validateUserUpdate, updateUserProfile);
router.patch("/me/avatar", validateAvatarUpdate, updateUserAvatar);


export default router;
