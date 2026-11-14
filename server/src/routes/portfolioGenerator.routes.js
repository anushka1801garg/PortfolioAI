import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  generatePortfolio,
  generateFromData,
  fetchGitHubProfile,
  extractPortfolioUrl,
  analyzePortfolioReference,
} from "../controllers/portfolioGenerator.controller.js";

const router = Router();

router.use(verifyJWT);

// Generate from PDF
router.post("/generate", upload.single("resume"), generatePortfolio);

// Generate from manual form / JSON / external text
router.post("/generate-from-data", generateFromData);

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
