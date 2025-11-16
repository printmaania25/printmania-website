import mongoose from "mongoose";


const ALLOWED_PHRASES = [
  "What's trending",
  "new arraivals",
  "best seller",
  "Popular gifts",
  "Featured products"
];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    sizes: [{ type: String }], // optional
    category: {
      type: String,
      enum: ["T-shirts", "KeyChains", "Dairys", "Books", "IdCards" , "Others"],
      required: true,
    },

    mrp: { type: Number, required: true },
    price: { type: Number, required: true },

    pictures: [{ type: String, required: true }], // array of image URLs

    phrases: [
      {
        type: String,
        enum: ALLOWED_PHRASES,
      }
    ],

    uploadrequired: { type: Boolean, default: false },

    deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
