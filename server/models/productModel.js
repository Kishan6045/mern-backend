import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: mongoose.ObjectId, ref: "Category", required: true },
    quantity: { type: Number, required: true },
    shipping: { type: Boolean, default: true },
    photo: {
      data: Buffer,
      contentType: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
