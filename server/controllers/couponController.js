import couponModel from "../models/couponModel.js";


// POST /api/v1/coupon/create
export const createCouponController = async (req, res) => {
  try {
    const { code, discountType, discountValue, minAmount, maxDiscount, expiry } = req.body;

    const coupon = await couponModel.create({
      code,
      discountType,
      discountValue,
      minAmount,
      maxDiscount,
      expiry,
    });

    res.send({ success: true, coupon });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error creating coupon",
      error,
    });
  }
};

// POST /api/v1/coupon/apply
export const applyCouponController = async (req, res) => {
  try {
    const { code, amount } = req.body;

    const coupon = await couponModel.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon)
      return res.send({ success: false, message: "Invalid coupon" });

    if (coupon.expiry && coupon.expiry < new Date())
      return res.send({ success: false, message: "Coupon expired" });

    if (amount < coupon.minAmount)
      return res.send({
        success: false,
        message: `Minimum order amount should be ₹${coupon.minAmount}`,
      });

    let discount = 0;
    if (coupon.discountType === "flat") {
      discount = coupon.discountValue;
    } else {
      discount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    }

    const finalAmount = amount - discount;

    res.send({
      success: true,
      discount,
      finalAmount,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error applying coupon",
      error,
    });
  }
};
