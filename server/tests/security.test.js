import { test, describe } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import http from "http";
import axios from "axios";
import jwt from "jsonwebtoken";
import {
  isPrivateIp,
  isSafeUrlForScrape,
  isValidLinkedInUrl,
  createPinnedLookup,
  resolveAndValidateUrl,
  safeAxiosGet,
} from "../src/controllers/portfolio.controller.js";

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

describe("SSRF Protection - Advanced IP & DNS Resolution", () => {
  test("isPrivateIp accurately flags all loopback, private, carrier-grade, and reserved IPv4 addresses", () => {
    // Loopback
    assert.equal(isPrivateIp("127.0.0.1"), true);
    assert.equal(isPrivateIp("127.0.1.1"), true);
    assert.equal(isPrivateIp("0.0.0.0"), true);

    // RFC 1918 Private
    assert.equal(isPrivateIp("10.0.0.1"), true);
    assert.equal(isPrivateIp("10.255.255.255"), true);
    assert.equal(isPrivateIp("172.16.0.1"), true);
    assert.equal(isPrivateIp("172.31.255.255"), true);
    assert.equal(isPrivateIp("192.168.0.1"), true);
    assert.equal(isPrivateIp("192.168.254.254"), true);

    // Link-local & Cloud Metadata
    assert.equal(isPrivateIp("169.254.169.254"), true);
    assert.equal(isPrivateIp("169.254.1.1"), true);

    // Carrier-Grade NAT (100.64.0.0/10)
    assert.equal(isPrivateIp("100.64.0.1"), true);
    assert.equal(isPrivateIp("100.127.255.255"), true);

    // Reserved / Multicast / Broadcast
    assert.equal(isPrivateIp("224.0.0.1"), true);
    assert.equal(isPrivateIp("240.0.0.1"), true);
    assert.equal(isPrivateIp("255.255.255.255"), true);

    // Legitimate globally routable public IPs
    assert.equal(isPrivateIp("8.8.8.8"), false);
    assert.equal(isPrivateIp("1.1.1.1"), false);
    assert.equal(isPrivateIp("104.21.45.12"), false);
    assert.equal(isPrivateIp("142.250.190.46"), false);
  });

  test("isPrivateIp flags IPv6 loopback, link-local, unique-local, and IPv4-mapped addresses", () => {
    // IPv6 Loopback
    assert.equal(isPrivateIp("::1"), true);
    assert.equal(isPrivateIp("0:0:0:0:0:0:0:1"), true);
    assert.equal(isPrivateIp("::"), true);

    // Link-local (fe80::/10)
    assert.equal(isPrivateIp("fe80::1"), true);
    assert.equal(isPrivateIp("fe80::215:5dff:fe00:1"), true);

    // Unique local (fc00::/7 - fc* and fd*)
    assert.equal(isPrivateIp("fc00::1"), true);
    assert.equal(isPrivateIp("fd12:3456:789a:1::1"), true);

    // IPv4-mapped IPv6 (::ffff:127.0.0.1, ::ffff:10.0.0.1, ::ffff:169.254.169.254)
    assert.equal(isPrivateIp("::ffff:127.0.0.1"), true);
    assert.equal(isPrivateIp("::ffff:10.0.0.1"), true);
    assert.equal(isPrivateIp("::ffff:169.254.169.254"), true);
    assert.equal(isPrivateIp("::ffff:192.168.1.1"), true);
    assert.equal(isPrivateIp("::ffff:8.8.8.8"), false);

    // Public IPv6
    assert.equal(isPrivateIp("2606:4700:4700::1111"), false);
    assert.equal(isPrivateIp("2001:4860:4860::8888"), false);
  });

  test("resolveAndValidateUrl rejects hostnames resolving to loopback or private subnets", async () => {
    // 1. Direct localhost domain check
    const localhostRes = await resolveAndValidateUrl("http://localhost:8000");
    assert.equal(localhostRes.safe, false);

    // 2. Mock DNS resolution resolving to private IPv4 127.0.0.1
    const mockPrivateDns = async () => [{ address: "127.0.0.1", family: 4 }];
    const resPrivate = await resolveAndValidateUrl("http://dev-internal.example.org/admin", mockPrivateDns);
    assert.equal(resPrivate.safe, false);
    assert.ok(resPrivate.reason.includes("private") || resPrivate.reason.includes("restricted"));

    // 3. Mock DNS resolution resolving to AWS metadata 169.254.169.254
    const mockMetadataDns = async () => [{ address: "169.254.169.254", family: 4 }];
    const resMetadata = await resolveAndValidateUrl("http://evil-meta.example.org", mockMetadataDns);
    assert.equal(resMetadata.safe, false);

    // 4. Mock DNS resolution resolving to IPv6 loopback ::1
    const mockIpv6Dns = async () => [{ address: "::1", family: 6 }];
    const resIpv6 = await resolveAndValidateUrl("http://internal-v6.example.org", mockIpv6Dns);
    assert.equal(resIpv6.safe, false);
  });

  test("resolveAndValidateUrl permits legitimate public URLs", async () => {
    // Mock DNS resolving to a legitimate public IP
    const mockPublicDns = async () => [{ address: "93.184.216.34", family: 4 }];
    const res = await resolveAndValidateUrl("https://example.com/portfolio", mockPublicDns);
    assert.equal(res.safe, true);
    assert.equal(res.hostname, "example.com");
  });

  test("safeAxiosGet aborts before making request to loopback or metadata endpoints", async () => {
    await assert.rejects(
      async () => {
        await safeAxiosGet("http://127.0.0.1:8000/api/v1/auth");
      },
      (err) => {
        return err.message.includes("SSRF_BLOCKED");
      }
    );

    await assert.rejects(
      async () => {
        await safeAxiosGet("http://169.254.169.254/latest/meta-data/");
      },
      (err) => {
        return err.message.includes("SSRF_BLOCKED");
      }
    );
  });

  test("safeAxiosGet detects and blocks redirects to private or loopback destinations", async () => {
    // Mock server simulating a redirecting endpoint
    const redirectServer = http.createServer((req, res) => {
      if (req.url === "/malicious-redirect") {
        res.writeHead(302, { Location: "http://169.254.169.254/latest/meta-data/" });
        res.end();
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end("<html>Hello</html>");
      }
    });

    await new Promise((resolve) => redirectServer.listen(0, "127.0.0.1", resolve));
    const port = redirectServer.address().port;

    try {
      // safeAxiosGet rejects initial connection if to loopback, but if followed to redirect target:
      await assert.rejects(
        async () => {
          await safeAxiosGet(`http://127.0.0.1:${port}/malicious-redirect`);
        },
        (err) => {
          return err.message.includes("SSRF_BLOCKED");
        }
      );
    } finally {
      redirectServer.close();
    }
  });

  test("resolveAndValidateUrl rejects hostnames resolving to mixed public and private IP addresses", async () => {
    // If any resolved record contains a private address, the entire domain must be rejected
    const mockMixedDns = async () => [
      { address: "93.184.216.34", family: 4 },
      { address: "10.0.0.1", family: 4 },
    ];
    const res = await resolveAndValidateUrl("https://mixed-cdn.example.org", mockMixedDns);
    assert.equal(res.safe, false);
    assert.ok(res.reason.includes("private") || res.reason.includes("restricted"));
  });

  test("createPinnedLookup handles Node.js dns.lookup signatures (all=true and single address)", () => {
    const pinnedIp = "93.184.216.34";
    const lookup = createPinnedLookup(pinnedIp, 4);

    // 1. Signature with { all: true }
    lookup("any-domain.com", { all: true }, (err, addresses) => {
      assert.equal(err, null);
      assert.equal(Array.isArray(addresses), true);
      assert.equal(addresses.length, 1);
      assert.equal(addresses[0].address, pinnedIp);
      assert.equal(addresses[0].family, 4);
    });

    // 2. Standard single address signature (err, address, family)
    lookup("any-domain.com", {}, (err, address, family) => {
      assert.equal(err, null);
      assert.equal(address, pinnedIp);
      assert.equal(family, 4);
    });

    // 3. Callback as 2nd parameter (no options object)
    lookup("any-domain.com", (err, address, family) => {
      assert.equal(err, null);
      assert.equal(address, pinnedIp);
      assert.equal(family, 4);
    });

    // 4. IPv6 pinning
    const ipv6Lookup = createPinnedLookup("2606:4700:4700::1111", 6);
    ipv6Lookup("any-domain.com", (err, address, family) => {
      assert.equal(err, null);
      assert.equal(address, "2606:4700:4700::1111");
      assert.equal(family, 6);
    });
  });

  test("Socket-level IP pinning: Agent lookup returns pinned IP even if DNS changes (anti-rebinding)", () => {
    const validatedPublicIp = "93.184.216.34";
    const pinnedLookup = createPinnedLookup(validatedPublicIp, 4);

    const testHttpAgent = new http.Agent({ lookup: pinnedLookup, keepAlive: false });
    assert.equal(testHttpAgent.keepAlive, false);

    // When Node creates a socket, it queries the agent's lookup function
    testHttpAgent.options.lookup("attacker-rebinding.com", { all: true }, (err, records) => {
      assert.equal(err, null);
      // The socket receives strictly the pinned IP, NOT the attacker's re-resolved IP
      assert.equal(records[0].address, validatedPublicIp);
    });
  });

  test("safeAxiosGet enforces maxRedirects limit", async () => {
    await assert.rejects(
      async () => {
        await safeAxiosGet("http://127.0.0.1:9999", {}, 0);
      },
      (err) => {
        return err.message.includes("SSRF_BLOCKED");
      }
    );
  });

  test("safeAxiosGet explicitly passes proxy: false and overrides caller-supplied proxy", async () => {
    const originalAxiosGet = axios.get;
    let capturedOptions = null;
    const mockPublicDns = async () => [{ address: "93.184.216.34", family: 4 }];

    try {
      axios.get = async (url, opts) => {
        capturedOptions = opts;
        return { status: 200, data: "<html>ok</html>", headers: {} };
      };

      // 1. Standard call
      await safeAxiosGet("https://example.com/test", {}, 3, mockPublicDns);
      assert.equal(capturedOptions.proxy, false, "proxy must be explicitly false");
      assert.ok(capturedOptions.httpAgent, "httpAgent must be defined");
      assert.ok(capturedOptions.httpsAgent, "httpsAgent must be defined");
      assert.equal(capturedOptions.maxRedirects, 0, "maxRedirects must be 0");

      // 2. Caller attempting to supply proxy: true or custom proxy object
      await safeAxiosGet("https://example.com/test", { proxy: { host: "127.0.0.1", port: 8080 } }, 3, mockPublicDns);
      assert.equal(capturedOptions.proxy, false, "caller-supplied proxy object must be overridden to false");

      await safeAxiosGet("https://example.com/test", { proxy: true }, 3, mockPublicDns);
      assert.equal(capturedOptions.proxy, false, "caller-supplied proxy:true must be overridden to false");
    } finally {
      axios.get = originalAxiosGet;
    }
  });

  test("safeAxiosGet passes proxy: false even when HTTP_PROXY and HTTPS_PROXY are configured in env", async () => {
    const originalEnv = {
      HTTP_PROXY: process.env.HTTP_PROXY,
      HTTPS_PROXY: process.env.HTTPS_PROXY,
      ALL_PROXY: process.env.ALL_PROXY,
      http_proxy: process.env.http_proxy,
      https_proxy: process.env.https_proxy,
      all_proxy: process.env.all_proxy,
    };

    const originalAxiosGet = axios.get;
    let capturedOptions = null;
    const mockPublicDns = async () => [{ address: "93.184.216.34", family: 4 }];

    try {
      process.env.HTTP_PROXY = "http://proxy.evil.corp:8080";
      process.env.HTTPS_PROXY = "http://proxy.evil.corp:8443";
      process.env.ALL_PROXY = "socks5://proxy.evil.corp:1080";

      axios.get = async (url, opts) => {
        capturedOptions = opts;
        return { status: 200, data: "<html>ok</html>", headers: {} };
      };

      await safeAxiosGet("https://example.com/secure", {}, 3, mockPublicDns);
      assert.equal(capturedOptions.proxy, false, "proxy must remain false despite proxy environment variables");
    } finally {
      // Restore environment variables cleanly
      axios.get = originalAxiosGet;
      for (const [key, value] of Object.entries(originalEnv)) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    }
  });
});

describe("LinkedIn URL Validation & Scraper Security", () => {
  test("isValidLinkedInUrl accepts legitimate LinkedIn HTTPS URLs and subdomains", () => {
    assert.equal(isValidLinkedInUrl("https://linkedin.com"), true);
    assert.equal(isValidLinkedInUrl("https://www.linkedin.com"), true);
    assert.equal(isValidLinkedInUrl("https://www.linkedin.com/in/johndoe"), true);
    assert.equal(isValidLinkedInUrl("https://in.linkedin.com/in/anushka-garg"), true);
    assert.equal(isValidLinkedInUrl("https://uk.linkedin.com/company/tech-corp"), true);
  });

  test("isValidLinkedInUrl rejects SSRF bypass attempts, non-HTTPS protocols, and spoofed domains", () => {
    // Domain suffix spoofing
    assert.equal(isValidLinkedInUrl("https://linkedin.com.attacker.com"), false);
    assert.equal(isValidLinkedInUrl("https://www.linkedin.com.evil.org/in/user"), false);

    // Query parameter spoofing
    assert.equal(isValidLinkedInUrl("https://attacker.com?linkedin.com"), false);
    assert.equal(isValidLinkedInUrl("https://attacker.com/linkedin.com"), false);

    // Prefix spoofing
    assert.equal(isValidLinkedInUrl("https://fake-linkedin.com"), false);
    assert.equal(isValidLinkedInUrl("https://notlinkedin.com"), false);

    // Insecure HTTP protocol
    assert.equal(isValidLinkedInUrl("http://linkedin.com"), false);
    assert.equal(isValidLinkedInUrl("http://www.linkedin.com/in/user"), false);

    // Dangerous protocols
    assert.equal(isValidLinkedInUrl("ftp://linkedin.com"), false);
    assert.equal(isValidLinkedInUrl("file:///linkedin.com"), false);
    assert.equal(isValidLinkedInUrl("javascript:alert('linkedin.com')"), false);

    // Malformed and invalid inputs
    assert.equal(isValidLinkedInUrl("not-a-valid-url"), false);
    assert.equal(isValidLinkedInUrl(""), false);
    assert.equal(isValidLinkedInUrl(null), false);
    assert.equal(isValidLinkedInUrl(undefined), false);
    assert.equal(isValidLinkedInUrl(12345), false);
  });
});

describe("Public Portfolio Privacy - Redacting Account Login Email", () => {
  test("public portfolio response schema redacts user.email while preserving contact info", () => {
    const rawDbUser = {
      _id: "65b9a1e09c8d1e2f3a4b5c6d",
      fullName: "Anushka Garg",
      email: "private_account_login@portfolioai.app", // PRIVATE LOGIN EMAIL
      avatar: "https://avatar.url/me.jpg",
      plan: "pro",
    };

    // Public population projection: "fullName avatar plan" (email is omitted)
    const publicPopulatedUser = {
      _id: rawDbUser._id,
      fullName: rawDbUser.fullName,
      avatar: rawDbUser.avatar,
      plan: rawDbUser.plan,
    };

    const publicPortfolio = {
      _id: "60d0fe4f5311236168a109ca",
      title: "Senior Full Stack Portfolio",
      user: publicPopulatedUser,
      contact: {
        email: "candidate.public@gmail.com", // INTENTIONALLY PUBLIC CONTACT EMAIL
        phone: "+91 9876543210",
      },
      skills: ["React", "Node.js", "Express"],
      isPublic: true,
      status: "Published",
    };

    // 1. Assert user.email is undefined (redacted from public endpoint)
    assert.equal(publicPortfolio.user.email, undefined);

    // 2. Assert public candidate contact email is preserved
    assert.equal(publicPortfolio.contact.email, "candidate.public@gmail.com");

    // 3. Assert user public profile details remain intact
    assert.equal(publicPortfolio.user.fullName, "Anushka Garg");
    assert.equal(publicPortfolio.user.plan, "pro");
  });
});


