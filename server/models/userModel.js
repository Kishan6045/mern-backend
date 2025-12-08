import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },

    password: {
      type: String,
      default: "", // Google login works without password
    },

    phone: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    age: {
      type: Number,
      default: 0,  // <-- FIXED (Google age not provided)
    },

    role: {
      type: Number,
      default: 0, // 0 = user, 1 = admin
    },

    // ⭐ Google Login Flag
    googleUser: {
      type: Boolean,
      default: false,
    },

    // ⭐ Google Profile Image
    picture: {
      type: String,
      default: "",
    },

    // ⭐ Wishlist
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
