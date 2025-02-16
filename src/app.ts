
import express, { Request, Response, NextFunction, Router } from "express";
import cors from "cors";
import filesRoutes from "./routes/filesRoutes";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger, errorLogger } from "./middlewares/logger";
import { NotFoundError } from "./errors/NotFoundError";
import { createUser, getUserInfo, login, logout, refreshToken } from "./controllers/users";
import { auth } from "./middlewares/auth"

const { PORT = 3000, MYSQL_URI } = process.env;
const router = Router();

const app = express();

// CORS конфигурация для доступа с любого домена
app.use(cors());
app.use(express.json());
app.use(cookieParser());
// Логирование запросов
app.use(requestLogger);
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express with MySQL!");
});

// Роуты для авторизации и регистрации
app.post("/signin", login);
app.post("/signup", createUser);
app.post("/logout", logout);

// Роуты для пользователей и аутентификации
router.use(auth);

app.use("/file", filesRoutes);
app.get("/info", auth, getUserInfo);
app.post("/signin/new_token", auth, refreshToken);
app.use(errorLogger);
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError("Запрашиваемый ресурс не найден"));
});
app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
