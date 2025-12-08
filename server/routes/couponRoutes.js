import express from "express";
import { applyCoupon, createFiftyPercentCoupon } from "../controllers/couponController.js";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ADMIN → create 50% coupon
router.post("/create", requireSignIn, isAdmin, createFiftyPercentCoupon);

// USER → apply coupon
router.post("/apply", requireSignIn, applyCoupon);

export default router;
