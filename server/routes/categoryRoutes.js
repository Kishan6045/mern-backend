import express from "express";
import {
  createCategoryController,
  categoryController
} from "../controllers/categoryController.js";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// CREATE CATEGORY (Admin Only)
router.post(
  "/create-category",
  requireSignIn,
  isAdmin,
  createCategoryController
);

// GET ALL CATEGORY
router.get("/get-category", categoryController);

export default router;
