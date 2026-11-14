import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getPaymentConfig,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
} from "../controllers/payment.controller.js";

const router = express.Router();

// Public config & webhook endpoints
router.get("/config", getPaymentConfig);
router.post("/webhook", handleRazorpayWebhook);

// Protected payment endpoints
router.post("/create-order", verifyJWT, createRazorpayOrder);
router.post("/create-checkout-session", verifyJWT, createRazorpayOrder); // Backward-compatibility alias
router.post("/verify-payment", verifyJWT, verifyRazorpayPayment);
router.post("/verify-session", verifyJWT, verifyRazorpayPayment); // Backward-compatibility alias

export default router;
