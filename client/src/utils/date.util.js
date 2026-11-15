/**
 * Centralized Indian Date & Relative Time Utility
 * Standardizes date presentation across PortfolioAI using the "en-IN" locale.
 */

/**
 * Formats a timestamp or date into Indian readable date format (e.g. "14 Nov 2026").
 * Safely handles null, undefined, and invalid inputs without throwing.
 *
 * @param {Date|string|number} dateInput - Input date, ISO string, or epoch timestamp
 * @param {Intl.DateTimeFormatOptions} [options] - Optional custom Intl formatting options
 * @returns {string} Formatted Indian date string, or empty string if invalid
 */
export const formatIndianDate = (dateInput, options = {}) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";

  const defaultOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  };

  try {
    return date.toLocaleDateString("en-IN", defaultOptions);
  } catch {
    return "";
  }
};

/**
 * Formats a date into a human-friendly relative time string (e.g. "just now", "2 hours ago"),
 * falling back to formatted Indian date (e.g. "14 Nov 2026") for older dates (> 7 days).
 *
 * @param {Date|string|number} dateInput - Input date, ISO string, or epoch timestamp
 * @returns {string} Relative or formatted Indian date string
 */
export const formatRelativeTime = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";

  const now = Date.now();
  const diffMs = now - date.getTime();

  // If in future or updated within last 60 seconds
  if (diffMs < 60 * 1000) {
    return "just now";
  }

  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? "min" : "mins"} ago`;
  }

  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  }

  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 1) {
    return "yesterday";
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  // Fall back to readable Indian date
  return formatIndianDate(date);
};

/**
 * Formats date for portfolio card snapshots:
 * Returns both structured display date and relative time string.
 *
 * @param {Date|string|number} dateInput
 * @returns {{ readableDate: string, relativeTime: string, formattedSummary: string }}
 */
export const formatPortfolioSnapshotDate = (dateInput) => {
  const readableDate = formatIndianDate(dateInput);
  const relativeTime = formatRelativeTime(dateInput);
  return {
    readableDate,
    relativeTime,
    formattedSummary: readableDate ? `${readableDate}${relativeTime && relativeTime !== readableDate ? ` (${relativeTime})` : ""}` : "",
  };
};

export default {
  formatIndianDate,
  formatRelativeTime,
  formatPortfolioSnapshotDate,
};
