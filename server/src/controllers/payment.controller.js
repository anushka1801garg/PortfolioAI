import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/user.model.js";

const defaultFactory = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret || key_id.includes("placeholder")) {
    return null;
  }
  return new Razorpay({ key_id, key_secret });
};

let razorpayClientFactory = defaultFactory;

export const getRazorpayInstance = () => razorpayClientFactory();

export const setRazorpayClientFactory = (factory) => {
  razorpayClientFactory = factory;
};

export const resetRazorpayClientFactory = () => {
  razorpayClientFactory = defaultFactory;
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

    const rawPlan = req.body?.planId !== undefined ? req.body.planId : req.body?.plan;
    const requestedPlan = rawPlan !== undefined ? String(rawPlan).trim().toLowerCase() : "pro";
    if (!["pro", "team"].includes(requestedPlan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan specified. Allowed plans are 'pro' and 'team'.",
      });
    }
    const planConfig = PLAN_PRICING[requestedPlan];

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
    } = req.body || {};

    // Validate that order ID, payment ID, and signature are present non-empty strings
    if (
      !razorpay_order_id ||
      typeof razorpay_order_id !== "string" ||
      !razorpay_order_id.trim() ||
      !razorpay_payment_id ||
      typeof razorpay_payment_id !== "string" ||
      !razorpay_payment_id.trim() ||
      !razorpay_signature ||
      typeof razorpay_signature !== "string" ||
      !razorpay_signature.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Order ID, Payment ID, and Signature are required non-empty strings.",
      });
    }

    // Validate plan parameter: must be "pro" or "team" if provided
    const rawPlan = req.body?.plan !== undefined ? req.body.plan : "pro";
    if (
      typeof rawPlan !== "string" ||
      !["pro", "team"].includes(rawPlan.trim().toLowerCase())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan specified. Allowed plans are 'pro' and 'team'.",
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret || secret.includes("placeholder")) {
      return res.status(503).json({
        success: false,
        notConfigured: true,
        message: "Razorpay secret key is not configured on server.",
      });
    }

    const cleanSignature = razorpay_signature.trim();
    const cleanOrderId = razorpay_order_id.trim();
    const cleanPaymentId = razorpay_payment_id.trim();

    // Verify HMAC-SHA256 signature using timingSafeEqual
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${cleanOrderId}|${cleanPaymentId}`)
      .digest("hex");

    const sigBuffer = Buffer.from(cleanSignature, "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature. Verification failed.",
      });
    }

    // Mandatory Razorpay client requirement (fail closed if unavailable)
    const rzp = getRazorpayInstance();
    if (!rzp) {
      return res.status(503).json({
        success: false,
        notConfigured: true,
        message: "Razorpay client is not configured on server.",
      });
    }

    if (
      !rzp.orders ||
      typeof rzp.orders.fetch !== "function" ||
      !rzp.payments ||
      typeof rzp.payments.fetch !== "function"
    ) {
      return res.status(500).json({
        success: false,
        message: "Payment provider verification API is unavailable.",
      });
    }

    // Fetch order from Razorpay
    let order;
    try {
      order = await rzp.orders.fetch(cleanOrderId);
    } catch (orderErr) {
      console.error("[verifyRazorpayPayment] Order fetch error:", orderErr);
      if (orderErr.statusCode === 404 || orderErr.error?.code === "BAD_REQUEST_ERROR") {
        return res.status(400).json({
          success: false,
          message: "Invalid or non-existent Razorpay order ID.",
        });
      }
      return res.status(500).json({
        success: false,
        message: "Failed to verify order details with payment provider. Please try again.",
      });
    }

    if (!order || typeof order !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid order details received from payment provider.",
      });
    }

    // 1. Order ID matching
    if (!order.id || typeof order.id !== "string" || order.id !== cleanOrderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID mismatch or invalid order ID from provider.",
      });
    }

    // 2. Order User ID ownership
    const orderUserId = order.notes?.userId;
    if (!orderUserId || typeof orderUserId !== "string" || !orderUserId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Order is missing required user ownership information.",
      });
    }
    if (orderUserId.trim() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Order does not belong to the authenticated user.",
      });
    }

    // 3. Order Plan
    const orderPlan = order.notes?.plan ? String(order.notes.plan).trim().toLowerCase() : null;
    if (!orderPlan || !["pro", "team"].includes(orderPlan)) {
      return res.status(400).json({
        success: false,
        message: "Order is missing a valid plan in notes.",
      });
    }

    // Check optional client plan parameter against server-established order plan
    if (req.body?.plan !== undefined) {
      const clientPlan = String(req.body.plan).trim().toLowerCase();
      if (clientPlan !== orderPlan) {
        return res.status(400).json({
          success: false,
          message: `Plan mismatch. Order was created for ${orderPlan}, but verification requested ${clientPlan}.`,
        });
      }
    }

    // 4. Order Amount
    const expectedAmountPaise = PLAN_PRICING[orderPlan].amount;
    if (typeof order.amount !== "number" || order.amount !== expectedAmountPaise) {
      return res.status(400).json({
        success: false,
        message: `Order amount mismatch. Expected ${expectedAmountPaise} paise for ${orderPlan}, found ${order.amount}.`,
      });
    }

    // 5. Order Currency
    if (!order.currency || typeof order.currency !== "string" || order.currency !== "INR") {
      return res.status(400).json({
        success: false,
        message: "Invalid order currency. Only INR is supported.",
      });
    }

    // 6. Order Status
    if (!order.status || typeof order.status !== "string" || order.status !== "paid") {
      return res.status(400).json({
        success: false,
        message: `Order status '${order.status}' is not eligible for verification. Order must be paid.`,
      });
    }

    // Fetch payment from Razorpay
    let payment;
    try {
      payment = await rzp.payments.fetch(cleanPaymentId);
    } catch (payErr) {
      console.error("[verifyRazorpayPayment] Payment fetch error:", payErr);
      if (payErr.statusCode === 404 || payErr.error?.code === "BAD_REQUEST_ERROR") {
        return res.status(400).json({
          success: false,
          message: "Invalid or non-existent Razorpay payment ID.",
        });
      }
      return res.status(500).json({
        success: false,
        message: "Failed to verify payment details with payment provider. Please try again.",
      });
    }

    if (!payment || typeof payment !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid payment details received from payment provider.",
      });
    }

    // 1. Payment ID matching
    if (!payment.id || typeof payment.id !== "string" || payment.id !== cleanPaymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID mismatch or invalid payment ID from provider.",
      });
    }

    // 2. Payment order_id matching
    if (!payment.order_id || typeof payment.order_id !== "string" || payment.order_id !== cleanOrderId) {
      return res.status(400).json({
        success: false,
        message: "Payment does not belong to the requested order.",
      });
    }

    // 3. Payment Status (strictly 'captured')
    if (!payment.status || typeof payment.status !== "string" || payment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: `Payment status is '${payment.status}'. Only captured payments can be verified.`,
      });
    }

    // 4. Payment Amount matching
    if (typeof payment.amount !== "number" || payment.amount !== expectedAmountPaise) {
      return res.status(400).json({
        success: false,
        message: `Payment amount mismatch. Expected ${expectedAmountPaise} paise, found ${payment.amount}.`,
      });
    }

    // 5. Payment Currency
    if (!payment.currency || typeof payment.currency !== "string" || payment.currency !== "INR") {
      return res.status(400).json({
        success: false,
        message: "Invalid payment currency. Only INR is supported.",
      });
    }

    // Server-established plan and amount
    const targetPlan = orderPlan;
    const paymentAmount = targetPlan === "team" ? 999 : 499;
    const transactionId = cleanPaymentId;

    // Atomically upgrade user plan and log payment history ONLY IF this transaction hasn't been recorded yet
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        "paymentHistory.transactionId": { $ne: transactionId },
      },
      {
        $set: {
          plan: targetPlan,
          subscriptionDate: new Date(),
        },
        $push: {
          paymentHistory: {
            orderId: cleanOrderId,
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

    // If updatedUser is null, either the payment was already recorded (idempotent duplicate) or the user doesn't exist
    if (!updatedUser) {
      const existingUser = await User.findById(req.user._id).select("-password");
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // Idempotency: return existing verified transaction info
      const isAlreadyCredited = existingUser.paymentHistory?.some(
        (p) => p.transactionId === transactionId,
      );

      if (isAlreadyCredited) {
        return res.status(200).json({
          success: true,
          message: `Payment already verified for ${targetPlan === "team" ? "Team" : "Pro"}.`,
          user: existingUser,
          transaction: {
            transactionId,
            orderId: cleanOrderId,
            amount: paymentAmount,
            currency: "INR",
            date: new Date(),
            plan: targetPlan === "team" ? "Team" : "Pro",
          },
        });
      }

      // If user exists but transaction wasn't found and wasn't inserted, fail safely with 500
      return res.status(500).json({
        success: false,
        message: "Failed to record payment transaction. Please contact support.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Payment verified successfully! Welcome to ${targetPlan === "team" ? "Team" : "Pro"}! 🎉`,
      user: updatedUser,
      transaction: {
        transactionId,
        orderId: cleanOrderId,
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

  // Fail closed if webhook secret is unconfigured or a placeholder
  if (!webhookSecret || typeof webhookSecret !== "string" || webhookSecret.includes("placeholder")) {
    return res.status(503).json({
      success: false,
      message: "Razorpay webhook secret is not configured on server.",
    });
  }

  const signature = req.headers["x-razorpay-signature"];
  if (!signature || typeof signature !== "string" || !signature.trim()) {
    return res.status(400).send("Missing webhook signature header");
  }

  // Exact original request body bytes required; fail closed if unavailable or empty
  if (!req.rawBody || (!Buffer.isBuffer(req.rawBody) && typeof req.rawBody !== "string") || req.rawBody.length === 0) {
    return res.status(400).send("Missing or invalid raw request body for webhook verification");
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(req.rawBody)
    .digest("hex");

  const sigBuffer = Buffer.from(signature.trim(), "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return res.status(400).send("Invalid webhook signature");
  }

  const event = req.body?.event;
  if (event === "payment.captured" || event === "order.paid") {
    const payment = req.body?.payload?.payment?.entity;
    if (!payment || typeof payment !== "object") {
      console.warn("[Razorpay Webhook] Missing or invalid payment entity in payload");
      return res.status(400).json({ status: "error", message: "Missing payment entity in payload" });
    }

    const transactionId = payment.id;
    if (!transactionId || typeof transactionId !== "string" || !transactionId.trim()) {
      console.warn("[Razorpay Webhook] Missing or invalid transaction ID in payment entity");
      return res.status(400).json({ status: "error", message: "Missing transaction ID" });
    }

    const orderId = payment.order_id;
    if (!orderId || typeof orderId !== "string" || !orderId.trim()) {
      console.warn("[Razorpay Webhook] Missing or invalid order ID in payment entity");
      return res.status(400).json({ status: "error", message: "Missing order ID" });
    }

    const notes =
      payment.notes && typeof payment.notes === "object" && !Array.isArray(payment.notes)
        ? payment.notes
        : {};
    const rawPaymentUserId = notes.userId;
    const paymentUserId =
      typeof rawPaymentUserId === "string" && rawPaymentUserId.trim().length > 0
        ? rawPaymentUserId.trim()
        : null;

    const cleanTransactionId = transactionId.trim();
    const cleanOrderId = orderId.trim();

    const payloadOrder = req.body?.payload?.order?.entity;
    if (payloadOrder && typeof payloadOrder === "object") {
      if (payloadOrder.id && typeof payloadOrder.id === "string" && payloadOrder.id.trim() !== cleanOrderId) {
        console.warn(`[Razorpay Webhook] Order ID mismatch in payload: ${payloadOrder.id} vs ${cleanOrderId}`);
        return res.status(400).json({ status: "error", message: "Order ID mismatch in webhook payload" });
      }
    }

    if (!payment.status || payment.status !== "captured") {
      console.warn(`[Razorpay Webhook] Payment status is not captured: ${payment.status}`);
      return res.status(200).json({ status: "ignored", reason: "payment_not_captured" });
    }

    const currency = payment.currency;
    // Strictly validate currency without defaulting
    if (!currency || typeof currency !== "string" || currency !== "INR") {
      console.warn(`[Razorpay Webhook] Ignored payment with unsupported or missing currency: ${currency}`);
      return res.status(200).json({ status: "ignored", reason: "unsupported_currency" });
    }

    const paymentAmountPaise = payment.amount;
    if (typeof paymentAmountPaise !== "number") {
      console.warn("[Razorpay Webhook] Missing or non-numeric payment amount");
      return res.status(400).json({ status: "error", message: "Missing or invalid payment amount" });
    }

    // Determine plan strictly from exact configured amounts - NEVER default an unknown amount to Pro!
    let determinedPlan = null;
    if (paymentAmountPaise === PLAN_PRICING.pro.amount) {
      determinedPlan = "pro";
    } else if (paymentAmountPaise === PLAN_PRICING.team.amount) {
      determinedPlan = "team";
    } else {
      console.warn(
        `[Razorpay Webhook] Ignored payment with unrecognized amount: ${paymentAmountPaise} paise`,
      );
      return res.status(200).json({ status: "ignored", reason: "unknown_amount" });
    }

    // Ensure plan notes and payment amount cannot contradict each other
    const notesPlan = notes.plan ? String(notes.plan).trim().toLowerCase() : null;
    if (notesPlan && notesPlan !== determinedPlan) {
      console.warn(
        `[Razorpay Webhook] Plan note '${notesPlan}' contradicts payment amount ${paymentAmountPaise} paise`,
      );
      return res.status(200).json({ status: "ignored", reason: "plan_amount_mismatch" });
    }

    // Independently verify associated order via Razorpay API (do not rely on payment notes alone)
    const rzp = getRazorpayInstance();
    if (!rzp || !rzp.orders || typeof rzp.orders.fetch !== "function") {
      console.error("[Razorpay Webhook] Razorpay client or orders.fetch unavailable");
      return res.status(503).json({
        success: false,
        message: "Payment provider service is unavailable.",
      });
    }

    let order;
    try {
      order = await rzp.orders.fetch(cleanOrderId);
    } catch (orderErr) {
      console.error("[Razorpay Webhook] Order fetch error:", orderErr);
      if (orderErr.statusCode === 404 || orderErr.error?.code === "BAD_REQUEST_ERROR") {
        return res.status(400).json({
          status: "error",
          message: "Invalid or non-existent Razorpay order ID in webhook payload.",
        });
      }
      return res.status(500).json({
        status: "error",
        message: "Failed to verify order details with payment provider. Retryable error.",
      });
    }

    if (!order || typeof order !== "object") {
      return res.status(400).json({
        status: "error",
        message: "Invalid order details received from payment provider.",
      });
    }

    if (!order.id || typeof order.id !== "string" || order.id !== cleanOrderId) {
      return res.status(400).json({
        status: "error",
        message: "Order ID mismatch from provider.",
      });
    }

    const orderUserId = order.notes?.userId ? String(order.notes.userId).trim() : null;
    if (!orderUserId) {
      return res.status(400).json({
        status: "error",
        message: "Order is missing required user ownership information.",
      });
    }

    if (paymentUserId && paymentUserId !== orderUserId) {
      console.warn(
        `[Razorpay Webhook] Order userId '${orderUserId}' does not match payment userId '${paymentUserId}'`,
      );
      return res.status(200).json({
        status: "ignored",
        reason: "order_user_mismatch",
      });
    }

    const orderPlan = order.notes?.plan ? String(order.notes.plan).trim().toLowerCase() : null;
    if (!orderPlan || !["pro", "team"].includes(orderPlan) || orderPlan !== determinedPlan) {
      console.warn(
        `[Razorpay Webhook] Order plan '${orderPlan}' does not match determined plan '${determinedPlan}'`,
      );
      return res.status(200).json({
        status: "ignored",
        reason: "plan_amount_mismatch",
      });
    }

    const expectedAmountPaise = PLAN_PRICING[determinedPlan].amount;
    if (typeof order.amount !== "number" || order.amount !== expectedAmountPaise) {
      console.warn(
        `[Razorpay Webhook] Order amount ${order.amount} does not match expected amount ${expectedAmountPaise}`,
      );
      return res.status(200).json({
        status: "ignored",
        reason: "order_amount_mismatch",
      });
    }

    if (!order.currency || typeof order.currency !== "string" || order.currency !== "INR") {
      console.warn(`[Razorpay Webhook] Order currency is not INR: ${order.currency}`);
      return res.status(200).json({
        status: "ignored",
        reason: "unsupported_currency",
      });
    }

    if (!order.status || typeof order.status !== "string" || order.status !== "paid") {
      console.warn(`[Razorpay Webhook] Order status is not paid: ${order.status}`);
      return res.status(200).json({
        status: "ignored",
        reason: "order_not_paid",
      });
    }

    const targetPlan = determinedPlan;
    const paymentAmount = targetPlan === "team" ? 999 : 499;

    try {
      const updateResult = await User.findOneAndUpdate(
        {
          _id: orderUserId,
          "paymentHistory.transactionId": { $ne: cleanTransactionId },
        },
        {
          $set: {
            plan: targetPlan,
            subscriptionDate: new Date(),
          },
          $push: {
            paymentHistory: {
              orderId: cleanOrderId,
              plan: targetPlan,
              amount: paymentAmount,
              currency: "INR",
              paymentMethod: "Razorpay Webhook",
              transactionId: cleanTransactionId,
              status: "completed",
              date: new Date(),
            },
          },
        },
        { new: true },
      );

      if (!updateResult) {
        let existingUser;
        try {
          const userQuery = User.findById(orderUserId);
          existingUser =
            userQuery && typeof userQuery.select === "function"
              ? await userQuery.select("paymentHistory")
              : await userQuery;
        } catch (findErr) {
          console.error("[Razorpay Webhook] Database lookup error:", findErr);
          return res.status(500).json({
            success: false,
            message: "Database lookup failed during duplicate verification",
          });
        }

        if (!existingUser) {
          console.warn(`[Razorpay Webhook] User ${orderUserId} not found during payment fulfillment`);
          return res.status(500).json({
            success: false,
            message: "User not found during payment fulfillment. Retryable error.",
          });
        }

        const isDuplicate =
          Array.isArray(existingUser.paymentHistory) &&
          existingUser.paymentHistory.some((p) => p.transactionId === cleanTransactionId);

        if (isDuplicate) {
          console.log(
            `[Razorpay Webhook] Duplicate event confirmed for transaction ${cleanTransactionId}`,
          );
          return res.status(200).json({ status: "ok" });
        }

        console.error(
          `[Razorpay Webhook] User ${orderUserId} exists but transaction ${cleanTransactionId} was not recorded`,
        );
        return res.status(500).json({
          success: false,
          message: "Failed to record payment transaction in user history",
        });
      }

      console.log(
        `[Razorpay Webhook] Successfully upgraded user ${orderUserId} to ${targetPlan} (Tx: ${cleanTransactionId})`,
      );
    } catch (dbErr) {
      console.error("[Razorpay Webhook] Database update error:", dbErr);
      return res.status(500).json({
        success: false,
        message: "Database update failed during webhook processing",
      });
    }
  }

  return res.status(200).json({ status: "ok" });
};

export const handleStripeWebhook = handleRazorpayWebhook;
