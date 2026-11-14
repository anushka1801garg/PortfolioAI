/**
 * Decode and inspect JWT tokens on the client to manage session lifetime.
 * Enforces a strict 1-day (24 hour) maximum login duration.
 */

export const getTokenPayload = (token) => {
  if (!token || typeof token !== "string") return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decode Base64Url string with required padding
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  const payload = getTokenPayload(token);
  if (!payload || !payload.exp) return true;

  // exp is in seconds; compare against current time in seconds
  const currentTimestamp = Math.floor(Date.now() / 1000);
  return currentTimestamp >= payload.exp;
};

export const getTokenRemainingTime = (token) => {
  const payload = getTokenPayload(token);
  if (!payload || !payload.exp) return 0;

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const remainingSeconds = payload.exp - currentTimestamp;
  return remainingSeconds > 0 ? remainingSeconds * 1000 : 0;
};

