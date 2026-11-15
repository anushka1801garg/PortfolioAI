import mongoose from "mongoose";
import Portfolio from "../models/portfolio.model.js";

// Crawler User-Agent regex pattern for WhatsApp, Facebook, Twitter, LinkedIn, Telegram, and Slack
const SOCIAL_CRAWLER_REGEX =
  /whatsapp|facebookexternalhit|twitterbot|linkedinbot|telegrambot|slackbot/i;

/**
 * Checks whether the incoming User-Agent string is a recognized social media preview crawler.
 *
 * @param {string} userAgent
 * @returns {boolean}
 */
export const isSocialCrawler = (userAgent) => {
  if (!userAgent || typeof userAgent !== "string") return false;
  return SOCIAL_CRAWLER_REGEX.test(userAgent);
};

/**
 * Escapes characters for safe inclusion in HTML attributes and content to prevent XSS / injection.
 *
 * @param {string} str
 * @returns {string}
 */
export const escapeHtml = (str) => {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Validates that an image URL begins with http:// or https:// and does not use dangerous pseudo-protocols.
 *
 * @param {string} url
 * @param {string} fallback
 * @returns {string}
 */
export const sanitizeImageUrl = (url, fallback) => {
  if (!url || typeof url !== "string") return fallback;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return fallback;
};

/**
 * Generates Open Graph and Twitter Card HTML metadata for social media crawlers.
 *
 * @param {Object} portfolio
 * @param {string} clientUrl
 * @returns {string}
 */
export const generateSocialPreviewHtml = (portfolio, clientUrl) => {
  const candidateName = portfolio.name || portfolio.title || "Portfolio";
  const headline = portfolio.tagline || portfolio.targetRole || "Software Engineer";
  const pageTitle = portfolio.seo?.title || `${candidateName} | ${headline} - PortfolioAI`;
  const pageDescription =
    portfolio.seo?.description ||
    portfolio.description ||
    portfolio.about ||
    `Explore the verified portfolio, production projects, and engineering experience of ${candidateName} on PortfolioAI.`;

  const canonicalUrl = `${clientUrl.replace(/\/+$/, "")}/p/${portfolio._id}`;
  const defaultImage = `${clientUrl.replace(/\/+$/, "")}/public/og-preview.png`;
  const rawImage = portfolio.seo?.ogImage || portfolio.previewImage || portfolio.avatar;
  const ogImageUrl = sanitizeImageUrl(rawImage, defaultImage);

  const escapedTitle = escapeHtml(pageTitle);
  const escapedDescription = escapeHtml(pageDescription);
  const escapedUrl = escapeHtml(canonicalUrl);
  const escapedImage = escapeHtml(ogImageUrl);
  const escapedName = escapeHtml(candidateName);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapedTitle}</title>
  <meta name="description" content="${escapedDescription}">

  <!-- Open Graph / Facebook / WhatsApp / LinkedIn -->
  <meta property="og:type" content="profile">
  <meta property="og:url" content="${escapedUrl}">
  <meta property="og:title" content="${escapedTitle}">
  <meta property="og:description" content="${escapedDescription}">
  <meta property="og:image" content="${escapedImage}">
  <meta property="og:site_name" content="PortfolioAI">
  <meta property="profile:username" content="${escapedName}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${escapedUrl}">
  <meta name="twitter:title" content="${escapedTitle}">
  <meta name="twitter:description" content="${escapedDescription}">
  <meta name="twitter:image" content="${escapedImage}">
</head>
<body>
  <h1>${escapedTitle}</h1>
  <p>${escapedDescription}</p>
  <img src="${escapedImage}" alt="${escapedName}" />
</body>
</html>`;
};

/**
 * Route handler for /p/:id:
 * - If crawler: fetches public portfolio, verifies publicity, and returns dynamic metadata HTML.
 * - If regular browser: calls next() to pass through to normal React SPA fallback.
 */
export const handleSocialCrawlerPreview = async (req, res, next) => {
  const userAgent = req.headers["user-agent"] || "";

  // If visitor is not a recognized crawler, proceed to normal SPA fallback
  if (!isSocialCrawler(userAgent)) {
    return next();
  }

  const { id } = req.params;
  const clientUrl = process.env.CLIENT_URL || "https://portfolioai.app";

  // Validate ObjectId format
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Portfolio Not Found | PortfolioAI</title>
  <meta name="robots" content="noindex, nofollow">
  <meta property="og:title" content="Portfolio Not Found | PortfolioAI">
  <meta property="og:description" content="The requested portfolio does not exist.">
</head>
<body>
  <h1>Portfolio Not Found</h1>
  <p>The requested portfolio does not exist or has an invalid link.</p>
</body>
</html>`);
  }

  try {
    // Only retrieve public, published portfolios (never expose draft or private portfolios)
    const portfolio = await Portfolio.findOne({
      _id: id,
      isPublic: true,
      status: "Published",
    })
      .select("title name tagline description about targetRole avatar previewImage seo")
      .lean();

    if (!portfolio) {
      return res.status(404).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Portfolio Private or Not Found | PortfolioAI</title>
  <meta name="robots" content="noindex, nofollow">
  <meta property="og:title" content="Portfolio Unavailable | PortfolioAI">
  <meta property="og:description" content="This portfolio is private, draft, or unavailable.">
</head>
<body>
  <h1>Portfolio Unavailable</h1>
  <p>This portfolio is either private, unpublished, or has been removed.</p>
</body>
</html>`);
    }

    const html = generateSocialPreviewHtml(portfolio, clientUrl);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300"); // Cache crawler preview for 5 mins
    return res.status(200).send(html);
  } catch (error) {
    console.error("[SEO Crawler Preview Error]:", error.message);
    return res.status(500).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Portfolio Preview Error | PortfolioAI</title>
  <meta name="robots" content="noindex, nofollow">
</head>
<body>
  <h1>Error loading portfolio preview</h1>
</body>
</html>`);
  }
};
