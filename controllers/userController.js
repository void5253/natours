import { User } from "../models/userModel.js";
import { ApiFeatures } from "../utils/apiFeatures.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

const getAllUsers = catchAsync(async (req, res) => {
  const queryBuilder = new ApiFeatures(User.find(), req.query)
    .filter()
    .sort()
    .fields();
  const users = await queryBuilder.query.exec();
  res.status(200).json({
    status: "success",
    users,
  });
});

const getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found!", 404);
  res.status(200).json(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new AppError("User not found!", 404);
  res.status(200).json(user);
});

const createUser = catchAsync(async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });
  res.status(201).json({
    status: "success",
    data: { newUser },
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError("User not found!", 404);
  res.status(200).json({ msg: "Tour deleted!" });
});

const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for updating passwords", 400));
  }
  const filteredBody = filterObj(req.body, "name", "email");
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

export {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUser,
  updateMe,
  deleteMe,
};
