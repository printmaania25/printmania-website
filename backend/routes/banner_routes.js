import express from "express";
import {
  createBanner,
  updateBanner,
  deleteBanner,
  getAllBanners
} from "../controllers/banner_controller.js";

import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// ADMIN ROUTES
router.post("/", auth, isAdmin, createBanner);
router.put("/:id", auth, isAdmin, updateBanner);
router.delete("/:id", auth, isAdmin, deleteBanner);

// PUBLIC
router.get("/", getAllBanners);

export default router;
