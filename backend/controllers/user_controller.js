import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const updateUser = async (req, res) => {
  try {
    const { name, password } = req.body;

    const user = await User.findById(req.user._id);

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    // Prevent email change
    if (req.body.email) {
      return res.status(400).json({
        success: false,
        message: "Email cannot be changed",
      });
    }

    // Update name
    if (name) user.name = name;

    // Update password (hash it)
    if (password) {
      const hashedPass = await bcrypt.hash(password, 10);
      user.password = hashedPass;
    }

    await user.save();

    const { password: pwd, ...updatedUser } = user.toObject();

    res.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};