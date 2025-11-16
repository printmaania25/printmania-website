import jwt from "jsonwebtoken";
import User from "../models/User.js";


export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];

    // verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    req.user = user;
    req.tokenData = decoded; // IMPORTANT FIX 🔥

    next();
  } catch (err) {
    res.status(500).json({ success: false, message: "Auth error" });
  }
};


export const isAdmin = (req, res, next) => {
  try {
    if (!req.user)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    // NOW req.tokenData is available
    if (req.tokenData.role !== "admin")
      return res.status(403).json({ success: false, message: "Admin token required" });

    if (req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Admin access denied" });

    next();
  } catch (err) {
    res.status(500).json({ success: false, message: "Role validation error" });
  }
};
