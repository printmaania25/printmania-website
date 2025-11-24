import express from "express";
import {
  createOffer,
  editOffer,
  deleteOffer,
  getAllOffers,
} from "../controllers/offerController.js";
import { auth , isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Admin Routes
router.post("/create", auth ,isAdmin, createOffer);
router.put("/edit/:id", auth ,isAdmin, editOffer);
router.delete("/delete/:id", auth,  isAdmin, deleteOffer);

// Public
router.get("/all", getAllOffers);

export default router;
