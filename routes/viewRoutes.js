import express from "express";
import {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
} from "../controllers/ viewController.js";

import { protect, isLoggedIn } from "../controllers/authController.js";

export const router = express.Router();

router.get("/", isLoggedIn, getOverview);
router.get("/tour/:slug", isLoggedIn, getTour);
router.get("/login", isLoggedIn, getLoginForm);
router.get("/me", protect, getAccount);
