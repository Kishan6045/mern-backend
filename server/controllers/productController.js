// server/controllers/productController.js
import productModel from "../models/productModel.js";
import slugify from "slugify";
import fs from "fs";
import path from "path";


// =========================
// CREATE PRODUCT (FINAL FIXED VERSION)
// =========================
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } = req.fields;
    const files = req.files;

    // Validation
    if (!name) return res.send({ success: false, message: "Name is required" });
    if (!description) return res.send({ success: false, message: "Description is required" });
    if (!price) return res.send({ success: false, message: "Price is required" });
    if (!category) return res.send({ success: false, message: "Category is required" });
    if (!quantity) return res.send({ success: false, message: "Quantity is required" });

    // Create product
    const product = new productModel({
      ...req.fields,
      slug: slugify(name),
      images: [],
    });

    // -----------------------------
    // HANDLE MULTIPLE IMAGES
    // -----------------------------
    let photos = [];

    if (files.photos) {
      photos = Array.isArray(files.photos) ? files.photos : [files.photos];
    }

    // Create uploads folder if missing
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }

    // SAVE EACH IMAGE
    for (let file of photos) {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `uploads/${fileName}`;

      // ⭐ FIX: renameSync fails on Windows (C: → E:) → use copy + delete
      fs.copyFileSync(file.path, filePath);
      fs.unlinkSync(file.path);

      product.images.push(filePath);
    }

    // Save to DB
    await product.save();

    res.send({
      success: true,
      message: "Product created successfully",
      product,
    });

  } catch (error) {
    console.log("CREATE PRODUCT ERROR:", error);
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
    const { pid } = req.params;
    const index = req.query.index || 0;

    const product = await productModel.findById(pid).select("images");

    if (!product || !product.images[index]) {
      return res.status(404).send("Image not found");
    }

    const imagePath = path.resolve(product.images[index]);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).send("File not found");
    }

    res.sendFile(imagePath);
  } catch (error) {
    console.log("PHOTO ERROR:", error);
    res.status(500).send({ success: false, error });
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
// UPDATE PRODUCT (FINAL WINDOWS-SAFE VERSION)
// =========================
export const updateProductController = async (req, res) => {
  try {
    const { pid } = req.params;
    const files = req.files || {}; // ⭐ safe: if no files, empty object

    let product = await productModel.findById(pid);
    if (!product) {
      return res
        .status(404)
        .send({ success: false, message: "Product not found" });
    }

    // 1️⃣ UPDATE TEXT FIELDS
    if (req.fields.name) {
      product.slug = slugify(req.fields.name);
    }
    Object.assign(product, req.fields);

    // 2️⃣ DELETE SELECTED IMAGES (from frontend)
    if (req.fields.deleteIndexes) {
      let indexes = [];

      try {
        indexes = JSON.parse(req.fields.deleteIndexes); // e.g. [0,2]
      } catch (err) {
        indexes = [];
      }

      // delete from uploads folder also
      indexes.forEach((i) => {
        if (product.images[i] && fs.existsSync(product.images[i])) {
          fs.unlinkSync(product.images[i]);
        }
      });

      product.images = product.images.filter((_, i) => !indexes.includes(i));
    }

    // 3️⃣ ADD NEW IMAGES (Same logic as createProductController)
    let photos = [];
    if (files.photos) {
      photos = Array.isArray(files.photos) ? files.photos : [files.photos];
    }

    if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

    for (let file of photos) {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `uploads/${fileName}`;

      // ⭐ IMPORTANT: renameSync -> EXDEV error on Windows C:→E:
      // Use copy + delete (same as createProductController)
      fs.copyFileSync(file.path, filePath);
      fs.unlinkSync(file.path);

      product.images.push(filePath);
    }

    // 4️⃣ SAVE PRODUCT
    await product.save();

    res.send({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.log("UPDATE PRODUCT ERROR:", error);
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

