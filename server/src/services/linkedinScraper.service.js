import axios from "axios";
import { extractAvatarUrl } from "./portfolioGenerator.service.js";

/**
 * Normalizes disparate LinkedIn scraper payloads from Apify and RapidAPI
 * into a single unified format compatible with PortfolioAI schemas.
 */
export const normalizeScrapedLinkedInData = (raw, provider = "unknown") => {
  if (!raw || typeof raw !== "object") return null;

  // Handle arrays if dataset returned an array of items
  const item = Array.isArray(raw) ? (raw[0] || {}) : raw;

  // 1. Name
  const fullName =
    (typeof item.fullName === "string" ? item.fullName : "") ||
    (typeof item.name === "string" ? item.name : "") ||
    [item.firstName, item.lastName].filter((s) => typeof s === "string" && s.trim()).join(" ") ||
    "";

  // 2. Headline / Target Role
  const headline =
    (typeof item.headline === "string" ? item.headline : "") ||
    (typeof item.jobTitle === "string" ? item.jobTitle : "") ||
    (typeof item.occupation === "string" ? item.occupation : "") ||
    (typeof item.sub_title === "string" ? item.sub_title : "") ||
    "";

  // 3. Summary / About
  const about =
    (typeof item.summary === "string" ? item.summary : "") ||
    (typeof item.about === "string" ? item.about : "") ||
    (typeof item.description === "string" ? item.description : "") ||
    "";

  // 4. Avatar photo
  const rawAvatar =
    item.profilePicture ||
    item.profilePictureUrl ||
    item.profile_pic_url ||
    item.pictureUrl ||
    item.photoUrl ||
    item.avatar ||
    item.photo ||
    item.picture ||
    item.displayPictureUrl ||
    item.img ||
    "";
  const avatar = extractAvatarUrl(rawAvatar);

  // 5. Work Experience
  const rawExperiences =
    item.experiences ||
    item.experience ||
    item.positions ||
    item.work_experience ||
    [];

  const experience = (Array.isArray(rawExperiences) ? rawExperiences : []).map((exp) => {
    const role = exp.position || exp.title || exp.role || "Professional";
    const company = exp.companyName || exp.company || exp.organization || "";
    
    let duration = "";
    if (exp.startDate?.text || exp.endDate?.text) {
      duration = `${exp.startDate?.text || ""} - ${exp.endDate?.text || "Present"}`.trim();
      if (exp.duration) duration += ` (${exp.duration})`;
    } else if (exp.duration) {
      duration = exp.duration;
    } else if (exp.startDate || exp.endDate) {
      const start = exp.startDate?.year ? `${exp.startDate.month ? exp.startDate.month + "/" : ""}${exp.startDate.year}` : (exp.startDate || "");
      const end = exp.endDate?.year ? `${exp.endDate.month ? exp.endDate.month + "/" : ""}${exp.endDate.year}` : (exp.isCurrent ? "Present" : (exp.endDate || "Present"));
      duration = `${start} - ${end}`.trim();
    } else if (exp.time_period) {
      duration = exp.time_period;
    }

    const description = exp.description || exp.summary || "";
    let highlights = [];
    if (Array.isArray(exp.highlights) && exp.highlights.length > 0) {
      highlights = exp.highlights;
    } else if (description) {
      highlights = description
        .split(/\n|•|\. /)
        .map((s) => s.trim())
        .filter((s) => s.length > 15)
        .slice(0, 4);
      if (highlights.length === 0) highlights = [description.slice(0, 200)];
    }

    return {
      role,
      company,
      duration: duration || "Recent",
      description: description ? description.slice(0, 400) : `${role} at ${company}.`,
      highlights: highlights.length > 0 ? highlights : [`Key contributor in ${role} responsibilities at ${company}.`],
    };
  }).filter((e) => e.company || e.role);

  // 6. Education
  const rawEducation =
    item.educations ||
    item.education ||
    item.schools ||
    [];

  const education = (Array.isArray(rawEducation) ? rawEducation : []).map((edu) => {
    const institution = edu.schoolName || edu.school || edu.institution || edu.university || "";
    const degree = edu.degree || edu.degreeName || "Degree";
    const field = edu.fieldOfStudy || "";
    const fullDegree = field && degree !== field && !degree.toLowerCase().includes(field.toLowerCase()) ? `${degree} in ${field}` : (degree || field || "Degree");

    let year = "";
    if (edu.period) {
      year = edu.period;
    } else if (edu.startDate?.text || edu.endDate?.text) {
      year = `${edu.startDate?.text || ""} - ${edu.endDate?.text || ""}`.trim();
    } else if (edu.endDate?.year) {
      year = String(edu.endDate.year);
    } else if (edu.dates) {
      year = edu.dates;
    }

    return {
      institution,
      degree: fullDegree,
      year: year || "",
    };
  }).filter((e) => e.institution);

  // 7. Skills
  const rawSkills = item.skills || item.top_skills || [];
  let skills = [];
  if (Array.isArray(rawSkills)) {
    skills = rawSkills.map((s) => (typeof s === "string" ? s : s.name || s.title || "")).filter(Boolean);
  } else if (typeof rawSkills === "string") {
    skills = rawSkills.split(/[,|•\n]/).map((s) => s.trim()).filter(Boolean);
  }

  // 8. Certifications
  const rawCerts = item.certifications || item.licenses || [];
  const certifications = (Array.isArray(rawCerts) ? rawCerts : []).map((c) => ({
    name: c.name || c.title || "",
    issuer: c.authority || c.issuer || c.organization || "",
    year: c.year || c.issueDate?.year || "",
  })).filter((c) => c.name);

  const headlineOrTopRole = headline && headline !== "--" ? headline : (experience[0]?.role ? `${experience[0].role} at ${experience[0].company}` : "");

  return {
    provider,
    name: fullName,
    title: headlineOrTopRole,
    about: about || (experience[0]?.role ? `Experienced ${experience[0].role} with a demonstrated history of leadership in ${experience[0].company}. Proven track record in ${skills.slice(0, 4).join(", ")}.` : ""),
    avatar,
    experience,
    education,
    skills,
    certifications,
    linkedin: item.url || item.linkedinUrl || item.linkedin_url || "",
  };
};

/**
 * Scrapes LinkedIn profile using Apify
 */
async function scrapeWithApify(url, token) {
  console.log(`[LinkedIn Scraper] Attempting Apify scrape for: ${url}`);
  const actorId = process.env.APIFY_LINKEDIN_ACTOR || "harvestapi~linkedin-profile-scraper";
  const endpoint = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${token}`;

  const res = await axios.post(
    endpoint,
    {
      urls: [url],
    },
    {
      timeout: 50000,
      headers: { "Content-Type": "application/json" },
      validateStatus: (s) => s < 500,
    }
  );

  if (res.status >= 200 && res.status < 300 && Array.isArray(res.data) && res.data.length > 0) {
    const normalized = normalizeScrapedLinkedInData(res.data[0], "apify");
    if (normalized && (normalized.name || normalized.experience.length > 0)) {
      return normalized;
    }
  }

  throw new Error(`Apify returned status ${res.status} with empty profile dataset`);
}

/**
 * Scrapes LinkedIn profile using RapidAPI
 */
async function scrapeWithRapidAPI(url, key) {
  console.log(`[LinkedIn Scraper] Attempting RapidAPI scrape for: ${url}`);
  const host = process.env.RAPIDAPI_LINKEDIN_HOST || "fresh-linkedin-profile-data.p.rapidapi.com";
  const endpoint = `https://${host}/get-profile`;

  const res = await axios.get(endpoint, {
    params: { linkedin_url: url },
    headers: {
      "x-rapidapi-key": key,
      "x-rapidapi-host": host,
    },
    timeout: 30000,
    validateStatus: (s) => s < 500,
  });

  if (res.status === 200 && res.data) {
    const raw = res.data.data || res.data;
    const normalized = normalizeScrapedLinkedInData(raw, "rapidapi");
    if (normalized && (normalized.name || normalized.experience.length > 0)) {
      return normalized;
    }
  }

  throw new Error(`RapidAPI returned status ${res.status}`);
}

/**
 * Unified Dual-Provider LinkedIn Scraper:
 * 1. Checks Apify (primary provider with 500-1000 free monthly profiles).
 * 2. If Apify fails, times out, or has no key, falls back to RapidAPI (50-100 free requests).
 * 3. Returns null if both fail or neither is configured.
 */
export async function scrapeLinkedInProfile(url) {
  if (!url || typeof url !== "string") return null;

  const apifyToken = process.env.APIFY_API_TOKEN?.trim();
  const rapidApiKey = process.env.RAPIDAPI_KEY?.trim();

  const errors = [];

  // Try Apify First
  if (apifyToken) {
    try {
      const data = await scrapeWithApify(url, apifyToken);
      if (data) {
        console.log(`[LinkedIn Scraper] Successfully extracted profile via Apify for ${data.name || url}`);
        return { success: true, provider: "apify", data };
      }
    } catch (err) {
      console.warn(`[LinkedIn Scraper] Apify attempt failed: ${err.message}`);
      errors.push({ provider: "apify", error: err.message });
    }
  }

  // Fallback to RapidAPI
  if (rapidApiKey) {
    try {
      const data = await scrapeWithRapidAPI(url, rapidApiKey);
      if (data) {
        console.log(`[LinkedIn Scraper] Successfully extracted profile via RapidAPI for ${data.name || url}`);
        return { success: true, provider: "rapidapi", data };
      }
    } catch (err) {
      console.warn(`[LinkedIn Scraper] RapidAPI attempt failed: ${err.message}`);
      errors.push({ provider: "rapidapi", error: err.message });
    }
  }

  return {
    success: false,
    hasKeysConfigured: Boolean(apifyToken || rapidApiKey),
    errors,
  };
}
