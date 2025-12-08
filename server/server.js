import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import chalk from "chalk";
import connectDB from "./config/db.js";

import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoute.js";
import adminRoutes from "./routes/adminRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";





dotenv.config();

const app = express();

console.log("⭐ Server Loading...");

// ⭐ MIDDLEWARE (ORDER MUST BE LIKE THIS)
app.use(express.json());                         // <-- MOST IMPORTANT
app.use(express.urlencoded({ extended: true })); // <-- Form encoded fix
app.use(cors());                                 // <-- Must come after json()
app.use(morgan("dev"));

// ⭐ DATABASE
connectDB()
  .then(() => console.log(chalk.yellow("[MONGO] Connected")))
  .catch((err) => console.log(chalk.red(`[MONGO ERROR]: ${err}`)));

// ⭐ ROUTES
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/coupon", couponRoutes);
app.use("/api/v1/payment", paymentRoutes);





// DEFAULT
app.get("/", (req, res) => {
  res.send("Watch Store Backend Running...");
});

// ⭐ START SERVER
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(chalk.green(`[SERVER] Running on port ${PORT}`));
});
