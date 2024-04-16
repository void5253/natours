import { Tour } from "../models/tourModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";

const getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug });
  if (!tour) return next(new AppError("No such tour!", 404));
  res.status(200).render("tour", {
    title: `${tour.name} Tour`,
    tour,
  });
});

const getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render("login", {
    title: "Log into your account!",
  });
});

const getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your account",
  });
};

export { getOverview, getTour, getLoginForm, getAccount };
