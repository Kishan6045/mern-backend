import express from "express";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";
import {
  createCouponController,
  applyCouponController,
} from "../controllers/couponController.js";

const router = express.Router();

router.post("/create", requireSignIn, isAdmin, createCouponController);
router.post("/apply", applyCouponController);

export default router;
