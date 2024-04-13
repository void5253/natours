/* eslint-disable no-unused-vars */
import { Tour } from "../models/tourModel.js";
import { ApiFeatures } from "../utils/apiFeatures.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";

const getAllTours = catchAsync(async (req, res) => {
  const queryBuilder = new ApiFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .fields();
  const tours = await queryBuilder.query.exec();
  res.status(200).json(tours);
});

const getTour = catchAsync(async (req, res) => {
  const tour = await Tour.findById(req.params.id).populate({
    path: "guides",
    select: "-passwordChangedAt",
  });
  if (!tour) throw new AppError("Tour not found!", 404);
  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

const updateTour = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) throw new AppError("Tour not found!", 404);
  res.status(200).json({ tour });
});

const createTour = catchAsync(async (req, res) => {
  const tour = await Tour.create(req.body);
  res.status(201).json({ status: "success", data: { tour } });
});

const deleteTour = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) throw new AppError("Tour not found!", 404);
  res.status(204).json({ msg: "Tour deleted" });
});

export { getAllTours, getTour, createTour, updateTour, deleteTour };
