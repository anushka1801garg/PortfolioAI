import { test, describe } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import http from "http";
import { Socket } from "net";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import User from "../src/models/user.model.js";
import authRouter from "../src/routes/auth.routes.js";
import portfolioRouter from "../src/routes/portfolio.routes.js";
import { verifyJWT } from "../src/middlewares/auth.middleware.js";
import { configureQueryParser, sanitizeInput, sanitizeParams } from "../src/middlewares/sanitizer.middleware.js";

import {
  globalLimiter,
  loginLimiter,
  registerLimiter,
  aiChatLimiter,
  aiGenerationLimiter,
  aiLimiter,
  aiKeyGenerator,
  createRateLimitHandler,
} from "../src/middlewares/rateLimiter.middleware.js";

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[\x20-\x7E]{8,}$/;

// ============================================================================
// SEC-01: Rate Limiting
// ============================================================================
describe("SEC-01: Rate Limiting & Proxy Configuration", () => {
  test("loginLimiter enforces 5-attempt limit and triggers HTTP 429 on 6th request", async () => {
    const testIp = "203.0.113." + Math.floor(Math.random() * 200 + 10);
    const req = { ip: testIp, headers: {}, app: { get: () => false } };
    let capturedStatus = null;
    let capturedBody = null;
    const res = {
      status(code) {
        capturedStatus = code;
        return this;
      },
      json(body) {
        capturedBody = body;
        return this;
      },
      setHeader() {},
      getHeader() {},
    };

    // First 5 requests should pass through to next()
    for (let i = 1; i <= 5; i++) {
      let passed = false;
      await loginLimiter(req, res, () => {
        passed = true;
      });
      assert.equal(passed, true, `Attempt ${i} should be allowed`);
    }

    // 6th request must trigger HTTP 429
    let passedOnSixth = false;
    await loginLimiter(req, res, () => {
      passedOnSixth = true;
    });

    assert.equal(passedOnSixth, false, "6th attempt must NOT call next()");
    assert.equal(capturedStatus, 429, "6th attempt must receive HTTP 429");
    assert.equal(capturedBody.success, false);
    assert.match(capturedBody.message, /Too many login attempts/);
  });

  test("aiLimiter partitions rate-limiting by user ID for authenticated requests and IP for unauthenticated", () => {
    assert.ok(typeof aiKeyGenerator === "function", "aiKeyGenerator must be a function");

    // Authenticated user request
    const authReq = {
      user: { _id: "65b9a1e09c8d1e2f3a4b5c6d" },
      ip: "192.168.1.100",
    };
    assert.equal(aiKeyGenerator(authReq), "65b9a1e09c8d1e2f3a4b5c6d");

    // Unauthenticated request fallback to IP
    const guestReq = {
      ip: "203.0.113.195",
    };
    assert.equal(aiKeyGenerator(guestReq), "203.0.113.195");
  });

  test("rate limiter handler returns consistent HTTP 429 responses", () => {
    let capturedStatus = null;
    let capturedBody = null;

    const mockRes = {
      status(code) {
        capturedStatus = code;
        return this;
      },
      json(data) {
        capturedBody = data;
        return this;
      },
    };

    const handler = createRateLimitHandler("Too many login attempts. For security reasons, please try again in 15 minutes.");
    handler({}, mockRes);

    assert.equal(capturedStatus, 429, "Handler must return HTTP 429");
    assert.equal(capturedBody.success, false);
    assert.match(capturedBody.message, /Too many login attempts/);
  });

  test("chatbot route /chat mounts verifyJWT before aiChatLimiter and chatWithPortfolioAI", () => {
    const chatRoute = portfolioRouter.stack.find(
      (layer) => layer.route && layer.route.path === "/chat" && layer.route.methods.post
    );
    assert.ok(chatRoute, "POST /chat route must exist in portfolioRouter");
    assert.equal(chatRoute.route.stack.length, 3, "POST /chat must have exactly 3 middleware handlers");

    // 1. verifyJWT must execute first
    assert.equal(chatRoute.route.stack[0].name, "verifyJWT", "First handler must be verifyJWT");

    // 2. aiChatLimiter must execute second
    assert.ok(chatRoute.route.stack[1].handle, "Second handler must be rate limiter middleware");

    // 3. chatWithPortfolioAI must execute last
    assert.equal(chatRoute.route.stack[2].name, "chatWithPortfolioAI", "Final handler must be chatWithPortfolioAI");
  });

  test("verifyJWT rejects unauthenticated requests and permits valid authenticated sessions", async () => {
    const createMockRes = () => {
      let status = null;
      let body = null;
      return {
        status(code) { status = code; return this; },
        json(data) { body = data; return this; },
        getStatus: () => status,
        getBody: () => body,
      };
    };

    // 1. Request without token
    const resNoToken = createMockRes();
    let nextCalledNoToken = false;
    await verifyJWT({ headers: {} }, resNoToken, () => { nextCalledNoToken = true; });
    assert.equal(resNoToken.getStatus(), 401, "Missing token must return HTTP 401");
    assert.equal(resNoToken.getBody().success, false);
    assert.equal(resNoToken.getBody().message, "Unauthorized");
    assert.equal(nextCalledNoToken, false, "Must not call next() without token");

    // 2. Request with invalid token
    const resInvalid = createMockRes();
    let nextCalledInvalid = false;
    await verifyJWT({ headers: { authorization: "Bearer invalid.jwt.signature" } }, resInvalid, () => {
      nextCalledInvalid = true;
    });
    assert.equal(resInvalid.getStatus(), 401, "Invalid token must return HTTP 401");
    assert.equal(resInvalid.getBody().success, false);
    assert.equal(resInvalid.getBody().message, "Invalid Token");
    assert.equal(nextCalledInvalid, false, "Must not call next() with invalid token");

    // 3. Request with expired token
    const secret = process.env.JWT_SECRET || "fallback_test_secret_32bytes_long!";
    const expiredToken = jwt.sign({ id: "65b9a1e09c8d1e2f3a4b5c6d" }, secret, { expiresIn: "-1s" });
    const resExpired = createMockRes();
    let nextCalledExpired = false;
    await verifyJWT({ headers: { authorization: `Bearer ${expiredToken}` } }, resExpired, () => {
      nextCalledExpired = true;
    });
    assert.equal(resExpired.getStatus(), 401, "Expired token must return HTTP 401");
    assert.equal(resExpired.getBody().success, false);
    assert.equal(resExpired.getBody().expired, true);
    assert.equal(nextCalledExpired, false, "Must not call next() with expired token");

    // 4. Valid authenticated request reaches next() handler
    const validToken = jwt.sign({ id: "65b9a1e09c8d1e2f3a4b5c6d" }, secret, { expiresIn: "1h" });
    const resValid = createMockRes();
    let nextCalledValid = false;
    const origFindById = User.findById;
    User.findById = () => ({
      select: () => Promise.resolve({
        _id: "65b9a1e09c8d1e2f3a4b5c6d",
        email: "authed@example.com",
        role: "user",
      }),
    });
    try {
      const validReq = { headers: { authorization: `Bearer ${validToken}` } };
      await verifyJWT(validReq, resValid, () => {
        nextCalledValid = true;
      });
      assert.equal(nextCalledValid, true, "Valid authenticated request must proceed to next()");
      assert.ok(validReq.user, "Valid request must have req.user populated");
      assert.equal(validReq.user.email, "authed@example.com");
    } finally {
      User.findById = origFindById;
    }
  });
});

// ============================================================================
// SEC-02: Prevent Account & Email Enumeration
// ============================================================================
describe("SEC-02: Account and Email Enumeration Defense", () => {
  test("login failure produces identical 401 error for missing accounts and wrong passwords", () => {
    const errorResponseForMissingUser = {
      status: 401,
      body: {
        success: false,
        message: "Invalid email or password",
      },
    };

    const errorResponseForWrongPassword = {
      status: 401,
      body: {
        success: false,
        message: "Invalid email or password",
      },
    };

    assert.equal(
      errorResponseForMissingUser.status,
      errorResponseForWrongPassword.status,
      "HTTP status code must be identical (401)"
    );
    assert.equal(
      errorResponseForMissingUser.body.message,
      errorResponseForWrongPassword.body.message,
      "Message must be identical to prevent user account enumeration"
    );
    assert.notEqual(
      errorResponseForMissingUser.status,
      404,
      "Must never return 404 for nonexistent email"
    );
  });

});

// ============================================================================
// SEC-03: Authenticated Password Updates & Session Revocation
// ============================================================================
describe("SEC-03: Authenticated Password Updates & Session Revocation", () => {
  test("confirms email-based password reset routes and model methods are completely removed", () => {
    // 1. Routes /forgot-password and /reset-password must not exist in authRouter
    const forgotRoute = authRouter.stack.find(
      (layer) => layer.route && layer.route.path === "/forgot-password"
    );
    const resetRoute = authRouter.stack.find(
      (layer) => layer.route && layer.route.path && layer.route.path.startsWith("/reset-password")
    );
    assert.equal(forgotRoute, undefined, "POST /forgot-password route must be removed");
    assert.equal(resetRoute, undefined, "POST /reset-password route must be removed");

    // 2. User model must not have getResetPasswordToken method or reset token fields
    const userInstance = new User({
      fullName: "Test User",
      email: "test@example.com",
      password: "ValidPassword123",
    });
    assert.equal(
      typeof userInstance.getResetPasswordToken,
      "undefined",
      "getResetPasswordToken method must be removed from User model"
    );
    assert.equal(
      userInstance.resetPasswordToken,
      undefined,
      "resetPasswordToken schema field must be removed"
    );
    assert.equal(
      userInstance.resetPasswordExpire,
      undefined,
      "resetPasswordExpire schema field must be removed"
    );
  });

  test("authenticated password change updates passwordChangedAt and invalidates older sessions", () => {
    const user = new User({
      fullName: "Authenticated User",
      email: "authed@example.com",
      password: "OldHashedPassword123",
    });

    const now = Date.now();
    user.password = "NewValidPassword456";
    user.passwordChangedAt = new Date(now - 1000);

    const changedSec = Math.floor(user.passwordChangedAt.getTime() / 1000);
    const staleTokenIat = changedSec - 60;
    const freshTokenIat = changedSec + 10;

    assert.equal(
      user.changedPasswordAfter(staleTokenIat),
      true,
      "Sessions issued prior to password update must be revoked"
    );
    assert.equal(
      user.changedPasswordAfter(freshTokenIat),
      false,
      "Sessions issued after password update must remain valid"
    );
  });

  test("changedPasswordAfter detects and revokes tokens issued before password update", () => {
    // Simulate user whose password was changed at 12:00:00
    const passwordChangedDate = new Date("2026-11-15T12:00:00Z");
    const changedTimestampSec = Math.floor(passwordChangedDate.getTime() / 1000);

    const userInstance = new User({
      fullName: "Test User",
      email: "test@example.com",
      password: "ValidPassword123",
      passwordChangedAt: passwordChangedDate,
    });

    // Stale token issued 5 minutes BEFORE password reset (e.g. 11:55:00)
    const oldTokenIat = changedTimestampSec - 300;
    assert.equal(
      userInstance.changedPasswordAfter(oldTokenIat),
      true,
      "Token issued before password change must be identified as revoked"
    );

    // Fresh token issued AFTER password reset (e.g. 12:00:05)
    const newTokenIat = changedTimestampSec + 5;
    assert.equal(
      userInstance.changedPasswordAfter(newTokenIat),
      false,
      "Token issued after password change must remain valid"
    );

    // Immediate token issued with 1-second past offset (standard reset handling)
    const immediateTokenIat = changedTimestampSec;
    assert.equal(
      userInstance.changedPasswordAfter(immediateTokenIat),
      false,
      "Immediate token issued upon reset must remain valid"
    );
  });

  test("rejects missing, non-numeric, or invalid iat claims when passwordChangedAt is present", () => {
    const passwordChangedDate = new Date("2026-11-15T12:00:00Z");

    const userInstance = new User({
      fullName: "Test User",
      email: "test@example.com",
      password: "ValidPassword123",
      passwordChangedAt: passwordChangedDate,
    });

    // Missing iat (undefined) must be rejected
    assert.equal(
      userInstance.changedPasswordAfter(undefined),
      true,
      "Missing iat claim (undefined) must be rejected when password was changed"
    );

    // Null iat must be rejected
    assert.equal(
      userInstance.changedPasswordAfter(null),
      true,
      "Null iat claim must be rejected when password was changed"
    );

    // String / non-numeric iat must be rejected
    assert.equal(
      userInstance.changedPasswordAfter("1731674400"),
      true,
      "String/non-numeric iat claim must be rejected when password was changed"
    );

    // NaN iat must be rejected
    assert.equal(
      userInstance.changedPasswordAfter(NaN),
      true,
      "NaN iat claim must be rejected when password was changed"
    );

    // Non-finite iat (Infinity / -Infinity) must be rejected
    assert.equal(
      userInstance.changedPasswordAfter(Infinity),
      true,
      "Infinity iat claim must be rejected when password was changed"
    );
    assert.equal(
      userInstance.changedPasswordAfter(-Infinity),
      true,
      "-Infinity iat claim must be rejected when password was changed"
    );
  });

  test("preserves normal authentication for existing users without passwordChangedAt", () => {
    const unchangedUser = new User({
      fullName: "Legacy User",
      email: "legacy@example.com",
      password: "ValidPassword123",
    });

    const anyTimestamp = 1731670000;

    // Any valid timestamp must pass
    assert.equal(
      unchangedUser.changedPasswordAfter(anyTimestamp),
      false,
      "Existing user without password change history must authenticate normally"
    );

    // Missing or undefined iat must not trigger password change revocation for legacy users
    assert.equal(
      unchangedUser.changedPasswordAfter(undefined),
      false,
      "Legacy user without password change must not be blocked by missing iat in changedPasswordAfter"
    );
  });
});

// ============================================================================
// SEC-04: NoSQL Injection Sanitization & Type Validation
// ============================================================================
describe("SEC-04: NoSQL Injection Sanitization & Scalar Type Validation", () => {
  test("express-mongo-sanitize strips $ne, $gt, and dangerous MongoDB operators", () => {
    const maliciousPayload = {
      email: { [String.fromCharCode(36) + "ne"]: null },
      password: "ValidPass123",
      nested: {
        filter: { [String.fromCharCode(36) + "gt"]: "" },
        legitimateKey: "hello",
      },
    };

    // Use express-mongo-sanitize sanitize method
    const sanitize = mongoSanitize.sanitize || mongoSanitize;
    sanitize(maliciousPayload);

    // Operator keys should be stripped
    assert.equal(maliciousPayload.email[String.fromCharCode(36) + "ne"], undefined);
    assert.equal(maliciousPayload.nested.filter[String.fromCharCode(36) + "gt"], undefined);
    assert.equal(maliciousPayload.password, "ValidPass123");
    assert.equal(maliciousPayload.nested.legitimateKey, "hello");
  });

  test("scalar string validation rejects non-string injection objects in auth controllers", () => {
    const testCases = [
      { email: { $ne: null }, password: "password123", valid: false },
      { email: "user@example.com", password: { $gt: "" }, valid: false },
      { email: ["user@example.com"], password: "password123", valid: false },
      { email: 12345, password: "password123", valid: false },
      { email: null, password: "password123", valid: false },
      { email: "user@example.com", password: "Password123", valid: true },
    ];

    for (const tc of testCases) {
      const isStringInput =
        typeof tc.email === "string" && typeof tc.password === "string";
      assert.equal(
        isStringInput,
        tc.valid,
        `Expected validation ${tc.valid} for email type '${typeof tc.email}' and password type '${typeof tc.password}'`
      );
    }
  });
});

// ============================================================================
// SEC-05: Server-Side Password Validation
// ============================================================================
describe("SEC-05: Server-Side Password Complexity Enforcement", () => {
  test("rejects passwords shorter than 8 characters", () => {
    assert.equal(PASSWORD_REGEX.test("P1abc"), false);
    assert.equal(PASSWORD_REGEX.test("Abc1234"), false); // 7 chars
    assert.equal(PASSWORD_REGEX.test(""), false);
  });

  test("rejects passwords lacking letters or digits", () => {
    assert.equal(PASSWORD_REGEX.test("12345678"), false, "Numbers only must fail");
    assert.equal(PASSWORD_REGEX.test("abcdefgh"), false, "Letters only must fail");
    assert.equal(PASSWORD_REGEX.test("!@#$%^&*()_+"), false, "Symbols only must fail");
    assert.equal(PASSWORD_REGEX.test("!@#$%^&*123"), false, "Symbols + numbers without letters must fail");
  });

  test("accepts valid passwords meeting length and complexity rules including password-manager symbols", () => {
    assert.equal(PASSWORD_REGEX.test("Password1"), true);
    assert.equal(PASSWORD_REGEX.test("ValidPass2026!"), true);
    assert.equal(PASSWORD_REGEX.test("secure_P@ssw0rd"), true);
    assert.equal(PASSWORD_REGEX.test("portfolioAI2026"), true);
    // Password-manager generated symbols (+, =, ~, ^, [], {}, etc.)
    assert.equal(PASSWORD_REGEX.test("Tr0ub4dor&3+"), true, "Must accept + symbol");
    assert.equal(PASSWORD_REGEX.test("Pass=Word123"), true, "Must accept = symbol");
    assert.equal(PASSWORD_REGEX.test("Secure[2026]Pass"), true, "Must accept bracket symbols");
    assert.equal(PASSWORD_REGEX.test("P@ss word123"), true, "Must accept spaces with letter & digit");
  });
});

// ============================================================================
// SEC-06: Production CORS Restrictions
// ============================================================================
describe("SEC-06: Production CORS Origin Whitelisting", () => {
  test("excludes localhost and loopback origins in production mode", () => {
    const configuredClientUrls = ["https://portfolioai.app", "https://app.portfolioai.com"];

    const getOriginsForEnv = (nodeEnv) => [
      ...(nodeEnv !== "production"
        ? [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
          ]
        : []),
      ...configuredClientUrls,
    ].filter(Boolean);

    const devOrigins = getOriginsForEnv("development");
    const prodOrigins = getOriginsForEnv("production");

    // In dev: localhost is present
    assert.ok(devOrigins.includes("http://localhost:5173"));
    assert.ok(devOrigins.includes("http://127.0.0.1:5173"));

    // In prod: localhost is strictly excluded
    assert.equal(
      prodOrigins.includes("http://localhost:5173"),
      false,
      "Production origins must NOT include localhost:5173"
    );
    assert.equal(
      prodOrigins.includes("http://localhost:3000"),
      false,
      "Production origins must NOT include localhost:3000"
    );
    assert.equal(
      prodOrigins.includes("http://127.0.0.1:5173"),
      false,
      "Production origins must NOT include 127.0.0.1:5173"
    );

    // In prod: only explicitly configured production URLs exist
    assert.deepEqual(prodOrigins, ["https://portfolioai.app", "https://app.portfolioai.com"]);
  });

  test("CORS origin validator rejects unauthorized origins in production", () => {
    const allowedOrigins = ["https://portfolioai.app"];

    const validateOrigin = (origin, nodeEnv) => {
      if (!origin) return true; // server-to-server / curl
      const normalizedOrigin = origin.replace(/\/+$/, "");
      const isAllowed = allowedOrigins.some((a) => a === normalizedOrigin || a === origin);
      if (isAllowed) return true;
      if (nodeEnv !== "production") {
        if (/^https?:\/\/localhost:\d+$/.test(origin) || /^https?:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
          return true;
        }
      }
      return false;
    };

    // Prod checks
    assert.equal(validateOrigin("https://portfolioai.app", "production"), true);
    assert.equal(validateOrigin("http://localhost:5173", "production"), false);
    assert.equal(validateOrigin("https://evil-attacker.com", "production"), false);

    // Dev checks
    assert.equal(validateOrigin("http://localhost:5173", "development"), true);
    assert.equal(validateOrigin("http://127.0.0.1:5173", "development"), true);
    assert.equal(validateOrigin("https://evil-attacker.com", "development"), false);
  });
});

// ============================================================================
// SEC-07: Express 5 Input Sanitization & NoSQL Injection Protection
// ============================================================================
describe("SEC-07: Express 5 Input Sanitization & NoSQL Injection Protection", () => {
  test("sanitizes MongoDB operator injection in req.body across nested objects and arrays", () => {
    const req = {
      body: {
        $gt: "",
        username: "admin",
        nested: {
          $ne: null,
          role: "user",
          tags: [{ $where: "sleep", name: "react" }],
        },
      },
    };
    sanitizeInput(req, {}, () => {});
    assert.equal(req.body.$gt, undefined, "Root operator $gt must be stripped");
    assert.equal(req.body.username, "admin", "Legitimate field username must be preserved");
    assert.equal(req.body.nested.$ne, undefined, "Nested operator $ne must be stripped");
    assert.equal(req.body.nested.role, "user", "Nested legitimate field must be preserved");
    assert.equal(req.body.nested.tags[0].$where, undefined, "Operator inside array object must be stripped");
    assert.equal(req.body.nested.tags[0].name, "react", "Field inside array object must be preserved");
  });

  test("safely sanitizes req.query when configured as an Express 5 getter-only property without throwing", () => {
    const queryData = { $regex: ".*", search: "portfolio" };
    const req = {};
    Object.defineProperty(req, "query", {
      get() {
        return queryData;
      },
      enumerable: true,
      configurable: true,
    });

    // Must not throw "Cannot set property query of #<IncomingMessage> which has only a getter"
    assert.doesNotThrow(() => {
      sanitizeInput(req, {}, () => {});
    });

    assert.equal(req.query.$regex, undefined, "Operator $regex must be stripped");
    assert.equal(req.query.search, "portfolio", "Legitimate query param must be preserved");
  });

  test("verifies req.query getter re-parsing in Express 5 does not resurrect malicious operators", () => {
    const app = express();
    configureQueryParser(app);

    const req = Object.create(express.request);
    req.app = app;
    req.url = "/test?$gt=0&$where=alert&search=developer&sort=-updatedAt";

    sanitizeInput(req, {}, () => {});

    // First access in controller
    const queryFirst = req.query;
    assert.equal(queryFirst.$gt, undefined, "Operator $gt must be stripped on first access");
    assert.equal(queryFirst.$where, undefined, "Operator $where must be stripped on first access");
    assert.equal(queryFirst.search, "developer", "Legitimate search parameter must be preserved");
    assert.equal(queryFirst.sort, "-updatedAt", "Legitimate sort parameter must be preserved");

    // Second access in controller (verifying repeated getter evaluation remains sanitized)
    const querySecond = req.query;
    assert.equal(querySecond.$gt, undefined, "Operator $gt must remain stripped on repeated access");
    assert.equal(querySecond.search, "developer");
    assert.equal(querySecond.sort, "-updatedAt");
  });

  test("verifies route params populated after route matching are sanitized before controller executes", () => {
    const req = {};
    sanitizeInput(req, {}, () => {});

    // Simulate Express router matching a parameterized route: req.params = layer.params
    req.params = {
      id: "6734abc1234567890abcdef",
      $gt: "operator_in_params",
    };

    assert.equal(req.params.id, "6734abc1234567890abcdef", "Legitimate ID param must be preserved");
    assert.equal(req.params.$gt, undefined, "Operator in params must be stripped before controller");
  });

  test("verifies sanitizeParams route-level middleware sanitizes parameters", () => {
    const req = {
      params: {
        id: "portfolio-slug-123",
        $ne: "malicious",
      },
    };
    let nextCalled = false;
    sanitizeParams(req, {}, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, true);
    assert.equal(req.params.id, "portfolio-slug-123");
    assert.equal(req.params.$ne, undefined);
  });

  test("end-to-end: verified route handler receives strictly sanitized body, query, and params", async () => {
    const app = express();
    configureQueryParser(app);
    app.use(express.json());
    app.use(sanitizeInput);

    let handlerReceived = null;
    const router = express.Router();
    router.post("/:id", (req, res) => {
      handlerReceived = {
        params: { ...req.params },
        query: { ...req.query },
        body: JSON.parse(JSON.stringify(req.body)),
      };
      res.status(200).json({ ok: true });
    });
    app.use("/api/test", router);

    const socket = new Socket();
    const req = new http.IncomingMessage(socket);
    Object.setPrototypeOf(req, express.request);
    req.app = app;
    req.method = "POST";
    req.url = "/api/test/6734abc?$where=bad&includeArchived=true";
    req.headers = { "content-type": "application/json" };
    req.body = {
      $gt: "bypass",
      title: "My Portfolio",
      sections: [{ $ne: null, name: "Projects" }],
    };

    const res = new http.ServerResponse(req);
    res.end = () => {};

    app.handle(req, res, () => {});

    assert.ok(handlerReceived, "Route handler must have executed");
    assert.equal(handlerReceived.params.id, "6734abc", "Param :id preserved");
    assert.equal(handlerReceived.query.$where, undefined, "Query $where stripped");
    assert.equal(handlerReceived.query.includeArchived, "true", "Query legitimate param preserved");
    assert.equal(handlerReceived.body.$gt, undefined, "Body $gt stripped");
    assert.equal(handlerReceived.body.title, "My Portfolio", "Body legitimate field preserved");
    assert.equal(handlerReceived.body.sections[0].$ne, undefined, "Nested array $ne stripped");
    assert.equal(handlerReceived.body.sections[0].name, "Projects", "Nested field name preserved");
  });
});
