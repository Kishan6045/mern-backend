import orderModel from "../models/orderModel.js";
import moment from "moment";

export const salesAnalyticsController = async (req, res) => {
  try {
    const days = Number(req.query.days) || 7;

    const startDate = moment().subtract(days - 1, "days").startOf("day");

    // Find orders in last X days
    const orders = await orderModel.find({
      createdAt: { $gte: startDate.toDate() }
    });

    // Daily analytics format
    let daily = [];

    for (let i = 0; i < days; i++) {
      const date = moment().subtract(i, "days").format("YYYY-MM-DD");

      const ordersOfDay = orders.filter(
        (o) => moment(o.createdAt).format("YYYY-MM-DD") === date
      );

      const amount = ordersOfDay.reduce((sum, o) => sum + o.amount, 0);

      daily.push({
        date,
        orders: ordersOfDay.length,
        amount,
      });
    }

    daily.reverse(); // oldest → latest

    const totalRevenue = orders.reduce((t, o) => t + o.amount, 0);
    const totalOrders = orders.length;

    res.send({
      success: true,
      days,
      totalRevenue,
      totalOrders,
      daily,
    });

  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Analytics error",
      err,
    });
  }
};
