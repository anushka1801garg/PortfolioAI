import { Router } from "express";

import {
  registerUser,
  loginUser,
  getCurrentUser,
  getGitHubOAuthUrl,
  handleGitHubOAuthCallback,
  getGitHubStatus,
  disconnectGitHub,
} from "../controllers/auth.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  loginLimiter,
  registerLimiter,
} from "../middlewares/rateLimiter.middleware.js";

const router = Router();

router.post("/register", registerLimiter, registerUser);

router.post("/login", loginLimiter, loginUser);

router.get("/me", verifyJWT, getCurrentUser);

// GitHub OAuth endpoints
router.get("/github/url", verifyJWT, getGitHubOAuthUrl);
router.post("/github/callback", verifyJWT, handleGitHubOAuthCallback);
router.get("/github/status", verifyJWT, getGitHubStatus);
router.post("/github/disconnect", verifyJWT, disconnectGitHub);

export default router;

