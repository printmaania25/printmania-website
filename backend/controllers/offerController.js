import Offer from "../models/Offers.js";

// Create Offer (Admin)
export const createOffer = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: "Text is required" });
    }

    const newOffer = await Offer.create({ text });

    res.status(201).json({ success: true, offer: newOffer });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Edit Offer (Admin)
export const editOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const updated = await Offer.findByIdAndUpdate(
      id,
      { text },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Offer not found" });
    }

    res.json({ success: true, offer: updated });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete Offer (Admin)
export const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Offer.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Offer not found" });
    }

    res.json({ success: true, message: "Offer deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get All Offers (Anyone)
export const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });

    res.json({ success: true, offers });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
