import express from "express";
import { razorpay } from "../config/razorpay.js";

const router = express.Router();

// Create Order
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay wants paise
      currency: "INR",
      receipt: "receipt_001"
    });

    return res.json({ success: true, order });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Order creation failed" });
  }
});

// Verify Payment
router.post("/verify", async (req, res) => {
  return res.json({ success: true });
});

export default router;
