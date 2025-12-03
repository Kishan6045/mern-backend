import express from "express";
import { registerController,
          loginController,
          forgotPasswordController   
        } from "../controllers/authController.js";

const router = express.Router();

// REGISTER
router.post("/register", registerController);

// LOGIN
router.post("/login", loginController);

//Forgot Password
router.post("/forgot-password", forgotPasswordController);


export default router;
