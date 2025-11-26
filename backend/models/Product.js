import mongoose from "mongoose";


const ALLOWED_PHRASES = [
  "Best selling",
  "Popular Gifts",
  "Below 500 Rs",
  "New Arrival",
  "Signature Day Special",
  "Event Special",
  "What's Trending",
  "Corporate Gifting"
]

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    sizes: [{ type: String }], // optional
    category: {
      type: String,
      enum: [
        "Mugs",
        "Photo frames",
        "Polaroid Photos",
        "Key chains",
        "Banners",
        "T shirts",
        "Hoodies",
        "Sweat shirts",
        "Full hand t shirts",
        "Posters",
        "ID cards",
        "Signature Day t shirts",
        "Puzzles Boards",
        "Stickkers",
        "Dairies",
        "Bags",
        "Pens",
        "Ceritificates",
        "Other Gift articles"
      ],
      required: true,
    },

    mrp: { type: Number, required: true },
    price: { type: Number, required: true },

    pictures: [{ type: String, required: true }], // array of image URLs

    description: {type:String},

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
