import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    desktopBanner: { type: String, required: true }, // link
    mobileBanner: { type: String, required: true },  // link
    title: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);
