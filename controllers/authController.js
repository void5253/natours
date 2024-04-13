import { User } from "../models/userModel.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";
import process from "node:process";
import { promisify } from "node:util";
import { sendEmail } from "../utils/email.js";
import crypto from "node:crypto";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).send({ status: "success", token, user });
};

const signup = catchAsync(async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  //console.log(process.env.JWT_EXPIRES_IN, process.env.JWT_SECRET);
  createSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("Please provide email and password", 400));

  const user = await User.findOne({ email }).select("+password").byActive();
  if (!user || !(await user.verifyPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  createSendToken(user, 200, res);
});

const protect = catchAsync(async (req, res, next) => {
  //1. Check if jwt is present
  let token;
  const { authorization } = req.headers;
  if (authorization?.startsWith("Bearer")) {
    token = authorization.split(" ")[1];
  }
  //console.log(token);

  //2. Verify jwt
  if (!token) return next(new AppError("You're not logged in!", 401));
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //console.log(decoded);

  //3. Check if corresponding user for jwt exists
  const user = await User.findById(decoded.id).byActive();
  if (!user) {
    return next(new AppError("User corresponding to jwt doesn't exist", 401));
  }

  //4. Check if user changed password after jwt was issued
  if (user.passwordHasChanged(decoded.iat)) {
    return next(
      new AppError(
        "Password changed since jwt issued. Please login again!",
        401
      )
    );
  }

  req.user = user;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action!", 403)
      );
    }
    next();
  };
};

const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).byActive();
  //console.log(user);
  if (!user) return next(new AppError("No user with this email!", 404));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Click ${resetURL} to reset password. Link will be valid for only 10 mins.\nIf you didn't forget your password, then please ignore this email.`;
    sendEmail({
      to: user.email,
      subject: "Password reset for Natours",
      text: message,
    });

    res
      .status(200)
      .json({ status: "success", message: "Email sent successfully!" });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("Couldn't send email!", 500));
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  // 1. Find user using resetToken and tokenExpiration
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiresIn: { $gt: Date.now() },
  }).byActive();

  if (!user) {
    return next(new AppError("Token is invalid or has expired!", 400));
  }
  //console.log(user);

  // 2. If found, update password and remove passwordResetToken
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresIn = undefined;

  await user.save();

  // 3. Login user
  createSendToken(user, 200, res);
});

const updatePassword = async (req, res, next) => {
  // 1.Get user from collection
  let { user } = req;
  user = await User.findById(user._id).select("+password");
  const { passwordCurrent } = req.body;

  // 2. Confirm current password
  if (!(await user.verifyPassword(passwordCurrent, user.password)))
    return next(new AppError("Incorrect current password", 401));

  // 3. Update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4. Log user in, send jwt
  createSendToken(user, 200, res);
};

export {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
};
