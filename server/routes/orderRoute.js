import express from "express";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";
import {
  createOrderController,
  getUserOrdersController,
  getAllOrdersController,
  updateOrderStatusController,
  updateOrderMetaController,
  cancelOrderController,
  requestReturnController,
  getInvoiceController,
  getShippingLabelController,
} from "../controllers/orderController.js";

const router = express.Router();

// USER
router.post("/create-order", requireSignIn, createOrderController);
router.get("/user-orders", requireSignIn, getUserOrdersController);
router.put("/cancel/:orderId", requireSignIn, cancelOrderController);
router.post("/return-request/:orderId", requireSignIn, requestReturnController);
router.get("/invoice/:orderId", requireSignIn, getInvoiceController);

// ADMIN
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);
router.put("/order-status/:orderId", requireSignIn, isAdmin, updateOrderStatusController);
router.put("/order-meta/:orderId", requireSignIn, isAdmin, updateOrderMetaController);
router.get("/shipping-label/:orderId", requireSignIn, isAdmin, getShippingLabelController);




// UPI PAYMENT ROUTE

router.post("/upi-payment", requireSignIn, async (req, res) => {
  try {
    const { amount } = req.body;

    const upiString = `upi://pay?pa=watchstore@upi&pn=Watch Store&am=${amount}&cu=INR`;

    res.send({
      success: true,
      upi: upiString,
      qr: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        upiString
      )}`,
    });
  } catch (err) {
    res.send({ success: false, message: "UPI error", err });
  }
});




export default router;
