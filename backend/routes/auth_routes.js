import express from "express";
import { register, login, googleAuth } from "../controllers/auth_controller.js";

const router = express.Router();

// email auth
router.post("/register", register);
router.post("/login", login);

// google oauth result
router.post("/google", googleAuth);

export default router;
