
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { sequelize } from "../database";
import authRoutes from "./routes/authRoutes"
// import fileRoutes from "./routes/fileRoutes"
0
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import userRoutes from "./routes/users";
// import { auth } from "./middlewares/auth";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger, errorLogger } from "./middlewares/logger";
import { NotFoundError } from "./errors/NotFoundError";
import { UnauthorizedError } from "./errors/UnauthorizedError";

import { createUser, login, logout } from "./controllers/users";


// const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
// const JWT_EXPIRATION = "10m"; // Токен действует 10 минут
// const REFRESH_TOKEN_EXPIRATION = "7d"; // Для refresh токена 7 дней
const { PORT = 3000, MYSQL_URI, MONGO_URI } = process.env;

// Инициализация Express и базы данных
const app = express();

// CORS конфигурация для доступа с любого домена
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
app.use(errorLogger);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express mysql");
});
// Роуты для авторизации и регистрации
app.post("/signin", login);
// // app.post("/signincreateUser); refreshToken);
app.post("/signup", createUser);
app.post("/logout", logout);
app.use("/auth", authRoutes);
// app.use("/file", files);
// Файлы
// app.post("/file/upload", uploadFile);

// Обработчик ошибок
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError("Запрашиваемый ресурс не найден"));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
