import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import chalk from "chalk";          // ⭐ NEW
import connectDB from "./config/db.js";

import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

dotenv.config();

// EXPRESS APP
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Database connect
connectDB()
  .then(() => {
    console.log(chalk.yellow(`[ MONGO ] 🟡 Connected to cloud database`));
  })
  .catch((err) => {
    console.log(chalk.red(`[ MONGO ] 🔴 Database connection failed: ${err}`));
  });

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("Watch Store Backend Running...");
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(chalk.green(`[ SERVER ] 🟢 Running on port ${PORT}`));
});
