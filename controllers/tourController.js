import { Tour } from "../models/tourModel.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} from "./handlerFactory.js";

const getAllTours = getAll(Tour);
const getTour = getOne(Tour);
const updateTour = updateOne(Tour);
const createTour = createOne(Tour);
const deleteTour = deleteOne(Tour);

// {{api}}/tours/tours-within/:distance/center/:latlng/unit/:unit
const getToursWithin = catchAsync(async (req, res, next) => {
  let { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(",");
  if (!lat || !lng)
    return new AppError("Location not in proper format (lat,lng)", 400);

  const radius = unit === "km" ? distance / 6378.1 : distance / 3963.2;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({ status: "success", number: tours.length, tours });
});

// {{api}}/tours/distances/:latlng/unit/:unit
const getDistances = catchAsync(async (req, res, next) => {
  let { latlng, unit } = req.params;

  const [lat, lng] = latlng.split(",");
  if (!lat || !lng)
    return new AppError("Location not in proper format (lat,lng)", 400);

  const multiplier = unit === "km" ? 0.001 : 0.0006213712;

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [lng * 1, lat * 1] },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({ status: "success", distances });
});

export {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  getToursWithin,
  getDistances,
};
