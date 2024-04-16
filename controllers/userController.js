import { User } from "../models/userModel.js";
import { ApiFeatures } from "../utils/apiFeatures.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} from "./handlerFactory.js";

import multer from "multer";
import sharp from "sharp";

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image. Please upload only images!", 404), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

const uploadUserPhoto = upload.single("photo");

const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

const getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for updating passwords", 400));
  }

  const filteredBody = filterObj(req.body, "name", "email");
  if (req.file) filteredBody.photo = req.file.filename;

  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    runValidators: true,
    new: true,
  });
  res.status(200).json({ status: "success", data: { user } });
});

const deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204);
});

const getAllUsers = getAll(User);
const getUser = getOne(User);
const updateUser = updateOne(User);
const createUser = createOne(User);
const deleteUser = deleteOne(User);

export {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUser,
  getMe,
  updateMe,
  deleteMe,
  uploadUserPhoto,
  resizeUserPhoto,
};
