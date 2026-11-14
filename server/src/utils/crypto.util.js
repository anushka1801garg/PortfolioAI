import crypto from "crypto";

/**
 * Derives a consistent 32-byte key for AES-256-GCM from ENCRYPTION_KEY or JWT_SECRET.
 * If fallbackSecret is explicitly passed, derives from that secret (used for backwards compatibility).
 */
function getEncryptionKey(overrideSecret = null) {
  if (overrideSecret) {
    return crypto.createHash("sha256").update(overrideSecret).digest();
  }

  const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!secret) {
    console.warn(
      "[crypto.util] Warning: ENCRYPTION_KEY and JWT_SECRET are unset. Using fallback key. Set ENCRYPTION_KEY in production."
    );
    return crypto
      .createHash("sha256")
      .update("portfolioai_dev_secure_aes256_key")
      .digest();
  }

  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypt a plaintext string (e.g. GitHub Access Token) using AES-256-GCM.
 * Output format: "enc:gcm:<iv_hex>:<authTag_hex>:<ciphertext_hex>"
 *
 * Provides:
 * 1. Confidentiality (AES-256 bit encryption)
 * 2. Authenticity & Integrity (GCM auth tag prevents tampering)
 * 3. Fresh randomized 12-byte IV for every encryption call
 */
export function encryptToken(text) {
  if (!text || typeof text !== "string") return "";

  // Avoid re-encrypting if already encrypted
  if (text.startsWith("enc:gcm:")) {
    return text;
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(12); // Standard 96-bit IV for AES-GCM
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");

    return `enc:gcm:${iv.toString("hex")}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error("[crypto.util] Failed to encrypt token:", err.message);
    return "";
  }
}

/**
 * Decrypt a token securely using AES-256-GCM.
 * If the input is unencrypted (legacy token), returns it as-is for backward compatibility.
 * If primary key decryption fails and a secondary JWT_SECRET exists, attempts fallback decryption.
 */
export function decryptToken(encryptedText) {
  if (!encryptedText || typeof encryptedText !== "string") return "";

  // If not formatted as encrypted token, return plaintext fallback
  if (!encryptedText.startsWith("enc:gcm:")) {
    return encryptedText;
  }

  const parts = encryptedText.split(":");
  if (parts.length !== 5) {
    console.warn("[crypto.util] Invalid encrypted token format");
    return "";
  }

  const [, , ivHex, authTagHex, cipherHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const tryDecryptWithKey = (key) => {
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(cipherHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  };

  try {
    const primaryKey = getEncryptionKey();
    return tryDecryptWithKey(primaryKey);
  } catch (primaryErr) {
    // If ENCRYPTION_KEY was set and differed from legacy JWT_SECRET, attempt backward-compatible fallback
    if (process.env.ENCRYPTION_KEY && process.env.JWT_SECRET) {
      try {
        const fallbackKey = getEncryptionKey(process.env.JWT_SECRET);
        return tryDecryptWithKey(fallbackKey);
      } catch {
        // Fallback also failed
      }
    }
    console.error("[crypto.util] Failed to decrypt token (tampered or invalid key):", primaryErr.message);
    return "";
  }
}
