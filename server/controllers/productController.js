// server/controllers/productController.js
import productModel from "../models/productModel.js";
import slugify from "slugify";
import fs from "fs";

// =========================
// CREATE PRODUCT
// =========================
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } = req.fields;
    const { photo } = req.files;

    if (!name) return res.send({ success: false, message: "Name is required" });
    if (!description) return res.send({ success: false, message: "Description is required" });
    if (!price) return res.send({ success: false, message: "Price is required" });
    if (!category) return res.send({ success: false, message: "Category is required" });
    if (!quantity) return res.send({ success: false, message: "Quantity is required" });

    const product = new productModel({
      ...req.fields,
      slug: slugify(name),
    });

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();

    res.send({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.send({ success: false, message: "Error creating product", error });
  }
};

// =========================
// GET ALL PRODUCTS WITH FILTER (gender + type)
// =========================
export const getProductController = async (req, res) => {
  try {
    const { gender, type } = req.query;

    let filter = {};

    if (gender) filter.gender = gender;
    if (type) filter.type = type;

    const products = await productModel
      .find(filter)
      .select("-photo")
      .sort({ createdAt: -1 });

    res.send({
      success: true,
      products,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error getting products",
      error,
    });
  }
};


// =========================
// GET SINGLE PRODUCT BY SLUG
// =========================
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    res.send({
      success: true,
      product,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error getting single product",
      error,
    });
  }
};

// =========================
// GET PRODUCT PHOTO
// =========================
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");

    if (product?.photo?.data) {
      res.set("Content-type", product.photo.contentType);
      return res.send(product.photo.data);
    }

    res.send("No Image");
  } catch (error) {
    res.send({ success: false, error });
  }
};

// =========================
// GET ALL PRODUCTS (ADMIN) WITH SEARCH + FILTER
// =========================
export const getAllAdminProductsController = async (req, res) => {
  try {
    const { keyword, category } = req.query;

    let filter = {};

    if (keyword) {
      filter.name = { $regex: keyword, $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    const products = await productModel
      .find(filter)
      .populate("category")
      .select("-photo")
      .sort({ createdAt: -1 });

    res.send({ success: true, products });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error loading products",
      error,
    });
  }
};

// =========================
// UPDATE PRODUCT
// =========================
export const updateProductController = async (req, res) => {
  try {
    const { name } = req.fields;
    const { photo } = req.files;

    const updates = {
      ...req.fields,
    };

    if (name) {
      updates.slug = slugify(name);
    }

    let product = await productModel.findByIdAndUpdate(
      req.params.pid,
      updates,
      { new: true }
    );

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
      await product.save();
    }

    res.send({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating product",
      error,
    });
  }
};

// =========================
// DELETE PRODUCT
// =========================
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");

    res.send({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting product",
      error,
    });
  }
};





// ========================= filter products
export const filterProductController = async (req, res) => {
  try {
    const { gender, type } = req.query;

    let query = {};

    if (gender) query.gender = gender;
    if (type) query.type = type;

    const products = await productModel.find(query);

    res.send({
      success: true,
      products,
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Filter error",
      error,
    });
  }
};

//treding products controller
export const trendingProductsController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .sort({ sold: -1 })   // ⭐ Highest sold first
      .limit(6);

    res.send({
      success: true,
      products,
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error loading trending products",
      error,
    });
  }
};



//reviewed products controller
// POST /api/v1/product/add-review/:pid
export const addReviewController = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await productModel.findById(req.params.pid);

    if (!product)
      return res.send({ success: false, message: "Product not found" });

    const already = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (already) {
      // update
      already.rating = rating;
      already.comment = comment;
    } else {
      product.reviews.push({
        user: req.user._id,
        name: req.user.name,
        rating,
        comment,
      });
      product.ratingCount += 1;
    }

    // recalc average
    const sum = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    product.ratingAvg = sum / product.reviews.length;

    await product.save();

    res.send({
      success: true,
      message: "Review saved",
      product,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error saving review",
      error,
    });
  }
};



// =============================
// FEATURED PRODUCTS (Homepage Banner)
// =============================
export const getFeaturedProductsController = async (req, res) => {
  try {
    const products = await productModel
      .find({ isFeatured: true })
      .select("-photo")
      .limit(8);

    res.send({
      success: true,
      products,
    });

  } catch (error) {
    res.send({
      success: false,
      message: "Error loading featured products",
      error,
    });
  }
};

