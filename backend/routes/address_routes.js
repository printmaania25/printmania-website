import express from "express";
import { auth } from "../middleware/auth.js";
import {
  createAddress,
  updateAddress,
  deleteAddress,
  getAddressesByUser
} from "../controllers/address_controller.js";

const router = express.Router();

// CREATE
router.post("/", auth, createAddress);

// UPDATE
router.put("/:id", auth, updateAddress);

// DELETE
router.delete("/:id", auth, deleteAddress);

router.get("/myaddresses", auth, getAddressesByUser);

export default router;
