import express from "express";
import {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  getToursWithin,
  getDistances,
} from "../controllers/tourController.js";

import { protect, restrictTo } from "../controllers/authController.js";

import { router as reviewsRouter } from "./reviewRoutes.js";

export const router = express.Router();

router.use("/:tourId/reviews", reviewsRouter);

router
  .route("/")
  .get(getAllTours)
  .post(protect, restrictTo("admin", "lead-guide"), createTour);
router
  .route("/:id")
  .get(getTour)
  .patch(protect, restrictTo("lead-guide", "admin"), updateTour)
  .delete(protect, restrictTo("lead-guide", "admin"), deleteTour);

router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(getToursWithin);

router.route("/distances/:latlng/unit/:unit").get(getDistances);
