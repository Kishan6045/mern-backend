// import userModel from "../models/userModel.js";
// import { comparePassword, hashPassword } from "../helpers/authHelper.js";
// import JWT from "jsonwebtoken";
// import nodemailer from "nodemailer";


// // ---------------- REGISTER ----------------
// export const registerController = async (req, res) => {
//   try {
//     console.log("🔥 BACKEND BODY:", req.body);  // Debug

//     const { name, email, password, age } = req.body;

//     // Validations
//     if (!name) return res.send({ success: false, message: "Name is required" });
//     if (!email) return res.send({ success: false, message: "Email is required" });
//     if (!password)
//       return res.send({ success: false, message: "Password is required" });

//     const ageNum = Number(age);
//     if (!age || isNaN(ageNum) || ageNum < 1) {
//       return res.send({ success: false, message: "Valid age is required" });
//     }

//     // Existing user?
//     const existingUser = await userModel.findOne({ email });
//     if (existingUser) {
//       return res.send({
//         success: false,
//         message: "Already registered, please login",
//       });
//     }

//     // Hash password
//     const hashedPassword = await hashPassword(password);

//     // Save user
//     const user = await userModel.create({
//       name,
//       email,
//       password: hashedPassword,
//       age: ageNum,
//     });

//     console.log("🔥 USER STORED IN DB:", user);

//     res.status(201).send({
//       success: true,
//       message: "User Registered Successfully",
//       user,
//     });
//   } catch (error) {
//     console.log("REGISTER ERROR:", error);
//     res.status(500).send({
//       success: false,
//       message: "Error in registration",
//       error,
//     });
//   }
// };



// // ---------------- LOGIN ----------------
// export const loginController = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.send({ success: false, message: "Invalid email or password" });
//     }

//     const user = await userModel.findOne({ email });
//     if (!user) {
//       return res.send({ success: false, message: "Email is not registered" });
//     }

//     const match = await comparePassword(password, user.password);
//     if (!match) {
//       return res.send({ success: false, message: "Invalid password" });
//     }

//    const token = JWT.sign(
//   { _id: user._id, role: user.role },
//   process.env.JWT_SECRET,
//   { expiresIn: "7d" }
// );

//     res.send({
//       success: true,
//       message: "Login successful",
//       token,
//       user,
//     });

//   } catch (error) {
//     console.log("LOGIN ERROR:", error);
//     res.status(500).send({
//       success: false,
//       message: "Error in login",
//       error,
//     });
//   }
// };

// // ---------------- FORGOT PASSWORD ----------------
// export const forgotPasswordController = async (req, res) => {
//   try {
//     const { email, age, newPassword } = req.body;

//     if (!email) return res.send({ success: false, message: "Email is required" });
//     if (!age) return res.send({ success: false, message: "Age is required" });
//     if (!newPassword) {
//       return res.send({ success: false, message: "New Password is required" });
//     }

//     // Find user
//     const user = await userModel.findOne({ email });
//     if (!user) {
//       return res.send({ success: false, message: "Email not found" });
//     }

//     // AGE match
//     const ageNum = Number(age);
//     if (user.age !== ageNum) {
//       return res.send({ success: false, message: "Age does not match" });
//     }

//     // Hash new password
//     const hashed = await hashPassword(newPassword);

//     await userModel.findByIdAndUpdate(user._id, { password: hashed });

//     res.send({
//       success: true,
//       message: "Password reset successful",
//     });

//   } catch (error) {
//     console.log("FORGOT ERROR:", error);
//     res.status(500).send({
//       success: false,
//       message: "Error in forgot password",
//       error,
//     });
//   }
// };




// //manage users 
// export const allUsersController = async (req, res) => {
//   try {
//     const users = await userModel.find().select("-password");
//     res.send({ success: true, users });
//   } catch (error) {
//     res.send({ success: false, message: "Error loading users" });
//   }
// };




import crypto from "crypto";
import userModel from "../models/userModel.js";
import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";
import nodemailer from "nodemailer";

// ---------------- REGISTER ----------------
export const registerController = async (req, res) => {
  try {
    const { name, email, password, age } = req.body;

    if (!name || !email || !password || !age)
      return res.send({ success: false, message: "All fields required" });

    const exists = await userModel.findOne({ email });
    if (exists)
      return res.send({ success: false, message: "Already registered" });

    const hashed = await hashPassword(password);
    const user = await userModel.create({
      name,
      email,
      password: hashed,
      age,
    });

    res.send({ success: true, message: "Registered", user });
  } catch (err) {
    res.status(500).send({ success: false, message: "Register error", err });
  }
};

// ---------------- LOGIN ----------------
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) return res.send({ success: false, message: "Invalid email" });

    const match = await comparePassword(password, user.password);
    if (!match)
      return res.send({ success: false, message: "Invalid password" });

    const token = JWT.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.send({ success: true, message: "Login success", token, user });
  } catch (err) {
    res.status(500).send({ success: false, message: "Login error", err });
  }
};

// ----------------------------------------------------------------------
// ⭐ METHOD 1 — Age Based Reset (fast & simple)
// ----------------------------------------------------------------------
export const forgotPasswordByAge = async (req, res) => {
  try {
    const { email, age, newPassword } = req.body;

    if (!email || !age || !newPassword)
      return res.send({ success: false, message: "All fields required" });

    const user = await userModel.findOne({ email });
    if (!user) return res.send({ success: false, message: "Email not found" });

    if (user.age !== Number(age))
      return res.send({ success: false, message: "Age mismatch" });

    const hashed = await hashPassword(newPassword);

    await userModel.findByIdAndUpdate(user._id, { password: hashed });

    res.send({ success: true, message: "Password reset successfully" });
  } catch (err) {
    res.status(500).send({ success: false, message: "Error in age reset", err });
  }
};

// ----------------------------------------------------------------------
// ⭐ METHOD 2 — Email Reset Link (professional)
// ----------------------------------------------------------------------
export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) return res.send({ success: false, message: "Email not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Watch Store" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Reset Password Link",
      html: `
        <h2>Password Reset</h2>
        <p>Click the button to reset your password:</p>
        <a 
          href="${resetURL}" 
          style="padding:10px 20px;background:black;color:white;border-radius:5px;">
          Reset Password
        </a>
      `,
    });

    res.send({ success: true, message: "Reset link sent to email" });
  } catch (err) {
    res.status(500).send({ success: false, message: "Forgot error", err });
  }
};

// ---------------- RESET PASSWORD ----------------
export const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.send({ success: false, message: "Invalid or expired token" });

    const hashed = await hashPassword(password);

    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.send({ success: true, message: "Password reset done" });
  } catch (err) {
    res.status(500).send({ success: false, message: "Reset error", err });
  }
};

// ----------------------------------------------------------------------
// ⭐ WISHLIST
// ----------------------------------------------------------------------
export const toggleWishlistController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const { productId } = req.params;

    const exists = user.wishlist.includes(productId);

    if (exists) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();

    res.send({ success: true, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).send({ success: false, message: "Wishlist error", err });
  }
};

export const getWishlistController = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user._id)
      .populate("wishlist");

    res.send({ success: true, products: user.wishlist });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Error loading wishlist",
      err,
    });
  }
};

// ---------------- GET ALL USERS (ADMIN) ----------------
export const allUsersController = async (req, res) => {
  try {
    const users = await userModel.find().select("-password");
    res.send({ success: true, users });
  } catch (err) {
    res.status(500).send({ success: false, message: "Users error", err });
  }
};
