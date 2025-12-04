import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    discount: {
      type: Number,
      required: true,   // % discount
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    active: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);
