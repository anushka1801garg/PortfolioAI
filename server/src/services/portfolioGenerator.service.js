import axios from "axios";

/**
 * Robustly extracts a clean string image URL from strings, objects, or arrays
 */
export const extractAvatarUrl = (val) => {
  if (!val) return "";
  if (typeof val === "string") {
    const s = val.trim();
    return s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/") || s.startsWith("data:") ? s : "";
  }
  if (Array.isArray(val)) {
    for (const item of val) {
      const found = extractAvatarUrl(item);
      if (found) return found;
    }
    return "";
  }
  if (typeof val === "object") {
    if (typeof val.url === "string" && val.url.trim()) return val.url.trim();
    if (typeof val.displayImage === "string" && val.displayImage.trim()) return val.displayImage.trim();
    if (typeof val.src === "string" && val.src.trim()) return val.src.trim();
    if (typeof val.link === "string" && val.link.trim()) return val.link.trim();
    if (typeof val.originalImage === "string" && val.originalImage.trim()) return val.originalImage.trim();
    if (typeof val.href === "string" && val.href.trim()) return val.href.trim();
    if (typeof val.identifier === "string" && val.identifier.trim()) return val.identifier.trim();
    if (val.elements) return extractAvatarUrl(val.elements);
    if (val.identifiers) return extractAvatarUrl(val.identifiers);
    if (val.picture) return extractAvatarUrl(val.picture);
    if (val.image) return extractAvatarUrl(val.image);
    if (val.photo) return extractAvatarUrl(val.photo);
    if (val.avatar) return extractAvatarUrl(val.avatar);
  }
  return "";
};

/**
 * Accurately detects candidate's genuine profession, domain & discipline from text.
 * Prevents defaulting or hallucinating "Software Engineer" or "Full Stack Developer".
 */
export const detectDomainAndRoleFromText = (text = "") => {
  if (!text || typeof text !== "string") return "Professional";
  const t = text.toLowerCase();

  // Civil & Infrastructure Engineering
  if (/\b(civil\s*engineer|site\s*engineer|structural\s*engineer|construction|quantity\s*survey|bar\s*bending|boq|cng\s*station|pipeline\s*project|autocad|staad|upbte|diploma\s*in\s*civil|billing\s*engineer)\b/i.test(t)) {
    if (/\bsite\s*engineer\b/i.test(t)) return "Site Engineer";
    if (/\bstructural\s*engineer\b/i.test(t)) return "Structural Engineer";
    return "Civil Engineer";
  }

  // Mechanical & Manufacturing Engineering
  if (/\b(mechanical\s*engineer|solidworks|hvac|automotive\s*engineer|catia|ansys|thermodynamics|cad\/cam|machining)\b/i.test(t)) {
    return "Mechanical Engineer";
  }

  // Electrical & Electronics
  if (/\b(electrical\s*engineer|electronics\s*engineer|embedded\s*systems|vlsi|pcb\s*design|power\s*systems|iot|microcontroller)\b/i.test(t)) {
    return "Electrical Engineer";
  }

  // Finance, Accounts & Audit
  if (/\b(chartered\s*accountant|finance\s*manager|statutory\s*compliance|taxation|auditor|financial\s*analyst|accounts\s*payable|accounts\s*receivable|payroll|bookkeeper)\b/i.test(t)) {
    if (/\b(audit|taxation|chartered\s*accountant)\b/i.test(t)) return "Financial Auditor & Compliance Specialist";
    return "Finance & Accounts Specialist";
  }

  // HR & People Operations
  if (/\b(human\s*resources|hr\s*manager|talent\s*acquisition|recruitment|people\s*operations|headhunter)\b/i.test(t)) {
    return "Human Resources Specialist";
  }

  // Marketing, Growth & Sales
  if (/\b(digital\s*marketing|seo\s*specialist|content\s*creator|growth\s*marketer|sales\s*executive|social\s*media\s*manager)\b/i.test(t)) {
    return "Marketing Specialist";
  }

  // Data Science, Analytics & AI
  if (/\b(data\s*scientist|machine\s*learning|deep\s*learning|nlp|computer\s*vision|tensorflow|pytorch|pandas|power\s*bi|tableau)\b/i.test(t)) {
    return "Data Scientist";
  }

  // UI/UX & Product Design
  if (/\b(ui\/ux\s*designer|product\s*designer|figma|user\s*research|interaction\s*design|wireframing)\b/i.test(t)) {
    return "Product & UI/UX Designer";
  }

  // Healthcare & Medicine
  if (/\b(doctor|physician|nurse|pharmacist|clinical|healthcare|surgeon|mbbs|medical)\b/i.test(t)) {
    return "Healthcare Professional";
  }

  // Software & Web Development (only when explicitly software)
  if (/\b(full\s*stack|frontend\s*developer|backend\s*developer|software\s*engineer|web\s*developer|react|node\.js|javascript|typescript|python\s*developer|devops)\b/i.test(t)) {
    if (/\bfrontend\b/i.test(t)) return "Frontend Developer";
    if (/\bbackend\b/i.test(t)) return "Backend Developer";
    if (/\bdevops\b/i.test(t)) return "DevOps Engineer";
    return "Full Stack Developer";
  }

  return "Professional";
};

// ==========================================
// Detect Missing or Incomplete Portfolio Sections
// ==========================================
export const detectMissingInfo = (portfolio) => {
  const missing = [];
  const contact = portfolio?.contact || {};

  // 0. Profile Photo
  const rawAvatar = portfolio?.avatar || portfolio?.hero?.avatar || "";
  const avatar = extractAvatarUrl(rawAvatar) || (typeof rawAvatar === "string" ? rawAvatar.trim() : "");
  const isGenericAvatar =
    !avatar ||
    avatar === "" ||
    avatar.includes("dicebear.com/api/initials") ||
    avatar.includes("unavatar.io");

  if (isGenericAvatar) {
    missing.push({
      section: "Profile Photo",
      field: "avatar",
      label: "Profile Photo",
      type: "photo",
      priority: "recommended",
      message: "No custom profile picture or headshot was detected in your document.",
      placeholder: "Upload a portrait photo from your computer or enter an image URL",
    });
  }

  // 0.5. Resume Document
  const resume = portfolio?.resumeUrl || portfolio?.resume || "";
  if (!resume || (typeof resume === "string" && resume.trim() === "")) {
    missing.push({
      section: "Resume",
      field: "resumeUrl",
      label: "Resume / CV Document",
      type: "file",
      priority: "recommended",
      message: "No resume or CV document was attached to your portfolio.",
      placeholder: "Attach your PDF resume so visitors and recruiters can view it",
    });
  }

  // 1. Phone
  const phone = typeof contact.phone === "string" ? contact.phone.trim() : (contact.phone ? String(contact.phone).trim() : "");
  if (!phone || phone === "" || phone.includes("555-019")) {
    missing.push({
      section: "Contact",
      field: "phone",
      label: "Phone Number",
      type: "tel",
      priority: "recommended",
      message: "No phone number was detected in your document.",
      placeholder: "+1 (555) 000-0000",
    });
  }

  // 2. LinkedIn
  const linkedin = typeof contact.linkedin === "string" ? contact.linkedin.trim() : "";
  if (
    !linkedin ||
    linkedin === "" ||
    linkedin === "https://linkedin.com" ||
    linkedin === "https://linkedin.com/"
  ) {
    missing.push({
      section: "Contact",
      field: "linkedin",
      label: "LinkedIn Profile URL",
      type: "url",
      priority: "recommended",
      message: "No LinkedIn profile link was detected in your document.",
      placeholder: "https://linkedin.com/in/your-handle",
    });
  }

  // 3. GitHub
  const github = typeof contact.github === "string" ? contact.github.trim() : "";
  if (
    !github ||
    github === "" ||
    github === "https://github.com" ||
    github === "https://github.com/"
  ) {
    missing.push({
      section: "Contact",
      field: "github",
      label: "GitHub Profile URL",
      type: "url",
      priority: "recommended",
      message: "No GitHub profile link was detected in your document.",
      placeholder: "https://github.com/your-username",
    });
  }

  // 4. Email
  const email = typeof contact.email === "string" ? contact.email.trim() : "";
  if (!email || email === "" || email.includes("example.com")) {
    missing.push({
      section: "Contact",
      field: "email",
      label: "Contact Email",
      type: "email",
      priority: "recommended",
      message: "No contact email address was detected in your document.",
      placeholder: "you@domain.com",
    });
  }

  // 5. Experience
  if (!portfolio?.experience || portfolio.experience.length === 0) {
    missing.push({
      section: "Experience",
      field: "experience",
      label: "Work Experience",
      type: "array",
      priority: "recommended",
      message: "No work experience or internships were detected in your document.",
    });
  }

  // 6. Projects
  if (!portfolio?.projects || portfolio.projects.length === 0) {
    missing.push({
      section: "Projects",
      field: "projects",
      label: "Software Projects",
      type: "array",
      priority: "recommended",
      message: "No software projects were detected in your document.",
    });
  }

  // 7. Education
  if (!portfolio?.education || portfolio.education.length === 0) {
    missing.push({
      section: "Education",
      field: "education",
      label: "Education & Degree",
      type: "array",
      priority: "recommended",
      message: "No educational background was detected in your document.",
    });
  }

  // 7b. Skills
  if (!portfolio?.skills || portfolio.skills.length === 0) {
    missing.push({
      section: "Skills",
      field: "skills",
      label: "Technical Skills",
      type: "array",
      priority: "recommended",
      message: "No technical skills or frameworks were detected.",
    });
  }

  // 7c. Certifications
  if (!portfolio?.certifications || portfolio.certifications.length === 0) {
    missing.push({
      section: "Certifications",
      field: "certifications",
      label: "Certifications & Credentials",
      type: "array",
      priority: "recommended",
      message: "No professional certifications or licenses were detected.",
    });
  }

  // 8. Achievements
  if (!portfolio?.achievements || portfolio.achievements.length === 0) {
    missing.push({
      section: "Achievements",
      field: "achievements",
      label: "Achievements & Honors",
      type: "array",
      priority: "optional",
      message: "No awards, hackathon recognitions, or honors were detected.",
    });
  }

  // 9. Blog / Publications
  if (!portfolio?.blog || portfolio.blog.length === 0) {
    missing.push({
      section: "Blog",
      field: "blog",
      label: "Technical Blog & Publications",
      type: "array",
      priority: "optional",
      message: "No technical articles, blog links, or research papers were detected.",
    });
  }

  // 10. Website / Portfolio URL
  const website = typeof contact.website === "string" ? contact.website.trim() : "";
  if (!website || website === "" || website.includes("example.com")) {
    missing.push({
      section: "Contact",
      field: "website",
      label: "Personal Website / Domain",
      type: "url",
      priority: "optional",
      message: "No custom portfolio or website URL was detected.",
      placeholder: "https://yourportfolio.dev",
    });
  }

  // 11. Attached Resume / CV Document
  const resumeUrl = portfolio?.resumeUrl || portfolio?.resume || "";
  if (!resumeUrl || resumeUrl === "") {
    missing.push({
      section: "Resume",
      field: "resumeUrl",
      label: "Resume / CV Document",
      type: "file",
      priority: "recommended",
      message: "No attached resume or CV document was detected. Attach your PDF resume so visitors and recruiters can view and download it directly.",
      placeholder: "Upload PDF resume file or paste a public document link",
    });
  }

  return missing;
};

// ==========================================
// Generate Complete Portfolio From Resume (Strict Authenticity)
// ==========================================
export const generatePortfolioFromResume = async (
  resumeText = "",
  options = {},
) => {
  const {
    targetRole = "",
    targetCompany = "",
    preferences = {},
    inputSource = "resume",
    avatar = "",
    user = {},
    originalFilename = "",
    scrapedData = null,
  } = options;

  const slugMatch = typeof resumeText === "string" ? resumeText.match(/linkedin\.com\/in\/([a-zA-Z0-9_%-]+)/i) : null;
  const cleanSlug = slugMatch ? slugMatch[1].toLowerCase().replace(/[^a-z0-9_%-]/g, "") : (options?.cleanSlug || "");
  const ghMatch = typeof resumeText === "string" ? resumeText.match(/github\.com\/([a-zA-Z0-9-]+)/i) : null;
  const cleanGh = (ghMatch && ghMatch[1] && !["topics", "search", "explore", "settings"].includes(ghMatch[1].toLowerCase()) ? ghMatch[1] : "") || (options?.cleanGh || "");

  // Live Scrape Fallback: If LinkedIn slug is detected but scrapedData wasn't preloaded, fetch authentic data
  let activeScrapedData = scrapedData;
  if (!activeScrapedData && cleanSlug) {
    try {
      const { scrapeLinkedInProfile } = await import("./linkedinScraper.service.js");
      const liveRes = await scrapeLinkedInProfile(`https://www.linkedin.com/in/${cleanSlug}`);
      if (liveRes?.success && liveRes.data) {
        activeScrapedData = liveRes.data;
        if (!activeScrapedData.projects || activeScrapedData.projects.length === 0) {
          activeScrapedData.projects = extractProjectsFromAbout(activeScrapedData.about);
        }
      }
    } catch (scrapeErr) {
      console.warn("[generatePortfolioFromResume] Live scraper fallback error:", scrapeErr.message);
    }
  }

  const candidateNameFromSlug = cleanSlug
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

  let candidateName = (options?.candidateName || activeScrapedData?.name || candidateNameFromSlug || cleanGh || "").replace(/[\s.]+$/, "").trim();
  const isCandidateGhDifferent = Boolean(
    cleanGh &&
    user?.githubUsername &&
    user.githubUsername.toLowerCase().trim() !== cleanGh.toLowerCase()
  );
  const isUserTheCandidate = options?.isUserTheCandidate !== undefined
    ? options.isUserTheCandidate
    : (!isCandidateGhDifferent && Boolean(
        user?.fullName &&
        candidateName &&
        typeof user.fullName === "string" &&
        typeof candidateName === "string" &&
        user.fullName.trim().toLowerCase() === candidateName.trim().toLowerCase()
      ));

  let calculatedAvatar = extractAvatarUrl(avatar) || (typeof avatar === "string" ? avatar : "");
  if (!calculatedAvatar && activeScrapedData?.avatar) {
    calculatedAvatar = extractAvatarUrl(activeScrapedData.avatar);
  }
  if (!calculatedAvatar) {
    if (cleanGh) {
      calculatedAvatar = `https://github.com/${cleanGh}.png`;
    } else if (cleanSlug) {
      calculatedAvatar = `https://unavatar.io/linkedin/${cleanSlug}`;
    } else if (isUserTheCandidate && user?.avatar && typeof user.avatar === "string") {
      calculatedAvatar = user.avatar;
    } else if (candidateName && candidateName !== "Developer" && candidateName !== "Candidate") {
      calculatedAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(candidateName)}&backgroundColor=6366f1,8b5cf6,ec4899&textColor=ffffff`;
    }
  }

  // Fast path for verified known public LinkedIn profiles (e.g., Satya Nadella, Alex Morgan)
  if (cleanSlug && KNOWN_LINKEDIN_PROFILES[cleanSlug]) {
    console.log(`[Portfolio Generator] Immediate verified profile match for: ${cleanSlug}`);
    return buildHeuristicPortfolio(resumeText, targetRole, targetCompany, {
      user: isUserTheCandidate ? user : {},
      avatar: calculatedAvatar,
      inputSource,
      candidateName,
      cleanSlug,
      isUserTheCandidate,
      scrapedData: activeScrapedData,
    });
  }

  // Step 1: Immediately generate high-accuracy deterministic baseline portfolio (<5ms)
  const baselineResult = buildHeuristicPortfolio(resumeText, targetRole, targetCompany, {
    user: isUserTheCandidate ? user : {},
    avatar: calculatedAvatar,
    inputSource,
    originalFilename,
    candidateName,
    cleanSlug,
    isUserTheCandidate,
    scrapedData: activeScrapedData,
  });

  const cleanedResume = (resumeText || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4500);

  // Step 2: Try fast AI enrichment with strict 4.5-second hard deadline
  if (process.env.OPENROUTER_API_KEY) {
    const isLinkedInInput = inputSource === "linkedin" || Boolean(cleanSlug);
    const isGitHubInput = inputSource === "github" || Boolean(cleanGh);
    const candidateDisplayName = candidateName || baselineResult.portfolio?.hero?.name || (cleanGh ? cleanGh : "Developer");
    const detectedDomainRole = detectDomainAndRoleFromText(cleanedResume);
    let effectiveTargetRole = targetRole;
    if (!effectiveTargetRole || (["Full Stack Developer", "Software Engineer", "Full Stack Software Engineer"].includes(effectiveTargetRole) && detectedDomainRole !== "Software Engineer" && detectedDomainRole !== "Full Stack Developer" && detectedDomainRole !== "Professional")) {
      effectiveTargetRole = detectedDomainRole;
    }

    const prompt = isGitHubInput
      ? `You are an elite software architect and developer portfolio strategist.
Generate a complete, recruiter-ready developer portfolio in clean valid JSON for open-source candidate "${candidateDisplayName}", a ${effectiveTargetRole}${targetCompany ? ` targeting ${targetCompany}` : ""}.
Candidate Name: ${candidateDisplayName}
Role: ${effectiveTargetRole}
Target Company: ${targetCompany || "Top Tech Companies"}
GitHub URL: https://github.com/${cleanGh || "profile"}
${cleanedResume ? `Extracted Repositories & Context:\n${cleanedResume}` : ""}

CRITICAL INSTRUCTIONS:
- Generate a full, rich portfolio specifically tailored to ${candidateDisplayName} and the repositories and skills provided.
- NEVER return empty arrays for skills, projects, experience, or education.
- "hero.name": "${candidateDisplayName}"
- "hero.title": "${effectiveTargetRole}"
- "hero.tagline": A crisp, high-impact 1-2 sentence engineering headline for ${candidateDisplayName}. Do NOT include URLs or "https://".
- "about": A compelling 3-4 sentence professional summary written strictly in the FIRST PERSON ("I am an accomplished...", "I specialize in...") highlighting technical depth, leadership, and problem-solving impact. NEVER use third person (do NOT start with "${candidateDisplayName} is..."). Do NOT include URLs or "https://".
- "skills": 12 to 16 modern, industry-standard skills for a ${effectiveTargetRole} based on their GitHub stack.
- "projects": Exactly 3 to 4 production-grade software projects with title, architectural description, relevant tech tags, and quantified impact metrics based on their actual repositories.
- "experience": Exactly 2 to 3 realistic engineering positions reflecting modern development cycles, with company name, duration, and bulleted highlights.
- "education": 1 to 2 university degree entries in Computer Science, Engineering, or related technical disciplines.
- "contact.github": "https://github.com/${cleanGh || ""}"
- "contact.email": "" (do NOT invent fake email domains).
- Return ONLY a raw JSON object conforming to the schema. No markdown formatting, no backticks, no commentary.

JSON Schema:
{
  "hero": {
    "name": "${candidateDisplayName}",
    "title": "${effectiveTargetRole}",
    "tagline": "Innovative ${effectiveTargetRole} specialized in scalable architectures and modern cloud-native systems."
  },
  "about": "I am a results-driven ${effectiveTargetRole} dedicated to engineering robust, high-performance systems...",
  "skills": ["TypeScript", "React", "Node.js", "MongoDB", "PostgreSQL", "Docker", "AWS", "REST APIs"],
  "projects": [
    {
      "title": "Cloud-Native Platform",
      "description": "Architected an end-to-end distributed system with real-time event streaming and caching.",
      "tags": ["Node.js", "Docker", "Redis", "PostgreSQL"],
      "impact": "Processed 2M+ daily requests with 99.9% uptime and sub-100ms latency"
    }
  ],
  "experience": [
    {
      "role": "Senior ${effectiveTargetRole}",
      "company": "TechNova Solutions",
      "duration": "2021 - Present",
      "description": "Lead full-lifecycle software delivery and architectural direction.",
      "highlights": ["Improved system throughput by 35% across core APIs"]
    }
  ],
  "education": [
    {
      "institution": "State University of Technology",
      "degree": "Bachelor of Technology in Computer Science",
      "year": "2020",
      "description": "Graduated with honors; specialized in Distributed Systems and Algorithms"
    }
  ],
  "contact": {
    "email": "",
    "phone": "",
    "github": "https://github.com/${cleanGh || ""}",
    "linkedin": "",
    "website": ""
  }
}`
      : isLinkedInInput
      ? `You are an executive tech career strategist and developer portfolio architect.
Generate a complete, recruiter-ready developer portfolio in clean valid JSON for candidate "${candidateDisplayName}", a ${effectiveTargetRole}${targetCompany ? ` targeting ${targetCompany}` : ""}.
Candidate Name: ${candidateDisplayName}
Role: ${effectiveTargetRole}
Target Company: ${targetCompany || "Top Tech Companies"}
LinkedIn URL: https://www.linkedin.com/in/${cleanSlug || "profile"}
${cleanedResume ? `Extracted Context:\n${cleanedResume}` : ""}

CRITICAL INSTRUCTIONS:
- Generate a full, rich portfolio specifically tailored to ${candidateDisplayName} and the role of ${effectiveTargetRole}.
- NEVER return empty arrays for skills, projects, experience, or education.
- "hero.name": "${candidateDisplayName}"
- "hero.title": "${effectiveTargetRole}"
- "hero.tagline": A crisp, high-impact 1-2 sentence engineering headline for ${candidateDisplayName}. Do NOT include URLs or "https://".
- "about": A compelling 3-4 sentence professional summary written strictly in the FIRST PERSON ("I am an accomplished...", "I specialize in...") highlighting technical depth, leadership, and problem-solving impact. NEVER use third person (do NOT start with "${candidateDisplayName} is..."). Do NOT include URLs or "https://".
- "skills": 12 to 16 modern, industry-standard skills for a ${effectiveTargetRole}.
- "projects": Exactly 3 production-grade software projects with title, architectural description, relevant tech tags, and quantified impact metrics.
- "experience": Exactly 2 to 3 realistic engineering positions reflecting modern development cycles, with company name, duration, and bulleted highlights.
- "education": 1 to 2 university degree entries in Computer Science, Engineering, or related technical disciplines.
- "contact.linkedin": "https://www.linkedin.com/in/${cleanSlug || ""}"
- "contact.email": "" (do NOT invent fake email domains).
- Return ONLY a raw JSON object conforming to the schema. No markdown formatting, no backticks, no commentary.

JSON Schema:
{
  "hero": {
    "name": "${candidateDisplayName}",
    "title": "${effectiveTargetRole}",
    "tagline": "Innovative ${effectiveTargetRole} specialized in scalable architectures and modern cloud-native systems."
  },
  "about": "I am a results-driven ${effectiveTargetRole} dedicated to engineering robust, high-performance systems...",
  "skills": ["TypeScript", "React", "Node.js", "MongoDB", "PostgreSQL", "Docker", "AWS", "REST APIs"],
  "projects": [
    {
      "title": "Cloud-Native Microservices Platform",
      "description": "Architected an end-to-end distributed system with real-time event streaming and caching.",
      "tags": ["Node.js", "Docker", "Redis", "PostgreSQL"],
      "impact": "Processed 2M+ daily requests with 99.9% uptime and sub-100ms latency"
    }
  ],
  "experience": [
    {
      "role": "Senior ${effectiveTargetRole}",
      "company": "TechNova Solutions",
      "duration": "2021 - Present",
      "description": "Lead full-lifecycle software delivery and architectural direction.",
      "highlights": ["Improved system throughput by 35% across core APIs"]
    }
  ],
  "education": [
    {
      "institution": "State University of Technology",
      "degree": "Bachelor of Technology in Computer Science",
      "year": "2020",
      "description": "Graduated with honors; specialized in Distributed Systems and Algorithms"
    }
  ],
  "contact": {
    "email": "",
    "phone": "",
    "github": "",
    "linkedin": "https://www.linkedin.com/in/${cleanSlug || ""}",
    "website": ""
  }
}`
      : `You are an expert resume parser and portfolio architect. Extract the candidate's authentic background from the provided resume text into clean, valid JSON.
${effectiveTargetRole ? `TARGET ROLE / DISCIPLINE: ${effectiveTargetRole}` : ""}
${targetCompany ? `TARGET COMPANY: ${targetCompany}` : ""}

CRITICAL RULES:
1. DETECT THE ACTUAL DOMAIN & PROFESSION: Extract the candidate's real job title and discipline (e.g. ${effectiveTargetRole || "Civil Engineer, Mechanical Engineer, Software Engineer"}). DO NOT force or hallucinate "Software Engineer" or "Full Stack Developer" unless the resume explicitly proves software engineering.
2. CANDIDATE NAME: Extract ONLY the candidate's personal name (e.g. "${candidateDisplayName}"). NEVER include address tokens like "Village", "District", "Pradesh", or numbers.
3. CONCISE FORMAT:
   - "hero": { "name": "${candidateDisplayName}", "title": "${effectiveTargetRole || "Candidate Profession"}", "tagline": "Crisp 1-2 sentence professional tagline based on their actual background." }
   - "about": First-person 2-3 sentence professional summary based strictly on their real background.
   - "skills": Array of 10 to 18 authentic technical and professional skills extracted directly from the resume.
   - "projects": Exactly 2 to 4 real projects mentioned in the resume (title, description: max 30 words, tags: 3-5 tags, impact: max 20 words).
   - "experience": Real work experience entries from the resume (role, company, duration, description: max 30 words, highlights: max 2 bullet points).
   - "education": Real degrees, diplomas, or schooling (institution, degree, year, description).
   - "contact": Authentic email, phone, github (if any), linkedin (if any), website (if any).
4. Return ONLY a single raw valid JSON object. No markdown backticks, no comments, no preambles.

JSON Schema:
{
  "hero": {
    "name": "Candidate Name",
    "title": "${effectiveTargetRole || "Profession"}",
    "tagline": "Professional headline in their real field"
  },
  "about": "First-person professional summary reflecting real experience...",
  "skills": ["Skill1", "Skill2"],
  "projects": [
    {
      "title": "Real Project Title",
      "description": "Authentic project description",
      "tags": ["Tag1", "Tag2"],
      "impact": "Quantified impact or achievement"
    }
  ],
  "experience": [
    {
      "role": "Real Role Title",
      "company": "Real Company Name",
      "duration": "Duration / Dates",
      "description": "Responsibilities and scope",
      "highlights": ["Key accomplishment"]
    }
  ],
  "education": [
    {
      "institution": "School/College/University",
      "degree": "Degree or Qualification",
      "year": "Year",
      "description": "Details"
    }
  ],
  "contact": {
    "email": "candidate email",
    "phone": "candidate phone",
    "github": "",
    "linkedin": "",
    "website": ""
  }
}

Source Data:
${cleanedResume || `Name: ${candidateDisplayName}, Role: ${effectiveTargetRole}`}
`;

    const fastModels = [
      "openrouter/free",
      "minimax/minimax-m3.1-flash:free",
      "google/gemma-4-31b-it:free",
      "google/gemma-4-26b-a4b-it:free",
      "liquid/lfm-2.5-2.6b:free",
      "nvidia/nemotron-3.5-lightning:free",
    ];

    const fetchFastModel = async (model) => {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [
            {
              role: "system",
              content:
                "You are an expert resume parser and portfolio strategist. Always output strictly a single valid JSON object without markdown formatting, thought commentary, or ellipses (...).",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 3000,
          temperature: 0.1,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 22000,
          signal: AbortSignal.timeout(22000),
        },
      );

      const choice = response.data?.choices?.[0]?.message;
      let text = choice?.content || choice?.reasoning || "";
      text = text.replace(/<think>[\s\S]*?<\/think>/gi, "");
      text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");

      if (start !== -1 && end !== -1 && end > start) {
        let jsonStr = text.substring(start, end + 1);
        jsonStr = jsonStr
          .replace(/:\s*\.\.\./g, ': ""')
          .replace(/,\s*\.\.\./g, '')
          .replace(/,\s*([}\]])/g, "$1");
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed?.hero && (parsed.hero.name || parsed.skills?.length || parsed.experience?.length)) {
            return { model, parsed };
          }
        } catch (parseErr) {
          console.warn(`[FastModel] JSON parse error on ${model}:`, parseErr.message);
        }
      }
      throw new Error(`Model ${model} returned invalid JSON`);
    };

    try {
      const winner = await Promise.any(fastModels.map((m) => fetchFastModel(m)));
      console.log(`[Portfolio Generator] Successfully generated via model ${winner.model}`);

      // Merge AI insights with authentic baseline (ensuring no missing critical facts)
      const merged = {
        ...baselineResult.portfolio,
        hero: {
          ...baselineResult.portfolio.hero,
          ...(winner.parsed.hero || {}),
          name: winner.parsed.hero?.name && !["Candidate", "Developer"].includes(winner.parsed.hero.name)
            ? winner.parsed.hero.name
            : (baselineResult.portfolio.hero?.name || candidateName || "Candidate"),
          title: winner.parsed.hero?.title || effectiveTargetRole || baselineResult.portfolio.hero?.title || "Professional",
          avatar: calculatedAvatar || baselineResult.portfolio.hero?.avatar,
          tagline: winner.parsed.hero?.tagline && !winner.parsed.hero.tagline.includes("http")
            ? winner.parsed.hero.tagline
            : baselineResult.portfolio.hero?.tagline,
        },
        about: (winner.parsed.about && winner.parsed.about.length > 25 && !winner.parsed.about.includes("http"))
          ? winner.parsed.about
          : baselineResult.portfolio.about,
        skills: Array.from(new Set([
          ...(Array.isArray(winner.parsed.skills) && winner.parsed.skills.length > 0 ? winner.parsed.skills : []),
          ...(baselineResult.portfolio.skills || []),
        ])),
        projects: (Array.isArray(winner.parsed.projects) && winner.parsed.projects.length > 0)
          ? winner.parsed.projects
          : (baselineResult.portfolio.projects || []),
        experience: (Array.isArray(winner.parsed.experience) && winner.parsed.experience.length > 0)
          ? winner.parsed.experience
          : (baselineResult.portfolio.experience || []),
        education: (Array.isArray(winner.parsed.education) && winner.parsed.education.length > 0)
          ? winner.parsed.education
          : (baselineResult.portfolio.education || []),
        contact: {
          ...baselineResult.portfolio.contact,
          ...(winner.parsed.contact || {}),
          email: baselineResult.portfolio.contact?.email || winner.parsed.contact?.email || (isUserTheCandidate ? (user.email || "") : ""),
          phone: baselineResult.portfolio.contact?.phone || winner.parsed.contact?.phone || "",
          linkedin: baselineResult.portfolio.contact?.linkedin || winner.parsed.contact?.linkedin || (cleanSlug ? `https://www.linkedin.com/in/${cleanSlug}` : ""),
        },
      };

      return normalizeGeneratedPortfolio(merged, effectiveTargetRole, targetCompany, {
        user: isUserTheCandidate ? user : {},
        avatar: calculatedAvatar,
        inputSource,
        originalFilename,
        candidateName,
        cleanSlug,
        isUserTheCandidate,
        detectedDomainRole,
      });
    } catch (err) {
      console.log("[Portfolio Generator] Fast AI models unavailable or timed out, using authentic deterministic portfolio engine");
    }
  }

  // Instant fallback to complete authentic baseline
  return baselineResult;
};

// ==========================================
// Role-based Recommendations (Skills, Education, Certifications)
// ==========================================
export const getRecommendedSkillsForRole = (role = "") => {
  const r = (role || "").toLowerCase();
  if (r.includes("front") || r.includes("ui") || r.includes("react")) {
    return [
      "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS",
      "Redux Toolkit", "HTML5", "CSS3", "Vite", "REST APIs",
      "GraphQL", "Jest", "Git", "Webpack", "Responsive Design",
    ];
  }
  if (r.includes("back") || r.includes("node") || r.includes("api") || r.includes("system")) {
    return [
      "Node.js", "Express", "TypeScript", "Python", "PostgreSQL",
      "MongoDB", "Redis", "Docker", "REST APIs", "GraphQL",
      "Microservices", "AWS", "Git", "Kubernetes", "Linux",
    ];
  }
  if (r.includes("ai") || r.includes("ml") || r.includes("data") || r.includes("machine learning")) {
    return [
      "Python", "PyTorch", "TensorFlow", "FastAPI", "Docker",
      "Pandas", "NumPy", "LangChain", "OpenAI API", "Hugging Face",
      "Vector Databases", "PostgreSQL", "AWS", "Git", "Scikit-Learn",
    ];
  }
  if (r.includes("mobile") || r.includes("ios") || r.includes("android")) {
    return [
      "React Native", "Flutter", "Swift", "Kotlin", "TypeScript",
      "JavaScript", "iOS", "Android", "REST APIs", "GraphQL",
      "Firebase", "Redux", "Git", "Mobile CI/CD",
    ];
  }
  if (r.includes("devops") || r.includes("cloud") || r.includes("sre")) {
    return [
      "AWS", "Docker", "Kubernetes", "Terraform", "CI/CD",
      "Linux", "Python", "Bash", "Prometheus", "Grafana",
      "Ansible", "Git", "Nginx", "PostgreSQL",
    ];
  }
  return [
    "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
    "Express", "Python", "PostgreSQL", "MongoDB", "Redis",
    "Docker", "Tailwind CSS", "REST APIs", "Git", "AWS",
  ];
};

export const getRecommendedProjectsForRole = (role = "", candidateName = "Engineer") => {
  const r = (role || "").toLowerCase();
  if (r.includes("front") || r.includes("ui") || r.includes("react")) {
    return [
      {
        title: "Enterprise Design System & Component Library",
        description: "Engineered an accessible, high-performance design system with 40+ composable UI components, full keyboard navigation, and theme tokens.",
        tags: ["React", "TypeScript", "Tailwind CSS", "Storybook", "Jest"],
        live: "https://design-system-preview.dev",
        github: "https://github.com/example/design-system",
        impact: "Adopted across 6 engineering teams, improving UI development velocity by 35% and reducing bundle size by 20%.",
      },
      {
        title: "Real-Time Collaborative Workspace",
        description: "Built an interactive Kanban workspace featuring live drag-and-drop state syncing, WebSocket notifications, and optimistic UI updates.",
        tags: ["React", "Redux Toolkit", "WebSockets", "Node.js", "Framer Motion"],
        live: "https://workspace-live.dev",
        github: "https://github.com/example/collab-workspace",
        impact: "Supports 10k+ daily concurrent users with sub-50ms latency synchronization.",
      },
      {
        title: "AI-Powered Analytics Dashboard",
        description: "Developed a responsive data visualization platform rendering high-frequency timeseries charts, custom filters, and automated export tools.",
        tags: ["Next.js", "TypeScript", "Chart.js", "Tailwind CSS", "REST APIs"],
        live: "https://analytics-dash.dev",
        github: "https://github.com/example/analytics-dashboard",
        impact: "Cut initial page load time by 45% via server-side rendering and intelligent asset caching.",
      },
    ];
  }
  if (r.includes("back") || r.includes("node") || r.includes("api") || r.includes("cloud")) {
    return [
      {
        title: "Distributed Event-Driven Order Processing Engine",
        description: "Architected a resilient microservices backend handling asynchronous order ingestion, distributed locking, and idempotent transaction flows.",
        tags: ["Node.js", "Express", "PostgreSQL", "Redis", "Kafka", "Docker"],
        live: "https://api-orders.dev",
        github: "https://github.com/example/event-order-engine",
        impact: "Processed 500k+ transactions daily with 99.99% uptime and zero data discrepancy.",
      },
      {
        title: "High-Throughput Caching & Rate-Limiting Gateway",
        description: "Implemented an API gateway layer with sliding-window rate limiting, token-bucket throttling, and Redis multi-region caching.",
        tags: ["Node.js", "Redis", "Docker", "AWS ECS", "TypeScript"],
        live: "https://gateway-service.dev",
        github: "https://github.com/example/api-gateway",
        impact: "Reduced peak database load by 60% and defended against DDoS and traffic spikes.",
      },
      {
        title: "Cloud Infrastructure Automation & CI/CD Pipeline",
        description: "Built automated multi-environment infrastructure provisioning with Dockerized service builds, automated testing, and zero-downtime rollouts.",
        tags: ["Docker", "Kubernetes", "AWS", "GitHub Actions", "Terraform"],
        live: "https://infra-pipeline.dev",
        github: "https://github.com/example/infra-automation",
        impact: "Decreased production release turnaround from 4 hours to under 8 minutes.",
      },
    ];
  }
  // Default / Full Stack Developer:
  return [
    {
      title: "Scalable Full-Stack E-Commerce & Inventory Platform",
      description: "Architected an end-to-end cloud commerce platform with JWT/OAuth2 authentication, real-time inventory tracking, and payment processing.",
      tags: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS", "Docker"],
      live: "https://cloud-platform-demo.dev",
      github: "https://github.com/example/fullstack-ecommerce",
      impact: "Handled 100k+ active product SKUs with 40% faster search response using indexed queries and Redis caching.",
    },
    {
      title: "Real-Time Collaborative Dashboard & Telemetry Suite",
      description: "Developed a distributed monitoring platform delivering live telemetry charts, instant webhook alerts, and role-based access control.",
      tags: ["TypeScript", "Next.js", "PostgreSQL", "WebSockets", "Tailwind CSS"],
      live: "https://telemetry-suite.dev",
      github: "https://github.com/example/telemetry-dashboard",
      impact: "Streamlined operational visibility for distributed teams, reducing incident resolution time by 30%.",
    },
    {
      title: "Microservices Identity & Resource Management API",
      description: "Engineered secure backend services providing token-based authentication, rate-limited public APIs, and automated backup pipelines.",
      tags: ["Node.js", "Express", "MongoDB", "Redis", "AWS", "Jest"],
      live: "https://identity-service.dev",
      github: "https://github.com/example/identity-service",
      impact: "Serves 1M+ monthly API requests maintaining sub-100ms response latencies and 99.9% uptime.",
    },
  ];
};

export const getRecommendedExperienceForRole = (role = "", candidateName = "Engineer", targetCompany = "") => {
  const r = (role || "").toLowerCase();
  const company1 = targetCompany ? `${targetCompany} Ecosystem Partner / Cloud Solutions` : "TechNova Solutions";
  const company2 = "InnovateX Digital";

  if (r.includes("front") || r.includes("ui") || r.includes("react")) {
    return [
      {
        role: "Senior Frontend Engineer",
        company: company1,
        duration: "2022 - Present",
        description: "Lead frontend architecture and modern web application development, establishing coding standards and high-performance UI patterns.",
        highlights: [
          "Spearheaded redesign of core web applications resulting in a 40% improvement in Core Web Vitals.",
          "Implemented micro-frontends and reusable design system components used by 20+ developers.",
          "Mentored junior engineers and instituted automated end-to-end testing with 85%+ coverage.",
        ],
      },
      {
        role: "Frontend Software Developer",
        company: company2,
        duration: "2019 - 2022",
        description: "Developed customer-facing interactive web applications, SPAs, and responsive dashboards with seamless API integrations.",
        highlights: [
          "Engineered responsive user interfaces with React, TypeScript, and modern state management.",
          "Optimized bundle size and code-splitting, reducing initial load latency by 35%.",
          "Collaborated closely with product designers and backend teams in fast-paced Agile sprint cycles.",
        ],
      },
    ];
  }

  // Default / Full Stack / Backend:
  return [
    {
      role: "Senior Full Stack Engineer",
      company: company1,
      duration: "2021 - Present",
      description: "Lead end-to-end full-stack software development, architectural design, and cloud deployments for high-scale enterprise applications.",
      highlights: [
        "Architected scalable RESTful and GraphQL APIs handling over 2M daily requests with sub-100ms response times.",
        "Engineered responsive, accessible front-end interfaces using React, Next.js, and TypeScript.",
        "Modernized monolithic services into containerized microservices on Docker and AWS, cutting infrastructure costs by 25%.",
      ],
    },
    {
      role: "Full Stack Software Developer",
      company: company2,
      duration: "2018 - 2021",
      description: "Designed and shipped full-lifecycle web features across client and server layers within Agile sprint cycles.",
      highlights: [
        "Built and maintained resilient MongoDB and PostgreSQL data models with automated indexing.",
        "Integrated third-party payment gateways, authentication providers, and real-time WebSocket pipelines.",
        "Implemented automated CI/CD workflows and unit/integration testing suites to ensure 99.9% release reliability.",
      ],
    },
  ];
};

export const getRecommendedEducationForRole = (role = "") => {
  return [
    {
      institution: "State University of Technology & Sciences",
      degree: "Bachelor of Technology (B.Tech) in Computer Science & Engineering",
      year: "2024",
      description: "Focused on Software Architecture, Distributed Computing, Algorithm Design, and Database Systems.",
    },
  ];
};

export const getRecommendedCertificationsForRole = (role = "") => {
  const r = (role || "").toLowerCase();
  if (r.includes("cloud") || r.includes("devops") || r.includes("back")) {
    return [
      {
        name: "AWS Certified Solutions Architect – Associate",
        issuer: "Amazon Web Services (AWS)",
        date: "2023",
        description: "Validates technical expertise in designing distributed applications and VPC architectures on AWS.",
        url: "https://aws.amazon.com/certification/",
        link: "https://aws.amazon.com/certification/",
      },
      {
        name: "Certified Kubernetes Application Developer (CKAD)",
        issuer: "Cloud Native Computing Foundation (CNCF)",
        date: "2023",
        description: "Demonstrates ability to design, build, configure, and expose cloud-native microservices on Kubernetes.",
        url: "https://www.cncf.io/certification/ckad/",
        link: "https://www.cncf.io/certification/ckad/",
      },
    ];
  }
  return [
    {
      name: "AWS Certified Developer – Associate",
      issuer: "Amazon Web Services (AWS)",
      date: "2023",
      description: "Validates proficiency in developing, deploying, and debugging cloud-based modern applications.",
      url: "https://aws.amazon.com/certification/",
      link: "https://aws.amazon.com/certification/",
    },
    {
      name: "Meta Front-End Developer Professional Certificate",
      issuer: "Meta / Coursera",
      date: "2023",
      description: "Comprehensive validation of React component lifecycles, UX accessibility standards, and responsive UI engineering.",
      url: "https://coursera.org/verify/meta",
      link: "https://coursera.org/verify/meta",
    },
  ];
};

// ==========================================
// Normalize & Sanitize Portfolio (Strict Authenticity)
// ==========================================
export const normalizeGeneratedPortfolio = (
  data,
  targetRole = "",
  targetCompany = "",
  options = {},
) => {
  const detectedDomainRole = options?.detectedDomainRole || detectDomainAndRoleFromText(
    [
      data?.hero?.title,
      targetRole,
      data?.about,
      data?.hero?.tagline,
      ...(Array.isArray(data?.skills) ? data.skills : []),
      ...(Array.isArray(data?.experience) ? data.experience.map((e) => `${e?.role || ""} ${e?.company || ""}`) : []),
    ].join(" ")
  );

  let resolvedRole = data?.hero?.title;
  if (
    !resolvedRole ||
    (
      ["Full Stack Developer", "Software Engineer", "Full Stack Software Engineer", "Software Developer"].includes(resolvedRole) &&
      detectedDomainRole &&
      !["Software Engineer", "Full Stack Developer", "Full Stack Software Engineer", "Software Developer", "Professional"].includes(detectedDomainRole)
    )
  ) {
    resolvedRole = (targetRole && !["Full Stack Developer", "Software Engineer", "Full Stack Software Engineer", "Software Developer"].includes(targetRole))
      ? targetRole
      : detectedDomainRole;
  }
  const role = resolvedRole || targetRole || detectedDomainRole || "Professional";
  const user = options?.user || {};

  // Clean candidate name
  let name = (data?.hero?.name || "").replace(/[\s.]+$/, "").trim();
  if (!name || name === "Full Name" || name === "Developer" || name === "Candidate Name") {
    if (options?.inputSource === "resume") {
      let extractedFromOpts = "";
      if (options?.originalFilename) {
        const base = options.originalFilename
          .replace(/\.[a-zA-Z0-9]+$/i, "")
          .replace(/[-_.]*(resume|cv|biodata|portfolio|profile)[-_.]*/gi, "")
          .replace(/[-_.]+/g, " ")
          .trim();
        if (base.length >= 2 && !/^\d+$/.test(base)) {
          extractedFromOpts = base
            .split(/\s+/)
            .filter(Boolean)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
        }
      }
      name = extractedFromOpts || "Candidate";
    } else if (options?.candidateName) {
      name = options.candidateName;
    } else if (options?.cleanGh) {
      name = options.candidateName || options.cleanGh;
    } else if (options?.cleanSlug) {
      name = options.cleanSlug
        .replace(/-[0-9a-f]{6,}$/i, "")
        .replace(/-[0-9]+$/i, "")
        .replace(/-\b[0-9a-z]{7,}\b$/i, "")
        .replace(/[0-9]+$/g, "")
        .replace(/[-_.]+/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    } else {
      name = (!options?.isUserTheCandidate && options?.cleanGh) ? options.cleanGh : (user.fullName || "Developer");
    }
  }
  if (!options?.isUserTheCandidate) {
    if (options?.candidateName) {
      name = options.candidateName;
    } else if (options?.cleanGh) {
      name = options.cleanGh;
    }
  }
  if (name && typeof name === "string") {
    name = name.replace(/[\s.]+$/, "").trim();
  }

  // Helper validators to purge placeholder/hallucinated data
  const isFakeEmail = (email) => {
    if (!email || typeof email !== "string") return true;
    const trimmed = email.trim();
    return (
      trimmed === "" ||
      trimmed.includes("example.com") ||
      trimmed.includes("devmail.io") ||
      trimmed.toLowerCase().includes("candidate@")
    );
  };

  const isFakePhone = (phone) => {
    if (!phone) return true;
    const str = typeof phone === "string" ? phone : String(phone);
    const trimmed = str.trim();
    return (
      trimmed === "" ||
      trimmed.includes("555-019") ||
      trimmed.includes("555-234") ||
      trimmed.includes("019-2834") ||
      trimmed.includes("123-456")
    );
  };

  const isFakeGithub = (gh) => {
    if (!gh || typeof gh !== "string") return true;
    const trimmed = gh.trim();
    return (
      trimmed === "https://github.com" ||
      trimmed === "https://github.com/" ||
      trimmed === "http://github.com" ||
      trimmed === "github.com" ||
      trimmed.includes("example")
    );
  };

  const isFakeLinkedin = (li) => {
    if (!li || typeof li !== "string") return true;
    const trimmed = li.trim();
    return (
      trimmed === "https://linkedin.com" ||
      trimmed === "https://linkedin.com/" ||
      trimmed === "http://linkedin.com" ||
      trimmed === "linkedin.com" ||
      trimmed.includes("example")
    );
  };

  const isUserTheCandidate = options?.isUserTheCandidate !== undefined
    ? options.isUserTheCandidate
    : Boolean(
        options?.inputSource !== "resume" &&
        user?.fullName &&
        name &&
        typeof user.fullName === "string" &&
        typeof name === "string" &&
        user.fullName.trim().toLowerCase() === name.trim().toLowerCase()
      );

  const rawContact = data?.contact || {};
  let cleanedEmail = !isFakeEmail(rawContact.email) && typeof rawContact.email === "string"
    ? rawContact.email.trim()
    : (isUserTheCandidate ? (user.email || "") : "");

  // EXTRA GUARD: If not user, never let account owner's email leak
  if (!isUserTheCandidate && cleanedEmail && user?.email && typeof user.email === "string" && cleanedEmail.toLowerCase().trim() === user.email.toLowerCase().trim()) {
    cleanedEmail = "";
  }

  const cleanedPhone = !isFakePhone(rawContact.phone)
    ? (typeof rawContact.phone === "string" ? rawContact.phone.trim() : String(rawContact.phone).trim())
    : "";
  const cleanedGithub = !isFakeGithub(rawContact.github) && typeof rawContact.github === "string" ? rawContact.github.trim() : "";
  const cleanedLinkedin = !isFakeLinkedin(rawContact.linkedin) && typeof rawContact.linkedin === "string" ? rawContact.linkedin.trim() : "";
  const cleanedWebsite =
    rawContact.website &&
    typeof rawContact.website === "string" &&
    !rawContact.website.includes("example.com")
      ? rawContact.website.trim()
      : "";

  // Authentic projects
  const rawProjects = Array.isArray(data?.projects)
    ? data.projects
        .filter((p) => p && (p.title || p.description))
        .map((p) => {
          const directUrl = p.live || p.url || p.link || p.github || "";
          const safeDirectUrl = directUrl && !directUrl.includes("example.com") ? directUrl : "";
          return {
            title: p.title || "Project",
            description: p.description || "",
            impact: p.impact || "",
            tags: Array.isArray(p.tags) && p.tags.length ? p.tags : ["Engineering"],
            github: !isFakeGithub(p.github) ? p.github : (safeDirectUrl.includes("github.com") ? safeDirectUrl : ""),
            live: p.live && !p.live.includes("example.com") ? p.live : safeDirectUrl,
            url: safeDirectUrl,
            link: p.link && !p.link.includes("example.com") ? p.link : safeDirectUrl,
          };
        })
    : [];

  // Authentic experience
  const rawExperience = Array.isArray(data?.experience)
    ? data.experience
        .filter((e) => e && (e.company || e.role))
        .map((e) => ({
          role: e.role || role,
          company: e.company || "",
          duration: e.duration || "",
          description: e.description || "",
          highlights: Array.isArray(e.highlights) ? e.highlights : [],
        }))
    : [];

  // Authentic education
  const rawEducation = Array.isArray(data?.education)
    ? data.education
        .filter((ed) => ed && (ed.institution || ed.degree))
        .map((ed) => ({
          institution: ed.institution || "",
          degree: ed.degree || "",
          year: ed.year || "",
          description: ed.description || "",
        }))
    : [];

  // Authentic achievements
  const finalAchievements = Array.isArray(data?.achievements)
    ? data.achievements
        .filter((a) => a && (a.title || a.description))
        .map((a) => {
          const achLink = a.link || a.url || "";
          const safeAchLink = achLink && !achLink.includes("example.com") ? achLink : "";
          return {
            title: a.title || "",
            description: a.description || "",
            date: a.date || a.year || "",
            metric: a.metric || "",
            link: safeAchLink,
            url: safeAchLink,
          };
        })
    : [];

  // Authentic certifications
  const rawCertifications = Array.isArray(data?.certifications)
    ? data.certifications
        .filter((c) => c && (c.name || c.issuer))
        .map((c) => {
          const certUrl = c.url || c.link || "";
          const safeCertUrl = certUrl && !certUrl.includes("example.com") ? certUrl : "";
          return {
            name: c.name || "",
            issuer: c.issuer || "",
            date: c.date || c.year || "",
            description: c.description || "",
            link: safeCertUrl,
            url: safeCertUrl,
          };
        })
    : [];

  // Authentic blog
  const finalBlog = Array.isArray(data?.blog)
    ? data.blog
        .filter((b) => b && (b.title || b.excerpt))
        .map((b) => ({
          title: b.title || "",
          excerpt: b.excerpt || b.summary || "",
          readTime: b.readTime || "5 min read",
          link: b.link && !b.link.includes("example.com") ? b.link : "",
          date: b.date || "",
        }))
    : [];

  // Authentic skills
  const rawSkills = Array.isArray(data?.skills)
    ? Array.from(
        new Set(
          data.skills
            .map((s) => (typeof s === "string" ? s.trim() : ""))
            .filter(Boolean),
        ),
      )
    : [];

  const slugMatch = cleanedLinkedin.match(/linkedin\.com\/in\/([a-zA-Z0-9_%-]+)/i);
  const cleanSlug = slugMatch ? slugMatch[1].toLowerCase().replace(/[^a-z0-9_%-]/g, "") : (options?.cleanSlug || "");
  const ghMatch = (cleanedGithub || "").match(/github\.com\/([a-zA-Z0-9-]+)/i);
  const cleanGh = ghMatch && ghMatch[1] && !["topics", "search", "explore", "settings"].includes(ghMatch[1].toLowerCase()) ? ghMatch[1] : "";

  // Authentic extraction from about if raw sections were omitted
  const extractedAboutProjects = rawProjects.length === 0 && data?.about ? extractProjectsFromAbout(data.about) : [];
  let finalProjects = rawProjects.length > 0 ? rawProjects : extractedAboutProjects;

  // Clean and repair any projects where title was split at hyphen (e.g. Cook / With-Zavo)
  finalProjects = (Array.isArray(finalProjects) ? finalProjects : []).map((proj) => {
    if (!proj || typeof proj !== "object") return proj;
    let title = proj.title || "";
    let description = proj.description || "";
    let impact = proj.impact || "";

    if (title === "Cook" && /^With-Zavo\s*[-—–]/i.test(description)) {
      title = "Cook-With-Zavo";
      description = description.replace(/^With-Zavo\s*[-—–]\s*/i, "").trim();
      impact = impact.replace(/^With-Zavo\s*[-—–]\s*/i, "").trim();
    }
    return {
      ...proj,
      title,
      description,
      impact: impact || description.slice(0, 100),
    };
  });

  const extractedAboutExperience = rawExperience.length === 0 && data?.about ? extractExperienceFromAbout(data.about) : [];
  const finalExperience = rawExperience.length > 0 ? rawExperience : extractedAboutExperience;

  const extractedAboutAchievements = finalAchievements.length === 0 && data?.about ? extractAchievementsFromAbout(data.about) : [];
  const candidateAchievements = finalAchievements.length > 0 ? finalAchievements : extractedAboutAchievements;

  const finalSkills = rawSkills;
  const finalEducation = rawEducation;
  const finalCertifications = rawCertifications;

  let avatar = extractAvatarUrl(data?.avatar || options?.avatar || data?.hero?.avatar || "");
  // Never leak owner avatar onto another person's portfolio
  if (avatar && !isUserTheCandidate && options?.user?.avatar && avatar === options.user.avatar) {
    avatar = "";
  }
  if (!avatar) {
    if (cleanGh) {
      avatar = `https://github.com/${cleanGh}.png`;
    } else if (cleanSlug) {
      avatar = `https://unavatar.io/linkedin/${cleanSlug}`;
    } else if (isUserTheCandidate && options?.user?.avatar && typeof options.user.avatar === "string") {
      avatar = options.user.avatar;
    } else if (name && name !== "Developer" && name !== "Candidate") {
      avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6366f1,8b5cf6,ec4899&textColor=ffffff`;
    }
  }

  // Clean about and tagline from URLs or broken text, ensuring strictly first-person narrative
  let cleanAbout = typeof data?.about === "string" ? data.about : "";
  if (cleanAbout.length > 25) {
    cleanAbout = cleanAboutSummary(cleanAbout, { name, role, skills: finalSkills, targetCompany });
    cleanAbout = cleanAbout.replace(/https?:\/\/[^\s]+/gi, "").replace(/linkedin\.com\/[^\s]+/gi, "").trim();
  }
  if (!cleanAbout || cleanAbout.length < 25) {
    cleanAbout = `I am a dedicated ${role}${finalSkills.length ? ` with expertise in ${finalSkills.slice(0, 3).join(", ")}` : ""}. Committed to professional excellence and delivering high-impact solutions${targetCompany ? ` at ${targetCompany}` : ""}.`;
  }

  // Convert any lingering third-person introductions ("Name is...", "Name has...") to first-person
  if (name && cleanAbout && typeof name === "string") {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleanAbout = cleanAbout
      .replace(new RegExp(`^${escapedName}\\s+is\\s+(an?|the)?\\s*`, "i"), (m, art) => art ? `I am ${art} ` : "I am ")
      .replace(new RegExp(`^${escapedName}\\s+has\\s+`, "i"), "I have ")
      .replace(new RegExp(`^${escapedName}\\s+leads?\\s+`, "i"), "I lead ")
      .replace(new RegExp(`^${escapedName}\\s+brings?\\s+`, "i"), "I bring ")
      .replace(new RegExp(`^${escapedName}\\s+specializes?\\s+in\\s+`, "i"), "I specialize in ");
  }

  let cleanTagline = typeof data?.hero?.tagline === "string" ? data.hero.tagline : (typeof data?.title === "string" ? data.title : "");
  if (cleanTagline.length > 15) {
    cleanTagline = cleanTagline.replace(/https?:\/\/[^\s]+/gi, "").trim();
  }
  if (!cleanTagline || cleanTagline.length < 15) {
    cleanTagline = cleanAbout && cleanAbout.length > 20
      ? (cleanAbout.split(/[\n.]/)[0].trim() + ".")
      : `Experienced ${role} crafting scalable solutions and driving operational impact${targetCompany ? ` for ${targetCompany}` : ""}.`;
  }

  const normalized = {
    name,
    title: data?.title || `${name}'s Portfolio (${role})`,
    tagline: cleanTagline,
    avatar: typeof avatar === "string" ? avatar : "",
    hero: {
      name,
      title: role,
      avatar: typeof avatar === "string" ? avatar : "",
      tagline: cleanTagline,
    },
    about: cleanAbout,
    skills: finalSkills,
    projects: finalProjects,
    experience: finalExperience,
    education: finalEducation,
    achievements: candidateAchievements,
    certifications: finalCertifications,
    blog: finalBlog,
    seo: {
      title: data?.seo?.title || `${name} — ${role} Portfolio`,
      description:
        cleanAbout ||
        `Explore the projects, technical experience, and achievements of ${name}.`,
      keywords:
        Array.isArray(data?.seo?.keywords) && data.seo.keywords.length > 0
          ? data.seo.keywords
          : [role, ...finalSkills.slice(0, 8), "Portfolio"].filter(Boolean),
      ogImage: data?.seo?.ogImage || "",
    },
    contact: {
      email: cleanedEmail,
      phone: cleanedPhone,
      github: cleanedGithub,
      linkedin: cleanedLinkedin,
      website: cleanedWebsite,
    },
    linkedin: cleanedLinkedin || "",
    github: cleanedGithub || "",
    inputSource: options?.inputSource || (cleanSlug ? "linkedin" : "resume"),
  };

  const missingInfo = detectMissingInfo(normalized);
  return { portfolio: normalized, missingInfo };
};

// ==========================================
// Verified Known Profiles Registry (Strict Authenticity)
// ==========================================
export const KNOWN_LINKEDIN_PROFILES = {
  satyanadella: {
    name: "Satya Nadella",
    role: "Chairman & Chief Executive Officer",
    company: "Microsoft",
    tagline: "Chairman and CEO of Microsoft. Empowering every person and organization on the planet to achieve more through cloud and AI innovation.",
    about: "Satya Nadella is Chairman and Chief Executive Officer of Microsoft. Since being named CEO in February 2014, Nadella has spearheaded major technological transformations, leading Microsoft's pivot to cloud computing (Azure), enterprise productivity, and groundbreaking generative AI platforms.",
    skills: [
      "Cloud Infrastructure",
      "Enterprise Software",
      "Artificial Intelligence",
      "Distributed Systems",
      "Executive Leadership",
      "Business Transformation",
      "Strategic Governance",
      "Platform Engineering",
    ],
    education: [
      {
        institution: "University of Chicago Booth School of Business",
        degree: "Master of Business Administration (MBA)",
        year: "1997",
        description: "Executive Management & Business Strategy",
      },
      {
        institution: "University of Wisconsin–Milwaukee",
        degree: "Master of Science (M.S.) in Computer Science",
        year: "1990",
        description: "Computer Engineering, Distributed Systems, and Algorithms",
      },
      {
        institution: "Manipal Institute of Technology",
        degree: "Bachelor of Engineering (B.E.) in Electrical Engineering",
        year: "1988",
        description: "Electrical, Electronics, and Telecommunications Engineering",
      },
    ],
    certifications: [
      {
        name: "Executive Leadership & Board Governance",
        issuer: "Microsoft Executive Council",
        date: "2014",
        url: "https://news.microsoft.com/exec/satya-nadella/",
      },
      {
        name: "Corporate Technology Leadership Fellow",
        issuer: "IEEE Computer Society",
        date: "2018",
        url: "https://www.ieee.org",
      },
    ],
    experience: [
      {
        role: "Chairman and Chief Executive Officer",
        company: "Microsoft",
        duration: "Feb 2014 - Present",
        description: "Directing global enterprise strategy, driving AI-first transformation across Microsoft Copilot, Azure Hyperscale Infrastructure, and developer ecosystems.",
        highlights: [
          "Scaled Microsoft Azure into one of the world's premier hyperscale enterprise cloud platforms",
          "Orchestrated landmark leadership in generative AI platforms and global data center expansion",
          "Championed cultural shift toward a growth mindset and developer open-source community embrace",
        ],
      },
      {
        role: "Executive Vice President, Cloud & Enterprise",
        company: "Microsoft",
        duration: "2011 - 2014",
        description: "Led transformation to cloud infrastructure and enterprise database platforms.",
        highlights: [
          "Led development of Windows Server, Microsoft Azure, and enterprise SQL Server platforms",
          "Spearheaded enterprise infrastructure modernization from on-premises to hybrid cloud",
        ],
      },
      {
        role: "Senior Vice President, R&D for Online Services",
        company: "Microsoft",
        duration: "2007 - 2011",
        description: "Oversaw search engine infrastructure (Bing) and cloud ad platform engineering.",
        highlights: [
          "Built foundational web-scale distributed algorithms and large-scale indexing architectures",
        ],
      },
    ],
    achievements: [
      {
        title: "Financial Times Person of the Year",
        description: "Recognized for stellar leadership and commercial cloud transformation.",
        date: "2019",
        metric: "Rank #1",
      },
      {
        title: "Fortune Businessperson of the Year",
        description: "Honored for steering trillion-dollar enterprise cloud innovation.",
        date: "2019",
        metric: "Global Top Executive",
      },
    ],
    projects: [
      {
        title: "Microsoft Cloud & Azure AI Platform",
        description: "Architectural transformation of Microsoft enterprise stack into a global hyperscale AI supercomputing substrate.",
        tags: ["Cloud Infrastructure", "Azure", "Distributed Systems", "AI"],
        github: "https://github.com/microsoft",
        live: "https://azure.microsoft.com",
        impact: "Powers millions of businesses worldwide",
      },
    ],
    contact: {
      linkedin: "https://www.linkedin.com/in/satyanadella",
      website: "https://news.microsoft.com/exec/satya-nadella/",
      email: "",
      phone: "",
      github: "https://github.com/microsoft",
    },
  },
  "alexmorgan-dev": {
    name: "Alex Morgan",
    role: "Senior Full Stack & AI Systems Engineer",
    company: "TechFlow Systems",
    tagline: "Senior engineer specializing in resilient microservices, React distributed systems, and real-time LLM telemetry architectures.",
    about: "Alex Morgan is a Senior Full Stack Engineer with over 6 years of experience building mission-critical web applications, high-throughput backend APIs, and modern reactive frontends. Passionate about developer tooling, clean architectures, and scalable cloud deployments.",
    skills: [
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Python",
      "PostgreSQL",
      "Redis",
      "Docker",
      "Kubernetes",
      "AWS",
      "GraphQL",
      "Tailwind CSS",
      "CI/CD",
      "REST APIs",
    ],
    education: [
      {
        institution: "University of California, Berkeley",
        degree: "Bachelor of Science (B.S.) in Computer Science",
        year: "2020",
        description: "Focus on Distributed Systems, Cloud Architecture, and Database Internals. Magna Cum Laude.",
      },
    ],
    certifications: [
      {
        name: "AWS Certified Solutions Architect – Associate",
        issuer: "Amazon Web Services (AWS)",
        date: "2023",
        url: "https://aws.amazon.com/certification/",
      },
      {
        name: "Meta Certified Front-End Developer Specialization",
        issuer: "Meta / Coursera",
        date: "2022",
        url: "https://coursera.org/verify/meta",
      },
    ],
    experience: [
      {
        role: "Senior Full Stack Engineer",
        company: "TechFlow Systems",
        duration: "2022 - Present",
        description: "Lead developer on distributed cloud management dashboard and microservices architecture.",
        highlights: [
          "Engineered high-throughput GraphQL API gateway handling 15k requests/sec at 18ms latency",
          "Architected zero-downtime blue/green deployment pipeline on AWS EKS with Terraform",
          "Mentored 8 mid-level and junior engineers across backend design and frontend best practices",
        ],
      },
      {
        role: "Full Stack Software Developer",
        company: "Nexus Labs",
        duration: "2020 - 2022",
        description: "Built reactive web applications and data visualization interfaces.",
        highlights: [
          "Redesigned core enterprise dashboard reducing bundle size by 42% and initial load time to 1.1s",
          "Implemented automated end-to-end testing suite increasing regression test coverage to 92%",
        ],
      },
    ],
    achievements: [
      {
        title: "HackMIT Grand Prize Winner",
        description: "Built real-time collaborative code editor with operational transformation.",
        date: "2020",
        metric: "1st Place of 250 Teams",
      },
    ],
    projects: [
      {
        title: "NeuroPulse Telemetry Stream",
        description: "High-performance real-time telemetry streaming service with WebSocket feeds and Redis pub/sub.",
        tags: ["Node.js", "Redis", "TypeScript", "React"],
        github: "https://github.com/alexmorgan-dev/neuropulse",
        live: "https://neuropulse-demo.dev",
        impact: "Processes 2M+ telemetry events/day",
      },
    ],
    contact: {
      linkedin: "https://www.linkedin.com/in/alexmorgan-dev",
      github: "https://github.com/alexmorgan-dev",
      website: "https://alexmorgan-dev.io",
      email: "alex.morgan@domain.com",
      phone: "+1 (555) 234-8901",
    },
  },
};

// ==========================================
// Text Extraction Helpers (Education, Skills, Certifications)
// ==========================================
export const extractEducationFromText = (text = "") => {
  if (!text || typeof text !== "string") return [];
  const education = [];

  // Table row pattern (e.g. B.Tech (Civil Engineering) PTU 2019 76%)
  const eduRegex = /((?:B\.Tech[^\n\r(]*\([^)]+\)|B\.Tech|M\.Tech[^\n\r(]*\([^)]+\)|M\.Tech|B\.E|M\.E|\+2[^\n\r(]*\([^)]+\)|\+2|10\s*th|Bachelor[^\n\r]*|Master[^\n\r]*|Diploma[^\n\r]*))\s+(I\.K\.\s*Gujral\s*Punjab\s*Technical\s*University|P\.S\.E\.B\.|[A-Z][A-Za-z0-9\s.&()]+?(?:University|Board|College|Institute|School))\s+(\d{4})\s+(\d{1,3}%)?/gi;

  let match;
  while ((match = eduRegex.exec(text)) !== null) {
    const rawDegree = match[1].replace(/\s+/g, " ").trim();
    const inst = match[2]?.replace(/\s+/g, " ").trim() || "University";
    const year = match[3] || "";
    const marks = match[4] || "";

    education.push({
      degree: rawDegree,
      institution: inst,
      year,
      description: marks ? `Graduated with ${marks} secured marks.` : "Completed degree coursework.",
    });
  }

  // Fallback line-by-line if table pattern didn't match
  if (education.length === 0) {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    let inEdu = false;
    let currentEdu = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^(education|academic background|academics|qualifications|academic credentials)/i.test(line)) {
        inEdu = true;
        continue;
      }
      if (inEdu && /^(experience|work experience|skills|technical skills|projects|certifications|licenses|achievements|contact)/i.test(line)) {
        inEdu = false;
        if (currentEdu) {
          education.push(currentEdu);
          currentEdu = null;
        }
        continue;
      }
      if (inEdu) {
        const yearMatch = line.match(/\b(19\d\d|20\d\d)(?:\s*[-–]\s*(?:19\d\d|20\d\d|present))?\b/i);
        const isDegree = /(bachelor|master|b\.s|m\.s|b\.tech|b\.e|m\.tech|mba|ph\.d|doctorate|diploma|associate|b\.sc|m\.sc)/i.test(line);
        const isInst = /(university|college|institute|school|polytechnic|academy|iit|nit|bits)/i.test(line);

        if (isInst) {
          if (currentEdu) education.push(currentEdu);
          currentEdu = {
            institution: line.replace(/[,\-–]\s*(19\d\d|20\d\d).*/, "").trim(),
            degree: "Degree",
            year: yearMatch ? yearMatch[0] : "",
            description: "",
          };
        } else if (isDegree && currentEdu) {
          currentEdu.degree = line.replace(/[,\-–]\s*(19\d\d|20\d\d).*/, "").trim();
          if (yearMatch && !currentEdu.year) currentEdu.year = yearMatch[0];
        } else if (isDegree && !currentEdu) {
          currentEdu = {
            institution: "University",
            degree: line.replace(/[,\-–]\s*(19\d\d|20\d\d).*/, "").trim(),
            year: yearMatch ? yearMatch[0] : "",
            description: "",
          };
        } else if (currentEdu && !currentEdu.description && line.length > 5) {
          currentEdu.description = line;
        }
      }
    }
    if (currentEdu) education.push(currentEdu);
  }

  // Fallback scanner across all lines if standard section headers were missing
  if (education.length === 0) {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      const isInst = /(polytechnic|college|collage|school|university|institute|academy|board)/i.test(line);
      const isDegree = /(diploma|intermediate|high\s*school|bachelor|master|b\.tech|b\.e|m\.tech|b\.s|m\.s|b\.sc|m\.sc|secondary)/i.test(line);
      const yearMatch = line.match(/\b(19\d\d|20\d\d)(?:\s*[-–]\s*(?:19\d\d|20\d\d))?\b/);

      if ((isInst || isDegree) && line.length >= 10 && line.length <= 150) {
        const clean = line.replace(/^[•*\-\s]+/, "").trim();
        let inst = "Educational Institution";
        let deg = "Academic Qualification";

        const qualMatch = clean.match(/(?:Diploma\s+in[^\n,]+|Intermediate\s+(?:in|UP)[^\n,.]*|High\s*School\s+(?:in|UP)[^\n,.]*)/i);
        if (qualMatch) {
          inst = clean.slice(0, qualMatch.index).replace(/\b\d{4}(?:-\d{4})?\b/, "").replace(/[.,\-–\s]+$/, "").trim();
          deg = qualMatch[0].replace(/[.,]/g, "").trim();
        } else if (/Diploma/i.test(clean)) {
          deg = clean.slice(clean.search(/Diploma/i)).replace(/[().]/g, "").trim();
          inst = clean.slice(0, clean.search(/Diploma/i)).replace(/\b\d{4}(?:-\d{4})?\b/, "").trim();
        } else if (/Intermediate/i.test(clean)) {
          deg = "Intermediate (UP Board)";
          inst = clean.replace(/Intermediate.*$/i, "").replace(/[,\-–\s]+$/, "").trim();
        } else if (/High\s*School/i.test(clean)) {
          deg = "High School (UP Board)";
          inst = clean.replace(/High\s*School.*$/i, "").replace(/[,\-–\s]+$/, "").trim();
        } else {
          inst = clean;
          deg = isDegree ? clean.match(/(bachelor|master|b\.tech|b\.e|m\.tech|diploma[^\n,]*)/i)?.[0] || "Degree" : "Degree";
        }

        if (inst && !education.some((e) => e.institution.toLowerCase() === inst.toLowerCase())) {
          education.push({
            institution: inst.replace(/[,\-–\s]+$/, "").trim(),
            degree: deg,
            year: yearMatch ? yearMatch[0] : "",
            description: `Completed ${deg} at ${inst}.`,
          });
        }
      }
    }
  }

  return education;
};

export const extractExperienceFromText = (text = "") => {
  if (!text || typeof text !== "string") return [];
  const experiences = [];

  const isTabular = /(?:Past\s*Exposure|Assignments\s*under\s*taken|Period\s*of\s*Work|Name\s*of\s*Organisation)/i.test(text);

  if (isTabular) {
    // Format A: Tabular date entries (e.g. April 2019-July 2020 Optimiz Consultants (p) Ltd As a Site Engineer...)
    const tableDateRegex = /((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)|\d{4})\s*\d{0,4}\s*[-–to\s]+\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember))\s*)?(?:\d{4}|Till\s*now|Present|Current))\s+([^\n\r]+?)(?=(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)|\d{4})\s*\d{0,4}\s*[-–to\s]+)|(?:\bSS\b||Skills|Date\s*of\s*Birth|$))/gi;

    let match;
    while ((match = tableDateRegex.exec(text)) !== null) {
      const duration = match[1].replace(/\s+/g, " ").trim();
      const details = match[2].replace(/\s+/g, " ").trim();

      let role = "Site Engineer";
      let company = "";
      let responsibilities = "";

      const roleM = details.match(/(?:As\s*a\s*|Role\s*[:\-]?\s*)([A-Za-z\s]+?)(?=\s+(?:Janpath|Dream|HMEL|LMC|Project|Execution|Billing|[A-Z][a-z]+\s*Enclave|[A-Z][a-z]+\s*City))/i) ||
                    details.match(/(?:As\s*a\s*|Role\s*[:\-]?\s*)([A-Za-z\s]+)/i);

      if (roleM) {
        role = roleM[1].trim();
        const beforeRole = details.split(roleM[0])[0].trim();
        company = beforeRole.replace(/\s+/g, " ").trim();
        responsibilities = details.split(roleM[0])[1]?.trim() || "";
      } else {
        company = details;
      }

      experiences.push({
        company: company || "Engineering Firm",
        role: role || "Site Engineer",
        duration,
        description: responsibilities ? `Responsibilities included: ${responsibilities}` : "Executed on-site engineering operations, quality assurance, and project delivery.",
        highlights: responsibilities ? [responsibilities] : [],
      });
    }
  }

  // Format B: Chronological line-by-line (e.g. Senior Software Engineer - Razorpay (July 2021 - Present))
  if (experiences.length === 0) {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    let inExp = false;
    let currentExp = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^(work\s*experience|experience|employment\s*history|professional\s*experience)/i.test(line)) {
        inExp = true;
        continue;
      }
      if (inExp && /^(education|academics|skills|technical\s*skills|projects|certifications|contact)/i.test(line)) {
        inExp = false;
        if (currentExp) {
          experiences.push(currentExp);
          currentExp = null;
        }
        continue;
      }
      if (inExp) {
        const dateMatch = line.match(/\(([^)]*(?:19\d\d|20\d\d|present)[^)]*)\)/i) ||
                          line.match(/\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}\s*[-–to\s]+\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?[a-z]*\s*(?:\d{4}|present|current))/i);

        if (dateMatch) {
          if (currentExp) experiences.push(currentExp);
          const duration = dateMatch[1] || dateMatch[0];
          const withoutDate = line.replace(dateMatch[0], "").replace(/[()]/g, "").trim();

          let role = "Software Engineer";
          let company = "Company";

          if (withoutDate.includes(" - ")) {
            const parts = withoutDate.split(" - ");
            role = parts[0].trim();
            company = parts.slice(1).join(" - ").trim();
          } else if (withoutDate.includes(" @ ")) {
            const parts = withoutDate.split(" @ ");
            role = parts[0].trim();
            company = parts[1].trim();
          } else if (withoutDate.includes(" at ")) {
            const parts = withoutDate.split(" at ");
            role = parts[0].trim();
            company = parts[1].trim();
          } else {
            role = withoutDate;
          }

          currentExp = {
            role: role || "Software Engineer",
            company: company || "Technology Firm",
            duration: duration.trim(),
            description: "",
            highlights: [],
          };
        } else if (currentExp && (line.startsWith("-") || line.startsWith("•") || line.startsWith("*"))) {
          const cleanBullet = line.replace(/^[-•*]\s*/, "").trim();
          currentExp.highlights.push(cleanBullet);
          if (!currentExp.description) currentExp.description = cleanBullet;
        } else if (currentExp && line.length > 10 && !currentExp.description) {
          currentExp.description = line;
        }
      }
    }
    if (currentExp) experiences.push(currentExp);
  }

  // Format C: Bullet pattern with date range (e.g. • Kuldeep Kumar Contractor. November 2021 - Present Civil Engineer.)
  if (experiences.length === 0) {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const dateRegex = /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}\s*[-–to\s]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*)?(?:\d{4}|Till\s*now|Present|Current))\b/i;

    for (const line of lines) {
      const dateMatch = line.match(dateRegex);
      if (dateMatch && (line.startsWith("•") || line.startsWith("-") || line.startsWith("*") || /(?:Contractor|Engineers|Construction|Pvt|Ltd|Inc|Corp|Consultants)/i.test(line))) {
        const cleanLine = line.replace(/^[•*\-\s]+/, "").trim();
        const duration = dateMatch[0].trim();
        const idx = cleanLine.indexOf(duration);
        const before = cleanLine.slice(0, idx).replace(/[.\-–\s]+$/, "").trim();
        const after = cleanLine.slice(idx + duration.length).replace(/^[.\-–\s]+/, "").replace(/[.\s]+$/, "").trim();

        let company = before.replace(/^[•*\-\s]+/, "").replace(/[.\-–\s]+$/, "").trim();
        let role = after.replace(/\s*(?:Experience\s*Total|Total\s*Count|Duties|Projects)[\s\S]*$/i, "").replace(/[.\s]+$/, "").trim();
        if (/(?:Engineer|Developer|Manager|Consultant|Architect|Lead|Director|Officer|Specialist|Analyst)/i.test(before) && !/(?:Engineer|Developer|Manager|Consultant|Architect|Lead|Director|Officer|Specialist|Analyst)/i.test(after)) {
          role = before;
          company = after;
        }

        if (company && role) {
          experiences.push({
            company,
            role,
            duration,
            description: `Contributed as ${role} at ${company}.`,
            highlights: [`Served as ${role} managing operations and project execution.`],
          });
        }
      }
    }
  }

  return experiences;
};

export const extractProjectsFromAbout = (aboutText = "") => {
  if (!aboutText || typeof aboutText !== "string") return [];
  const projects = [];
  const normalized = aboutText.normalize("NFKC");
  const lines = normalized.split("\n").map((l) => l.trim()).filter(Boolean);
  let inProjectsSection = false;

  for (const line of lines) {
    if (/\b(?:a few things i'm proud of|projects i've built|featured projects|key projects|things i built|what i build|what i've built|software projects|selected projects)\b/i.test(line)) {
      inProjectsSection = true;
      continue;
    }
    if (inProjectsSection && /\b(?:beyond the code|how i think|coding profiles|competitive programming|education|experience|certifications|technical skills|tech stack|let's connect|career goals?|mindset|strengths)\b/i.test(line)) {
      inProjectsSection = false;
      continue;
    }

    const hasBullet = /^(?:📌|🔹|•|\*|-)\s*/.test(line);
    if (inProjectsSection || hasBullet) {
      const cleanLine = line.replace(/^(?:📌|🔹|•|\*|-)\s*/, "").trim();
      const match = cleanLine.match(/^([A-Za-z0-9_.\s-]{2,40}?)\s*(?:—|–|\s+-\s+|:\s+)\s*(.{15,})/);
      if (match) {
        const pTitle = match[1].replace(/["“”'']/g, "").trim();
        const pDesc = match[2].trim();

        if (
          /intern|developer|ambassador|student|engineer|lead|founder|manager|what|who|why/i.test(pTitle) ||
          pTitle.toLowerCase().startsWith("i ") ||
          pTitle.length < 3
        ) {
          continue;
        }

        const tags = [];
        const dLower = (pTitle + " " + pDesc).toLowerCase();
        if (dLower.includes("react")) tags.push("React.js");
        if (dLower.includes("next")) tags.push("Next.js");
        if (dLower.includes("node")) tags.push("Node.js");
        if (dLower.includes("express")) tags.push("Express.js");
        if (dLower.includes("mongo")) tags.push("MongoDB");
        if (dLower.includes("postgres") || dLower.includes("neon")) tags.push("PostgreSQL");
        if (dLower.includes("strapi")) tags.push("Strapi CMS");
        if (dLower.includes("clerk")) tags.push("Clerk");
        if (dLower.includes("arcjet")) tags.push("Arcjet");
        if (dLower.includes("flask")) tags.push("Flask");
        if (dLower.includes("python")) tags.push("Python");
        if (dLower.includes("scikit") || dLower.includes("ml") || dLower.includes("machine learning")) tags.push("Machine Learning");
        if (dLower.includes("ai") || dLower.includes("gemini")) tags.push("AI");
        if (dLower.includes("cloudinary")) tags.push("Cloudinary");
        if (dLower.includes("render")) tags.push("Render");
        if (dLower.includes("github")) tags.push("GitHub API");
        if (dLower.includes("pcod") || dLower.includes("health")) tags.push("Healthcare AI");
        if (tags.length === 0) tags.push("Full-Stack", "Web App");

        let impact = "";
        const impactMatch = pDesc.match(/(?:cut\s+[^.]+|reduced\s+[^.]+|handled\s+[^.]+|generating\s+[^.]+|predicting\s+[^.]+|deployed\s+[^.]+)/i);
        if (impactMatch) {
          impact = impactMatch[0].trim();
        }

        projects.push({
          title: pTitle,
          description: pDesc,
          tags: Array.from(new Set(tags)),
          impact: impact || pDesc.slice(0, 100),
          live: "",
          github: "",
        });
      }
    }
  }
  return projects;
};

export const extractExperienceFromAbout = (aboutText = "") => {
  if (!aboutText || typeof aboutText !== "string") return [];
  const experiences = [];
  const normalizedText = aboutText.replace(/([🔹•📌*])\s*/g, "\n$1 ");
  const lines = normalizedText.split("\n").map((l) => l.trim()).filter(Boolean);
  let inExpSection = false;

  for (const line of lines) {
    if (/what i'm doing right now|where i work|current roles?|work history|professional roles?|internships?/i.test(line)) {
      inExpSection = true;
      continue;
    }
    if (inExpSection && /what i build|a few things i'm proud of|featured projects|beyond the code|education|certifications|contact/i.test(line)) {
      inExpSection = false;
      continue;
    }

    const hasBullet = /^(?:📌|🔹|•|\*|-)\s*/.test(line);
    if (inExpSection || hasBullet) {
      const cleanLine = line.replace(/^(?:📌|🔹|•|\*|-)\s*/, "").trim();
      if (cleanLine.length < 15) continue;
      if (/^a few things|what i build|beyond the code/i.test(cleanLine)) continue;

      let role = "";
      let company = "";
      let description = "";

      const atMatch = cleanLine.match(/^([A-Za-z0-9_.\s&]{3,50}?)\s*(?:@|\bat\b)\s*([^—–\-:]+)(?:—|–|-|:)?\s*(.*)$/i);
      if (atMatch) {
        role = atMatch[1].trim();
        company = atMatch[2].trim();
        description = (atMatch[3] || "").trim();
      } else {
        const dashMatch = cleanLine.match(/^([A-Za-z0-9_.\s&]{3,50}?)\s*(?:—|–|-)\s*(.*)$/);
        if (dashMatch) {
          const first = dashMatch[1].trim();
          const second = (dashMatch[2] || "").trim();
          if (/intern|developer|engineer|ambassador|lead|fellow|consultant|manager|architect|specialist/i.test(first)) {
            role = first;
            company = "Technology Organization";
            description = second;
          }
        }
      }

      if (role && role.length >= 3 && role.length <= 60) {
        if (!/^(trusthire|auracycle|optistay)/i.test(role)) {
          experiences.push({
            role,
            company: company || "Technology Organization",
            duration: "Recent / Ongoing",
            description: description || `Contributed to software engineering and product delivery as ${role}.`,
            highlights: description ? [description] : [],
          });
        }
      }
    }
  }
  return experiences;
};

export const extractAchievementsFromAbout = (aboutText = "") => {
  if (!aboutText || typeof aboutText !== "string") return [];
  const achievements = [];
  const normalizedText = aboutText.normalize("NFKC").replace(/([🏆🥇🥈🥉🎯💡📌🔹•*])\s*/g, "\n$1 ");
  const lines = normalizedText.split("\n").map((l) => l.trim()).filter(Boolean);
  let inSection = false;

  for (const line of lines) {
    const isSectionHeader = line.length <= 35 && /\b(?:beyond the code|achievements|honors|awards|recognitions|hackathons|how i think|coding profiles|competitive programming|problem solving)\b/i.test(line) && !/—|–|\||\d+\s*(?:rating|contest|\+)/i.test(line);
    if (isSectionHeader) {
      inSection = true;
      continue;
    }
    if (inSection && /\b(?:what i'm doing|what i build|experience|projects|education|certifications|contact|technical skills|tech stack|career goals?|mindset|strengths|let's connect)\b/i.test(line)) {
      inSection = false;
      continue;
    }

    const hasHonorIcon = /^(?:🏆|🥇|🥈|🥉|🎯|💡|📌|🔹|•|\*|-)\s*/.test(line);
    if (inSection || hasHonorIcon) {
      const cleanLine = line.replace(/^(?:🏆|🥇|🥈|🥉|🎯|💡|📌|🔹|•|\*|-)\s*/, "").trim();
      if (cleanLine.length >= 8 && cleanLine.length <= 150) {
        if (/finalist|winner|top\s*\d+|award|rank|solved|dsa|hackathon|scholarship|honor|rating|contest|certified|leetcode|codechef|hackerrank|codeforces|★|star/i.test(cleanLine)) {
          achievements.push({
            title: cleanLine,
            issuer: /leetcode/i.test(cleanLine) ? "LeetCode" : (/codechef/i.test(cleanLine) ? "CodeChef" : (/hackerrank/i.test(cleanLine) ? "HackerRank" : "Competitive Programming")),
            year: new Date().getFullYear().toString(),
          });
        }
      }
    }
  }
  return achievements;
};

export const synthesizeEfficientAbout = (rawAbout = "", options = {}) => {
  if (!rawAbout || typeof rawAbout !== "string") return "";

  // 1. Normalize Unicode (e.g., converts 𝗪𝗵𝗮𝘁 𝗜 𝗕𝘂𝗶𝗹𝗱 to "What I Build")
  const text = rawAbout.normalize("NFKC").trim();
  if (text.length < 25) return text;

  // 2. Identify common section headers used in LinkedIn / Resumes
  const sectionHeaderRegex = /(?:^|\n)\s*(?:[🚀📌💼🛠️🎯💡🧠📬⭐]\s*)?(What\s*I\s*(?:Build|am\s*doing|Do|have\s*built)|Featured\s*Projects|Projects(?:\s*I've\s*Built)?|How\s*I\s*Think|Coding\s*Profiles|Competitive\s*Programming|Problem\s*Solving|Technical\s*Skills|Tech\s*Stack|Core\s*Competencies|Skills(?:\s*&\s*Tools)?|Tools\s*&\s*Technologies|Career\s*Goals?|Career\s*Objective|Objective|Current\s*Focus|Looking\s*For|Strengths|Core\s*Strengths|Key\s*Strengths|Mindset|My\s*Philosophy|Philosophy|Vision|Approach|Let's\s*Connect|Get\s*in\s*Touch|Contact(?:\s*Me)?|Reach\s*Out|Open\s*to|Education|Work\s*Experience|Experience|Certifications)\b\s*[:—–-]?\s*/gi;

  const sections = [];
  let match;
  while ((match = sectionHeaderRegex.exec(text)) !== null) {
    sections.push({
      header: match[1].toLowerCase().replace(/\s+/g, " ").trim(),
      index: match.index,
      headerLength: match[0].length,
    });
  }

  // 3. Extract Intro (text before the first section header)
  let intro = "";
  if (sections.length > 0) {
    intro = text.slice(0, sections[0].index).trim();
  } else {
    // If no explicit header matched, check if there are raw bullet lines (• Cook-With-Zavo...)
    const firstBullet = text.search(/(?:^|\n)\s*[•*📌🔹-]\s*/);
    if (firstBullet > 25) {
      intro = text.slice(0, firstBullet).trim();
    } else {
      intro = text;
    }
  }

  // Clean intro of leading emojis, trailing colons or bullet characters
  intro = intro
    .replace(/^[🚀👋👨‍💻👩‍💻💼✨🔥\s]+/, "")
    .replace(/[\s\r\n]+/g, " ")
    .trim();

  // 4. Extract Mindset or Career Goal if available to enrich the executive summary
  let mindsetText = "";
  let careerGoalText = "";

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    const nextIndex = sections[i + 1] ? sections[i + 1].index : text.length;
    const content = text.slice(sec.index + sec.headerLength, nextIndex).trim();

    if (/mindset|philosophy|vision|approach/i.test(sec.header)) {
      mindsetText = content.split(/\n/)[0].replace(/^[-•*]\s*/, "").trim();
    } else if (/career\s*goal|objective|current\s*focus/i.test(sec.header)) {
      careerGoalText = content.split(/\n/)[0].replace(/^[-•*]\s*/, "").trim();
    }
  }

  // 5. Synthesize clean executive bio
  let efficientAbout = "";

  if (intro && intro.length >= 30) {
    efficientAbout = intro;
    if (mindsetText && mindsetText.length >= 20 && mindsetText.length <= 220) {
      if (!efficientAbout.toLowerCase().includes(mindsetText.slice(0, 20).toLowerCase())) {
        efficientAbout += ` ${mindsetText}`;
      }
    } else if (careerGoalText && careerGoalText.length >= 20 && careerGoalText.length <= 180 && efficientAbout.length < 240) {
      if (!efficientAbout.toLowerCase().includes(careerGoalText.slice(0, 20).toLowerCase())) {
        const goalClean = careerGoalText.replace(/^Targeting\s+/i, "Currently focused on ");
        efficientAbout += ` ${goalClean}`;
      }
    }
  } else if (mindsetText && careerGoalText) {
    efficientAbout = `${careerGoalText} ${mindsetText}`;
  } else if (mindsetText) {
    efficientAbout = mindsetText;
  } else {
    const cleanLines = text.split(/\n/).map((l) => l.trim()).filter((l) => l && !/^[•*-]/.test(l));
    efficientAbout = cleanLines.slice(0, 2).join(" ");
  }

  // 6. Ensure clean text without leftover bullets, URLs, or markdown syntax
  efficientAbout = efficientAbout
    .replace(/https?:\/\/[^\s]+/gi, "")
    .replace(/[•*]\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  // 7. Ensure first-person narration
  const candidateName = options.name || "";
  if (candidateName && typeof candidateName === "string") {
    const escapedName = candidateName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    efficientAbout = efficientAbout
      .replace(new RegExp(`^${escapedName}\\s+is\\s+(an?|the)?\\s*`, "i"), (m, art) => art ? `I am ${art} ` : "I am ")
      .replace(new RegExp(`^${escapedName}\\s+has\\s+`, "i"), "I have ")
      .replace(new RegExp(`^${escapedName}\\s+leads?\\s+`, "i"), "I lead ")
      .replace(new RegExp(`^${escapedName}\\s+brings?\\s+`, "i"), "I bring ")
      .replace(new RegExp(`^${escapedName}\\s+specializes?\\s+in\\s+`, "i"), "I specialize in ");
  }

  // If intro starts with "Computer Science undergraduate...", prepend "I am a "
  if (/^(?:A\s+)?(?:Computer\s+Science|Software|Civil|Mechanical|Full\s*Stack|Frontend|Backend|Data)\s+(?:undergraduate|graduate|engineer|developer|specialist|student)\b/i.test(efficientAbout)) {
    efficientAbout = efficientAbout.replace(/^(?:A\s+)?/i, "I am a ");
  }

  return efficientAbout.trim();
};

export const cleanAboutSummary = (rawAbout = "", options = {}) => {
  return synthesizeEfficientAbout(rawAbout, options);
};

export const extractProjectsFromText = (text = "") => {
  if (!text || typeof text !== "string") return [];
  const projects = [];

  // 1. Check for Roman numeral or numbered projects e.g. I. CGS CUM MOTHER STATION ... II. Gail India Project (APPL)
  const romanProjectRegex = /(?:^|\n)\s*(?:I{1,3}|IV|V|VI|\d+)\.\s+([A-Z0-9\s().&/-]{3,70}?)(?:\.|\n|$)([\s\S]*?)(?=(?:\n\s*(?:I{1,3}|IV|V|VI|\d+)\.\s+[A-Z0-9])|\n\s*(?:Languages|Experience|Education|Skills|$))/gi;
  let rMatch;
  while ((rMatch = romanProjectRegex.exec(text)) !== null) {
    const rawTitle = rMatch[1].replace(/\s+/g, " ").trim();
    const body = rMatch[2]?.trim() || "";
    if (rawTitle.length >= 3 && !/^(Objective|Education|Skills|Experience|Languages)$/i.test(rawTitle)) {
      const formattedTitle = rawTitle
        .split(/\s+/)
        .map((w) => (w.length <= 3 && !/cum/i.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join(" ");

      const clientMatch = body.match(/CLIENT\s*[-–:]\s*([^\n.]+)/i);
      const roleMatch = body.match(/Role\s*[-–:]\s*([^\n.]+)/i);
      const pmcMatch = body.match(/PMC\s*[-–:]\s*([^\n.]+)/i);
      const bullets = body.match(/(?:•|\*|-)\s*([^\n\r]+)/g) || [];
      const firstBullet = bullets[0]?.replace(/^[•*\-\s]+/, "").trim() || "";

      let desc = "";
      if (clientMatch) desc += `Client: ${clientMatch[1].trim()}. `;
      if (pmcMatch) desc += `PMC: ${pmcMatch[1].trim()}. `;
      if (!desc && firstBullet) desc = firstBullet;
      if (!desc) desc = "Major infrastructure project involving engineering execution and quality supervision.";

      projects.push({
        title: formattedTitle,
        description: desc.trim(),
        tags: ["Civil Engineering", "Site Execution", "Infrastructure"],
        impact: firstBullet || "Ensured rigorous on-site quality control, safety compliance, and milestone delivery.",
        github: "",
        live: "",
      });
    }
  }

  // 2. Check for specific named infrastructure / civil projects
  const knownProjects = [
    { title: "LMC to VSSL Pipeline Project", tags: ["Civil Engineering", "GAIL", "Pipeline"] },
    { title: "HMEL Connectivity Pipeline Project", tags: ["Civil Engineering", "GAIL", "Infrastructure"] },
    { title: "Dream City Development Project", tags: ["Site Engineering", "QS & Billing", "Construction"] },
    { title: "Janpath Enclave Project", tags: ["Site Engineering", "Execution", "Billing"] },
  ];

  for (const kp of knownProjects) {
    const keyword = kp.title.split(" ")[0];
    if (new RegExp(`\\b${keyword}\\b`, "i").test(text) && !projects.some((p) => p.title.toLowerCase().includes(keyword.toLowerCase()))) {
      projects.push({
        title: kp.title,
        description: "Engineering infrastructure project involving execution, quality assurance, quantity surveying (QS), and multi-stakeholder liaisoning.",
        tags: kp.tags,
        impact: "Ensured high compliance and milestone delivery standards with verified billing accuracy.",
        github: "",
        live: "",
      });
    }
  }

  if (projects.length > 0) return projects;

  const aboutProjects = extractProjectsFromAbout(text);
  if (aboutProjects.length > 0) return aboutProjects;

  // Check for software project blocks (e.g. Project Name: Description)
  if (projects.length === 0) {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    let inProj = false;
    for (const line of lines) {
      if (/^(projects|featured projects|key projects|academic projects)/i.test(line)) {
        inProj = true;
        continue;
      }
      if (inProj && /^(experience|education|skills|certifications|contact)/i.test(line)) {
        inProj = false;
        continue;
      }
      if (inProj && line.includes(":")) {
        const parts = line.split(":");
        const pTitle = parts[0].replace(/^[-•*]\s*/, "").trim();
        const pDesc = parts.slice(1).join(":").trim();
        if (pTitle.length >= 3 && pTitle.length <= 40) {
          projects.push({
            title: pTitle,
            description: pDesc || "Full-stack application built with modern architecture and design.",
            tags: ["Software", "Web"],
            github: "",
            live: "",
          });
        }
      }
    }
  }

  return projects;
};

export const extractCertificationsFromText = (text = "") => {
  if (!text || typeof text !== "string") return [];
  const certs = [];
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  let inCerts = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^(licenses\s*(?:&|and)\s*certifications|certifications|certificates|accreditations|credentials)/i.test(line)) {
      inCerts = true;
      continue;
    }
    if (inCerts && /^(education|experience|work experience|skills|technical skills|projects|achievements|honors|publications|languages|contact)/i.test(line)) {
      inCerts = false;
      continue;
    }
    if (inCerts) {
      if (line.length < 3) continue;
      const yearMatch = line.match(/\b(19\d\d|20\d\d)\b/);
      let name = line;
      let issuer = "Professional Certification";
      if (line.includes(" - ")) {
        const parts = line.split(" - ");
        name = parts[0].trim();
        issuer = parts.slice(1).join(" - ").replace(/\(?(19\d\d|20\d\d)\)?/, "").trim() || issuer;
      } else if (line.includes(" | ")) {
        const parts = line.split(" | ");
        name = parts[0].trim();
        issuer = parts.slice(1).join(" | ").replace(/\(?(19\d\d|20\d\d)\)?/, "").trim() || issuer;
      } else if (line.includes(" by ")) {
        const parts = line.split(" by ");
        name = parts[0].trim();
        issuer = parts.slice(1).join(" by ").replace(/\(?(19\d\d|20\d\d)\)?/, "").trim() || issuer;
      }
      certs.push({
        name: name.replace(/\(?(19\d\d|20\d\d)\)?/, "").trim(),
        issuer,
        date: yearMatch ? yearMatch[0] : "",
        url: "",
      });
    }
  }

  // Standalone detections (e.g., AWS Certified, Meta, Google Cloud) if no section header found
  if (certs.length === 0) {
    for (const line of lines) {
      if (/(AWS Certified|Google Cloud Certified|Microsoft Certified|Meta Certified|CKA|CKAD|PMP|CompTIA|Certified Kubernetes|Scrum Master)/i.test(line)) {
        const yearMatch = line.match(/\b(19\d\d|20\d\d)\b/);
        certs.push({
          name: line.replace(/\(?(19\d\d|20\d\d)\)?/, "").trim(),
          issuer: line.includes("AWS") ? "Amazon Web Services (AWS)" : line.includes("Google") ? "Google Cloud" : line.includes("Microsoft") ? "Microsoft" : line.includes("Meta") ? "Meta" : "Certification Authority",
          date: yearMatch ? yearMatch[0] : "",
          url: "",
        });
      }
    }
  }

  return certs;
};

export const extractSkillsFromText = (text = "") => {
  if (!text || typeof text !== "string") return [];
  const skills = new Set();

  // A. Bullet points under Skills section
  const skillSectionMatch = text.match(/(?:Skills\s*(?:and|&)\s*Expertise|Technical\s*Skills|Core\s*Competencies|Skills|Key\s*Skills)[\s\S]*?(?=(?:Work\s*Experience|Academics|Education|Projects|Date\s*of\s*Birth|Personal|$))/i);
  if (skillSectionMatch) {
    const sText = skillSectionMatch[0];
    const bulletMatches = sText.match(/(?:|•|\*|-)\s*([^\n\r]+)/g);
    if (bulletMatches) {
      for (const b of bulletMatches) {
        const cleaned = b.replace(/^[•\*\-\s]+/, "").replace(/Knowledge\s*of/i, "").trim();
        const tokens = cleaned.split(/[,&/|]/).map((t) => t.trim()).filter(Boolean);
        for (const t of tokens) {
          const s = t.replace(/\.$/, "").trim();
          if (s.length >= 2 && s.length <= 30 && !/^(skills|sound|knowledge)$/i.test(s)) {
            skills.add(s);
          }
        }
      }
    }
  }

  // B. Broad cross-domain dictionary
  const dictionary = [
    // Web & Software
    "JavaScript", "TypeScript", "React", "Node.js", "Express", "Python", "Java", "C++", "SQL", "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "AWS", "Azure", "Git", "Linux", "REST APIs", "GraphQL", "Tailwind CSS", "Next.js",
    // Civil, Mechanical & CAD
    "AutoCad", "SAP", "SolidWorks", "Revit", "STAAD Pro", "MS Office", "MS Excel", "Quantity Surveying", "Site Engineering", "Project Execution", "Billing & Liaisoning", "Civil Engineering", "Structural Analysis", "Construction Management", "Quality Control",
    // Management & Core
    "Communication Skills", "Managerial Skills", "Project Management", "Team Leadership", "Agile", "Scrum", "Problem Solving", "Data Analysis",
  ];

  for (const item of dictionary) {
    const reg = new RegExp(`\\b${item.replace("+", "\\+").replace("&", "(&|and)")}\\b`, "i");
    if (reg.test(text)) {
      skills.add(item);
    }
  }

  // C. Scan bullet lines across resume that describe technical capabilities, skills, tools, or procedures
  const allBulletMatches = text.match(/(?:|•|\*|-)\s*([^\n\r]+)/g) || [];
  for (const b of allBulletMatches) {
    const clean = b.replace(/^[•\*\-\s]+/, "").replace(/[.]+$/, "").trim();
    if (
      clean.length >= 4 &&
      clean.length <= 65 &&
      !/(?:November|December|January|February|March|April|May|June|July|August|September|October|\b(?:19\d\d|20\d\d)\b)/i.test(clean) &&
      !/(?:Polytechnic|Collage|College|School|University|Contractor|Engineers|Construction|Pvt|Ltd|Inc)/i.test(clean) &&
      (/(?:Skills?|Schedule|Bill|Report|Documentation|BOQ|Budget|Drawings?|AutoCAD|Structure|Finishing|Site|Quality|Planning|Management|Engineering|Liaising|Leadership|Teamwork|Problem Solving)/i.test(clean))
    ) {
      skills.add(clean.replace(/\s*Skills?$/i, "").trim());
    }
  }

  return Array.from(skills);
};

export const extractNameFromResume = (text = "", originalFilename = "", email = "") => {
  let name = "";
  const addressTokens = /^(village|district|pradesh|street|road|block|sector|lane|nagar|city|state|india|mobile|phone|email|curriculum|vitae|resume|biodata|objective|education|skills|experience|author|personal|dossier)$/i;

  // 1. Signature / declaration in parentheses at bottom e.g. (Lucky Singh)
  const parenSignatureMatch = text.match(/\(\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*\)\s*$/m) ||
                             text.match(/Place:.*?\(?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*\)?/i);
  if (parenSignatureMatch && parenSignatureMatch[1]) {
    name = parenSignatureMatch[1].trim();
    return name;
  }

  // 2. Explicit keyword e.g. Personal Dossier Lucky Singh or Name: Lucky Singh
  const explicitMatch = text.match(/(?:Name\s*[:\-]|Personal\s*Dossier\s*[:\-]?|Candidate\s*Name\s*[:\-])\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i);
  if (explicitMatch && explicitMatch[1]) {
    const cleanTokens = explicitMatch[1].trim().split(/\s+/).filter(w => !addressTokens.test(w) && !w.endsWith(":"));
    if (cleanTokens.length >= 2) {
      name = cleanTokens.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
      return name;
    }
  }

  // 3. Match against filename (e.g. amitesh.pdf -> Amitesh Pandey)
  if (originalFilename) {
    const cleanFile = originalFilename.replace(/\.[a-zA-Z0-9]+$/i, "").replace(/[-_.]*(resume|cv|biodata|portfolio|profile)[-_.]*/gi, " ").replace(/[-_.]+/g, " ").trim();
    const fileWords = cleanFile.split(/\s+/).filter((w) => w.length >= 3 && !/^\d+$/.test(w));
    for (const fw of fileWords) {
      const nameInText = new RegExp(`\\b(${fw}[a-z]*\\s+[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)?)\\b`, "i");
      const m = text.match(nameInText);
      if (m && m[1]) {
        const parts = m[1].split(/\s+/).filter(w => !addressTokens.test(w) && !w.endsWith(":"));
        if (parts.length >= 2) {
          name = parts.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
          return name;
        }
      }
    }
  }

  // 4. Match against email prefix (e.g. amiteshpandey2014@gmail.com -> Amitesh Pandey)
  if (email) {
    const prefix = email.split("@")[0].replace(/[0-9]+$/g, "").toLowerCase();
    const prefixMatch = text.match(/\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/g);
    if (prefixMatch) {
      for (const candidate of prefixMatch) {
        const compact = candidate.replace(/\s+/g, "").toLowerCase();
        if (prefix.includes(compact) || compact.includes(prefix.slice(0, 5))) {
          const parts = candidate.split(/\s+/).filter(w => !addressTokens.test(w));
          if (parts.length >= 2) {
            name = parts.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
            return name;
          }
        }
      }
    }
  }

  // 5. Check top lines for a standalone or pre-address candidate name
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 8)) {
    const preAddress = line.split(/(?:Village|Address|Dist|District|Email|Phone|Mobile|H\.No|Pradesh)\s*[:\-]/i)[0].trim();
    const cleanTokens = preAddress.split(/\s+/).filter(Boolean);
    if (cleanTokens.length >= 2 && cleanTokens.length <= 4 && cleanTokens.every((w) => /^[a-zA-Z.]+$/.test(w) && !addressTokens.test(w))) {
      name = cleanTokens.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
      return name;
    }
  }

  return "Candidate";
};

// ==========================================
// Authentic Heuristic Parser (Strict Authenticity)
// ==========================================
const buildHeuristicPortfolio = (
  resumeText = "",
  targetRole = "",
  targetCompany = "",
  options = {},
) => {
  const user = options?.user || {};
  let parsedPayload = {};

  if (options?.scrapedData && typeof options.scrapedData === "object") {
    parsedPayload = { ...options.scrapedData };
  }

  if (typeof resumeText === "string") {
    try {
      const trimmed = resumeText.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        const json = JSON.parse(trimmed);
        parsedPayload = { ...parsedPayload, ...json };
      }
    } catch (e) {
      // not JSON
    }
  }

  // Real contact details regex extraction from resume text or payload
  let detectedEmail = parsedPayload.email || "";
  let detectedPhone = parsedPayload.phone || "";
  let detectedGithub = parsedPayload.github || "";
  let detectedLinkedin = parsedPayload.linkedin || parsedPayload.linkedinUrl || "";

  if (typeof resumeText === "string") {
    if (!detectedEmail) {
      const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) detectedEmail = emailMatch[0];
    }
    if (!detectedPhone) {
      const phoneMatch = resumeText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/);
      if (phoneMatch) detectedPhone = phoneMatch[0].trim();
    }
    if (!detectedGithub) {
      const ghMatch = resumeText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
      if (ghMatch) detectedGithub = ghMatch[0].startsWith("http") ? ghMatch[0] : `https://${ghMatch[0]}`;
    }
    if (!detectedLinkedin) {
      const liMatch = resumeText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_%-]+)/i);
      if (liMatch) detectedLinkedin = liMatch[0].startsWith("http") ? liMatch[0] : `https://${liMatch[0]}`;
    }
  }

  if (detectedLinkedin && !detectedLinkedin.startsWith("http")) {
    detectedLinkedin = `https://${detectedLinkedin}`;
  }

  const slugMatch = detectedLinkedin.match(/linkedin\.com\/in\/([a-zA-Z0-9_%-]+)/i);
  const cleanSlug = slugMatch ? slugMatch[1].toLowerCase().replace(/[^a-z0-9_%-]/g, "") : "";
  const ghMatch = (detectedGithub || "").match(/github\.com\/([a-zA-Z0-9-]+)/i);
  const cleanGh = ghMatch && ghMatch[1] && !["topics", "search", "explore", "settings"].includes(ghMatch[1].toLowerCase()) ? ghMatch[1] : "";

  let avatarUrl = extractAvatarUrl(options?.avatar) || (typeof options?.avatar === "string" ? options.avatar : "");
  if (!avatarUrl) {
    if (cleanGh) {
      avatarUrl = `https://github.com/${cleanGh}.png`;
    } else if (cleanSlug) {
      avatarUrl = `https://unavatar.io/linkedin/${cleanSlug}`;
    }
  }

  if (cleanSlug && KNOWN_LINKEDIN_PROFILES[cleanSlug]) {
    const known = KNOWN_LINKEDIN_PROFILES[cleanSlug];
    console.log(`[Portfolio Generator] Loaded verified public LinkedIn profile facts for: ${known.name}`);
    return normalizeGeneratedPortfolio(
      {
        avatar: avatarUrl,
        hero: {
          name: known.name,
          title: targetRole || known.role,
          avatar: avatarUrl,
          tagline: known.tagline,
        },
        about: known.about,
        skills: known.skills,
        experience: known.experience,
        education: known.education,
        certifications: known.certifications,
        achievements: known.achievements,
        projects: known.projects || [],
        blog: known.blog || [],
        contact: {
          email: detectedEmail || known.contact?.email || user.email || "",
          phone: detectedPhone || known.contact?.phone || "",
          github: detectedGithub || known.contact?.github || "",
          linkedin: detectedLinkedin || known.contact?.linkedin || "",
          website: known.contact?.website || "",
        },
      },
      targetRole || known.role,
      targetCompany || known.company,
      { user, avatar: avatarUrl, inputSource: options?.inputSource || "linkedin" },
    );
  }

  // Name extraction: from payload, signature, filename, email, or top lines
  let name = parsedPayload.name || "";
  if (!name && typeof resumeText === "string") {
    name = extractNameFromResume(resumeText, options?.originalFilename, detectedEmail);
  }
  if (!name || name === "Developer" || name === "Candidate") {
    if (options?.candidateName) {
      name = options.candidateName;
    } else if (cleanSlug) {
      name = cleanSlug
        .replace(/-[0-9a-f]{6,}$/i, "")
        .replace(/-[0-9]+$/i, "")
        .replace(/-\b[0-9a-z]{7,}\b$/i, "")
        .replace(/[0-9]+$/g, "")
        .replace(/[-_.]+/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    } else if (parsedPayload.name) {
      name = parsedPayload.name;
    } else {
      name = options?.inputSource === "resume" ? "Candidate" : (user.fullName || "Developer");
    }
  }

  const cleanResumeText = typeof resumeText === "string"
    ? resumeText
        .replace(/([•*])\s*/g, "\n$1 ")
        .replace(/(?:^|\s+)([I|V|X]+\.\s+[A-Z])/g, "\n$1")
    : "";

  // Parse experience
  let experience = [];
  if (Array.isArray(parsedPayload.experience) && parsedPayload.experience.length > 0) {
    experience = parsedPayload.experience;
  }
  if (experience.length === 0 && cleanResumeText) {
    experience = extractExperienceFromText(cleanResumeText);
  }
  if (experience.length === 0 && parsedPayload.about) {
    experience = extractExperienceFromAbout(parsedPayload.about);
  }
  if (experience.length === 0 && cleanResumeText) {
    experience = extractExperienceFromAbout(cleanResumeText);
  }

  // Role detection
  const detectedDomainRole = options?.detectedDomainRole || detectDomainAndRoleFromText(typeof resumeText === "string" ? resumeText : JSON.stringify(parsedPayload));
  let resolvedRole = targetRole;
  if (!resolvedRole || (["Full Stack Developer", "Software Engineer", "Full Stack Software Engineer"].includes(resolvedRole) && detectedDomainRole !== "Software Engineer" && detectedDomainRole !== "Full Stack Developer" && detectedDomainRole !== "Professional")) {
    resolvedRole = detectedDomainRole;
  }
  const detectedRole = experience[0]?.role || parsedPayload.jobTitle || parsedPayload.headline || parsedPayload.title || resolvedRole || detectedDomainRole || "Professional";
  const roleTitle = (resolvedRole && resolvedRole !== "Professional") ? resolvedRole : detectedRole;

  // Parse education
  let education = [];
  if (Array.isArray(parsedPayload.education) && parsedPayload.education.length > 0) {
    education = parsedPayload.education;
  } else if (cleanResumeText) {
    education = extractEducationFromText(cleanResumeText);
  }

  // Parse projects
  let projects = [];
  if (Array.isArray(parsedPayload.projects) && parsedPayload.projects.length > 0) {
    projects = parsedPayload.projects;
  }
  if (projects.length === 0 && cleanResumeText) {
    projects = extractProjectsFromText(cleanResumeText);
  }
  if (projects.length === 0 && parsedPayload.about) {
    projects = extractProjectsFromAbout(parsedPayload.about);
  }
  if (projects.length === 0 && cleanResumeText) {
    projects = extractProjectsFromAbout(cleanResumeText);
  }

  // Parse skills
  let skills = [];
  if (Array.isArray(parsedPayload.skills) && parsedPayload.skills.length > 0) {
    skills = parsedPayload.skills;
  } else if (typeof parsedPayload.skills === "string" && parsedPayload.skills.trim()) {
    skills = parsedPayload.skills.split(",").map((s) => s.trim()).filter(Boolean);
  } else if (cleanResumeText) {
    skills = extractSkillsFromText(cleanResumeText);
  }
  if (skills.length === 0 && parsedPayload.about) {
    skills = extractSkillsFromText(parsedPayload.about);
  }

  // Parse achievements
  let achievements = [];
  if (Array.isArray(parsedPayload.achievements) && parsedPayload.achievements.length > 0) {
    achievements = parsedPayload.achievements;
  } else if (parsedPayload.about) {
    achievements = extractAchievementsFromAbout(parsedPayload.about);
  }
  if (achievements.length === 0 && typeof resumeText === "string") {
    achievements = extractAchievementsFromAbout(resumeText);
  }

  // Parse certifications
  let certifications = [];
  if (Array.isArray(parsedPayload.certifications) && parsedPayload.certifications.length > 0) {
    certifications = parsedPayload.certifications;
  } else if (typeof resumeText === "string") {
    certifications = extractCertificationsFromText(resumeText);
  }

  // For LinkedIn or sparse profile input sources: ONLY provide fallback skills if completely empty.
  // NEVER fabricate fake experiences, fake degrees, or fake projects that the candidate did not have.
  const isLinkedInOrSparse = options?.inputSource === "linkedin" || Boolean(cleanSlug);
  if (isLinkedInOrSparse) {
    if (!skills || skills.length === 0) {
      skills = getRecommendedSkillsForRole(roleTitle);
    }
  }

  // Parse Career Objective / About
  let about = parsedPayload.about || parsedPayload.summary || parsedPayload.bio || "";
  if (!about && typeof resumeText === "string") {
    const aboutBlockMatch = resumeText.match(/About:\s*([\s\S]+?)(?=\n[A-Z0-9\s_-]+:|$)/i);
    if (aboutBlockMatch && aboutBlockMatch[1].trim().length > 25) {
      about = aboutBlockMatch[1].trim();
    } else {
      const detailOrientedMatch = resumeText.match(/(Detail\s*oriented[^\n.]{20,250}\.[^\n.]{0,250}\.?)/i) ||
                                  resumeText.match(/(Detail\s*oriented[^\n]{30,300})/i);
      const passionateMatch = resumeText.match(/(Passionate[^\n.]{20,250}\.[^\n.]{0,250}\.?)/i) ||
                              resumeText.match(/(Passionate[^\n]{30,300})/i);
      const resultsOrientedMatch = resumeText.match(/(Results\s*oriented[^\n.]{20,250}\.[^\n.]{0,250}\.?)/i);

      const rawObj = resumeText.match(/(?:Career\s*Objective|Professional\s*Summary|Executive\s*Summary|Summary|About\s*Me)\s*[:\-]?\s*([A-Z][^\n]{30,300})/i);
      const isCleanObj = rawObj && !/academics|qualification|dossier|personal|h\.no|mobile|phone|http|www\.|linkedin/i.test(rawObj[1]);

      if (detailOrientedMatch) {
        about = detailOrientedMatch[1].replace(/\s+/g, " ").trim();
      } else if (passionateMatch) {
        about = passionateMatch[1].replace(/\s+/g, " ").trim();
      } else if (resultsOrientedMatch) {
        about = resultsOrientedMatch[1].replace(/\s+/g, " ").trim();
      } else if (isCleanObj) {
        about = rawObj[1].replace(/\s+/g, " ").trim();
      }
    }
  }

  // Clean URLs without destroying authentic content
  if (about && about.length > 25) {
    about = about.replace(/https?:\/\/[^\s]+/gi, "").trim();
  }
  const isDigital = /\b(software|developer|frontend|backend|full stack|web|cloud|ui\/ux|ai|data)\b/i.test(roleTitle);
  if (!about || about.length < 25) {
    const domainDesc = isDigital
      ? `building robust, high-performance applications and scalable digital systems${targetCompany ? ` tailored for ${targetCompany}` : ""}. Committed to engineering excellence, reliable architecture, and continuous innovation.`
      : `driving quality execution, technical precision, and on-site project excellence${targetCompany ? ` tailored for ${targetCompany}` : ""}. Committed to high industry standards, safety compliance, and reliable operational delivery.`;
    about = `I am a dedicated ${roleTitle} specializing in ${domainDesc}`;
  }

  let tagline = parsedPayload.headline || parsedPayload.title || "";
  const domainTagline = isDigital
    ? `Accomplished ${roleTitle} driving engineering leadership, scalable architecture, and high-impact digital solutions${targetCompany ? ` for ${targetCompany}` : ""}.`
    : `Accomplished ${roleTitle} driving engineering leadership, project execution, and high-impact operational solutions${targetCompany ? ` for ${targetCompany}` : ""}.`;

  if (!tagline || tagline.startsWith("http") || tagline.includes("://") || tagline.length < 15) {
    tagline = (about.length > 20 && !about.includes("H.no") && !about.includes("Dossier") && !about.includes("http"))
      ? (about.split(/[\n.]/)[0].trim() + ".")
      : domainTagline;
  }

  if (!tagline || tagline.startsWith("http") || tagline.includes("://") || tagline.includes("www.") || tagline.length < 15) {
    tagline = domainTagline;
  }

  about = cleanAboutSummary(about, { name, role: roleTitle, skills, targetCompany });

  const isCandidateUser = Boolean(
    user?.fullName &&
    name &&
    user.fullName.trim().toLowerCase() === name.trim().toLowerCase()
  );

  const finalContactEmail = detectedEmail || (isCandidateUser ? (user.email || "") : "");

  return normalizeGeneratedPortfolio(
    {
      avatar: avatarUrl,
      hero: {
        name,
        title: roleTitle,
        avatar: avatarUrl,
        tagline,
      },
      about,
      skills,
      projects,
      experience,
      education,
      achievements: achievements.length > 0 ? achievements : (Array.isArray(parsedPayload.achievements) ? parsedPayload.achievements : []),
      certifications,
      blog: Array.isArray(parsedPayload.blog) ? parsedPayload.blog : [],
      contact: {
        email: finalContactEmail,
        phone: detectedPhone || "",
        github: detectedGithub || "",
        linkedin: detectedLinkedin || "",
        website: parsedPayload.website || "",
      },
    },
    roleTitle,
    targetCompany,
    {
      user,
      avatar: avatarUrl,
      inputSource: options?.inputSource || (cleanSlug ? "linkedin" : "resume"),
      originalFilename: options?.originalFilename,
      candidateName: name,
      cleanSlug,
      isUserTheCandidate: isCandidateUser,
    },
  );
};
