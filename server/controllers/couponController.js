import Coupon from "../models/couponModel.js";

// ----------------------------------------
//  ADMIN: Create 50% OFF coupon (example)
// ----------------------------------------
export const createFiftyPercentCoupon = async (req, res) => {
  try {
    // Example: fixed 50% coupon
    const code = "NEW50";

    // agar already hai to error
    const existing = await Coupon.findOne({ code });
    if (existing) {
      return res.send({
        success: false,
        message: "Coupon already exists",
      });
    }

    const coupon = await Coupon.create({
      code,                // WATCH50
      discountType: "percent",
      discountValue: 50,   // 50% off
      minAmount: 0,        // chaho to 1000 ya kuch bhi kar sakte ho
      maxDiscount: 0,      // 0 = unlimited, ya 2000 jaisa rakh sakte ho
      // expiresAt: new Date("2025-12-31"),
    });

    res.send({
      success: true,
      message: "50% coupon created",
      coupon,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error creating coupon",
      error,
    });
  }
};

// ----------------------------------------
//  USER: Apply coupon on amount
//  POST /api/v1/coupon/apply   { code, amount }
// ----------------------------------------
// USER: Apply coupon
export const applyCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;

    if (!code || !amount) {
      return res.send({
        success: false,
        message: "Coupon code and amount required",
      });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.send({
        success: false,
        message: "Invalid or inactive coupon",
      });
    }

    // ONE–TIME USE CHECK 👇
    if (coupon.usedBy.includes(req.user._id)) {
      return res.send({
        success: false,
        message: "You have already used this coupon",
      });
    }

    // expiry
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.send({
        success: false,
        message: "Coupon expired",
      });
    }

    if (amount < coupon.minAmount) {
      return res.send({
        success: false,
        message: `Minimum order amount ₹${coupon.minAmount} required`,
      });
    }

    let discount =
      coupon.discountType === "percent"
        ? Math.round((amount * coupon.discountValue) / 100)
        : coupon.discountValue;

    if (coupon.maxDiscount > 0)
      discount = Math.min(discount, coupon.maxDiscount);

    const finalAmount = amount - discount;

    if (finalAmount <= 0) {
      return res.send({ success: false, message: "Final amount invalid" });
    }

    // SAVE USER — MARK COUPON AS USED 🔥
    coupon.usedBy.push(req.user._id);
    await coupon.save();

    return res.send({
      success: true,
      message: "Coupon applied",
      discount,
      finalAmount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error applying coupon",
      error,
    });
  }
};
