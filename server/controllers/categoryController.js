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
      subcategories: [],
    }).save();

    res.send({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    res.send({ success: false, message: "Error in category", error });
  }
};

// ADD SUBCATEGORY
export const addSubcategoryController = async (req, res) => {
  try {
    const { categoryId, subName } = req.body;

    if (!categoryId || !subName) {
      return res.send({ success: false, message: "All fields required" });
    }

    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).send({ success: false, message: "Category not found" });
    }

    const exists = category.subcategories.find(
      (s) => s.name.toLowerCase() === subName.toLowerCase()
    );
    if (exists) {
      return res.send({ success: false, message: "Subcategory already exists" });
    }

    category.subcategories.push({
      name: subName,
      slug: slugify(subName),
    });

    await category.save();

    res.send({
      success: true,
      message: "Subcategory added successfully",
      category,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: "Server Error", error });
  }
};

// GET ALL CATEGORIES
export const categoryController = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    res.send({ success: true, category });
  } catch (error) {
    res.send({ success: false, error });
  }
};
