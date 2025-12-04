import orderModel from "../models/orderModel.js";

// ---------------- CREATE ORDER ----------------
export const createOrderController = async (req, res) => {
  try {
    const { products, payment, amount, address } = req.body;

    const order = await orderModel.create({
      products,
      payment,
      amount,
      address,
      buyer: req.user._id,
    });

    res.send({
      success: true,
      message: "Order Placed Successfully",
      order,
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error creating order",
      error,
    });
  }
};

// ---------------- USER ORDERS ----------------
export const getUserOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products")
      .populate("buyer", "name email");

    res.send({
      success: true,
      orders,
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error loading user orders",
      error,
    });
  }
};

// ---------------- ADMIN: ALL ORDERS ----------------
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });

    res.send({
      success: true,
      orders,
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error loading all orders",
      error,
    });
  }
};

// ---------------- ADMIN: UPDATE STATUS ----------------
export const updateOrderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updated = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    res.send({
      success: true,
      message: "Order Status Updated",
      updated,
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating order status",
      error,
    });
  }
};
