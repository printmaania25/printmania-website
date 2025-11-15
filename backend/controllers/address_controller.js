import Address from "../models/Address.js";
import User from "../models/User.js";

// Create address
export const createAddress = async (req, res) => {
  try {
    const { name, mobile, doorNo, street, city, pincode, state } = req.body;

    const address = await Address.create({
      name,
      mobile,
      doorNo,
      street,
      city,
      pincode,
      state,
      user: req.user._id
    });

    // Push into user's address list
    await User.findByIdAndUpdate(req.user._id, {
      $push: { addresses: address._id }
    });

    res.json({ success: true, message: "Address added", address });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findById(id);

    if (!address)
      return res.status(404).json({ success: false, message: "Address not found" });

    if (String(address.user) !== String(req.user._id))
      return res.status(403).json({ success: false, message: "Not your address" });

    const updated = await Address.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    res.json({ success: true, message: "Address updated", address: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findById(id);
    if (!address)
      return res.status(404).json({ success: false, message: "Address not found" });

    if (String(address.user) !== String(req.user._id))
      return res.status(403).json({ success: false, message: "Not your address" });

    await Address.findByIdAndDelete(id);

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { addresses: id }
    });

    res.json({ success: true, message: "Address deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAddressesByUser = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      addresses
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
