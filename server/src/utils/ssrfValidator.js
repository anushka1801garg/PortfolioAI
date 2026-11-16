import dns from "dns";
import http from "http";
import https from "https";
import axios from "axios";

/**
 * Checks whether an IPv4 or IPv6 address belongs to a private, loopback,
 * link-local, carrier-grade NAT, multicast, or reserved address block.
 *
 * @param {string} ip
 * @returns {boolean} True if the IP is private, internal, or restricted.
 */
export function isPrivateIp(ip) {
  if (!ip || typeof ip !== "string") return true;
  let cleanIp = ip.trim().toLowerCase();

  // Strip IPv4-mapped IPv6 prefix (e.g. ::ffff:127.0.0.1)
  if (cleanIp.startsWith("::ffff:")) {
    cleanIp = cleanIp.slice(7);
  }

  // 1. IPv4 Validation
  const ipv4Match = cleanIp.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const o1 = Number(ipv4Match[1]);
    const o2 = Number(ipv4Match[2]);
    const o3 = Number(ipv4Match[3]);
    const o4 = Number(ipv4Match[4]);

    if ([o1, o2, o3, o4].some((n) => n < 0 || n > 255)) return true;

    // 0.0.0.0/8 (Current network / "this host")
    if (o1 === 0) return true;
    // 10.0.0.0/8 (Private RFC 1918)
    if (o1 === 10) return true;
    // 127.0.0.0/8 (Loopback RFC 1122)
    if (o1 === 127) return true;
    // 169.254.0.0/16 (Link-local / Cloud metadata: 169.254.169.254)
    if (o1 === 169 && o2 === 254) return true;
    // 172.16.0.0/12 (Private RFC 1918)
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
    // 192.168.0.0/16 (Private RFC 1918)
    if (o1 === 192 && o2 === 168) return true;
    // 100.64.0.0/10 (Shared Address Space / CGNAT RFC 6598)
    if (o1 === 100 && o2 >= 64 && o2 <= 127) return true;
    // 192.0.0.0/24 (IETF Protocol Assignments)
    if (o1 === 192 && o2 === 0 && o3 === 0) return true;
    // 192.0.2.0/24 (TEST-NET-1)
    if (o1 === 192 && o2 === 0 && o3 === 2) return true;
    // 198.18.0.0/15 (Network benchmark tests RFC 2544)
    if (o1 === 198 && (o2 === 18 || o2 === 19)) return true;
    // 198.51.100.0/24 (TEST-NET-2)
    if (o1 === 198 && o2 === 51 && o3 === 100) return true;
    // 203.0.113.0/24 (TEST-NET-3)
    if (o1 === 203 && o2 === 0 && o3 === 113) return true;
    // 224.0.0.0/4 (Multicast RFC 5771) & 240.0.0.0/4 (Reserved / Future Use RFC 1112)
    if (o1 >= 224) return true;
    // 255.255.255.255 (Broadcast)
    if (o1 === 255 && o2 === 255 && o3 === 255 && o4 === 255) return true;

    return false;
  }

  // 2. IPv6 Validation
  const cleanIpv6 = cleanIp.replace(/^\[|\]$/g, "");
  // Loopback (::1) or Unspecified (::)
  if (
    cleanIpv6 === "::1" ||
    cleanIpv6 === "::" ||
    cleanIpv6 === "0:0:0:0:0:0:0:1" ||
    cleanIpv6 === "0:0:0:0:0:0:0:0"
  ) {
    return true;
  }
  // Link-local (fe80::/10: fe8*, fe9*, fea*, feb*)
  if (/^fe[89ab]/i.test(cleanIpv6)) return true;
  // Unique local addresses (fc00::/7: fc*, fd*)
  if (/^f[cd]/i.test(cleanIpv6)) return true;
  // Multicast (ff00::/8)
  if (/^ff/i.test(cleanIpv6)) return true;
  // Documentation prefix (2001:db8::/32)
  if (/^2001:db8/i.test(cleanIpv6)) return true;
  // 6to4 prefix (2002::/16) if embedding private IPv4
  if (/^2002:/i.test(cleanIpv6)) {
    const segments = cleanIpv6.split(":");
    if (segments.length >= 3 && segments[1] && segments[2]) {
      const hex1 = parseInt(segments[1], 16);
      const hex2 = parseInt(segments[2], 16);
      if (!isNaN(hex1) && !isNaN(hex2)) {
        const ip4 = `${(hex1 >> 8) & 0xff}.${hex1 & 0xff}.${(hex2 >> 8) & 0xff}.${hex2 & 0xff}`;
        if (isPrivateIp(ip4)) return true;
      }
    }
  }

  return false;
}

/**
 * Synchronous structural check for URL scrape safety.
 * Validates protocol, hostname, port, and explicit IP literals.
 *
 * @param {string} urlString
 * @returns {boolean} True if the URL is structurally acceptable.
 */
export function isSafeUrlForScrape(urlString) {
  try {
    if (!urlString || typeof urlString !== "string") return false;
    const trimmed = urlString.trim();
    const parsed = new URL(trimmed);

    // Only allow standard http and https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();
    const cleanHost = hostname.replace(/^\[|\]$/g, "");

    // Block loopback, local, and internal domain names
    if (
      cleanHost === "localhost" ||
      cleanHost.endsWith(".localhost") ||
      cleanHost.endsWith(".local") ||
      cleanHost.endsWith(".internal") ||
      cleanHost.endsWith(".lan") ||
      cleanHost.endsWith(".home") ||
      cleanHost.endsWith(".corp")
    ) {
      return false;
    }

    // Block well-known cloud instance metadata endpoints
    if (
      cleanHost === "169.254.169.254" ||
      cleanHost === "metadata.google.internal" ||
      cleanHost === "metadata.internal" ||
      cleanHost === "instance-data" ||
      cleanHost === "100.100.100.200"
    ) {
      return false;
    }

    // Reject dangerous non-HTTP ports
    if (parsed.port) {
      const portNum = Number(parsed.port);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        return false;
      }
      const DANGEROUS_PORTS = new Set([
        21, 22, 23, 25, 53, 69, 110, 111, 135, 137, 138, 139, 143, 445, 1433, 1521, 3306, 3389, 5432, 6379, 11211, 27017,
      ]);
      if (DANGEROUS_PORTS.has(portNum)) {
        return false;
      }
    }

    // Check if the host is a raw IP literal
    if (isPrivateIp(cleanHost)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Validates that a URL is a legitimate HTTPS LinkedIn URL.
 * Requires https: protocol and hostname 'linkedin.com' or legitimate subdomains.
 *
 * @param {string} urlString
 * @returns {boolean} True if the URL is a valid, secure LinkedIn URL.
 */
export function isValidLinkedInUrl(urlString) {
  if (!urlString || typeof urlString !== "string") return false;
  try {
    const trimmed = urlString.trim();
    const parsed = new URL(trimmed);

    // Strictly require HTTPS
    if (parsed.protocol !== "https:") {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Must be exactly linkedin.com or end with .linkedin.com
    if (hostname !== "linkedin.com" && !hostname.endsWith(".linkedin.com")) {
      return false;
    }

    // Reject prefix bypasses (e.g. fake-linkedin.com, linkedin.com.attacker.com)
    const parts = hostname.split(".");
    if (parts.length < 2) return false;
    const domain = parts.slice(-2).join(".");
    if (domain !== "linkedin.com") {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Creates a custom DNS lookup function that always returns the pinned IP address.
 * Conforms to Node.js `dns.lookup` callback signature:
 * - If `options.all === true`, invokes `callback(null, [{ address, family }])`
 * - Otherwise, invokes `callback(null, address, family)`
 *
 * @param {string} pinnedIp The validated IP address to pin the connection to.
 * @param {number} ipFamily IP family (4 or 6).
 * @returns {Function} Custom lookup callback for Node.js http/https Agent.
 */
export function createPinnedLookup(pinnedIp, ipFamily = 4) {
  const family = Number(ipFamily) === 6 ? 6 : 4;
  return function pinnedLookup(hostname, options, callback) {
    let cb = callback;
    let opts = options;
    if (typeof options === "function") {
      cb = options;
      opts = {};
    }
    if (typeof cb !== "function") return;

    if (opts && opts.all) {
      return cb(null, [{ address: pinnedIp, family }]);
    }
    return cb(null, pinnedIp, family);
  };
}

/**
 * Asynchronously resolves domain via DNS and verifies that all resolved IP
 * addresses are globally routable, non-private, and safe.
 *
 * @param {string} urlString
 * @param {Function} lookupFn Optional DNS lookup function for testing/injection
 * @returns {Promise<{ safe: boolean, reason?: string, hostname?: string, validatedIp?: string, ipFamily?: number, allIps?: string[] }>}
 */
export async function resolveAndValidateUrl(urlString, lookupFn = dns.promises.lookup) {
  if (!isSafeUrlForScrape(urlString)) {
    return {
      safe: false,
      reason: "URL failed structural SSRF validation policy.",
    };
  }

  try {
    const parsed = new URL(urlString.trim());
    const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");

    // If hostname is already a verified non-private IP literal
    const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    const isIpv6 = hostname.includes(":");
    if (isIpv4 || isIpv6) {
      if (isPrivateIp(hostname)) {
        return { safe: false, reason: `Target IP ${hostname} is private or restricted.` };
      }
      return {
        safe: true,
        hostname,
        validatedIp: hostname,
        ipFamily: isIpv6 ? 6 : 4,
        allIps: [hostname],
      };
    }

    // Perform DNS resolution for domain names
    let records = [];
    try {
      records = await lookupFn(hostname, { all: true });
    } catch (dnsErr) {
      return {
        safe: false,
        reason: `DNS lookup failed for ${hostname}: ${dnsErr.message}`,
      };
    }

    if (!records || records.length === 0) {
      return { safe: false, reason: `No DNS records returned for ${hostname}` };
    }

    // Verify EVERY resolved IP address. If ANY address is private/restricted, reject immediately.
    for (const record of records) {
      if (isPrivateIp(record.address)) {
        return {
          safe: false,
          reason: `Host ${hostname} resolves to private/restricted IP: ${record.address}`,
        };
      }
    }

    // Select the primary validated IP address
    const primaryRecord = records[0];
    const validatedIp = primaryRecord.address;
    const ipFamily = primaryRecord.family || (validatedIp.includes(":") ? 6 : 4);

    return {
      safe: true,
      hostname,
      validatedIp,
      ipFamily,
      allIps: records.map((r) => r.address),
    };
  } catch (err) {
    return { safe: false, reason: err.message };
  }
}

/**
 * Secure HTTP GET request wrapper with Socket-Level IP Pinning.
 *
 * 1. Resolves and validates all DNS records against private/reserved CIDRs.
 * 2. Creates dedicated HTTP/HTTPS agents with a custom `lookup` function bound to the validated IP.
 * 3. Prevents secondary DNS lookups during socket creation (neutralizing TOCTOU DNS rebinding).
 * 4. Preserves TLS Server Name Indication (SNI) and certificate validation against the original hostname.
 * 5. Disables connection reuse (keepAlive: false) to prevent socket pollution.
 * 6. Intercepts HTTP 3xx redirects manually and re-validates and re-pins every redirect hop.
 *
 * @param {string} initialUrl
 * @param {Object} options Axios request options
 * @param {number} maxRedirects Maximum allowed redirect hops (default: 3)
 * @param {Function} lookupFn Optional DNS lookup function for testing/injection
 * @returns {Promise<import("axios").AxiosResponse>}
 */
export async function safeAxiosGet(initialUrl, options = {}, maxRedirects = 3, lookupFn = dns.promises.lookup) {
  if (!initialUrl || typeof initialUrl !== "string") {
    const error = new Error("SSRF_BLOCKED: URL must be a non-empty string.");
    error.isSsrfBlocked = true;
    throw error;
  }

  let currentUrl = initialUrl.trim();
  let redirectCount = 0;

  while (redirectCount <= maxRedirects) {
    // 1. Resolve and validate target URL and DNS records
    const validation = await resolveAndValidateUrl(currentUrl, lookupFn);
    if (!validation.safe) {
      const error = new Error(`SSRF_BLOCKED: ${validation.reason}`);
      error.isSsrfBlocked = true;
      throw error;
    }

    // 2. Create pinned DNS lookup function strictly returning the validated IP
    const pinnedLookup = createPinnedLookup(validation.validatedIp, validation.ipFamily);

    // 3. Create fresh, dedicated agents with socket-level IP pinning and disabled socket pooling
    const httpAgent = new http.Agent({
      lookup: pinnedLookup,
      keepAlive: false,
    });

    const httpsAgent = new https.Agent({
      lookup: pinnedLookup,
      keepAlive: false,
      // Note: rejectUnauthorized defaults to true; TLS SNI and cert checks use the hostname from currentUrl
    });

    // 4. Configure Axios with pinned agents, disabling automatic redirects and proxy interception
    const requestOptions = {
      ...options,
      httpAgent,
      httpsAgent,
      maxRedirects: 0,
      proxy: false,
      validateStatus: (status) => status < 400 || (status >= 300 && status < 400),
    };

    const response = await axios.get(currentUrl, requestOptions);

    // If standard successful response (2xx)
    if (response.status >= 200 && response.status < 300) {
      return response;
    }

    // 5. Handle HTTP 3xx Redirects safely
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.location;
      if (!location) {
        throw new Error(`Redirect status ${response.status} received without Location header.`);
      }

      // Resolve relative or absolute redirect against current URL
      let nextUrl;
      try {
        nextUrl = new URL(location, currentUrl).href;
      } catch (urlErr) {
        const err = new Error(`SSRF_BLOCKED: Malformed redirect Location header: ${location}`);
        err.isSsrfBlocked = true;
        throw err;
      }

      redirectCount++;
      if (redirectCount > maxRedirects) {
        const err = new Error(`SSRF_REDIRECT_EXCEEDED: Maximum redirect limit of ${maxRedirects} exceeded.`);
        err.isSsrfBlocked = true;
        throw err;
      }

      currentUrl = nextUrl;
      continue;
    }

    return response;
  }

  throw new Error("Unexpected redirect loop completion");
}

export default {
  isPrivateIp,
  isSafeUrlForScrape,
  isValidLinkedInUrl,
  createPinnedLookup,
  resolveAndValidateUrl,
  safeAxiosGet,
};
