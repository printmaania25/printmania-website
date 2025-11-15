import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const createOrder = async (req, res) => {
  try {
    const { productId, size, quantity, address } = req.body;

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    const total_price = product.price * quantity;

    const order = await Order.create({
      productRef: product._id,
      product: {
        name: product.name,
        pictures: product.pictures,
        size,
        quantity,
        total_price,
        uploadrequired: product.uploadrequired,
        uploaded: "",
      },

      userId: req.user._id,
      username: req.user.name,
      useremail: req.user.email,

      address,

      transactionscreenshot: [],

      cancelled: false,
    });
    await User.findByIdAndUpdate(req.user._id, {
    $push: { orders: order._id }
    });

    res.json({ success: true, message: "Order created", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const uploadTransactionScreenshots = async (req, res) => {
  try {
    const { id } = req.params; // order id
    const { screenshots } = req.body; // array of image URLs

    const order = await Order.findById(id);

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (String(order.userId) !== String(req.user._id))
      return res.status(403).json({ success: false, message: "Not your order" });

    order.transactionscreenshot.push(...screenshots);
    await order.save();

    res.json({ success: true, message: "Transaction screenshots uploaded", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    if (String(order.userId) !== String(req.user._id))
      return res.status(403).json({ success: false, message: "Not your order" });

    order.cancelled = true;
    await order.save();

    res.json({ success: true, message: "Order cancelled", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
