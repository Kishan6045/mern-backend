// server/controllers/adminController.js
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import categoryModel from "../models/categoryModel.js";

// ==============================
// 1) OVERALL ADMIN STATS (CARDS)
// ==============================
export const getAdminStatsController = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders] = await Promise.all([
      userModel.countDocuments(),
      productModel.countDocuments(),
      orderModel.countDocuments(),
    ]);

    const deliveredOrders = await orderModel.countDocuments({
      status: "Delivered",
    });

    res.send({
      success: true,
      totalUsers,
      totalProducts,
      totalOrders,
      deliveredOrders,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error loading admin stats",
      error,
    });
  }
};

// ======================================
// 2) TODAY'S SUMMARY (AdminDashboard.js)
// ======================================
export const getDailySummaryController = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const todayOrders = await orderModel.find({
      createdAt: { $gte: start, $lte: end },
    });

    const totalOrders = todayOrders.length;
    const delivered = todayOrders.filter(
      (o) => o.status === "Delivered"
    ).length;
    const revenue = todayOrders.reduce(
      (sum, o) => sum + (o.amount || 0),
      0
    );

    res.send({
      success: true,
      totalOrders,
      delivered,
      revenue,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error loading daily summary",
      error,
    });
  }
};

// ======================================
// 3) SALES ANALYTICS (for charts)
//    /admin/sales-analytics?days=7|30
// ======================================
export const getSalesAnalyticsController = async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;

    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    from.setHours(0, 0, 0, 0);

    // Load orders of range + products + categories
    const orders = await orderModel
      .find({ createdAt: { $gte: from } })
      .populate({
        path: "products",
        populate: { path: "category", model: "Category" },
      })
      .sort({ createdAt: 1 });

    // Total revenue & orders
    const totalRevenue = orders.reduce(
      (sum, o) => sum + (o.amount || 0),
      0
    );
    const totalOrders = orders.length;

    // Daily map
    const dailyMap = {}; // { '2025-12-01': { amount, orders } }

    // Top products map
    const productMap = {}; // { productId: { name, sold, revenue } }

    // Top categories map
    const categoryMap = {}; // { categoryId: { name, sold, revenue } }

    orders.forEach((order) => {
      const d = new Date(order.createdAt);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD

      if (!dailyMap[key]) {
        dailyMap[key] = { date: key, amount: 0, orders: 0 };
      }
      dailyMap[key].amount += order.amount || 0;
      dailyMap[key].orders += 1;

      // Products & categories analytics
      (order.products || []).forEach((p) => {
        if (!p) return;

        // Product analytics
        const pid = p._id.toString();
        if (!productMap[pid]) {
          productMap[pid] = {
            productId: pid,
            name: p.name,
            sold: 0,
            revenue: 0,
          };
        }
        // NOTE: yahan har product ek quantity maan rahe (aapne qty model me nahi rakha)
        productMap[pid].sold += 1;
        productMap[pid].revenue += p.price || 0;

        // Category analytics
        if (p.category) {
          const cid = p.category._id.toString();
          if (!categoryMap[cid]) {
            categoryMap[cid] = {
              categoryId: cid,
              name: p.category.name,
              sold: 0,
              revenue: 0,
            };
          }
          categoryMap[cid].sold += 1;
          categoryMap[cid].revenue += p.price || 0;
        }
      });
    });

    const daily = Object.values(dailyMap).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    const topCategories = Object.values(categoryMap)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    res.send({
      success: true,
      days,
      totalRevenue,
      totalOrders,
      daily,
      topProducts,
      topCategories,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error loading sales analytics",
      error,
    });
  }
};
