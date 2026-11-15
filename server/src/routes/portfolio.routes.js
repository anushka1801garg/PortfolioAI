import { Router } from "express";

import {
  createPortfolio,
  getAllPortfolios,
  getPortfolioById,
  getPublicPortfolioById,
  updatePortfolio,
  deletePortfolio,
  duplicatePortfolio,
  toggleArchivePortfolio,
  applyAISuggestions,
  restoreVersion,
  chatWithPortfolioAI,
  getChatSessions,
  saveChatSession,
  deleteChatSession,
  clearChatSessions,
  uploadPortfolioAvatar,
  uploadPortfolioResume,
} from "../controllers/portfolio.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { aiChatLimiter, aiGenerationLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

// Public Portfolio View (No auth required)
router.get("/public/:id", getPublicPortfolioById);

// AI Portfolio Chat Assistant (Authenticated studio only)
router.post("/chat", verifyJWT, aiChatLimiter, chatWithPortfolioAI);

// Protected Routes
router.use(verifyJWT);

// Chat Sessions (ChatGPT-style history persistence)
router.get("/chat/sessions", getChatSessions);
router.post("/chat/sessions", saveChatSession);
router.delete("/chat/sessions/:sessionId", deleteChatSession);
router.delete("/chat/sessions", clearChatSessions);

// Create Portfolio
router.post("/", createPortfolio);

// Get All Portfolios
router.get("/", getAllPortfolios);

// Duplicate Portfolio
router.post("/duplicate/:id", duplicatePortfolio);

// Archive / Unarchive Portfolio
router.patch("/archive/:id", toggleArchivePortfolio);

// Apply AI Suggestions (Creates version snapshot)
router.post("/apply-ai/:id", aiGenerationLimiter, applyAISuggestions);

// Restore Version Snapshot
router.post("/restore-version/:id/:versionNumber", restoreVersion);

// Get Single Portfolio
router.get("/:id", getPortfolioById);

// Update Portfolio
router.put("/:id", updatePortfolio);

// Upload Portfolio Avatar / Photo
router.post("/:id/avatar", upload.single("avatar"), uploadPortfolioAvatar);

// Upload Portfolio Resume Document
router.post("/:id/resume", upload.single("resume"), uploadPortfolioResume);

// Delete Portfolio
router.delete("/:id", deletePortfolio);

export default router;
