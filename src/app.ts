import express, { Request, Response, NextFunction} from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/users";
import cardRoutes from "./routes/cards";
import { login, createUser } from "./controllers/users";
import { auth } from "./middlewares/auth";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger, errorLogger } from "./middlewares/logger";
import { validateUserSignup, validateUserSignin } from "./middlewares/validators";
import { errors } from "celebrate";
import { NotFoundError } from "./errors/NotFoundError";

const { PORT = 3000, MONGO_URI } = process.env;
const app = express();

app.use(requestLogger);
app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(MONGO_URI || "mongodb://localhost/mestodb")
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

  app.get("/", (req: Request, res: Response) => {
    res.send("Hello, TypeScript with Express and Mongo!!!");
  });

app.post("/signin", validateUserSignin, login);
app.post("/signup", validateUserSignup, createUser);

app.use(auth);
app.use("/users", userRoutes);
app.use("/cards", cardRoutes);

app.use(errorLogger);

app.use((req: Request, res: Response, next: NextFunction) => {
  return next(new NotFoundError("Запрашиваемый ресурс не найден"));
});
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
