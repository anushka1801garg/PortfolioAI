import { test, describe } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Portfolio from "../src/models/portfolio.model.js";
import {
  isSocialCrawler,
  escapeHtml,
  sanitizeImageUrl,
  generateSocialPreviewHtml,
  handleSocialCrawlerPreview,
} from "../src/controllers/seo.controller.js";

// ============================================================================
// PHASE 4 VERIFICATION SUITE: SOCIAL CRAWLER PREVIEWS & SEO-01
// ============================================================================

describe("PHASE 4 - SEO-01: Social Crawler Detection", () => {
  const crawlerUserAgents = [
    { name: "WhatsApp", ua: "WhatsApp/2.21.12.21 A" },
    { name: "Facebook", ua: "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)" },
    { name: "Twitter", ua: "Twitterbot/1.0" },
    { name: "LinkedIn", ua: "LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)" },
    { name: "Telegram", ua: "TelegramBot (like TwitterBot)" },
    { name: "Slack", ua: "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)" },
  ];

  const browserUserAgents = [
    {
      name: "Desktop Chrome",
      ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    {
      name: "Mobile Safari",
      ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    },
    {
      name: "Firefox",
      ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
    },
    { name: "Empty UA", ua: "" },
    { name: "Undefined UA", ua: undefined },
  ];

  test("accurately identifies all 6 required social crawler user agents", () => {
    for (const crawler of crawlerUserAgents) {
      assert.equal(
        isSocialCrawler(crawler.ua),
        true,
        `Expected ${crawler.name} (${crawler.ua}) to be recognized as crawler`
      );
    }
  });

  test("does not misclassify standard human browser user agents as crawlers", () => {
    for (const browser of browserUserAgents) {
      assert.equal(
        isSocialCrawler(browser.ua),
        false,
        `Expected ${browser.name} to NOT be classified as crawler`
      );
    }
  });
});

describe("PHASE 4 - SEO-01: HTML Escaping & Image URL Sanitization", () => {
  test("escapeHtml neutralizes HTML tags and quote entities", () => {
    const raw = `<script>alert("XSS")</script> & 'portfolio'`;
    const escaped = escapeHtml(raw);
    assert.equal(escaped.includes("<script>"), false);
    assert.equal(escaped.includes("&lt;script&gt;"), true);
    assert.equal(escaped.includes("&quot;XSS&quot;"), true);
    assert.equal(escaped.includes("&#039;portfolio&#039;"), true);
  });

  test("sanitizeImageUrl permits legitimate HTTPS images and discards pseudo-protocols", () => {
    const fallback = "https://portfolioai.app/default.png";

    assert.equal(
      sanitizeImageUrl("https://res.cloudinary.com/demo/avatar.jpg", fallback),
      "https://res.cloudinary.com/demo/avatar.jpg"
    );
    assert.equal(
      sanitizeImageUrl("http://example.com/photo.png", fallback),
      "http://example.com/photo.png"
    );

    // Discards dangerous schemes
    assert.equal(sanitizeImageUrl("javascript:alert(1)", fallback), fallback);
    assert.equal(sanitizeImageUrl("data:text/html;base64,...", fallback), fallback);
    assert.equal(sanitizeImageUrl("", fallback), fallback);
    assert.equal(sanitizeImageUrl(null, fallback), fallback);
  });
});

describe("PHASE 4 - SEO-01: Social Preview HTML Generation", () => {
  test("generates complete Open Graph and Twitter Card tags with candidate details", () => {
    const mockPortfolio = {
      _id: "60d0fe4f5311236168a109ca",
      title: "Senior Distributed Systems Portfolio",
      name: "Anushka Garg",
      tagline: "Staff Systems Engineer | Distributed Architecture",
      description: "Building ultra-scalable backend systems and cloud platforms.",
      avatar: "https://res.cloudinary.com/portfolioai/avatar.jpg",
      targetRole: "Staff Engineer",
    };

    const html = generateSocialPreviewHtml(mockPortfolio, "https://portfolioai.app");

    // Essential Open Graph Tags
    assert.ok(html.includes('<meta property="og:type" content="profile">'));
    assert.ok(html.includes('<meta property="og:url" content="https://portfolioai.app/p/60d0fe4f5311236168a109ca">'));
    assert.ok(html.includes('<meta property="og:title" content="Anushka Garg | Staff Systems Engineer | Distributed Architecture - PortfolioAI">'));
    assert.ok(html.includes('<meta property="og:image" content="https://res.cloudinary.com/portfolioai/avatar.jpg">'));
    assert.ok(html.includes('<meta property="og:description" content="Building ultra-scalable backend systems and cloud platforms.">'));

    // Essential Twitter Card Tags
    assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image">'));
    assert.ok(html.includes('<meta name="twitter:title" content="Anushka Garg | Staff Systems Engineer | Distributed Architecture - PortfolioAI">'));
    assert.ok(html.includes('<meta name="twitter:image" content="https://res.cloudinary.com/portfolioai/avatar.jpg">'));
  });
});

describe("PHASE 4 - SEO-01: Public vs Private Portfolio Security & Middleware Handling", () => {
  test("calls next() for human browser user agent without querying database", async () => {
    let nextCalled = false;
    let sendCalled = false;

    const req = {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
      },
      params: { id: "60d0fe4f5311236168a109ca" },
    };

    const res = {
      send() {
        sendCalled = true;
      },
    };

    await handleSocialCrawlerPreview(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true, "Browser requests must fall through to next()");
    assert.equal(sendCalled, false, "Browser requests must not be intercepted with raw HTML");
  });

  test("returns 404 for invalid ObjectId format without throwing error", async () => {
    let statusCode = null;
    let htmlOutput = "";

    const req = {
      headers: { "user-agent": "WhatsApp/2.21.12.21" },
      params: { id: "invalid-not-an-id" },
    };

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      send(html) {
        htmlOutput = html;
        return this;
      },
    };

    await handleSocialCrawlerPreview(req, res, () => {});

    assert.equal(statusCode, 404);
    assert.ok(htmlOutput.includes("Portfolio Not Found"));
  });

  test("never leaks data for private portfolios and returns 404 to crawlers", async () => {
    let statusCode = null;
    let htmlOutput = "";

    const req = {
      headers: { "user-agent": "LinkedInBot/1.0" },
      params: { id: "60d0fe4f5311236168a109ca" },
    };

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      send(html) {
        htmlOutput = html;
        return this;
      },
      setHeader() {},
    };

    // Mock Portfolio.findOne to simulate private/draft portfolio (returns null for isPublic: true query)
    const originalFindOne = Portfolio.findOne;
    Portfolio.findOne = () => ({
      select: () => ({
        lean: () => Promise.resolve(null),
      }),
    });

    try {
      await handleSocialCrawlerPreview(req, res, () => {});

      assert.equal(statusCode, 404);
      assert.ok(htmlOutput.includes("Portfolio Unavailable"));
      assert.ok(!htmlOutput.includes("Anushka Garg"), "Must never leak private candidate name");
    } finally {
      Portfolio.findOne = originalFindOne;
    }
  });

  test("returns rich metadata HTML with status 200 for valid public published portfolio", async () => {
    let statusCode = 200;
    let htmlOutput = "";

    const req = {
      headers: { "user-agent": "Twitterbot/1.0" },
      params: { id: "60d0fe4f5311236168a109ca" },
    };

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      send(html) {
        htmlOutput = html;
        return this;
      },
      setHeader() {},
    };

    const originalFindOne = Portfolio.findOne;
    Portfolio.findOne = () => ({
      select: () => ({
        lean: () =>
          Promise.resolve({
            _id: "60d0fe4f5311236168a109ca",
            title: "Staff Engineer Portfolio",
            name: "Anushka Garg",
            tagline: "Tech Lead",
            isPublic: true,
            status: "Published",
            avatar: "https://res.cloudinary.com/demo/image.png",
          }),
      }),
    });

    try {
      await handleSocialCrawlerPreview(req, res, () => {});

      assert.equal(statusCode, 200);
      assert.ok(htmlOutput.includes("Anushka Garg | Tech Lead - PortfolioAI"));
      assert.ok(htmlOutput.includes("og:image"));
      assert.ok(htmlOutput.includes("twitter:card"));
    } finally {
      Portfolio.findOne = originalFindOne;
    }
  });
});
