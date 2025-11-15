// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token)
      return res.status(401).json({ success: false, message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(401).json({ success: false, message: "User not found" });

    req.user = user; // Logged in user stored here
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};


export const isAdmin = (req, res, next) => {
  try {
    // Check user stored by auth()
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    // Check role inside the JWT token also
    if (req.tokenData.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin token required" });
    }

    // Final check: user record role
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access denied" });
    }

    next();
  } catch (err) {
    res.status(500).json({ success: false, message: "Role validation error" });
  }
};