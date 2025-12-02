import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";
import bcrypt from "bcryptjs";

// REGISTER
export const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // validation
    if (!name || !email || !password) {
      return res.send({ success: false, message: "All fields required" });
    }

    // user check
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.send({ success: false, message: "User already exists" });
    }

    // password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // save user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword
    });
    await newUser.save();

    res.send({ success: true, message: "Register Successful", user: newUser });

  } catch (error) {
    res.send({ success: false, message: "Register failed", error });
  }
};

// LOGIN
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.send({ success: false, message: "User not found" });
    }

    // match password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.send({ success: false, message: "Invalid password" });
    }

    // token generate
    const token = JWT.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.send({
      success: true,
      message: "Login Success",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    res.send({ success: false, message: "Login failed", error });
  }
};
