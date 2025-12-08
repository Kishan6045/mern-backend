// server/routes/adminRoutes.js
import express from "express";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";
import {
  getAdminStatsController,
  getSalesAnalyticsController,
  getDailySummaryController,
} from "../controllers/adminController.js";

const router = express.Router();

// Overall stats (total users, products, orders)
router.get("/stats", requireSignIn, isAdmin, getAdminStatsController);

// Today's summary (AdminDashboard me use ho raha hai)
router.get(
  "/daily-summary",
  requireSignIn,
  isAdmin,
  getDailySummaryController
);

// Sales analytics (charts ke liye)
router.get(
  "/sales-analytics",
  requireSignIn,
  isAdmin,
  getSalesAnalyticsController
);

export default router;
