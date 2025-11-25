import Quote from "../models/Quotes.js";
import dotenv from "dotenv";
import { sendMail } from "../utils/mailer.js";

dotenv.config();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.MAIL_FROM;

// Helper to send mail to both admin + user
async function notifyBoth({ adminMsg, userMsg, quote }) {
  // send mail to admin
  await sendMail({
    to: ADMIN_EMAIL,
    subject: `📩 Quote Update — ${quote._id}`,
    text: adminMsg,
    html: `<p>${adminMsg.replace(/\n/g, "<br/>")}</p>`,
  });

  // send mail to user
  await sendMail({
    to: quote.useremail || quote.email, // fallback
    subject: `📩 Quote Update — ${quote._id}`,
    text: userMsg,
    html: `<p>${userMsg.replace(/\n/g, "<br/>")}</p>`,
  });
}

/* ================= PUBLIC: Create Quote ================= */
export const createQuote = async (req, res) => {
  try {
    const { name, email, mobile, company, description, requirements } = req.body;

    if (!name || !email || !mobile || !company || !description) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    // Attach logged-in user details
    let userData = {};
    if (req.user) {
      userData = {
        userId: req.user._id,
        username: req.user.name,
        useremail: req.user.email,
      };
    }

    const quote = await Quote.create({
      name,
      email,
      mobile,
      company,
      description,
      requirements,
      ...userData,
    });

    // 📌 Send emails
    await notifyBoth({
      quote,
      adminMsg: `🆕 A new quote has been placed.\nQuote ID: ${quote._id}\nPlease check the admin panel.`,
      userMsg: `📌 Your quote proposal has been placed successfully.\nQuote ID: ${quote._id}\nWe will contact you soon.`,
    });

    res.json({ success: true, message: "Quote submitted successfully", quote });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= ADMIN: Get All Quotes ================= */
export const getAllQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json({ success: true, quotes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= ADMIN: Confirm Quote ================= */
export const confirmQuote = async (req, res) => {
  try {
    const { id } = req.params;

    const quote = await Quote.findById(id);
    if (!quote)
      return res.status(404).json({ success: false, message: "Quote not found" });

    quote.confirm = true;
    await quote.save();

    await notifyBoth({
      quote,
      adminMsg: `✔ Quote confirmed.\nQuote ID: ${quote._id}`,
      userMsg: `✔ Your quote has been confirmed.\nQuote ID: ${quote._id}`,
    });

    res.json({ success: true, message: "Quote confirmed", quote });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= ADMIN: Assign Tracking ID ================= */
export const assignTrackingIdToQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { trackingId } = req.body;

    if (!trackingId)
      return res.status(400).json({ success: false, message: "Tracking ID is required" });

    const quote = await Quote.findById(id);
    if (!quote)
      return res.status(404).json({ success: false, message: "Quote not found" });

    quote.trackingId = trackingId;
    await quote.save();

    await notifyBoth({
      quote,
      adminMsg: `🚚 Tracking ID assigned to quote.\nQuote ID: ${quote._id}\nTracking ID: ${trackingId}`,
      userMsg: `🚚 Tracking ID has been updated for your quote.\nQuote ID: ${quote._id}\nTracking ID: ${trackingId}`,
    });

    res.json({ success: true, message: "Tracking ID updated", quote });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= USER: Cancel Bulk Quote ================= */
export const cancelBulkQuotes = async (req, res) => {
  try {
    const { id } = req.params;
    const quote = await Quote.findById(id);

    if (!quote)
      return res.status(404).json({ success: false, message: "Quote not found" });

    if (String(quote.userId) !== String(req.user._id))
      return res.status(403).json({ success: false, message: "You can cancel only your own quote" });

    quote.cancelled = true;
    await quote.save();

    await notifyBoth({
      quote,
      adminMsg: `❌ Quote cancelled by user.\nQuote ID: ${quote._id}`,
      userMsg: `❌ You have cancelled your quote.\nQuote ID: ${quote._id}`,
    });

    res.json({ success: true, message: "Quote cancelled successfully" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= USER: Get Quotes ================= */
export const getBulkQuotesByUserId = async (req, res) => {
  try {
    const quotes = await Quote.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, quotes });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= ADMIN: Mark Delivered ================= */
export const markQuoteDelivered = async (req, res) => {
  try {
    const { id } = req.params;

    const quote = await Quote.findById(id);
    if (!quote)
      return res.status(404).json({ success: false, message: "Quote not found" });

    quote.delivered = true;
    await quote.save();

    await notifyBoth({
      quote,
      adminMsg: `📦 Quote marked delivered.\nQuote ID: ${quote._id}`,
      userMsg: `📦 Your order has been delivered.\nQuote ID: ${quote._id}`,
    });

    res.json({
      success: true,
      message: "Quote marked as delivered",
      quote,
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
