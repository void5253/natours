import express from "express";
import {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
} from "../controllers/tourController.js";

import { protect, restrictTo } from "../controllers/authController.js";

import { router as reviewsRouter } from "./reviewRoutes.js";

export const router = express.Router();

router.use("/:tourId/reviews", reviewsRouter);

router
  .route("/")
  .get(getAllTours)
  .post(protect, restrictTo("admin"), createTour);
router
  .route("/:id")
  .get(getTour)
  .patch(protect, restrictTo("guide", "admin"), updateTour)
  .delete(protect, restrictTo("admin"), deleteTour);
