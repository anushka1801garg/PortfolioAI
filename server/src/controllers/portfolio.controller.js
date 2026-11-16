import mongoose from "mongoose";
import Portfolio from "../models/portfolio.model.js";
import User from "../models/user.model.js";
import ChatSession from "../models/chatSession.model.js";
import axios from "axios";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

// =======================
// Helper: Safe Scrape URL Verification (SSRF Protection)
// =======================
export {
  isPrivateIp,
  isSafeUrlForScrape,
  isValidLinkedInUrl,
  createPinnedLookup,
  resolveAndValidateUrl,
  safeAxiosGet,
} from "../utils/ssrfValidator.js";

// =======================
// Helper: Resolve Accessible User IDs (Safely unifies developer alias accounts)
// =======================
export const resolveAccessibleUserIds = async (user) => {
  let userIds = [user._id];
  if (!user?.email) return userIds;

  const userEmail = user.email.toLowerCase().trim();

  // 1. Explicit admin alias environment whitelist (primary secure standard)
  const envAliases = (process.env.ADMIN_ALIAS_EMAILS || process.env.DEV_ALIAS_EMAILS || "")
    .split(",")
    .map((e) => e.toLowerCase().trim())
    .filter(Boolean);

  if (envAliases.length > 0 && envAliases.includes(userEmail)) {
    try {
      const aliasUsers = await User.find({ email: { $in: envAliases } }).select("_id");
      return Array.from(new Set([...userIds.map(id => id.toString()), ...aliasUsers.map(u => u._id.toString())]))
        .map(id => new mongoose.Types.ObjectId(id));
    } catch (e) {
      console.warn("Could not query alias users from whitelist:", e.message);
      return userIds;
    }
  }

  // 2. In non-production environments, support explicit developer alias matching for admin / verified dev account
  const devAdmin = (process.env.DEV_ADMIN_EMAIL || "").toLowerCase().trim();
  if (
    process.env.NODE_ENV !== "production" &&
    (user.role === "admin" || (devAdmin && userEmail === devAdmin))
  ) {
    if (process.env.DEV_ALIAS_PATTERN) {
      try {
        const aliasUsers = await User.find({
          email: { $regex: new RegExp(process.env.DEV_ALIAS_PATTERN, "i") },
        }).select("_id");
        userIds = Array.from(
          new Set([
            ...userIds.map((id) => id.toString()),
            ...aliasUsers.map((u) => u._id.toString()),
          ]),
        ).map((id) => new mongoose.Types.ObjectId(id));
      } catch (e) {
        console.warn("Could not query alias users:", e.message);
      }
    }
  }

  return userIds;
};

// =======================
// Create Portfolio
// =======================
export const createPortfolio = async (req, res) => {
  try {
    const portfolioData = {
      ...req.body,
      status: req.body.status || "Published",
      isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true,
      user: req.user._id,
    };

    // Initial version snapshot
    const initialSnapshot = {
      versionNumber: 1,
      name: "Initial Version",
      snapshot: { ...portfolioData },
      changedBy: req.user.fullName || "User",
      changeSummary: "Initial portfolio created",
      createdAt: new Date(),
    };

    portfolioData.versions = [initialSnapshot];

    const portfolio = await Portfolio.create(portfolioData);

    return res.status(201).json({
      success: true,
      message: "Portfolio created successfully",
      portfolio,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Projection fields required for dashboard portfolio cards, stats, and origins (DB-01)
// Excludes heavy customHtml, rawHtml, analysis reports, and snapshot duplicate trees
export const PORTFOLIO_LIST_FIELDS = [
  "title",
  "slug",
  "status",
  "template",
  "creationType",
  "creationMode",
  "inputSource",
  "tagline",
  "description",
  "targetRole",
  "targetCompany",
  "views",
  "updatedAt",
  "createdAt",
  "isPublic",
  "isArchived",
  "deployedUrl",
  "deploymentStatus",
  "deploymentPlatform",
  "customDomain",
  "previewImage",
  "hero.title",
  "hero.avatar",
  "skills",
  "projects.title",
  "github",
  "linkedin",
  "githubRepoUrl",
  "preferences.customLayout.layoutStyle",
  "preferences.style",
  "versions.name",
  "versions.changeSummary",
  "versions.createdAt",
  "versions.versionNumber",
].join(" ");

// =======================
// Get All Portfolios (with filtering for archived - DB-01 optimized)
// =======================
export const getAllPortfolios = async (req, res) => {
  try {
    const { includeArchived } = req.query;
    const userIds = await resolveAccessibleUserIds(req.user);
    const filter = { user: { $in: userIds } };
    if (includeArchived !== "true") {
      filter.isArchived = { $ne: true };
    }

    const portfolios = await Portfolio.find(filter)
      .select(PORTFOLIO_LIST_FIELDS)
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      portfolios,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// Get Single Portfolio
// =======================
export const getPortfolioById = async (req, res) => {
  try {
    const userIds = await resolveAccessibleUserIds(req.user);
    let portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: { $in: userIds },
    });

    // If not found under current user session, allow viewing if portfolio exists and is public
    if (!portfolio) {
      portfolio = await Portfolio.findOne({
        _id: req.params.id,
        isPublic: true,
        status: "Published",
      });
    }

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    const isOwner = userIds.some(id => id.toString() === portfolio.user?.toString());

    return res.status(200).json({
      success: true,
      portfolio,
      isOwner,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// Update Portfolio (records version on major update)
// =======================
export const updatePortfolio = async (req, res) => {
  try {
    const userIds = await resolveAccessibleUserIds(req.user);
    const existing = await Portfolio.findOne({
      _id: req.params.id,
      user: { $in: userIds },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    // Optional snapshot creation if requested or if significant fields changed
    const updateData = { ...req.body };

    if (req.body.createVersion) {
      const nextVer = (existing.versions?.length || 0) + 1;
      const cleanExisting = existing.toObject();
      delete cleanExisting.versions;
      if (cleanExisting.analysisReport) delete cleanExisting.analysisReport.rawHtml;

      const snapshot = {
        versionNumber: nextVer,
        name: req.body.versionName || `Version ${nextVer}`,
        snapshot: cleanExisting,
        changedBy: req.user.fullName || "User",
        changeSummary: req.body.changeSummary || "Manual edits saved",
        createdAt: new Date(),
      };
      updateData.$push = {
        versions: {
          $each: [snapshot],
          $slice: -10,
        },
      };
      delete updateData.createVersion;
      delete updateData.versionName;
      delete updateData.changeSummary;
    }

    if (updateData.avatar) {
      updateData["hero.avatar"] = updateData.avatar;
    }

    const portfolio = await Portfolio.findOneAndUpdate(
      {
        _id: req.params.id,
        user: { $in: userIds },
      },
      updateData,
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Portfolio updated successfully",
      portfolio,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// Delete Portfolio
// =======================
export const deletePortfolio = async (req, res) => {
  try {
    const userIds = await resolveAccessibleUserIds(req.user);
    const portfolio = await Portfolio.findOneAndDelete({
      _id: req.params.id,
      user: { $in: userIds },
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Portfolio deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// Duplicate Portfolio
// =======================
export const duplicatePortfolio = async (req, res) => {
  try {
    const userIds = await resolveAccessibleUserIds(req.user);
    const source = await Portfolio.findOne({
      _id: req.params.id,
      user: { $in: userIds },
    });

    if (!source) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    const duplicateData = source.toObject();
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;

    duplicateData.user = req.user._id;
    duplicateData.title = `${source.title} (Copy)`;
    duplicateData.status = "Draft";
    duplicateData.customDomain = "";
    duplicateData.deployedUrl = "";
    duplicateData.deploymentStatus = "Idle";
    duplicateData.versions = [
      {
        versionNumber: 1,
        name: `Cloned from ${source.title}`,
        snapshot: { ...duplicateData },
        changedBy: req.user.fullName || "User",
        changeSummary: "Duplicated from existing portfolio",
        createdAt: new Date(),
      },
    ];

    const newPortfolio = await Portfolio.create(duplicateData);

    return res.status(201).json({
      success: true,
      message: "Portfolio duplicated successfully",
      portfolio: newPortfolio,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// Archive / Unarchive Portfolio
// =======================
export const toggleArchivePortfolio = async (req, res) => {
  try {
    const userIds = await resolveAccessibleUserIds(req.user);
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: { $in: userIds },
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    portfolio.isArchived = !portfolio.isArchived;
    await portfolio.save();

    return res.status(200).json({
      success: true,
      message: portfolio.isArchived
        ? "Portfolio archived"
        : "Portfolio unarchived",
      portfolio,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// AI Apply Changes (Creates Version History & applies suggestions)
// =======================
export const applyAISuggestions = async (req, res) => {
  try {
    const { id } = req.params;
    const { suggestions = [] } = req.body;
    const userIds = await resolveAccessibleUserIds(req.user);

    const portfolio = await Portfolio.findOne({
      _id: id,
      user: { $in: userIds },
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    // Save previous snapshot to versions (capped to 10 versions)
    const nextVer = (portfolio.versions?.length || 0) + 1;
    const cleanPrevious = portfolio.toObject();
    delete cleanPrevious.versions;
    if (cleanPrevious.analysisReport) delete cleanPrevious.analysisReport.rawHtml;

    const previousSnapshot = {
      versionNumber: nextVer,
      name: `Pre-AI Optimization v${nextVer}`,
      snapshot: cleanPrevious,
      changedBy: "AI Suggestion Engine",
      changeSummary: `Applied ${suggestions.length} AI improvements`,
      createdAt: new Date(),
    };

    if (!portfolio.versions) portfolio.versions = [];
    portfolio.versions.push(previousSnapshot);
    if (portfolio.versions.length > 10) {
      portfolio.versions = portfolio.versions.slice(-10);
    }

    // Apply suggestions to fields
    suggestions.forEach((sug) => {
      if ((sug.field === "about" || (sug.category && sug.category.toLowerCase().includes("bio"))) && sug.suggested) {
        portfolio.about = sug.suggested;
        portfolio.description = sug.suggested;
        if (portfolio.hero) portfolio.hero.description = sug.suggested;
      } else if (sug.field === "projects" && sug.suggested) {
        if (Array.isArray(portfolio.projects) && portfolio.projects.length > 0) {
          let targetProj = portfolio.projects.find((p) =>
            sug.targetItem && (
              sug.targetItem.toLowerCase().includes(p.title.toLowerCase()) ||
              p.title.toLowerCase().includes(sug.targetItem.toLowerCase().replace(/project:?/i, "").trim())
            )
          );
          if (!targetProj) {
            targetProj = portfolio.projects[0];
          }
          if (targetProj) {
            targetProj.description = sug.suggested;
          }
        }
      } else if ((sug.field === "hero" || sug.field === "tagline") && sug.suggested) {
        portfolio.tagline = sug.suggested;
        if (portfolio.hero) portfolio.hero.tagline = sug.suggested;
      } else if (sug.field === "template" && sug.recommendedTemplateId) {
        portfolio.template = sug.recommendedTemplateId;
      } else if (sug.field === "certifications" && Array.isArray(sug.recommendedCertifications)) {
        if (!Array.isArray(portfolio.certifications)) portfolio.certifications = [];
        sug.recommendedCertifications.forEach((cert) => {
          if (!portfolio.certifications.some((c) => c.name?.toLowerCase() === cert.name.toLowerCase())) {
            portfolio.certifications.push({
              name: cert.name,
              issuer: cert.issuer,
              date: "Target / In Progress",
              description: cert.relevance,
            });
          }
        });
      } else if (sug.field === "experience" && sug.suggested) {
        if (Array.isArray(portfolio.experience) && portfolio.experience.length > 0) {
          let targetExp = portfolio.experience.find((e) =>
            sug.targetItem && (
              sug.targetItem.toLowerCase().includes((e.company || "").toLowerCase()) ||
              sug.targetItem.toLowerCase().includes((e.role || "").toLowerCase())
            )
          );
          if (!targetExp) targetExp = portfolio.experience[0];
          if (targetExp) {
            targetExp.description = sug.suggested;
          }
        }
      }
    });

    await portfolio.save();

    return res.status(200).json({
      success: true,
      message: `Successfully applied ${suggestions.length} AI suggestions! Created version snapshot v${nextVer}.`,
      portfolio,
    });
  } catch (error) {
    console.error("[applyAISuggestions]", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// Restore Version Snapshot
// =======================
export const restoreVersion = async (req, res) => {
  try {
    const { id, versionNumber } = req.params;
    const userIds = await resolveAccessibleUserIds(req.user);

    const portfolio = await Portfolio.findOne({
      _id: id,
      user: { $in: userIds },
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    const versionItem = portfolio.versions?.find(
      (v) => String(v.versionNumber) === String(versionNumber),
    );

    if (!versionItem || !versionItem.snapshot) {
      return res.status(404).json({
        success: false,
        message: `Version ${versionNumber} not found`,
      });
    }

    const snap = versionItem.snapshot;

    // Restore key fields
    if (snap.name !== undefined) portfolio.name = snap.name;
    if (snap.tagline !== undefined) portfolio.tagline = snap.tagline;
    if (snap.about !== undefined) portfolio.about = snap.about;
    if (snap.skills !== undefined) portfolio.skills = snap.skills;
    if (snap.projects !== undefined) portfolio.projects = snap.projects;
    if (snap.experience !== undefined) portfolio.experience = snap.experience;
    if (snap.education !== undefined) portfolio.education = snap.education;
    if (snap.achievements !== undefined) portfolio.achievements = snap.achievements;
    if (snap.certifications !== undefined) portfolio.certifications = snap.certifications;
    if (snap.blog !== undefined) portfolio.blog = snap.blog;
    if (snap.template !== undefined) portfolio.template = snap.template;
    if (snap.preferences !== undefined) portfolio.preferences = snap.preferences;

    // Record restore event
    const nextVer = portfolio.versions.length + 1;
    const cleanRestoreSnap = portfolio.toObject();
    delete cleanRestoreSnap.versions;
    if (cleanRestoreSnap.analysisReport) delete cleanRestoreSnap.analysisReport.rawHtml;

    portfolio.versions.push({
      versionNumber: nextVer,
      name: `Restored to v${versionNumber}`,
      snapshot: cleanRestoreSnap,
      changedBy: req.user.fullName || "User",
      changeSummary: `Restored snapshot from Version ${versionNumber}`,
      createdAt: new Date(),
    });
    if (portfolio.versions.length > 10) {
      portfolio.versions = portfolio.versions.slice(-10);
    }

    await portfolio.save();

    return res.status(200).json({
      success: true,
      message: `Restored to Version ${versionNumber}`,
      portfolio,
    });
  } catch (error) {
    console.error("[restoreVersion]", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// =======================
// Helper: Project Workflow & Architectural Data Flow Engine (with Visual Arrows & In-Flight Payloads)
// =======================
const WORKFLOW_QUERY_REGEX =
  /(?:workflow|work\s*flow|data\s*flow|architecture\s*flow|flow\s*chart|lifecycle|how.*(?:work|flow)|request\s*flow|pipeline|step.*by.*step.*flow|arrows?.*data|data.*arrows?)/i;

const GREETING_REGEX =
  /^(?:hi|hello|hey|hey\s+there|hola|greetings|good\s*(?:morning|afternoon|evening)|yo|sup|what'?s\s*up)[.!]?$/i;

const GRATITUDE_REGEX =
  /^(?:thanks|thank\s*you|thx|many\s*thanks|appreciate\s*it|great|awesome|perfect|cool|sounds\s*good)[.!]?$/i;

function detectWorkflowProject(rawMessage, targetPortfolio = null, githubContext = null) {
  const msg = (rawMessage || "").toLowerCase();

  // 1. Check known specific projects
  if (/study\s*sphere|educational|learning\s*resource|resource\s*platform/i.test(msg)) {
    return {
      key: "study-sphere",
      title: "Study Sphere - Educational Resource Platform",
      role: "Full Stack Engineer",
      domain: "EdTech & Academic Content Delivery",
      stack: "React.js, Node.js, Express, MongoDB Atlas, REST APIs, Tailwind CSS",
      description:
        "Educational web platform providing students with organized learning resources, search indexing, document downloads, and topic discovery.",
    };
  }

  if (/velvet\s*vogue|fashion|e-?commerce|clothing|shop/i.test(msg)) {
    return {
      key: "velvet-vogue",
      title: "Velvet Vogue - Fashion E-Commerce Platform",
      role: "Frontend / Full Stack Engineer",
      domain: "E-Commerce & Digital Retail",
      stack: "React.js, Tailwind CSS, JavaScript, Node.js, REST APIs",
      description:
        "Online fashion e-commerce platform with responsive product catalog, dynamic filtering, interactive shopping cart, and checkout pipeline.",
    };
  }

  if (/eco\s*connect|green\s*living|environment|sustainab/i.test(msg)) {
    return {
      key: "ecoconnect",
      title: "EcoConnect - Green Living Community Platform",
      role: "Frontend Engineer / UI Specialist",
      domain: "Community & Sustainability",
      stack: "React.js, Tailwind CSS, JavaScript, HTML5, REST APIs",
      description:
        "Environmental community platform featuring ecological pledge tracking, event registration, interactive eco-modals, and collective carbon metrics.",
    };
  }

  if (/portfolio\s*ai|autonomous.*portfolio|portfolio\s*builder/i.test(msg)) {
    return {
      key: "portfolioai",
      title: "PortfolioAI - Autonomous AI Portfolio Platform",
      role: "AI Full Stack Engineer",
      domain: "Developer Tools & Generative AI",
      stack: "React 19, Node.js, Express, MongoDB Atlas, OpenRouter/Gemini AI, Tailwind CSS",
      description:
        "Autonomous portfolio creation and optimization platform featuring 14 visual themes, resume parser, live site scraping, and AI copilot chat.",
    };
  }

  // 2. Check if query matches any project inside targetPortfolio
  if (targetPortfolio?.projects?.length) {
    for (const p of targetPortfolio.projects) {
      const pTitle = (p.title || "").toLowerCase();
      if (pTitle && (msg.includes(pTitle.slice(0, 10)) || msg.includes(pTitle.split(" ")[0].toLowerCase()))) {
        return {
          key: "custom",
          title: p.title,
          role: targetPortfolio.targetRole || "Full Stack Engineer",
          domain: "Web Application",
          stack: (p.tags || []).join(", ") || "React, Node.js, MongoDB",
          description:
            p.description || "Production web application with secure REST API and responsive interface.",
        };
      }
    }
  }

  // 3. Check githubContext
  if (githubContext) {
    return {
      key: "custom",
      title: githubContext.fullName || githubContext.name,
      role: "Software Engineer",
      domain: "Open Source / Web Application",
      stack: `${githubContext.language || "JavaScript"}, ${(githubContext.dependencies || []).slice(0, 4).join(", ") || "Node.js, Express"}`,
      description:
        githubContext.description || "Web application repository with modular architecture and CI/CD.",
    };
  }

  // 4. Default to project #1 if portfolio attached
  if (targetPortfolio?.projects?.length) {
    const p = targetPortfolio.projects[0];
    return {
      key: "custom",
      title: p.title || "Primary Web Application",
      role: targetPortfolio.targetRole || "Full Stack Engineer",
      domain: "Web Application",
      stack: (p.tags || []).join(", ") || "React, Node.js, MongoDB",
      description:
        p.description || "Flagship full-stack application featuring client SPA, Express backend, and MongoDB database.",
    };
  }

  // 5. Default flagship showcase: Study Sphere
  return {
    key: "study-sphere",
    title: "Study Sphere - Educational Resource Platform",
    role: "Full Stack Engineer",
    domain: "EdTech & Academic Content Delivery",
    stack: "React.js, Node.js, Express, MongoDB Atlas, REST APIs, Tailwind CSS",
    description:
      "Educational web platform providing students with organized learning resources, search indexing, document downloads, and topic discovery.",
  };
}

function buildStudySphereWorkflow() {
  return `🏗️ **End-to-End Architectural Workflow with Directional Arrows & In-Flight Data**
### 📘 Project: **Study Sphere – Educational Resource Platform**
• **Domain**: EdTech & Academic Content Delivery
• **Tech Stack**: \`React.js 19\`, \`Node.js\`, \`Express 5\`, \`MongoDB Atlas\`, \`Tailwind CSS\`, \`REST APIs\`
• **Core Purpose**: Enables students to search, filter, and stream academic learning resources with sub-50ms query latency and role-based access.

---

### 1. 📊 Interactive Visual Workflow Diagram (with In-Flight Data & Directional Arrows)

\`\`\`mermaid
graph TD
  Client["💻 1. Student Client (React 19 SPA)"] -->|"➔ 1. HTTPS POST /api/v1/resources/search<br/>Payload: { query: 'Binary Trees', categoryId: 'cs_sem4', fileType: 'PDF', page: 1 }"| Gateway["🛡️ 2. Express Gateway & Rate Limiter"]
  Gateway -->|"➔ 2. Sanitized Context + Rate Limit Stamp<br/>Data: { clientIp: '103.21.x.x', rateBucket: '98/100', bodyValidated: true }"| AuthMiddleware["🔐 3. JWT Verification Middleware"]
  AuthMiddleware -->|"➔ 3. Decoded Student Claims & Scoped Access<br/>Data: { studentId: 'std_7812', role: 'STUDENT', campus: 'Engineering' }"| Controller["⚙️ 4. Resource Controller & Query Engine"]
  Controller -->|"➔ 4. Mongoose Compound Query (.lean())<br/>Query: { category: 'cs_sem4', status: 'VERIFIED', $text: { $search: 'Binary Trees' } }"| DB[("🗄️ 5. MongoDB Atlas Database")]
  DB -->|"➔ 5. Serialized Document Stream<br/>Result: [ { _id: 'r_101', title: 'Binary Trees Guide', size: '2.4MB', downloads: 1420 } ]"| Controller
  Controller -->|"➔ 6. HTTP 200 OK + Gzip JSON Payload<br/>Payload: { success: true, count: 14, latencyMs: 24, data: [...] }"| Client
  Client -.->|"➔ 7. Asynchronous Material Stream Request<br/>Payload: { resourceId: 'r_101', studentAuth: 'bearer...' }"| CDN[("☁️ 8. Cloudinary / S3 Material Storage")]
  CDN -.->|"➔ 8. Signed Binary Download Stream (PDF / 2.4 MB)"| Client
\`\`\`

---

### 2. ⚡ Multi-Tier Architecture Pipeline (Directional Arrows & In-Flight Payloads)

\`\`\`
[1. Student Browser / React 19 SPA]
        │
        │  ➔ 1. HTTPS POST /api/v1/resources/search
        │     Headers: { Authorization: "Bearer eyJhbGci...", "Content-Type": "application/json" }
        │     Payload: { "query": "Binary Trees", "categoryId": "cs_sem4", "fileType": "PDF", "page": 1 }
        ▼
[2. Edge & Security: Express API Gateway]
        │
        │  ➔ 2. Sanitized Context & Rate Limit Stamp
        │     Data: { "clientIp": "103.21.x.x", "rateLimit": "98/100", "bodyValidated": true }
        ▼
[3. Auth Tier: JWT Verification & RBAC Middleware]
        │
        │  ➔ 3. Decoded Student Identity & Scoped Access
        │     Context: { "studentId": "std_7812", "role": "STUDENT", "campus": "Engineering" }
        ▼
[4. Service Tier: Resource Controller & Search Query Builder]
        │
        │  ➔ 4. Mongoose Compound Query Pipeline (.lean())
        │     Query: { "category": "cs_sem4", "status": "VERIFIED", "$text": { "$search": "Binary Trees" } }
        ▼
[5. Persistence Tier: MongoDB Atlas Replica Set]
        │
        │  ➔ 5. Raw BSON Documents (Lean In-Memory Stream)
        │     Data: [ { "_id": "r_101", "title": "Binary Trees Guide", "downloads": 1420, "url": "https://..." } ]
        ▼
[6. Serialization Tier: Compression & ETag Attachment]
        │
        │  ➔ 6. HTTP 200 OK Response Stream
        │     Payload: { "success": true, "count": 14, "latencyMs": 24, "data": [...] }
        ▼
[7. Presentation Tier: React Zustand Hydration & UI Virtual DOM]
\`\`\`

---

### 3. 📋 Data Flow Specification Matrix

| Step # | Source ➔ Target | Direction & Protocol | Exact In-Flight Data / Payload Schema | Applied Transformation & Security |
|:---:|:---|:---|:---|:---|
| **1** | Student Client ➔ Express Gateway | \`➔ HTTPS POST /api/v1/resources/search\` | \`{"query":"Binary Trees","categoryId":"cs_sem4","fileType":"PDF","page":1}\` | Client-side validation; Bearer JWT injected in HTTP Authorization header |
| **2** | Express Gateway ➔ Rate Limiter | \`➔ Internal Memory Bus\` | \`{"clientIp":"103.21.x.x","timestamp":1727400000,"bucketRemaining":98}\` | Sliding window rate limiting (100 req/min); blocks brute-force abuse |
| **3** | Rate Limiter ➔ JWT Auth Middleware | \`➔ Middleware Chain\` | \`{"token":"eyJhbGciOi...","secret":"JWT_SECRET"}\` | HMAC-SHA256 signature verification; extracts \`{ studentId, role, exp }\` |
| **4** | Auth Middleware ➔ Resource Controller | \`➔ Express Request Context\` | \`{"studentId":"std_7812","filter":{"category":"cs_sem4","status":"VERIFIED"}}\` | Input sanitization against NoSQL injection using mongo-sanitize |
| **5** | Controller ➔ MongoDB Atlas | \`➔ MongoDB Wire Protocol (TCP)\` | \`db.resources.find({category:"cs_sem4",$text:{$search:"Binary Trees"}}).lean()\` | Compound text-and-category B-Tree index scan (\`idx_cat_text\`); p99 < 15ms |
| **6** | MongoDB Atlas ➔ Controller | \`➔ BSON Document Cursor\` | \`[{"_id":"r_101","title":"Binary Trees Guide","size":"2.4MB","downloads":1420}]\` | Lean projection omitting internal mongoose metadata, saving 40% RAM |
| **7** | Controller ➔ Client Browser | \`➔ HTTP 200 OK (Gzip JSON)\` | \`{"success":true,"count":14,"total":48,"latencyMs":24,"data":[...]}\` | ETag cache header attached; Zustand store updates; UI render |

---

### 4. ⚠️ Error Handling & Resilience Workflows (with Directional Arrows & Payloads)

1. **Expired or Invalid JWT Token**:
   - \`Client ➔ Express Gateway ➔ Auth Middleware\`
   - \`Auth Middleware ➔ Client: HTTP 401 Unauthorized { "success": false, "code": "TOKEN_EXPIRED", "message": "Session expired" }\`
   - \`Client (Axios Interceptor) ➔ Refresh Handshake: POST /api/v1/auth/refresh-token { "refreshToken": "..." } ➔ Retry Original Request\`

2. **Rate Limit Breach**:
   - \`Client ➔ Express Gateway (101st request within 60s)\`
   - \`Gateway ➔ Client: HTTP 429 Too Many Requests { "error": "Rate limit exceeded", "retryAfterSeconds": 42 }\`

3. **Database Timeout / Network Glitch**:
   - \`Controller ➔ MongoDB Atlas (Pool Timeout > 3000ms)\`
   - \`Controller ➔ Cache Fallback (Stale-while-revalidate read from in-memory cache)\`
   - \`If Cache Empty ➔ HTTP 503 Service Unavailable { "error": "Database busy, retrying in 3s" }\`

---

### 5. 🎯 Technical Interview Defense & Recruiter Talking Points
• **Why Compound Indexing on MongoDB**: By establishing a compound index on \`{ category: 1, fileType: 1, title: "text" }\`, queries avoid collection scans and hit B-Trees directly, maintaining sub-15ms response times even across 100,000+ educational records.
• **Why \`.lean()\` in Mongoose**: Bypassing Mongoose document hydration drops memory usage by **40%** and cuts garbage collection pause times under high concurrency.
• **Stateless Horizontal Scalability**: JWT auth allows the Express tier to run across multiple container instances with zero sticky-session overhead.

---

💬 *Would you like to explore another project workflow? You can also ask:*
• *"Workflow for Velvet Vogue with arrows and data"*
• *"Workflow for EcoConnect with arrows and data"*
• *"Workflow for PortfolioAI with arrows and data"*
• *"Workflow for [your custom project name] with arrows and data"*`;
}

function buildVelvetVogueWorkflow() {
  return `🏗️ **End-to-End Architectural Workflow with Directional Arrows & In-Flight Data**
### 👗 Project: **Velvet Vogue – Fashion E-Commerce Platform**
• **Domain**: E-Commerce & Retail Checkout Architecture
• **Tech Stack**: \`React.js\`, \`Tailwind CSS\`, \`JavaScript\`, \`Node.js\`, \`Express\`, \`MongoDB\`, \`REST APIs\`
• **Core Purpose**: Enables shoppers to browse catalogs, filter apparel, manage cart items, and initiate secure checkout with inventory reservations.

---

### 1. 📊 Interactive Visual Workflow Diagram (with In-Flight Data & Directional Arrows)

\`\`\`mermaid
graph TD
  Shopper["🛍️ 1. Customer Client (React SPA)"] -->|"➔ 1. HTTPS POST /api/v1/cart/checkout<br/>Payload: { cartId: 'c_88', items: [ { id: 'p_10', qty: 2 } ], promoCode: 'SUMMER20' }"| Gateway["🛡️ 2. Express API Gateway & Validator"]
  Gateway -->|"➔ 2. Sanitized Context + Customer ID<br/>Payload: { customerId: 'cust_41', validatedCart: { subtotal: 96.00 } }"| OrderService["⚙️ 3. Order Processing Controller"]
  OrderService -->|"➔ 3. Atomic Stock Verification Query<br/>Query: { _id: { $in: ['p_10'] }, stock: { $gte: 2 } }"| DB[("🗄️ 4. MongoDB Product & Inventory")]
  DB -->|"➔ 4. Inventory Lock Confirmation<br/>Data: { locked: true, reservedUntil: 1727400900 }"| OrderService
  OrderService -->|"➔ 5. HTTPS POST /v1/payment_intents<br/>Payload: { amount: 9600, currency: 'usd', customer: 'cus_41' }"| StripeGateway["💳 6. Stripe Payment Gateway"]
  StripeGateway -->|"➔ 6. Client Secret & Payment Intent ID<br/>Data: { clientSecret: 'pi_3M..._secret_...', status: 'requires_payment_method' }"| OrderService
  OrderService -->|"➔ 7. HTTP 201 Created<br/>Payload: { orderId: 'ord_9901', clientSecret: 'pi_3M...', total: 96.00 }"| Shopper
\`\`\`

---

### 2. ⚡ Multi-Tier Architecture Pipeline (Directional Arrows & In-Flight Payloads)

\`\`\`
[1. Shopper Client / React SPA]
        │
        │  ➔ 1. HTTPS POST /api/v1/cart/checkout
        │     Headers: { Authorization: "Bearer eyJhbGci...", "Content-Type": "application/json" }
        │     Payload: { "cartId": "c_88", "items": [ { "productId": "p_10", "qty": 2, "price": 48 } ], "promo": "SUMMER20" }
        ▼
[2. Edge Gateway: Input Validation & Sanitization]
        │
        │  ➔ 2. Validated Order Request & Customer Identity
        │     Data: { "customerId": "cust_41", "subtotal": 96.00, "currency": "USD" }
        ▼
[3. Business Service: Inventory Lock & Cart Engine]
        │
        │  ➔ 3. Atomic Decrement / Stock Lock
        │     Query: { "productId": "p_10", "inventoryCount": { "$gte": 2 } }
        ▼
[4. Persistence Tier: MongoDB Atlas (ACID Transaction)]
        │
        │  ➔ 4. Reserved Stock Status & Order Document
        │     Data: { "orderId": "ord_9901", "status": "PENDING_PAYMENT", "reservedUntil": 1727400900 }
        ▼
[5. External Financial Tier: Stripe Payment Gateway]
        │
        │  ➔ 5. Encrypted Payment Intent Request (HTTPS TLS 1.3)
        │     Payload: { "amount": 9600, "currency": "usd", "metadata": { "orderId": "ord_9901" } }
        ▼
[6. Response Handshake: Stripe ➔ Express ➔ Client]
        │
        │  ➔ 6. HTTP 201 Created + Stripe Client Secret
        │     Payload: { "success": true, "orderId": "ord_9901", "clientSecret": "pi_3M_secret_..." }
        ▼
[7. Shopper Screen: Stripe Elements Card Form & Instant UI Confirmation]
\`\`\`

---

### 3. 📋 Data Flow Specification Matrix

| Step # | Source ➔ Target | Direction & Protocol | Exact In-Flight Data / Payload Schema | Applied Transformation & Security |
|:---:|:---|:---|:---|:---|
| **1** | Shopper Client ➔ Gateway | \`➔ HTTPS POST /api/v1/cart/checkout\` | \`{"cartId":"c_88","items":[{"productId":"p_10","qty":2}],"promo":"SUMMER20"}\` | Schema validation via Zod; JWT token in headers |
| **2** | Gateway ➔ Order Service | \`➔ Express Request Context\` | \`{"customerId":"cust_41","subtotal":96.00,"currency":"USD"}\` | Calculation of discounts and tax; customer ID extraction |
| **3** | Order Service ➔ MongoDB | \`➔ MongoDB Wire Protocol\` | \`db.products.updateOne({_id:"p_10",stock:{$gte:2}},{$inc:{stock:-2}})\` | Atomic inventory reservation prevents race conditions |
| **4** | MongoDB ➔ Order Service | \`➔ WriteResult\` | \`{"acknowledged":true,"modifiedCount":1}\` | Verification that stock lock succeeded |
| **5** | Order Service ➔ Stripe | \`➔ HTTPS POST api.stripe.com\` | \`{"amount":9600,"currency":"usd","metadata":{"orderId":"ord_9901"}}\` | TLS 1.3 encryption with Stripe idempotency key |
| **6** | Stripe ➔ Order Service | \`➔ HTTPS Response 200 OK\` | \`{"id":"pi_3M...","client_secret":"pi_3M_secret_...","status":"requires_payment_method"}\` | Payment intent stored in order record |
| **7** | Order Service ➔ Shopper | \`➔ HTTP 201 Created\` | \`{"orderId":"ord_9901","clientSecret":"pi_3M...","total":96.00}\` | Client renders Stripe Elements card field for secure payment |

---

### 4. ⚠️ Error Handling & Resilience Workflows (with Directional Arrows & Payloads)

1. **Out of Stock / Race Condition**:
   - \`Order Service ➔ MongoDB: stock < requestedQty\`
   - \`Order Service ➔ Client: HTTP 409 Conflict { "error": "INSUFFICIENT_STOCK", "productId": "p_10", "available": 1 }\`
   - \`Client: Auto-updates cart item count to maximum available and prompts user.\`

2. **Payment Card Declined**:
   - \`Stripe Webhook ➔ Order Service: payment_intent.payment_failed { "code": "card_declined" }\`
   - \`Order Service ➔ MongoDB: Rolls back stock reservation with atomic $inc: { stock: +2 }\`
   - \`Order Service ➔ Client: HTTP 402 Payment Required { "message": "Card declined by issuing bank" }\`

---

### 5. 🎯 Technical Interview Defense & Recruiter Talking Points
• **Inventory Concurrency Protection**: Preventing double-selling during flash sales requires atomic conditional updates (\`$inc: { stock: -qty }\` with \`stock: { $gte: qty }\`) or MongoDB transactions rather than simple find-then-save queries.
• **Idempotent Checkout**: Every checkout request includes a client-generated UUID idempotency key to prevent double charging if users double-click the checkout button.
• **PCI-DSS Compliance**: Credit card numbers never touch the Express server; Stripe Elements directly tokens card details on the client.`;
}

function buildEcoConnectWorkflow() {
  return `🏗️ **End-to-End Architectural Workflow with Directional Arrows & In-Flight Data**
### 🌿 Project: **EcoConnect – Green Living Community Platform**
• **Domain**: Environmental Action & Community Impact Metrics
• **Tech Stack**: \`React.js\`, \`Tailwind CSS\`, \`JavaScript\`, \`HTML5\`, \`Node.js\`, \`Express\`, \`MongoDB\`
• **Core Purpose**: Enables eco-conscious citizens to record green pledges, participate in sustainability challenges, and visualize aggregated CO2 reduction metrics in real-time.

---

### 1. 📊 Interactive Visual Workflow Diagram (with In-Flight Data & Directional Arrows)

\`\`\`mermaid
graph TD
  Member["🌱 1. Community Member (React SPA)"] -->|"➔ 1. HTTPS POST /api/v1/pledges/log<br/>Payload: { pledgeType: 'solar_energy', kgsCO2Saved: 38.5, location: 'Urban Hub' }"| Gateway["🛡️ 2. Express Security Gateway"]
  Gateway -->|"➔ 2. Verified JWT + Sanitized Pledge Payload<br/>Data: { memberId: 'mem_62', verifiedScore: 38.5, rateBucket: '99/100' }"| PledgeService["⚙️ 3. Environmental Impact Controller"]
  PledgeService -->|"➔ 3. Atomic MongoDB Increment & Log Insert<br/>Query: { $inc: { totalCO2Saved: 38.5, points: 150 }, $push: { logs: ... } }"| DB[("🗄️ 4. MongoDB Community Metrics")]
  DB -->|"➔ 4. Updated Member Stats & Real-Time Aggregate<br/>Data: { totalCO2Saved: 480.2, newRank: 'Eco-Champion' }"| PledgeService
  PledgeService -->|"➔ 5. HTTP 200 OK + Live Impact Metrics<br/>Payload: { success: true, pointsAwarded: 150, newRank: 'Eco-Champion' }"| Member
\`\`\`

---

### 2. ⚡ Multi-Tier Architecture Pipeline (Directional Arrows & In-Flight Payloads)

\`\`\`
[1. Member Client / React SPA]
        │
        │  ➔ 1. HTTPS POST /api/v1/pledges/log
        │     Headers: { Authorization: "Bearer eyJhbGci...", "Content-Type": "application/json" }
        │     Payload: { "pledgeType": "solar_energy", "kgsCO2Saved": 38.5, "location": "Urban Hub" }
        ▼
[2. Security Gateway: Express Rate Limiter & Validator]
        │
        │  ➔ 2. Sanitized Pledge Context & Member ID
        │     Data: { "memberId": "mem_62", "pledgeType": "solar_energy", "verified": true }
        ▼
[3. Business Tier: Environmental Calculation Engine]
        │
        │  ➔ 3. Carbon Offset Algorithm & Reward Points Multiplier
        │     Calculation: 38.5 kg CO2 * 4 pts/kg = 154 impact points
        ▼
[4. Persistence Tier: MongoDB Community Cluster]
        │
        │  ➔ 4. Atomic Increment on Leaderboard & Aggregate Stats
        │     Query: { "_id": "mem_62", "$inc": { "totalCO2": 38.5, "points": 154 } }
        ▼
[5. Real-Time Broadcast & Serialization Tier]
        │
        │  ➔ 5. HTTP 200 OK + Real-Time Metric Payload
        │     Payload: { "success": true, "newRank": "Eco-Champion", "communityTotalTons": 142.8 }
        ▼
[6. Member Dashboard: Interactive Modal & Confetti Reward Animation]
\`\`\`

---

### 3. 📋 Data Flow Specification Matrix

| Step # | Source ➔ Target | Direction & Protocol | Exact In-Flight Data / Payload Schema | Applied Transformation & Security |
|:---:|:---|:---|:---|:---|
| **1** | Member Client ➔ Gateway | \`➔ HTTPS POST /api/v1/pledges/log\` | \`{"pledgeType":"solar_energy","kgsCO2Saved":38.5}\` | Client form validation; modal state lock during submission |
| **2** | Gateway ➔ Security Tier | \`➔ Express Middleware Chain\` | \`{"token":"eyJhbGciOi...","action":"PLEDGE_LOG"}\` | JWT token validation; rate-limiting prevents scripted badge farming |
| **3** | Security ➔ Impact Controller | \`➔ Controller Context\` | \`{"memberId":"mem_62","cleanPayload":{"type":"solar","saved":38.5}}\` | Environmental factor multiplier computed |
| **4** | Controller ➔ MongoDB Atlas | \`➔ MongoDB Wire Protocol\` | \`db.members.updateOne({_id:"mem_62"},{$inc:{co2Saved:38.5,pts:154}})\` | Atomic update ensures data integrity across parallel submissions |
| **5** | MongoDB ➔ Controller | \`➔ BSON Document\` | \`{"_id":"mem_62","totalCO2":480.2,"rank":"Eco-Champion"}\` | Milestone detection triggers achievement unlock |
| **6** | Controller ➔ Member Client | \`➔ HTTP 200 OK (JSON)\` | \`{"success":true,"pointsAwarded":154,"newRank":"Eco-Champion"}\` | React UI state triggers animated badge modal |

---

### 4. ⚠️ Error Handling & Resilience Workflows (with Directional Arrows & Payloads)

1. **Duplicate Pledge Spam**:
   - \`Client ➔ Gateway (Repeated pledge within 5 minutes)\`
   - \`Gateway ➔ Client: HTTP 429 Too Many Requests { "error": "PLEDGE_COOLDOWN", "retryAfterSeconds": 180 }\`

2. **Network Disconnection on Mobile Client**:
   - \`Client: Pledges stored in browser IndexedDB/LocalStorage queue\`
   - \`Client: Automatic retry on navigator.onLine event when connection restores.\`

---

### 5. 🎯 Technical Interview Defense & Recruiter Talking Points
• **Component Reusability**: All interactive modal components, buttons, and impact cards were built as decoupled, pure React components with Tailwind utility tokens.
• **State Synchronization**: Client state updates optimistically on pledge submission, falling back gracefully if network requests error.`;
}

function buildPortfolioAIWorkflow() {
  return `🏗️ **End-to-End Architectural Workflow with Directional Arrows & In-Flight Data**
### 🤖 Project: **PortfolioAI – Autonomous AI Portfolio Builder & Optimizer**
• **Domain**: Generative AI, Developer Tools & Autonomous Full-Stack Architecture
• **Tech Stack**: \`React 19\`, \`Node.js\`, \`Express 5\`, \`MongoDB Atlas\`, \`OpenRouter / Gemini AI\`, \`Tailwind CSS\`
• **Core Purpose**: Enables developers to generate, optimize, and live-chat with their portfolio, featuring automated resume parsing, GitHub repository inspection, and multi-model AI inference.

---

### 1. 📊 Interactive Visual Workflow Diagram (with In-Flight Data & Directional Arrows)

\`\`\`mermaid
graph TD
  DevUser["✨ 1. Developer Client (React 19 SPA)"] -->|"➔ 1. HTTPS POST /api/v1/portfolios/chat<br/>Payload: { message: 'Workflow for Study Sphere', portfolioId: '65f...', conversationHistory: [...] }"| Gateway["🛡️ 2. Express API Gateway & CORS Filter"]
  Gateway -->|"➔ 2. Authenticated Session Context & Decoded User<br/>Data: { userId: 'usr_501', userRole: 'developer', rateBucket: '99/100' }"| ChatController["⚙️ 3. PortfolioAI Copilot Controller"]
  ChatController -->|"➔ 3. MongoDB Aggregate Query (.populate('user'))<br/>Query: { _id: '65f...' }"| DB[("🗄️ 4. MongoDB Atlas Database")]
  DB -->|"➔ 4. Full Portfolio Schema Documents<br/>Data: { title: 'Anushka Garg Portfolio', projects: [Study Sphere, Velvet Vogue, ...] }"| ChatController
  ChatController -->|"➔ 5. Multi-Model OpenRouter Request<br/>Payload: { model: 'qwen3.8-27b', messages: [{ role: 'system', ... }, { role: 'user', ... }] }"| AIModel["🧠 6. OpenRouter / Gemini Neural Core"]
  AIModel -->|"➔ 6. Formatted Markdown with Mermaid & Data Tables<br/>Tokens: 1,420 | Latency: 1.1s"| ChatController
  ChatController -->|"➔ 7. HTTP 200 OK Response Stream<br/>Payload: { success: true, reply: '...', targetPortfolio: {...} }"| DevUser
  DevUser -->|"➔ 8. Client React Markdown & Mermaid SVG Injection<br/>State: Visual Diagram Rendered via Mermaid.js"| DevUser
\`\`\`

---

### 2. ⚡ Multi-Tier Architecture Pipeline (Directional Arrows & In-Flight Payloads)

\`\`\`
[1. Developer Client / React 19 SPA]
        │
        │  ➔ 1. HTTPS POST /api/v1/portfolios/chat
        │     Headers: { Authorization: "Bearer eyJhbGci...", "Content-Type": "application/json" }
        │     Payload: { "message": "Workflow for Study Sphere", "portfolioId": "65f..." }
        ▼
[2. Ingestion & Security: Express API Gateway]
        │
        │  ➔ 2. Validated Session & Sanitized User Context
        │     Data: { "userId": "usr_501", "sanitizedMessage": "Workflow for Study Sphere" }
        ▼
[3. Context Hydration: MongoDB Portfolio Aggregation]
        │
        │  ➔ 3. Document Query with User Population
        │     Data: { "portfolio": { "title": "Developer Portfolio", "projects": [...] } }
        ▼
[4. External LLM Gateway: OpenRouter Multi-Model Pool]
        │
        │  ➔ 4. HTTPS POST https://openrouter.ai/api/v1/chat/completions
        │     Payload: { "model": "qwen/qwen3.8-27b:free", "messages": [...] }
        ▼
[5. Dynamic Fallback Engine: Zero-Failure Failover]
        │
        │  ➔ 5. Automatic Fallback to Deterministic Bespoke Generator if AI times out (>10s)
        │     Output: Guaranteed high-signal visual diagrams and data matrix
        ▼
[6. Response Handshake: Express Server ➔ React Client]
        │
        │  ➔ 6. HTTP 200 OK (Gzip JSON Stream)
        │     Payload: { "success": true, "reply": "...", "targetPortfolio": {...} }
        ▼
[7. Browser Presentation: ReactMarkdown + remark-gfm + Mermaid SVG Canvas]
\`\`\`

---

### 3. 📋 Data Flow Specification Matrix

| Step # | Source ➔ Target | Direction & Protocol | Exact In-Flight Data / Payload Schema | Applied Transformation & Security |
|:---:|:---|:---|:---|:---|
| **1** | Developer Client ➔ Gateway | \`➔ HTTPS POST /api/v1/portfolios/chat\` | \`{"message":"Workflow for Study Sphere","portfolioId":"65f..."}\` | Payload validated; client conversation history truncated to last 4 turns |
| **2** | Gateway ➔ Auth Middleware | \`➔ Middleware Chain\` | \`{"bearerToken":"eyJhbGciOi...","ip":"103.21.x.x"}\` | Authenticated session verified; guest fallback supported |
| **3** | Auth ➔ Context Hydrator | \`➔ MongoDB Wire Protocol\` | \`Portfolio.findById(portfolioId).populate("user")\` | Hydrates authentic candidate projects and skills |
| **4** | Context ➔ OpenRouter AI | \`➔ HTTPS POST openrouter.ai/api/v1\` | \`{"model":"qwen/qwen3.8-27b:free","messages":[...]}\` | Multi-model failover array (\`qwen\`, \`inkling\`, \`lfm\`) with 10s timeout |
| **5** | AI Core ➔ Copilot Controller | \`➔ JSON Response\` | \`{"choices":[{"message":{"content":"🏗️ Workflow..."}}]}\` | Validates presence of Mermaid arrows and data tables |
| **6** | Controller ➔ Client SPA | \`➔ HTTP 200 OK\` | \`{"success":true,"reply":"...","targetPortfolio":{...}}\` | Gzip compression applied; chat session saved to MongoDB |
| **7** | Client SPA ➔ Screen | \`➔ React DOM Hydration\` | \`ReactMarkdown -> MermaidDiagram (SVG Canvas)\` | Dynamic SVG injection with zoom controls and copy button |

---

### 4. ⚠️ Error Handling & Resilience Workflows (with Directional Arrows & Payloads)

1. **AI Model Rate Limit / Upstream 429**:
   - \`Controller ➔ OpenRouter: HTTP 429 Too Many Requests\`
   - \`Controller: Cycles through failover pool (qwen ➔ inkling ➔ poolside)\`
   - \`If all upstream models exhausted: Automatically serves deterministic Bespoke Generator with zero downtime.\`

2. **Client Render Protection**:
   - \`MermaidDiagram: If SVG rendering syntax fails, catches error and renders formatted code block with copy button.\`

---

### 5. 🎯 Technical Interview Defense & Recruiter Talking Points
• **Resilient Multi-Model Architecture**: Rather than relying on a single AI provider, the architecture implements a multi-model failover circuit breaker, guaranteeing 99.9% uptime.
• **Security & Prompt Injection Hardening**: All inputs undergo sanitization and system prompts are strictly isolated to prevent prompt injection.`;
}

function buildCustomProjectWorkflow(projectInfo) {
  const title = projectInfo.title || "Production Web Application";
  const role = projectInfo.role || "Full Stack Engineer";
  const domain = projectInfo.domain || "Web Architecture";
  const stack = projectInfo.stack || "React, Node.js, Express, MongoDB";
  const desc =
    projectInfo.description ||
    "Scalable web platform featuring responsive UI and secure REST API services.";

  return `🏗️ **End-to-End Architectural Workflow with Directional Arrows & In-Flight Data**
### 🚀 Project: **${title}**
• **Domain**: ${domain} | **Target Role**: \`${role}\`
• **Tech Stack**: \`${stack}\`
• **Core Purpose**: ${desc}

---

### 1. 📊 Interactive Visual Workflow Diagram (with In-Flight Data & Directional Arrows)

\`\`\`mermaid
graph TD
  Client["💻 1. Client Browser (React SPA)"] -->|"➔ 1. HTTPS POST /api/v1/action<br/>Payload: { query: 'request_data', filter: 'active', page: 1 }"| Gateway["🛡️ 2. Express API Gateway & Rate Limiter"]
  Gateway -->|"➔ 2. Sanitized Context + Rate Limit Stamp<br/>Data: { clientIp: '103.21.x.x', rateBucket: '99/100', tokenValid: true }"| AuthMiddleware["🔐 3. JWT Verification Middleware"]
  AuthMiddleware -->|"➔ 3. Decoded Identity & Permission Claims<br/>Data: { userId: 'usr_102', role: 'AUTHENTICATED_USER' }"| Controller["⚙️ 4. Business Logic Controller"]
  Controller -->|"➔ 4. Optimized Database Query (.lean())<br/>Query: { status: 'ACTIVE', indexedField: 'query_data' }"| DB[("🗄️ 5. MongoDB Atlas Database")]
  DB -->|"➔ 5. Serialized Document Stream<br/>Result: [ { _id: 'doc_1', status: 'ACTIVE', data: [...] } ]"| Controller
  Controller -->|"➔ 6. HTTP 200 OK + Gzip JSON Payload<br/>Payload: { success: true, count: 12, latencyMs: 22, data: [...] }"| Client
\`\`\`

---

### 2. ⚡ Multi-Tier Architecture Pipeline (Directional Arrows & In-Flight Payloads)

\`\`\`
[1. Client Tier: React SPA / Mobile Client]
        │
        │  ➔ 1. HTTPS POST /api/v1/action
        │     Headers: { Authorization: "Bearer eyJhbGci...", "Content-Type": "application/json" }
        │     Payload: { "query": "request_data", "filter": "active", "page": 1 }
        ▼
[2. Edge & Security: Express API Gateway]
        │
        │  ➔ 2. Sanitized Context & Rate Limit Stamp
        │     Data: { "clientIp": "103.21.x.x", "rateLimit": "99/100", "bodyValidated": true }
        ▼
[3. Auth Tier: JWT Verification & RBAC Middleware]
        │
        │  ➔ 3. Decoded Identity & Scoped Access
        │     Context: { "userId": "usr_102", "role": "AUTHENTICATED_USER" }
        ▼
[4. Service Tier: Business Logic Controller & Query Engine]
        │
        │  ➔ 4. Mongoose Indexed Query Pipeline (.lean())
        │     Query: { "status": "ACTIVE", "indexedField": "query_data" }
        ▼
[5. Persistence Tier: MongoDB Atlas Replica Set]
        │
        │  ➔ 5. Raw BSON Documents (Lean In-Memory Stream)
        │     Data: [ { "_id": "doc_1", "status": "ACTIVE", "payload": [...] } ]
        ▼
[6. Serialization Tier: Compression & ETag Attachment]
        │
        │  ➔ 6. HTTP 200 OK Response Stream
        │     Payload: { "success": true, "count": 12, "latencyMs": 22, "data": [...] }
        ▼
[7. Presentation Tier: React Zustand Hydration & UI Virtual DOM]
\`\`\`

---

### 3. 📋 Data Flow Specification Matrix

| Step # | Source ➔ Target | Direction & Protocol | Exact In-Flight Data / Payload Schema | Applied Transformation & Security |
|:---:|:---|:---|:---|:---|
| **1** | Client SPA ➔ Express Gateway | \`➔ HTTPS POST /api/v1/action\` | \`{"query":"request_data","filter":"active","page":1}\` | Schema validation; Bearer JWT injected in HTTP Authorization header |
| **2** | Express Gateway ➔ Rate Limiter | \`➔ Internal Memory Bus\` | \`{"clientIp":"103.21.x.x","rateBucket":99}\` | Sliding window rate limiting (100 req/min); prevents abuse |
| **3** | Rate Limiter ➔ JWT Auth Middleware | \`➔ Middleware Chain\` | \`{"token":"eyJhbGciOi...","secret":"JWT_SECRET"}\` | Signature verification; extracts identity claims |
| **4** | Auth Middleware ➔ Controller | \`➔ Express Request Context\` | \`{"userId":"usr_102","sanitizedFilter":{"status":"ACTIVE"}}\` | Input sanitization against NoSQL injection using mongo-sanitize |
| **5** | Controller ➔ MongoDB Atlas | \`➔ MongoDB Wire Protocol (TCP)\` | \`db.collection.find({status:"ACTIVE"}).lean()\` | B-Tree index scan; sub-20ms query latency |
| **6** | MongoDB Atlas ➔ Controller | \`➔ BSON Document Cursor\` | \`[{"_id":"doc_1","status":"ACTIVE"}]\` | Lean projection omitting internal mongoose metadata |
| **7** | Controller ➔ Client Browser | \`➔ HTTP 200 OK (Gzip JSON)\` | \`{"success":true,"count":12,"latencyMs":22,"data":[...]}\` | ETag cache header attached; Zustand store updates; UI render |

---

### 4. ⚠️ Error Handling & Resilience Workflows (with Directional Arrows & Payloads)

1. **Authentication Failure**:
   - \`Client ➔ Express Gateway ➔ Auth Middleware\`
   - \`Auth Middleware ➔ Client: HTTP 401 Unauthorized { "success": false, "code": "INVALID_TOKEN" }\`
   - \`Client: Automatic token refresh handshake or redirect to login.\`

2. **Downstream Timeout / Circuit Breaker**:
   - \`Controller ➔ Database: Network timeout > 3000ms\`
   - \`Controller: Triggers circuit breaker; serves cached response or graceful error { "status": "DEGRADED" }.\`

---

### 5. 🎯 Technical Interview Defense & Recruiter Talking Points
• **Architectural Decoupling**: Separation of concerns between the Express routing layer, business service logic, and persistence tier ensures high testability.
• **Database Efficiency**: Using lean queries and index optimization keeps p99 latency below 30ms.`;
}

function generateProjectWorkflowResponse(projectNameOrMessage, targetPortfolio = null, githubContext = null) {
  const projectInfo = detectWorkflowProject(projectNameOrMessage, targetPortfolio, githubContext);

  if (projectInfo.key === "study-sphere") {
    return buildStudySphereWorkflow();
  }
  if (projectInfo.key === "velvet-vogue") {
    return buildVelvetVogueWorkflow();
  }
  if (projectInfo.key === "ecoconnect") {
    return buildEcoConnectWorkflow();
  }
  if (projectInfo.key === "portfolioai") {
    return buildPortfolioAIWorkflow();
  }
  return buildCustomProjectWorkflow(projectInfo);
}

// =======================
// Helper: Bespoke Portfolio Response Generator (Zero-Repetition Multi-Intent Engine)
// =======================
function generateBespokePortfolioResponse(rawMessage, targetPortfolio) {
  const portfolioTitle =
    targetPortfolio.title || targetPortfolio.name || targetPortfolio.hero?.name || "Developer Portfolio";
  const targetRole = targetPortfolio.targetRole || "Software Engineer";
  const targetCompany = targetPortfolio.targetCompany || "Leading Tech Companies";
  const skills = targetPortfolio.skills || [];
  const topSkills = skills.slice(0, 6).join(", ") || "React, Node.js, JavaScript, TailwindCSS";
  const allSkillsList = skills.join(", ") || topSkills;

  const projects = targetPortfolio.projects || [];
  const p1 = projects[0] || {
    title: "Primary Full Stack System",
    description: "Web application featuring responsive UI and secure REST APIs",
    tags: ["React", "Node.js", "Express"],
  };
  const p2 = projects[1] || {
    title: "Cloud Data Platform",
    description: "Backend architecture handling state synchronization and queries",
    tags: ["MongoDB", "REST API", "TailwindCSS"],
  };

  const p1Tags = (p1.tags && p1.tags.length ? p1.tags : ["React", "Node.js"]).join(", ");
  const p2Tags = (p2.tags && p2.tags.length ? p2.tags : ["Express", "MongoDB"]).join(", ");
  const templateName = targetPortfolio.template || "modern";
  const liveUrlText = targetPortfolio.deployedUrl
    ? `[${targetPortfolio.deployedUrl}](${targetPortfolio.deployedUrl})`
    : "Local Preview";

  const msg = (rawMessage || "").toLowerCase();

  // 00. GREETING & CONVERSATIONAL PLEASANTRIES
  if (GREETING_REGEX.test(msg.trim())) {
    const candName = targetPortfolio.name || targetPortfolio.fullName || "there";
    return `👋 **Hello ${candName}! I'm your PortfolioAI Career Copilot.**

I have your portfolio **"${portfolioTitle}"** loaded into my context (${targetRole}${targetCompany ? ` @ ${targetCompany}` : ""}).

Here are a few high-impact things we can explore together:
• 🎯 **STAR Project Bullets**: *"Help me rewrite ${p1.title} with quantified metrics ($ saved, % speedup)"*
• 📈 **ATS & Recruiter Scan**: *"Audit this portfolio against 6-second recruiter criteria"*
• 💡 **Skills Gap Analysis**: *"What tech skills should I highlight to stand out for ${targetRole}?"*
• ✍️ **About / Bio Polish**: *"Rewrite my About section with executive impact"*
• 🏗️ **System Architecture**: *"Show me the architecture and data flow for ${p1.title}"*

What would you like to work on right now?`;
  }

  if (GRATITUDE_REGEX.test(msg.trim())) {
    return `🙌 **You're very welcome!**

I'm always here if you want to refine your project descriptions, polish your About section, or run an ATS audit. Feel free to ask anytime! 🚀`;
  }

  // 0. WORKFLOW & ARCHITECTURAL DATA FLOW (with Directional Arrows & In-Flight Payloads)
  if (WORKFLOW_QUERY_REGEX.test(msg)) {
    return generateProjectWorkflowResponse(rawMessage, targetPortfolio, null);
  }

  // 1. INTERVIEW QUESTIONS / RESUME & PORTFOLIO DEFENSE (High-Priority Intent)
  if (
    /(?:interview|ques(?:tion)?s?.*(?:ask|recruit|recuiter|resume|portfolio|project)|(?:recruit|recuiter|hiring|interviewer).*ask|ask.*(?:from|about).*(?:resume|project|portfolio)|prepare.*interview|defense)/i.test(
      msg,
    )
  ) {
    return `🎯 **Recruiter & Technical Interview Questions Prepared for ${portfolioTitle}**
• **Target Candidate**: \`${targetRole}\` | **Company Aim**: \`${targetCompany}\`
• **Flagship Project**: "${p1.title}" *(Tech: ${p1Tags})*
• **Secondary Project**: "${p2.title}" *(Tech: ${p2Tags})*
• **Core Competencies**: \`${topSkills}\`

When technical recruiters and hiring managers review your resume and portfolio, they will test you on **architecture decisions, trade-offs, debugging stories, and production readiness**. Here are the exact questions you must be ready to defend:

---

### 1. 🏗️ Deep-Dive Architecture Questions on "${p1.title}"
1. **"Walk me through the lifecycle of a request in ${p1.title}."**
   • *What they are evaluating*: Do you understand how the client communicates with the server, how auth tokens or session state are validated, and how data queries are executed?
   • *Key points to hit*: Mention client state handling, route protection middleware, and database response caching.
2. **"Why did you choose \`${p1Tags.split(",")[0] || "React"}\` and \`${p1Tags.split(",")[1] || "Node.js"}\` for ${p1.title} instead of other alternatives?"**
   • *What they are evaluating*: Did you select your tech stack intentionally or just follow a basic tutorial?
   • *Key points to hit*: Discuss developer velocity, component modularity, ecosystem maturity, and asynchronous I/O performance.
3. **"What was the most challenging technical bug or bottleneck you ran into while building ${p1.title}?"**
   • *What they are evaluating*: Problem-solving grit, root-cause debugging, and systematic verification under constraints.

---

### 2. ⚡ Scalability & Failure Recovery Scenarios
4. **"If ${p1.title} suddenly had 5,000 concurrent active users, what is the first thing that breaks?"**
   • *What they are evaluating*: Concurrency awareness and system boundaries (e.g., MongoDB connection saturation, unindexed collection scans, or un-debounced client search inputs).
   • *How to answer*: Explain how you would introduce in-memory caching (Redis), database index optimizations, and rate-limiting middleware.
5. **"How does ${p1.title} handle network failures or API errors gracefully?"**
   • *What they are evaluating*: User experience resilience—error boundaries, loading skeletons, and retry mechanisms rather than broken blank screens.

---

### 3. 🛠️ Core Technical Knowledge for ${targetRole}
6. **"Explain how \`${topSkills.split(",")[0] || "JavaScript"}\` handles asynchronous operations and the event loop."**
7. **"How do you ensure data integrity and secure authorization between client sessions and your database?"**
   • Mention stateless JWT verification, HTTP-only cookies, password hashing (bcrypt), and schema validation.

---

### 4. 🤝 Behavioral & Engineering Trade-offs (CAR Framework)
8. **"Tell me about a feature in your portfolio projects that you had to compromise or simplify due to constraints."**
   • *What they are evaluating*: Pragmatism and shipping ability vs. endless over-engineering.
9. **"If you had two more weeks to work on ${p1.title}, what is the first architectural change you would make?"**
   • *Great answer*: Adding automated end-to-end integration tests (Playwright/Jest) or Dockerizing the environment for seamless CI/CD deployments.

---

💡 **Pro Tip for Interview Defense**:
Use the **CAR Model** (*Context -> Action -> Result*). Keep Context under 20 seconds, spend 40 seconds on your technical Action (\`${p1Tags}\`), and finish with 20 seconds on the measurable Result.`;
  }

  // 2. RESUME REVIEW & SYNC WITH PORTFOLIO
  if (
    /(?:resume|cv).*(?:review|improv|audit|feedback|tips|roast|check|score|write|format)|how.*(?:resume|cv)|make.*resume.*better/i.test(
      msg,
    )
  ) {
    return `📄 **Resume & Portfolio Synchronization Audit for ${portfolioTitle}**
• **Target Role**: \`${targetRole}\` | **Company Aim**: \`${targetCompany}\`
• **Detected Stack**: \`${topSkills}\`

To make your resume and portfolio reinforce each other into a cohesive application package, follow this 4-step synchronization checklist:

---

### 1. 🎯 Synchronize Your Headline
• Ensure your resume header title matches your portfolio title: **"${targetRole}"**.
• Recruiters get confused if a resume says "Computer Science Student" but the portfolio says "Full Stack Engineer". Consistency builds trust.

---

### 2. 🚀 Align Projects with Exact STAR Bullets
Feature **"${p1.title}"** as your primary technical project on your resume with this quantified phrasing:
> **"${p1.title}** | \`${p1Tags}\`
> • Architected full-stack platform utilizing \`${p1Tags.split(",")[0] || "React"}\` and \`${p1Tags.split(",")[1] || "Node.js"}\`, optimizing query indexes and latency by 42%.
> • Designed secure authentication flows and REST endpoints sustaining 99.9% uptime across simulated high-load scenarios."

---

### 3. 🔗 Clickable Portfolio & Live Demo Links
• Place your live portfolio link (${liveUrlText}) right next to your email and phone number at the top of your resume.
• Include direct hyperlinks to the deployed application and GitHub repository for "${p1.title}".

---

### 4. 🧹 ATS Formatting Best Practices
• Keep your resume to **exactly 1 page** (unless you have 5+ years of industry experience).
• Use clean single-column layout without tables, graphics, or skill rating bars (e.g. "80% JavaScript") so ATS parsers can read 100% of your text.`;
  }

  // 3. WHAT PROJECTS TO ADD / PROJECT IDEAS
  if (
    /what.*(?:project|add|build)|add.*project|project.*(?:idea|suggest|recommend|need|look.*for)|new.*project|missing.*project|build.*project/i.test(
      msg,
    )
  ) {
    return `💡 **Curated Project Recommendations for ${portfolioTitle}**
• **Target Goal**: Elevating your portfolio for **${targetRole}** roles at **${targetCompany}**.
• **Current Stack Detected**: \`${topSkills}\`
• **Existing Projects**: "${p1.title}"${projects.length > 1 ? `, "${p2.title}"` : ""}

Recruiters at top tech firms aren't looking for basic CRUD tutorials (like to-do lists or generic clones). They look for **architecture depth, asynchronous processing, and scalability**. Here are 3 distinct, high-impact projects designed specifically to complement your current stack:

---

### 1. ⚡ High-Throughput Event Processing Engine (Backend & Systems)
• **The Concept**: Build an asynchronous job queue / webhook ingestion platform (e.g., automated email delivery, file converter, or rate-limited API gateway) using **${p1Tags.split(",")[0] || "Node.js"}**, **Redis**, and **Worker Threads/BullMQ**.
• **Why It Stands Out for ${targetRole}**: Proves you understand concurrency, background task scheduling, backpressure, and caching layers rather than simple synchronous request-response loops.
• **Key Metrics to Highlight**: *"Processed 5,000+ jobs/minute with automated retry queues, reducing peak DB connection spikes by 60%."*

---

### 2. 🔄 Real-Time Collaborative Workspace or Streaming Dashboard
• **The Concept**: A live multi-user collaborative whiteboard, code execution runner, or financial data stream with **WebSockets (Socket.io/ws)** and **optimistic UI updates**.
• **Why It Stands Out for ${targetCompany}**: Proves mastery of state synchronization, handling packet drops, conflict resolution (CRDTs or Operational Transforms), and zero-latency UI rendering.
• **Key Metrics to Highlight**: *"Maintained sub-40ms WebSocket broadcast latency across 200+ concurrent simulated browser sessions."*

---

### 3. 🤖 AI-Native Domain Copilot / RAG Pipeline
• **The Concept**: A domain-specific AI tool (e.g. smart resume analyzer, automated PR reviewer, or technical documentation search) utilizing vector embeddings, Pinecone/ChromaDB, and streaming LLM responses.
• **Why It Stands Out**: Shows hiring managers that you build modern AI-integrated software rather than legacy templates.

---

📌 **Recruiter Tip**: Adding just *one* of these three projects with a public GitHub repo + Docker container setup will instantly move your portfolio into the top 10% of candidates applying for **${targetRole}**.`;
  }

  // 4. PROJECT DESCRIPTIONS / STAR REWRITE / BULLETS
  if (
    /project.*(?:desc|write|detail|bullet|\bstar\b|improve)|improve.*(?:project|bullet)|how.*describe.*project|\bstar\b.*(?:bullet|format|method)|rewrite.*project/i.test(
      msg,
    )
  ) {
    return `🎯 **Actionable STAR Project Rewrites for ${portfolioTitle}**
• **Target Role**: \`${targetRole}\` | **Company Focus**: \`${targetCompany}\`

Most candidate portfolios fail because their descriptions only list features (*"Users can login, view items, and checkout"*). Technical recruiters and hiring managers want to see **engineering decisions, architecture trade-offs, and quantified results**.

Here is the exact STAR framework transformation for your portfolio's projects:

---

### 🚀 Flagship Project: "${p1.title}"
**Current Focus**: ${p1.description || "Core application"} *(Tech: ${p1Tags})*

**❌ Weak / Generic Phrasing**:
> *"Built a web app using ${p1Tags} allowing users to manage data, view dashboards, and authenticate."*

**✅ Recruiter-Ready STAR Rewrite (Copy & Paste)**:
> **"Architected and deployed ${p1.title}**, an end-to-end platform utilizing \`${p1Tags}\`. Engineered modular component hierarchies and implemented database index optimizations with connection pooling, **reducing server response latency by 42% (from 820ms to 475ms)**. Designed secure stateless JWT session flows and automated CI/CD pipeline deployments, maintaining **99.9% uptime across 10,000+ simulated requests**."

---

### ⚡ Secondary Project: "${p2.title}"
**Current Focus**: ${p2.description || "Secondary web service"} *(Tech: ${p2Tags})*

**✅ Recruiter-Ready STAR Rewrite (Copy & Paste)**:
> **"Engineered ${p2.title}** leveraging \`${p2Tags}\`, creating a fault-tolerant REST API with in-memory caching to eliminate redundant database roundtrips. Implemented robust input validation schemas and standardized error-handling boundaries, **decreasing uncaught client exceptions by 65%** and achieving a **98+ Lighthouse performance score**."

---

📋 **The 3 Rules to Apply Across All Your Project Cards**:
1. **Lead with a Heavy Engineering Verb**: (e.g., *Architected, Spearheaded, Refactored, Engineered, Benchmarked* — avoid *Helped, Worked on, Made*).
2. **Always Name the Exact Tech**: Mention \`${p1Tags.split(",").slice(0, 2).join(" & ")}\` directly in the bullet.
3. **Embed at Least 1 Hard Metric**: Every bullet must feature a number (*% speedup, ms latency, test coverage %, or concurrent users handled*).`;
  }

  // 5. SKILLS & TECH STACK / WHAT TO LEARN / HIGHLIGHT
  if (
    /\bskills?\b|tech.*stack|highlight.*(?:skill|tech)|which.*skill|what.*learn|\bstack\b|technolog/i.test(
      msg,
    )
  ) {
    return `🛠️ **Strategic Skills & Tech Stack Blueprint for ${portfolioTitle}**
• **Target Role**: \`${targetRole}\`
• **Target Organization**: \`${targetCompany}\`
• **Currently Listed Skills**: \`${allSkillsList}\`

To win recruiter screeners and pass Applicant Tracking Systems (ATS), your skills section must do more than list keywords—it must demonstrate **depth and market alignment**.

---

### 1. 🌟 Tier 1: Core Value Proposition (Keep Prominent in Hero)
Feature these detected strengths prominently in your primary headline and project tags:
• **Primary Stack**: \`${topSkills}\`
• **Presentation Rule**: Never display these as an unorganized cloud. Group them into distinct badges: **Frontend Architecture**, **Backend & APIs**, and **Database & State Management**.

---

### 2. 🚀 Tier 2: The High-Leverage Market Gaps for ${targetRole}
Hiring teams targeting **${targetCompany}** look for modern production tools that bridge the gap between junior and mid/senior engineers. Consider highlighting or acquiring:
• **TypeScript**: If any of your JavaScript projects can be migrated or have TypeScript types, highlight \`TypeScript\`—it is requested in 70%+ of modern **${targetRole}** postings.
• **Docker & Containerization**: Add a \`Dockerfile\` and \`docker-compose.yml\` to "${p1.title}" and list \`Docker\` in your DevOps section.
• **Automated Testing**: Add unit test badges (\`Jest\`, \`Vitest\`, or \`Playwright\`). 85% of applicants omit testing, so showcasing it sets you apart immediately.
• **Caching / Caching Layers**: Listing \`Redis\` alongside \`${p2Tags}\` demonstrates system scalability awareness.

---

### 3. 🧹 Tier 3: Skills Section Hygiene & Anti-Patterns
• **Remove Baseline Fluff**: Avoid listing generic utilities like \`Git\`, \`GitHub\`, \`HTML5\`, \`CSS3\`, \`VS Code\`, or \`Slack\` as top skills. In 2026, recruiters treat these as prerequisites. Use that prime screen estate for \`${p1Tags}\`, \`RESTful Architecture\`, and \`Performance Optimization\`.
• **Skill-Project Binding**: Every skill you claim in your skills section should be tagged on at least one project card so recruiters have instant proof of competence.`;
  }

  // 6. RECRUITER & ATS FRIENDLINESS / 6-SECOND SCAN
  if (
    /(?:recruit(?:er|or)?|recuiter|recruter|\bats\b|hiring|\bhr\b|shortlist|scan|first.*impression|friendly|stand.*out|impress)/i.test(
      msg,
    )
  ) {
    return `👔 **The 6-Second Recruiter & ATS Audit for ${portfolioTitle}**
• **Candidate Target**: \`${targetRole}\` | **Company Level**: \`${targetCompany}\`
• **Template Layout**: \`${templateName}\`

Technical recruiters spend an average of **6 to 8 seconds** on a portfolio before deciding whether to schedule a phone screen. Here is how to ensure your portfolio passes both the automated ATS filter and the recruiter human scan:

---

### ⏱️ 1. The 6-Second Above-the-Fold Test
Recruiters must identify three things before scrolling 300px:
1. **Who you are & Your Title**: Ensure your header prominently says **"${targetRole}"** rather than a vague title like "Tech Enthusiast" or "Learner".
2. **Primary Stack Value**: Display a crisp subheadline: *"Specializing in scalable web systems with \`${topSkills.split(",").slice(0, 3).join(", ")}\`."*
3. **Instant Action CTAs**: A prominent **[Download Resume (PDF)]** button and direct **[GitHub]** and **[LinkedIn]** icons pinned in the top navigation bar.

---

### 🔗 2. Zero-Friction Project Verification
• **One-Click Live Demos**: Ensure **"${p1.title}"** and **"${p2.title}"** have working, direct live links. Never require a recruiter to clone a repository or run \`npm install\` to see your work.
• **Prefilled Test Credentials**: If "${p1.title}" requires authentication, provide a 1-click **"Explore Demo as Guest"** button or print demo credentials (*Email: demo@test.com | Password: password123*) right on the card.
• **GitHub Source Transparency**: Both projects should link directly to clean GitHub repos with informative READMEs.

---

### 🤖 3. ATS Alignment Checklist
• **Page \`<title>\` Tag**: Change your browser tab title to: \`${portfolioTitle} | ${targetRole} | Portfolio\`.
• **Semantic Heading Hierarchy**: Use exactly one \`<h1>\` containing your name and target title, followed by structured \`<h2>\` tags for Projects, Experience, and Skills.
• **ATS Scannability**: Ensure your resume download is a machine-readable 1-page PDF (not a heavy image graphic).`;
  }

  // 7. WHAT IS MISSING / BLIND SPOTS / GAPS
  if (
    /missing|lack|\bgap\b|blind.*spot|need.*more|what.*else|incomplete|add.*more/i.test(
      msg,
    )
  ) {
    return `🔍 **Portfolio Gap Analysis & Missing Elements for ${portfolioTitle}**
• **Inspected Portfolio**: \`${portfolioTitle}\`
• **Target Role**: \`${targetRole}\`
• **Detected Projects**: ${projects.length} (${projects.map((p) => `"${p.title}"`).join(", ") || "None"})

After evaluating your portfolio against top-performing engineering candidates, here are the **4 critical blind spots** currently missing:

---

### 1. 📐 System Architecture Diagrams for "${p1.title}"
• **The Missing Piece**: Right now, recruiters only see the user interface. Engineering hiring managers want to know how the system is architected under the hood.
• **The Fix**: Add a 3-tier architecture diagram (Client -> API Gateway / Load Balancer -> Database & Cache) in your project modal or GitHub README. A simple Mermaid or Excalidraw flow diagram instantly elevates your credibility.

---

### 2. 📊 Quantified Business & Performance Metrics
• **The Missing Piece**: Your current project descriptions lack hard numbers.
• **The Fix**: Quantify at least two aspects for each project:
  - *Speed / Latency*: *"Optimized query response from 600ms to 210ms."*
  - *Scale / Volume*: *"Tested with 5,000 mock records with zero memory leaks."*
  - *Productivity*: *"Automated CI/CD build scripts, saving ~4 hours of manual deployment time weekly."*

---

### 3. 🎥 Interactive Previews or 10-Second Demo GIFs
• **The Missing Piece**: Recruiters frequently browse portfolios on mobile or without audio. If a live site takes >3 seconds to load or has expired backend free-tier instances (like sleeping Render/Glitch servers), they leave.
• **The Fix**: Embed an autoplaying GIF, MP4 preview, or Loom demo link directly inside the "${p1.title}" card showing the core user workflow.

---

### 4. 🤝 Social Proof & Engineering Endorsements
• **The Missing Piece**: A portfolio without third-party validation feels unverified.
• **The Fix**: Include 1 or 2 short recommendation quotes from peers, mentors, project teammates, or open-source contributors praising your code quality and communication.`;
  }

  // 8. SCORE AUDIT / WHY IS MY SCORE LOW
  if (
    /\bscore\b|\baudit\b|\bgrade\b|\brating\b|why.*score|evaluat/i.test(
      msg,
    )
  ) {
    return `📊 **Comprehensive Portfolio Score & Audit Report**
• **Portfolio Analyzed**: \`${portfolioTitle}\`
• **Role Alignment**: \`${targetRole}\` at \`${targetCompany}\`
• **Active Template**: \`${templateName}\`

---

### 🎯 Overall Portfolio Score: **76 / 100** *(Solid Foundation • High Optimization Potential)*

| Evaluation Pillar | Score | Status | Primary Action Item |
| :--- | :---: | :--- | :--- |
| **1. Quantified Project Impact** | **64 / 100** | ⚠️ Needs Work | Add hard metrics (% latency reduction, users handled) to "${p1.title}". |
| **2. Role & ATS Keyword Match** | **82 / 100** | ✅ Good | Add TypeScript and Docker tags to support "${targetRole}". |
| **3. Visual Hierarchy & Theme** | **88 / 100** | 🌟 Strong | ${templateName} template provides clean contrast; ensure mobile menu is crisp. |
| **4. Proof of Work & Live URLs** | **70 / 100** | ⚠️ Average | Verify 1-click live demo links for all ${projects.length || 2} projects. |
| **5. Recruiter Conversion & CTA** | **76 / 100** | 🔄 Moderate | Pin Resume PDF and LinkedIn links in top navigation. |

---

### 🚀 Roadmap to Raise Your Score from 76 to 95+:
1. **+10 Points (STAR Rewrites)**: Replace generic project sentences with quantifiable impact statements for "${p1.title}" and "${p2.title}".
2. **+5 Points (Live Verification)**: Ensure your deployed URL (${liveUrlText}) is connected and that each project card has working GitHub and Live Demo buttons.
3. **+4 Points (Skills Grouping)**: Organize your \`${topSkills}\` into logical categories (Languages, Frameworks, Cloud/APIs).`;
  }

  // 9. ABOUT SECTION / BIO / SUMMARY REWRITE
  if (
    /\babout\b|\bbio\b|\bsummary\b|introduce|who am i/i.test(
      msg,
    )
  ) {
    return `✍️ **Recruiter-Ready About Section Rewrites for ${portfolioTitle}**
• **Target Role**: \`${targetRole}\` | **Company Focus**: \`${targetCompany}\`
• **Detected Stack**: \`${topSkills}\`

A great About section should never be a generic biography ("I love coding and learning new things"). It must position you as a **problem solver who understands how software drives business value**.

Here are two distinct, high-impact options tailored to your portfolio:

---

### 🚀 Option A: The Product-Minded Software Engineer
*(Best for high-growth tech companies and fast-paced engineering teams)*

> "I am a **${targetRole}** passionate about transforming complex engineering challenges into clean, scalable user experiences. Leveraging expertise across \`${topSkills}\`, I specialize in architecting responsive frontend interfaces and high-reliability backend services. From launching production-grade platforms like *${p1.title}* to fine-tuning database query latency, I focus on writing maintainable, tested code that delivers measurable value for forward-thinking teams like **${targetCompany}**."

---

### ⚙️ Option B: The Systems & Performance Specialist
*(Best for enterprise organizations, cloud platforms, and infrastructure-focused teams)*

> "Results-oriented **${targetRole}** with an engineering focus on scalable web architecture, distributed APIs, and performant state management. Proficient in \`${topSkills}\`, with proven experience taking applications from concept through CI/CD deployment—including engineering *${p1.title}* with 99.9% uptime and low-latency API endpoints. Dedicated to clean system design, automated testing, and building robust software built for scale."

---

💡 **Pro Tip**: Place a direct link to your **[Resume PDF]** and a short quote about your core engineering philosophy directly beneath this section.`;
  }

  // 10. DESIGN / UI / UX / TEMPLATE / VISUAL (Strict Word Boundaries!)
  if (
    /\bdesign\b|\bui\b|\bux\b|\btemplate\b|\blayout\b|\blook\b|\bvisual\b|\bstyling\b|\btheme\b|dark.*mode|\bcolor\b|\bfont\b|typography/i.test(
      msg,
    )
  ) {
    return `🎨 **Design, UI & UX Optimization Plan for ${portfolioTitle}**
• **Current Theme / Template**: \`${templateName}\`
• **Deployed Preview**: ${liveUrlText}

Your current **${templateName}** template provides a clean aesthetic, but subtle visual polish will dramatically elevate how hiring managers perceive your attention to detail:

---

### 1. 🌟 Flagship Project Elevation ("${p1.title}")
• **Visual Hierarchy**: Don't let all project cards look identical. Make **"${p1.title}"** your featured showcase:
  - Give it a subtle gradient border accent or a **"Featured Architecture"** badge.
  - Display a full-width high-resolution screenshot or dynamic mock preview card.

---

### 2. 🖱️ Micro-Interactions & Hover Polish
• **Interactive Feedback**: Ensure every interactive card has a smooth transform elevation:
  - Add \`transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1)\` with \`transform: translateY(-4px)\` and a soft ambient shadow on hover.
• **Skill Badges**: Style your skill pills with semi-transparent background tints and crisp borders rather than solid high-contrast blocks.

---

### 3. 📱 Mobile Viewport & Whitespace Discipline
• **Breathing Room**: Ensure there is at least 64px to 80px vertical padding between sections (Hero -> About -> Projects -> Skills -> Contact).
• **Touch Target Sizes**: Verify all mobile navigation links and buttons have at least 44x44px touch targets.`;
  }

  // 11. EXPERIENCE / WORK HISTORY
  if (
    /experience|work.*history|internship|\bjobs?\b|career|work.*exp/i.test(
      msg,
    )
  ) {
    return `💼 **Experience & Career Positioning Guide for ${portfolioTitle}**
• **Target Title**: \`${targetRole}\` | **Company Aim**: \`${targetCompany}\`

Whether showcasing full-time roles, internships, freelance engagements, or open-source engineering, the formula for standing out is identical:

---

### 📐 The High-Impact Work Experience Formula
Every bullet point under your experience entries should follow this exact sequence:
> **[Strong Action Verb]** + **[Specific Feature or System Built]** + **[Technologies Used (\`${topSkills.split(",").slice(0, 3).join(", ")}\`)]** + **[Quantifiable Business / Engineering Result]**.

---

### 📝 Before & After Example
❌ **Passive / Weak**:
> *"Worked on the frontend dashboard and fixed bugs in the REST API for clients."*

✅ **Active / High-Impact**:
> *"Spearheaded the modular refactor of core client dashboards using \`${p1Tags}\`, reducing bundle size by 35% and accelerating page initial load speed by 1.2s for 8,000+ daily active users."*

---

### 💡 What If You Have Limited Traditional Experience?
• **Treat "${p1.title}" as Production Engineering**: Frame your self-architected systems as production projects. Describe the deployment, testing suite, and infrastructure setup with the same rigor as an enterprise role.
• **Highlight Open-Source PRs**: If you've contributed to community libraries or submitted bug fixes, create an **Open Source Contributions** card linking directly to merged GitHub pull requests.`;
  }

  // 12. CONTACT / NETWORKING / CTA
  if (
    /contact|email|linkedin|reach|call.*to.*action|\bcta\b|social|hire/i.test(
      msg,
    )
  ) {
    return `📬 **Contact & Conversion Optimization for ${portfolioTitle}**
• **Inspected Portfolio**: \`${portfolioTitle}\`

Your portfolio's ultimate goal is to convert visiting recruiters and hiring managers into scheduled interviews. Here is how to eliminate all friction in your contact channels:

---

### 1. 📋 Instant Click-to-Copy Email
• Most users don't want their desktop mail client triggered by a standard \`mailto:\` link.
• Add a **"Copy Email to Clipboard"** button with a toast notification (*"Email copied to clipboard!"*) right alongside your direct link.

---

### 2. 📄 Direct Resume Download
• Host your ATS-compliant 1-page PDF resume on a reliable cloud CDN (or Cloudinary).
• Put a clear **[Download Resume (PDF)]** button in your top navigation header and in your hero section.

---

### 3. 🌐 Social Profiles Verification
• Verify that your **GitHub** and **LinkedIn** links have \`target="_blank" rel="noopener noreferrer"\` so recruiters don't navigate away from your portfolio.
• Ensure your GitHub profile pinned repositories match **"${p1.title}"** and **"${p2.title}"**.`;
  }

  // 13. ARCHITECTURE, BACKEND, DATABASES & APIS
  if (
    /architecture|backend|api|database|microservice|caching|redis|sql|nosql|websocket|rest|graphql|schema|docker|ci\/cd|pipeline/i.test(
      msg,
    )
  ) {
    return `🏗️ **System Architecture & Backend Blueprint for ${portfolioTitle}**
• **Candidate Target**: \`${targetRole}\` | **Company Aim**: \`${targetCompany}\`
• **Flagship Showcase**: "${p1.title}" *(Tech: ${p1Tags})*
• **Secondary Service**: "${p2.title}" *(Tech: ${p2Tags})*

Technical interviewers evaluate whether you can build scalable, fault-tolerant distributed systems. Here is how to architecturally elevate **${portfolioTitle}**:

---

### 1. ⚡ Add an Architecture Flow Diagram to "${p1.title}"
• Visual representation proves engineering maturity faster than paragraphs of text.
• Create a 3-tier diagram in your project README / modal:
\`\`\`
[Client (React / Vite)] ──(HTTPS/REST)──> [API Gateway / Express 5]
                                                  │
                 ┌────────────────────────────────┴────────────────────────┐
                 ▼                                                         ▼
       [MongoDB Atlas Cluster]                                 [Redis / In-Memory Cache]
       (Connection pooling, indexes)                           (Sub-20ms session & queries)
\`\`\`

---

### 2. 🛡️ Production-Grade Hardening Checklist
• **Database Query Optimization**: Ensure every query filter has an indexed field. Mention compound indexes in your bullet points.
• **Stateless Security**: Highlight your JWT authentication flow, HTTP-only secure cookie flags, and input validation with schemas (Zod/Joi).
• **Asynchronous Resilience**: Discuss how your backend handles rate limiting and external API latency with retries and circuit breakers.

---

### 3. 🚀 High-Impact Architecture Bullet to Feature:
> **"Architected ${p1.title}** on a modular micro-service pattern with \`${p1Tags}\`. Implemented database connection pooling and query indexing, **reducing p99 API latency by 48% (from 680ms to 350ms)** under load."`;
  }

  // 14. DEPLOYMENT, HOSTING, CUSTOM DOMAINS & CLOUD
  if (
    /deploy|hosting|vercel|netlify|domain|dns|ssl|cdn|aws|cloud|serverless|docker|edge/i.test(
      msg,
    )
  ) {
    return `🚀 **Deployment, CDN & Custom Domain Guide for ${portfolioTitle}**
• **Inspected URL**: ${liveUrlText}
• **Active Layout**: \`${templateName}\`

A fast, reliable deployment with a clean URL immediately establishes professional credibility:

---

### 1. 🌐 The Golden Standard: Custom Domain + SSL
• **Custom Domain Impact**: \`yourname.dev\` or \`yourname.portfolioai.live\` looks 10x more polished to hiring managers than a random hash subdomain.
• **Automated SSL**: Ensure HTTPS is enforced with HSTS headers (free via Vercel, Netlify, or Cloudflare DNS).

---

### 2. ⚡ Edge CDN & Asset Optimization
• **Global Edge Delivery**: Host your assets across an Edge CDN network to maintain sub-50ms TTFB (Time to First Byte) worldwide.
• **Lazy Loading**: Ensure screenshots and heavy assets use \`loading="lazy"\` and WebP formats so initial page load stays under 1.2 seconds.
• **CI/CD Automation**: Connect your GitHub repository to trigger automated preview deployments on every pull request.`;
  }

  // 15. COLOR PALETTES, FONTS, TYPOGRAPHY & THEMES
  if (
    /color|palette|font|typography|gradient|theme|dark.*mode|aesthetic|glassmorphism/i.test(
      msg,
    )
  ) {
    return `🎨 **Color Palette, Typography & Visual Polish for ${portfolioTitle}**
• **Current Theme**: \`${templateName}\`
• **Target Role**: \`${targetRole}\`

Recruiters subconsciously equate visual aesthetic polish with code quality. Here is the curated design system recommendation:

---

### 1. 🎨 Curated Developer Color Palette
• **Background**: Deep Zinc \`#09090B\` (soft obsidian, avoids harsh pure black \`#000000\`).
• **Surface Cards**: Glassmorphic zinc with border \`border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl\`.
• **Primary Glow Accent**: Electric Indigo (\`#6366f1\`) to Royal Violet (\`#8b5cf6\`) gradient.
• **Success / Status Accent**: Emerald (\`#10b981\`) for "Live Demo" and "Available for Hire" indicators.

---

### 2. 🔤 Recruiter-Friendly Typography Hierarchy
• **Headings (600/700 wt)**: **Sora** or **Inter** for sharp, contemporary executive clarity.
• **Body Copy (400 wt)**: **Inter** or **Roboto** at 15px / 1.6 line-height for effortless 6-second scanning.
• **Code / Badges (500 wt)**: **JetBrains Mono** or **Fira Code** for tech stack pills (\`${topSkills.split(",").slice(0, 3).join(", ")}\`).`;
  }

  // 16. PERFORMANCE, LIGHTHOUSE & SPEED
  if (
    /performance|lighthouse|speed|fast|latency|bundle|optimize|core.*web.*vital|ttfb/i.test(
      msg,
    )
  ) {
    return `⚡ **100/100 Lighthouse & Speed Optimization Strategy for ${portfolioTitle}**
• **Inspected URL**: ${liveUrlText}

A portfolio that loads in under 1 second sends an immediate signal that you understand web performance engineering:

---

### 1. 🏎️ The Core Web Vitals Blueprint
• **LCP (Largest Contentful Paint) < 1.2s**: Preload critical hero fonts and inline critical above-the-fold CSS.
• **CLS (Cumulative Layout Shift) = 0**: Set explicit width/height dimensions on all project preview images to prevent layout jumps.
• **INP (Interaction to Next Paint) < 100ms**: Keep event handlers lean and debounce any search/filter inputs.

---

### 2. 📦 Bundle Trimming Checklist
• Run \`npm run build\` and check chunk sizes. Use dynamic \`React.lazy()\` for heavy modals and template viewers.
• Convert PNG previews to modern WebP with 80% quality compression (saves 70%+ payload).`;
  }

  // 17. COLD OUTREACH, LINKEDIN & NETWORKING
  if (
    /cold.*email|outreach|message.*recruiter|linkedin.*message|connect.*recruiter|inmail|pitch/i.test(
      msg,
    )
  ) {
    return `📨 **High-Conversion Recruiter Outreach Pitch for ${portfolioTitle}**
• **Your Target Title**: \`${targetRole}\` | **Company Aim**: \`${targetCompany}\`
• **Flagship Project**: "${p1.title}"

Use this exact message template when reaching out to technical recruiters or engineering managers on LinkedIn / Email:

---

### 💬 LinkedIn Connection Note (Under 300 Characters):
> *"Hi [Name]! Noticed you lead engineering hiring at [Company]. I'm a ${targetRole} specializing in \`${topSkills.split(",").slice(0, 3).join(", ")}\`. Recently engineered ${p1.title} (${liveUrlText}). Would love to connect and follow your team's work!"*

---

### 📬 Direct Cold Email Pitch (High Response Rate):
**Subject**: *${targetRole} candidate — ${p1.title} architecture & background*

> *"Hi [First Name],*
>
> *I came across [Company]'s mission around [mention recent company milestone] and wanted to reach out.*
>
> *As a **${targetRole}** focusing on \`${topSkills}\`, I recently architected **${p1.title}** (${liveUrlText}), where I engineered modular REST APIs and optimized query throughput by 42%.*
>
> *Given your team's focus on scalable software, I’d love to share my portfolio and resume with you. Are you open to a brief 10-minute introductory tech chat this week?*
>
> *Best,*  
> *${portfolioTitle}*"`;
  }

  // 18. DYNAMIC SEMANTIC SYNTHESIS FOR ANY PORTFOLIO TOPIC
  return `🎯 **Tailored Advice for ${portfolioTitle}**
• **Topic Inquired**: *"${rawMessage}"*
• **Target Role**: \`${targetRole}\` | **Company Focus**: \`${targetCompany}\`
• **Key Projects**: "${p1.title}"${projects.length > 1 ? `, "${p2.title}"` : ""}
• **Core Tech**: \`${topSkills}\`

Here are the key strategic recommendations directly addressing your question for **${portfolioTitle}**:

---

### 1. 💡 Strategic Approach for ${targetRole}
• Focus on measurable outcomes: Ensure anything you build or describe reflects your capabilities in \`${topSkills}\`.
• Tie this directly to your flagship project **"${p1.title}"** so recruiters see concrete evidence rather than theoretical knowledge.

---

### 2. 🚀 Concrete Action Items to Apply:
• **Feature on Portfolio**: Highlight this topic in your project cards or About section with quantifiable impact (*% speedup, users supported, or problem solved*).
• **Code Verification**: Include direct GitHub links and live demo verification at ${liveUrlText}.
• **STAR Bullet Formulation**: Structure your descriptions with the STAR format (*Situation, Task, Action, Result*).

---

💬 *Feel free to ask me follow-up questions, request exact code snippets, or ask me to draft written copy for your portfolio!*`;
}

// =======================
// Helper: Bespoke GitHub Response Generator (Zero-Repetition Multi-Intent Engine)
// =======================
function generateBespokeGitHubResponse(rawMessage, githubContext) {
  const repoName = githubContext.name || "Repository";
  const fullName = githubContext.fullName || repoName;
  const lang = githubContext.language || "JavaScript";
  const deps = githubContext.dependencies?.length
    ? githubContext.dependencies.slice(0, 6).join(", ")
    : "Modern Web Stack";
  const desc = githubContext.description || "Portfolio project repository";
  const liveDemo = githubContext.homepage || "";
  const msg = (rawMessage || "").toLowerCase();

  // 0. WORKFLOW & ARCHITECTURAL DATA FLOW (with Directional Arrows & In-Flight Payloads)
  if (WORKFLOW_QUERY_REGEX.test(msg)) {
    return generateProjectWorkflowResponse(rawMessage, null, githubContext);
  }

  // 1. README / DOCUMENTATION
  if (/readme|doc|documentation|explain|overview|structure/i.test(msg)) {
    return `📖 **Recruiter-Ready README Blueprint for [${fullName}](${githubContext.htmlUrl})**
• **Language**: \`${lang}\` | **Dependencies**: \`${deps}\`

Top technical recruiters and hiring leads judge your engineering maturity by the structure of your \`README.md\`. Here is the exact structure to make **${repoName}** stand out:

---

### 📋 Recommended README Sections
1. **Header Badges**: Add shield badges for Build Status (\`GitHub Actions: passing\`), License (\`MIT\`), and Live Demo (${liveDemo ? `[Live Demo](${liveDemo})` : "Netlify / Vercel"}).
2. **One-Paragraph Executive Summary**:
   > *"**${repoName}** is a production-grade application engineered with \`${lang}\` and \`${deps}\`. Built to solve [describe primary problem] with sub-100ms response times and modular architecture."*
3. **Architecture & Data Flow Diagram**: A 3-node Mermaid diagram showing how client requests interact with the backend/database.
4. **Key Engineering Features**: Highlight concurrency handling, error boundaries, and state management.
5. **Quickstart / Local Setup**:
   \`\`\`bash
   git clone ${githubContext.htmlUrl}.git
   cd ${repoName}
   npm install
   npm run dev
   \`\`\`
6. **Testing & Test Coverage**: Document how to run unit tests (\`npm test\`).`;
  }

  // 2. PROJECT DESCRIPTION FOR PORTFOLIO / STAR BULLET
  if (/desc|bullet|star|write|portfolio|showcase|how.*describe/i.test(msg)) {
    return `🎯 **Tailored STAR Project Bullet for [${fullName}](${githubContext.htmlUrl})**

When featuring **${repoName}** on your portfolio or resume, avoid generic descriptions like *"Created a repository with ${lang}"*. Use this quantified STAR rewrite:

---

> **"Architected and deployed ${repoName}** utilizing \`${lang}\` and \`${deps}\`. Implemented clean component hierarchies and modular backend routing, **reducing API latency by 38%** and ensuring seamless state synchronisation. Established automated CI/CD testing pipelines with GitHub Actions, achieving **98% test coverage and 99.9% deployment uptime**."

---

💡 **Portfolio Card Checklist for ${repoName}**:
• Ensure your portfolio links directly to this repository: \`${githubContext.htmlUrl}\`.
• Include a live demo link (${liveDemo ? `\`${liveDemo}\`` : "Deploy to Netlify or Vercel"}).
• Tag the primary tools: \`${lang}\`, \`${deps.split(",")[0] || "API"}\`.`;
  }

  // 3. WHAT TO ADD / TECHNICAL ENHANCEMENTS
  if (/what.*add|feature|missing|improve|enhance|next.*step/i.test(msg)) {
    return `⚡ **Technical Enhancements Roadmap for [${fullName}](${githubContext.htmlUrl})**
• **Detected Stack**: \`${lang}\` | \`${deps}\`

To turn **${repoName}** into a flagship repository that impresses senior engineering hiring managers, add these 3 production-grade features:

---

1. **🐳 Dockerization & Container Setup**:
   - Add a multi-stage \`Dockerfile\` and a \`docker-compose.yml\` file.
   - This allows any recruiter or engineer to run \`docker compose up\` and instantly preview your project locally without dependency conflicts.

2. **🧪 Automated CI/CD Pipeline (GitHub Actions)**:
   - Create \`.github/workflows/ci.yml\` to run linter checks (\`ESLint/Prettier\`) and unit tests on every pull request.
   - Add the green "Build: Passing" badge directly at the top of your README.

3. **🛡️ Comprehensive Error Boundaries & Observability**:
   - Implement structured error handling and API logging (e.g. Morgan/Winston or centralized error middleware).
   - Document error recovery strategies in the README.`;
  }

  // 4. DEFAULT GITHUB ROADMAP
  return `🐙 **Repository Optimization Audit: [${fullName}](${githubContext.htmlUrl})**
• **Language**: \`${lang}\`
• **Detected Dependencies**: \`${deps}\`
• **Description**: *"${desc}"*
• **Live Demo**: ${liveDemo ? `[${liveDemo}](${liveDemo})` : "Not detected in repo settings"}

---

### 🚀 3 High-Impact Steps to Maximize Recruiter Appeal for ${repoName}:
1. **Showcase on Portfolio with STAR Metrics**:
   > *"Architected and deployed ${repoName} using \`${lang}\` and \`${deps}\`, lowering endpoint response latency by 35% and maintaining 99.9% uptime."*
2. **README Polish**: Add a system architecture diagram and link the live demo prominently in the repository header.
3. **CI/CD Badge**: Add a GitHub Actions automated test workflow to prove code reliability.

---

💬 *You can also ask me: "How can I improve the README?", "Give me a STAR bullet for this project", or "What features should I add to this repository?"*`;
}

// =======================
// Helper: Fast OpenRouter AI Caller with Strict Low-Latency SLA
// =======================
const OPENROUTER_MODELS = [
  "cohere/north-mini-code:free",
  "openrouter/free",
];

async function callOpenRouterAI(systemPrompt, userPrompt, conversationHistory = [], timeoutMs = 2500) {
  if (!process.env.OPENROUTER_API_KEY) return null;

  for (const model of OPENROUTER_MODELS) {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory.slice(-2),
            { role: "user", content: userPrompt },
          ],
          max_tokens: 650,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: timeoutMs,
        }
      );
      const reply = response.data?.choices?.[0]?.message?.content;
      if (reply && reply.trim().length > 30) {
        return reply.trim();
      }
    } catch (_) {
      // Immediate failover to next candidate model
      continue;
    }
  }
  return null;
}

// =======================
// Helper: Universal Portfolio Advice Generator (Zero-Refusal General Engine)
// =======================
function generateGeneralPortfolioAdvice(rawMessage) {
  const msg = (rawMessage || "").toLowerCase();

  // 00. GREETING & CONVERSATIONAL PLEASANTRIES
  if (GREETING_REGEX.test(msg.trim())) {
    return `👋 **Hello! I'm your PortfolioAI Career Copilot.**

I'm here to help you review, optimize, and elevate your developer portfolio, projects, and ATS score.

🔗 **To get started, please share your portfolio link or GitHub repository URL!** Once you paste it, I will analyze your projects, tech stack, and ATS readiness in real time.

*(Or feel free to ask me any general question about developer resumes, system architecture, or high-impact project ideas.)*`;
  }

  if (GRATITUDE_REGEX.test(msg.trim())) {
    return `🙌 **You're very welcome!**

Let me know if you need any other rewrites, STAR metrics, or architecture breakdowns. Happy building! 🚀`;
  }

  // 0. WORKFLOW & ARCHITECTURAL DATA FLOW (with Directional Arrows & In-Flight Payloads)
  if (WORKFLOW_QUERY_REGEX.test(msg)) {
    return generateProjectWorkflowResponse(rawMessage, null, null);
  }

  // 1. PROJECT SELECTION, IDEAS & COUNT
  if (
    /(?:best|top|good|what|which)?.*project.*(?:idea|build|add|showcase|include|make|create|stand.*out)|how\s*many.*project|number\s*of\s*projects/i.test(
      msg,
    )
  ) {
    return `🚀 **High-Impact Portfolio Projects Blueprint (2026 Edition)**

When top tech recruiters and engineering managers evaluate developer portfolios, **2 to 3 production-grade, end-to-end applications always beat 10 basic tutorial clones**. 

Here is the exact 3-project portfolio composition that gets software engineers hired:

---

### 1. 🏆 Project #1: The Flagship Full-Stack Platform
• **The Concept**: A multi-user SaaS, collaborative workspace, or marketplace solving a real problem.
• **What to Implement**:
  - Secure authentication & session lifecycle (JWT + refresh tokens, OAuth2, RBAC).
  - Real-time updates (WebSockets or Server-Sent Events) for chat, notifications, or live dashboards.
  - Complex database modeling with relational relations or indexed document aggregates.
• **Recruiter Signal**: Proves you understand full request-response lifecycles, security, and state persistence.

---

### 2. ⚡ Project #2: The Distributed Architecture or Backend Tool
• **The Concept**: High-throughput API gateway, data ingestion pipeline, rate-limited microservice, or CLI developer tool.
• **What to Implement**:
  - Redis caching layer (decreasing round-trip latency by 60%+).
  - Background asynchronous task processing (BullMQ / RabbitMQ / Celery).
  - Containerization with Docker and automated testing suite (Jest/Pytest).
• **Recruiter Signal**: Proves you understand system design, scalability trade-offs, and backend resiliency.

---

### 3. 🎨 Project #3: High-Fidelity UI or Open-Source Utility
• **The Concept**: An interactive canvas, data visualization studio, or published open-source package.
• **What to Implement**:
  - Fluid micro-interactions (Framer Motion / Tailwind), keyboard accessibility (WCAG AA).
  - Optimized bundle size, zero layout shift (CLS = 0), and 95+ Lighthouse score.
• **Recruiter Signal**: Proves modern frontend craftsmanship and obsessive attention to user experience.

---

💡 *Pro-Tip: Have a project or portfolio already deployed? Paste your live website link or GitHub repo URL anytime and I'll audit your exact implementation!*`;
  }

  // 2. TECH STACKS & SKILLS TO HIGHLIGHT
  if (
    /(?:tech\s*stack|which\s*stack|what\s*stack|learn|skills?|framework|react.*vue|nextjs|typescript|mern|language|demand|tools)/i.test(
      msg,
    )
  ) {
    return `💻 **Top Hiring Tech Stacks & Skill Presentation Strategy**

In today's engineering job market, recruiters screen portfolios for **modern enterprise technologies** rather than outdated or toy stacks.

---

### 1. 🥇 Highest-Demand Full-Stack Stack (2026)
• **Frontend**: \`TypeScript\`, \`React 19\` / \`Next.js 15\`, \`TailwindCSS\`, \`TanStack Query / Zustand\`.
• **Backend**: \`Node.js / Express\` or \`Python (FastAPI)\` or \`Go (Golang)\`.
• **Databases**: \`PostgreSQL\` (Prisma / Drizzle ORM) + \`MongoDB\` for document data + \`Redis\` for caching.
• **DevOps & Cloud**: \`Docker\`, \`GitHub Actions (CI/CD)\`, \`Vercel / AWS ECS\`.

---

### 2. 🎯 How to Display Skills on Your Portfolio (Avoid Badge Dumps!)
Recruiters ignore portfolios that display 40 unstructured logo badges. Instead, group your skills into 4 distinct functional tiers:
1. **Core Languages**: *TypeScript, JavaScript (ES6+), Python, Go, SQL*
2. **Frameworks & State**: *React, Next.js, Node.js, Express, TailwindCSS, Zustand*
3. **Databases & Caching**: *PostgreSQL, MongoDB, Redis, Prisma*
4. **DevOps & Architecture**: *Docker, Git, REST & GraphQL APIs, CI/CD, Microservices*

---

💡 *Pro-Tip: Paste your portfolio link or GitHub profile link and I'll evaluate whether your tech stack aligns with your target job role!*`;
  }

  // 3. ATS SCORING, AUDIT & RECRUITER PSYCHOLOGY
  if (
    /(?:ats|score|low|recruiter.*(?:friendly|look|scan|see)|impress.*recruiter|pass.*screen|hire|audit)/i.test(
      msg,
    )
  ) {
    return `🎯 **The 7-Pillar Recruiter & ATS Portfolio Checklist**

Recruiters spend an average of **6 to 10 seconds** reviewing a candidate's portfolio before deciding whether to schedule an interview or pass. Here is how to guarantee your portfolio passes:

---

### 1. 📌 Above-The-Fold Clarity (First 3 Seconds)
• **Target Title**: Explicitly state your role (\`Full Stack Engineer\`, \`Backend Developer\`, \`Frontend Specialist\`) — don't use vague terms like "Tech Enthusiast" or "Aspiring Coder".
• **1-Sentence Pitch**: State what you build and the measurable business value you deliver.
• **Quick Actions**: Prominent buttons for **"View Projects"**, **"Download Resume (PDF)"**, and **"GitHub Profile"**.

---

### 2. 🔗 Proof of Work Verification
• Every single project card MUST feature two direct links:
  - 🌐 **Live Interactive Demo**: Deployed with working test credentials or instant guest login.
  - 🐙 **Clean GitHub Repository**: With an organized README, architecture diagrams, and clean commit history.

---

### 3. 📈 Quantified STAR Metrics
• Replace generic descriptions with the STAR formula:
  - ❌ *"Created an e-commerce backend with MongoDB."*
  - ✅ *"Engineered an ACID-compliant checkout pipeline handling 1,200 requests/sec, cutting checkout drop-off by 28%."*

---

💡 *Pro-Tip: Paste your live portfolio link or Netlify/Vercel URL right here to get an instant 7-pillar ATS score!*`;
  }

  // 4. PROJECT DESCRIPTIONS & STAR BULLETS
  if (
    /(?:rewrite|description|desc|bullet|star|quantif|impact|write.*project)/i.test(
      msg,
    )
  ) {
    return `✍️ **The STAR Formula for Portfolio Project Descriptions**

To sound like a senior software engineer, structure every project description around **Situation, Task, Action, and Result (STAR)**:

---

### 📐 The Winning Anatomy:
1. **The Hook (1 line)**: What problem does this application solve, and for whom?
2. **The Engineering Action (1–2 lines)**: What architectural or technical decisions did you make?
3. **The Quantified Result (1 bullet)**: What was the measurable impact (% speedup, latency drop, users supported)?

---

### 📋 Copy-Paste Templates for Your Projects:

**Frontend / Full Stack Example:**
> *"Architected a responsive real-time analytics dashboard using **React 19, TypeScript, and TailwindCSS**. Integrated WebSocket streams for live data feeds, optimized DOM re-renders via memoization to maintain **60 FPS**, and reduced initial bundle load time by **42%**."*

**Backend / Distributed Systems Example:**
> *"Engineered a modular RESTful microservice API in **Node.js, Express, and PostgreSQL**, implementing Redis caching and rate limiting. Decreased database query latency from **420ms to 65ms** under simulated 10,000 req/min loads."*

---

💡 *Pro-Tip: Tell me the name and tech stack of one of your projects, or paste your portfolio link, and I will write customized STAR bullet points for it!*`;
  }

  // 5. ABOUT SECTION & HERO ELEVATOR PITCH
  if (
    /(?:about|bio|hero|intro|headline|summary|pitch|tagline|who\s*am\s*i)/i.test(
      msg,
    )
  ) {
    return `✨ **Senior Developer "About Me" & Hero Section Framework**

Recruiters skip long autobiographies. The highest-converting About sections are concise, engineering-focused, and under **150 words**.

---

### 🎯 The 3-Part High-Conversion Structure:
1. **Who You Are & Core Stack**: 1 sentence defining your technical specialization and primary languages.
2. **What Engineering Problems You Thrive On**: Distributed systems, fluid UI/UX, database optimization, or developer tooling.
3. **Current Focus & Call to Action**: What you're currently building or learning, paired with a welcoming invitation to connect.

---

### 📋 Adaptable Senior Developer Template:
> *"I'm a **Full Stack Software Engineer** specializing in building resilient, performant web applications with **TypeScript, React, Node.js, and PostgreSQL**.*
>
> *I focus on the intersection of clean system architecture and intuitive user interfaces — from crafting 60 FPS client experiences to engineering low-latency REST & GraphQL microservices.*
>
> *Currently exploring distributed caching and AI API integrations. Always excited to collaborate on ambitious engineering challenges — let's build something exceptional together."*

---

💡 *Pro-Tip: Paste your portfolio link, and I will rewrite your About section tailored to your exact projects and target role!*`;
  }

  // 6. ARCHITECTURE, SYSTEM DESIGN & BACKEND
  if (
    /(?:architecture|system.*design|microservice|database|schema|api.*design|rest|graphql|scale|docker|kubernetes)/i.test(
      msg,
    )
  ) {
    return `🏗️ **How to Showcase System Design on Your Portfolio**

To land mid-level and senior roles, showing that you can write code isn't enough — you must prove you can **architect scalable systems**.

---

### 1. 📊 Embed Interactive Architecture Diagrams
• Add a visual flow diagram to your project case studies (using Mermaid.js, SVG, or Excalidraw).
• Show how a client request flows through:
  \`Browser Client\` ➔ \`Reverse Proxy / Rate Limiter\` ➔ \`API Service\` ➔ \`Redis Cache\` ➔ \`Database (Replica / Primary)\`.

---

### 2. 🛡️ Highlight Key Production Decisions:
• **Database Strategy**: Explain why you chose SQL vs NoSQL for the domain model.
• **Concurrency & Caching**: Show how Redis TTLs or queue workers (BullMQ) prevent server bottlenecks.
• **Security & Auth**: Detail CSRF protection, salted Argon2/Bcrypt password hashing, and HttpOnly cookies.

---

💡 *Pro-Tip: Share your GitHub repository link and I'll analyze its code structure and provide an architecture summary!*`;
  }

  // 7. DEPLOYMENT, HOSTING & DOMAIN
  if (
    /(?:deploy|host|domain|vercel|netlify|render|railway|aws|cloud|custom.*domain)/i.test(
      msg,
    )
  ) {
    return `🌐 **Modern Portfolio Deployment & Hosting Guide**

A portfolio hosted with a professional domain and instant global CDN loading signals immediate competence.

---

### 1. 🚀 Best Free & Cost-Effective Hosting:
• **Frontend**: **Vercel** or **Netlify** — automatic GitHub branch deploys, global edge CDN, and instant preview URLs.
• **Backend**: **Render**, **Railway**, or **Fly.io** — simple Dockerfile deploys with auto-sleep/wake and managed Postgres/Redis.
• **Database**: **Supabase** (Postgres), **Neon** (Serverless Postgres), or **MongoDB Atlas**.

---

### 2. 🏷️ Why You Must Use a Custom Domain:
• A custom domain (\`yourname.dev\`, \`yourname.io\`, or \`yourname.com\`) increases recruiter response rates by **over 30%** compared to a raw \`.vercel.app\` URL.
• You can purchase \`.dev\` domains from Porkbun or Cloudflare Registrar for ~$12/year.

---

💡 *Pro-Tip: Paste your deployed portfolio link right here to test its live SSL and response headers!*`;
  }

  // 8. PERFORMANCE, SPEED & LIGHTHOUSE
  if (
    /(?:performance|speed|fast|lighthouse|slow|optimize|bundle|core.*web.*vitals|lazy)/i.test(
      msg,
    )
  ) {
    return `⚡ **100/100 Lighthouse & Speed Optimization Strategy**

A developer portfolio that takes 4+ seconds to load hurts your credibility before the recruiter reads a single project.

---

### 🏎️ The 4 Steps to Instant Load Times:
1. **Image Optimization**: Convert PNG/JPG screenshots to **WebP or AVIF** at 80% quality. Always specify explicit \`width\` and \`height\` attributes to achieve **0 Cumulative Layout Shift (CLS)**.
2. **Code Splitting**: Wrap heavy secondary views, templates, and modals with \`React.lazy()\` and \`<Suspense>\`.
3. **Font Preloading**: Preload your primary headline font in \`index.html\` to eliminate FOIT (Flash of Invisible Text).
4. **Bundle Analysis**: Run \`npx vite-bundle-visualizer\` or \`source-map-explorer\` to eliminate accidental duplicated packages (like full \`lodash\` imports).

---

💡 *Pro-Tip: Share your live portfolio URL and I'll inspect its network payload and suggest exact code tweaks!*`;
  }

  // 9. UI/UX, DESIGN & MODERN AESTHETICS
  if (
    /(?:design|theme|ui|ux|color|dark.*mode|minimal|cyberpunk|font|typography|layout|modern|look)/i.test(
      msg,
    )
  ) {
    return `🎨 **Developer Portfolio Design Principles: From Mediocre to World-Class**

You don't need to be a designer to build a stunning portfolio. Follow these battle-tested UI rules:

---

### 1. 🌌 The 60-30-10 Color Rule
• **60% Dominant Base**: Deep neutral dark mode (\`#09090b\` / \`#18181b\`) or clean crisp light mode (\`#fafafa\`).
• **30% Structural Neutral**: Cards, borders, and sidebar panels (\`#27272a\` with 1px border opacity).
• **10% Vibrant Accent**: Single signature accent (Electric Indigo \`#6366f1\`, Neon Cyan \`#06b6d4\`, or Emerald \`#10b981\`).

---

### 2. 🔠 Typography Hierarchy:
• Use high-craft font pairings: **Outfit / Inter** for headlines and clean body text, paired with **JetBrains Mono / Fira Code** for tech badges.
• Keep text contrast high (WCAG AA compliance).

---

### 3. ✨ Micro-Interactions:
• Subtle card elevation on hover (\`hover:-translate-y-1 hover:border-zinc-600\`).
• Smooth transitions (\`transition-all duration-200\`).

---

💡 *Pro-Tip: Connect your portfolio link above and I'll evaluate its visual hierarchy, color palette, and responsiveness!*`;
  }

  // 10. INTERVIEW QUESTIONS & TECHNICAL DEFENSE
  if (
    /(?:interview|questions?.*(?:ask|prepare)|defense|technical.*interview|behavioral)/i.test(
      msg,
    )
  ) {
    return `🎯 **Top 5 Technical Questions Recruiters & Interviewers Ask From Portfolios**

When hiring managers look at your portfolio projects, they use them as the primary source for their technical deep-dive questions:

---

### 1. 🔍 "Walk me through the lifecycle of a request in your primary project."
• **What they evaluate**: Full-stack comprehension. Do you understand browser caching, auth token verification, database queries, and response serialization?

---

### 2. ⚖️ "Why did you choose this tech stack instead of alternatives?"
• **What they evaluate**: Architectural intentionality. Never say *"I followed a YouTube tutorial"*. State: *"I chose Next.js for server-side rendering benefits on our public catalog while leveraging Prisma for type-safe database migrations."*

---

### 3. 🐛 "What was the most challenging bug or race condition you encountered?"
• **What they evaluate**: Debugging rigor. Have a concrete story: identify the symptom, the root cause in logs/DevTools, and the permanent fix.

---

### 4. 📈 "If 10,000 users accessed this application concurrently, what would fail first?"
• **What they evaluate**: Scalability awareness. Mention database connection pool saturation, unindexed query latency, or third-party API rate limits.

---

💡 *Pro-Tip: Share your portfolio link and I will generate customized interview defense questions for your exact projects!*`;
  }

  // 11. COLD OUTREACH, LINKEDIN & NETWORKING
  if (
    /(?:cold.*email|outreach|message.*recruiter|linkedin|pitch|connect|share.*portfolio)/i.test(
      msg,
    )
  ) {
    return `📨 **High-Conversion Recruiter Outreach Templates**

A strong portfolio is only effective if the right hiring managers see it. Use these high-response outreach scripts:

---

### 💬 LinkedIn Connection Note (<300 chars):
> *"Hi [First Name]! Noticed you lead tech hiring for engineering at [Company]. I'm a Full Stack Engineer specializing in TypeScript, React, and Node.js. Recently deployed [Project Name] ([Live Link]). Would love to connect and follow your team's engineering journey!"*

---

### 📬 Direct Cold Email Template:
**Subject**: *Full Stack Developer candidate — [Project Name] architecture & background*

> *"Hi [First Name],*
>
> *I came across [Company]'s recent work on [mention feature/engineering post] and wanted to connect.*
>
> *As a Full Stack Engineer focusing on performant web architecture, I recently engineered **[Project Name]** ([Live Demo Link]), where I built real-time WebSocket feeds and lowered query latency by 45%.*
>
> *Given your team's focus on scalable software, I'd welcome the chance to share my portfolio and resume. Are you open to a brief 10-minute introductory tech chat this week?*
>
> *Best,*  
> *[Your Name] | [Portfolio Link]"*

---

💡 *Pro-Tip: Paste your portfolio link, and I will draft a personalized outreach pitch featuring your actual projects!*`;
  }

  // 12. UNIVERSAL GENERAL PORTFOLIO SYNTHESIS
  return `💡 **Portfolio Strategy & Engineering Guidance**
• **Topic Inquired**: *"${rawMessage}"*

Here are the key best practices and strategic recommendations for your developer portfolio:

---

### 1. 🎯 Focus on Measurable Engineering Evidence
• Every project and section on your portfolio should answer one central question for recruiters: **"Can this candidate write production-quality code that creates business value?"**
• Back up your claims with quantifiable metrics: response times, uptime, user counts, or test coverage.

---

### 2. 🚀 Key Action Steps:
1. **Curate 2–4 Strong Projects**: Deep, multi-tier applications with clean git histories and live demo URLs.
2. **Prioritize Performance & Usability**: Clean mobile responsiveness, fast sub-second load times, and intuitive navigation.
3. **Make Contact Frictionless**: Prominent resume PDF download, email, LinkedIn, and GitHub links visible on every page.

---

💡 *Pro-Tip: You can also paste your live portfolio link or GitHub repository URL anytime, and I will perform an instant, in-depth code and design audit!*`;
}

// =======================
// AI Chat Assistant for Portfolio
// =======================
export const chatWithPortfolioAI = async (req, res) => {
  try {
    const {
      message,
      portfolioData,
      portfolioId,
      url,
      githubUrl,
      conversationHistory = [],
    } = req.body;

    if (!message && !url && !githubUrl && !portfolioId) {
      return res.status(400).json({
        success: false,
        message: "Message or URL is required",
      });
    }

    const rawMessage = message || "";
    const rawUrl = url || "";
    const fullText = `${rawUrl} ${rawMessage}`.trim();

    let targetPortfolio = portfolioData || null;
    let githubContext = null;

    // Detect any URL inside the query
    const urlMatch = fullText.match(/https?:\/\/[^\s]+/i);
    const detectedUrl = urlMatch ? urlMatch[0].replace(/[)>,;.]+$/, "") : "";

    // 1. Check for GitHub URL or previously connected GitHub repo
    const ghMatch =
      (githubUrl || "").match(/https?:\/\/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)/i) ||
      (targetPortfolio?.htmlUrl || "").match(/https?:\/\/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)/i) ||
      fullText.match(/https?:\/\/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)/i);

    if (ghMatch) {
      const owner = ghMatch[1];
      const repo = ghMatch[2].replace(/\.git$/, "");
      try {
        const ghRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
          headers: { "User-Agent": "PortfolioAI-Copilot" },
          timeout: 3500,
        });

        // Also inspect package.json to get actual dependencies
        let detectedDeps = [];
        try {
          const pkgRes = await axios.get(
            `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/package.json`,
            { timeout: 2000 },
          );
          if (pkgRes.data?.dependencies) {
            detectedDeps = Object.keys(pkgRes.data.dependencies).slice(0, 10);
          }
        } catch (_) {}

        if (ghRes.data) {
          githubContext = {
            fullName: ghRes.data.full_name,
            name: ghRes.data.name,
            owner,
            repo,
            description: ghRes.data.description || "Portfolio project repository",
            language: ghRes.data.language || "JavaScript / Web",
            dependencies: detectedDeps,
            stars: ghRes.data.stargazers_count,
            forks: ghRes.data.forks_count,
            topics: ghRes.data.topics || [],
            htmlUrl: ghRes.data.html_url,
            homepage: ghRes.data.homepage || "",
            defaultBranch: ghRes.data.default_branch || "main",
          };
        }
      } catch (err) {
        console.warn("[chatWithPortfolioAI] GitHub API fetch error:", err.message);
        githubContext = {
          fullName: `${owner}/${repo}`,
          name: repo,
          owner,
          repo,
          description: "GitHub repository connected",
          language: "Full Stack Web",
          dependencies: [],
          stars: 0,
          forks: 0,
          topics: [],
          htmlUrl: `https://github.com/${owner}/${repo}`,
        };
      }
    } else if (targetPortfolio?.owner && targetPortfolio?.repo && targetPortfolio?.htmlUrl) {
      githubContext = targetPortfolio;
    }

    // 2. Check for local or deployed portfolio link in database or live scrape
    if (!githubContext) {
      // Check for MongoDB ObjectId in URL, payload, or targetPortfolio._id
      const idMatch =
        (portfolioId || "").match(/^([a-f0-9]{24})$/i) ||
        (targetPortfolio?._id ? [null, targetPortfolio._id.toString()] : null) ||
        fullText.match(/(?:portfolio|p)\/([a-f0-9]{24})/i) ||
        fullText.match(/\b([a-f0-9]{24})\b/i);

      if (idMatch && (!targetPortfolio || !targetPortfolio.projects || targetPortfolio.projects.length === 0)) {
        try {
          const dbP = await Portfolio.findById(idMatch[1]).populate(
            "user",
            "fullName avatar",
          );
          if (dbP) {
            targetPortfolio = dbP.toObject();
          }
        } catch (err) {
          console.warn("[chatWithPortfolioAI] MongoDB lookup by id failed:", err.message);
        }
      }

      // Check for Netlify, Vercel, or custom deployed domain in database
      const deployedMatch = fullText.match(
        /https?:\/\/([a-zA-Z0-9-]+)\.(?:netlify\.app|vercel\.app)/i,
      );
      if (deployedMatch && (!targetPortfolio || !targetPortfolio.projects || targetPortfolio.projects.length === 0)) {
        const subdomain = deployedMatch[1];
        try {
          const dbP = await Portfolio.findOne({
            deployedUrl: { $regex: subdomain, $options: "i" },
          }).populate("user", "fullName avatar");
          if (dbP) {
            targetPortfolio = dbP.toObject();
          }
        } catch (err) {
          console.warn("[chatWithPortfolioAI] MongoDB lookup by deployedUrl failed:", err.message);
        }
      }

      // If a live URL was provided but not found in MongoDB, scrape the live site directly (with SSRF protection)
      if (!targetPortfolio && detectedUrl && !detectedUrl.includes("github.com") && isSafeUrlForScrape(detectedUrl)) {
        try {
          const liveRes = await safeAxiosGet(detectedUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 PortfolioAI/2.0",
            },
            timeout: 4500,
            maxContentLength: 5 * 1024 * 1024,
            maxBodyLength: 5 * 1024 * 1024,
          });
          const html = typeof liveRes.data === "string" ? liveRes.data : "";
          if (html) {
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            const pageTitle = titleMatch ? titleMatch[1].trim() : "Developer Portfolio";
            const metaDesc =
              (html.match(
                /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i,
              ) || [])[1] || "";
            const h1s = [...html.matchAll(/<h1[^>]*>([^<]+)<\/h1>/gi)]
              .map((m) => m[1].replace(/<[^>]+>/g, "").trim())
              .filter(Boolean);
            const h2s = [...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/gi)]
              .map((m) => m[1].replace(/<[^>]+>/g, "").trim())
              .filter(Boolean)
              .slice(0, 6);

            targetPortfolio = {
              title: pageTitle,
              name: pageTitle.split(/[-|–:]/)[0]?.trim() || "Developer",
              deployedUrl: detectedUrl,
              about: metaDesc || h1s[0] || "Live developer portfolio",
              targetRole: h1s[0] || "Full Stack Engineer",
              skills: [],
              projects: h2s.map((h) => ({
                title: h,
                description: `Featured project detected on live site (${detectedUrl})`,
                tags: ["Web", "Full Stack"],
              })),
              isScraped: true,
            };
          }
        } catch (scrapeErr) {
          console.warn("[chatWithPortfolioAI] Live scrape error:", scrapeErr.message);
        }
      }

      // If URL was provided but scraping didn't produce full portfolio
      if (!targetPortfolio && detectedUrl && !detectedUrl.includes("github.com")) {
        const parsedDomain = detectedUrl
          .replace(/^https?:\/\//i, "")
          .split(/[./]/)[0]
          .replace(/[-_]/g, " ");
        const cleanName =
          parsedDomain.length > 2
            ? parsedDomain.charAt(0).toUpperCase() + parsedDomain.slice(1)
            : "Developer";

        targetPortfolio = {
          title: `${cleanName}'s Portfolio`,
          name: cleanName,
          deployedUrl: detectedUrl,
          targetRole: "Full Stack Engineer",
          targetCompany: "Leading Tech Companies",
          template: "modern",
          skills: ["JavaScript", "React", "Node.js", "Express", "TailwindCSS"],
          projects: [
            {
              title: `${cleanName} Flagship System`,
              description: `Deployed application hosted at ${detectedUrl}`,
              tags: ["React", "Node.js", "Full Stack"],
            },
            {
              title: "Cloud Data Platform",
              description: "API microservice architecture and data caching pipeline",
              tags: ["Express", "MongoDB", "REST API"],
            },
          ],
        };
      }
    }

    // ========================================================
    // Case 1: GitHub Repository Context Attached
    // ========================================================
    if (githubContext) {
      const depsText = githubContext.dependencies?.length
        ? githubContext.dependencies.join(", ")
        : "React, Node.js, Modern Web";

      const ghPrompt = `You are PortfolioAI Copilot — expert tech recruiter and portfolio optimization strategist.
The user wants concrete, portfolio-specific advice for this EXACT GitHub repository:
Repository: ${githubContext.fullName}
URL: ${githubContext.htmlUrl}
Primary Language: ${githubContext.language}
Detected Tech/Dependencies: ${depsText}
Description: ${githubContext.description}
Stars: ${githubContext.stars} | Topics: ${(githubContext.topics || []).join(", ") || "None"}
Live Demo: ${githubContext.homepage || "None"}

User Message: "${rawMessage}"

CRITICAL INSTRUCTIONS:
- Directly and thoroughly answer the user's specific question: "${rawMessage}".
- Give advice SPECIFIC to this repository (${githubContext.name}) and its technologies (${githubContext.language}, ${depsText}).
- If the user asks for workflow, architecture flow, or data flow:
  1. Provide a visual Mermaid diagram (\`\`\`mermaid ... \`\`\`) using graph TD with explicit directional arrows (-->) and EVERY arrow MUST be labeled with in-flight data (-->|"1. HTTPS POST... Payload: {...}"|). Structure the diagram as a clean vertical pipeline (4–7 tiers); avoid fanning out into 8+ horizontal columns so text stays large, bold, and readable. If adding custom node styles or fills, ensure high contrast: use dark backgrounds (#18181b, #1e1b4b, #0f172a) with crisp borders, or if using light/pastel fills, ALWAYS explicitly set color:#09090b so text is never white on light boxes.
  2. Provide a clean, structured Multi-Tier Architecture Pipeline showing system tiers, microservices, protocols, and payloads (formatted cleanly with tier blocks e.g. [Tier 1: User Interaction Layer], [Tier 2: API Gateway Layer], [Tier 3: Backend Microservices Layer] with directional arrows ➔ / ▼). Avoid drawing brittle multi-column Unicode box characters (like ┌, ┐, └, ┘, │) that misalign across fonts.
  3. Provide a complete Data Flow Specification Table with columns: | Step # | Source ➔ Target | Direction & Protocol | Exact In-Flight Data / Payload Schema | Applied Transformation & Security |.
- If including architectural trade-offs or metrics in tables, format them using standard GitHub Flavored Markdown tables with clear column headers.
- DO NOT give generic advice. Provide exact rewritten code snippets or quantified bullet points ($ saved, % speedup, users handled).`;

      const aiReply = await callOpenRouterAI(
        "You are PortfolioAI Copilot. You analyze repositories and provide hyper-specific portfolio recommendations with zero generic fluff.",
        ghPrompt,
        conversationHistory,
        2500
      );

      let reply = aiReply;
      if (WORKFLOW_QUERY_REGEX.test(rawMessage)) {
        if (!reply || !reply.includes("-->") || !reply.includes("| Step #")) {
          reply = generateProjectWorkflowResponse(rawMessage, null, githubContext);
        }
      } else if (!reply) {
        reply = generateBespokeGitHubResponse(rawMessage, githubContext);
      }

      return res.status(200).json({
        success: true,
        reply,
        githubRepo: githubContext,
      });
    }

    // ========================================================
    // Case 2: Specific Portfolio Context Attached
    // ========================================================
    if (targetPortfolio) {
      const userGreetingName =
        req.body.userName ||
        req.user?.fullName ||
        targetPortfolio.fullName ||
        targetPortfolio.name ||
        "Developer";
      const portfolioTitle =
        targetPortfolio.title || `${userGreetingName}'s Portfolio`;
      const targetRole = targetPortfolio.targetRole || "Software Engineer";
      const targetCompany = targetPortfolio.targetCompany || "Leading Tech Companies";
      const skillsList = (targetPortfolio.skills || []).slice(0, 15).join(", ");
      const projectsList = (targetPortfolio.projects || [])
        .map(
          (p, idx) =>
            `${idx + 1}. **${p.title || "Project"}**: ${p.description || "Application"} (Tech: ${(p.tags || []).join(", ") || "Web"})`,
        )
        .join("\n");

      const portfolioContext = `Portfolio Under Review:
User/Candidate Name: ${userGreetingName}
Title: ${portfolioTitle}
Template: ${targetPortfolio.template || "modern"}
Target Role: ${targetRole}
Target Company: ${targetCompany}
Live Link: ${targetPortfolio.deployedUrl || "Local Preview"}
Skills (${(targetPortfolio.skills || []).length}): ${skillsList || "Full Stack Web"}
Projects (${(targetPortfolio.projects || []).length}):
${projectsList || "No projects listed yet."}
About / Bio: ${(targetPortfolio.about || "").slice(0, 350)}`;

      const prompt = `You are the PortfolioAI Copilot — an expert career coach, FAANG tech recruiter, and portfolio optimization consultant.
The user (${userGreetingName}) provided their specific portfolio link:

${portfolioContext}

User Message: "${rawMessage}"

CRITICAL INSTRUCTIONS:
- You MUST directly and thoroughly answer the user's specific question: "${rawMessage}".
- Address the user as "${userGreetingName}" when greeting them.
- Give advice 100% SPECIFIC to this portfolio (${portfolioTitle}).
- Reference their ACTUAL project names (${(targetPortfolio.projects || []).map((p) => `"${p.title}"`).filter(Boolean).slice(0, 3).join(", ") || "their projects"}) and their ACTUAL skills (${skillsList || "their skills"}).
- If the user asks for workflow, architecture flow, or data flow:
  1. Provide a visual Mermaid diagram (\`\`\`mermaid ... \`\`\`) using graph TD with explicit directional arrows (-->) and EVERY arrow MUST be labeled with in-flight data (-->|"1. HTTPS POST... Payload: {...}"|). Structure the diagram as a clean vertical pipeline (4–7 tiers); avoid fanning out into 8+ horizontal columns so text stays large, bold, and readable. If adding custom node styles or fills, ensure high contrast: use dark backgrounds (#18181b, #1e1b4b, #0f172a) with crisp borders, or if using light/pastel fills, ALWAYS explicitly set color:#09090b so text is never white on light boxes.
  2. Provide a clean, structured Multi-Tier Architecture Pipeline showing system tiers, microservices, protocols, and payloads (formatted cleanly with tier blocks e.g. [Tier 1: User Interaction Layer], [Tier 2: API Gateway Layer], [Tier 3: Backend Microservices Layer] with directional arrows ➔ / ▼). Avoid drawing brittle multi-column Unicode box characters (like ┌, ┐, └, ┘, │) that misalign across fonts.
  3. Provide a complete Data Flow Specification Table with columns: | Step # | Source ➔ Target | Direction & Protocol | Exact In-Flight Data / Payload Schema | Applied Transformation & Security |.
- If including architectural decisions, comparisons, or metric summaries in tables, format them using standard GitHub Flavored Markdown tables with clear column headers (e.g. | Component | Technology | Purpose | Impact |).
- DO NOT provide generic tips. Give exact rewritten sentences, quantified metrics ($ saved, % speedup, users handled), and actionable tweaks tailored to ${portfolioTitle}.`;

      // High-frequency instant intent matcher (<20ms response time for common portfolio audits)
      const isPresetIntent =
        GREETING_REGEX.test(rawMessage.trim()) ||
        GRATITUDE_REGEX.test(rawMessage.trim()) ||
        WORKFLOW_QUERY_REGEX.test(rawMessage) ||
        /(?:score|audit|rating|why.*score|improve.*portfolio|how.*improve|recruiter.*friendly|what.*project.*(?:add|build)|rewrite.*about|skills?.*highlight|interview.*(?:ask|question)|resume.*(?:review|audit))/i.test(
          rawMessage
        );

      let reply = null;
      if (isPresetIntent) {
        if (WORKFLOW_QUERY_REGEX.test(rawMessage)) {
          reply = generateProjectWorkflowResponse(rawMessage, targetPortfolio, null);
        } else {
          reply = generateBespokePortfolioResponse(rawMessage, targetPortfolio);
        }
      } else {
        const aiReply = await callOpenRouterAI(
          "You are PortfolioAI Copilot. You always provide highly personalized, portfolio-specific advice citing their actual projects and target role with zero generic placeholders.",
          prompt,
          conversationHistory,
          2000
        );
        reply = aiReply || generateBespokePortfolioResponse(rawMessage, targetPortfolio);
      }

      return res.status(200).json({
        success: true,
        reply,
        targetPortfolio: {
          _id: targetPortfolio._id,
          title: portfolioTitle,
          name: targetPortfolio.name || portfolioTitle,
          targetRole,
          targetCompany,
          template: targetPortfolio.template,
          deployedUrl: targetPortfolio.deployedUrl,
          skills: targetPortfolio.skills || [],
          projects: (targetPortfolio.projects || []).map((p) => ({
            title: p.title || "Project",
            description: p.description || "",
            tags: p.tags || [],
            liveUrl: p.liveUrl || "",
            githubUrl: p.githubUrl || "",
          })),
          about: targetPortfolio.about || "",
        },
      });
    }

    // ========================================================
    // Case 3: Universal Portfolio Career Question (No Link Attached)
    // The chatbot answers ANY question related to portfolios, projects, tech stacks, ATS, etc.!
    // ========================================================
    const generalPrompt = `You are PortfolioAI Copilot — an elite senior software engineer, FAANG tech recruiter, and portfolio career advisor.
User Question: "${rawMessage}"

CRITICAL INSTRUCTIONS:
- Directly, authoritatively, and thoroughly answer the user's question regarding developer portfolios, engineering projects, tech stacks, ATS scoring, or career optimization.
- If the user asks for workflow, architecture flow, or data flow of any project:
  1. Provide a visual Mermaid diagram (\`\`\`mermaid ... \`\`\`) using graph TD with explicit directional arrows (-->) and EVERY arrow MUST be labeled with in-flight data (-->|"1. HTTPS POST... Payload: {...}"|). Structure the diagram as a clean vertical pipeline (4–7 tiers); avoid fanning out into 8+ horizontal columns so text stays large, bold, and readable. If adding custom node styles or fills, ensure high contrast: use dark backgrounds (#18181b, #1e1b4b, #0f172a) with crisp borders, or if using light/pastel fills, ALWAYS explicitly set color:#09090b so text is never white on light boxes.
  2. Provide a clean, structured Multi-Tier Architecture Pipeline showing system tiers, microservices, protocols, and payloads (formatted cleanly with tier blocks e.g. [Tier 1: User Interaction Layer], [Tier 2: API Gateway Layer], [Tier 3: Backend Microservices Layer] with directional arrows ➔ / ▼). Avoid drawing brittle multi-column Unicode box characters (like ┌, ┐, └, ┘, │) that misalign across fonts.
  3. Provide a complete Data Flow Specification Table with columns: | Step # | Source ➔ Target | Direction & Protocol | Exact In-Flight Data / Payload Schema | Applied Transformation & Security |.
- Give concrete, actionable advice with specific examples (framework names, code patterns, STAR-format bullet examples, or metrics).
- Structure your response cleanly with clear headings, bullet points, and highlighted takeaways.
- If using tables to summarize architectural trade-offs, metrics, or comparisons, use clean standard GitHub-Flavored Markdown tables (with header row, separator row |---|---|, and data rows). Keep columns concise and readable.
- Keep the tone encouraging, professional, and high-signal (no generic corporate fluff).`;

    const isGeneralPreset =
      GREETING_REGEX.test(rawMessage.trim()) ||
      GRATITUDE_REGEX.test(rawMessage.trim()) ||
      WORKFLOW_QUERY_REGEX.test(rawMessage) ||
      /(?:score|audit|rating|why.*score|improve.*portfolio|how.*improve|what.*project.*(?:add|build)|rewrite.*about|skills?.*highlight|interview.*(?:ask|question)|resume.*(?:review|audit))/i.test(
        rawMessage
      );

    let reply = null;
    if (isGeneralPreset) {
      if (WORKFLOW_QUERY_REGEX.test(rawMessage)) {
        reply = generateProjectWorkflowResponse(rawMessage, null, null);
      } else {
        reply = generateGeneralPortfolioAdvice(rawMessage);
      }
    } else {
      const aiReply = await callOpenRouterAI(
        "You are PortfolioAI Copilot. You provide world-class advice on developer portfolios, projects, tech stacks, ATS scoring, and recruiter appeal.",
        generalPrompt,
        conversationHistory,
        2000
      );
      if (aiReply) {
        reply = `${aiReply}\n\n---\n💡 *Pro-Tip: Want me to review your actual code or deployed portfolio? Paste your live website link or GitHub repo URL anytime for real-time audits!*`;
      } else {
        reply = generateGeneralPortfolioAdvice(rawMessage);
      }
    }

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("[chatWithPortfolioAI]", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// Get Public Portfolio
// =======================
export const getPublicPortfolioById = async (req, res) => {
  try {
    const rawId = req.params.id ? req.params.id.trim() : "";
    let portfolio = null;

    // Check if rawId is a valid 24-character hexadecimal ObjectId
    if (rawId && /^[0-9a-fA-F]{24}$/.test(rawId)) {
      portfolio = await Portfolio.findById(rawId).populate(
        "user",
        "fullName avatar plan",
      );
    }

    // Fallback: search by customDomain, deployedUrl, or name/title slug with escaped regex (scoped to public published records)
    if (!portfolio && rawId) {
      const safeId = rawId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      portfolio = await Portfolio.findOne({
        isPublic: true,
        status: "Published",
        $or: [
          { customDomain: rawId.toLowerCase() },
          { deployedUrl: { $regex: safeId, $options: "i" } },
          { name: { $regex: `^${safeId}$`, $options: "i" } },
          { title: { $regex: `^${safeId}$`, $options: "i" } },
        ],
      }).populate("user", "fullName avatar plan");
    }

    if (!portfolio || !portfolio.isPublic || portfolio.status !== "Published") {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found or is private.",
      });
    }

    // Social Crawler / Direct HTML preview support for rich Open Graph cards
    if (req.headers.accept?.includes("text/html") && !req.xhr) {
      const escapeMeta = (str) =>
        String(str || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");

      const clientUrl = process.env.CLIENT_URL || "https://portfolioai.app";
      const name = portfolio.name || portfolio.title || "Developer";
      const role = portfolio.targetRole || portfolio.tagline || "Software Engineer";
      const title = portfolio.seo?.title || `${name} — ${role} Portfolio`;
      const desc =
        portfolio.seo?.description ||
        portfolio.about ||
        portfolio.tagline ||
        `Explore the developer portfolio and projects of ${name}.`;
      const image =
        portfolio.seo?.ogImage || portfolio.avatar || `${clientUrl}/og-image.png`;
      const canonicalUrl = `${clientUrl}/p/${portfolio._id}`;

      return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeMeta(title)}</title>
  <meta name="description" content="${escapeMeta(desc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${canonicalUrl}">
  <!-- Open Graph -->
  <meta property="og:type" content="profile">
  <meta property="og:title" content="${escapeMeta(title)}">
  <meta property="og:description" content="${escapeMeta(desc)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${escapeMeta(image)}">
  <meta property="og:site_name" content="PortfolioAI">
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeMeta(title)}">
  <meta name="twitter:description" content="${escapeMeta(desc)}">
  <meta name="twitter:image" content="${escapeMeta(image)}">
  <!-- JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": "${escapeMeta(name)}",
      "jobTitle": "${escapeMeta(role)}",
      "description": "${escapeMeta(desc)}",
      "url": "${canonicalUrl}"
    }
  }
  </script>
  <meta http-equiv="refresh" content="0;url=${canonicalUrl}">
</head>
<body>
  <h1>${escapeMeta(title)}</h1>
  <p>${escapeMeta(desc)}</p>
  <a href="${canonicalUrl}">View Portfolio</a>
</body>
</html>`);
    }

    return res.status(200).json({
      success: true,
      portfolio,
    });
  } catch (error) {
    console.error("[getPublicPortfolioById error]", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// Chat History Session Handlers
// =======================

// Get all chat sessions for user
export const getChatSessions = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(200).json({ success: true, sessions: [] });
    }
    const sessions = await ChatSession.find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(60);
    return res.status(200).json({ success: true, sessions });
  } catch (error) {
    console.error("[getChatSessions]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Save or update chat session
export const saveChatSession = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(200).json({ success: true, message: "Guest mode" });
    }
    const { sessionId, title, activeLink, portfolioData, messages } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: "sessionId is required" });
    }

    const session = await ChatSession.findOneAndUpdate(
      { user: userId, sessionId },
      {
        user: userId,
        sessionId,
        title: title || "New Chat",
        activeLink: activeLink || "",
        portfolioData: portfolioData || null,
        messages: messages || [],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, session });
  } catch (error) {
    console.error("[saveChatSession]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete single chat session
export const deleteChatSession = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { sessionId } = req.params;
    if (userId && sessionId) {
      await ChatSession.findOneAndDelete({ user: userId, sessionId });
    }
    return res.status(200).json({ success: true, message: "Session deleted" });
  } catch (error) {
    console.error("[deleteChatSession]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Clear all chat sessions
export const clearChatSessions = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (userId) {
      await ChatSession.deleteMany({ user: userId });
    }
    return res.status(200).json({ success: true, message: "All chat sessions cleared" });
  } catch (error) {
    console.error("[clearChatSessions]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =======================
// Upload Portfolio Avatar / Photo
// =======================
// Upload Portfolio Avatar / Photo
// =======================
export const uploadPortfolioAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image file to upload.",
      });
    }

    const userIds = await resolveAccessibleUserIds(req.user);
    const existing = await Portfolio.findOne({
      _id: req.params.id,
      user: { $in: userIds },
    });

    if (!existing) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    // Upload to Cloudinary only after verifying portfolio ownership
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "image",
      folder: "PortfolioAI/Avatars",
      transformation: [
        { width: 500, height: 500, crop: "fill", gravity: "face" },
      ],
    });

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    existing.avatar = result.secure_url;
    if (!existing.hero) existing.hero = {};
    existing.hero.avatar = result.secure_url;
    await existing.save();

    return res.status(200).json({
      success: true,
      message: "Portfolio avatar updated successfully! 📸",
      avatar: result.secure_url,
      portfolio: existing,
    });
  } catch (error) {
    console.error("Portfolio avatar upload error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload portfolio photo",
    });
  }
};

// =======================
// Upload Portfolio Resume (PDF / Document)
// =======================
export const uploadPortfolioResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a PDF resume file to upload.",
      });
    }

    const userIds = await resolveAccessibleUserIds(req.user);
    const existing = await Portfolio.findOne({
      _id: req.params.id,
      user: { $in: userIds },
    });

    if (!existing) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    // Upload to Cloudinary only after verifying portfolio ownership
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      folder: "PortfolioAI/Resumes",
    });

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    existing.resumeUrl = result.secure_url;
    existing.resumeName = req.file.originalname;
    await existing.save();

    return res.status(200).json({
      success: true,
      message: "Portfolio resume document updated successfully! 📄",
      resumeUrl: result.secure_url,
      resumeName: req.file.originalname,
      portfolio: existing,
    });
  } catch (error) {
    console.error("Portfolio resume upload error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload resume document",
    });
  }
};


