import express from "express";
import { auth } from "../middleware/auth.js";
import { updateUser } from "../controllers/user_controller.js";

const router = express.Router();

router.put("/update", auth, updateUser);

export default router;
