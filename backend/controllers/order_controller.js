// controllers/orderController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import dotenv from "dotenv";
import {
  sendText,
  sendImageByLink,
  sendMultipleImages,
  sendTextToAdmin,
  sendImagesToAdmin,
} from "../utils/whatsappMessenger.js";

dotenv.config();


// Local uploaded test file path you mentioned — we'll include it if no pictures exist.
// Your environment/tooling can transform this local path to a public URL when needed.
const LOCAL_TEST_IMAGE_PATH = "/mnt/data/1916cbd3-b9dc-40d7-8c27-0acecbf7ead9.png";

/**
 * Helper: normalize recipient phone number (basic). Expect E.164 without '+' from caller.
 * If address.mobile contains leading 0 or no country code, you may want to transform it
 * before calling sendText/sendImage... (this function is intentionally minimal).
 */
function normalizePhoneNumber(mobile) {
  if (!mobile) return null;
  const cleaned = mobile.replace(/\s+/g, "").replace(/\D/g, "");
  // If number already contains country code (length > 10), assume it's fine.
  return cleaned;
}

export const createOrder = async (req, res) => {
  console.log("whatsapp num",process.env.ADMIN_WHATSAPP_NUMBER)
  try {
    const { productId, size, price, quantity, address , uploaded , cod} = req.body;

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
        price,
        quantity,
        total_price,
        uploadrequired: product.uploadrequired,
        uploaded,
      },

      userId: req.user._id,
      username: req.user.name,
      useremail: req.user.email,

      address,

      transactionscreenshot: [],

      cancelled: false,
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { orders: order._id },
    });

    // Populate order
    const populatedOrder = await Order.findById(order._id).populate("productRef").lean();

    // Build summary text
    const summaryText = `New Order Created\nOrder ID: ${populatedOrder._id}\nProduct: ${populatedOrder.product.name}\nQty: ${populatedOrder.product.quantity}\nPrice: ₹${populatedOrder.product.price} × ${populatedOrder.product.quantity} = ₹${populatedOrder.product.total_price}\nUser: ${populatedOrder.username}\nMobile: ${populatedOrder.address?.mobile || "N/A"}`;

    // Send summary to admin
    try {
      await sendTextToAdmin(summaryText);
    } catch (err) {
      console.error("Failed to send order summary to admin via WhatsApp:", err.response?.data || err.message);
    }

    // Prepare image list — use Cloudinary links from product.pictures.
    // If empty, include the local test image path (so you can test locally).
    let imageLinks = Array.isArray(populatedOrder.product.pictures) ? [...populatedOrder.product.pictures] : [];

    if (imageLinks.length === 0) {
      // include the local path for testing; your infra can transform this to a URL when calling
      imageLinks.push(LOCAL_TEST_IMAGE_PATH);
    }

    // Send every image to admin (one message per image)
    try {
      await sendImagesToAdmin(imageLinks, `Order ${populatedOrder._id} - Product Image`);
    } catch (err) {
      console.error("Failed to send product images to admin via WhatsApp:", err.response?.data || err.message);
    }

    // Optionally send a confirmation to the user (if you want)
    try {
      const userPhone = normalizePhoneNumber(populatedOrder.address?.mobile || req.user.phone || "");
      if (userPhone) {
        await sendText(userPhone, `Thanks ${populatedOrder.username}, your order ${populatedOrder._id} has been placed. We'll update you soon.`);
        // send first product image to user as well (if exists)
        if (imageLinks[0]) {
          await sendImageByLink(userPhone, imageLinks[0], `Your ordered item: ${populatedOrder.product.name}`);
        }
      }
    } catch (err) {
      // don't fail order creation if whatsapp to user fails
      console.error("Failed to notify user via WhatsApp:", err.response?.data || err.message);
    }

    res.json({ success: true, message: "Order created", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const uploadTransactionScreenshots = async (req, res) => {
  try {
    const { id } = req.params; // order id
    const { screenshots, cod } = req.body; // array of image URLs (Cloudinary) + cod boolean

    const orderDoc = await Order.findById(id).populate("productRef");
    if (!orderDoc) return res.status(404).json({ success: false, message: "Order not found" });

    const order = orderDoc.toObject();

    if (String(order.userId) !== String(req.user._id))
      return res.status(403).json({ success: false, message: "Not your order" });

    // Update COD if provided
    let updateObj = { transactionscreenshot: [...(order.transactionscreenshot || []), ...(Array.isArray(screenshots) ? screenshots : [])] };
    if (cod !== undefined) {
      updateObj.cod = cod;
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updateObj, { new: true }).populate("productRef");

    // notify admin: summary + screenshots as images + COD status
    const summaryText = `Transaction screenshots uploaded\nOrder ID: ${order._id}\nUser: ${order.username}\nTotal screenshots: ${updatedOrder.transactionscreenshot.length}\nCOD Enabled: ${cod ? 'Yes' : 'No'}`;
    try {
      await sendTextToAdmin(summaryText);
      // send all screenshots to admin
      await sendImagesToAdmin(updatedOrder.transactionscreenshot, `Order ${order._id} - Payment Screenshot`);
    } catch (err) {
      console.error("Failed to send transaction screenshots to admin via WhatsApp:", err.response?.data || err.message);
    }

    res.json({ success: true, message: "Transaction screenshots uploaded", order: updatedOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const orderDoc = await Order.findById(id).populate("productRef");
    if (!orderDoc)
      return res.status(404).json({ success: false, message: "Order not found" });

    const order = orderDoc.toObject();

    if (String(order.userId) !== String(req.user._id))
      return res.status(403).json({ success: false, message: "Not your order" });

    await Order.findByIdAndUpdate(id, { cancelled: true }, { new: true });

    // Prepare summary & notify admin
    const summaryText = `Order Cancelled by User\nOrder ID: ${order._id}\nProduct: ${order.product.name}\nUser: ${order.username}\nMobile: ${order.address?.mobile || "N/A"}`;
    try {
      await sendTextToAdmin(summaryText);
    } catch (err) {
      console.error("Failed to send cancellation message to admin via WhatsApp:", err.response?.data || err.message);
    }

    // send product images too (if any)
    const imageLinks = Array.isArray(order.product.pictures) && order.product.pictures.length > 0
      ? order.product.pictures
      : [LOCAL_TEST_IMAGE_PATH];

    try {
      await sendImagesToAdmin(imageLinks, `Order ${order._id} - Product Image (Cancelled)`);
    } catch (err) {
      console.error("Failed to send cancelled order images to admin via WhatsApp:", err.response?.data || err.message);
    }

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

export const markDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("mark delivered:",);

    const order = await Order.findById(id);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    order.delivered = true;
    await order.save();

    // // notify admin that order was delivered
    // try {
    //   await sendTextToAdmin(`Order marked as delivered\nOrder ID: ${order._id}`);
    // } catch (err) {
    //   console.error("Failed to notify admin about delivery via WhatsApp:", err.response?.data || err.message);
    // }

    res.json({ success: true, message: "Order marked as delivered", order });
  } catch (err) {
    console.log("err.msg",err.message);
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


export const assignTrackingId = async (req, res) => {
  try {
    const { id } = req.params;
    const { trackingId } = req.body;

    if (!trackingId)
      return res.status(400).json({ success: false, message: "Tracking ID required" });

    const order = await Order.findById(id);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    order.trackingId = trackingId;
    await order.save();

    // Notify admin
    try {
      await sendTextToAdmin(`Tracking ID Updated\nOrder ID: ${order._id}\nTracking: ${trackingId}`);
    } catch (err) {
      console.error("Failed to send tracking update via WhatsApp:", err.response?.data || err.message);
    }

    // Notify user
    try {
      const userPhone = normalizePhoneNumber(order.address.mobile);
      if (userPhone)
        await sendText(userPhone, `Your order ${order._id} now has a tracking ID: ${trackingId}`);
    } catch (err) {
      console.error("Failed to notify user via WhatsApp:", err.response?.data || err.message);
    }

    res.json({ success: true, message: "Tracking ID updated", order });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
