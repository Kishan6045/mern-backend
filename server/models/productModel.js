import mongoose from "mongoose";

//
// ⭐ REVIEW SCHEMA
//
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

//
// ⭐ PRODUCT SCHEMA
//
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, lowercase: true },

    description: { type: String, required: true },
    price: { type: Number, required: true },

    // ⭐ Gender (Men / Women)
    gender: {
      type: String,
      enum: ["men", "women"],
      required: true,
    },

    // ⭐ Type (Classic / Smart)
    type: {
      type: String,
      enum: ["classic", "smart"],
      required: true,
    },

    // ⭐ Category & Subcategory
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    subcategory: {
      type: String,
      default: "",
    },

    // ⭐ Order-based analytics
    sold: {
      type: Number,
      default: 0,
    },

    quantity: { type: Number, required: true },

    shipping: {
      type: Boolean,
      default: true,
    },

    //
    // ⭐ Photo
    //
    photo: {
      data: Buffer,
      contentType: String,
    },

    //
    // ⭐ Reviews & Ratings
    //
    reviews: [reviewSchema],
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    //
    // ⭐ Homepage flags
    //
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },

  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
