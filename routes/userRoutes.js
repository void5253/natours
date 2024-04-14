import express from "express";
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  deleteMe,
} from "../controllers/userController.js";

import {
  signup,
  login,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
  restrictTo,
} from "../controllers/authController.js";

export const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);

router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword/:token").patch(resetPassword);

// protect all routes after this middleware
router.use(protect);

router.route("/updatePassword").patch(updatePassword);

router.route("/me").get(getMe, getUser);
router.route("/updateMe").patch(updateMe);
router.route("/deleteMe").delete(deleteMe);

//Only admin can create users with these routes.
router.use(restrictTo("admin"));

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);
