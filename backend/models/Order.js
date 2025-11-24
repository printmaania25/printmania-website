import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    productRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    product: {
      name: { type: String, required: true },
      pictures: [{ type: String }],
      size: { type: String }, // optional
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      total_price: { type: Number, required: true },
      uploadrequired: { type: Boolean, default: false },

      uploaded: { type: String }, // only if uploadrequired is true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    username: { type: String, required: true },
    useremail: { type: String, required: true },

    address: {
      name: { type: String, required: true },
      mobile: { type: String, required: true },
      doorNo: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      state: { type: String, required: true },
    },

    transactionscreenshot: [{ type: String }], // image URL array

    cancelled: { type: Boolean, default: false },
    delivered: { type: Boolean, default: false },

    cod: { type: Boolean, default: false },

    trackingId: { type: String, default: "" }

  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
