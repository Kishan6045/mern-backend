import express from "express";
import {
  createCategoryController,
  categoryController,
  addSubcategoryController,
} from "../controllers/categoryController.js";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// CREATE CATEGORY
router.post("/create-category", requireSignIn, isAdmin, createCategoryController);

// ADD SUBCATEGORY
router.post("/add-sub", requireSignIn, isAdmin, addSubcategoryController);

// GET CATEGORY
router.get("/get-category", categoryController);

export default router;
