import express from "express";
import morgan from "morgan";
import { router as toursRouter } from "./routes/tourRoutes.js";
import { router as usersRouter } from "./routes/userRoutes.js";
import process from "node:process";
import { globalErrorHandler } from "./controllers/errorController.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import xss from "xss-shield";

export const app = express();

// Body parser, reading http body into req.body
app.use(express.json({ limit: "10kb" }));

// Security headers
app.use(helmet());

// Data sanitization against nosql query injection
app.use(mongoSanitize());

// xss sanitizer
const { xssShield } = xss.default;
app.use(xssShield());

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

// Routes
app.use("/api/v1/tours", toursRouter);
app.use("/api/v1/users", usersRouter);
app.use(globalErrorHandler);
