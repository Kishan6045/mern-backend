import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

// USER MUST LOGIN
export const requireSignIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).send({
        success: false,
        message: "No Token Provided",
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    const decode = JWT.verify(token, process.env.JWT_SECRET);

    req.user = decode;

    next();
  } catch (error) {
    res.status(401).send({ success: false, message: "Invalid Token" });
  }
};

// ONLY ADMIN
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user || user.role !== 1) {
      return res.status(401).send({
        success: false,
        message: "Admin Access Denied",
      });
    }

    next();
  } catch (error) {
    res.status(500).send({ success: false, message: "Error in Admin Middleware" });
  }
};
