import { Router } from "express";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
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
router.post("/analyze", upload.single("resume"), analyzeResume);

// Portfolio Analysis (By ID or payload)
router.post("/analyze-portfolio", analyzePortfolio);

// Live URL Analysis
router.post("/analyze-url", analyzeUrl);

// Raw Code Analysis
router.post("/analyze-code", analyzeCode);

// Fetch Raw HTML for Live In-Situ Preview
router.get("/fetch-raw-html", fetchRawHtml);


export default router;
