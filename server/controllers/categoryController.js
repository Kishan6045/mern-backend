import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";

// CREATE CATEGORY
export const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.send({ success: false, message: "Name is required" });
    }

    const exists = await categoryModel.findOne({ name });
    if (exists) {
      return res.send({ success: false, message: "Category already exists" });
    }

    const category = await new categoryModel({
      name,
      slug: slugify(name),
    }).save();

    res.send({
      success: true,
      message: "Category Created Successfully",
      category,
    });
  } catch (error) {
    res.send({ success: false, message: "Error in category", error });
  }
};

// GET ALL CATEGORY
export const categoryController = async (req, res) => {
  const categories = await categoryModel.find({});
  res.send({ success: true, categories });
};
