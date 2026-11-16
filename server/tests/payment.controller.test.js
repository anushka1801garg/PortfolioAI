import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import User from "../src/models/user.model.js";
import {
  getPaymentConfig,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  setRazorpayClientFactory,
  resetRazorpayClientFactory,
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

function mockRazorpayClient({
  orderId = undefined,
  paymentId = undefined,
  paymentOrderId = undefined,
  userId = "507f1f77bcf86cd799439011",
  plan = "pro",
  orderAmount = 49900,
  paymentAmount = 49900,
  orderStatus = "paid",
  paymentStatus = "captured",
  orderCurrency = "INR",
  paymentCurrency = "INR",
  orderFetchError = null,
  paymentFetchError = null,
  missingOrdersApi = false,
  missingPaymentsApi = false,
  orderNotes = undefined,
  paymentNotes = undefined,
  orderOverride = null,
  paymentOverride = null,
} = {}) {
  const client = {};
  let lastFetchedOrderId = null;

  if (!missingOrdersApi) {
    client.orders = {
      fetch: async (id) => {
        lastFetchedOrderId = id;
        if (orderFetchError) throw orderFetchError;
        if (orderOverride) return orderOverride;
        return {
          id: orderId !== undefined ? orderId : id,
          amount: orderAmount,
          currency: orderCurrency,
          status: orderStatus,
          notes: orderNotes !== undefined ? orderNotes : { userId, plan },
        };
      },
    };
  }

  if (!missingPaymentsApi) {
    client.payments = {
      fetch: async (id) => {
        if (paymentFetchError) throw paymentFetchError;
        if (paymentOverride) return paymentOverride;
        return {
          id: paymentId !== undefined ? paymentId : id,
          order_id:
            paymentOrderId !== undefined
              ? paymentOrderId
              : orderId !== undefined
              ? orderId
              : lastFetchedOrderId || "order_valid_001",
          amount: paymentAmount,
          currency: paymentCurrency,
          status: paymentStatus,
          notes: paymentNotes !== undefined ? paymentNotes : { userId, plan },
        };
      },
    };
  }

  setRazorpayClientFactory(() => client);
  return client;
}

describe("Payment Controller - Razorpay Integration & Verification", () => {
  const originalKeySecret = process.env.RAZORPAY_KEY_SECRET;
  const originalWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  afterEach(() => {
    process.env.RAZORPAY_KEY_SECRET = originalKeySecret;
    process.env.RAZORPAY_WEBHOOK_SECRET = originalWebhookSecret;
    resetRazorpayClientFactory();
  });

  test("getPaymentConfig returns valid status and configuration flag", async () => {
    const req = {};
    const res = createMockRes();
    await getPaymentConfig(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(typeof res.jsonData?.isConfigured, "boolean");
  });

  test("verifyRazorpayPayment rejects missing secret key with 503", async () => {
    delete process.env.RAZORPAY_KEY_SECRET;
    const req = {
      body: {
        razorpay_order_id: "order_123",
        razorpay_payment_id: "pay_123",
        razorpay_signature: "sig_123",
      },
      user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
    };
    const res = createMockRes();
    await verifyRazorpayPayment(req, res);

    assert.equal(res.statusCode, 503);
    assert.equal(res.jsonData?.notConfigured, true);
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

  test("verifyRazorpayPayment safely handles signature with mismatched byte length", async () => {
    process.env.RAZORPAY_KEY_SECRET = "mock_secret_key_for_testing";
    const req = {
      body: {
        razorpay_order_id: "order_test_999",
        razorpay_payment_id: "pay_test_999",
        razorpay_signature: "short",
      },
      user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
    };
    const res = createMockRes();
    // Must reject with 400 and not crash with timingSafeEqual RangeError
    await verifyRazorpayPayment(req, res);

    assert.equal(res.statusCode, 400);
  });

  test("verifyRazorpayPayment rejects non-string and empty payment signatures with 400", async () => {
    process.env.RAZORPAY_KEY_SECRET = "mock_secret_key_for_testing";
    const invalidSignatures = [
      "",
      "   ",
      12345,
      {},
      [],
      true,
      null,
      undefined,
    ];

    for (const invalidSig of invalidSignatures) {
      const req = {
        body: {
          razorpay_order_id: "order_123",
          razorpay_payment_id: "pay_123",
          razorpay_signature: invalidSig,
        },
        user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
      };
      const res = createMockRes();
      await verifyRazorpayPayment(req, res);

      assert.equal(
        res.statusCode,
        400,
        `Expected 400 for signature: ${JSON.stringify(invalidSig)}`
      );
      assert.ok(res.jsonData?.message?.includes("required non-empty strings"));
    }
  });

  test("verifyRazorpayPayment rejects non-string or empty order/payment IDs with 400", async () => {
    process.env.RAZORPAY_KEY_SECRET = "mock_secret_key_for_testing";
    const invalidCases = [
      { order_id: "", payment_id: "pay_123", sig: "sig_123" },
      { order_id: "   ", payment_id: "pay_123", sig: "sig_123" },
      { order_id: 1234, payment_id: "pay_123", sig: "sig_123" },
      { order_id: "order_123", payment_id: "", sig: "sig_123" },
      { order_id: "order_123", payment_id: "   ", sig: "sig_123" },
      { order_id: "order_123", payment_id: {}, sig: "sig_123" },
    ];

    for (const c of invalidCases) {
      const req = {
        body: {
          razorpay_order_id: c.order_id,
          razorpay_payment_id: c.payment_id,
          razorpay_signature: c.sig,
        },
        user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
      };
      const res = createMockRes();
      await verifyRazorpayPayment(req, res);

      assert.equal(res.statusCode, 400);
      assert.ok(res.jsonData?.message?.includes("required non-empty strings"));
    }
  });

  test("verifyRazorpayPayment verifies authentic signature and updates user atomically", async () => {
    const testSecret = "mock_secret_key_for_testing";
    process.env.RAZORPAY_KEY_SECRET = testSecret;

    const orderId = "order_valid_001";
    const paymentId = "pay_valid_001";
    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    mockRazorpayClient({
      orderId,
      paymentId,
      userId: "507f1f77bcf86cd799439011",
      plan: "pro",
      orderAmount: 49900,
      paymentAmount: 49900,
      orderStatus: "paid",
      paymentStatus: "captured",
    });

    let atomicFilter = null;
    let atomicUpdate = null;
    const originalFindOneAndUpdate = User.findOneAndUpdate;

    User.findOneAndUpdate = (filter, update, options) => {
      atomicFilter = filter;
      atomicUpdate = update;
      const mockUpdatedUser = {
        _id: filter._id,
        plan: "pro",
        paymentHistory: [
          {
            orderId,
            transactionId: paymentId,
            amount: 499,
            currency: "INR",
            plan: "Pro",
          },
        ],
      };
      return {
        select: (fields) => Promise.resolve(mockUpdatedUser),
      };
    };

    try {
      const req = {
        body: {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
          plan: "pro",
        },
        user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
      };
      const res = createMockRes();
      await verifyRazorpayPayment(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.jsonData?.success, true);
      assert.equal(res.jsonData?.transaction?.transactionId, paymentId);
      assert.equal(atomicFilter["paymentHistory.transactionId"].$ne, paymentId);
      assert.equal(atomicUpdate.$set.plan, "pro");
    } finally {
      User.findOneAndUpdate = originalFindOneAndUpdate;
    }
  });

  test("verifyRazorpayPayment handles already-verified payment idempotently without duplicate records", async () => {
    const testSecret = "mock_secret_key_for_testing";
    process.env.RAZORPAY_KEY_SECRET = testSecret;

    const orderId = "order_dup_001";
    const paymentId = "pay_dup_001";
    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    mockRazorpayClient({
      orderId,
      paymentId,
      userId: "507f1f77bcf86cd799439011",
      plan: "pro",
      orderAmount: 49900,
      paymentAmount: 49900,
      orderStatus: "paid",
      paymentStatus: "captured",
    });

    const existingUser = {
      _id: "507f1f77bcf86cd799439011",
      email: "test@example.com",
      plan: "pro",
      paymentHistory: [
        {
          orderId,
          transactionId: paymentId,
          amount: 499,
          currency: "INR",
          plan: "Pro",
        },
      ],
    };

    const originalFindOneAndUpdate = User.findOneAndUpdate;
    const originalFindById = User.findById;

    User.findOneAndUpdate = () => ({
      select: () => Promise.resolve(null),
    });

    User.findById = () => ({
      select: () => Promise.resolve(existingUser),
    });

    try {
      const req = {
        body: {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
          plan: "pro",
        },
        user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
      };
      const res = createMockRes();
      await verifyRazorpayPayment(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.jsonData?.success, true);
      assert.ok(res.jsonData?.message?.includes("already verified"));
      assert.equal(res.jsonData?.transaction?.transactionId, paymentId);
    } finally {
      User.findOneAndUpdate = originalFindOneAndUpdate;
      User.findById = originalFindById;
    }
  });

  test("verifyRazorpayPayment returns HTTP 500 when update fails and transaction is not recorded", async () => {
    const testSecret = "mock_secret_key_for_testing";
    process.env.RAZORPAY_KEY_SECRET = testSecret;

    const orderId = "order_fallback_001";
    const paymentId = "pay_fallback_001";
    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    mockRazorpayClient({
      orderId,
      paymentId,
      userId: "507f1f77bcf86cd799439011",
      plan: "pro",
      orderAmount: 49900,
      paymentAmount: 49900,
      orderStatus: "paid",
      paymentStatus: "captured",
    });

    const existingUserWithoutTx = {
      _id: "507f1f77bcf86cd799439011",
      email: "test@example.com",
      plan: "free",
      paymentHistory: [], // Transaction was NOT recorded!
    };

    const originalFindOneAndUpdate = User.findOneAndUpdate;
    const originalFindById = User.findById;

    // Simulate findOneAndUpdate returning null unexpectedly
    User.findOneAndUpdate = () => ({
      select: () => Promise.resolve(null),
    });

    // User exists in DB, but transactionId is NOT in paymentHistory
    User.findById = () => ({
      select: () => Promise.resolve(existingUserWithoutTx),
    });

    try {
      const req = {
        body: {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
          plan: "pro",
        },
        user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
      };
      const res = createMockRes();
      await verifyRazorpayPayment(req, res);

      // Must fail closed with HTTP 500 and NOT return 200 or user: null
      assert.equal(res.statusCode, 500);
      assert.equal(res.jsonData?.success, false);
      assert.ok(res.jsonData?.message?.includes("Failed to record payment transaction"));
      assert.notEqual(res.jsonData?.user, null);
    } finally {
      User.findOneAndUpdate = originalFindOneAndUpdate;
      User.findById = originalFindById;
    }
  });

  test("verifyRazorpayPayment returns HTTP 404 when user is not found in database fallback", async () => {
    const testSecret = "mock_secret_key_for_testing";
    process.env.RAZORPAY_KEY_SECRET = testSecret;

    const orderId = "order_notfound_001";
    const paymentId = "pay_notfound_001";
    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    mockRazorpayClient({
      orderId,
      paymentId,
      userId: "507f1f77bcf86cd799439011",
      plan: "pro",
      orderAmount: 49900,
      paymentAmount: 49900,
      orderStatus: "paid",
      paymentStatus: "captured",
    });

    const originalFindOneAndUpdate = User.findOneAndUpdate;
    const originalFindById = User.findById;

    User.findOneAndUpdate = () => ({
      select: () => Promise.resolve(null),
    });

    // User not found in DB
    User.findById = () => ({
      select: () => Promise.resolve(null),
    });

    try {
      const req = {
        body: {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
          plan: "pro",
        },
        user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
      };
      const res = createMockRes();
      await verifyRazorpayPayment(req, res);

      assert.equal(res.statusCode, 404);
      assert.equal(res.jsonData?.success, false);
      assert.ok(res.jsonData?.message?.includes("User not found"));
    } finally {
      User.findOneAndUpdate = originalFindOneAndUpdate;
      User.findById = originalFindById;
    }
  });

  test("verifyRazorpayPayment safely handles concurrent and repeated verification requests idempotently", async () => {
    const testSecret = "mock_secret_key_for_testing";
    process.env.RAZORPAY_KEY_SECRET = testSecret;

    const orderId = "order_concurrent_001";
    const paymentId = "pay_concurrent_001";
    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    mockRazorpayClient({
      orderId,
      paymentId,
      userId: "507f1f77bcf86cd799439011",
      plan: "pro",
      orderAmount: 49900,
      paymentAmount: 49900,
      orderStatus: "paid",
      paymentStatus: "captured",
    });

    // Stateful in-memory representation of user document in MongoDB
    const statefulUser = {
      _id: "507f1f77bcf86cd799439011",
      email: "test@example.com",
      plan: "free",
      paymentHistory: [],
    };

    const originalFindOneAndUpdate = User.findOneAndUpdate;
    const originalFindById = User.findById;

    // Simulate MongoDB's atomic document-level locking across asynchronous ticks
    let mongoDocumentLock = Promise.resolve();

    User.findOneAndUpdate = (filter, update, options) => {
      return {
        select: (projection) => {
          const executeAtomicUpdate = async () => {
            // Simulate asynchronous I/O latency
            await new Promise((resolve) => setImmediate(resolve));

            const isMatchingUser = String(filter._id) === String(statefulUser._id);
            const neTransactionId = filter["paymentHistory.transactionId"]?.$ne;
            const alreadyHasTransaction = statefulUser.paymentHistory.some(
              (entry) => entry.transactionId === neTransactionId,
            );

            // Atomic condition check: user must match and transactionId must NOT exist
            if (isMatchingUser && !alreadyHasTransaction) {
              if (update.$set?.plan) {
                statefulUser.plan = update.$set.plan;
              }
              if (update.$push?.paymentHistory) {
                statefulUser.paymentHistory.push(update.$push.paymentHistory);
              }
              return JSON.parse(JSON.stringify(statefulUser));
            }

            // Condition failed: document not found or transaction already recorded
            return null;
          };

          const operationPromise = mongoDocumentLock.then(executeAtomicUpdate);
          mongoDocumentLock = operationPromise.catch(() => {});
          return operationPromise;
        },
      };
    };

    User.findById = (id) => ({
      select: (projection) => {
        const executeFind = async () => {
          await new Promise((resolve) => setImmediate(resolve));
          if (String(id) === String(statefulUser._id)) {
            return JSON.parse(JSON.stringify(statefulUser));
          }
          return null;
        };
        return mongoDocumentLock.then(executeFind);
      },
    });

    try {
      // Simulate 5 simultaneous/concurrent verification requests with identical valid signature & paymentId
      const concurrentRequests = Array.from({ length: 5 }, () => ({
        req: {
          body: {
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: validSignature,
            plan: "pro",
          },
          user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
        },
        res: createMockRes(),
      }));

      // Fire all 5 requests concurrently
      await Promise.all(
        concurrentRequests.map(({ req, res }) => verifyRazorpayPayment(req, res)),
      );

      // Verify all 5 requests received HTTP 200 success
      for (const { res } of concurrentRequests) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.jsonData?.success, true);
        assert.equal(res.jsonData?.transaction?.transactionId, paymentId);
      }

      // Exactly ONE request must be the first-time upgrade
      const firstTimeResponses = concurrentRequests.filter(({ res }) =>
        res.jsonData?.message?.includes("Payment verified successfully"),
      );
      assert.equal(firstTimeResponses.length, 1, "Exactly one concurrent request should perform the initial upgrade");

      // The other 4 requests must receive the idempotent 'already verified' response
      const idempotentResponses = concurrentRequests.filter(({ res }) =>
        res.jsonData?.message?.includes("already verified"),
      );
      assert.equal(idempotentResponses.length, 4, "All duplicate concurrent requests must be handled idempotently");

      // Verify database state: exactly ONE payment history record created, plan upgraded to pro
      assert.equal(statefulUser.paymentHistory.length, 1, "Must have exactly 1 record in paymentHistory, no duplicates");
      assert.equal(statefulUser.plan, "pro");

      // Verify repeated/subsequent sequential request is also handled idempotently
      const sequentialRes = createMockRes();
      await verifyRazorpayPayment(concurrentRequests[0].req, sequentialRes);
      assert.equal(sequentialRes.statusCode, 200);
      assert.equal(sequentialRes.jsonData?.success, true);
      assert.ok(sequentialRes.jsonData?.message?.includes("already verified"));
      assert.equal(statefulUser.paymentHistory.length, 1, "Payment history count must remain 1 after repeated request");
    } finally {
      User.findOneAndUpdate = originalFindOneAndUpdate;
      User.findById = originalFindById;
    }
  });

  test("createRazorpayOrder rejects invalid plan with 400", async () => {
    const invalidPlans = ["invalid", "enterprise", "free", 123, null];
    for (const plan of invalidPlans) {
      const req = {
        body: { plan },
        user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
      };
      const res = createMockRes();
      const originalFindById = User.findById;
      User.findById = async () => ({
        _id: "507f1f77bcf86cd799439011",
        email: "test@example.com",
      });

      try {
        await createRazorpayOrder(req, res);
        assert.equal(res.statusCode, 400);
        assert.ok(res.jsonData?.message?.includes("Invalid plan specified"));
      } finally {
        User.findById = originalFindById;
      }
    }
  });

  test("verifyRazorpayPayment rejects invalid plan parameter with 400", async () => {
    process.env.RAZORPAY_KEY_SECRET = "mock_secret_key_for_testing";
    const invalidPlans = ["invalid", "free", "enterprise", 123, {}, []];

    for (const invalidPlan of invalidPlans) {
      const req = {
        body: {
          razorpay_order_id: "order_123",
          razorpay_payment_id: "pay_123",
          razorpay_signature: "sig_123",
          plan: invalidPlan,
        },
        user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
      };
      const res = createMockRes();
      await verifyRazorpayPayment(req, res);

      assert.equal(res.statusCode, 400);
      assert.ok(res.jsonData?.message?.includes("Invalid plan specified"));
    }
  });

  test("verifyRazorpayPayment blocks client plan manipulation when Razorpay order specifies different plan", async () => {
    const testSecret = "mock_secret_key_for_testing";
    process.env.RAZORPAY_KEY_SECRET = testSecret;

    const orderId = "order_pro_001";
    const paymentId = "pay_pro_001";
    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    // Mock Razorpay instance returning an order created for Pro (49900 paise)
    mockRazorpayClient({
      orderId,
      paymentId,
      userId: "507f1f77bcf86cd799439011",
      plan: "pro",
      orderAmount: 49900,
    });

    // Malicious client attempts to verify as "team" plan (₹999) using a "pro" order (₹499)
    const req = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
        plan: "team",
      },
      user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
    };
    const res = createMockRes();
    await verifyRazorpayPayment(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonData?.success, false);
    assert.ok(
      res.jsonData?.message?.includes("Order amount mismatch") ||
      res.jsonData?.message?.includes("Plan mismatch")
    );
  });

  test("verifyRazorpayPayment blocks order belonging to a different user with 403", async () => {
    const testSecret = "mock_secret_key_for_testing";
    process.env.RAZORPAY_KEY_SECRET = testSecret;

    const orderId = "order_user_a_001";
    const paymentId = "pay_user_a_001";
    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    // Mock Razorpay instance returning an order owned by User A
    mockRazorpayClient({
      orderId,
      paymentId,
      userId: "user_a_660e8400ece9b",
      plan: "pro",
    });

    // User B attempts to verify User A's order
    const req = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
        plan: "pro",
      },
      user: { _id: "507f1f77bcf86cd799439011", email: "user_b@example.com" },
    };
    const res = createMockRes();
    await verifyRazorpayPayment(req, res);

    assert.equal(res.statusCode, 403);
    assert.equal(res.jsonData?.success, false);
    assert.ok(res.jsonData?.message?.includes("does not belong to the authenticated user"));
  });

  test("verifyRazorpayPayment blocks order amount mismatch with 400", async () => {
    const testSecret = "mock_secret_key_for_testing";
    process.env.RAZORPAY_KEY_SECRET = testSecret;

    const orderId = "order_tampered_amount_001";
    const paymentId = "pay_tampered_amount_001";
    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    // Mock order with an invalid amount (e.g. ₹1 = 100 paise)
    mockRazorpayClient({
      orderId,
      paymentId,
      userId: "507f1f77bcf86cd799439011",
      plan: "pro",
      orderAmount: 100, // ₹1
    });

    const req = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
        plan: "pro",
      },
      user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
    };
    const res = createMockRes();
    await verifyRazorpayPayment(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonData?.success, false);
    assert.ok(res.jsonData?.message?.includes("Order amount mismatch"));
  });

  test("verifyRazorpayPayment blocks non-existent or invalid Razorpay order ID with 400", async () => {
    const testSecret = "mock_secret_key_for_testing";
    process.env.RAZORPAY_KEY_SECRET = testSecret;

    const orderId = "order_non_existent";
    const paymentId = "pay_non_existent";
    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const notFoundError = new Error("Order not found");
    notFoundError.statusCode = 404;
    mockRazorpayClient({
      orderId,
      paymentId,
      orderFetchError: notFoundError,
    });

    const req = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
        plan: "pro",
      },
      user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
    };
    const res = createMockRes();
    await verifyRazorpayPayment(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonData?.success, false);
    assert.ok(res.jsonData?.message?.includes("Invalid or non-existent Razorpay order ID"));
  });

  test("verifyRazorpayPayment successfully verifies and upgrades using independently established order details", async () => {
    const testSecret = "mock_secret_key_for_testing";
    process.env.RAZORPAY_KEY_SECRET = testSecret;

    const orderId = "order_verified_team_001";
    const paymentId = "pay_verified_team_001";
    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    mockRazorpayClient({
      orderId,
      paymentId,
      userId: "507f1f77bcf86cd799439011",
      plan: "team",
      orderAmount: 99900,
      paymentAmount: 99900,
      orderStatus: "paid",
      paymentStatus: "captured",
    });

    const originalFindOneAndUpdate = User.findOneAndUpdate;
    let recordedPlan = null;
    let recordedAmount = null;
    let recordedOrderId = null;

    User.findOneAndUpdate = (filter, update) => {
      recordedPlan = update.$set.plan;
      recordedAmount = update.$push.paymentHistory.amount;
      recordedOrderId = update.$push.paymentHistory.orderId;
      return {
        select: () => Promise.resolve({
          _id: filter._id,
          plan: recordedPlan,
          paymentHistory: [update.$push.paymentHistory],
        }),
      };
    };

    try {
      const req = {
        body: {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
          plan: "team",
        },
        user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
      };
      const res = createMockRes();
      await verifyRazorpayPayment(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.jsonData?.success, true);
      assert.equal(recordedPlan, "team");
      assert.equal(recordedAmount, 999);
      assert.equal(recordedOrderId, orderId);
      assert.ok(res.jsonData?.message?.includes("Welcome to Team"));
    } finally {
      User.findOneAndUpdate = originalFindOneAndUpdate;
    }
  });

  test("verifyRazorpayPayment blocks payment entity not belonging to order with 400", async () => {
    const testSecret = "mock_secret_key_for_testing";
    process.env.RAZORPAY_KEY_SECRET = testSecret;

    const orderId = "order_target_001";
    const paymentId = "pay_mismatched_order_001";
    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    mockRazorpayClient({
      orderId,
      paymentId,
      paymentOrderId: "order_different_999", // Belongs to an entirely different order!
      userId: "507f1f77bcf86cd799439011",
      plan: "pro",
      orderStatus: "paid",
      paymentStatus: "captured",
    });

    const req = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
        plan: "pro",
      },
      user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
    };
    const res = createMockRes();
    await verifyRazorpayPayment(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonData?.success, false);
    assert.ok(res.jsonData?.message?.includes("Payment does not belong to the"));
  });

  test("verifyRazorpayPayment blocks uncaptured or failed payment with 400", async () => {
    const testSecret = "mock_secret_key_for_testing";
    process.env.RAZORPAY_KEY_SECRET = testSecret;

    const orderId = "order_uncaptured_001";
    const paymentId = "pay_failed_001";
    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    mockRazorpayClient({
      orderId,
      paymentId,
      paymentStatus: "failed", // Payment failed / not captured!
      userId: "507f1f77bcf86cd799439011",
      plan: "pro",
      orderStatus: "paid",
    });

    const req = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
        plan: "pro",
      },
      user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
    };
    const res = createMockRes();
    await verifyRazorpayPayment(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonData?.success, false);
    assert.ok(res.jsonData?.message?.includes("Only captured payments can be verified"));
  });

  test("verifyRazorpayPayment blocks payment amount mismatch with 400", async () => {
    const testSecret = "mock_secret_key_for_testing";
    process.env.RAZORPAY_KEY_SECRET = testSecret;

    const orderId = "order_mismatch_001";
    const paymentId = "pay_mismatch_amount_001";
    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    mockRazorpayClient({
      orderId,
      paymentId,
      paymentAmount: 1000, // ₹10 instead of ₹499
      userId: "507f1f77bcf86cd799439011",
      plan: "pro",
      orderStatus: "paid",
      paymentStatus: "captured",
    });

    const req = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
        plan: "pro",
      },
      user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
    };
    const res = createMockRes();
    await verifyRazorpayPayment(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonData?.success, false);
    assert.ok(res.jsonData?.message?.includes("Payment amount mismatch"));
  });

  test("verifyRazorpayPayment blocks unsupported order currency with 400", async () => {
    const testSecret = "mock_secret_key_for_testing";
    process.env.RAZORPAY_KEY_SECRET = testSecret;

    const orderId = "order_usd_001";
    const paymentId = "pay_usd_001";
    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    mockRazorpayClient({
      orderId,
      paymentId,
      orderCurrency: "USD", // Unsupported currency
      userId: "507f1f77bcf86cd799439011",
      plan: "pro",
      orderStatus: "paid",
    });

    const req = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
        plan: "pro",
      },
      user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
    };
    const res = createMockRes();
    await verifyRazorpayPayment(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonData?.success, false);
    assert.ok(res.jsonData?.message?.includes("Invalid order currency"));
  });

  test("verifyRazorpayPayment fails closed with 503 when Razorpay client factory returns null", async () => {
    process.env.RAZORPAY_KEY_SECRET = "mock_secret_key_for_testing";
    setRazorpayClientFactory(() => null);

    const orderId = "order_rzp_null";
    const paymentId = "pay_rzp_null";
    const validSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const req = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
      },
      user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
    };
    const res = createMockRes();
    await verifyRazorpayPayment(req, res);

    assert.equal(res.statusCode, 503);
    assert.equal(res.jsonData?.notConfigured, true);
    assert.ok(res.jsonData?.message?.includes("Razorpay client is not configured"));
  });

  test("verifyRazorpayPayment fails closed with 500 when rzp.orders.fetch is missing", async () => {
    process.env.RAZORPAY_KEY_SECRET = "mock_secret_key_for_testing";
    mockRazorpayClient({ missingOrdersApi: true });

    const orderId = "order_no_orders_api";
    const paymentId = "pay_no_orders_api";
    const validSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const req = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
      },
      user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
    };
    const res = createMockRes();
    await verifyRazorpayPayment(req, res);

    assert.equal(res.statusCode, 500);
    assert.ok(res.jsonData?.message?.includes("provider verification API is unavailable"));
  });

  test("verifyRazorpayPayment fails closed with 500 when rzp.payments.fetch is missing", async () => {
    process.env.RAZORPAY_KEY_SECRET = "mock_secret_key_for_testing";
    mockRazorpayClient({ missingPaymentsApi: true });

    const orderId = "order_no_payments_api";
    const paymentId = "pay_no_payments_api";
    const validSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const req = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
      },
      user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
    };
    const res = createMockRes();
    await verifyRazorpayPayment(req, res);

    assert.equal(res.statusCode, 500);
    assert.ok(res.jsonData?.message?.includes("provider verification API is unavailable"));
  });

  test("verifyRazorpayPayment fails closed with 500 when orders.fetch throws unexpected error", async () => {
    process.env.RAZORPAY_KEY_SECRET = "mock_secret_key_for_testing";
    mockRazorpayClient({ orderFetchError: new Error("Network timeout or gateway error") });

    const orderId = "order_err_500";
    const paymentId = "pay_err_500";
    const validSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const req = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
      },
      user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
    };
    const res = createMockRes();
    await verifyRazorpayPayment(req, res);

    assert.equal(res.statusCode, 500);
    assert.ok(res.jsonData?.message?.includes("Failed to verify order details"));
  });

  test("verifyRazorpayPayment fails closed with 500 when payments.fetch throws unexpected error", async () => {
    process.env.RAZORPAY_KEY_SECRET = "mock_secret_key_for_testing";

    const orderId = "order_payerr_500";
    const paymentId = "pay_payerr_500";
    mockRazorpayClient({
      orderId,
      paymentId,
      userId: "507f1f77bcf86cd799439011",
      plan: "pro",
      orderStatus: "paid",
      paymentFetchError: new Error("Razorpay payments gateway 502"),
    });

    const validSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const req = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
      },
      user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
    };
    const res = createMockRes();
    await verifyRazorpayPayment(req, res);

    assert.equal(res.statusCode, 500);
    assert.ok(res.jsonData?.message?.includes("Failed to verify payment details"));
  });

  test("verifyRazorpayPayment blocks when order is missing notes.userId or notes.plan", async () => {
    process.env.RAZORPAY_KEY_SECRET = "mock_secret_key_for_testing";
    const orderId = "order_bad_notes";
    const paymentId = "pay_bad_notes";
    const validSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    // Case 1: missing userId in order notes
    mockRazorpayClient({
      orderId,
      paymentId,
      orderNotes: { plan: "pro" }, // missing userId
    });
    const req1 = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
      },
      user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
    };
    const res1 = createMockRes();
    await verifyRazorpayPayment(req1, res1);
    assert.equal(res1.statusCode, 400);
    assert.ok(res1.jsonData?.message?.includes("missing required user ownership"));

    // Case 2: missing plan in order notes
    mockRazorpayClient({
      orderId,
      paymentId,
      orderNotes: { userId: "507f1f77bcf86cd799439011" }, // missing plan
    });
    const res2 = createMockRes();
    await verifyRazorpayPayment(req1, res2);
    assert.equal(res2.statusCode, 400);
    assert.ok(res2.jsonData?.message?.includes("missing a valid plan in notes"));
  });

  test("verifyRazorpayPayment blocks invalid order status (e.g. created, expired)", async () => {
    process.env.RAZORPAY_KEY_SECRET = "mock_secret_key_for_testing";
    const orderId = "order_created_status";
    const paymentId = "pay_created_status";
    const validSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    mockRazorpayClient({
      orderId,
      paymentId,
      orderStatus: "created", // not completed/paid
    });

    const req = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
      },
      user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
    };
    const res = createMockRes();
    await verifyRazorpayPayment(req, res);

    assert.equal(res.statusCode, 400);
    assert.ok(res.jsonData?.message?.includes("is not eligible for verification"));
  });

  test("verifyRazorpayPayment rejects order status 'attempted' with HTTP 400 and never updates user", async () => {
    process.env.RAZORPAY_KEY_SECRET = "mock_secret_key_for_testing";
    const orderId = "order_attempted_status";
    const paymentId = "pay_attempted_status";
    const validSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    mockRazorpayClient({
      orderId,
      paymentId,
      orderStatus: "attempted",
    });

    let dbUpdated = false;
    const originalFindOneAndUpdate = User.findOneAndUpdate;
    User.findOneAndUpdate = async () => {
      dbUpdated = true;
      return null;
    };

    try {
      const req = {
        body: {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
        },
        user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
      };
      const res = createMockRes();
      await verifyRazorpayPayment(req, res);

      assert.equal(res.statusCode, 400);
      assert.equal(res.jsonData?.success, false);
      assert.ok(res.jsonData?.message?.includes("Order must be paid"));
      assert.equal(dbUpdated, false, "Database update must never be called for non-paid order");
    } finally {
      User.findOneAndUpdate = originalFindOneAndUpdate;
    }
  });

  test("verifyRazorpayPayment strictly rejects 'authorized' payment status as equivalent to captured", async () => {
    process.env.RAZORPAY_KEY_SECRET = "mock_secret_key_for_testing";
    const orderId = "order_auth_status";
    const paymentId = "pay_auth_status";
    const validSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    mockRazorpayClient({
      orderId,
      paymentId,
      paymentStatus: "authorized", // 'authorized' is NOT captured!
    });

    const req = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
      },
      user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
    };
    const res = createMockRes();
    await verifyRazorpayPayment(req, res);

    assert.equal(res.statusCode, 400);
    assert.ok(res.jsonData?.message?.includes("Only captured payments can be verified"));
  });

  test("verifyRazorpayPayment blocks unsupported payment currency with 400", async () => {
    process.env.RAZORPAY_KEY_SECRET = "mock_secret_key_for_testing";
    const orderId = "order_curr_mismatch";
    const paymentId = "pay_curr_mismatch";
    const validSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    mockRazorpayClient({
      orderId,
      paymentId,
      paymentCurrency: "EUR",
    });

    const req = {
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
      },
      user: { _id: "507f1f77bcf86cd799439011", email: "test@example.com" },
    };
    const res = createMockRes();
    await verifyRazorpayPayment(req, res);

    assert.equal(res.statusCode, 400);
    assert.ok(res.jsonData?.message?.includes("Invalid payment currency"));
  });
});

describe("Payment Controller - Razorpay Webhook Security", () => {
  const originalWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  beforeEach(() => {
    mockRazorpayClient();
  });

  afterEach(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = originalWebhookSecret;
    resetRazorpayClientFactory();
  });

  test("handleRazorpayWebhook fails closed with 503 when secret is missing", async () => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    const req = {
      headers: { "x-razorpay-signature": "some_sig" },
      rawBody: Buffer.from(JSON.stringify({ event: "payment.captured" })),
    };
    const res = createMockRes();
    await handleRazorpayWebhook(req, res);

    assert.equal(res.statusCode, 503);
    assert.equal(res.jsonData?.success, false);
  });

  test("handleRazorpayWebhook fails closed with 503 when secret is a placeholder", async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = "placeholder_webhook_secret_here";
    const req = {
      headers: { "x-razorpay-signature": "some_sig" },
      rawBody: Buffer.from(JSON.stringify({ event: "payment.captured" })),
    };
    const res = createMockRes();
    await handleRazorpayWebhook(req, res);

    assert.equal(res.statusCode, 503);
    assert.equal(res.jsonData?.success, false);
  });

  test("handleRazorpayWebhook rejects missing signature header with 400", async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = "valid_configured_webhook_secret";
    const req = {
      headers: {},
      rawBody: Buffer.from(JSON.stringify({ event: "payment.captured" })),
    };
    const res = createMockRes();
    await handleRazorpayWebhook(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.sentData, "Missing webhook signature header");
  });

  test("handleRazorpayWebhook rejects invalid signature with 400", async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = "valid_configured_webhook_secret";
    const req = {
      headers: { "x-razorpay-signature": "invalid_forged_webhook_signature_hex" },
      rawBody: Buffer.from(JSON.stringify({ event: "payment.captured" })),
    };
    const res = createMockRes();
    await handleRazorpayWebhook(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.sentData, "Invalid webhook signature");
  });

  test("handleRazorpayWebhook safely handles signature of mismatched byte length", async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = "valid_configured_webhook_secret";
    const req = {
      headers: { "x-razorpay-signature": "short_sig" },
      rawBody: Buffer.from(JSON.stringify({ event: "payment.captured" })),
    };
    const res = createMockRes();
    await handleRazorpayWebhook(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.sentData, "Invalid webhook signature");
  });

  test("handleRazorpayWebhook accepts authentic signature and updates user idempotently", async () => {
    const testSecret = "my_strong_production_webhook_secret_2026";
    process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;

    let updateCalledWith = null;
    const originalFindOneAndUpdate = User.findOneAndUpdate;
    User.findOneAndUpdate = async (filter, update) => {
      updateCalledWith = { filter, update };
      return { _id: filter._id, plan: "pro" };
    };

    try {
      const payload = JSON.stringify({
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: "pay_test_verified_123",
              order_id: "order_test_verified_123",
              status: "captured",
              currency: "INR",
              amount: 49900,
              notes: { userId: "507f1f77bcf86cd799439011", plan: "pro" },
            },
          },
        },
      });

      const validSignature = crypto
        .createHmac("sha256", testSecret)
        .update(payload)
        .digest("hex");

      const req = {
        headers: { "x-razorpay-signature": validSignature },
        rawBody: Buffer.from(payload),
        body: JSON.parse(payload),
      };
      const res = createMockRes();
      await handleRazorpayWebhook(req, res);

      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.jsonData, { status: "ok" });
      assert.ok(updateCalledWith !== null, "User update must be called");
      assert.equal(updateCalledWith.filter["paymentHistory.transactionId"].$ne, "pay_test_verified_123");
    } finally {
      User.findOneAndUpdate = originalFindOneAndUpdate;
    }
  });

  test("handleRazorpayWebhook fails closed with 400 when rawBody is missing or empty", async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = "valid_configured_webhook_secret";

    const invalidRawBodies = [
      null,
      undefined,
      Buffer.alloc(0),
      "",
    ];

    for (const rawBody of invalidRawBodies) {
      const req = {
        headers: { "x-razorpay-signature": "some_sig" },
        rawBody,
        body: { event: "payment.captured" },
      };
      const res = createMockRes();
      await handleRazorpayWebhook(req, res);

      assert.equal(res.statusCode, 400);
      assert.equal(res.sentData, "Missing or invalid raw request body for webhook verification");
    }
  });

  test("handleRazorpayWebhook rejects empty or whitespace-only signature header with 400", async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = "valid_configured_webhook_secret";
    const req = {
      headers: { "x-razorpay-signature": "   " },
      rawBody: Buffer.from(JSON.stringify({ event: "payment.captured" })),
    };
    const res = createMockRes();
    await handleRazorpayWebhook(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.sentData, "Missing webhook signature header");
  });

  test("handleRazorpayWebhook returns HTTP 500 when database update fails so Razorpay retries", async () => {
    const testSecret = "my_strong_production_webhook_secret_2026";
    process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;

    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_db_failure_123",
            order_id: "order_db_failure_123",
            status: "captured",
            currency: "INR",
            amount: 49900,
            notes: { userId: "507f1f77bcf86cd799439011", plan: "pro" },
          },
        },
      },
    });

    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(payload)
      .digest("hex");

    const originalFindOneAndUpdate = User.findOneAndUpdate;
    User.findOneAndUpdate = async () => {
      throw new Error("Simulated MongoDB write connection failure");
    };

    try {
      const req = {
        headers: { "x-razorpay-signature": validSignature },
        rawBody: Buffer.from(payload),
        body: JSON.parse(payload),
      };
      const res = createMockRes();
      await handleRazorpayWebhook(req, res);

      assert.equal(res.statusCode, 500);
      assert.equal(res.jsonData?.success, false);
      assert.ok(res.jsonData?.message?.includes("Database update failed"));
    } finally {
      User.findOneAndUpdate = originalFindOneAndUpdate;
    }
  });

  test("handleRazorpayWebhook handles duplicate event idempotently without error", async () => {
    const testSecret = "my_strong_production_webhook_secret_2026";
    process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;

    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_duplicate_event_123",
            order_id: "order_duplicate_event_123",
            status: "captured",
            currency: "INR",
            amount: 49900,
            notes: { userId: "507f1f77bcf86cd799439011", plan: "pro" },
          },
        },
      },
    });

    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(payload)
      .digest("hex");

    let updateAttempted = false;
    const originalFindOneAndUpdate = User.findOneAndUpdate;
    const originalFindById = User.findById;
    // Return null simulating transaction was already recorded
    User.findOneAndUpdate = async () => {
      updateAttempted = true;
      return null;
    };
    User.findById = async () => ({
      _id: "507f1f77bcf86cd799439011",
      plan: "pro",
      paymentHistory: [
        {
          transactionId: "pay_duplicate_event_123",
          orderId: "order_duplicate_event_123",
          plan: "pro",
          amount: 499,
        },
      ],
    });

    try {
      const req = {
        headers: { "x-razorpay-signature": validSignature },
        rawBody: Buffer.from(payload),
        body: JSON.parse(payload),
      };
      const res = createMockRes();
      await handleRazorpayWebhook(req, res);

      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.jsonData, { status: "ok" });
      assert.ok(updateAttempted, "Database query should have executed");
    } finally {
      User.findOneAndUpdate = originalFindOneAndUpdate;
      User.findById = originalFindById;
    }
  });

  test("handleRazorpayWebhook safely ignores unknown payment amount without upgrading user", async () => {
    const testSecret = "my_strong_production_webhook_secret_2026";
    process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;

    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_unknown_amt_123",
            order_id: "order_unknown_amt_123",
            status: "captured",
            amount: 100, // ₹1 (unrecognized)
            currency: "INR",
            notes: { userId: "507f1f77bcf86cd799439011", plan: "pro" },
          },
        },
      },
    });

    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(payload)
      .digest("hex");

    let dbCalled = false;
    const originalFindOneAndUpdate = User.findOneAndUpdate;
    User.findOneAndUpdate = async () => {
      dbCalled = true;
      return null;
    };

    try {
      const req = {
        headers: { "x-razorpay-signature": validSignature },
        rawBody: Buffer.from(payload),
        body: JSON.parse(payload),
      };
      const res = createMockRes();
      await handleRazorpayWebhook(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.jsonData?.status, "ignored");
      assert.equal(res.jsonData?.reason, "unknown_amount");
      assert.equal(dbCalled, false, "Must not attempt DB update for unknown payment amount");
    } finally {
      User.findOneAndUpdate = originalFindOneAndUpdate;
    }
  });

  test("handleRazorpayWebhook safely ignores contradiction between plan notes and payment amount", async () => {
    const testSecret = "my_strong_production_webhook_secret_2026";
    process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;

    // Payload claims "team" in notes, but amount is 49900 (Pro)
    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_contradiction_123",
            order_id: "order_contradiction_123",
            status: "captured",
            amount: 49900,
            currency: "INR",
            notes: { userId: "507f1f77bcf86cd799439011", plan: "team" },
          },
        },
      },
    });

    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(payload)
      .digest("hex");

    let dbCalled = false;
    const originalFindOneAndUpdate = User.findOneAndUpdate;
    User.findOneAndUpdate = async () => {
      dbCalled = true;
      return null;
    };

    try {
      const req = {
        headers: { "x-razorpay-signature": validSignature },
        rawBody: Buffer.from(payload),
        body: JSON.parse(payload),
      };
      const res = createMockRes();
      await handleRazorpayWebhook(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.jsonData?.status, "ignored");
      assert.equal(res.jsonData?.reason, "plan_amount_mismatch");
      assert.equal(dbCalled, false, "Must not attempt DB update when notes and amount contradict");
    } finally {
      User.findOneAndUpdate = originalFindOneAndUpdate;
    }
  });

  test("handleRazorpayWebhook safely ignores unsupported non-INR currency", async () => {
    const testSecret = "my_strong_production_webhook_secret_2026";
    process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;

    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_usd_123",
            order_id: "order_usd_123",
            status: "captured",
            amount: 49900,
            currency: "USD",
            notes: { userId: "507f1f77bcf86cd799439011", plan: "pro" },
          },
        },
      },
    });

    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(payload)
      .digest("hex");

    let dbCalled = false;
    const originalFindOneAndUpdate = User.findOneAndUpdate;
    User.findOneAndUpdate = async () => {
      dbCalled = true;
      return null;
    };

    try {
      const req = {
        headers: { "x-razorpay-signature": validSignature },
        rawBody: Buffer.from(payload),
        body: JSON.parse(payload),
      };
      const res = createMockRes();
      await handleRazorpayWebhook(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.jsonData?.status, "ignored");
      assert.equal(res.jsonData?.reason, "unsupported_currency");
      assert.equal(dbCalled, false, "Must not attempt DB update for non-INR currency");
    } finally {
      User.findOneAndUpdate = originalFindOneAndUpdate;
    }
  });

  test("handleRazorpayWebhook rejects missing or invalid payment entity with 400", async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = "valid_configured_webhook_secret";

    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {}, // Missing payment.entity
    });

    const validSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    const req = {
      headers: { "x-razorpay-signature": validSignature },
      rawBody: Buffer.from(payload),
      body: JSON.parse(payload),
    };
    const res = createMockRes();
    await handleRazorpayWebhook(req, res);

    assert.equal(res.statusCode, 400);
    assert.ok(res.jsonData?.message?.includes("Missing payment entity"));
  });

  test("handleRazorpayWebhook rejects missing transaction ID with 400", async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = "valid_configured_webhook_secret";

    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            order_id: "order_notx_123",
            amount: 49900,
            currency: "INR",
            status: "captured",
            notes: { userId: "507f1f77bcf86cd799439011", plan: "pro" },
          },
        },
      },
    });

    const validSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    const req = {
      headers: { "x-razorpay-signature": validSignature },
      rawBody: Buffer.from(payload),
      body: JSON.parse(payload),
    };
    const res = createMockRes();
    await handleRazorpayWebhook(req, res);

    assert.equal(res.statusCode, 400);
    assert.ok(res.jsonData?.message?.includes("Missing transaction ID"));
  });

  test("handleRazorpayWebhook rejects missing order ID with 400", async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = "valid_configured_webhook_secret";

    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_noorder_123",
            amount: 49900,
            currency: "INR",
            status: "captured",
            notes: { userId: "507f1f77bcf86cd799439011", plan: "pro" },
          },
        },
      },
    });

    const validSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    const req = {
      headers: { "x-razorpay-signature": validSignature },
      rawBody: Buffer.from(payload),
      body: JSON.parse(payload),
    };
    const res = createMockRes();
    await handleRazorpayWebhook(req, res);

    assert.equal(res.statusCode, 400);
    assert.ok(res.jsonData?.message?.includes("Missing order ID"));
  });

  test("handleRazorpayWebhook rejects order missing user ID with 400", async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = "valid_configured_webhook_secret";

    mockRazorpayClient({
      orderId: "order_nouser_123",
      paymentId: "pay_nouser_123",
      orderNotes: { plan: "pro" }, // Missing userId in authoritative order notes
      orderAmount: 49900,
      orderStatus: "paid",
    });

    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_nouser_123",
            order_id: "order_nouser_123",
            amount: 49900,
            currency: "INR",
            status: "captured",
            notes: { plan: "pro" },
          },
        },
      },
    });

    const validSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    const req = {
      headers: { "x-razorpay-signature": validSignature },
      rawBody: Buffer.from(payload),
      body: JSON.parse(payload),
    };
    const res = createMockRes();
    await handleRazorpayWebhook(req, res);

    assert.equal(res.statusCode, 400);
    assert.ok(res.jsonData?.message?.includes("user ownership information"));
  });

  test("handleRazorpayWebhook fulfills payment when payment.notes is an empty array []", async () => {
    const testSecret = "my_strong_production_webhook_secret_2026";
    process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;

    const orderId = "order_empty_notes_arr_123";
    const paymentId = "pay_empty_notes_arr_123";
    const userId = "507f1f77bcf86cd799439011";

    mockRazorpayClient({
      orderId,
      paymentId,
      orderNotes: { userId, plan: "pro" },
      orderAmount: 49900,
      orderStatus: "paid",
      paymentAmount: 49900,
      paymentStatus: "captured",
    });

    let updateCount = 0;
    let updateCalledWith = null;
    const originalFindOneAndUpdate = User.findOneAndUpdate;
    User.findOneAndUpdate = async (filter, update) => {
      updateCount++;
      updateCalledWith = { filter, update };
      return { _id: filter._id, plan: "pro" };
    };

    try {
      const payload = JSON.stringify({
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: paymentId,
              order_id: orderId,
              status: "captured",
              currency: "INR",
              amount: 49900,
              notes: [], // Razorpay sends [] when notes are empty
            },
          },
        },
      });

      const validSignature = crypto
        .createHmac("sha256", testSecret)
        .update(payload)
        .digest("hex");

      const req = {
        headers: { "x-razorpay-signature": validSignature },
        rawBody: Buffer.from(payload),
        body: JSON.parse(payload),
      };
      const res = createMockRes();
      await handleRazorpayWebhook(req, res);

      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.jsonData, { status: "ok" });
      assert.equal(updateCount, 1, "Payment must be fulfilled exactly once");
      assert.equal(updateCalledWith.filter._id, userId);
      assert.equal(updateCalledWith.filter["paymentHistory.transactionId"].$ne, paymentId);
      assert.equal(updateCalledWith.update.$set.plan, "pro");
      assert.equal(updateCalledWith.update.$push.paymentHistory.orderId, orderId);
    } finally {
      User.findOneAndUpdate = originalFindOneAndUpdate;
    }
  });

  test("handleRazorpayWebhook fulfills payment when payment.notes is absent", async () => {
    const testSecret = "my_strong_production_webhook_secret_2026";
    process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;

    const orderId = "order_absent_notes_123";
    const paymentId = "pay_absent_notes_123";
    const userId = "507f1f77bcf86cd799439011";

    mockRazorpayClient({
      orderId,
      paymentId,
      orderNotes: { userId, plan: "team" },
      orderAmount: 99900,
      orderStatus: "paid",
      paymentAmount: 99900,
      paymentStatus: "captured",
    });

    let updateCount = 0;
    let updateCalledWith = null;
    const originalFindOneAndUpdate = User.findOneAndUpdate;
    User.findOneAndUpdate = async (filter, update) => {
      updateCount++;
      updateCalledWith = { filter, update };
      return { _id: filter._id, plan: "team" };
    };

    try {
      const payload = JSON.stringify({
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: paymentId,
              order_id: orderId,
              status: "captured",
              currency: "INR",
              amount: 99900,
              // notes is completely omitted
            },
          },
        },
      });

      const validSignature = crypto
        .createHmac("sha256", testSecret)
        .update(payload)
        .digest("hex");

      const req = {
        headers: { "x-razorpay-signature": validSignature },
        rawBody: Buffer.from(payload),
        body: JSON.parse(payload),
      };
      const res = createMockRes();
      await handleRazorpayWebhook(req, res);

      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.jsonData, { status: "ok" });
      assert.equal(updateCount, 1, "Payment must be fulfilled exactly once");
      assert.equal(updateCalledWith.filter._id, userId);
      assert.equal(updateCalledWith.filter["paymentHistory.transactionId"].$ne, paymentId);
      assert.equal(updateCalledWith.update.$set.plan, "team");
      assert.equal(updateCalledWith.update.$push.paymentHistory.orderId, orderId);
    } finally {
      User.findOneAndUpdate = originalFindOneAndUpdate;
    }
  });

  test("handleRazorpayWebhook rejects missing or non-numeric payment amount with 400", async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = "valid_configured_webhook_secret";

    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_noamt_123",
            order_id: "order_noamt_123",
            status: "captured",
            currency: "INR",
            notes: { userId: "507f1f77bcf86cd799439011", plan: "pro" },
          },
        },
      },
    });

    const validSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    const req = {
      headers: { "x-razorpay-signature": validSignature },
      rawBody: Buffer.from(payload),
      body: JSON.parse(payload),
    };
    const res = createMockRes();
    await handleRazorpayWebhook(req, res);

    assert.equal(res.statusCode, 400);
    assert.ok(res.jsonData?.message?.includes("Missing or invalid payment amount"));
  });

  test("handleRazorpayWebhook safely ignores uncaptured payment status (e.g. authorized, failed)", async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = "valid_configured_webhook_secret";

    const uncapturedStatuses = ["authorized", "failed", "created", "refunded"];
    for (const status of uncapturedStatuses) {
      const payload = JSON.stringify({
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: "pay_uncaptured_123",
              order_id: "order_uncaptured_123",
              amount: 49900,
              currency: "INR",
              status,
              notes: { userId: "507f1f77bcf86cd799439011", plan: "pro" },
            },
          },
        },
      });

      const validSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(payload)
        .digest("hex");

      const req = {
        headers: { "x-razorpay-signature": validSignature },
        rawBody: Buffer.from(payload),
        body: JSON.parse(payload),
      };
      const res = createMockRes();
      await handleRazorpayWebhook(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.jsonData?.status, "ignored");
      assert.equal(res.jsonData?.reason, "payment_not_captured");
    }
  });

  test("handleRazorpayWebhook safely ignores mismatched order user ID and payment user ID", async () => {
    const testSecret = "my_strong_production_webhook_secret_2026";
    process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;

    const orderId = "order_user_mismatch_123";
    const paymentId = "pay_user_mismatch_123";

    mockRazorpayClient({
      orderId,
      paymentId,
      orderNotes: { userId: "legitimate_user_id_456", plan: "pro" }, // order belongs to user 456
      orderAmount: 49900,
      orderStatus: "paid",
    });

    // Payment payload specifies attacker's user ID
    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: paymentId,
            order_id: orderId,
            status: "captured",
            currency: "INR",
            amount: 49900,
            notes: { userId: "attacker_user_id_789", plan: "pro" },
          },
        },
      },
    });

    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(payload)
      .digest("hex");

    let dbCalled = false;
    const originalFindOneAndUpdate = User.findOneAndUpdate;
    User.findOneAndUpdate = async () => {
      dbCalled = true;
      return null;
    };

    try {
      const req = {
        headers: { "x-razorpay-signature": validSignature },
        rawBody: Buffer.from(payload),
        body: JSON.parse(payload),
      };
      const res = createMockRes();
      await handleRazorpayWebhook(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.jsonData?.status, "ignored");
      assert.equal(res.jsonData?.reason, "order_user_mismatch");
      assert.equal(dbCalled, false, "Must not attempt DB update when order user ID mismatches payment user ID");
    } finally {
      User.findOneAndUpdate = originalFindOneAndUpdate;
    }
  });

  test("handleRazorpayWebhook returns retryable 500 when orders.fetch encounters transient error", async () => {
    const testSecret = "my_strong_production_webhook_secret_2026";
    process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;

    mockRazorpayClient({
      orderFetchError: new Error("Razorpay upstream gateway timeout 504"),
    });

    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_transient_err_123",
            order_id: "order_transient_err_123",
            status: "captured",
            currency: "INR",
            amount: 49900,
            notes: { userId: "507f1f77bcf86cd799439011", plan: "pro" },
          },
        },
      },
    });

    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(payload)
      .digest("hex");

    const req = {
      headers: { "x-razorpay-signature": validSignature },
      rawBody: Buffer.from(payload),
      body: JSON.parse(payload),
    };
    const res = createMockRes();
    await handleRazorpayWebhook(req, res);

    assert.equal(res.statusCode, 500);
    assert.equal(res.jsonData?.status, "error");
    assert.ok(res.jsonData?.message?.includes("Retryable error"));
  });

  test("handleRazorpayWebhook returns retryable HTTP 500 when user is not found during fulfillment", async () => {
    const testSecret = "my_strong_production_webhook_secret_2026";
    process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;

    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_missing_user_123",
            order_id: "order_missing_user_123",
            status: "captured",
            currency: "INR",
            amount: 49900,
            notes: { userId: "507f1f77bcf86cd799439011", plan: "pro" },
          },
        },
      },
    });

    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(payload)
      .digest("hex");

    const originalFindOneAndUpdate = User.findOneAndUpdate;
    const originalFindById = User.findById;

    User.findOneAndUpdate = async () => null;
    User.findById = async () => null; // User doesn't exist in DB

    try {
      const req = {
        headers: { "x-razorpay-signature": validSignature },
        rawBody: Buffer.from(payload),
        body: JSON.parse(payload),
      };
      const res = createMockRes();
      await handleRazorpayWebhook(req, res);

      assert.equal(res.statusCode, 500);
      assert.equal(res.jsonData?.success, false);
      assert.ok(res.jsonData?.message?.includes("User not found during payment fulfillment"));
    } finally {
      User.findOneAndUpdate = originalFindOneAndUpdate;
      User.findById = originalFindById;
    }
  });

  test("handleRazorpayWebhook returns HTTP 500 when user exists but transaction is missing from history", async () => {
    const testSecret = "my_strong_production_webhook_secret_2026";
    process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;

    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_unrecorded_tx_123",
            order_id: "order_unrecorded_tx_123",
            status: "captured",
            currency: "INR",
            amount: 49900,
            notes: { userId: "507f1f77bcf86cd799439011", plan: "pro" },
          },
        },
      },
    });

    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(payload)
      .digest("hex");

    const originalFindOneAndUpdate = User.findOneAndUpdate;
    const originalFindById = User.findById;

    User.findOneAndUpdate = async () => null;
    User.findById = async () => ({
      _id: "507f1f77bcf86cd799439011",
      plan: "free",
      paymentHistory: [
        { transactionId: "different_old_tx_999" },
      ],
    });

    try {
      const req = {
        headers: { "x-razorpay-signature": validSignature },
        rawBody: Buffer.from(payload),
        body: JSON.parse(payload),
      };
      const res = createMockRes();
      await handleRazorpayWebhook(req, res);

      assert.equal(res.statusCode, 500);
      assert.equal(res.jsonData?.success, false);
      assert.ok(res.jsonData?.message?.includes("Failed to record payment transaction in user history"));
    } finally {
      User.findOneAndUpdate = originalFindOneAndUpdate;
      User.findById = originalFindById;
    }
  });

  test("handleRazorpayWebhook fulfills subscription on 'order.paid' event with documented payload structure", async () => {
    const testSecret = "my_strong_production_webhook_secret_2026";
    process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;

    const orderId = "order_paid_event_001";
    const paymentId = "pay_paid_event_001";
    const userId = "507f1f77bcf86cd799439011";

    mockRazorpayClient({
      orderId,
      paymentId,
      userId,
      plan: "pro",
      orderAmount: 49900,
      paymentAmount: 49900,
      orderStatus: "paid",
      paymentStatus: "captured",
    });

    const payload = JSON.stringify({
      entity: "event",
      event: "order.paid",
      contains: ["order", "payment"],
      payload: {
        order: {
          entity: {
            id: orderId,
            entity: "order",
            amount: 49900,
            amount_paid: 49900,
            status: "paid",
            notes: { userId, plan: "pro" },
          },
        },
        payment: {
          entity: {
            id: paymentId,
            entity: "payment",
            order_id: orderId,
            amount: 49900,
            currency: "INR",
            status: "captured",
            notes: { userId, plan: "pro" },
          },
        },
      },
    });

    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(payload)
      .digest("hex");

    let updatedWith = null;
    const originalFindOneAndUpdate = User.findOneAndUpdate;
    User.findOneAndUpdate = async (filter, update) => {
      updatedWith = { filter, update };
      return { _id: userId, plan: "pro" };
    };

    try {
      const req = {
        headers: { "x-razorpay-signature": validSignature },
        rawBody: Buffer.from(payload),
        body: JSON.parse(payload),
      };
      const res = createMockRes();
      await handleRazorpayWebhook(req, res);

      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.jsonData, { status: "ok" });
      assert.ok(updatedWith !== null, "User must be updated for order.paid event");
      assert.equal(updatedWith.update.$set.plan, "pro");
      assert.equal(updatedWith.update.$push.paymentHistory.orderId, orderId);
    } finally {
      User.findOneAndUpdate = originalFindOneAndUpdate;
    }
  });

  test("handleRazorpayWebhook returns HTTP 400 for 'order.paid' event when payment entity is missing", async () => {
    const testSecret = "my_strong_production_webhook_secret_2026";
    process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;

    const payload = JSON.stringify({
      entity: "event",
      event: "order.paid",
      contains: ["order"],
      payload: {
        order: {
          entity: {
            id: "order_nopay_123",
            amount: 49900,
            status: "paid",
          },
        },
      },
    });

    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(payload)
      .digest("hex");

    const req = {
      headers: { "x-razorpay-signature": validSignature },
      rawBody: Buffer.from(payload),
      body: JSON.parse(payload),
    };
    const res = createMockRes();
    await handleRazorpayWebhook(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonData?.status, "error");
    assert.ok(res.jsonData?.message?.includes("Missing payment entity"));
  });
});

describe("Payment Controller - Cross-Path Verification & Webhook Deduplication", () => {
  const originalKeySecret = process.env.RAZORPAY_KEY_SECRET;
  const originalWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  afterEach(() => {
    process.env.RAZORPAY_KEY_SECRET = originalKeySecret;
    process.env.RAZORPAY_WEBHOOK_SECRET = originalWebhookSecret;
    resetRazorpayClientFactory();
  });

  test("direct verification followed by webhook for same payment credits exactly once", async () => {
    const keySecret = "secret_key_shared_2026";
    const webhookSecret = "webhook_secret_shared_2026";
    process.env.RAZORPAY_KEY_SECRET = keySecret;
    process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

    const orderId = "order_shared_001";
    const paymentId = "pay_shared_001";
    const userId = "507f1f77bcf86cd799439011";

    mockRazorpayClient({
      orderId,
      paymentId,
      userId,
      plan: "pro",
      orderAmount: 49900,
      paymentAmount: 49900,
      orderStatus: "paid",
      paymentStatus: "captured",
    });

    const statefulUser = {
      _id: userId,
      email: "test@example.com",
      plan: "free",
      paymentHistory: [],
    };

    const originalFindOneAndUpdate = User.findOneAndUpdate;
    const originalFindById = User.findById;

    User.findOneAndUpdate = (filter, update) => {
      const matchesUser = String(filter._id) === String(statefulUser._id);
      const neTx = filter["paymentHistory.transactionId"]?.$ne;
      const alreadyHasTx = statefulUser.paymentHistory.some(p => p.transactionId === neTx);

      if (matchesUser && !alreadyHasTx) {
        if (update.$set?.plan) statefulUser.plan = update.$set.plan;
        if (update.$push?.paymentHistory) statefulUser.paymentHistory.push(update.$push.paymentHistory);
        return {
          select: () => Promise.resolve(JSON.parse(JSON.stringify(statefulUser))),
          then: (resolve) => resolve(JSON.parse(JSON.stringify(statefulUser))),
        };
      }
      return {
        select: () => Promise.resolve(null),
        then: (resolve) => resolve(null),
      };
    };

    User.findById = (id) => ({
      select: () => Promise.resolve(JSON.parse(JSON.stringify(statefulUser))),
      then: (resolve) => resolve(JSON.parse(JSON.stringify(statefulUser))),
    });

    try {
      // 1. Direct verification occurs first (client browser completes payment)
      const verifySig = crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
      const directReq = {
        body: {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: verifySig,
          plan: "pro",
        },
        user: { _id: userId, email: "test@example.com" },
      };
      const directRes = createMockRes();
      await verifyRazorpayPayment(directReq, directRes);

      assert.equal(directRes.statusCode, 200);
      assert.equal(directRes.jsonData?.success, true);
      assert.equal(statefulUser.plan, "pro");
      assert.equal(statefulUser.paymentHistory.length, 1);

      // 2. Razorpay Webhook delivers payment.captured asynchronously shortly after
      const webhookPayload = JSON.stringify({
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: paymentId,
              order_id: orderId,
              status: "captured",
              amount: 49900,
              currency: "INR",
              notes: { userId, plan: "pro" },
            },
          },
        },
      });
      const webhookSig = crypto.createHmac("sha256", webhookSecret).update(webhookPayload).digest("hex");
      const webhookReq = {
        headers: { "x-razorpay-signature": webhookSig },
        rawBody: Buffer.from(webhookPayload),
        body: JSON.parse(webhookPayload),
      };
      const webhookRes = createMockRes();
      await handleRazorpayWebhook(webhookReq, webhookRes);

      assert.equal(webhookRes.statusCode, 200);
      assert.deepEqual(webhookRes.jsonData, { status: "ok" });
      // Payment history MUST still have exactly 1 record (no duplicate credit)
      assert.equal(statefulUser.paymentHistory.length, 1);
      assert.equal(statefulUser.plan, "pro");
    } finally {
      User.findOneAndUpdate = originalFindOneAndUpdate;
      User.findById = originalFindById;
    }
  });

  test("webhook followed by direct verification for same payment credits exactly once", async () => {
    const keySecret = "secret_key_shared_2026";
    const webhookSecret = "webhook_secret_shared_2026";
    process.env.RAZORPAY_KEY_SECRET = keySecret;
    process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

    const orderId = "order_shared_002";
    const paymentId = "pay_shared_002";
    const userId = "507f1f77bcf86cd799439011";

    mockRazorpayClient({
      orderId,
      paymentId,
      userId,
      plan: "pro",
      orderAmount: 49900,
      paymentAmount: 49900,
      orderStatus: "paid",
      paymentStatus: "captured",
    });

    const statefulUser = {
      _id: userId,
      email: "test@example.com",
      plan: "free",
      paymentHistory: [],
    };

    const originalFindOneAndUpdate = User.findOneAndUpdate;
    const originalFindById = User.findById;

    User.findOneAndUpdate = (filter, update) => {
      const matchesUser = String(filter._id) === String(statefulUser._id);
      const neTx = filter["paymentHistory.transactionId"]?.$ne;
      const alreadyHasTx = statefulUser.paymentHistory.some(p => p.transactionId === neTx);

      if (matchesUser && !alreadyHasTx) {
        if (update.$set?.plan) statefulUser.plan = update.$set.plan;
        if (update.$push?.paymentHistory) statefulUser.paymentHistory.push(update.$push.paymentHistory);
        return {
          select: () => Promise.resolve(JSON.parse(JSON.stringify(statefulUser))),
          then: (resolve) => resolve(JSON.parse(JSON.stringify(statefulUser))),
        };
      }
      return {
        select: () => Promise.resolve(null),
        then: (resolve) => resolve(null),
      };
    };

    User.findById = (id) => ({
      select: () => Promise.resolve(JSON.parse(JSON.stringify(statefulUser))),
      then: (resolve) => resolve(JSON.parse(JSON.stringify(statefulUser))),
    });

    try {
      // 1. Webhook delivers payment.captured first (e.g. user closed browser tab)
      const webhookPayload = JSON.stringify({
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: paymentId,
              order_id: orderId,
              status: "captured",
              amount: 49900,
              currency: "INR",
              notes: { userId, plan: "pro" },
            },
          },
        },
      });
      const webhookSig = crypto.createHmac("sha256", webhookSecret).update(webhookPayload).digest("hex");
      const webhookReq = {
        headers: { "x-razorpay-signature": webhookSig },
        rawBody: Buffer.from(webhookPayload),
        body: JSON.parse(webhookPayload),
      };
      const webhookRes = createMockRes();
      await handleRazorpayWebhook(webhookReq, webhookRes);

      assert.equal(webhookRes.statusCode, 200);
      assert.deepEqual(webhookRes.jsonData, { status: "ok" });
      assert.equal(statefulUser.paymentHistory.length, 1);
      assert.equal(statefulUser.plan, "pro");

      // 2. Direct verification runs subsequently
      const verifySig = crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
      const directReq = {
        body: {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: verifySig,
          plan: "pro",
        },
        user: { _id: userId, email: "test@example.com" },
      };
      const directRes = createMockRes();
      await verifyRazorpayPayment(directReq, directRes);

      assert.equal(directRes.statusCode, 200);
      assert.equal(directRes.jsonData?.success, true);
      assert.ok(directRes.jsonData?.message?.includes("already verified"));
      // Payment history MUST still have exactly 1 record (no duplicate credit)
      assert.equal(statefulUser.paymentHistory.length, 1);
      assert.equal(statefulUser.plan, "pro");
    } finally {
      User.findOneAndUpdate = originalFindOneAndUpdate;
      User.findById = originalFindById;
    }
  });
});
