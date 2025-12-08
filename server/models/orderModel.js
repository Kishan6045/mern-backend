import mongoose from "mongoose";

const orderStatusEnum = [
  "Pending",
  "Accepted",
  "Packed",
  "Shipped",
  "Out For Delivery",
  "Delivered",
  "Cancelled",
  "Return Requested",
  "Return Approved",
  "Return Rejected",
  "Refunded",
];

const orderSchema = new mongoose.Schema(
  {
    // --------------------------
    // PRODUCTS
    // --------------------------
    products: [
      {
        type: mongoose.ObjectId,
        ref: "Product",   // keep correct collection name
        required: true,
      },
    ],

    // --------------------------
    // BUYER
    // --------------------------
    buyer: {
      type: mongoose.ObjectId,
      ref: "User",
      required: true,
    },

    // --------------------------
    // PAYMENT DETAILS
    // --------------------------
    payment: {
      method: String, // cod / upi / card / razorpay
      status: String, // paid / pending / failed
      card: String, // saved card name if used

      // Razorpay fields
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
    },

    // --------------------------
    // PRICE DETAILS
    // --------------------------
    amount: Number,          // final payable
    itemsTotal: Number,      // product price total
    deliveryCharge: Number,  // delivery fee
    discount: Number,        // discount value
    coupon: String,          // applied coupon

    // --------------------------
    // ADDRESS
    // --------------------------
    address: {
      type: String,
      required: true,
    },

    // --------------------------
    // GIFT MESSAGE
    // --------------------------
    giftMessage: String,

    // --------------------------
    // ORDER STATUS
    // --------------------------
    status: {
      type: String,
      default: "Pending",
      enum: orderStatusEnum,
    },

    // Courier / Seller Info
    trackingId: { type: String, default: "" },
    courierPartner: { type: String, default: "" },
    notes: { type: String, default: "" },

    // --------------------------
    // STATUS TIMELINE RECORD
    // --------------------------
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

    // --------------------------
    // STATUS LOG HISTORY
    // --------------------------
    statusLogs: [
      {
        status: String,
        date: { type: Date, default: Date.now },
        message: String,
      },
    ],

    // --------------------------
    // RETURN DETAILS
    // --------------------------
    returnReason: String,
    returnComment: String,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
