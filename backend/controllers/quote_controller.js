import Quote from "../models/Quotes.js";
import dotenv from "dotenv";
import { sendMail } from "../utils/mailer.js";

dotenv.config();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.MAIL_FROM;

function quoteEmailTemplate(title, quote, message) {
  // STATUS INFO
  let statusHtml = "";
  if (quote.confirm) {
    statusHtml += `<h3 style="margin-top:20px; color:#28a745; text-align:center;">✔ Confirmed</h3>`;
  }
  if (quote.trackingId) {
    statusHtml += `
      <h3 style="margin-top:20px; color:#1565c0; text-align:center;">
        🚚 Tracking ID: <strong>${quote.trackingId}</strong>
      </h3>
    `;
  }
  if (quote.delivered) {
    statusHtml += `<h3 style="margin-top:20px; color:#28a745; text-align:center;">📦 Delivered</h3>`;
  }
  if (quote.cancelled) {
    statusHtml += `<h3 style="margin-top:20px; color:#d32f2f; text-align:center;">❌ Cancelled</h3>`;
  }

  // FOOTER SIGNATURE
  const footerHtml = `
    <footer style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
      <p><strong>Printmaania</strong><br>Nuzvid, Vijayawada</p>
      <p>Contact: <a href="tel:9063347447" style="color: #007bff; text-decoration: none;">9063347447</a></p>
    </footer>
  `;

  return `
  <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 20px; background: #ffffff; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0; margin: -20px -20px 20px -20px;">
      ${title} — Quote ${quote._id}
    </h2>

    <section style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px 0; color: #333;">Quote Placed By</h3>
      <p style="margin: 5px 0;"><strong>Name:</strong> ${quote.name}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${quote.email}</p>
      <p style="margin: 5px 0;"><strong>Mobile:</strong> ${quote.mobile}</p>
      <p style="margin: 5px 0;"><strong>Company:</strong> ${quote.company}</p>
    </section>

    <section style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px 0; color: #333;">Description</h3>
      <p style="margin: 5px 0; white-space: pre-line;">${quote.description.replace(/\n/g, '<br>')}</p>
    </section>

    ${quote.requirements ? `
      <section style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #333;">Requirements</h3>
        ${Object.entries(quote.requirements)
          .map(([key, req]) => {
            // If no values provided, skip
            if (!req) return "";
            const { size, type, quantity, image, description } = req;
            const hasData = size || type || quantity || image || description;
            if (!hasData) return "";

            return `
              <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #ddd;">
                <strong style="font-size: 15px;">${key}</strong><br>
                ${size ? `Size: ${size}<br>` : ""}
                ${type ? `Type: ${type}<br>` : ""}
                ${quantity ? `Quantity: ${quantity}<br>` : ""}
                ${description ? `Description: ${description}<br>` : ""}
                ${image ? `<img src="${image}" alt="Image" style="margin-top:10px; max-width:300px; border-radius:8px;">` : ""}
              </div>
            `;
          })
          .join("")}
      </section>
    ` : ""}


    ${statusHtml}

    <section style="background: #e3f2fd; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px 0; color: #1976d2;">Update Message</h3>
      <p style="margin: 5px 0; white-space: pre-line;">${message.replace(/\n/g, '<br>')}</p>
    </section>

    <hr style="margin:30px 0; border: none; border-top: 1px solid #eee;">
    <p style="text-align:center; color:#888; font-size:12px; margin-bottom: 10px;">
      This is an automated email — Do not reply.
    </p>
    ${footerHtml}
  </div>
  `;
}

// Helper to send mail to both admin + user
async function notifyBoth({ adminTitle, userTitle, quote, adminMessage, userMessage }) {
  // send mail to admin
  const adminHtml = quoteEmailTemplate(adminTitle, quote, adminMessage);
  sendMail({
    to: ADMIN_EMAIL,
    subject: `${adminTitle} — ${quote._id}`,
    html: adminHtml,
  });

  // send mail to user
  const userHtml = quoteEmailTemplate(userTitle, quote, userMessage);
  sendMail({
    to: quote.useremail || quote.email, // fallback
    subject: `${userTitle} — ${quote._id}`,
    html: userHtml,
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
    notifyBoth({
      quote,
      adminTitle: "New Quote Received",
      userTitle: "Quote Submitted Successfully",
      adminMessage: "A new quote has been placed.\nPlease check the admin panel.",
      userMessage: "Your quote proposal has been placed successfully.\nWe will contact you soon.",
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

    notifyBoth({
      quote,
      adminTitle: "Quote Confirmed",
      userTitle: "Quote Confirmed",
      adminMessage: "Quote confirmed.",
      userMessage: "Your quote has been confirmed.",
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

    notifyBoth({
      quote,
      adminTitle: "Tracking ID Assigned",
      userTitle: "Tracking ID Assigned",
      adminMessage: `Tracking ID assigned to quote.\nTracking ID: ${trackingId}`,
      userMessage: `Tracking ID has been updated for your quote.\nTracking ID: ${trackingId}`,
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

    notifyBoth({
      quote,
      adminTitle: "Quote Cancelled",
      userTitle: "Quote Cancelled",
      adminMessage: "Quote cancelled by user.",
      userMessage: "You have cancelled your quote.",
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

    notifyBoth({
      quote,
      adminTitle: "Quote Delivered",
      userTitle: "Quote Delivered",
      adminMessage: "Quote marked delivered.",
      userMessage: "Your order has been delivered.",
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