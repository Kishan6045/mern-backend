import PDFDocument from "pdfkit";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";

/* ======================================================
    CREATE ORDER
====================================================== */
export const createOrderController = async (req, res) => {
  try {
    const {
      products,
      payment,
      amount,          // Final payable amount (product total - discount + delivery)
      itemsTotal,      // Total of products only
      deliveryCharge,  // Delivery fee
      address,
      coupon,
      discount,
      giftMessage,
    } = req.body;

    // VALIDATION
    if (!products || !products.length)
      return res.send({ success: false, message: "No products in order" });

    // CREATE ORDER
    const order = await orderModel.create({
      products,
      buyer: req.user._id,
      payment,

      // All Amount Fields
      amount,
      itemsTotal,
      deliveryCharge,
      discount,
      coupon,

      // Optional fields
      giftMessage,
      address,

      // Status Fields
      status: "Pending",
      statusTimestamps: { placedAt: new Date() },
      statusLogs: [{ status: "Pending", date: new Date() }],
    });

    // UPDATE PRODUCT SOLD + QUANTITY
    await productModel.updateMany(
      { _id: { $in: products } },
      { $inc: { sold: 1, quantity: -1 } }
    );

    res.send({
      success: true,
      message: "Order Created Successfully",
      order,
    });

  } catch (err) {
    console.log("ORDER CREATE ERROR:", err);
    res.status(500).send({
      success: false,
      message: "Order creation failed",
      err,
    });
  }
};

/* ======================================================
   USER ORDERS
====================================================== */
export const getUserOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });

    res.send({ success: true, orders });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error", error });
  }
};

/* ======================================================
   ADMIN — ALL ORDERS + FILTERS
====================================================== */
export const getAllOrdersController = async (req, res) => {
  try {
    const { status, from, to } = req.query;
    const filter = {};

    if (status && status !== "All") filter.status = status;

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to + "T23:59:59");
    }

    const orders = await orderModel
      .find(filter)
      .populate("products")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });

    res.send({ success: true, orders });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error", error });
  }
};

/* ======================================================
   UPDATE ORDER STATUS + TIMELINE
====================================================== */
export const updateOrderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const now = new Date();

    const map = {
      Pending: "statusTimestamps.placedAt",
      Accepted: "statusTimestamps.acceptedAt",
      Packed: "statusTimestamps.packedAt",
      Shipped: "statusTimestamps.shippedAt",
      "Out For Delivery": "statusTimestamps.outForDeliveryAt",
      Delivered: "statusTimestamps.deliveredAt",
      Cancelled: "statusTimestamps.cancelledAt",
      "Return Requested": "statusTimestamps.returnRequestedAt",
    };

    const update = { status };
    if (map[status]) update[map[status]] = now;

    update.$push = { statusLogs: { status, date: now } };

    const updated = await orderModel.findByIdAndUpdate(orderId, update, {
      new: true,
    });

    res.send({ success: true, updated });
  } catch (error) {
    res.status(500).send({ success: false, error });
  }
};

/* ======================================================
   USER CANCEL ORDER
====================================================== */
export const cancelOrderController = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orderModel.findOne({
      _id: orderId,
      buyer: req.user._id,
    });

    if (!order) return res.send({ success: false, message: "Not found" });

    if (["Shipped", "Out For Delivery", "Delivered"].includes(order.status))
      return res.send({
        success: false,
        message: "Cannot cancel after shipment",
      });

    order.status = "Cancelled";
    order.statusLogs.push({ status: "Cancelled", date: new Date() });
    order.statusTimestamps.cancelledAt = new Date();

    await order.save();

    res.send({ success: true, message: "Order Cancelled", order });
  } catch (error) {
    res.status(500).send({ success: false, error });
  }
};

/* ======================================================
   USER REQUEST RETURN
====================================================== */
export const requestReturnController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, comment } = req.body;

    const order = await orderModel.findOne({
      _id: orderId,
      buyer: req.user._id,
    });

    if (!order) return res.send({ success: false, message: "Not found" });

    if (order.status !== "Delivered")
      return res.send({
        success: false,
        message: "Only delivered orders can be returned",
      });

    order.status = "Return Requested";
    order.returnReason = reason;
    order.returnComment = comment;
    order.statusLogs.push({ status: "Return Requested", date: new Date() });
    order.statusTimestamps.returnRequestedAt = new Date();

    await order.save();

    res.send({ success: true, message: "Return Requested", order });
  } catch (error) {
    res.status(500).send({ success: false, error });
  }
};

/* ======================================================
   UPDATE ORDER META
====================================================== */
export const updateOrderMetaController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { trackingId, courierPartner, notes } = req.body;

    const updated = await orderModel.findByIdAndUpdate(
      orderId,
      { trackingId, courierPartner, notes },
      { new: true }
    );

    res.send({ success: true, updated });
  } catch (error) {
    res.status(500).send({ success: false, error });
  }
};

/* ======================================================
   📄 GENERATE INVOICE PDF
====================================================== */
export const getInvoiceController = async (req, res) => {
  try {
    const order = await orderModel
      .findById(req.params.orderId)
      .populate("products")
      .populate("buyer", "name email");

    if (!order)
      return res.status(404).send({ success: false, message: "Not found" });

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order._id}.pdf`
    );
    doc.pipe(res);

    doc.fontSize(20).text("WATCH STORE INVOICE", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`Name: ${order.buyer.name}`);
    doc.text(`Email: ${order.buyer.email}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
    doc.moveDown();

    order.products.forEach((p) => {
      doc.text(`${p.name} - ₹${p.price}`);
    });

    doc.moveDown();
    doc.fontSize(16).text(`Total: ₹${order.amount}`, { align: "right" });

    doc.end();
  } catch (err) {
    res.status(500).send({ success: false, err });
  }
};

/* ======================================================
   📦 SHIPPING LABEL PDF
====================================================== */
export const getShippingLabelController = async (req, res) => {
  try {
    const order = await orderModel
      .findById(req.params.orderId)
      .populate("buyer", "name email");

    if (!order) return res.status(404).send({ success: false });

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=label-${order._id}.pdf`
    );

    doc.pipe(res);
    doc.fontSize(20).text("SHIPPING LABEL", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`Customer: ${order.buyer.name}`);
    doc.text(`Email: ${order.buyer.email}`);
    doc.text(`Address: ${order.address}`);
    doc.text(`Courier: ${order.courierPartner || "Not assigned"}`);
    doc.text(`Tracking ID: ${order.trackingId || "Not assigned"}`);

    doc.end();
  } catch (err) {
    res.status(500).send({ success: false, err });
  }
};
