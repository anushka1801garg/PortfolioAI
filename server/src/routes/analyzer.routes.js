import { Router } from "express";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { aiGenerationLimiter } from "../middlewares/rateLimiter.middleware.js";
import {
  analyzeResume,
  analyzePortfolio,
  analyzeUrl,
  analyzeCode,
  fetchRawHtml,
} from "../controllers/analyzer.controller.js";

const router = Router();

router.use(verifyJWT);

// PDF Resume Analysis
router.post("/analyze", aiGenerationLimiter, upload.single("resume"), analyzeResume);

// Portfolio Analysis (By ID or payload)
router.post("/analyze-portfolio", aiGenerationLimiter, analyzePortfolio);

// Live URL Analysis
router.post("/analyze-url", aiGenerationLimiter, analyzeUrl);

// Raw Code Analysis
router.post("/analyze-code", aiGenerationLimiter, analyzeCode);

// Fetch Raw HTML for Live In-Situ Preview
router.get("/fetch-raw-html", fetchRawHtml);


export default router;
