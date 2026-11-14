import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/user.model.js";

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret || key_id.includes("placeholder")) {
    return null;
  }
  return new Razorpay({ key_id, key_secret });
};

const PLAN_PRICING = {
  pro: {
    name: "PortfolioAI Pro Subscription",
    description: "Unlimited AI Portfolios, Nemotron ATS Analyzer & Global Edge CDN",
    amount: 49900, // ₹499 in paise
    currency: "INR",
  },
  team: {
    name: "PortfolioAI Team Subscription",
    description: "Team Workspaces, Shared Repos, Cohort ATS & Admin Controls",
    amount: 99900, // ₹999 in paise
    currency: "INR",
  },
};

// Check Razorpay Configuration Status & Key ID
export const getPaymentConfig = async (req, res) => {
  const rzp = getRazorpayInstance();
  const isConfigured = Boolean(rzp);
  const keyId =
    process.env.RAZORPAY_KEY_ID &&
    !process.env.RAZORPAY_KEY_ID.includes("placeholder")
      ? process.env.RAZORPAY_KEY_ID
      : null;

  return res.status(200).json({
    success: true,
    provider: "razorpay",
    isConfigured,
    keyId,
    // Backward compatibility alias for legacy callers
    publishableKey: keyId,
  });
};

export const getStripeConfig = getPaymentConfig;

// Create Razorpay Order
export const createRazorpayOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const { planId = "pro", plan = "pro" } = req.body;
    const requestedPlan = (planId || plan).toLowerCase();
    const planConfig = PLAN_PRICING[requestedPlan] || PLAN_PRICING.pro;

    const rzp = getRazorpayInstance();

    // Check if Razorpay is configured
    if (!rzp) {
      return res.status(400).json({
        success: false,
        notConfigured: true,
        message:
          "Razorpay is not configured yet. Please add your valid RAZORPAY_KEY_ID (rzp_test_...) and RAZORPAY_KEY_SECRET into server/.env.",
      });
    }

    const shortUserId = user._id.toString().slice(-6);
    const shortTime = Date.now().toString().slice(-6);
    const receipt = `rcpt_${shortUserId}_${shortTime}`;

    const order = await rzp.orders.create({
      amount: planConfig.amount,
      currency: "INR",
      receipt,
      notes: {
        userId: user._id.toString(),
        plan: requestedPlan === "team" ? "team" : "pro",
        userEmail: user.email,
      },
    });

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan: requestedPlan === "team" ? "team" : "pro",
      planName: planConfig.name,
      user: {
        name: user.fullName,
        email: user.email,
        phone: user.phone || "",
      },
    });
  } catch (error) {
    console.error("[createRazorpayOrder Error]", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create Razorpay order.",
    });
  }
};

export const createCheckoutSession = createRazorpayOrder;

// Verify Razorpay Payment Signature & Upgrade Account
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan = "pro",
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Order ID, Payment ID, and Signature are required for verification.",
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay secret key is not configured on server.",
      });
    }

    // Verify HMAC-SHA256 signature first: hashing (order_id + "|" + payment_id) with key_secret
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature. Verification failed.",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const targetPlan = (plan || "pro").toLowerCase();
    const paymentAmount = targetPlan === "team" ? 999 : 499;
    const transactionId = razorpay_payment_id;

    // Idempotency guard: prevent duplicate crediting if already verified
    const isAlreadyCredited = user.paymentHistory?.some(
      (p) => p.transactionId === transactionId,
    );

    if (isAlreadyCredited && user.plan === targetPlan) {
      return res.status(200).json({
        success: true,
        message: `Payment already verified for ${targetPlan === "team" ? "Team" : "Pro"}.`,
        user,
        transaction: {
          transactionId,
          orderId: razorpay_order_id,
          amount: paymentAmount,
          currency: "INR",
          date: new Date(),
          plan: targetPlan === "team" ? "Team" : "Pro",
        },
      });
    }

    // Atomically upgrade user plan and log payment history
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          plan: targetPlan,
          subscriptionDate: new Date(),
        },
        $push: {
          paymentHistory: {
            plan: targetPlan,
            amount: paymentAmount,
            currency: "INR",
            paymentMethod: "Razorpay",
            transactionId,
            status: "completed",
            date: new Date(),
          },
        },
      },
      { returnDocument: "after" },
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: `Payment verified successfully! Welcome to ${targetPlan === "team" ? "Team" : "Pro"}! 🎉`,
      user: updatedUser,
      transaction: {
        transactionId,
        orderId: razorpay_order_id,
        amount: paymentAmount,
        currency: "INR",
        date: new Date(),
        plan: targetPlan === "team" ? "Team" : "Pro",
      },
    });
  } catch (error) {
    console.error("[verifyRazorpayPayment Error]", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify payment.",
    });
  }
};

export const verifySession = verifyRazorpayPayment;

// Razorpay Webhook Handler for asynchronous fulfillment
export const handleRazorpayWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  if (webhookSecret) {
    if (!signature) {
      return res.status(400).send("Missing webhook signature header");
    }
    const rawBody = req.rawBody ? req.rawBody.toString("utf8") : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).send("Invalid webhook signature");
    }
  }

  const event = req.body?.event;
  if (event === "payment.captured" || event === "order.paid") {
    const payment = req.body?.payload?.payment?.entity;
    const notes = payment?.notes || {};
    const userId = notes.userId;
    const targetPlan = (notes.plan || "pro").toLowerCase();
    const paymentAmount = payment?.amount ? payment.amount / 100 : (targetPlan === "team" ? 999 : 499);
    const transactionId = payment?.id;

    if (userId && transactionId) {
      try {
        await User.findOneAndUpdate(
          {
            _id: userId,
            "paymentHistory.transactionId": { $ne: transactionId },
          },
          {
            $set: {
              plan: targetPlan,
              subscriptionDate: new Date(),
            },
            $push: {
              paymentHistory: {
                plan: targetPlan,
                amount: paymentAmount,
                currency: "INR",
                paymentMethod: "Razorpay Webhook",
                transactionId,
                status: "completed",
                date: new Date(),
              },
            },
          },
        );
        console.log(
          `[Razorpay Webhook] Successfully upgraded user ${userId} to ${targetPlan}`,
        );
      } catch (dbErr) {
        console.error("[Razorpay Webhook] Database update error:", dbErr);
      }
    }
  }

  return res.status(200).json({ status: "ok" });
};

export const handleStripeWebhook = handleRazorpayWebhook;
