import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { encryptToken, decryptToken } from "../src/utils/crypto.util.js";

describe("Crypto Utility - AES-256-GCM Token Encryption", () => {
  test("encrypts and decrypts a token successfully", () => {
    const rawToken = "ghp_secureOAuthAccessToken1234567890abcdef";
    const encrypted = encryptToken(rawToken);

    assert.ok(encrypted.startsWith("enc:gcm:"), "Should be prefixed with enc:gcm:");
    assert.notEqual(encrypted, rawToken, "Encrypted output should not match plaintext");

    const parts = encrypted.split(":");
    assert.equal(parts.length, 5, "Format must be enc:gcm:<iv>:<authTag>:<ciphertext>");

    const decrypted = decryptToken(encrypted);
    assert.equal(decrypted, rawToken, "Decrypted token must match original plaintext");
  });

  test("encryption is non-deterministic (unique IV per call)", () => {
    const rawToken = "ghp_sampleToken999";
    const enc1 = encryptToken(rawToken);
    const enc2 = encryptToken(rawToken);

    assert.notEqual(enc1, enc2, "Each encryption call must produce a unique randomized IV and ciphertext");
    assert.equal(decryptToken(enc1), rawToken);
    assert.equal(decryptToken(enc2), rawToken);
  });

  test("does not double-encrypt an already encrypted token", () => {
    const rawToken = "ghp_sampleToken888";
    const enc = encryptToken(rawToken);
    const encDouble = encryptToken(enc);

    assert.equal(enc, encDouble, "Already encrypted token should be returned as-is");
  });

  test("handles tampered ciphertext or auth tag gracefully", () => {
    const rawToken = "ghp_sensitiveTokenToTamper";
    const enc = encryptToken(rawToken);
    const parts = enc.split(":");

    // Flip bits in ciphertext
    const tamperedCipher = parts[4].slice(0, -2) + "00";
    const tampered = `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}:${tamperedCipher}`;

    const decrypted = decryptToken(tampered);
    assert.equal(decrypted, "", "Tampered token must fail authentication and return empty string");
  });

  test("passes through legacy plaintext tokens for backward compatibility", () => {
    const legacyToken = "ghp_legacyUnencryptedToken12345";
    const result = decryptToken(legacyToken);
    assert.equal(result, legacyToken, "Unencrypted legacy tokens should pass through unchanged");
  });

  test("handles empty and non-string inputs safely", () => {
    assert.equal(encryptToken(""), "");
    assert.equal(encryptToken(null), "");
    assert.equal(encryptToken(undefined), "");
    assert.equal(decryptToken(""), "");
    assert.equal(decryptToken(null), "");
    assert.equal(decryptToken(undefined), "");
  });
});

