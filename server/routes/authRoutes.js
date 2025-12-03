import express from "express";
import {
  registerController,
  loginController,
  forgotPasswordController,
  allUsersController
} from "../controllers/authController.js";

import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// REGISTER
router.post("/register", registerController);

// LOGIN
router.post("/login", loginController);

// Forgot password
router.post("/forgot-password", forgotPasswordController);

// Manage Users
router.get("/all-users", requireSignIn, isAdmin, allUsersController);

export default router;
