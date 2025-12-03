import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },

    // MUST HAVE FOR SUBCATEGORY SYSTEM
    subcategories: [
      {
        name: { type: String, required: true },
        slug: { type: String, required: true }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
