import Banner from "../models/Banner.js";

export const createBanner = async (req, res) => {
  try {
    const { desktopBanner, mobileBanner, title } = req.body;

    const banner = await Banner.create({
      desktopBanner,
      mobileBanner,
      title
    });

    res.json({ success: true, message: "Banner created", banner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Banner.findByIdAndUpdate(id, req.body, {
      new: true
    });

    if (!updated)
      return res.status(404).json({ success: false, message: "Banner not found" });

    res.json({ success: true, message: "Banner updated", banner: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Banner.findByIdAndDelete(id);

    if (!deleted)
      return res.status(404).json({ success: false, message: "Banner not found" });

    res.json({ success: true, message: "Banner deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json({ success: true, banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
