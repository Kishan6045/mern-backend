import mongoose from "mongoose";

const orderStatusEnum = [
  "Pending",           // Just Placed
  "Accepted",          // Seller accepted
  "Packed",            // Packed & ready
  "Shipped",           // Courier picked
  "Out For Delivery",  // Near customer
  "Delivered",         // Completed delivery
  "Cancelled",         // Cancelled by user/seller
  "Return Requested",  // User wants to return
  "Return Approved",   // Seller approved return
  "Return Rejected",   // Seller denied return
  "Refunded",          // Refund processed to user
];

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        type: mongoose.ObjectId,
        ref: "Product",
        required: true,
      },
    ],

    buyer: {
      type: mongoose.ObjectId,
      ref: "User",
      required: true,
    },

    payment: {
      method: { type: String }, // cod / upi / card / razorpay
      status: { type: String }, // paid / pending / failed

      // Razorpay details
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
    },

    amount: {
      type: Number,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    // ⭐ MAIN ORDER STATUS
    status: {
      type: String,
      default: "Pending",
      enum: orderStatusEnum,
    },

    // ⭐ Seller / Courier Info
    trackingId: { type: String, default: "" },
    courierPartner: { type: String, default: "" },
    notes: { type: String, default: "" },

    // ⭐ AUTOMATIC STATUS TIMELINE
    statusTimestamps: {
      placedAt: Date,
      acceptedAt: Date,
      packedAt: Date,
      shippedAt: Date,
      outForDeliveryAt: Date,
      deliveredAt: Date,
      cancelledAt: Date,
      returnRequestedAt: Date,
      returnApprovedAt: Date,
      returnRejectedAt: Date,
      refundedAt: Date,
    },

    // ⭐ History Log (timeline)
    statusLogs: [
      {
        status: String,
        date: { type: Date, default: Date.now },
        message: String,
      },
    ],

    // ⭐ Return Details
    returnReason: String,
    returnComment: String,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
