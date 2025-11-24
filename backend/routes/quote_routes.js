import express from "express";
import { createQuote, getAllQuotes , confirmQuote , assignTrackingIdToQuote , markQuoteDelivered, getBulkQuotesByUserId,cancelBulkQuotes} from "../controllers/quote_controller.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// PUBLIC → create quote
router.post("/", auth ,  createQuote);

// ADMIN → get all quotes
router.get("/", auth, isAdmin, getAllQuotes);

router.put("/:id/confirm", auth, isAdmin, confirmQuote);
router.put("/:id/tracking", auth, isAdmin, assignTrackingIdToQuote);
router.put("/cancel/bulk/:id", auth, cancelBulkQuotes);
router.post("/bulk", auth, getBulkQuotesByUserId);
router.put("/:id/delivered", auth, isAdmin, markQuoteDelivered);

export default router;
