import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, required: true },

    // NEW REQUIREMENTS FIELD
    requirements: {
      Tshirts: {
        type: {
          type: String,
        },
        quantity: {
          type: Number,
        },
        image: {
          type: String,
        },
      },
      Banners: {
        size: {
          type: String,
        },
        quantity: {
          type: Number,
        },
        image: {
          type: String,
        },
      },
      IdCards: {
        size: {
          type: String,
        },
        quantity: {
          type: Number,
        },
        image: {
          type: String,
        },
      },
      Certificates: {
        size: {
          type: String,
        },
        quantity: {
          type: Number,
        },
        image: {
          type: String,
        },
      },
      Stickers: {
        size: {
          type: String,
        },
        quantity: {
          type: Number,
        },
        image: {
          type: String,
        },
      },
      Photoframes: {
        size: {
          type: String,
        },
        quantity: {
          type: Number,
        },
        image: {
          type: String,
        },
      },
      Mugs: {
        size: {
          type: String,
        },
        quantity: {
          type: Number,
        },
        image: {
          type: String,
        },
      },
    },

    // USER SYSTEM
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    username: { type: String },
    useremail: { type: String },

    confirm: { type: Boolean, default: false },
    cancelled: { type: Boolean, default: false },
    delivered: { type: Boolean, default: false },
    trackingId: { type: String, default: "" },

  },
  { timestamps: true }
);

export default mongoose.model("Quote", quoteSchema);
