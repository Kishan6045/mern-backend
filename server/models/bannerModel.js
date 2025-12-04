import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: String,
    subtitle: String,
    imageUrl: { type: String, required: true },
    link: String, // e.g. /products?gender=men
    active: { type: Boolean, default: true },
    priority: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);
