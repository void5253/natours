import express from "express";
import {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
} from "../controllers/tourController.js";

import { protect, restrictTo } from "../controllers/authController.js";

export const router = express.Router();

router.route("/").get(getAllTours).post(createTour);
router
  .route("/:id")
  .get(getTour)
  .patch(protect, restrictTo("guide", "admin"), updateTour)
  .delete(protect, restrictTo("admin"), deleteTour);
