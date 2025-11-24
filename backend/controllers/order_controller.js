// controllers/orderController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import dotenv from "dotenv";
import { sendMail } from "../utils/mailer.js";

dotenv.config();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.MAIL_FROM;

function emailTemplate(title, order, screenshots = []) {
  // PRODUCT IMAGES
  const productImagesHtml = (order.product.pictures || [])
    .filter(url => typeof url === "string" && url.startsWith("http"))
    .map(img => `
      <div style="margin: 16px 0; text-align: center;">
        <img src="${img}" width="450"
          style="display:block; margin:auto; border-radius: 6px; max-height: 350px; object-fit: contain;" />
        <br/>
        <a href="${img}" download
          style="background:#007bff; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; font-size:14px;">
          Download Full-Size
        </a>
      </div>
    `)
    .join("");

  // UPLOADED IMAGE
  const uploadedImageHtml = order.product.uploadrequired && order.product.uploaded
    ? `
      <h3 style="margin-top:30px;">📄 Customer Uploaded Image</h3>
      <div style="margin: 16px 0; text-align: center;">
        <img src="${order.product.uploaded}" width="450"
          style="display:block; margin:auto; border-radius: 6px; max-height: 350px; object-fit: contain;" />
        <br/>
        <a href="${order.product.uploaded}" download
          style="background:#28a745; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; font-size:14px;">
          Download Uploaded Image
        </a>
      </div>
    `
    : "";

  // TRANSACTION SCREENSHOTS
  const txnHtml =
    screenshots && screenshots.length > 0
      ? `
      <h3 style="margin-top:30px;">💰 Transaction Proof</h3>
      ${screenshots
        .map(img => `
          <div style="margin: 16px 0; text-align: center;">
            <img src="${img}" width="450"
              style="display:block; margin:auto; border-radius: 6px; max-height: 350px; object-fit: contain;" />
            <br/>
            <a href="${img}" download
              style="background:#ff9800; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; font-size:14px;">
              Download Proof
            </a>
          </div>
        `)
        .join("")}
    `
      : `
      <h3 style="margin-top:30px; color:red; text-align:center;">
        ⚠ No Transaction Screenshots Uploaded
      </h3>
    `;

  // COD MESSAGE
  const codHtml = order.cod
    ? `
      <h3 style="margin-top:20px; color:#0d7a36; text-align:center;">
        💵 COD — 60% Prepaid, Remaining 40% To Be Collected in Cash
      </h3>
    `
    : "";

  // TRACKING MESSAGE
  const trackingHtml = order.trackingId
    ? `
      <h3 style="margin-top:20px; color:#1565c0; text-align:center;">
        🚚 Tracking ID: <strong>${order.trackingId}</strong>
      </h3>
    `
    : "";

  return `
  <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 20px; background: #ffffff;">
    <h2 style="background: #007bff; color: white; padding: 12px; text-align: center; border-radius: 5px;">
      ${title} — Order ${order._id}
    </h2>

    <h3>Order Placed By</h3>
    <p><strong>Name:</strong> ${order.username}</p>
    <p><strong>Email:</strong> ${order.useremail}</p>

    <h3>Product Details</h3>
    <p><strong>Name:</strong> ${order.product.name}</p>
    <p><strong>Size:</strong> ${order.product.size || "N/A"}</p>
    <p><strong>Price:</strong> ₹${order.product.price}</p>
    <p><strong>Quantity:</strong> ${order.product.quantity}</p>
    <p><strong>Total:</strong>
      <strong style="font-size:18px; color:#d32f2f;">₹${order.product.total_price}</strong>
    </p>

    <h3>Delivery Address</h3>
    <p><strong>Name:</strong> ${order.address?.name}</p>
    <p><strong>Mobile:</strong> ${order.address?.mobile}</p>
    <p><strong>Door No:</strong> ${order.address?.doorNo}</p>
    <p><strong>Street:</strong> ${order.address?.street}</p>
    <p><strong>City:</strong> ${order.address?.city}</p>
    <p><strong>Pincode:</strong> ${order.address?.pincode}</p>
    <p><strong>State:</strong> ${order.address?.state}</p>

    ${codHtml}
    ${trackingHtml}

    ${order.product.pictures?.length > 0 ? `<h3 style="margin-top:30px;">🖼 Product Images</h3>${productImagesHtml}` : ""}
    ${uploadedImageHtml}
    ${txnHtml}

    <hr style="margin:30px 0;">
    <p style="text-align:center; color:#888; font-size:12px;">
      This is an automated email — Do not reply.
    </p>
  </div>
  `;
}

/* ================= CREATE ORDER ================= */
export const createOrder = async (req, res) => {
  try {
    const { productId, size, price, quantity, address, uploaded } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const total_price = product.price * quantity;

    const order = await Order.create({
      productRef: product._id,
      product: { name: product.name, pictures: product.pictures, size, price, quantity, total_price, uploadrequired: product.uploadrequired, uploaded },
      userId: req.user._id,
      username: req.user.name,
      useremail: req.user.email,
      address,
      transactionscreenshot: [],
      cancelled: false,
    });

    await User.findByIdAndUpdate(req.user._id, { $push: { orders: order._id } });

    await sendMail({
      to: ADMIN_EMAIL,
      subject: `🛍 New Order — ${order._id}`,
      html: emailTemplate("New Order Received", order),
    });

    res.json({ success: true, message: "Order created", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= UPLOAD TRANSACTION SCREENSHOTS ================= */
export const uploadTransactionScreenshots = async (req, res) => {
  try {
    const { id } = req.params;
    const { screenshots, cod } = req.body; // now receiving cod as well

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (String(order.userId) !== String(req.user._id))
      return res.status(403).json({ success: false, message: "Not your order" });

    // add screenshots if provided
    if (Array.isArray(screenshots) && screenshots.length > 0) {
      order.transactionscreenshot.push(...screenshots);
    }

    // update COD if provided
    if (typeof cod !== "undefined") {
      order.cod = cod;
    }

    await order.save();

    // send email with updated status + proof screenshots if any
    await sendMail({
      to: ADMIN_EMAIL,
      subject: `💰 Payment Proof Uploaded — Order ${order._id}`,
      html: emailTemplate("Payment Proof Uploaded", order, order.transactionscreenshot),
    });

    res.json({
      success: true,
      message: "Transaction screenshots uploaded & COD updated",
      order
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


/* ================= CANCEL ORDER ================= */
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (String(order.userId) !== String(req.user._id)) return res.status(403).json({ success: false, message: "Not your order" });

    order.cancelled = true;
    await order.save();

    await sendMail({
      to: ADMIN_EMAIL,
      subject: `❌ Order Cancelled — ${order._id}`,
      html: emailTemplate("Order Cancelled", order, order.transactionscreenshot),
    });

    res.json({ success: true, message: "Order cancelled", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= MARK DELIVERED ================= */
export const markDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.delivered = true;
    await order.save();

    await sendMail({
      to: ADMIN_EMAIL,
      subject: `📦 Order Delivered — ${order._id}`,
      html: emailTemplate("Order Delivered", order, order.transactionscreenshot),
    });

    res.json({ success: true, message: "Order marked delivered", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= ASSIGN TRACKING ID ================= */
export const assignTrackingId = async (req, res) => {
  try {
    const { id } = req.params;
    const { trackingId } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.trackingId = trackingId;
    await order.save();

    await sendMail({
      to: ADMIN_EMAIL,
      subject: `🚚 Tracking ID Assigned — ${order._id}`,
      html: emailTemplate("Tracking Assigned", order, order.transactionscreenshot),
    });

    res.json({ success: true, message: "Tracking ID updated", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= RETRIEVE ORDERS ================= */
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
