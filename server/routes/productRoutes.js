import express from "express";
import formidable from "express-formidable";

import {
  createProductController,
  getProductController,
  productPhotoController
} from "../controllers/productController.js";

import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// CREATE PRODUCT
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  createProductController
);

// GET ALL PRODUCTS
router.get("/get-products", getProductController);

// PRODUCT PHOTO
router.get("/product-photo/:pid", productPhotoController);

export default router;
