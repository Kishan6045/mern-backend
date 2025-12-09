// server/routes/productRoutes.js
import express from "express";
import formidable from "express-formidable";
import {
  createProductController,
  getProductController,
  productPhotoController,
  getAllAdminProductsController,
  deleteProductController,
  getSingleProductController,
  updateProductController,
  filterProductController,
  trendingProductsController,
  addReviewController,
  getFeaturedProductsController,
} from "../controllers/productController.js";

import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* -------------------------
      CREATE PRODUCT
-------------------------- */
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable({ multiples: true }),
  createProductController
);

/* -------------------------
      GET PRODUCTS (USER)
-------------------------- */
router.get("/get-products", getProductController);

/* -------------------------
      SINGLE PRODUCT BY SLUG
-------------------------- */
router.get("/single-product/:slug", getSingleProductController);

/* -------------------------
      GET PRODUCT PHOTO
-------------------------- */
router.get("/product-photo/:pid", productPhotoController);

/* -------------------------
      FILTER PRODUCTS
-------------------------- */
router.get("/filter-products", filterProductController);

/* -------------------------
      TRENDING PRODUCTS
-------------------------- */
router.get("/trending", trendingProductsController);

/* -------------------------
      FEATURED PRODUCTS
-------------------------- */
router.get("/featured", getFeaturedProductsController);

/* -------------------------
      ADD REVIEW
-------------------------- */
router.post(
  "/add-review/:pid",
  requireSignIn,
  addReviewController
);

/* -------------------------
      ADMIN PRODUCTS MANAGEMENT
-------------------------- */
router.get(
  "/admin-products",
  requireSignIn,
  isAdmin,
  getAllAdminProductsController
);

router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable({ multiples: true }),
  updateProductController
);

router.delete(
  "/delete-product/:pid",
  requireSignIn,
  isAdmin,
  deleteProductController
);

export default router;
