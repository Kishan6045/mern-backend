// server/controllers/adminController.js
import userModel from "../models/userModel.js";
import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";

// ADMIN STATS (cards)
export const getAdminStatsController = async (req, res) => {
  try {
    const totalUsers = await userModel.countDocuments();
    const totalCategories = await categoryModel.countDocuments();
    const totalProducts = await productModel.countDocuments();
    const pendingOrders = await orderModel.countDocuments({
      status: { $in: ["Pending", "Accepted", "Packed"] },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await orderModel.countDocuments({
      createdAt: { $gte: today },
    });

    const totalRevenueAgg = await orderModel.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    res.send({
      success: true,
      stats: {
        totalUsers,
        totalCategories,
        totalProducts,
        pendingOrders,
        todayOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error getting admin stats",
      error,
    });
  }
};

// SALES ANALYTICS (already tha)
export const getSalesAnalyticsController = async (req, res) => {
  try {
    const days = Number(req.query.days) || 7;

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - (days - 1));
    fromDate.setHours(0, 0, 0, 0);

    const data = await orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: fromDate },
          status: { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalAmount: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const daily = data.map((d) => ({
      date: d._id,
      amount: d.totalAmount,
      orders: d.totalOrders,
    }));

    const totalRevenue = daily.reduce((s, d) => s + d.amount, 0);
    const totalOrders = daily.reduce((s, d) => s + d.orders, 0);

    res.send({
      success: true,
      daily,
      totalRevenue,
      totalOrders,
      days,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error getting sales analytics",
      error,
    });
  }
};

// DAILY SUMMARY (for today)
export const dailySummaryController = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await orderModel.find({
      createdAt: { $gte: today, $lt: tomorrow },
    });

    const deliveredToday = await orderModel.find({
      status: "Delivered",
      updatedAt: { $gte: today, $lt: tomorrow },
    });

    const revenue = todayOrders.reduce((sum, o) => sum + o.amount, 0);

    res.send({
      success: true,
      totalOrders: todayOrders.length,
      delivered: deliveredToday.length,
      revenue,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error getting daily summary",
      error,
    });
  }
};
