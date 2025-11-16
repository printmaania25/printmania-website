import express from "express";
import {
  createOrder,
  uploadTransactionScreenshots,
  cancelOrder,
  getOrdersByUser,
  getAllOrders,
  markDelivered
} from "../controllers/order_controller.js";

import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// USER ROUTES
router.post("/", auth, createOrder);
router.put("/:id/upload", auth, uploadTransactionScreenshots);
router.put("/:id/cancel", auth, cancelOrder);
router.get("/myorders", auth, getOrdersByUser);

// ADMIN ROUTES
router.get("/", auth, isAdmin, getAllOrders);
router.put("/:id/delivered", auth, isAdmin, markDelivered);

export default router;
