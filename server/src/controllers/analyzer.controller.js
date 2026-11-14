import fs from "fs";
import axios from "axios";
import { extractTextFromPDF } from "../services/pdf.service.js";
import {
  analyzeResumeWithGemini,
  analyzePortfolioComprehensive,
} from "../services/gemini.service.js";
import Portfolio from "../models/portfolio.model.js";
import { isSafeUrlForScrape } from "./portfolio.controller.js";

// =======================
// Analyze Resume PDF
// =======================
export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume is required",
      });
    }

    const { targetRole, targetCompany } = req.body;

    const extractedText = await extractTextFromPDF(req.file.path);

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (!extractedText || extractedText.replace(/\s+/g, "").length < 30) {
      return res.status(400).json({
        success: false,
        message:
          "Could not extract readable text from this PDF file. Please ensure your PDF contains selectable text rather than scanned images or vector outlines.",
      });
    }

    const analysis = await analyzePortfolioComprehensive(extractedText, {
      targetRole: targetRole || "",
      targetCompany: targetCompany || "",
      inputType: "resume",
    });

    // Provide legacy atsScore bridge for backward compatibility
    const responsePayload = {
      ...analysis,
      atsScore: analysis.overallScore,
      summary: analysis.verdict,
      improvements: (analysis.contentSuggestions || []).map((s) => s.suggested),
    };

    return res.status(200).json({
      success: true,
      analysis: responsePayload,
    });
  } catch (error) {
    console.error("[analyzeResume]", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// Analyze Portfolio (by ID or JSON payload)
// =======================
export const analyzePortfolio = async (req, res) => {
  try {
    const { portfolioId, portfolioData, targetRole, targetCompany } = req.body;

    let targetData = portfolioData;

    if (portfolioId) {
      const accessFilter = req.user?._id
        ? { _id: portfolioId, $or: [{ user: req.user._id }, { isPublic: true }, { status: "Published" }] }
        : { _id: portfolioId, $or: [{ isPublic: true }, { status: "Published" }] };
      const portfolio = await Portfolio.findOne(accessFilter);
      if (portfolio) {
        targetData = portfolio.toObject();
      }
    }

    if (!targetData) {
      return res.status(400).json({
        success: false,
        message: "Portfolio ID or portfolio data required for analysis",
      });
    }

    let resolvedRole = (targetRole || "").trim();
    let resolvedCompany = (targetCompany || "").trim();

    // If targetRole is empty or matches generic default "Full Stack Developer", but portfolio data has a specialized role (e.g. Finance & HR), prioritize portfolio's authentic role!
    if (!resolvedRole || resolvedRole.toLowerCase() === "full stack developer" || resolvedRole.toLowerCase() === "full stack engineer") {
      if (targetData.targetRole) {
        resolvedRole = targetData.targetRole;
      } else if (targetData.tagline && !/developer|engineer|coder/i.test(targetData.tagline)) {
        resolvedRole = targetData.tagline.split(/ at | specializing |\|/i)[0].trim();
      } else if (targetData.title && !/developer|engineer|coder/i.test(targetData.title)) {
        resolvedRole = targetData.title.replace(/portfolio/gi, "").trim();
      }
    }

    if (!resolvedCompany || resolvedCompany.toLowerCase() === "google") {
      if (targetData.targetCompany) {
        resolvedCompany = targetData.targetCompany;
      }
    }

    const analysis = await analyzePortfolioComprehensive(targetData, {
      targetRole: resolvedRole || targetData.targetRole || "",
      targetCompany: resolvedCompany || targetData.targetCompany || "",
      inputType: "portfolio",
    });

    // If portfolioId was provided, save the report into the portfolio model (owner only)
    if (portfolioId && req.user?._id) {
      await Portfolio.findOneAndUpdate(
        { _id: portfolioId, user: req.user._id },
        {
          analysisReport: {
            ...analysis,
            targetRole: resolvedRole || "",
            targetCompany: resolvedCompany || "",
            analyzedAt: new Date(),
          },
        }
      );
    }

    return res.status(200).json({
      success: true,
      analysis: {
        ...analysis,
        atsScore: analysis.overallScore,
        summary: analysis.verdict,
        improvements: (analysis.contentSuggestions || []).map((s) => s.suggested),
      },
    });
  } catch (error) {
    console.error("[analyzePortfolio]", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// Analyze Live URL
// =======================
export const analyzeUrl = async (req, res) => {
  try {
    const { url, targetRole, targetCompany } = req.body;
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
    const siteResponse = await axios.get(targetUrl, {
      timeout: 10000,
      maxContentLength: 5 * 1024 * 1024,
      maxBodyLength: 5 * 1024 * 1024,
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });

    const html = siteResponse.data || "";

    // 1. Extract metadata from HTML
    const pageTitle = (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1]?.trim() || "";
    const metaDesc = (html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) || [])[1]?.trim() || "";
    
    // Extract candidate name and detected role from title (e.g. "Chinky | Full-Stack Developer & CS Undergraduate")
    let candidateName = "";
    let detectedRoleFromPage = "";
    if (pageTitle) {
      const parts = pageTitle.split(/\s*[|–—•]\s*/);
      if (parts.length > 1) {
        candidateName = parts[0].trim();
        detectedRoleFromPage = parts[1].trim();
      } else {
        candidateName = pageTitle;
      }
    }

    // Extract H1, H2, and H3
    const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
      .map((m) => m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
      .filter(Boolean);
    const h2Matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
      .map((m) => m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
      .filter(Boolean);
    const h3Matches = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)]
      .map((m) => m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
      .filter(Boolean);

    // Look for explicit hero-name
    const heroNameMatch = html.match(/class=["'][^"']*hero-name[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
    if (heroNameMatch) {
      const parsedHeroName = heroNameMatch[1].replace(/<[^>]+>/g, "").trim();
      if (parsedHeroName && parsedHeroName.length > 1) {
        candidateName = parsedHeroName;
      }
    }

    if (!candidateName && h1Matches.length > 0) {
      candidateName = h1Matches[0].split(/[|–—\n]/)[0].trim();
    }

    // Extract hero tagline quote
    const heroTaglineMatch = html.match(/class=["'][^"']*hero-tagline[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
    const heroTagline = heroTaglineMatch
      ? heroTaglineMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().replace(/^["']|["']$/g, "")
      : "";

    // Extract status badge (e.g. B.Tech CSE @ ABES Engineering College (2023–2027))
    const statusBadgeMatch = html.match(/class=["'][^"']*status-badge[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
    const statusBadgeText = statusBadgeMatch ? statusBadgeMatch[1].replace(/<[^>]+>/g, "").trim() : "";

    // Extract avatar / profile photo
    let detectedAvatar = "";
    const ogImg = (html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                   html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i) || [])[1];
    if (ogImg) {
      try {
        detectedAvatar = ogImg.startsWith("http") ? ogImg : new URL(ogImg, targetUrl).href;
      } catch (_) {}
    }
    if (!detectedAvatar) {
      const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
      let imgMatch;
      while ((imgMatch = imgRegex.exec(html)) !== null) {
        const fullTag = imgMatch[0];
        const src = imgMatch[1];
        if (
          /profile|avatar|photo|portrait|author|hero|about|me\b/i.test(fullTag) &&
          !/logo|icon|badge|crest|arrow|star/i.test(fullTag) &&
          !src.includes(".svg")
        ) {
          try {
            detectedAvatar = src.startsWith("http") ? src : new URL(src, targetUrl).href;
            break;
          } catch (_) {}
        }
      }
    }

    // Extract social links
    const ghMatch = html.match(/href=["'](https?:\/\/(?:www\.)?github\.com\/[^"'\s]+)["']/i);
    const detectedGithub = ghMatch ? ghMatch[1] : "";
    const liMatch = html.match(/href=["'](https?:\/\/(?:www\.)?linkedin\.com\/[^"'\s]+)["']/i);
    const detectedLinkedin = liMatch ? liMatch[1] : "";

    // Clean plain text
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();

    // Extract project names from headings
    const detectedProjects = [];
    for (const h3 of h3Matches) {
      const cleanH3 = h3.replace(/[↗→🔗]/g, "").trim();
      if (
        cleanH3 &&
        cleanH3.length > 2 &&
        cleanH3.length < 50 &&
        !/languages|frontend|backend|database|frameworks|tools|education|experience|contact|connect|social|achievements/i.test(cleanH3)
      ) {
        const escapedH3 = cleanH3.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        const pDescMatch =
          html.match(new RegExp(`${escapedH3}[\\s\\S]{0,350}?<p[^>]*class=["'][^"']*project-description[^"']*["'][^>]*>([\\s\\S]*?)<\\/p>`, "i")) ||
          html.match(new RegExp(`${escapedH3}[\\s\\S]{0,350}?<p[^>]*>([\\s\\S]*?)<\\/p>`, "i"));
        const actualDesc = pDescMatch
          ? pDescMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
          : "";

        detectedProjects.push({
          title: cleanH3,
          description: actualDesc || `Key featured project identified on portfolio live site: ${cleanH3}`,
          techStack: [],
          liveUrl: targetUrl,
        });
        if (detectedProjects.length >= 4) break;
      }
    }

    // Extract skills heuristics
    const commonSkills = [
      "JavaScript", "TypeScript", "React", "Next.js", "Vue", "Node.js", "Express",
      "Python", "Django", "Flask", "Java", "Spring Boot", "C++", "C", "Go", "Rust",
      "MongoDB", "PostgreSQL", "MySQL", "Redis", "Docker", "Kubernetes", "AWS",
      "Git", "GitHub", "REST API", "GraphQL", "Tailwind CSS", "HTML5", "CSS3",
      "Machine Learning", "PyTorch", "TensorFlow", "Pandas", "Scikit-Learn"
    ];
    const detectedSkills = commonSkills.filter((skill) => {
      const escaped = skill.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      return new RegExp(`\\b${escaped}\\b`, "i").test(cleanText);
    });

    const effectiveRole = (targetRole || "").trim() || detectedRoleFromPage || "Full Stack Developer";

    const portfolioProfile = {
      title: candidateName ? `${candidateName}'s Portfolio` : pageTitle || "Live Portfolio",
      candidateName: candidateName || "Candidate",
      targetRole: effectiveRole,
      targetCompany: targetCompany || "",
      tagline: heroTagline || detectedRoleFromPage || pageTitle || effectiveRole,
      avatar: detectedAvatar,
      description: heroTagline || metaDesc || cleanText.slice(0, 500),
      about: heroTagline || metaDesc || cleanText.slice(0, 600),
      skills: detectedSkills,
      projects: detectedProjects,
      github: detectedGithub,
      linkedin: detectedLinkedin,
      education: statusBadgeText ? [{ institution: statusBadgeText, degree: "B.Tech CSE", year: "2023-2027" }] : [],
      rawText: `Portfolio Website: ${targetUrl}\nTitle: ${pageTitle}\nCandidate: ${candidateName}\nHeadings: ${h1Matches.join(" | ")}\nSections: ${h2Matches.join(", ")}\nSummary: ${heroTagline || metaDesc}\n\nExcerpts:\n${cleanText.slice(0, 5000)}`,
    };

    const analysis = await analyzePortfolioComprehensive(portfolioProfile, {
      targetRole: effectiveRole,
      targetCompany: targetCompany || "",
      inputType: "url",
    });

    return res.status(200).json({
      success: true,
      analysis: {
        ...analysis,
        sourceType: "url",
        sourceUrl: targetUrl,
        rawHtml: html,
        portfolioTitle: portfolioProfile.title,
        candidateName: candidateName || "Candidate",
        avatar: detectedAvatar,
        extractedAvatar: detectedAvatar,
        tagline: portfolioProfile.tagline,
        github: detectedGithub,
        linkedin: detectedLinkedin,
        education: portfolioProfile.education,
        extractedSkills: detectedSkills,
        extractedProjects: detectedProjects,
        atsScore: analysis.overallScore,
        summary: analysis.verdict,
        improvements: (analysis.contentSuggestions || []).map((s) => s.suggested),
      },
    });
  } catch (error) {
    console.error("[analyzeUrl]", error);
    return res.status(500).json({
      success: false,
      message: "Could not fetch portfolio URL for analysis",
    });
  }
};

// =======================
// Analyze Raw Code / Snippet
// =======================
export const analyzeCode = async (req, res) => {
  try {
    const { code, targetRole, targetCompany } = req.body;
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Code snippet is required",
      });
    }

    const pageTitle = (code.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1]?.trim() || "";
    const h1 = (code.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]?.replace(/<[^>]+>/g, "").trim() || "";
    const effectiveRole = (targetRole || "").trim() || "Full Stack Developer";

    const portfolioProfile = {
      title: pageTitle || h1 || "Code Repository / Snippet",
      targetRole: effectiveRole,
      targetCompany: targetCompany || "",
      description: code.slice(0, 500),
      rawText: code.slice(0, 6000),
    };

    const analysis = await analyzePortfolioComprehensive(portfolioProfile, {
      targetRole: effectiveRole,
      targetCompany: targetCompany || "",
      inputType: "code",
    });

    return res.status(200).json({
      success: true,
      analysis: {
        ...analysis,
        sourceType: "code",
        rawHtml: code,
        portfolioTitle: portfolioProfile.title,
        atsScore: analysis.overallScore,
        summary: analysis.verdict,
        improvements: (analysis.contentSuggestions || []).map((s) => s.suggested),
      },
    });
  } catch (error) {
    console.error("[analyzeCode]", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// Fetch Raw HTML for Live In-Situ Preview
// =======================
export const fetchRawHtml = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ success: false, message: "URL is required" });
    }
    if (!isSafeUrlForScrape(url)) {
      return res.status(400).json({
        success: false,
        message: "Target URL cannot be a loopback, private subnet, or internal cloud metadata address.",
      });
    }
    const response = await axios.get(url, {
      timeout: 10000,
      maxContentLength: 5 * 1024 * 1024,
      maxBodyLength: 5 * 1024 * 1024,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    return res.status(200).json({ success: true, html: response.data });
  } catch (error) {
    console.error("[fetchRawHtml]", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

