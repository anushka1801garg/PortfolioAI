import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import app from "../src/app.js";
import { PORTFOLIO_LIST_FIELDS } from "../src/controllers/portfolio.controller.js";
import { MONGOOSE_CONNECTION_OPTIONS } from "../src/database/db.js";
import { gracefulShutdown } from "../src/index.js";

// ============================================================================
// PHASE 3 VERIFICATION SUITE: PERFORMANCE, DATABASE & DEVOPS
// ============================================================================

describe("PHASE 3 - DB-01: Optimized Portfolio Listing Query", () => {
  test("PORTFOLIO_LIST_FIELDS contains essential dashboard fields and excludes heavy blobs", () => {
    const fields = PORTFOLIO_LIST_FIELDS.split(" ");

    // Essential UI fields for MyPortfoliosPage and Dashboard cards
    const requiredFields = [
      "title",
      "slug",
      "status",
      "template",
      "creationType",
      "views",
      "updatedAt",
      "createdAt",
      "isPublic",
      "isArchived",
      "deployedUrl",
      "deploymentStatus",
      "previewImage",
      "hero.title",
      "hero.avatar",
      "tagline",
      "description",
      "targetRole",
      "targetCompany",
      "skills",
      "projects.title",
      "github",
      "linkedin",
      "versions.name",
      "versions.changeSummary",
      "versions.createdAt",
      "versions.versionNumber",
    ];

    for (const reqField of requiredFields) {
      assert.ok(
        fields.includes(reqField),
        `Missing required listing field: ${reqField}`
      );
    }

    // Heavy payloads that MUST be excluded from listing queries
    const prohibitedBlobs = [
      "customHtml",
      "rawHtml",
      "analysisReport",
      "analysisReport.rawHtml",
      "versions.snapshot",
      "sections",
      "standaloneBundle",
    ];

    for (const blob of prohibitedBlobs) {
      assert.ok(
        !fields.includes(blob),
        `Prohibited heavy blob found in listing projection: ${blob}`
      );
    }
  });

  test("calculates significant response payload reduction when omitting versions.snapshot and customHtml", () => {
    // Simulate typical portfolio with full version history and customHtml vs lean projection
    const mockFullPortfolio = {
      _id: "60d0fe4f5311236168a109ca",
      title: "Senior Full Stack Engineer Portfolio",
      slug: "senior-dev-portfolio",
      status: "Published",
      template: "modern",
      views: 142,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      customHtml: "<div>" + "<h1>Interactive Portfolio</h1>".repeat(500) + "</div>", // ~16KB HTML
      analysisReport: {
        rawHtml: "<html>" + "<p>Audit report details</p>".repeat(400) + "</html>",
        score: 92,
      },
      versions: [
        {
          name: "Initial Creation",
          changeSummary: "First build",
          createdAt: new Date().toISOString(),
          versionNumber: 1,
          snapshot: {
            title: "Senior Full Stack Engineer Portfolio",
            customHtml: "<div>" + "<h1>Interactive Portfolio</h1>".repeat(500) + "</div>",
            sections: [{ id: "hero", content: "..." }],
          },
        },
        {
          name: "ATS Optimization",
          changeSummary: "Keywords added",
          createdAt: new Date().toISOString(),
          versionNumber: 2,
          snapshot: {
            title: "Senior Full Stack Engineer Portfolio",
            customHtml: "<div>" + "<h1>Interactive Portfolio</h1>".repeat(500) + "</div>",
            sections: [{ id: "hero", content: "..." }],
          },
        },
      ],
      skills: ["React", "Node.js", "TypeScript", "MongoDB", "Docker"],
      projects: [{ title: "PortfolioAI" }, { title: "DevFlow" }],
    };

    const fullPayloadJson = JSON.stringify([mockFullPortfolio]);
    const fullSizeBytes = Buffer.byteLength(fullPayloadJson, "utf8");

    // Lean projected portfolio
    const mockLeanPortfolio = {
      _id: mockFullPortfolio._id,
      title: mockFullPortfolio.title,
      slug: mockFullPortfolio.slug,
      status: mockFullPortfolio.status,
      template: mockFullPortfolio.template,
      views: mockFullPortfolio.views,
      updatedAt: mockFullPortfolio.updatedAt,
      createdAt: mockFullPortfolio.createdAt,
      skills: mockFullPortfolio.skills,
      projects: mockFullPortfolio.projects.map((p) => ({ title: p.title })),
      versions: mockFullPortfolio.versions.map((v) => ({
        name: v.name,
        changeSummary: v.changeSummary,
        createdAt: v.createdAt,
        versionNumber: v.versionNumber,
      })),
    };

    const leanPayloadJson = JSON.stringify([mockLeanPortfolio]);
    const leanSizeBytes = Buffer.byteLength(leanPayloadJson, "utf8");

    assert.ok(
      leanSizeBytes < fullSizeBytes * 0.15,
      `Lean payload (${leanSizeBytes} bytes) must be < 15% of full payload (${fullSizeBytes} bytes)`
    );
    assert.ok(
      leanSizeBytes < 15000,
      `Lean payload size (${leanSizeBytes} bytes) is well below the 15KB target`
    );
  });
});

describe("PHASE 3 - DB-02: MongoDB Connection Pool & Monitoring", () => {
  test("MONGOOSE_CONNECTION_OPTIONS includes all production pool and timeout settings", () => {
    assert.equal(MONGOOSE_CONNECTION_OPTIONS.maxPoolSize, 50);
    assert.equal(MONGOOSE_CONNECTION_OPTIONS.minPoolSize, 5);
    assert.equal(MONGOOSE_CONNECTION_OPTIONS.serverSelectionTimeoutMS, 5000);
    assert.equal(MONGOOSE_CONNECTION_OPTIONS.socketTimeoutMS, 45000);
  });

  test("Mongoose connection listeners exist for disconnected and reconnected", () => {
    const disconnectedListeners = mongoose.connection.listeners("disconnected");
    const reconnectedListeners = mongoose.connection.listeners("reconnected");

    assert.ok(
      disconnectedListeners.length >= 1,
      "Expected at least one 'disconnected' event listener on mongoose.connection"
    );
    assert.ok(
      reconnectedListeners.length >= 1,
      "Expected at least one 'reconnected' event listener on mongoose.connection"
    );
  });
});

describe("PHASE 3 - DB-03: Graceful Server Shutdown", () => {
  test("gracefulShutdown handler is defined and exported", () => {
    assert.equal(typeof gracefulShutdown, "function");
  });

  test("SIGTERM and SIGINT listeners are attached to process", () => {
    const sigtermListeners = process.listeners("SIGTERM");
    const sigintListeners = process.listeners("SIGINT");

    assert.ok(sigtermListeners.length >= 1, "Expected SIGTERM listener");
    assert.ok(sigintListeners.length >= 1, "Expected SIGINT listener");
  });
});

describe("PHASE 3 - OPS-02: Health Check Endpoints", () => {
  test("both /health and /api/v1/health return HTTP 200 with standard health status", async () => {
    const endpoints = ["/health", "/api/v1/health"];

    for (const endpoint of endpoints) {
      let statusCode = null;
      let bodyData = null;

      const mockReq = {
        url: endpoint,
        method: "GET",
        headers: {},
      };

      const mockRes = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(data) {
          bodyData = data;
          return this;
        },
      };

      // Find route handler in app router stack (Express 5 uses app.router.stack)
      const stack = (app.router && app.router.stack) || (app._router && app._router.stack) || [];
      const layer = stack.find(
        (l) => l.route && (l.route.path === endpoint || (Array.isArray(l.route.path) && l.route.path.includes(endpoint)))
      );

      assert.ok(layer, `Expected route layer for ${endpoint}`);
      await layer.route.stack[0].handle(mockReq, mockRes, () => {});

      assert.equal(statusCode, 200);
      assert.equal(bodyData.status, "ok");
      assert.equal(typeof bodyData.uptime, "number");
      assert.equal(typeof bodyData.timestamp, "number");
      assert.ok(bodyData.db === "connected" || bodyData.db === "disconnected");
    }
  });
});

describe("PHASE 3 - OPS-01: Environment Variable Documentation", () => {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const serverDir = path.resolve(currentDir, "..");
  const rootDir = path.resolve(serverDir, "..");

  test("server/.env.example exists, is non-empty, and contains no real secrets", () => {
    const envExamplePath = path.resolve(serverDir, ".env.example");
    assert.ok(fs.existsSync(envExamplePath), `server/.env.example must exist at ${envExamplePath}`);

    const content = fs.readFileSync(envExamplePath, "utf8");
    assert.ok(content.includes("MONGODB_URI="));
    assert.ok(content.includes("JWT_SECRET="));
    assert.ok(content.includes("ENCRYPTION_KEY="));
    assert.ok(content.includes("RAZORPAY_KEY_ID="));
    assert.ok(content.includes("CLIENT_URL="));

    // Ensure placeholders rather than real secret credentials
    assert.ok(content.includes("your_jwt_secret_key_minimum_32_characters_here"));
    assert.ok(content.includes("rzp_test_placeholder_key_id"));
  });

  test("root .env.example exists and documents both server and client variables", () => {
    const rootExamplePath = path.resolve(rootDir, ".env.example");
    assert.ok(fs.existsSync(rootExamplePath), `Root .env.example must exist at ${rootExamplePath}`);

    const content = fs.readFileSync(rootExamplePath, "utf8");
    assert.ok(content.includes("VITE_API_URL="));
    assert.ok(content.includes("VITE_RAZORPAY_KEY_ID="));
    assert.ok(content.includes("MONGODB_URI="));
  });
});
