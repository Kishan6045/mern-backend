// import express from "express";
// import {
//   registerController,
//   loginController,
//   forgotPasswordController,
//   allUsersController
// } from "../controllers/authController.js";

// import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

// const router = express.Router();

// // REGISTER
// router.post("/register", registerController);

// // LOGIN
// router.post("/login", loginController);

// // Forgot password
// router.post("/forgot-password", forgotPasswordController);

// // Manage Users
// router.get("/all-users", requireSignIn, isAdmin, allUsersController);

// export default router;



import express from "express";
import {
  registerController,
  loginController,
  forgotPasswordController,
  resetPasswordController,
  forgotPasswordByAge,
  toggleWishlistController,
  getWishlistController,
  allUsersController
} from "../controllers/authController.js";

import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* -------------------------------
   AUTH ROUTES
--------------------------------*/

// REGISTER
router.post("/register", registerController);

// LOGIN
router.post("/login", loginController);

/* -------------------------------
   FORGOT PASSWORD (2 methods)
--------------------------------*/

// 1️⃣ Age-based quick reset
router.post("/forgot-password-age", forgotPasswordByAge);

// 2️⃣ Real email reset link
router.post("/forgot-password", forgotPasswordController);

// Reset password using token
router.post("/reset-password/:token", resetPasswordController);

/* -------------------------------
   WISHLIST
--------------------------------*/

// Toggle wishlist (add/remove)
router.post("/toggle-wishlist/:productId", requireSignIn, toggleWishlistController);

// Get my wishlist
router.get("/my-wishlist", requireSignIn, getWishlistController);

/* -------------------------------
   ADMIN AREA
--------------------------------*/

// Get all users
router.get("/all-users", requireSignIn, isAdmin, allUsersController);

export default router;
