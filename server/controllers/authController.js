import userModel from "../models/userModel.js";
import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";

// ---------------- REGISTER ----------------
export const registerController = async (req, res) => {
  try {
    console.log("🔥 BACKEND BODY:", req.body);  // Debug

    const { name, email, password, age } = req.body;

    // Validations
    if (!name) return res.send({ success: false, message: "Name is required" });
    if (!email) return res.send({ success: false, message: "Email is required" });
    if (!password)
      return res.send({ success: false, message: "Password is required" });

    const ageNum = Number(age);
    if (!age || isNaN(ageNum) || ageNum < 1) {
      return res.send({ success: false, message: "Valid age is required" });
    }

    // Existing user?
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.send({
        success: false,
        message: "Already registered, please login",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Save user
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      age: ageNum,
    });

    console.log("🔥 USER STORED IN DB:", user);

    res.status(201).send({
      success: true,
      message: "User Registered Successfully",
      user,
    });
  } catch (error) {
    console.log("REGISTER ERROR:", error);
    res.status(500).send({
      success: false,
      message: "Error in registration",
      error,
    });
  }
};



// ---------------- LOGIN ----------------
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.send({ success: false, message: "Invalid email or password" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.send({ success: false, message: "Email is not registered" });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.send({ success: false, message: "Invalid password" });
    }

    const token = await JWT.sign(
      { _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.send({
      success: true,
      message: "Login successful",
      token,
      user,
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

// ---------------- FORGOT PASSWORD ----------------
export const forgotPasswordController = async (req, res) => {
  try {
    const { email, age, newPassword } = req.body;

    if (!email) return res.send({ success: false, message: "Email is required" });
    if (!age) return res.send({ success: false, message: "Age is required" });
    if (!newPassword) {
      return res.send({ success: false, message: "New Password is required" });
    }

    // Find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.send({ success: false, message: "Email not found" });
    }

    // AGE match
    const ageNum = Number(age);
    if (user.age !== ageNum) {
      return res.send({ success: false, message: "Age does not match" });
    }

    // Hash new password
    const hashed = await hashPassword(newPassword);

    await userModel.findByIdAndUpdate(user._id, { password: hashed });

    res.send({
      success: true,
      message: "Password reset successful",
    });

  } catch (error) {
    console.log("FORGOT ERROR:", error);
    res.status(500).send({
      success: false,
      message: "Error in forgot password",
      error,
    });
  }
};