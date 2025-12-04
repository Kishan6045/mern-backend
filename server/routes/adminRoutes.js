// server/routes/adminRoutes.js
import express from "express";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";
import {
  getAdminStatsController,
  getSalesAnalyticsController,
  dailySummaryController,
} from "../controllers/adminController.js";

const router = express.Router();

// DASHBOARD CARDS
router.get("/stats", requireSignIn, isAdmin, getAdminStatsController);

// SALES ANALYTICS
router.get(
  "/sales-analytics",
  requireSignIn,
  isAdmin,
  getSalesAnalyticsController
);

// DAILY SUMMARY (today)
router.get(
  "/daily-summary",
  requireSignIn,
  isAdmin,
  dailySummaryController
);

export default router;
