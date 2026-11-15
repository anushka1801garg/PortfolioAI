import axios from "axios";
import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { encryptToken } from "../utils/crypto.util.js";

// Enforce min 8 characters, at least 1 letter, at least 1 digit, supporting all printable ASCII symbols
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[\x20-\x7E]{8,}$/;
// Constant-time timing mitigation hash
const DUMMY_BCRYPT_HASH = "$2b$10$7EqJtq98hPqEX7fNZaFWoO.8k/5pQcM.yZ8s1B4O56W1V9l/6zL3a";

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // SEC-04: Strict scalar string type validation against NoSQL injection
    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid input types: fullName, email, and password must be strings",
      });
    }

    if (!fullName.trim() || !email.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // SEC-05: Server-side password complexity validation (min 8 chars, 1 letter, 1 number)
    if (password.length < 8 || !PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long and contain at least one letter and one number",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
    });

    const token = user.generateAccessToken();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // SEC-04: Strict scalar string type validation against NoSQL injection
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email and password must be strings",
      });
    }

    if (!email.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    // SEC-02: Prevent Account Enumeration: Return identical 401 and execute constant-time comparison
    if (!user) {
      await bcrypt.compare(password, DUMMY_BCRYPT_HASH).catch(() => { });
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = user.generateAccessToken();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  res.set("Cache-Control", "no-store");

  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

// =======================
// GitHub OAuth URL Generator
// =======================
export const getGitHubOAuthUrl = async (req, res) => {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return res.status(200).json({
        success: false,
        configured: false,
        message: "GITHUB_CLIENT_ID is not configured in server/.env.",
      });
    }

    const redirectUri = `${process.env.CLIENT_URL || "http://localhost:5173"}/auth/github/callback`;
    const scope = "repo,user";
    const stateNonce = crypto.randomBytes(16).toString("hex");
    const signature = crypto
      .createHmac("sha256", process.env.JWT_SECRET || "state_nonce_secret")
      .update(`${req.user._id}:${stateNonce}`)
      .digest("hex");
    const state = `${req.user._id}:${stateNonce}:${signature}`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;

    return res.status(200).json({
      success: true,
      configured: true,
      url: githubAuthUrl,
      state,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =======================
// GitHub OAuth Callback Handler
// =======================
export const handleGitHubOAuthCallback = async (req, res) => {
  try {
    const { code, state } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: "OAuth code is required" });
    }

    // Verify CSRF state parameter (mandatory for OAuth integrity)
    if (!state) {
      return res.status(400).json({
        success: false,
        message: "Missing OAuth state parameter for CSRF verification.",
      });
    }

    const parts = state.split(":");
    if (parts.length !== 3) {
      return res.status(400).json({
        success: false,
        message: "Malformed OAuth state parameter.",
      });
    }

    const [stateUserId, stateNonce, stateSignature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", process.env.JWT_SECRET || "state_nonce_secret")
      .update(`${stateUserId}:${stateNonce}`)
      .digest("hex");

    if (stateSignature !== expectedSig || stateUserId !== req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or forged OAuth state parameter (CSRF detected).",
      });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        success: false,
        message: "GitHub OAuth credentials are not configured in server/.env",
      });
    }

    // Exchange code for GitHub access token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
      {
        headers: { Accept: "application/json" },
        timeout: 20000,
      }
    );

    const accessToken = tokenRes.data?.access_token;
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: tokenRes.data?.error_description || "Failed to obtain GitHub access token",
      });
    }

    // Fetch user profile from GitHub
    const userRes = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "PortfolioAI-App",
      },
    });

    const githubUsername = userRes.data?.login;

    // Save token securely (AES-256-GCM encrypted) to current user profile in MongoDB
    const user = await User.findById(req.user._id).select("+githubAccessToken");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.githubAccessToken = encryptToken(accessToken);
    user.githubUsername = githubUsername || "";
    if (!user.github && githubUsername) {
      user.github = `https://github.com/${githubUsername}`;
    }
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Successfully connected GitHub account @${githubUsername}! 🐙`,
      githubUsername,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        githubUsername: user.githubUsername,
        github: user.github,
      },
    });
  } catch (error) {
    console.error("[handleGitHubOAuthCallback]", error.response?.data?.message || error.message);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message,
    });
  }
};

// =======================
// Get GitHub Connection Status
// =======================
export const getGitHubStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+githubAccessToken");
    const hasClientCredentials = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
    const isConnected = Boolean(user?.githubAccessToken);

    return res.status(200).json({
      success: true,
      isConnected,
      githubUsername: user?.githubUsername || "",
      isOAuthConfigured: hasClientCredentials,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =======================
// Disconnect GitHub Account
// =======================
export const disconnectGitHub = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+githubAccessToken");
    if (user) {
      user.githubAccessToken = "";
      user.githubUsername = "";
      await user.save();
    }
    return res.status(200).json({
      success: true,
      message: "GitHub account disconnected.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

