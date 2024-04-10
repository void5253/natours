import process from "node:process";
import { AppError } from "../utils/appError.js";

function sendErrorProduction(err, res) {
  if (err.isOperational) {
    res.status(err.statusCode).json({ status: err.status, msg: err.message });
  } else {
    console.error(err);
    res.status(500).json({
      status: err.status,
      msg: "Something went wrong!",
    });
  }
}

function sendErrorDev(err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    msg: err.message,
    error: err,
    stack: err.stack,
  });
}

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: ${Object.values(
    err.keyValue
  )}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    value: el.value,
    msg: el.message,
  }));
  const message = `Invalid input data. ${errors
    .map((el) => el.msg)
    .join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () => new AppError("Please log in again!", 401);

// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  console.log(err);
  let error;
  if (err.name === "CastError") error = handleCastErrorDB(err);
  else if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  else if (err.name === "ValidationError") error = handleValidationErrorDB(err);
  else if (err.name === "JsonWebTokenError") error = handleJWTError();
  else if (err.name === "TokenExpiredError") error = handleJWTExpiredError();
  else error = { ...err, message: err.message, stack: err.stack };

  if (process.env.NODE_ENV === "production") sendErrorProduction(error, res);
  else if (process.env.NODE_ENV === "development") sendErrorDev(error, res);
};

export { globalErrorHandler };
