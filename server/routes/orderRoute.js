import express from "express";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";
import {
  createOrderController,
  getUserOrdersController,
  getAllOrdersController,
  updateOrderStatusController,
} from "../controllers/orderController.js";


const router = express.Router();

// Create Order
router.post("/create-order", requireSignIn, createOrderController);

// User Orders
router.get("/user-orders", requireSignIn, getUserOrdersController);

// Admin Orders
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);

// Update order status (Admin)
router.put("/order-status/:orderId", requireSignIn, isAdmin, updateOrderStatusController);

export default router;
