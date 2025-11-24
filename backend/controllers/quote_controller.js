import Quote from "../models/Quotes.js";

// PUBLIC: Create Quote
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
      requirements, // ⭐ ADDING REQUIREMENTS
      ...userData,
    });

    res.json({ success: true, message: "Quote submitted successfully", quote });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: Get All Quotes
export const getAllQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json({ success: true, quotes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: Confirm Quote
export const confirmQuote = async (req, res) => {
  try {
    const { id } = req.params;

    const quote = await Quote.findById(id);
    if (!quote)
      return res.status(404).json({ success: false, message: "Quote not found" });

    quote.confirm = true;
    await quote.save();

    res.json({ success: true, message: "Quote confirmed", quote });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: Assign Tracking ID
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

    res.json({ success: true, message: "Tracking ID updated", quote });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// USER: Cancel Bulk Quotes
export const cancelBulkQuotes = async (req, res) => {
  try {
       const { id } = req.params;// single ID

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Quote ID required",
      });
    }

    const userId = req.user._id;

    const quote = await Quote.findById(id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found",
      });
    }

    if (String(quote.userId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can cancel only your own quote",
      });
    }

    quote.cancelled = true;
    await quote.save();

    res.json({
      success: true,
      message: "Quote cancelled successfully",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// USER: Get multiple quotes by IDs
export const getBulkQuotesByUserId = async (req, res) => {
  console.log("req user in bq",req.user);
  try {
    const quotes = await Quote.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, quotes });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ADMIN: Mark Delivered
export const markQuoteDelivered = async (req, res) => {
  try {
    const { id } = req.params;

    const quote = await Quote.findById(id);
    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote not found" });
    }

    quote.delivered = true;
    await quote.save();

    res.json({
      success: true,
      message: "Quote marked as delivered",
      quote,
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
