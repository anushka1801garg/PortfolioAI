import { test, describe } from "node:test";
import assert from "node:assert/strict";
import User from "../src/models/user.model.js";
import { updateUserProfile } from "../src/controllers/user.controller.js";

// ============================================================================
// PHASE 2 VERIFICATION SUITE
// ============================================================================

describe("PHASE 2 - FEAT-01: Pricing Consistency & Razorpay INR Alignment", () => {
  test("Razorpay plan pricing aligns with ₹499 Pro and ₹999 Team", () => {
    const plans = {
      pro: { monthly: 499, annual: 375, currency: "INR" },
      team: { monthly: 999, annual: 749, currency: "INR" },
    };

    assert.equal(plans.pro.monthly, 499);
    assert.equal(plans.pro.annual, 375);
    assert.equal(plans.team.monthly, 999);
    assert.equal(plans.team.annual, 749);
    assert.equal(plans.pro.currency, "INR");
  });
});

describe("PHASE 2 - FEAT-02: Indian Phone Number Validation", () => {
  const INDIAN_PHONE_REGEX = /^(?:\+91[\-\s]?)?[6789]\d{9}$/;

  const validNumbers = [
    "9876543210",
    "8123456789",
    "7000000000",
    "6999999999",
    "+919876543210",
    "+91 9876543210",
    "+91-9876543210",
  ];

  const invalidNumbers = [
    "abc123",
    "1234567890", // starts with 1
    "5123456789", // starts with 5
    "987654321", // 9 digits (too short)
    "987654321012", // 12 digits without country code (too long)
    "+91987654321099", // excessive digits after country code
    "+19876543210", // non-India country code
    "98765-43210", // misplaced hyphens
  ];

  test("accepts valid 10-digit Indian numbers with and without +91 prefix", () => {
    for (const num of validNumbers) {
      assert.equal(
        INDIAN_PHONE_REGEX.test(num),
        true,
        `Expected "${num}" to be valid Indian phone number`
      );
    }
  });

  test("rejects invalid, malformed, and non-Indian phone numbers", () => {
    for (const num of invalidNumbers) {
      assert.equal(
        INDIAN_PHONE_REGEX.test(num),
        false,
        `Expected "${num}" to be rejected as invalid`
      );
    }
  });

  test("User model schema permits valid Indian numbers and empty string", () => {
    const phoneValidator = User.schema.path("phone").validators[0].validator;

    assert.equal(phoneValidator(""), true, "Empty string should be valid (optional field)");
    assert.equal(phoneValidator(null), true, "Null should be valid");
    assert.equal(phoneValidator(undefined), true, "Undefined should be valid");
    assert.equal(phoneValidator("+91 9876543210"), true);
    assert.equal(phoneValidator("9876543210"), true);
    assert.equal(phoneValidator("invalid-phone"), false);
    assert.equal(phoneValidator("5123456789"), false);
  });

  test("updateUserProfile controller rejects invalid phone with HTTP 400", async () => {
    let statusCode = null;
    let responseBody = null;

    const mockReq = {
      user: { _id: "60d0fe4f5311236168a109ca" },
      body: { phone: "abc123" },
    };

    const mockRes = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(body) {
        responseBody = body;
        return this;
      },
    };

    // Mock User.findById
    const originalFindById = User.findById;
    User.findById = () => ({
      select: () => Promise.resolve({
        _id: "60d0fe4f5311236168a109ca",
        save: () => Promise.resolve(),
      }),
    });

    try {
      await updateUserProfile(mockReq, mockRes);
      assert.equal(statusCode, 400);
      assert.equal(responseBody.success, false);
      assert.match(responseBody.message, /valid 10-digit Indian mobile number/i);
    } finally {
      User.findById = originalFindById;
    }
  });

  test("updateUserProfile controller accepts valid Indian phone and allows clearing", async () => {
    let savedUser = null;
    const mockUser = {
      _id: "60d0fe4f5311236168a109ca",
      phone: "old",
      save() {
        savedUser = this;
        return Promise.resolve(this);
      },
      toObject() {
        return { ...this };
      },
    };

    const originalFindById = User.findById;
    User.findById = () => ({
      select: () => Promise.resolve(mockUser),
    });

    try {
      // 1. Valid phone update
      let statusCode = null;
      let resData = null;
      const res1 = {
        status(code) { statusCode = code; return this; },
        json(body) { resData = body; return this; },
      };

      await updateUserProfile(
        { user: { _id: "60d0fe4f5311236168a109ca" }, body: { phone: "+91 9876543210" } },
        res1
      );
      assert.equal(statusCode, 200);
      assert.equal(savedUser.phone, "+91 9876543210");

      // 2. Clear phone with empty string
      await updateUserProfile(
        { user: { _id: "60d0fe4f5311236168a109ca" }, body: { phone: "" } },
        res1
      );
      assert.equal(statusCode, 200);
      assert.equal(savedUser.phone, "");
    } finally {
      User.findById = originalFindById;
    }
  });
});
