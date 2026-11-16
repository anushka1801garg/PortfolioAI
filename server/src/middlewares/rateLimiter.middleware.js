import rateLimit from "express-rate-limit";

// Helper: Custom standardized handler for 429 responses
export const createRateLimitHandler = (message) => {
  return (req, res /*, next */) => {
    return res.status(429).json({
      success: false,
      message,
    });
  };
};

export const aiKeyGenerator = (req) => {
  return req.user?._id?.toString() || req.ip || "unknown-ip";
};

// 1. Global API Limiter: ~200 requests per 15 minutes
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "Too many requests from this IP. Please try again after 15 minutes."
  ),
  skip: (req) => {
    // Exclude payment webhook from the general client IP limiter so that
    // Razorpay webhook retries and concurrent events are not throttled.
    const url = req.originalUrl || req.url || req.path || "";
    if (url.includes("/payment/webhook")) {
      return true;
    }
    // Skip static assets or sitemap/robots if requested
    const path = req.path || "";
    return path.startsWith("/sitemap") || path.startsWith("/robots") || path === "/favicon.ico";
  },
});

// 2. Authentication Login Limiter: 5 attempts per 15 minutes per IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "Too many login attempts. For security reasons, please try again in 15 minutes."
  ),
});

// 3. Registration Limiter: 5 attempts per 15 minutes per IP
export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "Too many accounts created from this IP. Please try again after 15 minutes."
  ),
});

// 4. Conversational AI Chat Limiter: 60 messages per hour per IP/user (Copilot)
export const aiChatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    keyGeneratorIpFallback: false,
  },
  keyGenerator: aiKeyGenerator,
  handler: createRateLimitHandler(
    "Hourly AI chat message limit reached. Please try again in 1 hour."
  ),
});

// 5. Heavy AI Synthesis & Portfolio Generation Limiter: 10 requests per hour per IP/user
export const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    keyGeneratorIpFallback: false,
  },
  keyGenerator: aiKeyGenerator,
  handler: createRateLimitHandler(
    "Hourly AI generation limit reached. Please try again in 1 hour."
  ),
});

// 6. Payment Webhook Limiter: 1000 requests per 15 minutes per IP (dedicated pool for Razorpay webhooks)
export const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "Too many webhook requests from this IP. Please try again later."
  ),
});

// Backward compatibility alias for single aiLimiter import
export const aiLimiter = aiGenerationLimiter;