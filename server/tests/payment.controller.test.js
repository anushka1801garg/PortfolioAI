import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  getPaymentConfig,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
} from "../src/controllers/payment.controller.js";

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    jsonData: null,
    sentData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    },
    send(data) {
      this.sentData = data;
      return this;
    },
    header(k, v) {
      this.headers[k] = v;
      return this;
    },
  };
  return res;
}

describe("Payment Controller - Razorpay Integration & Verification", () => {
  test("getPaymentConfig returns valid status and configuration flag", async () => {
    const req = {};
    const res = createMockRes();
    await getPaymentConfig(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(typeof res.jsonData?.isConfigured, "boolean");
  });

  test("verifyRazorpayPayment rejects missing payment signature with 400", async () => {
    const req = {
      body: { razorpay_order_id: "order_123", razorpay_payment_id: "pay_123" },
      user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
    };
    const res = createMockRes();
    await verifyRazorpayPayment(req, res);

    assert.equal(res.statusCode, 400);
    assert.ok(res.jsonData?.message?.toLowerCase().includes("signature"));
  });

  test("verifyRazorpayPayment rejects tampered payment signature before DB lookup", async () => {
    process.env.RAZORPAY_KEY_SECRET = "mock_secret_key_for_testing";
    const req = {
      body: {
        razorpay_order_id: "order_test_999",
        razorpay_payment_id: "pay_test_999",
        razorpay_signature: "invalid_tampered_signature_hex",
      },
      user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
    };
    const res = createMockRes();
    await verifyRazorpayPayment(req, res);

    assert.equal(res.statusCode, 400);
    assert.ok(res.jsonData?.message?.includes("Invalid payment signature"));
  });

  test("handleRazorpayWebhook rejects missing signature header when secret is configured", async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = "mock_webhook_secret_for_testing";
    const req = {
      headers: {},
      rawBody: Buffer.from(JSON.stringify({ event: "payment.captured" })),
    };
    const res = createMockRes();
    await handleRazorpayWebhook(req, res);

    assert.equal(res.statusCode, 400);
  });
});

