import express from "express";
import {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  setTourUserIds,
  updateRating,
} from "../controllers/reviewController.js";

import { protect, restrictTo } from "../controllers/authController.js";

export const router = express.Router({ mergeParams: true });

router.route("/rating/update").patch(updateRating);

router
  .route("/")
  .get(getAllReviews)
  .post(protect, restrictTo("user"), setTourUserIds, createReview);
router
  .route("/:id")
  .get(getReview)
  .patch(protect, restrictTo("user", "admin"), updateReview)
  .delete(protect, restrictTo("user", "admin"), deleteReview);
