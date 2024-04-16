import { Review } from "../models/reviewModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";
import { ApiFeatures } from "../utils/apiFeatures.js";
import { Tour } from "../models/tourModel.js";

import {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} from "./handlerFactory.js";

const setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

const getAllReviews = getAll(Review);
const getReview = getOne(Review);
const createReview = createOne(Review);
const updateReview = updateOne(Review);
const deleteReview = deleteOne(Review);

//Run this route if you want to format rating
export const updateRating = catchAsync(async (req, res, next) => {
  const avgRatingsOfTours = await Review.aggregate([
    {
      $group: {
        _id: "$tour",
        ratingsQuantity: { $sum: 1 },
        ratingsAverage: { $avg: "$rating" },
      },
    },
  ]);
  const updateDone = Promise.all(
    avgRatingsOfTours.map(async (tour) => {
      const ratingsAverage = Math.floor(tour.ratingsAverage * 100) / 100;
      const updateOb = {
        ratingsQuantity: tour.ratingsQuantity,
        ratingsAverage,
      };
      await Tour.findByIdAndUpdate(tour._id, updateOb);
    })
  );
  res.status(200).json({ status: "success" });
});

export {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  setTourUserIds,
};
