import axios from "axios";
import Portfolio from "../models/portfolio.model.js";
import User from "../models/user.model.js";
import { decryptToken } from "../utils/crypto.util.js";
import {
  createPortfolioZipBuffer,
  generateStandaloneHtml,
} from "../services/standaloneBundle.service.js";

// =======================
// Deploy to Netlify via Netlify REST API
// =======================
async function deployDirectToNetlify(portfolio, token, requestedSubdomain) {
  const zipBuffer = await createPortfolioZipBuffer(portfolio);

  const cleanTitle = (
    requestedSubdomain ||
    portfolio.name ||
    portfolio.title ||
    "portfolio"
  )
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);

  const siteSubdomain = cleanTitle || `portfolio-${Math.random().toString(36).substring(2, 6)}`;

  let siteId = null;
  let initialUrl = null;
  let deployedSubdomain = siteSubdomain;

  try {
    // Step 1: Create a site on Netlify with preferred subdomain
    const createRes = await axios.post(
      "https://api.netlify.com/api/v1/sites",
      { name: siteSubdomain },
      {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          "Content-Type": "application/json",
        },
        timeout: 25000,
      }
    );
    siteId = createRes.data?.id;
    initialUrl = createRes.data?.ssl_url || createRes.data?.url;
    deployedSubdomain = createRes.data?.name || siteSubdomain;
  } catch (err) {
    if (err.response?.status === 422) {
      // Subdomain name was already taken, append a unique suffix
      const fallbackName = `${siteSubdomain}-${Math.random().toString(36).substring(2, 6)}`;
      deployedSubdomain = fallbackName;
      const createRes = await axios.post(
        "https://api.netlify.com/api/v1/sites",
        { name: fallbackName },
        {
          headers: {
            Authorization: `Bearer ${token.trim()}`,
            "Content-Type": "application/json",
          },
          timeout: 25000,
        }
      );
      siteId = createRes.data?.id;
      initialUrl = createRes.data?.ssl_url || createRes.data?.url;
      deployedSubdomain = createRes.data?.name || fallbackName;
    } else {
      throw err;
    }
  }

  // Step 2: Upload and deploy the ZIP binary directly to Netlify's edge CDN
  const deployRes = await axios.post(
    `https://api.netlify.com/api/v1/sites/${siteId}/deploys`,
    zipBuffer,
    {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        "Content-Type": "application/zip",
      },
      timeout: 45000,
      maxContentLength: 50 * 1024 * 1024,
    }
  );

  const liveUrl =
    deployRes.data?.ssl_url ||
    deployRes.data?.url ||
    initialUrl ||
    `https://${deployedSubdomain}.netlify.app`;

  return { liveUrl, siteId, subdomain: deployedSubdomain };
}

// =======================
// Deploy to Vercel via Vercel Deployments API
// =======================
async function deployDirectToVercel(portfolio, token, requestedSubdomain) {
  const htmlContent = generateStandaloneHtml(portfolio);

  const cleanTitle = (
    requestedSubdomain ||
    portfolio.name ||
    portfolio.title ||
    "portfolio"
  )
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);

  const siteName = cleanTitle || `portfolio-${Math.random().toString(36).substring(2, 6)}`;

  const deployRes = await axios.post(
    "https://api.vercel.com/v13/deployments",
    {
      name: siteName,
      files: [
        {
          file: "index.html",
          data: htmlContent,
          encoding: "utf-8",
        },
      ],
      projectSettings: {
        framework: null,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  );

  const rawUrl = deployRes.data?.url;
  const liveUrl = rawUrl
    ? rawUrl.startsWith("http")
      ? rawUrl
      : `https://${rawUrl}`
    : `https://${siteName}.vercel.app`;

  return { liveUrl, deploymentId: deployRes.data?.id, subdomain: siteName };
}

// =======================
// Trigger 1-Click Deployment (Netlify or Vercel)
// =======================
export const deployPortfolio = async (req, res) => {
  try {
    const {
      portfolioId,
      platform = "netlify",
      subdomain,
      token,
      netlifyToken,
      vercelToken,
      customDomain,
    } = req.body;

    const portfolio = await Portfolio.findOne({
      _id: portfolioId,
      user: req.user._id,
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    if (req.body.template && typeof req.body.template === "string" && req.body.template.trim()) {
      portfolio.template = req.body.template.trim().toLowerCase();
    }

    // Clean preferred subdomain (e.g. "60soul")
    const cleanSubdomain = (
      subdomain ||
      portfolio.name ||
      portfolio.title ||
      "portfolio"
    )
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32) || "portfolio";

    const normalizedPlatform = platform.toLowerCase() === "vercel" ? "vercel" : "netlify";

    let generatedUrl = "";
    let finalSubdomain = cleanSubdomain;

    // Check tokens (require user-supplied personal account tokens)
    const activeToken =
      (token && token.trim()) ||
      (normalizedPlatform === "vercel"
        ? vercelToken && vercelToken.trim()
        : netlifyToken && netlifyToken.trim()) ||
      "";

    if (normalizedPlatform === "netlify") {
      if (!activeToken) {
        return res.status(400).json({
          success: false,
          needsToken: true,
          platform: "netlify",
          message:
            "A Netlify Personal Access Token is required to deploy automatically to your Netlify account. You can also use 1-click Netlify Drop (no token required).",
        });
      }

      try {
        const netlifyResult = await deployDirectToNetlify(
          portfolio,
          activeToken,
          cleanSubdomain
        );
        generatedUrl = netlifyResult.liveUrl;
        finalSubdomain = netlifyResult.subdomain;
      } catch (netErr) {
        console.error(
          "[Netlify Direct Deploy Error]",
          netErr.response?.data || netErr.message
        );
        const isAuthError =
          netErr.response?.status === 401 ||
          netErr.response?.status === 403 ||
          netErr.response?.data?.code === 401 ||
          netErr.response?.data?.message === "Access Denied" ||
          (typeof netErr.response?.data?.message === "string" &&
            netErr.response.data.message.toLowerCase().includes("access denied"));

        const errMsg = isAuthError
          ? "Your Netlify Personal Access Token is invalid, mistyped, or expired. Please check your token on Netlify (under User Settings > Applications > Personal access tokens) and try again."
          : (netErr.response?.data?.message || netErr.message);

        return res.status(400).json({
          success: false,
          isAuthError,
          message: errMsg,
        });
      }
    } else if (normalizedPlatform === "vercel") {
      if (!activeToken) {
        return res.status(400).json({
          success: false,
          needsToken: true,
          platform: "vercel",
          message:
            "A Vercel Access Token is required to deploy automatically to Vercel.",
        });
      }

      try {
        const vercelResult = await deployDirectToVercel(
          portfolio,
          activeToken,
          cleanSubdomain
        );
        generatedUrl = vercelResult.liveUrl;
        finalSubdomain = vercelResult.subdomain;
      } catch (vercErr) {
        console.error(
          "[Vercel Direct Deploy Error]",
          vercErr.response?.data || vercErr.message
        );
        const isAuthError =
          vercErr.response?.status === 401 ||
          vercErr.response?.status === 403;

        const errMsg = isAuthError
          ? "Your Vercel Access Token is invalid, mistyped, or expired. Please check your token on Vercel (under Account Settings > Tokens) and try again."
          : (vercErr.response?.data?.error?.message ||
             vercErr.response?.data?.message ||
             vercErr.message);

        return res.status(400).json({
          success: false,
          isAuthError,
          message: errMsg,
        });
      }
    }

    if (customDomain && customDomain.trim()) {
      generatedUrl = customDomain.trim().startsWith("http")
        ? customDomain.trim()
        : `https://${customDomain.trim()}`;
      portfolio.customDomain = customDomain.trim();
    }

    // Persist real verified cloud deployment state to MongoDB
    portfolio.deployedUrl = generatedUrl;
    portfolio.deploymentPlatform = normalizedPlatform;
    portfolio.deploymentStatus = "Live";
    portfolio.deployedAt = new Date();
    portfolio.status = "Published";
    portfolio.isPublic = true;

    await portfolio.save();

    return res.status(200).json({
      success: true,
      message: `Successfully deployed to ${normalizedPlatform.toUpperCase()} Cloud! 🚀`,
      deployedUrl: generatedUrl,
      platform: normalizedPlatform,
      subdomain: finalSubdomain,
      isCloudHosted: true,
      deploymentStatus: "Live",
      downloadZipUrl: `/api/v1/deployment/download-zip/${portfolio._id}`,
      portfolio,
    });
  } catch (error) {
    console.error("[deployPortfolio]", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// Push Portfolio to GitHub
// =======================
export const pushToGitHub = async (req, res) => {
  try {
    const { portfolioId, githubUsername, repoName, githubToken } = req.body;

    if (!portfolioId) {
      return res.status(400).json({
        success: false,
        message: "Portfolio ID is required.",
      });
    }

    if (!githubUsername || !githubUsername.trim()) {
      return res.status(400).json({
        success: false,
        message: "GitHub username or repository URL is required.",
      });
    }

    const portfolio = await Portfolio.findOne({
      _id: portfolioId,
      user: req.user._id,
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found.",
      });
    }

    if (req.body.template && typeof req.body.template === "string" && req.body.template.trim()) {
      portfolio.template = req.body.template.trim().toLowerCase();
    }

    // Parse owner and repo name from input
    let cleanInput = (githubUsername || req.user.githubUsername || "").trim().replace(/^https?:\/\/github\.com\//i, "").replace(/\/$/, "");
    let owner = "";
    let repo = "";

    if (cleanInput.includes("/")) {
      const parts = cleanInput.split("/");
      owner = parts[0].trim();
      repo = parts[1].trim();
    } else {
      owner = cleanInput || req.user.githubUsername || "";
      const safeTitle = (portfolio.name || portfolio.title || "portfolio")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      repo = (repoName && repoName.trim()) || `${safeTitle}-portfolio`;
    }

    let token = (githubToken && githubToken.trim()) || "";

    if (!token && req.user?._id) {
      // Securely retrieve and decrypt the OAuth token from MongoDB
      const userDoc = await User.findById(req.user._id).select("+githubAccessToken");
      if (userDoc?.githubAccessToken) {
        token = decryptToken(userDoc.githubAccessToken);
      }
    }

    if (!token) {
      // Return repo info and prompt for token
      const repoUrl = `https://github.com/${owner}/${repo}`;
      portfolio.githubRepoUrl = repoUrl;
      await portfolio.save();

      return res.status(200).json({
        success: true,
        needsToken: true,
        message: "Please provide a GitHub Personal Access Token to complete automated push.",
        repoUrl,
        owner,
        repo,
      });
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "PortfolioAI-App",
    };

    // Step 1: Check if repository exists or create it
    try {
      await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    } catch (err) {
      if (err.response?.status === 404) {
        // Create public repository under the user account
        await axios.post(
          "https://api.github.com/user/repos",
          {
            name: repo,
            description: `${portfolio.name || portfolio.title} — Portfolio Website generated via PortfolioAI`,
            homepage: portfolio.deployedUrl || "",
            private: false,
            auto_init: false,
          },
          { headers }
        );
      } else {
        throw new Error(err.response?.data?.message || "Failed to access GitHub repository.");
      }
    }

    // Step 2: Generate standalone production HTML
    const htmlContent = generateStandaloneHtml(portfolio);
    const liveLink = portfolio.deployedUrl || `https://${repo}.netlify.app`;
    const readmeContent = `# 🚀 ${portfolio.name || portfolio.title} — Portfolio Website

> **Live Website**: [${liveLink}](${liveLink})

This repository contains the standalone, production-ready portfolio website for **${portfolio.name || portfolio.title}**.

### 🌟 Overview
- **Live URL**: [${liveLink}](${liveLink})
- **Built with**: [PortfolioAI](https://github.com/anushka1801garg/PortfolioAI)
- **Zero External Runtime Dependencies**
`;

    // Step 3: Helper to upload or update files in repo
    const putFile = async (path, content, commitMessage) => {
      let sha = undefined;
      try {
        const existing = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
          { headers }
        );
        sha = existing.data?.sha;
      } catch {
        // file doesn't exist yet
      }

      await axios.put(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          message: commitMessage,
          content: Buffer.from(content, "utf-8").toString("base64"),
          sha,
        },
        { headers }
      );
    };

    await putFile("index.html", htmlContent, "Deploy portfolio via PortfolioAI 🚀");
    await putFile("README.md", readmeContent, "Add portfolio documentation");
    await putFile(".nojekyll", "", "Bypass Jekyll for GitHub Pages static hosting");

    // Step 4: Try enabling GitHub Pages
    let pagesEnabled = false;
    try {
      await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/pages`,
        { source: { branch: "main", path: "/" } },
        { headers }
      );
      pagesEnabled = true;
    } catch (pagesErr) {
      try {
        await axios.put(
          `https://api.github.com/repos/${owner}/${repo}/pages`,
          { source: { branch: "main", path: "/" } },
          { headers }
        );
        pagesEnabled = true;
      } catch {
        // Ignore if Pages is already enabled or needs manual branch selection in settings
      }
    }

    const repoUrl = `https://github.com/${owner}/${repo}`;
    const pagesUrl = `https://${owner}.github.io/${repo}/`;
    const pagesSettingsUrl = `https://github.com/${owner}/${repo}/settings/pages`;

    portfolio.githubRepoUrl = repoUrl;
    await portfolio.save();

    return res.status(200).json({
      success: true,
      message: `Successfully pushed portfolio to GitHub: ${owner}/${repo}! 🐙`,
      repoUrl,
      pagesUrl,
      pagesSettingsUrl,
      pagesEnabled,
      portfolio,
    });
  } catch (error) {
    // Log only sanitized messages to prevent leaking authorization headers
    console.error("[pushToGitHub]", error.response?.data?.message || error.message || "Failed to push to GitHub");
    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message || "Failed to push to GitHub",
    });
  }
};

// =======================
// Download Standalone Deployment ZIP (.zip)
// =======================
export const downloadPortfolioZip = async (req, res) => {
  try {
    const { id } = req.params;
    const portfolio = await Portfolio.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    const zipBuffer = await createPortfolioZipBuffer(portfolio);

    const safeTitle = (portfolio.name || portfolio.title || "portfolio")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 30);

    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${safeTitle}-standalone.zip"`,
      "Content-Length": zipBuffer.length,
    });

    return res.send(zipBuffer);
  } catch (error) {
    console.error("[downloadPortfolioZip]", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// Download Standalone Portfolio HTML (.html)
// =======================
export const downloadPortfolioHtml = async (req, res) => {
  try {
    const { id } = req.params;
    const portfolio = await Portfolio.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    const htmlContent = generateStandaloneHtml(portfolio);

    const safeTitle = (portfolio.name || portfolio.title || "portfolio")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 30);

    res.set({
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeTitle || "portfolio"}.html"`,
    });

    return res.send(htmlContent);
  } catch (error) {
    console.error("[downloadPortfolioHtml]", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// Save Real Cloud Live URL
// =======================
export const saveLiveUrl = async (req, res) => {
  try {
    const { portfolioId, liveUrl, platform = "netlify" } = req.body;

    if (!portfolioId || !liveUrl) {
      return res.status(400).json({
        success: false,
        message: "Portfolio ID and Live URL are required.",
      });
    }

    const portfolio = await Portfolio.findOne({
      _id: portfolioId,
      user: req.user._id,
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    let cleanUrl = liveUrl.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `https://${cleanUrl}`;
    }

    portfolio.deployedUrl = cleanUrl;
    portfolio.deploymentPlatform = platform;
    portfolio.deploymentStatus = "Live";
    portfolio.deployedAt = new Date();
    portfolio.status = "Published";
    portfolio.isPublic = true;

    await portfolio.save();

    return res.status(200).json({
      success: true,
      message: "Live cloud URL permanently saved to portfolio! 🚀",
      deployedUrl: cleanUrl,
      portfolio,
    });
  } catch (error) {
    console.error("[saveLiveUrl]", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// Clear / Reset Deployment
// =======================
export const clearDeployment = async (req, res) => {
  try {
    const { portfolioId } = req.body;

    if (!portfolioId) {
      return res.status(400).json({
        success: false,
        message: "Portfolio ID is required.",
      });
    }

    const portfolio = await Portfolio.findOne({
      _id: portfolioId,
      user: req.user._id,
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    portfolio.deployedUrl = "";
    portfolio.deploymentPlatform = "";
    portfolio.deploymentStatus = "Idle";
    portfolio.customDomain = "";
    await portfolio.save();

    return res.status(200).json({
      success: true,
      message: "Deployment reset successfully.",
      portfolio,
    });
  } catch (error) {
    console.error("[clearDeployment]", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
