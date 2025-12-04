import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        type: mongoose.ObjectId,
        ref: "Product",
      },
    ],

    buyer: {
      type: mongoose.ObjectId,
      ref: "User",
    },

    payment: {
      method: String,    // cod / upi / card
      status: String,    // paid / pending
    },

    amount: {
      type: Number,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      default: "Processing",
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
