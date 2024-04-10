import express from "express";
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
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
router.route("/updatePassword").patch(protect, updatePassword);

router.route("/updateMe").patch(protect, updateMe);
router.route("/deleteMe").delete(protect, deleteMe);

router
  .route("/")
  .get(protect, restrictTo("admin"), getAllUsers)
  .post(protect, restrictTo("admin"), createUser);
router
  .route("/:id")
  .get(protect, restrictTo("admin"), getUser)
  .patch(protect, restrictTo("admin"), updateUser)
  .delete(protect, restrictTo("admin"), deleteUser);
