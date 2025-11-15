import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    sizes: [{ type: String }], // optional

    mrp: { type: Number, required: true },
    price: { type: Number, required: true },

    pictures: [{ type: String, required: true }], // array of image URLs

    uploadrequired: { type: Boolean, default: false },

    deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
