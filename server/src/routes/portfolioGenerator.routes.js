import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { aiLimiter } from "../middlewares/rateLimiter.middleware.js";
import {
  generatePortfolio,
  generateFromData,
  fetchGitHubProfile,
  extractPortfolioUrl,
  analyzePortfolioReference,
} from "../controllers/portfolioGenerator.controller.js";

const router = Router();

router.use(verifyJWT);

// Generate from PDF (AI-intensive)
router.post("/generate", aiLimiter, upload.single("resume"), generatePortfolio);

// Generate from manual form / JSON / external text (AI-intensive)
router.post("/generate-from-data", aiLimiter, generateFromData);

// Fetch public GitHub profile & repositories
router.get("/github", fetchGitHubProfile);
router.get("/github/:username", fetchGitHubProfile);

// Extract portfolio content from URL
router.post("/extract-url", extractPortfolioUrl);

// Analyze portfolio inspiration reference (URL or Image)
router.post(
  "/analyze-reference",
  upload.single("referenceImage"),
  analyzePortfolioReference,
);

export default router;
