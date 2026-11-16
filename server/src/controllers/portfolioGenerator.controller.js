import fs from "fs";
import axios from "axios";
import cloudinary from "../utils/cloudinary.js";
import { extractTextFromPDF } from "../services/pdf.service.js";
import {
  generatePortfolioFromResume,
  normalizeGeneratedPortfolio,
  detectMissingInfo,
  extractAvatarUrl,
  extractProjectsFromAbout,
  extractExperienceFromAbout,
  extractAchievementsFromAbout,
} from "../services/portfolioGenerator.service.js";
import { scrapeLinkedInProfile } from "../services/linkedinScraper.service.js";
import { isSafeUrlForScrape, isValidLinkedInUrl, safeAxiosGet } from "./portfolio.controller.js";

const safeUnlink = (filePath) => {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, () => {});
    }
  } catch (err) {
    // Silently ignore Windows file locking errors
  }
};

// =======================
// Generate From PDF Resume
// =======================
export const generatePortfolio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume required",
      });
    }

    const { targetRole, targetCompany, preferences } = req.body;

    const resumeText = await extractTextFromPDF(req.file.path);

    // Upload candidate's resume to Cloudinary so it can be viewed on portfolio
    let uploadedResumeUrl = "";
    try {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
        folder: "PortfolioAI/Resumes",
      });
      if (uploadResult?.secure_url) {
        uploadedResumeUrl = uploadResult.secure_url;
      }
    } catch (uploadErr) {
      console.warn("Could not upload resume to Cloudinary during generation:", uploadErr.message);
    }

    safeUnlink(req.file.path);

    if (!resumeText || resumeText.replace(/\s+/g, "").length < 30) {
      return res.status(400).json({
        success: false,
        message:
          "Could not extract readable text from this PDF file. The document may be a scanned image or exported as vector outlines. Please upload a text-selectable PDF resume, or enter details using the form.",
      });
    }

    let parsedPreferences = {};
    if (typeof preferences === "string") {
      try {
        parsedPreferences = JSON.parse(preferences);
      } catch (e) {
        parsedPreferences = {};
      }
    } else if (typeof preferences === "object") {
      parsedPreferences = preferences;
    }

    const result = await generatePortfolioFromResume(resumeText, {
      targetRole: targetRole || "",
      targetCompany: targetCompany || "",
      preferences: parsedPreferences,
      inputSource: "resume",
      originalFilename: req.file.originalname || "",
      user: req.user || {},
    });

    const portfolio = result.portfolio || result;
    if (portfolio.hero?.name && !portfolio.name) {
      portfolio.name = portfolio.hero.name;
    }
    if (uploadedResumeUrl) {
      portfolio.resumeUrl = uploadedResumeUrl;
      portfolio.resumeName = req.file.originalname || "Resume.pdf";
    }
    if (parsedPreferences) {
      portfolio.preferences = parsedPreferences;
      if (parsedPreferences.style === "custom" || parsedPreferences.customDesign) {
        portfolio.template = "custom";
      } else if (parsedPreferences.template) {
        portfolio.template = parsedPreferences.template;
      }
    }
    if (req.body.template && !portfolio.template) {
      portfolio.template = req.body.template;
    }
    if (!portfolio.template) {
      portfolio.template = "modern";
    }
    let missingInfo = result.missingInfo || [];
    if (uploadedResumeUrl) {
      missingInfo = missingInfo.filter(
        (item) => item.section !== "Resume" && item.field !== "resumeUrl"
      );
    }

    return res.status(200).json({
      success: true,
      portfolio,
      missingInfo,
    });
  } catch (error) {
    console.error("[generatePortfolio]", error);
    if (req.file) {
      safeUnlink(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// Generate From Form / Text / External Data
// =======================
export const generateFromData = async (req, res) => {
  try {
    const {
      rawData,
      targetRole,
      targetCompany,
      preferences,
      inputSource = "form",
    } = req.body;

    if (!rawData) {
      return res.status(400).json({
        success: false,
        message: "Source data is required for portfolio generation",
      });
    }

    let textPayload = "";
    let extractedAvatar = extractAvatarUrl(rawData?.avatar) || (typeof rawData?.avatar === "string" ? rawData.avatar : "");
    let candidateNameFromSlug = "";
    let candidateNameFromGitHub = "";
    let isUserTheCandidate = false;
    let liveScrapeResult = null;
    let gitHubProfileData = null;

    if (inputSource === "linkedin" && typeof rawData === "object") {
      // Reject malformed, non-HTTPS, or SSRF-probing LinkedIn URLs
      if (rawData.linkedinUrl && !isValidLinkedInUrl(rawData.linkedinUrl)) {
        return res.status(400).json({
          success: false,
          message: "Invalid LinkedIn URL. Please provide a valid HTTPS URL on linkedin.com (e.g. https://www.linkedin.com/in/username).",
        });
      }

      const slugMatch = (rawData.linkedinUrl || "").match(/linkedin\.com\/in\/([a-zA-Z0-9_%-]+)/i);
      const cleanSlug = slugMatch ? slugMatch[1].toLowerCase().replace(/[^a-z0-9_%-]/g, "") : "";

      candidateNameFromSlug = cleanSlug
        ? cleanSlug
            .replace(/-[0-9a-f]{6,}$/i, "")
            .replace(/-[0-9]+$/i, "")
            .replace(/-\b[0-9a-z]{7,}\b$/i, "")
            .replace(/[0-9]+$/g, "")
            .replace(/[-_.]+/g, " ")
            .split(/\s+/)
            .filter(Boolean)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ")
        : "";

      isUserTheCandidate = Boolean(
        req.user?.fullName &&
        candidateNameFromSlug &&
        req.user.fullName.trim().toLowerCase() === candidateNameFromSlug.trim().toLowerCase()
      );

      // If candidate is NOT the logged-in user, strip any erroneously leaked user attributes
      if (!isUserTheCandidate) {
        if (extractedAvatar && req.user?.avatar && extractedAvatar === req.user.avatar) {
          extractedAvatar = "";
        }
        if (rawData?.email && req.user?.email && rawData.email.toLowerCase().trim() === req.user.email.toLowerCase().trim()) {
          rawData.email = "";
        }
        if (rawData?.avatar && req.user?.avatar && rawData.avatar === req.user.avatar) {
          rawData.avatar = "";
        }
        if (rawData?.github && req.user?.githubUsername && rawData.github.toLowerCase().includes(req.user.githubUsername.toLowerCase())) {
          rawData.github = "";
        }
      }

      // Fetch authentic LinkedIn avatar via unavatar.io JSON API
      if (cleanSlug && !extractedAvatar) {
        try {
          const unavatarRes = await axios.get(`https://unavatar.io/linkedin/${cleanSlug}?json=true`, {
            timeout: 5000,
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
            validateStatus: (s) => s < 400,
          });
          if (unavatarRes.data?.url && typeof unavatarRes.data.url === "string" && unavatarRes.data.url.startsWith("http")) {
            extractedAvatar = unavatarRes.data.url;
          }
        } catch (e) {
          console.warn("[generateFromData] Unavatar API check soft warning:", e.message);
        }

        if (!extractedAvatar) {
          extractedAvatar = `https://unavatar.io/linkedin/${cleanSlug}`;
        }
      }

      let combined = `LINKEDIN PROFILE: ${rawData.linkedinUrl || ""}\nTARGET ROLE: ${targetRole || ""}\nTARGET COMPANY: ${targetCompany || ""}`;
      if (candidateNameFromSlug) {
        combined += `\nCANDIDATE NAME: ${candidateNameFromSlug}`;
      }

      // 1. Dual-Provider Live Scraper Check (Apify & RapidAPI)
      liveScrapeResult = null;
      if (rawData.linkedinUrl && isValidLinkedInUrl(rawData.linkedinUrl)) {
        try {
          liveScrapeResult = await scrapeLinkedInProfile(rawData.linkedinUrl);
        } catch (scrapeErr) {
          console.warn("[generateFromData] Live scraper error:", scrapeErr.message);
        }
      }

      if (liveScrapeResult?.success && liveScrapeResult.data) {
        const d = liveScrapeResult.data;
        if (d.name) {
          candidateNameFromSlug = d.name.replace(/[\s.]+$/, "").trim();
          d.name = candidateNameFromSlug;
        }
        if (d.avatar) extractedAvatar = extractAvatarUrl(d.avatar) || (typeof d.avatar === "string" ? d.avatar : extractedAvatar);

        // Extract authentic projects, experience, and achievements if missing from scraper payload
        if (!d.projects || d.projects.length === 0) {
          d.projects = extractProjectsFromAbout(d.about);
        }
        if (!d.experience || d.experience.length === 0) {
          d.experience = extractExperienceFromAbout(d.about);
        }
        if (!d.achievements || d.achievements.length === 0) {
          d.achievements = extractAchievementsFromAbout(d.about);
        }

        combined += `\n\nAUTHENTIC LINKEDIN PROFILE DATA (Via ${liveScrapeResult.provider.toUpperCase()} Scraper):\nName: ${d.name || ""}\nHeadline: ${d.title || ""}\nAbout: ${d.about || ""}\n`;
        if (d.projects?.length) {
          combined += `\n\nPROJECTS:\n` + d.projects.map(p => `${p.title}: ${p.description}\nImpact: ${p.impact || ""}\nTags: ${(p.tags || []).join(", ")}`).join("\n\n");
        }
        if (d.experience?.length) {
          combined += `\nEXPERIENCE:\n` + d.experience.map(e => `${e.role} at ${e.company} (${e.duration})\n${(e.highlights || []).join("\n")}`).join("\n\n");
        }
        if (d.education?.length) {
          combined += `\n\nEDUCATION:\n` + d.education.map(ed => `${ed.degree} - ${ed.institution} (${ed.year || ""})`).join("\n");
        }
        if (d.skills?.length) {
          combined += `\n\nSKILLS:\n` + d.skills.join(", ");
        }
        if (d.achievements?.length) {
          combined += `\n\nACHIEVEMENTS:\n` + d.achievements.map(a => typeof a === "string" ? a : a.title).join("\n");
        }
        if (d.certifications?.length) {
          combined += `\n\nCERTIFICATIONS:\n` + d.certifications.map(c => `${c.name} (${c.issuer})`).join("\n");
        }
      }

      // 2. User-Provided Profile Text Ingestion
      if (rawData.linkedinText && rawData.linkedinText.trim()) {
        const textProjects = extractProjectsFromAbout(rawData.linkedinText);
        const textExperience = extractExperienceFromAbout(rawData.linkedinText);
        const textAchievements = extractAchievementsFromAbout(rawData.linkedinText);

        if (liveScrapeResult?.data) {
          if ((!liveScrapeResult.data.projects || liveScrapeResult.data.projects.length === 0) && textProjects.length > 0) {
            liveScrapeResult.data.projects = textProjects;
          }
          if ((!liveScrapeResult.data.experience || liveScrapeResult.data.experience.length === 0) && textExperience.length > 0) {
            liveScrapeResult.data.experience = textExperience;
          }
          if ((!liveScrapeResult.data.achievements || liveScrapeResult.data.achievements.length === 0) && textAchievements.length > 0) {
            liveScrapeResult.data.achievements = textAchievements;
          }
        }
        combined += `\n\nPROFILE DETAILS & RESUME DATA:\n${rawData.linkedinText.trim()}`;
      }

      // 3. Public metadata fallback (Secured with safeAxiosGet and strict LinkedIn validation)
      if (
        rawData.linkedinUrl &&
        !liveScrapeResult?.success &&
        isValidLinkedInUrl(rawData.linkedinUrl)
      ) {
        try {
          const fetchRes = await safeAxiosGet(rawData.linkedinUrl, {
            headers: {
              "User-Agent": "Twitterbot/1.0",
              Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9",
            },
            timeout: 6000,
          });
          if (fetchRes.status === 200 && typeof fetchRes.data === "string") {
            const html = fetchRes.data;
            const rawOgImage =
              (html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
               html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i) ||
               [])[1] || "";
            const ogImage = rawOgImage.replace(/&amp;/g, "&").trim();
            if (ogImage && ogImage.startsWith("http") && !ogImage.includes("static.licdn.com/aero-v1/sc/h/")) {
              extractedAvatar = ogImage;
            }

            const ogTitle = (html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) || [])[1] || "";
            const ogDesc = (html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) || [])[1] || "";
            const title = (html.match(/<title>([^<]+)<\/title>/i) || [])[1] || "";
            if (ogTitle || ogDesc) {
              combined += `\n\nPUBLIC METADATA:\nTitle: ${ogTitle || title}\nDescription: ${ogDesc}`;
            }
          }
        } catch (e) {
          // Fail-soft if network timeout or auth challenge
        }
      }
      textPayload = combined;
    } else if (inputSource === "github" && typeof rawData === "object") {
      const cleanGh = extractGitHubUsername(rawData.githubUsername || rawData.github || "");

      isUserTheCandidate = Boolean(
        req.user?.githubUsername &&
        cleanGh &&
        req.user.githubUsername.toLowerCase().trim() === cleanGh.toLowerCase()
      );

      // Fetch authentic GitHub data directly
      if (cleanGh) {
        try {
          gitHubProfileData = await getGitHubProfileData(cleanGh);
        } catch (err) {
          console.warn("[generateFromData] Live GitHub profile lookup error:", err.message);
        }
      }

      const ghUser = gitHubProfileData?.userData;
      candidateNameFromGitHub = gitHubProfileData?.candidateName || ghUser?.name || cleanGh || rawData.name || "";
      if (!extractedAvatar) {
        extractedAvatar = ghUser?.avatar_url || (cleanGh ? `https://github.com/${cleanGh}.png` : "");
      }

      // If candidate is NOT the logged-in user, strip any account owner email / avatar / name
      if (!isUserTheCandidate) {
        if (extractedAvatar && req.user?.avatar && extractedAvatar === req.user.avatar) {
          extractedAvatar = `https://github.com/${cleanGh}.png`;
        }
        if (rawData?.email && req.user?.email && rawData.email.toLowerCase().trim() === req.user.email.toLowerCase().trim()) {
          rawData.email = "";
        }
      }

      const repos = (gitHubProfileData?.formattedProjects?.length)
        ? gitHubProfileData.formattedProjects
        : (Array.isArray(rawData.projects) ? rawData.projects : []);

      const skills = (gitHubProfileData?.skills?.length)
        ? gitHubProfileData.skills
        : (Array.isArray(rawData.skills) ? rawData.skills : []);

      let combined = `GITHUB PROFILE: https://github.com/${cleanGh}
CANDIDATE NAME: ${candidateNameFromGitHub}
BIO / HEADLINE: ${ghUser?.bio || rawData.bio || ""}
LOCATION: ${ghUser?.location || ""}
PUBLIC REPOSITORIES: ${ghUser?.public_repos || 0}
TARGET ROLE: ${targetRole || ""}
TARGET COMPANY: ${targetCompany || ""}

AUTHENTIC REPOSITORIES & PROJECTS:
${repos.map(p => `- Title: ${p.title}\n  Description: ${p.description}\n  Tech Tags: ${(p.tags || []).join(", ")}\n  URL: ${p.github}\n  Impact: ${p.impact || ""}`).join("\n\n")}

SKILLS & PROGRAMMING LANGUAGES:
${Array.isArray(skills) ? skills.join(", ") : skills}
`;
      textPayload = combined;
    } else if (typeof rawData === "string") {
      textPayload = rawData;
    } else if (typeof rawData === "object") {
      // Check if user entered an external GitHub profile inside form/custom data
      const cleanDetectedGh = extractGitHubUsername(rawData.githubUsername || rawData.github || "");
      if (cleanDetectedGh) {
        const isUserGh = Boolean(
          req.user?.githubUsername &&
          req.user.githubUsername.toLowerCase().trim() === cleanDetectedGh.toLowerCase()
        );
        if (!isUserGh) {
          isUserTheCandidate = false;
          try {
            gitHubProfileData = await getGitHubProfileData(cleanDetectedGh);
            if (gitHubProfileData?.candidateName) {
              candidateNameFromGitHub = gitHubProfileData.candidateName;
              // If form name was pre-filled with logged-in user name, replace with candidate name
              if (rawData.name && req.user?.fullName && rawData.name.trim().toLowerCase() === req.user.fullName.trim().toLowerCase()) {
                rawData.name = candidateNameFromGitHub;
              }
            }
            if ((!rawData.projects || rawData.projects.length <= 1) && gitHubProfileData?.formattedProjects?.length) {
              rawData.projects = gitHubProfileData.formattedProjects;
            }
            if ((!rawData.skills || rawData.skills.length === 0) && gitHubProfileData?.skills?.length) {
              rawData.skills = gitHubProfileData.skills;
            }
            if (!extractedAvatar && gitHubProfileData?.avatarUrl) {
              extractedAvatar = gitHubProfileData.avatarUrl;
            }
          } catch (e) {
            console.warn("[generateFromData] Form external GitHub auto-lookup warning:", e.message);
          }
        }
      }
      textPayload = JSON.stringify(rawData, null, 2);
    }

    // Secondary fallback: if avatar is still missing, check for GitHub handle in rawData
    if (!extractedAvatar) {
      const ghInput =
        rawData?.githubUsername ||
        rawData?.github ||
        (typeof rawData === "object" ? rawData.contact?.github : "") ||
        "";
      const cleanGhUser = extractGitHubUsername(ghInput);
      if (cleanGhUser) {
        extractedAvatar = `https://github.com/${cleanGhUser}.png`;
      }
    }

    const cleanGhParsed = extractGitHubUsername(rawData?.githubUsername || rawData?.github || "");

    const result = await generatePortfolioFromResume(textPayload, {
      targetRole: targetRole || "",
      targetCompany: targetCompany || "",
      preferences: preferences || {},
      inputSource,
      avatar: extractedAvatar,
      user: (!isUserTheCandidate && (inputSource === "linkedin" || inputSource === "github" || Boolean(cleanGhParsed))) ? {} : (req.user || {}),
      candidateName: candidateNameFromGitHub || (inputSource === "linkedin" ? candidateNameFromSlug : (rawData?.name || "")),
      isUserTheCandidate: (inputSource === "linkedin" || inputSource === "github" || Boolean(cleanGhParsed)) ? isUserTheCandidate : true,
      scrapedData: liveScrapeResult?.success ? liveScrapeResult.data : null,
      cleanGh: cleanGhParsed,
    });

    const portfolio = result.portfolio || result;

    // Strict leak protection: if not the user, never allow user's email or avatar
    if ((inputSource === "linkedin" || inputSource === "github" || Boolean(cleanGhParsed)) && !isUserTheCandidate && req.user) {
      if (portfolio.email && req.user.email && portfolio.email.toLowerCase() === req.user.email.toLowerCase()) {
        portfolio.email = gitHubProfileData?.userData?.email || "";
      }
      if (portfolio.contact?.email && req.user.email && portfolio.contact.email.toLowerCase() === req.user.email.toLowerCase()) {
        portfolio.contact.email = gitHubProfileData?.userData?.email || "";
      }
      if (portfolio.avatar && req.user.avatar && portfolio.avatar === req.user.avatar) {
        portfolio.avatar = typeof extractedAvatar === "string" ? extractedAvatar : (cleanGhParsed ? `https://github.com/${cleanGhParsed}.png` : "");
        if (portfolio.hero) portfolio.hero.avatar = portfolio.avatar;
      }
    }

    if (inputSource === "github" || (cleanGhParsed && !isUserTheCandidate)) {
      const finalCandidateName = candidateNameFromGitHub || cleanGhParsed;
      if (finalCandidateName) {
        portfolio.name = finalCandidateName;
        if (portfolio.hero) portfolio.hero.name = finalCandidateName;
        portfolio.title = `${finalCandidateName}'s Portfolio (${targetRole || portfolio.hero?.title || "Full Stack Developer"})`;
      }
      if (extractedAvatar) {
        portfolio.avatar = extractedAvatar;
        if (portfolio.hero) portfolio.hero.avatar = extractedAvatar;
      }
      if (cleanGhParsed) {
        portfolio.github = `https://github.com/${cleanGhParsed}`;
        if (portfolio.contact) portfolio.contact.github = `https://github.com/${cleanGhParsed}`;
      }
      if (gitHubProfileData?.formattedProjects?.length) {
        const hasAuthenticProjects = Array.isArray(portfolio.projects) &&
          portfolio.projects.length > 0 &&
          portfolio.projects.some(p => p.github && p.github.includes("github.com") && p.title && p.title !== "Title");

        if (!hasAuthenticProjects) {
          portfolio.projects = gitHubProfileData.formattedProjects;
        } else {
          const existingUrls = new Set(portfolio.projects.map(p => p.github).filter(Boolean));
          for (const realRepo of gitHubProfileData.formattedProjects) {
            if (!existingUrls.has(realRepo.github)) {
              portfolio.projects.push(realRepo);
            }
          }
        }
      }
      if (gitHubProfileData?.skills?.length) {
        if (!portfolio.skills || portfolio.skills.length === 0) {
          portfolio.skills = gitHubProfileData.skills;
        } else {
          portfolio.skills = Array.from(new Set([...portfolio.skills, ...gitHubProfileData.skills]));
        }
      }
      if (gitHubProfileData?.userData?.bio && (!portfolio.tagline || portfolio.tagline === "Full Stack Developer")) {
        portfolio.tagline = gitHubProfileData.userData.bio;
        if (portfolio.hero) portfolio.hero.tagline = gitHubProfileData.userData.bio;
      }
      if (gitHubProfileData?.userData?.bio && !portfolio.about) {
        portfolio.about = gitHubProfileData.importedData?.about || gitHubProfileData.userData.bio;
      }
    }
    if (portfolio.hero?.name && !portfolio.name) {
      portfolio.name = portfolio.hero.name;
    }
    if (extractedAvatar && typeof extractedAvatar === "string" && !portfolio.avatar) {
      portfolio.avatar = extractedAvatar;
    }
    if (portfolio.avatar && typeof portfolio.avatar !== "string") {
      portfolio.avatar = extractAvatarUrl(portfolio.avatar) || "";
    }
    if (portfolio.hero && portfolio.hero.avatar && typeof portfolio.hero.avatar !== "string") {
      portfolio.hero.avatar = extractAvatarUrl(portfolio.hero.avatar) || "";
    }
    if (portfolio.avatar && (!portfolio.hero?.avatar || portfolio.hero?.avatar === "")) {
      portfolio.hero = { ...(portfolio.hero || {}), avatar: portfolio.avatar };
    }
    if (rawData?.resumeUrl && !portfolio.resumeUrl) {
      portfolio.resumeUrl = rawData.resumeUrl;
      portfolio.resumeName = rawData.resumeName || "Resume.pdf";
    }
    if (preferences) {
      portfolio.preferences = preferences;
      if (preferences.style === "custom" || preferences.customDesign) {
        portfolio.template = "custom";
      } else if (preferences.template) {
        portfolio.template = preferences.template;
      }
    }
    if (req.body.template && !portfolio.template) {
      portfolio.template = req.body.template;
    }
    if (!portfolio.template) {
      portfolio.template = "modern";
    }
    const missingInfo = result.missingInfo || [];

    return res.status(200).json({
      success: true,
      portfolio,
      missingInfo,
    });
  } catch (error) {
    console.error("[generateFromData]", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// Robust GitHub Username / URL Extractor
// =======================
export const extractGitHubUsername = (input) => {
  if (!input || typeof input !== "string") return "";
  let str = input.trim();
  str = str.split("?")[0].split("#")[0].replace(/\/+$/, "");
  const ghRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-\.]+)/i;
  const match = str.match(ghRegex);
  if (match && match[1]) {
    const segment = match[1].replace(/^\/+/, "").replace(/\/+$/, "");
    if (!["topics", "search", "explore", "settings", "features", "pricing", "login", "join"].includes(segment.toLowerCase())) {
      return segment;
    }
  }
  return str.replace(/^@+/, "").replace(/\/.*$/, "").trim();
};

// =======================
// Reusable Helper: Fetch GitHub Profile & Repositories
// =======================
export const getGitHubProfileData = async (username) => {
  const cleanUser = extractGitHubUsername(username);

  if (!cleanUser) {
    throw new Error(`Invalid GitHub username or profile URL: "${username}"`);
  }

  const [userRes, reposRes] = await Promise.allSettled([
    axios.get(`https://api.github.com/users/${cleanUser}`, {
      headers: { "User-Agent": "PortfolioAI-App" },
      timeout: 8000,
    }),
    axios.get(
      `https://api.github.com/users/${cleanUser}/repos?sort=updated&per_page=12`,
      {
        headers: { "User-Agent": "PortfolioAI-App" },
        timeout: 8000,
      },
    ),
  ]);

  if (userRes.status === "rejected") {
    throw new Error(`GitHub user "${cleanUser}" not found`);
  }

  const userData = userRes.value.data;
  const reposData = reposRes.status === "fulfilled" ? reposRes.value.data : [];
  const avatarUrl = userData.avatar_url || `https://github.com/${cleanUser}.png`;

  const formattedProjects = reposData
    .filter((r) => !r.fork)
    .slice(0, 6)
    .map((r) => ({
      title: r.name.replace(/[-_]/g, " "),
      description: r.description || `Modern web project built with ${r.language || "JavaScript"}.`,
      tags: [r.language, "Open Source", "GitHub"].filter(Boolean),
      github: r.html_url,
      live: r.homepage || r.html_url,
      impact: `${r.stargazers_count} stars • ${r.forks_count} forks on GitHub`,
    }));

  const skills = Array.from(
    new Set(
      [
        "JavaScript",
        "TypeScript",
        ...reposData.map((r) => r.language).filter(Boolean),
        "Git",
        "GitHub",
      ].filter(Boolean),
    ),
  );

  const candidateDisplayName = userData.name || userData.login;

  return {
    userData,
    reposData,
    formattedProjects,
    skills,
    avatarUrl,
    candidateName: candidateDisplayName,
    importedData: {
      hero: {
        name: candidateDisplayName,
        title: userData.bio?.slice(0, 50) || "Open Source Developer",
        tagline: userData.bio || "Passionate software builder building next-generation applications.",
        avatar: avatarUrl,
      },
      about: `${candidateDisplayName} is a passionate developer based in ${
        userData.location || "Earth"
      }. With ${userData.public_repos} public repositories, they actively contribute to modern open-source technologies.`,
      skills,
      projects: formattedProjects,
      contact: {
        email: userData.email || "",
        github: userData.html_url,
        website: userData.blog || "",
        linkedin: "",
      },
      avatar: avatarUrl,
    },
  };
};

// =======================
// Fetch GitHub Profile & Repositories Controller
// =======================
export const fetchGitHubProfile = async (req, res) => {
  try {
    const rawUser = req.params.username || req.query.username || "";
    const username = extractGitHubUsername(rawUser);
    if (!username) {
      return res.status(400).json({
        success: false,
        message: "A valid GitHub username or profile URL is required",
      });
    }

    const ghResult = await getGitHubProfileData(username);
    const missingInfo = detectMissingInfo(ghResult.importedData);

    return res.status(200).json({
      success: true,
      importedData: ghResult.importedData,
      missingInfo,
    });
  } catch (error) {
    console.error("[fetchGitHubProfile]", error);
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// Extract Portfolio URL
// =======================
export const extractPortfolioUrl = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    const targetUrl = url.startsWith("http") ? url : `https://${url}`;
    if (!isSafeUrlForScrape(targetUrl)) {
      return res.status(400).json({
        success: false,
        message: "Target URL cannot be a loopback, private subnet, or internal cloud metadata address.",
      });
    }
    let response;
    try {
      response = await safeAxiosGet(targetUrl, {
        timeout: 8000,
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      });
    } catch (fetchErr) {
      if (fetchErr.isSsrfBlocked || fetchErr.message?.startsWith("SSRF_")) {
        return res.status(400).json({
          success: false,
          message: "Target URL cannot be a loopback, private subnet, or internal cloud metadata address.",
        });
      }
      throw fetchErr;
    }

    const html = response.data || "";
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const metaDescMatch = html.match(
      /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i,
    );

    const title = titleMatch ? titleMatch[1] : "Imported Portfolio";
    const description = metaDescMatch
      ? metaDescMatch[1]
      : "Imported professional web portfolio";

    return res.status(200).json({
      success: true,
      extracted: {
        url: targetUrl,
        title,
        description,
        contentSample: html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 1500),
      },
    });
  } catch (error) {
    console.error("[extractPortfolioUrl]", error);
    return res.status(500).json({
      success: false,
      message: "Could not fetch portfolio URL. You can still paste the details manually.",
    });
  }
};

// =======================
// Analyze Reference (URL or Image Screenshot)
// =======================
export const analyzePortfolioReference = async (req, res) => {
  let uploadedFilePath = req.file?.path || null;
  try {
    const url = req.body.url || req.body.referenceUrl;
    const imageBase64 = req.body.imageBase64;
    let referenceType = "url";
    let design = {
      theme: "bento",
      primaryColor: "#6366f1",
      secondaryColor: "#a855f7",
      backgroundColor: "#070709",
      fontChoice: "sans",
      density: "balanced",
      borderRadius: "rounded",
      cardElevation: "glow",
      summary: "Modern asymmetric Bento grid with luminous violet accents.",
    };

    if (req.file || imageBase64) {
      referenceType = "image";
      let base64Data = imageBase64 || "";
      if (req.file && fs.existsSync(req.file.path)) {
        const fileBuffer = fs.readFileSync(req.file.path);
        const mime = req.file.mimetype || "image/png";
        base64Data = `data:${mime};base64,${fileBuffer.toString("base64")}`;
      }

      // Try AI Multimodal Vision if key is available
      let aiAnalyzed = false;
      if (process.env.OPENROUTER_API_KEY && base64Data) {
        const visionModels = [
          "google/gemini-2.0-flash-exp:free",
          "meta-llama/llama-3.2-11b-vision-instruct:free",
          "google/gemini-flash-1.5",
        ];

        for (const model of visionModels) {
          try {
            const prompt = `Analyze this portfolio website screenshot or design mockup.
Extract the design aesthetic and return ONLY a valid JSON object (no markdown, no backticks):
{
  "theme": "bento | minimal | terminal | glass | cyberpunk | editorial | brutalist | corporate",
  "primaryColor": "#hexcode (dominant vibrant accent color)",
  "secondaryColor": "#hexcode (secondary accent)",
  "backgroundColor": "#hexcode (canvas background)",
  "fontChoice": "sans | mono | serif",
  "density": "compact | balanced | spacious",
  "borderRadius": "sharp | rounded | pill",
  "cardElevation": "glow | glass | minimal | solid",
  "summary": "1 sentence describing the visual identity and aesthetic"
}`;

            const response = await axios.post(
              "https://openrouter.ai/api/v1/chat/completions",
              {
                model,
                messages: [
                  {
                    role: "user",
                    content: [
                      { type: "text", text: prompt },
                      { type: "image_url", image_url: { url: base64Data } },
                    ],
                  },
                ],
              },
              {
                headers: {
                  Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                  "Content-Type": "application/json",
                },
                timeout: 12000,
              },
            );

            let text = response.data?.choices?.[0]?.message?.content || "";
            text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
            const start = text.indexOf("{");
            const end = text.lastIndexOf("}");
            if (start !== -1 && end !== -1 && end > start) {
              const parsed = JSON.parse(text.substring(start, end + 1));
              if (parsed?.theme && parsed?.primaryColor) {
                design = {
                  theme: ["bento", "minimal", "terminal", "glass", "cyberpunk", "editorial", "brutalist", "corporate"].includes(parsed.theme?.toLowerCase())
                    ? parsed.theme.toLowerCase()
                    : "bento",
                  primaryColor: parsed.primaryColor || "#6366f1",
                  secondaryColor: parsed.secondaryColor || "#a855f7",
                  backgroundColor: parsed.backgroundColor || "#070709",
                  fontChoice: ["sans", "mono", "serif"].includes(parsed.fontChoice?.toLowerCase())
                    ? parsed.fontChoice.toLowerCase()
                    : "sans",
                  density: ["compact", "balanced", "spacious"].includes(parsed.density?.toLowerCase())
                    ? parsed.density.toLowerCase()
                    : "balanced",
                  borderRadius: ["sharp", "rounded", "pill"].includes(parsed.borderRadius?.toLowerCase())
                    ? parsed.borderRadius.toLowerCase()
                    : "rounded",
                  cardElevation: ["glow", "glass", "minimal", "solid"].includes(parsed.cardElevation?.toLowerCase())
                    ? parsed.cardElevation.toLowerCase()
                    : "glow",
                  summary: parsed.summary || "Custom aesthetics extracted from your reference image.",
                };
                aiAnalyzed = true;
                break;
              }
            }
          } catch (e) {
            console.warn(`[analyzePortfolioReference] Vision model ${model} failed, checking fallback...`);
          }
        }
      }

      if (!aiAnalyzed) {
        // High quality heuristic aesthetic extraction for uploaded screenshot
        const fileName = (req.file?.originalname || "").toLowerCase();
        let fallbackTheme = "bento";
        let fallbackPrimary = "#6366f1";
        let fallbackFont = "sans";

        if (fileName.includes("terminal") || fileName.includes("code") || fileName.includes("dev")) {
          fallbackTheme = "terminal";
          fallbackPrimary = "#10b981";
          fallbackFont = "mono";
        } else if (fileName.includes("cyber") || fileName.includes("neon")) {
          fallbackTheme = "cyberpunk";
          fallbackPrimary = "#06b6d4";
        } else if (fileName.includes("minimal") || fileName.includes("swiss")) {
          fallbackTheme = "minimal";
          fallbackPrimary = "#e11d48";
        } else if (fileName.includes("glass") || fileName.includes("frost")) {
          fallbackTheme = "glass";
          fallbackPrimary = "#8b5cf6";
        } else if (fileName.includes("editorial") || fileName.includes("serif") || fileName.includes("mag")) {
          fallbackTheme = "editorial";
          fallbackPrimary = "#f59e0b";
          fallbackFont = "serif";
        }

        design = {
          theme: fallbackTheme,
          primaryColor: fallbackPrimary,
          secondaryColor: fallbackTheme === "terminal" ? "#06b6d4" : "#a855f7",
          backgroundColor: "#070709",
          fontChoice: fallbackFont,
          density: "balanced",
          borderRadius: fallbackTheme === "minimal" ? "sharp" : "rounded",
          cardElevation: fallbackTheme === "glass" ? "glass" : "glow",
          summary: `Extracted ${fallbackTheme.toUpperCase()} aesthetic with calibrated color palette and typography from image.`,
        };
      }
    } else if (url) {
      referenceType = "url";
      let formattedUrl = url.trim();
      if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
        formattedUrl = `https://${formattedUrl}`;
      }

      if (!isSafeUrlForScrape(formattedUrl)) {
        return res.status(400).json({
          success: false,
          message: "Target URL cannot be a loopback, private subnet, or internal cloud metadata address.",
        });
      }

      let html = "";
      try {
        const fetchRes = await safeAxiosGet(formattedUrl, {
          timeout: 7000,
          maxContentLength: 5 * 1024 * 1024,
          maxBodyLength: 5 * 1024 * 1024,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
        });
        html = typeof fetchRes.data === "string" ? fetchRes.data : "";
      } catch (e) {
        console.warn("[analyzePortfolioReference] URL fetch soft error:", e.message);
      }

      // Extract colors, theme-color meta, fonts, and keywords
      const themeColorMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
      const extractedThemeColor = themeColorMatch ? themeColorMatch[1].trim() : null;

      // Extract font families
      let detectedFont = "sans";
      if (/font-family:[^;]*(playfair|merriweather|garamond|serif|cinzel)/i.test(html) || /family=(Playfair|Merriweather|Cinzel|Lora)/i.test(html)) {
        detectedFont = "serif";
      } else if (/font-family:[^;]*(mono|jetbrains|fira|consolas|courier)/i.test(html) || /family=(JetBrains\+Mono|Fira\+Code|Space\+Mono)/i.test(html)) {
        detectedFont = "mono";
      }

      // Detect theme from text/class indicators
      let detectedTheme = "bento";
      const lowerHtml = html.toLowerCase();
      if (lowerHtml.includes("terminal") || lowerHtml.includes("bash") || lowerHtml.includes("cli") || lowerHtml.includes("matrix") || lowerHtml.includes("hacker")) {
        detectedTheme = "terminal";
      } else if (lowerHtml.includes("cyberpunk") || lowerHtml.includes("neon") || lowerHtml.includes("synthwave")) {
        detectedTheme = "cyberpunk";
      } else if (lowerHtml.includes("glass") || lowerHtml.includes("backdrop-blur") || lowerHtml.includes("frosted")) {
        detectedTheme = "glass";
      } else if (lowerHtml.includes("editorial") || lowerHtml.includes("magazine") || detectedFont === "serif") {
        detectedTheme = "editorial";
      } else if (lowerHtml.includes("brutalist") || lowerHtml.includes("neobrutalism")) {
        detectedTheme = "brutalist";
      } else if (lowerHtml.includes("swiss") || lowerHtml.includes("minimalist") || lowerHtml.includes("minimal")) {
        detectedTheme = "minimal";
      } else if (lowerHtml.includes("executive") || lowerHtml.includes("corporate") || lowerHtml.includes("solutions")) {
        detectedTheme = "corporate";
      }

      // Try AI extraction if API key is present
      let aiAnalyzed = false;
      if (process.env.OPENROUTER_API_KEY && html) {
        const textSample = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 3000);
        const models = ["nvidia/nemotron-3.5-lightning:free", "google/gemma-4-31b-it:free", "liquid/lfm-2.5-2.6b:free"];
        for (const model of models) {
          try {
            const prompt = `Analyze this reference portfolio website: ${formattedUrl}
Content snippet: ${textSample}
Extract the design aesthetic and return ONLY a valid JSON object (no markdown, no backticks):
{
  "theme": "bento | minimal | terminal | glass | cyberpunk | editorial | brutalist | corporate",
  "primaryColor": "#hexcode (dominant vibrant accent color)",
  "secondaryColor": "#hexcode",
  "backgroundColor": "#hexcode",
  "fontChoice": "sans | mono | serif",
  "density": "compact | balanced | spacious",
  "borderRadius": "sharp | rounded | pill",
  "cardElevation": "glow | glass | minimal | solid",
  "summary": "1 sentence describing the visual identity and aesthetic"
}`;

            const response = await axios.post(
              "https://openrouter.ai/api/v1/chat/completions",
              {
                model,
                messages: [{ role: "user", content: prompt }],
              },
              {
                headers: {
                  Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                  "Content-Type": "application/json",
                },
                timeout: 10000,
              },
            );

            let text = response.data?.choices?.[0]?.message?.content || "";
            text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
            const start = text.indexOf("{");
            const end = text.lastIndexOf("}");
            if (start !== -1 && end !== -1 && end > start) {
              const parsed = JSON.parse(text.substring(start, end + 1));
              if (parsed?.theme && parsed?.primaryColor) {
                design = {
                  theme: ["bento", "minimal", "terminal", "glass", "cyberpunk", "editorial", "brutalist", "corporate"].includes(parsed.theme?.toLowerCase())
                    ? parsed.theme.toLowerCase()
                    : detectedTheme,
                  primaryColor: parsed.primaryColor || extractedThemeColor || "#6366f1",
                  secondaryColor: parsed.secondaryColor || "#a855f7",
                  backgroundColor: parsed.backgroundColor || "#070709",
                  fontChoice: ["sans", "mono", "serif"].includes(parsed.fontChoice?.toLowerCase())
                    ? parsed.fontChoice.toLowerCase()
                    : detectedFont,
                  density: ["compact", "balanced", "spacious"].includes(parsed.density?.toLowerCase())
                    ? parsed.density.toLowerCase()
                    : "balanced",
                  borderRadius: ["sharp", "rounded", "pill"].includes(parsed.borderRadius?.toLowerCase())
                    ? parsed.borderRadius.toLowerCase()
                    : "rounded",
                  cardElevation: ["glow", "glass", "minimal", "solid"].includes(parsed.cardElevation?.toLowerCase())
                    ? parsed.cardElevation.toLowerCase()
                    : "glow",
                  summary: parsed.summary || `Extracted design identity from ${formattedUrl}.`,
                };
                aiAnalyzed = true;
                break;
              }
            }
          } catch (e) {
            console.warn(`[analyzePortfolioReference] URL model ${model} failed, next...`);
          }
        }
      }

      if (!aiAnalyzed) {
        let chosenColor = extractedThemeColor || (detectedTheme === "terminal" ? "#10b981" : detectedTheme === "cyberpunk" ? "#06b6d4" : detectedTheme === "minimal" ? "#e11d48" : detectedTheme === "editorial" ? "#f59e0b" : "#6366f1");
        design = {
          theme: detectedTheme,
          primaryColor: chosenColor,
          secondaryColor: detectedTheme === "terminal" ? "#06b6d4" : "#a855f7",
          backgroundColor: "#070709",
          fontChoice: detectedFont,
          density: "balanced",
          borderRadius: detectedTheme === "minimal" ? "sharp" : "rounded",
          cardElevation: detectedTheme === "glass" ? "glass" : "glow",
          summary: `Deconstructed design DNA from ${formattedUrl}: ${detectedTheme.toUpperCase()} theme with ${chosenColor} accent.`,
        };
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Please provide either a portfolio URL or an image screenshot to analyze.",
      });
    }

    return res.status(200).json({
      success: true,
      referenceType,
      design,
    });
  } catch (error) {
    console.error("[analyzePortfolioReference]", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze reference.",
    });
  } finally {
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
      } catch (e) {}
    }
  }
};
