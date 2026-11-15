import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { configureQueryParser, sanitizeInput } from "./middlewares/sanitizer.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import analyzerRoutes from "./routes/analyzer.routes.js";
import portfolioGeneratorRoutes from "./routes/portfolioGenerator.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import paymentRoutes from "./routes/payment.routes.js";
import deploymentRoutes from "./routes/deployment.routes.js";
import Portfolio from "./models/portfolio.model.js";
import { globalLimiter } from "./middlewares/rateLimiter.middleware.js";
import { handleSocialCrawlerPreview } from "./controllers/seo.controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistCandidates = [
  path.resolve(__dirname, "../../client/dist"),
  path.resolve(process.cwd(), "client/dist"),
  path.resolve(process.cwd(), "../client/dist"),
];
const clientDistPath = clientDistCandidates.find((p) => fs.existsSync(p));

const app = express();
app.disable("etag");

// Configure Express 5 query parser to sanitize query parameters at parse time
configureQueryParser(app);

// Trust reverse proxy (e.g. Render, Railway, Nginx) for accurate client IP identification
app.set("trust proxy", 1);

// Attach baseline HTTP security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows inline script/style execution for React SPA & rich visual previews
    crossOriginEmbedderPolicy: false,
  })
);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const configuredClientUrls = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

// Restrict localhost / local testing origins to non-production environments
const allowedOrigins = [
  ...(process.env.NODE_ENV !== "production"
    ? [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
    ]
    : []),
  ...configuredClientUrls,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, "");

      // Check if origin matches explicitly configured allowed origins
      const isAllowed = allowedOrigins.some(
        (allowed) => allowed === normalizedOrigin || allowed === origin
      );

      if (isAllowed) {
        return callback(null, true);
      }

      // In development mode only, permit local loopback inspection
      if (process.env.NODE_ENV !== "production") {
        if (/^https?:\/\/localhost:\d+$/.test(origin) || /^https?:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
          return callback(null, true);
        }
      }

      // Reject untrusted origin cleanly by omitting Access-Control-Allow-Origin header
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(
  express.json({
    limit: "15mb",
    verify: (req, res, buf) => {
      if (req.originalUrl && req.originalUrl.includes("/payment/webhook")) {
        req.rawBody = buf;
      }
    },
  }),
);

app.use(express.urlencoded({ extended: true, limit: "15mb" }));

app.use(cookieParser());

// Sanitize user-supplied input to prevent MongoDB Operator Injection ($ne, $gt, etc.)
// Express 5 compatible sanitization across body, params, and query
app.use(sanitizeInput);

// Mount Global API Rate Limiter
app.use("/api", globalLimiter);

// Health Check Endpoints (OPS-02)
const healthCheckHandler = (req, res) => {
  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
};

app.get("/health", healthCheckHandler);
app.get("/api/v1/health", healthCheckHandler);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/portfolios", portfolioRoutes);
app.use("/api/v1/resume", resumeRoutes);
app.use("/api/v1/analyzer", analyzerRoutes);
app.use("/api/v1/portfolio-generator", portfolioGeneratorRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/deployment", deploymentRoutes);

// Dynamic XML Sitemap for Search Engines
app.get(["/sitemap.xml", "/api/v1/sitemap.xml"], async (req, res) => {
  try {
    const clientUrl = process.env.CLIENT_URL || "https://portfolioai.app";
    const publicPortfolios = await Portfolio.find({
      isPublic: true,
      status: "Published",
    })
      .select("_id updatedAt")
      .sort({ updatedAt: -1 })
      .limit(2000)
      .lean();

    const staticPages = [
      { loc: `${clientUrl}/`, priority: "1.0", changefreq: "daily" },
      { loc: `${clientUrl}/portfolio-generator`, priority: "0.9", changefreq: "weekly" },
      { loc: `${clientUrl}/analyzer`, priority: "0.9", changefreq: "weekly" },
      { loc: `${clientUrl}/templates/preview`, priority: "0.85", changefreq: "weekly" },
      { loc: `${clientUrl}/templates/preview/modern`, priority: "0.8", changefreq: "monthly" },
      { loc: `${clientUrl}/templates/preview/startup`, priority: "0.8", changefreq: "monthly" },
      { loc: `${clientUrl}/templates/preview/developer`, priority: "0.8", changefreq: "monthly" },
      { loc: `${clientUrl}/templates/preview/minimal`, priority: "0.8", changefreq: "monthly" },
      { loc: `${clientUrl}/templates/preview/creative`, priority: "0.8", changefreq: "monthly" },
      { loc: `${clientUrl}/templates/preview/cyberpunk`, priority: "0.8", changefreq: "monthly" },
      { loc: `${clientUrl}/login`, priority: "0.5", changefreq: "monthly" },
      { loc: `${clientUrl}/register`, priority: "0.5", changefreq: "monthly" },
    ];

    const today = new Date().toISOString().split("T")[0];

    const urls = [
      ...staticPages.map(
        (page) => `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
      ),
      ...publicPortfolios.map((p) => {
        const lastModDate = p.updatedAt
          ? new Date(p.updatedAt).toISOString().split("T")[0]
          : today;
        return `  <url>
    <loc>${clientUrl}/p/${p._id}</loc>
    <lastmod>${lastModDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }),
    ];

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=3600");
    return res.status(200).send(sitemapXml);
  } catch (err) {
    console.error("[Sitemap Generation Error]", err.message);
    return res.status(500).send("Error generating sitemap");
  }
});

// Robots.txt fallback endpoint
app.get(["/robots.txt", "/api/v1/robots.txt"], (req, res) => {
  const clientUrl = process.env.CLIENT_URL || "https://portfolioai.app";
  const robotsTxt = `# PortfolioAI API Robots.txt
User-agent: *
Allow: /
Allow: /templates
Allow: /templates/*
Allow: /p/*
Allow: /portfolio-generator
Allow: /analyzer
Disallow: /dashboard
Disallow: /portfolio$
Disallow: /portfolio/create
Disallow: /portfolio/edit/
Disallow: /settings
Disallow: /chat
Disallow: /payment/
Disallow: /auth/
Disallow: /api/

Sitemap: ${clientUrl}/sitemap.xml
`;
  res.header("Content-Type", "text/plain");
  return res.status(200).send(robotsTxt);
});

// Dynamic Social Media Previews for Public Portfolios (SEO-01)
// Intercepts social crawlers (WhatsApp, Facebook, Twitter, LinkedIn, Slack, Telegram)
// and returns dynamic OG metadata, while passing human visitors through to the SPA
app.get("/p/:id", handleSocialCrawlerPreview);

// Production Static Serving for Single-Host Deployments (e.g. Render / Railway full-stack)
if (clientDistPath) {
  app.use(express.static(clientDistPath));
  // Fallback to React index.html for all non-API SPA routes
  app.get(/^(?!\/api|\/sitemap|\/robots).*$/, (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "PortfolioAI Backend Running 🚀",
    });
  });
}

// Centralized JSON Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("[Global Error Handler]", err.message);
  const isClientError =
    err.name === "CastError" ||
    err.name === "MulterError" ||
    err.message?.includes("Only PDF and image files");
  const status = err.status || err.statusCode || (isClientError ? 400 : 500);
  return res.status(status).json({
    success: false,
    message: err.name === "CastError" ? `Invalid resource ID format: ${err.value}` : (err.message || "Internal Server Error"),
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

export default app;
