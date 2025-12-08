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
    // "percent" = percentage based (like 50%)
    // "flat" = flat discount (like ₹200 off)
    discountType: {
      type: String,
      enum: ["percent", "flat"],
      default: "percent",
    },
    discountValue: {
      type: Number,
      required: true, // percent ya flat ka value
    },
    minAmount: {
      type: Number,
      default: 0, // itne se kam amount pe coupon na lage
    },
    maxDiscount: {
      type: Number,
      default: 0, // 0 = no limit, warna max discount (₹ me)
    },
    expiresAt: {
      type: Date,
      default: null, // null = no expiry
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);
