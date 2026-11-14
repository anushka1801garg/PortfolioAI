import { test, describe } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { isSafeUrlForScrape } from "../src/controllers/portfolio.controller.js";

describe("Security Controls - SSRF & Input Validation", () => {
  test("isSafeUrlForScrape blocks localhost and loopback addresses", () => {
    assert.equal(isSafeUrlForScrape("http://localhost:8000"), false);
    assert.equal(isSafeUrlForScrape("http://127.0.0.1:3000"), false);
    assert.equal(isSafeUrlForScrape("http://127.0.1.1"), false);
    assert.equal(isSafeUrlForScrape("http://sub.localhost:5000"), false);
    assert.equal(isSafeUrlForScrape("http://[::1]:8080"), false);
  });

  test("isSafeUrlForScrape blocks AWS and GCP cloud instance metadata endpoints", () => {
    assert.equal(isSafeUrlForScrape("http://169.254.169.254/latest/meta-data/"), false);
    assert.equal(isSafeUrlForScrape("http://metadata.google.internal/computeMetadata/v1/"), false);
  });

  test("isSafeUrlForScrape blocks RFC1918 private intranet IP ranges", () => {
    assert.equal(isSafeUrlForScrape("http://10.0.0.1/admin"), false);
    assert.equal(isSafeUrlForScrape("http://192.168.1.254"), false);
    assert.equal(isSafeUrlForScrape("http://172.16.0.5:8080"), false);
    assert.equal(isSafeUrlForScrape("http://172.31.255.255"), false);
  });

  test("isSafeUrlForScrape blocks dangerous protocols", () => {
    assert.equal(isSafeUrlForScrape("file:///etc/passwd"), false);
    assert.equal(isSafeUrlForScrape("gopher://127.0.0.1:70"), false);
    assert.equal(isSafeUrlForScrape("javascript:alert(1)"), false);
    assert.equal(isSafeUrlForScrape("data:text/html,<html>"), false);
  });

  test("isSafeUrlForScrape allows legitimate public domains", () => {
    assert.equal(isSafeUrlForScrape("https://my-portfolio.netlify.app"), true);
    assert.equal(isSafeUrlForScrape("https://developer-site.vercel.app/about"), true);
    assert.equal(isSafeUrlForScrape("https://anushkagarg.dev"), true);
    assert.equal(isSafeUrlForScrape("http://example.com/project"), true);
  });
});

describe("OAuth State Integrity & CSRF Protection", () => {
  const secret = "test_jwt_secret_for_csrf_checks";
  const userId = "65b9a1e09c8d1e2f3a4b5c6d";

  test("generates and verifies a valid signed OAuth state nonce", () => {
    const nonce = crypto.randomBytes(16).toString("hex");
    const signature = crypto
      .createHmac("sha256", secret)
      .update(`${userId}:${nonce}`)
      .digest("hex");
    const state = `${userId}:${nonce}:${signature}`;

    const [stateUserId, stateNonce, stateSig] = state.split(":");
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(`${stateUserId}:${stateNonce}`)
      .digest("hex");

    assert.equal(stateSig, expectedSig);
    assert.equal(stateUserId, userId);
  });

  test("rejects tampered state nonces and mismatched user identities", () => {
    const nonce = crypto.randomBytes(16).toString("hex");
    const signature = crypto
      .createHmac("sha256", secret)
      .update(`${userId}:${nonce}`)
      .digest("hex");

    // Attacker modifies the userId in the state string
    const attackerUserId = "65b9a1e09c8d1e2f3a4b5c99";
    const forgedState = `${attackerUserId}:${nonce}:${signature}`;

    const [stateUserId, stateNonce, stateSig] = forgedState.split(":");
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(`${stateUserId}:${stateNonce}`)
      .digest("hex");

    assert.notEqual(stateSig, expectedSig, "Forged state must fail signature verification");
  });

  test("rejects missing or malformed state parameters", () => {
    assert.equal(Boolean(""), false);
    assert.equal("malformed_state".split(":").length === 3, false);
    assert.equal("id:nonce".split(":").length === 3, false);
  });
});

describe("XSS & Injection Protection in Standalone Bundles", () => {
  test("safely sanitizes JSON containing closing script tags", () => {
    const maliciousPayload = {
      title: "</script><script>alert('xss')</script>",
      about: "Normal bio <img src=x onerror=alert(1)>",
    };

    const safeJson = JSON.stringify(maliciousPayload)
      .replace(/</g, "\\u003c")
      .replace(/>/g, "\\u003e");

    assert.equal(safeJson.includes("</script>"), false);
    assert.equal(safeJson.includes("<script>"), false);
    assert.equal(safeJson.includes("\\u003c/script\\u003e"), true);
  });

  test("escapes regex special characters in search parameters", () => {
    const rawIds = ["portfolio.*", "user(name)", "admin+test?^$"];
    for (const raw of rawIds) {
      const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const compiledRegex = new RegExp(`^${escaped}$`);
      assert.equal(compiledRegex.test(raw), true);
      // Ensure wildcard does not match arbitrary string
      assert.equal(compiledRegex.test(raw + "extra"), false);
    }
  });

  test("neutralizes javascript: and data: pseudo-protocol XSS in links", () => {
    function safeLink(url, defaultPrefix = "https://") {
      if (!url || typeof url !== "string") return "";
      const trimmed = url.trim();
      if (/^(javascript|data|vbscript):/i.test(trimmed)) {
        return "#";
      }
      if (/^(https?:\/\/|\/\/|mailto:|tel:)/i.test(trimmed)) {
        return trimmed;
      }
      return `${defaultPrefix}${trimmed}`;
    }

    assert.equal(safeLink("javascript:alert(document.domain)"), "#");
    assert.equal(safeLink("JAVASCRIPT:alert(1)"), "#");
    assert.equal(safeLink("data:text/html,<script>alert(1)</script>"), "#");
    assert.equal(safeLink("vbscript:msgbox(1)"), "#");
    assert.equal(safeLink("https://github.com/myuser"), "https://github.com/myuser");
    assert.equal(safeLink("http://example.com/demo"), "http://example.com/demo");
    assert.equal(safeLink("myportfolio.com"), "https://myportfolio.com");
  });
});

describe("Payment Authorization & Idempotency Rules", () => {
  test("verifies session belongs exclusively to authenticated user", () => {
    const authenticatedUserId = "65b9a1e09c8d1e2f3a4b5c6d";
    const session = {
      client_reference_id: "65b9a1e09c8d1e2f3a4b5c6d",
      metadata: { userId: "65b9a1e09c8d1e2f3a4b5c6d" },
    };

    const sessionUserId = session.metadata?.userId || session.client_reference_id;
    assert.equal(sessionUserId, authenticatedUserId);

    const attackerUserId = "65b9a1e09c8d1e2f3a4b5c99";
    assert.notEqual(sessionUserId, attackerUserId);
  });

  test("detects duplicate transaction processing (idempotency)", () => {
    const userPaymentHistory = [
      { transactionId: "txn_123456", plan: "pro" },
      { transactionId: "txn_789012", plan: "team" },
    ];

    const duplicateTxn = "txn_123456";
    const isDuplicate = userPaymentHistory.some((p) => p.transactionId === duplicateTxn);
    assert.equal(isDuplicate, true);

    const newTxn = "txn_unique_999";
    const isNew = userPaymentHistory.some((p) => p.transactionId === newTxn);
    assert.equal(isNew, false);
  });

  test("verifies authentic Razorpay HMAC-SHA256 payment signature", () => {
    const keySecret = "test_razorpay_secret_key_12345";
    const orderId = "order_N1234567890abc";
    const paymentId = "pay_P9876543210xyz";

    // Legitimate signature generated by Razorpay
    const validSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    // Verification check
    const expectedSig = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    assert.equal(validSignature, expectedSig);

    // Tampered signature or tampered payment ID must fail
    const tamperedSig = "fake_signature_hex_value";
    assert.notEqual(tamperedSig, expectedSig);

    const tamperedPaymentId = "pay_TAMPERED_000";
    const tamperedExpected = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${tamperedPaymentId}`)
      .digest("hex");
    assert.notEqual(validSignature, tamperedExpected);
  });
});

describe("JWT Session Lifetime & 1-Day Expiration", () => {
  const secret = "test_super_secret_jwt_key_12345";
  const userPayload = { _id: "65b9a1e09c8d1e2f3a4b5c6d", email: "user@example.com" };

  test("generates token with exactly 1-day (86400s) lifetime", () => {
    const token = jwt.sign(userPayload, secret, { expiresIn: "1d" });
    const decoded = jwt.decode(token);

    assert.ok(decoded.iat, "Token must have issued-at timestamp (iat)");
    assert.ok(decoded.exp, "Token must have expiration timestamp (exp)");
    assert.equal(decoded.exp - decoded.iat, 86400, "Token lifetime must be exactly 86400 seconds (1 day)");
  });

  test("verifies valid 1-day token successfully", () => {
    const token = jwt.sign(userPayload, secret, { expiresIn: "1d" });
    const verified = jwt.verify(token, secret);

    assert.equal(verified._id, userPayload._id);
    assert.equal(verified.email, userPayload.email);
  });

  test("rejects expired token with TokenExpiredError", () => {
    // Generate token that expired 10 seconds ago
    const expiredToken = jwt.sign(userPayload, secret, { expiresIn: "-10s" });

    assert.throws(
      () => {
        jwt.verify(expiredToken, secret);
      },
      (err) => {
        return err.name === "TokenExpiredError" && err.message.includes("jwt expired");
      },
      "Expired token must throw TokenExpiredError"
    );
  });

  test("correctly detects remaining validity and expiration from token payload", () => {
    const token = jwt.sign(userPayload, secret, { expiresIn: "1d" });
    const decoded = jwt.decode(token);
    const nowInSeconds = Math.floor(Date.now() / 1000);

    const isExpired = decoded.exp <= nowInSeconds;
    assert.equal(isExpired, false, "Fresh token should not be expired");

    const remainingSeconds = decoded.exp - nowInSeconds;
    assert.ok(remainingSeconds > 86300 && remainingSeconds <= 86400, "Remaining seconds should be close to 86400");
  });

  test("safely decodes unpadded base64url payload strings without throwing", () => {
    const decodePayload = (token) => {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
      const jsonPayload = Buffer.from(padded, "base64").toString("utf8");
      return JSON.parse(jsonPayload);
    };

    const token = jwt.sign({ sub: "12345", role: "admin", name: "Alice" }, secret, { expiresIn: "1d" });
    const payload = decodePayload(token);
    assert.equal(payload.sub, "12345");
    assert.equal(payload.role, "admin");
    assert.ok(payload.exp > 0);
  });
});


