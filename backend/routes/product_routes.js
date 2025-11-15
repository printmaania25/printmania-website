import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts
} from "../controllers/product_controller.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Admin-protected
router.post("/", auth, isAdmin, createProduct);
router.put("/:id", auth, isAdmin, updateProduct);
router.delete("/:id", auth, isAdmin, deleteProduct);

// Public route
router.get("/", getProducts);

export default router;
