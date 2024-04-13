import { Review } from "../models/reviewModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";
import { ApiFeatures } from "../utils/apiFeatures.js";

const getAllReviews = catchAsync(async (req, res, next) => {
  const queryBuilder = new ApiFeatures(Review.find(), req.query)
    .filter()
    .sort()
    .fields();
  const tours = await queryBuilder.query.exec();
  res.status(200).json(tours);
});

const getReview = catchAsync(async (req, res, next) => {
  const r = await Review.findById(req.params.id).getUser().getTour();
  if (!r) return next(AppError("No such review!", 404));
  res.status(200).json({ status: "success", r });
});

const createReview = catchAsync(async (req, res, next) => {
  const r = Review.create({
    review: req.body.review,
    rating: req.body.rating,
    user: req.user.id,
  });
});

const updateReview = catchAsync(async (req, res, next) => {
  const { rating, review } = req.body;
  const r = await Review.findByIdAndUpdate(
    req.params.id,
    { rating, review },
    {
      runValidators: true,
      new: true,
    }
  );
  if (!r) return next(AppError("No such review!", 404));
  res.status(200).json({ status: "success", r });
});

const deleteReview = catchAsync(async (req, res, next) => {
  const r = await Review.findByIdAndDelete(req.params.id);
  if (!r) return next(AppError("No such review!", 404));
  res.status(204);
});

export { getAllReviews, getReview, createReview, updateReview, deleteReview };