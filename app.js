import express from "express";
import morgan from "morgan";
import { router as toursRouter } from "./routes/tourRoutes.js";
import { router as usersRouter } from "./routes/userRoutes.js";
import { router as viewsRouter } from "./routes/viewRoutes.js";
import process from "node:process";
import { globalErrorHandler } from "./controllers/errorController.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import xss from "xss-shield";
import path from "node:path";
import { AppError } from "./utils/appError.js";
import cookieParser from "cookie-parser";

const __dirname = import.meta.dirname;

export const app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
// Security headers
app.use(helmet());

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Data sanitization against nosql query injection
app.use(mongoSanitize());

// xss sanitizer
const { xssShield } = xss.default;
//app.use(xssShield());

// Parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "price",
      "maxGroupSize",
      "ratingsAverage",
      "ratingsQuantity",
    ],
  })
);

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
console.log(process.env.NODE_ENV);

//RateLimiter
const limiter = rateLimit({
  max: 10,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again later",
});

app.use("/api", limiter);

// test middleware
// app.use((req, res, next) => {
//   console.log("body:", req.body);
//   next();
// });

// Routes
app.use("/", viewsRouter);
app.use("/api/v1/tours", toursRouter);
app.use("/api/v1/users", usersRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
