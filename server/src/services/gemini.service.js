import axios from "axios";

// Helper: Detect candidate's industry / professional domain
export const detectProfileDomain = (targetRole = "", profile = {}) => {
  const roleText = `${targetRole} ${profile.targetRole || ""} ${profile.title || ""} ${profile.tagline || ""}`.toLowerCase();
  const combined = [
    roleText,
    profile.bio || "",
    (profile.skills || []).join(" "),
    (profile.projects || []).map((p) => `${p.title} ${p.description}`).join(" "),
    profile.rawText || "",
  ]
    .join(" ")
    .toLowerCase();

  // 1. Civil Engineering, Infrastructure, Construction & Structural Design
  const isCivilEngineering =
    /\b(civil engineer|civil engineering|structural engineer|construction engineer|site engineer|bim coordinator|geotechnical|surveyor|infrastructure engineer|concrete technology|autocad civil|staad\.?pro|revit architecture|highway engineering|transportation engineer|environmental engineer|mep engineer|quantity surveyor|hydrology|water resources engineer|urban planning|structural design)\b/i.test(
      roleText
    ) ||
    /\b(civil engineering|structural engineering|bim modeling|staad\.?pro|revit architecture|autocad civil|surveying|soil mechanics|highway engineering|construction management|concrete technology|structural analysis)\b/i.test(
      combined
    );

  if (isCivilEngineering) {
    return "civil_engineering";
  }

  // 2. Mechanical, Hardware, Robotics & Manufacturing Engineering
  const isMechanical =
    /\b(mechanical engineer|mechanical engineering|cad designer|solidworks|ansys|catia|manufacturing engineer|thermal engineer|automotive engineer|robotics engineer|mechatronics|hvac engineer|finite element analysis|fea|cnc machining)\b/i.test(
      roleText
    ) ||
    /\b(solidworks|ansys|catia|thermodynamics|fluid mechanics|finite element analysis|fea|cnc machining|mechatronics)\b/i.test(
      combined
    );

  if (isMechanical) {
    return "mechanical_engineering";
  }

  // 3. Finance, Accounts, Auditing, Statutory Compliances, Taxation, HR, Payroll
  const isExplicitTechRole = /\b(software|developer|engineer|full-stack|fullstack|frontend|backend|web dev|programmer|coder|computer science|cs undergraduate|cs student|b\.?tech cs)\b/i.test(roleText);

  const isFinanceHRRole = !isExplicitTechRole && /\b(chartered accountant|company secretary|cfo|chief financial officer|chro|chief human resources officer|finance manager|accounts manager|audit manager|head of finance|head of hr|f&a manager|statutory auditor|tax consultant|cost accountant|\bicwa\b|\bcma\b)\b/i.test(
    roleText
  );

  const hasStrongFinanceHRTerms = !isExplicitTechRole && /\b(financial accounting|corporate finance|statutory audit|internal audit|tax audit|direct taxation|indirect taxation|corporate taxation|\bgst practitioner\b|payroll administration|provident fund|\bepf\b|\besic\b|human resources management|\bhris\b|talent acquisition strategy|balance sheet preparation|general ledger accounting|bank reconciliation statement|gratuity fund|labour law compliance)\b/i.test(
    combined
  );

  if (isFinanceHRRole || hasStrongFinanceHRTerms) {
    return "finance_hr";
  }

  // 4. Cybersecurity & Information Security
  const isCybersecurity =
    /\b(cybersecurity|cyber security|information security|infosec|security engineer|penetration tester|ethical hacker|soc analyst|vulnerability assessment|incident response|cissp|comptia security|network security|owasp)\b/i.test(
      roleText
    ) ||
    /\b(penetration testing|kali linux|wireshark|metasploit|siem|soc analyst|incident response|owasp|network security|vulnerability assessment)\b/i.test(
      combined
    );

  if (isCybersecurity) {
    return "cybersecurity";
  }

  // 5. DevOps, Cloud Infrastructure & Site Reliability Engineering (SRE)
  const isDevOps = /\b(devops|sre|site reliability|cloud architect|cloud engineer|platform engineer|infrastructure engineer|kubernetes administrator|ci\/cd engineer|terraform)\b/i.test(
    roleText
  );

  if (isDevOps) {
    return "devops_cloud";
  }

  // 6. Mobile App Engineering (iOS / Android / Flutter / React Native)
  const isMobile =
    /\b(mobile developer|android developer|ios developer|flutter developer|react native developer|swift developer|kotlin developer|mobile engineer|app developer)\b/i.test(
      roleText
    );

  if (isMobile) {
    return "mobile_app";
  }

  // 7. Frontend & Web UI Engineering
  const isFrontend = /\b(frontend|front-end|ui engineer|ui developer|web designer|css specialist)\b/i.test(
    roleText
  );

  if (isFrontend) {
    return "frontend_web";
  }

  // 8. QA, Automation & Software Testing
  const isQA = /\b(qa engineer|quality assurance|sdet|software test engineer|automation tester|test automation|selenium tester|cypress tester|performance tester)\b/i.test(
    roleText
  );

  if (isQA) {
    return "qa_testing";
  }

  // 9. UI/UX & Digital Product Design
  if (
    /\b(ui\/ux|ux designer|ui designer|product designer|graphic designer|visual designer|art director|figma designer|interaction designer)\b/i.test(
      roleText
    )
  ) {
    return "design";
  }

  // 10. Data Science & Machine Learning / AI
  if (
    /\b(data scientist|machine learning engineer|ai engineer|nlp engineer|deep learning|data analyst|data engineer|mlops|pytorch|tensorflow)\b/i.test(
      roleText
    )
  ) {
    return "data_ai";
  }

  // 11. Product Management
  if (
    /\b(product manager|technical product manager|scrum master|agile product owner|director of product)\b/i.test(
      roleText
    )
  ) {
    return "product";
  }

  // 12. Executive & Operations Leadership
  if (
    /\b(chief operating officer|coo|vice president|vp operations|plant manager|operations director|director operations|managing director|supply chain director)\b/i.test(
      roleText
    )
  ) {
    return "executive";
  }

  // 13. Backend & Distributed Systems
  const isBackend = /\b(backend|back-end|api engineer|distributed systems|microservices engineer|golang developer|java backend|python backend)\b/i.test(
    roleText
  );

  if (isBackend) {
    return "backend_systems";
  }

  return "tech_software";
};

// Helper: Extract rich structured profile from raw portfolio object, string, or JSON
export const extractPortfolioProfile = (portfolioData) => {
  if (!portfolioData) {
    return {
      title: "Portfolio",
      bio: "",
      skills: [],
      projects: [],
      rawText: "",
      targetRole: "",
      targetCompany: "",
    };
  }

  if (typeof portfolioData === "string") {
    try {
      const parsed = JSON.parse(portfolioData);
      if (typeof parsed === "object" && parsed !== null) {
        return extractPortfolioProfile(parsed);
      }
    } catch {
      return {
        title: "Candidate Profile",
        bio: portfolioData.slice(0, 500),
        skills: [],
        projects: [],
        rawText: portfolioData.slice(0, 8000),
        targetRole: "",
        targetCompany: "",
      };
    }
  }

  const p = portfolioData || {};
  const targetRole = p.targetRole || p.hero?.title || "";
  const targetCompany = p.targetCompany || "";
  const tagline = p.tagline || p.hero?.tagline || "";
  const experience = Array.isArray(p.experience) ? p.experience : [];
  const title = p.title || p.hero?.name || targetRole || "Professional Portfolio";
  const bio = p.description || p.summary || p.hero?.tagline || p.about || "";
  const skills = Array.isArray(p.skills)
    ? p.skills.filter(Boolean).map((s) => String(s).trim())
    : [];

  const rawProjects = Array.isArray(p.projects) ? p.projects : [];
  const projects = rawProjects.map((proj, idx) => {
    let tech = [];
    if (Array.isArray(proj.techStack)) tech = proj.techStack;
    else if (Array.isArray(proj.tags)) tech = proj.tags;
    else if (typeof proj.techStack === "string") {
      tech = proj.techStack.split(",").map((s) => s.trim());
    } else if (typeof proj.tags === "string") {
      tech = proj.tags.split(",").map((s) => s.trim());
    }

    return {
      id: proj._id ? String(proj._id) : `proj-${idx + 1}`,
      title: proj.title || `Project ${idx + 1}`,
      description: proj.description || proj.summary || "",
      techStack: tech.filter(Boolean),
      liveUrl: proj.liveUrl || proj.link || "",
      githubUrl: proj.githubUrl || proj.github || "",
      metrics: proj.metrics || "",
    };
  });

  // Extract experience excerpt for rich rawText briefing
  const expExcerpts = Array.isArray(p.experience)
    ? p.experience
        .slice(0, 4)
        .map(
          (e) =>
            `- ${e.role || "Role"} at ${e.company || "Company"} (${e.duration || ""}): ${e.description || ""} ${
              Array.isArray(e.highlights) ? e.highlights.join(" | ") : ""
            }`
        )
        .join("\n")
    : "";

  return {
    title,
    bio,
    tagline,
    skills,
    projects,
    experience,
    template: p.template || "modern",
    certifications: Array.isArray(p.certifications) ? p.certifications : [],
    rawText: expExcerpts ? `Key Career Experience:\n${expExcerpts}` : "",
    targetRole,
    targetCompany,
  };
};

// 7-Category Comprehensive Portfolio Analyzer
export const analyzePortfolioComprehensive = async (portfolioData, options = {}) => {
  let { targetRole = "", targetCompany = "", inputType = "portfolio" } = options;

  const profile = extractPortfolioProfile(portfolioData);

  // Detect domain
  const domain = detectProfileDomain(targetRole, profile);
  const isCivilEngineering = domain === "civil_engineering";
  const isMechanical = domain === "mechanical_engineering";
  const isFinanceHR = domain === "finance_hr";
  const isCybersecurity = domain === "cybersecurity";
  const isDevOps = domain === "devops_cloud";
  const isFrontend = domain === "frontend_web";
  const isMobile = domain === "mobile_app";
  const isQA = domain === "qa_testing";
  const isExecutive = domain === "executive";
  const isDesign = domain === "design";
  const isDataAI = domain === "data_ai";
  const isProduct = domain === "product";

  // Resolve targetRole intelligently if defaulted or unspecified
  if (!targetRole || (targetRole.toLowerCase().includes("full stack") && (isFinanceHR || isCivilEngineering || isMechanical))) {
    targetRole = profile.targetRole || (isCivilEngineering ? "Civil & Structural Engineer" : isFinanceHR ? "Finance & Accounts (F&A) Manager" : isMechanical ? "Mechanical Design Engineer" : "Senior Full Stack Engineer");
  } else if (!targetRole) {
    targetRole = profile.targetRole || (isDesign ? "Senior Product Designer" : isProduct ? "Senior Product Manager" : isCybersecurity ? "Information Security Specialist" : "Senior Full Stack Engineer");
  }

  if (!targetCompany) {
    targetCompany = profile.targetCompany || (isCivilEngineering ? "Premier Infrastructure Consultancy" : isFinanceHR ? "Corporate Enterprise" : "Tier-1 Organization");
  }

  // Format real projects briefing for the model
  const projectBriefing = profile.projects.length > 0
    ? profile.projects
        .slice(0, 5)
        .map(
          (pr, idx) =>
            `${idx + 1}. Project "${pr.title}":
   - Stack / Focus Areas: ${pr.techStack.length ? pr.techStack.join(", ") : "Not specified"}
   - Description: "${pr.description || "No description provided"}"
   - Live URL / Proof: ${pr.liveUrl ? pr.liveUrl : "None"}`
        )
        .join("\n")
    : "No distinct projects listed in portfolio data.";

  const skillsBriefing = profile.skills.length > 0
    ? profile.skills.join(", ")
    : "None listed explicitly";

  const actualProjectNames = profile.projects.map((p) => `"${p.title}"`).join(", ");

  // Domain-adaptive system instructions
  let reviewerPersona = `You are a Principal Staff Engineer & Technical Hiring Manager at a Tier-1 tech company (${targetCompany}).
Conduct a fast, high-impact audit of this developer portfolio for the role of "${targetRole}".`;

  let impactFormulaRule = `In 'contentSuggestions', provide 2 impressive rewrites of actual project descriptions using Google's XYZ formula ("Accomplished [X] measured by [Y] by doing [Z]"). Include concrete metrics (% latency cut, throughput, scale).`;

  let weaknessesRule = `In 'weaknesses', 3 sharp engineering gaps (missing metrics, test coverage, CI/CD).`;
  let keywordsSample = `["Docker", "CI/CD", "Redis", "System Architecture", "PostgreSQL", "Unit Testing"]`;

  if (isCivilEngineering) {
    reviewerPersona = `You are a Chief Infrastructure Director & Principal Civil/Structural Engineering Consultant (${targetCompany}).
Conduct a rigorous engineering audit of this portfolio for the role of "${targetRole}". NEVER evaluate this candidate as a software web developer.`;
    impactFormulaRule = `In 'contentSuggestions', provide 2 impressive rewrites highlighting structural analysis, BIM coordination, code compliance (IS/Euro/ACI codes), and project scale ($ budget, sq. ft., completion timelines).`;
    weaknessesRule = `In 'weaknesses', 3 actionable civil engineering gaps (BIM integration, seismic/wind load analysis documentation, EPC vendor risk management).`;
    keywordsSample = `["AutoCAD Civil 3D", "Revit & BIM Architecture", "STAAD.Pro / ETABS", "Structural RCC Design", "Primavera P6 / Project Scheduling", "Statutory Building Codes"]`;
  } else if (isMechanical) {
    reviewerPersona = `You are a Chief Mechanical Engineer & Director of Hardware Systems (${targetCompany}).
Conduct an audit of this mechanical engineering portfolio for "${targetRole}". Focus on 3D CAD modeling, GD&T, FEA/CFD analysis, and manufacturing tolerances.`;
    impactFormulaRule = `In 'contentSuggestions', provide 2 impressive mechanical rewrites highlighting tolerance stack-up analysis, FEA stress optimization, and manufacturing cost reduction.`;
    weaknessesRule = `In 'weaknesses', 3 actionable gaps (GD&T blueprints, thermal/fatigue simulations, DFM/DFA documentation).`;
    keywordsSample = `["SOLIDWORKS / Catia", "GD&T (ASME Y14.5)", "FEA / Ansys Simulation", "DFM / DFA", "CNC Machining & Tooling", "Thermodynamic Analysis"]`;
  } else if (isFinanceHR) {
    reviewerPersona = `You are a Senior Corporate Executive Search Partner & C-Suite Talent Advisory Director specializing in Finance, Accounts, Statutory Governance, and Human Resources (${targetCompany}).
Conduct an executive audit of this senior leadership portfolio for the role of "${targetRole}". NEVER evaluate this as a software developer or suggest coding frameworks.`;
    impactFormulaRule = `In 'contentSuggestions', provide 2 impressive rewrites of actual projects using the Executive Impact formula (Scope [X], operational governance [Y], quantified ROI & statutory compliance [Z] - e.g. % audit turnaround reduction, zero-penalty compliance, working capital liquidity, payroll accuracy).`;
    weaknessesRule = `In 'weaknesses', 3 actionable executive gaps (quantified cost-containment metrics, ERP modernization documentation, talent retention frameworks).`;
    keywordsSample = `["Statutory Audits", "Corporate Taxation & GST", "Enterprise Risk Management", "EPF & ESI Compliance", "Payroll Automation & HRIS", "Working Capital Optimization"]`;
  } else if (isCybersecurity) {
    reviewerPersona = `You are a Chief Information Security Officer (CISO) & Principal Security Architect (${targetCompany}).
Conduct a cybersecurity audit for "${targetRole}". Focus on threat modeling, SIEM, penetration testing, and zero trust architecture.`;
    impactFormulaRule = `In 'contentSuggestions', provide 2 rewrites highlighting vulnerability remediation, security hardening, compliance (SOC 2, ISO 27001), and mean-time-to-detect (MTTD).`;
    weaknessesRule = `In 'weaknesses', 3 actionable security gaps (threat modeling documentation, automated DAST/SAST pipelines, incident response playbooks).`;
    keywordsSample = `["Vulnerability Assessment", "SIEM (Splunk/Wazuh)", "OWASP Top 10", "Network Penetration Testing", "Incident Response", "Zero Trust Architecture"]`;
  } else if (isDevOps) {
    reviewerPersona = `You are a Principal Cloud Infrastructure Architect & Head of Platform Engineering (${targetCompany}).
Conduct a DevOps audit for "${targetRole}". Focus on IaC, container orchestration, CI/CD pipelines, and observability.`;
    impactFormulaRule = `In 'contentSuggestions', provide 2 rewrites highlighting deployment frequency, rollback recovery (MTTR), infrastructure cost containment, and multi-region resilience.`;
    weaknessesRule = `In 'weaknesses', 3 actionable gaps (automated GitOps pipelines, cluster autoscaling, disaster recovery testing).`;
    keywordsSample = `["Kubernetes (CKA)", "Terraform (IaC)", "CI/CD Pipeline Automation", "Prometheus & Grafana", "Docker Containerization", "Multi-Region Cloud Resilience"]`;
  } else if (isFrontend) {
    reviewerPersona = `You are a Principal Frontend Architect & Staff UI Engineer (${targetCompany}).
Conduct a frontend engineering audit for "${targetRole}". Focus on modern component design, web performance, accessibility, and state management.`;
    impactFormulaRule = `In 'contentSuggestions', provide 2 rewrites highlighting Core Web Vitals optimization (LCP < 1.2s), bundle size reductions, and component reusability.`;
    weaknessesRule = `In 'weaknesses', 3 actionable frontend gaps (WCAG 2.1 AA accessibility, end-to-end testing, responsive design systems).`;
    keywordsSample = `["React / Modern Frameworks", "TypeScript", "State Management (Redux/Zustand)", "Web Performance & Core Web Vitals", "WCAG 2.1 Accessibility", "Tailwind CSS / Design Systems"]`;
  } else if (isMobile) {
    reviewerPersona = `You are a Principal Mobile Architect (${targetCompany}).
Conduct a mobile app engineering audit for "${targetRole}". Focus on app performance, offline-first architectures, native bridges, and mobile deployment.`;
    impactFormulaRule = `In 'contentSuggestions', provide 2 rewrites highlighting frame render rates (60fps), battery efficiency, offline data sync, and store ratings.`;
    weaknessesRule = `In 'weaknesses', 3 actionable mobile gaps (offline-first data persistence, automated device testing, push notification pipelines).`;
    keywordsSample = `["Flutter / React Native", "Android (Kotlin) / iOS (Swift)", "Offline Sync & Local DB", "Mobile CI/CD", "App Store Optimization (ASO)", "Push Notifications & Deep Linking"]`;
  } else if (isExecutive) {
    reviewerPersona = `You are a Senior Corporate Board Advisor & Executive Recruiter evaluating this executive operations portfolio for "${targetRole}" at ${targetCompany}.`;
    impactFormulaRule = `In 'contentSuggestions', provide 2 impressive executive rewrites highlighting P&L growth, EBITDA improvement, operational scalability, and governance.`;
    weaknessesRule = `In 'weaknesses', 3 executive gaps (P&L attribution, capex ROI, stakeholder governance).`;
    keywordsSample = `["P&L Management", "Strategic Operations", "Cross-Functional Leadership", "Corporate Governance", "Budget Forecasting", "Change Management"]`;
  } else if (isDesign) {
    reviewerPersona = `You are a VP of Product Design & Creative Director evaluating this portfolio for "${targetRole}" at ${targetCompany}.`;
    impactFormulaRule = `In 'contentSuggestions', provide 2 rewrites focusing on user research insights, design systems, usability benchmarks, and conversion lift.`;
    weaknessesRule = `In 'weaknesses', 3 design gaps (user testing validation, design system documentation, business metrics).`;
    keywordsSample = `["Design Systems", "User Research", "Interactive Prototyping", "Design Thinking", "Information Architecture", "WCAG Accessibility"]`;
  }

  // Compact JSON Schema for high-speed LLM generation (<2.5s)
  const prompt = `${reviewerPersona}

CANDIDATE PORTFOLIO PROFILE:
Portfolio Title: "${profile.title}"
Bio / Headline: "${profile.bio || "None provided"}"
Actual Projects:
${projectBriefing}
Skills / Competencies: ${skillsBriefing}
${profile.rawText ? `Raw Excerpt:\n${profile.rawText.slice(0, 1500)}` : ""}

CRITICAL RULES:
1. Directly cite actual project names (${actualProjectNames || "the listed work"}). No generic advice.
2. ${impactFormulaRule}
3. In 'strengths', 3 concrete strengths in actual projects and core domain competencies.
4. ${weaknessesRule}
5. In 'missingKeywords', 6 critical competencies missing from their profile for ${targetRole}.
6. In 'certificationsRecommendation', provide 2-3 prestigious, recognized industry credentials specifically tailored for ${targetRole} to fill the candidate's exact skill gaps. DO NOT recommend generic certificates unrelated to this discipline.

Return ONLY raw JSON with NO markdown:
{
  "overallScore": 84,
  "verdict": "Specific 2-sentence summary citing actual achievements and domain readiness.",
  "strengths": ["Concrete strength mentioning actual project", "Strength highlighting domain depth"],
  "weaknesses": ["Weakness citing project gap", "Domain gap for ${targetRole}"],
  "missingKeywords": ${keywordsSample},
  "contentSuggestions": [
    {
      "id": "sug-1",
      "field": "projects",
      "category": "Project Impact",
      "targetItem": "Project Name",
      "current": "Exact current text",
      "suggested": "Impressive domain-accurate rewrite with quantified impact and leadership scope",
      "impact": "Executive clarity and proof of domain excellence"
    }
  ],
  "certificationsRecommendation": [
    {
      "id": "cert-1",
      "name": "Official Certification Name",
      "issuer": "Official Authority (e.g. AWS / PMI / Autodesk / CNCF / Meta / ISACA / CompTIA)",
      "level": "Associate / Professional / Specialty",
      "priority": "High",
      "atsScoreBoost": "+16% ATS Match",
      "relevance": "Specific 1-sentence reason why this exact credential addresses candidate gaps for ${targetRole}"
    }
  ]
}`;

  // Try fast OpenRouter call with a strict 4.0-second timeout
  if (process.env.OPENROUTER_API_KEY) {
    try {
      console.log(`[Comprehensive Analyzer] Querying AI model: liquid/lfm-2.5-2.6b:free for role: ${targetRole}`);
      const aiPromise = axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "liquid/lfm-2.5-2.6b:free",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 650,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 4000,
        }
      );

      // Race against 4.2s timeout to prevent UI lag / network errors
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI response timeout (exceeded 4.2s)")), 4200)
      );

      const response = await Promise.race([aiPromise, timeoutPromise]);
      let text = response.data?.choices?.[0]?.message?.content || "";
      text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");

      if (start !== -1 && end !== -1 && end > start) {
        const parsed = JSON.parse(text.substring(start, end + 1));
        if (parsed && typeof parsed.overallScore === "number") {
          console.log(`[Comprehensive Analyzer] Successfully analyzed via AI model for ${targetRole}`);
          return normalizeComprehensiveAnalysis(parsed, targetRole, targetCompany, profile, options);
        }
      }
    } catch (err) {
      console.log(`[Comprehensive Analyzer] AI fast fallback triggered (${err.message})`);
    }
  }

  // Instant High-Fidelity Domain-Aware Fallback (< 5ms)
  return buildPortfolioAwareAnalysis(profile, targetRole, targetCompany, options);
};

export const buildStandardCategories = (score, targetRole = "Full Stack Engineer", missingKeywords = [], projects = [], domain = "tech_software") => {
  const isFinanceHR = domain === "finance_hr";
  const isExecutive = domain === "executive";

  if (isFinanceHR) {
    return {
      uiDesign: {
        score: Math.min(95, Math.round(score * 1.04)),
        label: "Executive Presentation & Structure",
        reason: "Visual hierarchy and executive typography present an authoritative, corporate-ready aesthetic.",
        actionableStep: "Incorporate distinguished credential badges for statutory certifications and key audit milestones.",
      },
      accessibility: {
        score: Math.min(92, Math.round(score * 0.98)),
        label: "Governance & Documentation Clarity",
        reason: "Clear section demarcation and readable typography facilitate seamless executive and board review.",
        actionableStep: "Ensure statutory compliance registers and organizational accomplishments have clear heading structures.",
      },
      performance: {
        score: Math.min(96, Math.round(score * 1.08)),
        label: "Page Load & Executive Accessibility",
        reason: "Fast page rendering with minimal layout shift ensures instant scannability on executive laptops and tablets.",
        actionableStep: "Optimize executive portrait assets and verify crisp rendering across corporate networks.",
      },
      content: {
        score: Math.min(90, Math.round(score * 0.93)),
        label: "Executive Leadership Impact & Quantified ROI",
        reason: "Career narratives demonstrate seasoned operational control; upgrading with quantified ROI will elevate C-suite impact.",
        actionableStep: `Incorporate quantified metrics (% audit speedup, $ cost containment) in ${projects[0] ? `"${projects[0].title}"` : "career highlights"}.`,
      },
      recruiterReadiness: {
        score: Math.min(95, Math.round(score * 0.96)),
        label: "Executive Search & ATS Alignment",
        reason: `Strong alignment with senior F&A and HR leadership competencies; featuring enterprise governance keywords (${(missingKeywords || []).slice(0, 2).join(", ")}) will optimize executive recruiter match.`,
        actionableStep: `Feature specialized compliance competencies (${(missingKeywords || []).slice(0, 3).join(", ")}) prominently in executive summary.`,
      },
      seo: {
        score: Math.min(92, Math.round(score * 1.02)),
        label: "Executive Branding & Discoverability",
        reason: "Meta titles and OpenGraph tags clearly reflect executive seniority and corporate domain.",
        actionableStep: `Include target executive role (${targetRole}) in corporate profile metadata.`,
      },
      responsiveness: {
        score: Math.min(96, Math.round(score * 1.06)),
        label: "Multi-Device & Tablet Fluidity",
        reason: "Fluid layout and card architecture adapt cleanly across tablets, executive laptops, and smartphones.",
        actionableStep: "Maintain generous tap targets on executive contact and credential links.",
      },
    };
  }

  return {
    uiDesign: {
      score: Math.min(95, Math.round(score * 1.04)),
      label: "UI Design & Presentation",
      reason: "Visual hierarchy and contrast are clean; typography and component spacing present a polished aesthetic.",
      actionableStep: "Incorporate luminous accent badges on project tech pills to enhance recruiter scannability.",
    },
    accessibility: {
      score: Math.min(92, Math.round(score * 0.98)),
      label: "Accessibility & Web Standards",
      reason: "Semantic headers and readable body contrast meet core WCAG expectations across viewport sizes.",
      actionableStep: "Ensure all external repository and live demo icon anchors contain explicit aria-label attributes.",
    },
    performance: {
      score: Math.min(96, Math.round(score * 1.08)),
      label: "Performance (Lighthouse)",
      reason: "Lightweight bundle footprint with minimal layout shift and fast initial DOM painting times.",
      actionableStep: "Preload primary font subsets and configure modern WebP image assets for media previews.",
    },
    content: {
      score: Math.min(90, Math.round(score * 0.93)),
      label: "Technical Depth & Storytelling",
      reason: `Projects demonstrate functional execution; upgrading descriptions with Google's XYZ formula will elevate candidate impact.`,
      actionableStep: `Incorporate quantified throughput metrics and architecture trade-offs in ${projects[0] ? `"${projects[0].title}"` : "project descriptions"}.`,
    },
    recruiterReadiness: {
      score: Math.min(95, Math.round(score * 0.96)),
      label: "Recruiter & ATS Keyword Density",
      reason: `Strong alignment with core competencies; adding specialized tags (${(missingKeywords || []).slice(0, 2).join(", ")}) will maximize ATS parser match.`,
      actionableStep: `Highlight enterprise keywords (${(missingKeywords || []).slice(0, 3).join(", ")}) directly in skills and experience sections.`,
    },
    seo: {
      score: Math.min(92, Math.round(score * 1.02)),
      label: "SEO & Discoverability",
      reason: "Page structure and title metadata are well-formed for search indexing and social sharing.",
      actionableStep: `Include target role (${targetRole}) explicitly in the OpenGraph meta description and title tag.`,
    },
    responsiveness: {
      score: Math.min(96, Math.round(score * 1.06)),
      label: "Mobile & Multi-Device Fluidity",
      reason: "Fluid grid and flex containers adapt seamlessly across smartphone, tablet, and desktop viewports.",
      actionableStep: "Maintain minimum 44px touch targets on mobile drawer navigation links.",
    },
  };
};

// =========================================================================
// STRATEGIC THEME, UI LAYOUT, & CERTIFICATIONS ADVISORY ENGINE
// =========================================================================

export const getThemeRecommendation = (domain, currentTemplate = "modern", targetCompany = "", targetRole = "") => {
  const themeMap = {
    finance_hr: {
      recommendedTemplateId: "corporate",
      recommendedTemplateName: "Corporate Executive",
      fitScore: 98,
      accentColor: "#1e3a8a",
      badge: "C-Suite & Boardroom Recommended",
      reason: "For executive leadership in Finance, Accounts, and HR, corporate decision-makers expect an understated, authoritative typographic hierarchy, structured credentials dossiers, and boardroom-ready trust badges rather than casual developer cards.",
      targetCompanyAffinity: targetCompany ? `Strong visual resonance for senior appointments at ${targetCompany}` : "Preferred visual language for enterprise boards & MNC hiring panels",
      keyUIFeatures: [
        "Executive dossier header with statutory trust badges",
        "Dual-column finance governance & headcount KPI metric cards",
        "Chronological compliance timeline with audit-grade legibility",
        "High-contrast printable PDF & executive review export view",
      ],
    },
    executive: {
      recommendedTemplateId: "corporate",
      recommendedTemplateName: "Corporate Executive",
      fitScore: 96,
      accentColor: "#0f172a",
      badge: "Executive Leadership Recommended",
      reason: "Executive search partners look for P&L ownership, organizational governance, and commercial leadership highlighted without visual clutter.",
      targetCompanyAffinity: targetCompany ? `Engineered for C-suite executive recruitment at ${targetCompany}` : "Standard visual aesthetic for Managing Directors & VPs",
      keyUIFeatures: [
        "Executive KPI bar (P&L, headcount, revenue scale)",
        "Strategic board governance highlight ribbon",
        "Formal credential & milestone audit track",
      ],
    },
    design: {
      recommendedTemplateId: "designer",
      recommendedTemplateName: "Designer Showcase",
      fitScore: 99,
      accentColor: "#ec4899",
      badge: "Design Lead Recommended",
      reason: "Design directors evaluate spatial typography, visual storytelling, and interactive case study depth within the first 10 seconds.",
      targetCompanyAffinity: targetCompany ? `Tailored for creative & product design roles at ${targetCompany}` : "Showcases visual taste and design system polish",
      keyUIFeatures: [
        "Interactive 3D case study carousel with responsive prototypes",
        "Figma design system token highlights & wireframe previews",
        "Fluid micro-animations with curated typography pairings",
      ],
    },
    data_ai: {
      recommendedTemplateId: "google",
      recommendedTemplateName: "Google Inspired",
      fitScore: 96,
      accentColor: "#4285f4",
      badge: "AI/ML & Data Engineering Recommended",
      reason: "Data scientists and AI engineers benefit from a structured research-paper aesthetic with clean mathematical clarity and reproducible notebook links.",
      targetCompanyAffinity: targetCompany ? `Engineered for Data & AI recruitment at ${targetCompany}` : "Favored by research labs and Big Tech data teams",
      keyUIFeatures: [
        "Model benchmark & accuracy metrics badge ribbon",
        "Embedded Jupyter / Colab demo link preview cards",
        "Data pipeline latency & throughput metric chips",
      ],
    },
    product: {
      recommendedTemplateId: "startup",
      recommendedTemplateName: "Startup Founder",
      fitScore: 95,
      accentColor: "#f59e0b",
      badge: "Product Leadership Recommended",
      reason: "Product management recruiters look for user problem framing, GTM traction metrics, and roadmap vision.",
      targetCompanyAffinity: targetCompany ? `Optimized for Product Management at ${targetCompany}` : "Highlights product-market fit and revenue growth",
      keyUIFeatures: [
        "Product roadmap & feature launch impact timeline",
        "A/B test retention & conversion rate KPI counter cards",
        "PRD and user research artifact callouts",
      ],
    },
    civil_engineering: {
      recommendedTemplateId: "corporate",
      recommendedTemplateName: "Corporate Executive",
      fitScore: 97,
      accentColor: "#d97706",
      badge: "Civil & Infrastructure Engineering Recommended",
      reason: "Infrastructure consulting panels, EPC contractors, and government tenders require formal project dossiers, site scale metrics, statutory engineering licenses, and BIM/CAD deliverables presented with corporate authority.",
      targetCompanyAffinity: targetCompany ? `Optimized for Infrastructure and Civil Engineering at ${targetCompany}` : "Standard visual aesthetic for EPC contractors and structural consultancies",
      keyUIFeatures: [
        "Infrastructure project dossier with structural scale & budget metrics",
        "Statutory engineering licensure & safety compliance registers",
        "High-contrast printable technical specifications and drawings export",
      ],
    },
    mechanical_engineering: {
      recommendedTemplateId: "developer",
      recommendedTemplateName: "Terminal Dev",
      fitScore: 95,
      accentColor: "#0284c7",
      badge: "Mechanical & Hardware Systems Recommended",
      reason: "Hardware engineering leads evaluate precision 3D CAD models, finite element analysis (FEA) data, GD&T tolerance blueprints, and DFM documentation.",
      targetCompanyAffinity: targetCompany ? `Engineered for Mechanical Hardware Systems at ${targetCompany}` : "Tailored for CAD specialists and robotics engineers",
      keyUIFeatures: [
        "Interactive 3D CAD model preview drawer",
        "FEA stress and thermal simulation benchmark chips",
        "ASME GD&T manufacturing tolerance blueprints",
      ],
    },
    cybersecurity: {
      recommendedTemplateId: "developer",
      recommendedTemplateName: "Terminal Dev",
      fitScore: 99,
      accentColor: "#06b6d4",
      badge: "Cybersecurity & SecOps Recommended",
      reason: "Security hiring managers and CISOs expect rapid threat modeling breakdowns, CVE discovery logs, SIEM incident logs, and offensive/defensive tooling depth.",
      targetCompanyAffinity: targetCompany ? `Tailored for Information Security at ${targetCompany}` : "Standard theme for SOC leads & penetration testers",
      keyUIFeatures: [
        "Terminal theme with vulnerability & mitigation breakdown",
        "CVE & bug bounty verification badges",
        "Interactive zero-trust architecture security drawer",
      ],
    },
    devops_cloud: {
      recommendedTemplateId: "developer",
      recommendedTemplateName: "Terminal Dev",
      fitScore: 98,
      accentColor: "#10b981",
      badge: "Cloud Infrastructure & SRE Recommended",
      reason: "Platform leads look for declarative IaC blueprints, Kubernetes cluster topology diagrams, and automated CI/CD pipeline reliability SLAs.",
      targetCompanyAffinity: targetCompany ? `Targeted for Cloud Platform Engineering at ${targetCompany}` : "Preferred theme for SREs and DevOps architects",
      keyUIFeatures: [
        "Interactive Kubernetes cluster topology drawer",
        "Live uptime & latency SLA performance metric ribbon",
        "Terraform & Docker container verification badges",
      ],
    },
    frontend_web: {
      recommendedTemplateId: "designer",
      recommendedTemplateName: "Designer Showcase",
      fitScore: 98,
      accentColor: "#8b5cf6",
      badge: "Frontend & UI Engineering Recommended",
      reason: "Frontend hiring teams prioritize interactive component responsiveness, fluid micro-animations, design system tokens, and Core Web Vitals performance.",
      targetCompanyAffinity: targetCompany ? `Tailored for Frontend UI Engineering at ${targetCompany}` : "Showcases responsive component polish and UI mastery",
      keyUIFeatures: [
        "Interactive live component sandboxes",
        "Design system token and state management previews",
        "Lighthouse 100/100 Core Web Vitals verification chips",
      ],
    },
    tech_software: {
      recommendedTemplateId: "developer",
      recommendedTemplateName: "Terminal Dev",
      fitScore: 97,
      accentColor: "#10b981",
      badge: "Engineering Lead Recommended",
      reason: "Engineering hiring managers look for instant code readability, GitHub activity commits, architecture diagrams, and sub-100ms load times.",
      targetCompanyAffinity: targetCompany ? `Targeted for Senior Software Engineering at ${targetCompany}` : "Standard theme for top GitHub contributors and systems engineers",
      keyUIFeatures: [
        "Terminal theme with syntax-highlighted code snippets",
        "Interactive system architecture diagram drawer",
        "Live API test sandbox and Docker/GitHub deploy badges",
      ],
    },
  };

  const rec = themeMap[domain] || themeMap.tech_software;
  const normalizedCurrent = (currentTemplate || "modern").toLowerCase();
  const normalizedRec = (rec.recommendedTemplateId || "").toLowerCase();
  return {
    ...rec,
    currentTemplate: currentTemplate || "modern",
    isAlreadyOptimal: normalizedCurrent === normalizedRec,
  };
};

export const getUISuggestions = (domain, targetRole = "", targetCompany = "") => {
  if (domain === "finance_hr" || domain === "executive") {
    return [
      {
        id: "ui-sug-1",
        title: "Statutory Trust & Governance Credential Badges",
        component: "Header / Hero Section",
        current: "Plain text bio without institutional authority markers",
        suggested: "Add verified trust badges: '100% Statutory Adherence Record', 'Audit-Verified F&A', 'ERP-Certified (SAP / Tally)'",
        impact: "Immediately signals C-suite fiscal responsibility and zero regulatory compliance risk to board members within 3 seconds.",
      },
      {
        id: "ui-sug-2",
        title: "Executive KPI Metrics Callout Row",
        component: "Above-the-fold Highlights",
        current: "Paragraph block of career text with no visual numbers",
        suggested: "Implement a 3-column metric banner: [35% Audit Cycle Acceleration] | [1,200+ Headcount Managed] | [Zero Penalty Compliance Record]",
        impact: "Improves executive scanning speed by 3x; hiring directors immediately grasp operational scale.",
      },
      {
        id: "ui-sug-3",
        title: "Direct C-Suite Executive Dossier Download CTA",
        component: "Navigation Bar & Hero Footer",
        current: "Standard contact button",
        suggested: "Prominent 'Download Executive Dossier (Confidential PDF)' with 1-click encrypted preview",
        impact: "Increases direct headhunter contact conversion by 45% for confidential executive search pipelines.",
      },
    ];
  }

  return [
    {
      id: "ui-sug-1",
      title: "Interactive System Architecture & Workflow Modals",
      component: "Project Showcase Cards",
      current: "Static descriptions with generic bullet points",
      suggested: "Embed interactive 'View Architecture Diagram' drawer showing data flow, caching tier, and API payload contracts",
      impact: "Positions candidate as a Staff-level systems architect capable of designing resilient distributed systems.",
    },
    {
      id: "ui-sug-2",
      title: "Quantified Production Metrics Ribbon",
      component: "Hero Header / Project Cards",
      current: "Tech badges only (e.g. React, Node.js)",
      suggested: "Add performance chips: [p99 < 85ms Latency] | [10k+ Daily Queries] | [99.98% SLA Availability]",
      impact: "Provides verifiable proof of engineering excellence and production scale to hiring managers.",
    },
    {
      id: "ui-sug-3",
      title: "Interactive Live Demo Sandbox & Swagger Drawer",
      component: "Featured Projects Section",
      current: "External outbound links that bounce visitors away",
      suggested: "In-situ preview modal with interactive REST API playground and live container health status",
      impact: "Keeps recruiters engaged on your portfolio 2.4x longer without tab-switching.",
    },
  ];
};

// Helper: Resolve official issuing authority portals for all industry certifications
export const getOfficialUrlForCert = (name = "", issuer = "") => {
  const n = (name || "").toLowerCase();
  const i = (issuer || "").toLowerCase();

  // AWS
  if (n.includes("aws") || i.includes("amazon web services")) {
    return "https://aws.amazon.com/certification/";
  }
  // CNCF / Kubernetes / Linux Foundation
  if (n.includes("kubernetes") || n.includes("cka") || n.includes("ckad") || n.includes("cks") || i.includes("cncf") || i.includes("linux foundation")) {
    return "https://www.cncf.io/certification/cka/";
  }
  // PMI / PMP / PfMP
  if (n.includes("pmp") || n.includes("pfmp") || n.includes("project management") || i.includes("pmi") || i.includes("project management institute")) {
    return "https://www.pmi.org/certifications/project-management-pmp";
  }
  // USGBC / GBCI / LEED
  if (n.includes("leed") || i.includes("usgbc") || i.includes("gbci")) {
    return "https://www.usgbc.org/credentials/leed-ap";
  }
  // Autodesk (Revit, Civil 3D, AutoCAD, BIM)
  if (n.includes("autodesk") || n.includes("revit") || n.includes("civil 3d") || n.includes("autocad") || i.includes("autodesk")) {
    return "https://www.autodesk.com/certification";
  }
  // Dassault Systèmes / SOLIDWORKS
  if (n.includes("solidworks") || n.includes("cswp") || i.includes("dassault")) {
    return "https://www.solidworks.com/sw/support/mcad-certification-programs.htm";
  }
  // Bentley Systems / STAAD.Pro
  if (n.includes("staad") || i.includes("bentley")) {
    return "https://www.bentley.com/software/staad/";
  }
  // ASME GD&T
  if (n.includes("asme") || n.includes("gd&t") || n.includes("gdt") || i.includes("asme")) {
    return "https://www.asme.org/certification-accreditation/personnel-certification/gdtp-certification";
  }
  // CompTIA
  if (n.includes("comptia") || n.includes("security+") || i.includes("comptia")) {
    return "https://www.comptia.org/certifications/security";
  }
  // (ISC)² / CISSP
  if (n.includes("cissp") || i.includes("isc2") || i.includes("(isc)²")) {
    return "https://www.isc2.org/certifications/cissp";
  }
  // EC-Council / CEH
  if (n.includes("ceh") || n.includes("ethical hacker") || i.includes("ec-council")) {
    return "https://www.eccouncil.org/train-certify/certified-ethical-hacker-ceh/";
  }
  // HashiCorp / Terraform
  if (n.includes("terraform") || i.includes("hashicorp")) {
    return "https://www.hashicorp.com/certification/terraform-associate";
  }
  // Meta
  if (n.includes("meta") || i.includes("meta")) {
    return n.includes("front")
      ? "https://www.coursera.org/professional-certificates/meta-front-end-developer"
      : "https://www.coursera.org/professional-certificates/meta-back-end-developer";
  }
  // Google Cloud
  if (n.includes("google cloud") || i.includes("google cloud")) {
    return "https://cloud.google.com/learn/certification";
  }
  // Google Developers / Android
  if (n.includes("android") || (i.includes("google") && !n.includes("cloud"))) {
    return "https://developers.google.com/certification/associate-android-developer";
  }
  // Microsoft / Azure
  if (n.includes("azure") || i.includes("microsoft")) {
    return "https://learn.microsoft.com/credentials/certifications/";
  }
  // ISTQB
  if (n.includes("istqb") || i.includes("istqb")) {
    return "https://www.istqb.org/certifications/certified-tester-foundation-level";
  }
  // ISACA / CISA
  if (n.includes("cisa") || i.includes("isaca")) {
    return "https://www.isaca.org/credentialing/cisa";
  }
  // SHRM
  if (n.includes("shrm") || i.includes("shrm")) {
    return "https://www.shrm.org/certification";
  }
  // ICAI / GST
  if (n.includes("gst") || i.includes("icai")) {
    return "https://www.icai.org/";
  }
  // SAP
  if (n.includes("sap") || i.includes("sap")) {
    return "https://learning.sap.com/certification";
  }
  // Nielsen Norman Group (NN/g)
  if (n.includes("nielsen") || n.includes("nn/g") || i.includes("nielsen")) {
    return "https://www.nngroup.com/ux-certification/";
  }
  // IAAP (Accessibility)
  if (n.includes("accessibility") || n.includes("cpwa") || n.includes("was") || i.includes("iaap")) {
    return "https://www.accessibilityassociation.org/page/CPWACertification";
  }
  // DeepLearning.AI
  if (n.includes("deeplearning") || i.includes("deeplearning")) {
    return "https://www.deeplearning.ai/";
  }
  // Scrum Alliance (CSPO)
  if (n.includes("cspo") || n.includes("scrum") || i.includes("scrum alliance")) {
    return "https://www.scrumalliance.org/get-certified/product-owner-track/certified-scrum-product-owner";
  }
  // Pragmatic Institute
  if (n.includes("pragmatic") || i.includes("pragmatic")) {
    return "https://www.pragmaticinstitute.com/";
  }
  // Databricks
  if (n.includes("databricks") || i.includes("databricks")) {
    return "https://www.databricks.com/learn/certification";
  }
  // MongoDB
  if (n.includes("mongodb") || i.includes("mongodb")) {
    return "https://learn.mongodb.com/pages/certification-program";
  }
  // Fallback Google Search
  return `https://www.google.com/search?q=${encodeURIComponent(`${name} ${issuer} official certification exam`)}`;
};

// Dynamic Resume & Role Aware Certifications Recommendation Engine
export const getCertificationsRecommendation = (
  domain = "tech_software",
  targetRole = "",
  targetCompany = "",
  profile = {},
  missingKeywords = []
) => {
  const roleLower = (targetRole || "").toLowerCase();
  const companyStr = targetCompany ? ` at ${targetCompany}` : "";
  const missingStr = (missingKeywords || []).join(" ").toLowerCase();

  // Extract all existing credentials and keywords from candidate profile to avoid redundant recommendations
  const existingText = [
    ...(profile?.certifications || []).map((c) => `${c.name || ""} ${c.issuer || ""}`),
    ...(profile?.skills || []),
    profile?.bio || "",
    profile?.rawText || "",
  ]
    .join(" ")
    .toLowerCase();

  const alreadyHolds = (term) => term && existingText.includes(term.toLowerCase());

  let catalog = [];

  if (domain === "civil_engineering") {
    catalog = [
      {
        id: "cert-pmp",
        name: "Project Management Professional (PMP)",
        issuer: "Project Management Institute (PMI)",
        level: "Capital Projects & EPC Delivery",
        priority: "High",
        atsScoreBoost: "+18% ATS Match",
        relevance: `Validates comprehensive oversight of major civil infrastructure, EPC vendor procurement, scheduling (Primavera/MS Project), and site risk management${companyStr}.`,
        recommendedCourses: ["PMI Official PMP Exam Prep Course"],
      },
      {
        id: "cert-revit-bim",
        name: "Autodesk Certified Professional: Revit for Structural & Architectural Design",
        issuer: "Autodesk",
        level: "BIM Modeling & Digital Engineering",
        priority: "High",
        atsScoreBoost: "+16% ATS Match",
        relevance: `Industry-standard proof of 3D BIM coordination, structural clash detection, parametric modeling, and ISO 19650 technical documentation${companyStr}.`,
        recommendedCourses: ["Autodesk Revit Certified Professional Prep"],
      },
      {
        id: "cert-leed-ap",
        name: "LEED AP Building Design + Construction (BD+C)",
        issuer: "U.S. Green Building Council (USGBC / GBCI)",
        level: "Sustainable Infrastructure & Green Rating",
        priority: "High",
        atsScoreBoost: "+15% ATS Match",
        relevance: `Crucial for modern eco-certified infrastructure developments, green structural standards, and lifecycle carbon minimization${companyStr}.`,
        recommendedCourses: ["USGBC LEED AP BD+C Comprehensive Study Track"],
      },
      {
        id: "cert-staad",
        name: "STAAD.Pro Certified Structural Engineer",
        issuer: "Bentley Systems",
        level: "Computational Structural Analysis",
        priority: "High",
        atsScoreBoost: "+14% ATS Match",
        relevance: `Verifies finite-element seismic analysis, dynamic wind load engineering, and reinforced concrete (RCC) / steel frame optimization${companyStr}.`,
        recommendedCourses: ["Bentley STAAD.Pro Advanced Structural Analysis"],
      },
      {
        id: "cert-civil3d",
        name: "Autodesk Certified Professional: Civil 3D for Infrastructure",
        issuer: "Autodesk",
        level: "Site & Highway Engineering",
        priority: "Medium",
        atsScoreBoost: "+12% ATS Match",
        relevance: `Validates highway grading, stormwater piping networks, corridor modeling, and volumetric earthwork calculations${companyStr}.`,
        recommendedCourses: ["Autodesk Civil 3D Infrastructure Certification Course"],
      },
    ];
  } else if (domain === "mechanical_engineering") {
    catalog = [
      {
        id: "cert-cswp",
        name: "Certified SOLIDWORKS Professional (CSWP)",
        issuer: "Dassault Systèmes",
        level: "Parametric 3D CAD Modeling",
        priority: "High",
        atsScoreBoost: "+16% ATS Match",
        relevance: `Gold standard proof of complex mechanical part modeling, assembly mating, and industrial design efficiency${companyStr}.`,
        recommendedCourses: ["SOLIDWORKS Official Certification Preparation"],
      },
      {
        id: "cert-gdt",
        name: "ASME Geometric Dimensioning & Tolerancing Professional (GDTP)",
        issuer: "American Society of Mechanical Engineers (ASME)",
        level: "Manufacturing & Tolerance Standards",
        priority: "High",
        atsScoreBoost: "+15% ATS Match",
        relevance: `Validates precision manufacturing blueprints according to ASME Y14.5 standards, minimizing machining re-work${companyStr}.`,
        recommendedCourses: ["ASME Y14.5 GD&T Comprehensive Training"],
      },
      {
        id: "cert-sixsigma",
        name: "Lean Six Sigma Green Belt (LSSGB)",
        issuer: "ASQ / IASSC",
        level: "Process & Quality Optimization",
        priority: "High",
        atsScoreBoost: "+14% ATS Match",
        relevance: `Proves DMAIC data-driven defect reduction, manufacturing throughput gains, and operational excellence${companyStr}.`,
        recommendedCourses: ["ASQ Certified Six Sigma Green Belt Track"],
      },
      {
        id: "cert-ansys",
        name: "Ansys Certified Simulation Specialist: Structural FEA",
        issuer: "Ansys",
        level: "Computational FEA & CFD",
        priority: "Medium",
        atsScoreBoost: "+12% ATS Match",
        relevance: `Demonstrates high-fidelity stress distribution, thermal fatigue, and dynamic vibrational simulations${companyStr}.`,
        recommendedCourses: ["Ansys Mechanical Structural FEA Academy"],
      },
    ];
  } else if (domain === "cybersecurity") {
    catalog = [
      {
        id: "cert-secplus",
        name: "CompTIA Security+ (SY0-701)",
        issuer: "CompTIA",
        level: "Foundational Security Baseline",
        priority: "High",
        atsScoreBoost: "+15% ATS Match",
        relevance: `Industry baseline validating core threat intelligence, cryptography, enterprise network defenses, and compliance${companyStr}.`,
        recommendedCourses: ["CompTIA Security+ Official Cert Guide Track"],
      },
      {
        id: "cert-ceh",
        name: "Certified Ethical Hacker (CEH v12)",
        issuer: "EC-Council",
        level: "Offensive Security & Red Teaming",
        priority: "High",
        atsScoreBoost: "+16% ATS Match",
        relevance: `Verifies practical attack vector reconnaissance, vulnerability exploitation, and penetration testing methodologies${companyStr}.`,
        recommendedCourses: ["EC-Council Official CEH Master Program"],
      },
      {
        id: "cert-cissp",
        name: "Certified Information Systems Security Professional (CISSP)",
        issuer: "(ISC)²",
        level: "Senior Information Security Leadership",
        priority: "High",
        atsScoreBoost: "+18% ATS Match",
        relevance: `Elite global credential validating enterprise security architecture, identity governance, and risk mitigation${companyStr}.`,
        recommendedCourses: ["(ISC)² Official CISSP CBK Training Seminar"],
      },
      {
        id: "cert-aws-sec",
        name: "AWS Certified Security - Specialty",
        issuer: "Amazon Web Services",
        level: "Cloud Security Architecture",
        priority: "High",
        atsScoreBoost: "+16% ATS Match",
        relevance: `Proves fine-grained IAM policy least privilege, AWS KMS encryption pipelines, and automated cloud incident response${companyStr}.`,
        recommendedCourses: ["AWS Certified Security Specialty Learning Path"],
      },
    ];
  } else if (domain === "devops_cloud") {
    catalog = [
      {
        id: "cert-cka",
        name: "Certified Kubernetes Administrator (CKA)",
        issuer: "Cloud Native Computing Foundation (CNCF)",
        level: "Container Orchestration & Cluster Ops",
        priority: "High",
        atsScoreBoost: "+18% ATS Match",
        relevance: `Gold standard hands-on practical exam verifying cluster networking, pod autoscaling, ingress, and production troubleshooting${companyStr}.`,
        recommendedCourses: ["CKA with Practice Tests (Linux Foundation / KodeKloud)"],
      },
      {
        id: "cert-terraform",
        name: "HashiCorp Certified: Terraform Associate (003)",
        issuer: "HashiCorp",
        level: "Infrastructure as Code (IaC)",
        priority: "High",
        atsScoreBoost: "+15% ATS Match",
        relevance: `Validates declarative multi-cloud provisioning, modular state management, and immutable infrastructure pipelines${companyStr}.`,
        recommendedCourses: ["HashiCorp Certified Terraform Associate Course"],
      },
      {
        id: "cert-aws-devops",
        name: "AWS Certified DevOps Engineer - Professional",
        issuer: "Amazon Web Services",
        level: "Continuous Delivery & System Automation",
        priority: "High",
        atsScoreBoost: "+16% ATS Match",
        relevance: `Proves automated blue/green canary deployments, CodePipeline CI/CD automation, and cloud monitoring at scale${companyStr}.`,
        recommendedCourses: ["AWS Certified DevOps Engineer Professional Track"],
      },
      {
        id: "cert-cks",
        name: "Certified Kubernetes Security Specialist (CKS)",
        issuer: "Cloud Native Computing Foundation (CNCF)",
        level: "Container Hardening & Threat Defense",
        priority: "Medium",
        atsScoreBoost: "+14% ATS Match",
        relevance: `Demonstrates container image vulnerability scanning, Falco runtime monitoring, and Kubernetes control plane hardening${companyStr}.`,
        recommendedCourses: ["CKS Certified Kubernetes Security Specialist Course"],
      },
    ];
  } else if (domain === "frontend_web") {
    catalog = [
      {
        id: "cert-meta-front",
        name: "Meta Front-End Developer Professional Certificate",
        issuer: "Meta",
        level: "Production React Frameworks",
        priority: "High",
        atsScoreBoost: "+15% ATS Match",
        relevance: `Verifies mastery of modern React hooks, state management, responsive UI component libraries, and client-side testing${companyStr}.`,
        recommendedCourses: ["Meta Front-End Developer Professional Track"],
      },
      {
        id: "cert-aws-dev",
        name: "AWS Certified Developer - Associate",
        issuer: "Amazon Web Services",
        level: "Cloud-Native App Deployment",
        priority: "High",
        atsScoreBoost: "+15% ATS Match",
        relevance: `Validates serverless frontend hosting (CloudFront, S3), Cognito user auth, and API Gateway client integrations${companyStr}.`,
        recommendedCourses: ["AWS Certified Developer Associate Learning Path"],
      },
      {
        id: "cert-was",
        name: "Certified Web Accessibility Specialist (WAS)",
        issuer: "International Association of Accessibility Professionals (IAAP)",
        level: "WCAG 2.1 AA Compliance",
        priority: "High",
        atsScoreBoost: "+14% ATS Match",
        relevance: `High-demand enterprise proof of accessible semantic HTML, ARIA patterns, keyboard navigation, and screen reader compliance${companyStr}.`,
        recommendedCourses: ["IAAP Web Accessibility Core Competencies"],
      },
      {
        id: "cert-google-web",
        name: "Google Mobile Web Specialist",
        issuer: "Google Developers",
        level: "Performance & PWA Architecture",
        priority: "Medium",
        atsScoreBoost: "+12% ATS Match",
        relevance: `Proves sub-second Core Web Vitals optimization, Service Worker caching, and offline-first web experiences${companyStr}.`,
        recommendedCourses: ["Google Web Performance & PWA Specialist Track"],
      },
    ];
  } else if (domain === "backend_systems") {
    catalog = [
      {
        id: "cert-aws-pro",
        name: "AWS Certified Solutions Architect - Professional",
        issuer: "Amazon Web Services",
        level: "Distributed Systems & Cloud Scale",
        priority: "High",
        atsScoreBoost: "+18% ATS Match",
        relevance: `Validates high-throughput microservices, multi-region database failovers, event-driven architectures, and cost containment${companyStr}.`,
        recommendedCourses: ["AWS Certified Solutions Architect Official Study Track"],
      },
      {
        id: "cert-ckad",
        name: "Certified Kubernetes Application Developer (CKAD)",
        issuer: "Cloud Native Computing Foundation (CNCF)",
        level: "Containerized Backend Services",
        priority: "High",
        atsScoreBoost: "+16% ATS Match",
        relevance: `Proves production containerized backend design, persistent volume storage, service discovery, and zero-downtime rolling updates${companyStr}.`,
        recommendedCourses: ["CKAD with Practice Tests (Linux Foundation / KodeKloud)"],
      },
      {
        id: "cert-meta-back",
        name: "Meta Certified Back-End Developer",
        issuer: "Meta",
        level: "RESTful APIs & Relational DBs",
        priority: "High",
        atsScoreBoost: "+14% ATS Match",
        relevance: `Verifies production API design, relational SQL indexing, microservice communication, and authentication security${companyStr}.`,
        recommendedCourses: ["Meta Back-End Developer Professional Certificate"],
      },
      {
        id: "cert-mongo",
        name: "MongoDB Certified Developer Associate",
        issuer: "MongoDB Inc.",
        level: "NoSQL Data Modeling",
        priority: "Medium",
        atsScoreBoost: "+12% ATS Match",
        relevance: `Demonstrates high-performance document schema design, aggregation pipeline query optimization, and replica set sharding${companyStr}.`,
        recommendedCourses: ["MongoDB University Developer Certification Track"],
      },
    ];
  } else if (domain === "mobile_app") {
    catalog = [
      {
        id: "cert-android",
        name: "Google Associate Android Developer",
        issuer: "Google Developers",
        level: "Native Kotlin & Android Architecture",
        priority: "High",
        atsScoreBoost: "+16% ATS Match",
        relevance: `Official Google credential proving Jetpack Compose UI, Room persistence, background worker jobs, and Android lifecycle hygiene${companyStr}.`,
        recommendedCourses: ["Google Android Developer Fundamentals Track"],
      },
      {
        id: "cert-react-native",
        name: "Meta React Native Specialization",
        issuer: "Meta",
        level: "Cross-Platform Mobile Engineering",
        priority: "High",
        atsScoreBoost: "+15% ATS Match",
        relevance: `Verifies production iOS and Android compilation from a shared React codebase with native module bridge integrations${companyStr}.`,
        recommendedCourses: ["Meta React Native Specialization"],
      },
      {
        id: "cert-apple-ios",
        name: "Apple Certified iOS App Developer (SwiftUI)",
        issuer: "Apple Inc.",
        level: "Native iOS Architecture",
        priority: "High",
        atsScoreBoost: "+15% ATS Match",
        relevance: `Validates declarative SwiftUI layout architecture, CoreData offline caching, and App Store submission readiness${companyStr}.`,
        recommendedCourses: ["Apple Developer SwiftUI Mastery Series"],
      },
    ];
  } else if (domain === "qa_testing") {
    catalog = [
      {
        id: "cert-istqb",
        name: "ISTQB Certified Tester - Foundation Level (CTFL)",
        issuer: "International Software Testing Qualifications Board (ISTQB)",
        level: "Global Quality Assurance Standard",
        priority: "High",
        atsScoreBoost: "+16% ATS Match",
        relevance: `Global benchmark validating test case boundary value analysis, regression management, and defect lifecycle documentation${companyStr}.`,
        recommendedCourses: ["ISTQB Certified Tester Official Study Track"],
      },
      {
        id: "cert-selenium",
        name: "Certified Professional Selenium Automation Tester (CP-SAT)",
        issuer: "Agile Testing Alliance",
        level: "End-to-End Test Automation",
        priority: "High",
        atsScoreBoost: "+15% ATS Match",
        relevance: `Proves robust automated browser test frameworks, Page Object Models (POM), and CI pipeline test execution${companyStr}.`,
        recommendedCourses: ["Selenium WebDriver Masterclass"],
      },
      {
        id: "cert-aws-devops-qa",
        name: "AWS Certified DevOps Engineer - Professional",
        issuer: "Amazon Web Services",
        level: "Automated Test CI/CD Integration",
        priority: "Medium",
        atsScoreBoost: "+14% ATS Match",
        relevance: `Validates automated test staging triggers, synthetic smoke tests, and continuous delivery quality gates${companyStr}.`,
        recommendedCourses: ["AWS Certified DevOps Engineer Learning Path"],
      },
    ];
  } else if (domain === "data_ai") {
    catalog = [
      {
        id: "cert-gcp-data",
        name: "Google Cloud Certified - Professional Data Engineer",
        issuer: "Google Cloud",
        level: "Big Data & Distributed Pipelines",
        priority: "High",
        atsScoreBoost: "+16% ATS Match",
        relevance: `Validates distributed stream processing, BigQuery data warehousing, and fault-tolerant ETL pipelines${companyStr}.`,
        recommendedCourses: ["Google Cloud Data Engineering Professional Certificate"],
      },
      {
        id: "cert-aws-ml",
        name: "AWS Certified Machine Learning - Specialty",
        issuer: "Amazon Web Services",
        level: "Production Machine Learning Systems",
        priority: "High",
        atsScoreBoost: "+18% ATS Match",
        relevance: `Proves production model training, SageMaker inference endpoints, and automated ML feature store pipelines${companyStr}.`,
        recommendedCourses: ["AWS ML Specialty Certification Track"],
      },
      {
        id: "cert-deeplearning",
        name: "DeepLearning.AI Generative AI & LLM Systems Specialization",
        issuer: "DeepLearning.AI / Andrew Ng",
        level: "Modern LLM Systems & RAG",
        priority: "High",
        atsScoreBoost: "+15% ATS Match",
        relevance: `Demonstrates practical parameter-efficient fine-tuning (LoRA), vector embeddings, and RAG query optimization${companyStr}.`,
        recommendedCourses: ["Generative AI with Large Language Models"],
      },
      {
        id: "cert-databricks",
        name: "Databricks Certified Data Engineer Professional",
        issuer: "Databricks",
        level: "Lakehouse & Spark Architecture",
        priority: "Medium",
        atsScoreBoost: "+14% ATS Match",
        relevance: `Validates Delta Lake streaming, Apache Spark cluster optimization, and automated data quality validation${companyStr}.`,
        recommendedCourses: ["Databricks Academy Data Engineer Track"],
      },
    ];
  } else if (domain === "design") {
    catalog = [
      {
        id: "cert-nng",
        name: "Nielsen Norman Group UX Master Certified (NN/g)",
        issuer: "Nielsen Norman Group",
        level: "Industry Gold Standard UX",
        priority: "High",
        atsScoreBoost: "+18% ATS Match",
        relevance: `Globally respected authority for qualitative user research, information architecture, and heuristic usability testing${companyStr}.`,
        recommendedCourses: ["NN/g Usability Specialist Certification"],
      },
      {
        id: "cert-ibm-design",
        name: "Enterprise Design Thinking - Co-Creator & Leader",
        issuer: "IBM",
        level: "Design Systems & Stakeholder Alignment",
        priority: "High",
        atsScoreBoost: "+14% ATS Match",
        relevance: `Validates facilitating high-impact cross-functional product sprints, design systems, and rapid prototyping workflows${companyStr}.`,
        recommendedCourses: ["IBM Enterprise Design Thinking Practitioner"],
      },
      {
        id: "cert-cpwa",
        name: "Certified Professional in Web Accessibility (CPWA)",
        issuer: "International Association of Accessibility Professionals (IAAP)",
        level: "WCAG / ADA Regulatory Standards",
        priority: "High",
        atsScoreBoost: "+15% ATS Match",
        relevance: `Crucial for enterprise design systems requiring ADA, Section 508, and WCAG 2.2 AA universal compliance${companyStr}.`,
        recommendedCourses: ["IAAP Accessibility Core Competencies"],
      },
    ];
  } else if (domain === "finance_hr") {
    catalog = [
      {
        id: "cert-cisa",
        name: "CISA (Certified Information Systems Auditor)",
        issuer: "ISACA",
        level: "Executive / Audit Governance",
        priority: "High",
        atsScoreBoost: "+16% ATS Match",
        relevance: `Gold standard for IT financial audits, ERP internal controls, and corporate compliance risk management${companyStr}.`,
        recommendedCourses: ["ISACA Official CISA Review Program"],
      },
      {
        id: "cert-shrm",
        name: "SHRM-SCP (Senior Certified Professional)",
        issuer: "Society for Human Resource Management (SHRM)",
        level: "Senior Strategic HR Leadership",
        priority: "High",
        atsScoreBoost: "+16% ATS Match",
        relevance: `Validates enterprise workforce strategy, human capital risk governance, and executive talent frameworks${companyStr}.`,
        recommendedCourses: ["SHRM Learning System for Senior HR Leaders"],
      },
      {
        id: "cert-gst",
        name: "Certified GST Practitioner & Statutory Tax Specialist",
        issuer: "Ministry of Finance / ICAI Approved",
        level: "Corporate Taxation & Statutory Filings",
        priority: "High",
        atsScoreBoost: "+14% ATS Match",
        relevance: `Verifies mastery in GST filing reconciliations, indirect taxation dispute defense, and statutory corporate audits${companyStr}.`,
        recommendedCourses: ["ICAI Advanced Certificate in Corporate Taxation & GST"],
      },
      {
        id: "cert-sap",
        name: "SAP Certified Application Associate - SAP S/4HANA Finance (FICO)",
        issuer: "SAP SE",
        level: "Enterprise ERP Finance",
        priority: "High",
        atsScoreBoost: "+15% ATS Match",
        relevance: `High-demand qualification verifying enterprise financial ledger accounting, capex control, and automated billing pipelines${companyStr}.`,
        recommendedCourses: ["SAP S/4HANA Financial Accounting Academy"],
      },
    ];
  } else if (domain === "product") {
    catalog = [
      {
        id: "cert-pmc",
        name: "Pragmatic Institute Certified Product Master (PMC-III)",
        issuer: "Pragmatic Institute",
        level: "Product Strategy & Go-To-Market",
        priority: "High",
        atsScoreBoost: "+16% ATS Match",
        relevance: `Industry-leading framework for market problem validation, pricing models, and product-market fit metrics${companyStr}.`,
        recommendedCourses: ["Pragmatic Institute Foundation & Focus Track"],
      },
      {
        id: "cert-cspo",
        name: "Certified Scrum Product Owner (CSPO)",
        issuer: "Scrum Alliance",
        level: "Agile Product Delivery",
        priority: "High",
        atsScoreBoost: "+14% ATS Match",
        relevance: `Validates backlog grooming, sprint priority trade-offs, and stakeholder alignment for rapid incremental value delivery${companyStr}.`,
        recommendedCourses: ["Official CSPO Training by Scrum Alliance"],
      },
      {
        id: "cert-reforge",
        name: "Reforge Product Strategy & Growth Certification",
        issuer: "Reforge",
        level: "Scale & Retention Metrics",
        priority: "High",
        atsScoreBoost: "+15% ATS Match",
        relevance: `Proves mastery of retention loops, monetization levers, customer lifetime value optimization, and viral growth systems${companyStr}.`,
        recommendedCourses: ["Reforge Product Strategy Program"],
      },
    ];
  } else if (domain === "executive") {
    catalog = [
      {
        id: "cert-pfmp",
        name: "Portfolio Management Professional (PfMP)",
        issuer: "Project Management Institute (PMI)",
        level: "C-Suite Capital & Strategic Governance",
        priority: "High",
        atsScoreBoost: "+18% ATS Match",
        relevance: `Validates corporate capital allocation, organizational risk appetite, and strategic alignment across company portfolios${companyStr}.`,
        recommendedCourses: ["PMI PfMP Executive Examination Track"],
      },
      {
        id: "cert-iod",
        name: "Chartered Director & Corporate Governance Fellow",
        issuer: "Institute of Directors (IoD)",
        level: "Boardroom & Fiduciary Oversight",
        priority: "High",
        atsScoreBoost: "+16% ATS Match",
        relevance: `Proves board-level fiduciary competence, ESG compliance oversight, and executive succession planning${companyStr}.`,
        recommendedCourses: ["IoD Certificate in Company Direction"],
      },
    ];
  } else {
    // Default: tech_software (with sub-role intelligence)
    if (roleLower.includes("front") || missingStr.includes("react") || missingStr.includes("css")) {
      return getCertificationsRecommendation("frontend_web", targetRole, targetCompany, profile, missingKeywords);
    }
    if (roleLower.includes("devops") || roleLower.includes("cloud") || missingStr.includes("kubernetes") || missingStr.includes("terraform")) {
      return getCertificationsRecommendation("devops_cloud", targetRole, targetCompany, profile, missingKeywords);
    }
    if (roleLower.includes("mobile") || roleLower.includes("android") || roleLower.includes("flutter")) {
      return getCertificationsRecommendation("mobile_app", targetRole, targetCompany, profile, missingKeywords);
    }
    if (roleLower.includes("qa") || roleLower.includes("test")) {
      return getCertificationsRecommendation("qa_testing", targetRole, targetCompany, profile, missingKeywords);
    }

    catalog = [
      {
        id: "cert-aws-pro",
        name: "AWS Certified Solutions Architect - Professional",
        issuer: "Amazon Web Services",
        level: "Cloud & Distributed Architecture",
        priority: "High",
        atsScoreBoost: "+18% ATS Match",
        relevance: `Validates resilient multi-region architectures, distributed microservices, and cost optimization${companyStr}.`,
        recommendedCourses: ["AWS Certified Solutions Architect Official Study Track"],
      },
      {
        id: "cert-cka",
        name: "Certified Kubernetes Administrator (CKA)",
        issuer: "Cloud Native Computing Foundation (CNCF)",
        level: "Container Orchestration & DevOps",
        priority: "High",
        atsScoreBoost: "+16% ATS Match",
        relevance: `Gold standard hands-on credential for container orchestration, cluster networking, and service mesh${companyStr}.`,
        recommendedCourses: ["CKA with Practice Tests (Linux Foundation / KodeKloud)"],
      },
      {
        id: "cert-meta-dev",
        name: "Meta Certified Back-End Developer / Front-End Engineer",
        issuer: "Meta",
        level: "Full Stack Engineering",
        priority: "Medium",
        atsScoreBoost: "+12% ATS Match",
        relevance: `Verifies mastery of production React frameworks, relational database optimization, and REST API design${companyStr}.`,
        recommendedCourses: ["Meta Advanced Software Engineering Professional Track"],
      },
    ];
  }

  // Filter out any certifications the candidate already holds on their profile/resume
  const filtered = catalog.filter((cert) => {
    const certWords = cert.name.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(" ");
    const primaryKeywords = certWords.filter((w) => w.length > 3 && !["certified", "associate", "professional", "master"].includes(w));
    if (cert.id && alreadyHolds(cert.id.replace("cert-", ""))) return false;
    if (primaryKeywords.length >= 2 && primaryKeywords.every((kw) => alreadyHolds(kw))) return false;
    return true;
  });

  const finalRecommendations = filtered.length >= 2 ? filtered : catalog;

  // Attach verified official URL to each credential
  return finalRecommendations.slice(0, 4).map((cert, idx) => ({
    ...cert,
    id: cert.id || `cert-${idx + 1}`,
    officialUrl: getOfficialUrlForCert(cert.name, cert.issuer),
  }));
};

// Normalization with profile awareness
export const normalizeComprehensiveAnalysis = (data, targetRole = "", targetCompany = "", profile = null, options = {}) => {
  const overall = typeof data.overallScore === "number" ? data.overallScore : 84;
  const domain = detectProfileDomain(targetRole, profile);
  const isCivilEngineering = domain === "civil_engineering";
  const isFinanceHR = domain === "finance_hr";

  const categories =
    data.categories && Object.keys(data.categories).length >= 5
      ? data.categories
      : buildStandardCategories(overall, targetRole, data.missingKeywords, profile?.projects || [], domain);

  const themeRecommendation =
    data.themeRecommendation ||
    getThemeRecommendation(domain, profile?.template || "modern", targetCompany, targetRole);

  const uiSuggestions = data.uiSuggestions || getUISuggestions(domain, targetRole, targetCompany);

  // Parse and validate AI-generated certifications if available; otherwise use intelligent dynamic catalog
  let certificationsRecommendation = [];
  if (Array.isArray(data.certificationsRecommendation) && data.certificationsRecommendation.length > 0) {
    certificationsRecommendation = data.certificationsRecommendation
      .filter((c) => c && c.name)
      .map((c, idx) => ({
        id: c.id || `cert-ai-${idx + 1}`,
        name: String(c.name).trim(),
        issuer: String(c.issuer || "Official Authority").trim(),
        level: c.level || "Industry Credential",
        priority: c.priority || "High",
        atsScoreBoost: c.atsScoreBoost || "+15% ATS Match",
        relevance: c.relevance || `Validates specialized domain authority and core competencies for ${targetRole}.`,
        recommendedCourses: Array.isArray(c.recommendedCourses) ? c.recommendedCourses : [],
        officialUrl: c.officialUrl || getOfficialUrlForCert(c.name, c.issuer),
      }));
  }

  if (certificationsRecommendation.length === 0) {
    certificationsRecommendation = getCertificationsRecommendation(
      domain,
      targetRole,
      targetCompany,
      profile,
      data.missingKeywords || []
    );
  }

  const contentSuggestions = Array.isArray(data.contentSuggestions) ? [...data.contentSuggestions] : [];

  // Theme Suggestion ONLY for portfolio analysis (never resume PDF) and ONLY if not already optimal
  const isResumeAnalysis =
    options?.inputType === "resume" ||
    (profile && typeof profile === "object" && profile.isResumeOnly) ||
    typeof profile === "string";

  if (
    !isResumeAnalysis &&
    !themeRecommendation.isAlreadyOptimal &&
    themeRecommendation.currentTemplate?.toLowerCase() !== themeRecommendation.recommendedTemplateId?.toLowerCase() &&
    !contentSuggestions.some((s) => s.field === "template")
  ) {
    contentSuggestions.unshift({
      id: "sug-theme",
      field: "template",
      category: "Theme & Visual Identity",
      targetItem: `Portfolio Layout Theme: ${themeRecommendation.recommendedTemplateName}`,
      current: `Currently active template: "${themeRecommendation.currentTemplate}"`,
      suggested: `Switch to "${themeRecommendation.recommendedTemplateName}" (${themeRecommendation.fitScore}% Domain Fit): ${themeRecommendation.reason}`,
      recommendedTemplateId: themeRecommendation.recommendedTemplateId,
      impact: `Instantly transforms portfolio presentation to match ${domain === "finance_hr" ? "corporate executive expectations" : "industry best practices"}.`,
    });
  }

  // Guarantee Actionable Certifications Suggestion
  if (!contentSuggestions.some((s) => s.field === "certifications")) {
    contentSuggestions.push({
      id: "sug-cert",
      field: "certifications",
      category: "High-Value Industry Certifications",
      targetItem: `Target Certifications for ${targetRole}`,
      current: profile?.certifications?.length ? `${profile.certifications.length} certifications listed` : "No industry certifications currently showcased",
      suggested: `Incorporate recognized credentials: ${certificationsRecommendation.slice(0, 2).map((c) => c.name).join(" and ")}`,
      recommendedCertifications: certificationsRecommendation.slice(0, 2),
      impact: `Dramatically elevates ATS qualification score by +${certificationsRecommendation[0]?.atsScoreBoost || "15%"} and validates domain authority.`,
    });
  }

  return {
    targetRole: targetRole || profile.targetRole || "Software Engineer",
    targetCompany: targetCompany || profile.targetCompany || "",
    overallScore: Math.min(99, Math.max(65, overall)),
    atsScore: Math.min(99, Math.max(65, overall)),
    verdict:
      data.verdict ||
      (isFinanceHR
        ? `Distinguished executive profile demonstrating seasoned mastery in Corporate Finance, Accounts, and Human Resources. Quantifying audit turnaround metrics and payroll automation initiatives will firmly position you among top-tier leadership candidates${targetCompany ? ` at ${targetCompany}` : ""}.`
        : `Candidate shows promising capability for ${targetRole || "target roles"}, with strong foundational alignment to compete for top positions${targetCompany ? ` at ${targetCompany}` : ""}.`),
    categories,
    strengths: Array.isArray(data.strengths) && data.strengths.length
      ? data.strengths
      : isFinanceHR
      ? [
          "Demonstrates dual-domain executive mastery across Corporate Finance & Accounts (F&A) and Human Resources operations.",
          "Verifiable track record managing complex statutory compliances, multi-tier tax audits, and enterprise financial risk.",
          "Strong leadership footprint in capital expenditure control and payroll governance across large-scale engineering operations.",
        ]
      : [
          `Solid project foundations with practical modern stack implementations.`,
          `Effective portfolio presentation with clean multi-page or single-page navigation.`,
          `Good baseline technical keyword coverage for modern web engineering.`,
        ],
    weaknesses: Array.isArray(data.weaknesses) && data.weaknesses.length
      ? data.weaknesses
      : isFinanceHR
      ? [
          "Project and experience summaries focus on operational duties; upgrading them with quantified financial ROI will maximize C-suite impact.",
          "Could explicitly document modern ERP platforms (SAP, Oracle Financials, Tally Prime) and automated HRIS workflow integrations.",
          "Recommend highlighting talent retention percentages and executive succession frameworks alongside statutory compliance milestones.",
        ]
      : [
          `Project narratives emphasize what features were built rather than production bottlenecks or architectural trade-offs solved.`,
          `Descriptions lack quantified business and performance metrics (e.g. latency, throughput, scale, test coverage).`,
          `Missing explicit proof of automated CI/CD pipelines, containerization, or cloud deployment practices.`,
        ],
    missingKeywords: Array.isArray(data.missingKeywords) && data.missingKeywords.length
      ? data.missingKeywords
      : isFinanceHR
      ? ["Statutory Audits", "Corporate Taxation & GST", "Enterprise Risk Management", "EPF & ESI Compliance", "Payroll Automation & HRIS", "Working Capital Optimization"]
      : ["Docker", "CI/CD Pipelines", "System Architecture", "Redis", "PostgreSQL", "Unit Testing"],
    contentSuggestions,
    designSuggestions: Array.isArray(data.designSuggestions) ? data.designSuggestions : [],
    themeRecommendation,
    uiSuggestions,
    certificationsRecommendation,
    domain,
    improvements: contentSuggestions.map((s) => s.suggested),
    analyzedAt: new Date(),
  };
};

// =========================================================================
// INTELLIGENT PORTFOLIO-AWARE HEURISTIC ENGINE (100% SPECIFIC TO USER'S DATA)
// =========================================================================
export const buildPortfolioAwareAnalysis = (profile, targetRole = "", targetCompany = "", options = {}) => {
  const { title, bio, tagline, skills, projects, experience = [] } = profile;

  // 1. Identify Domain
  const domain = detectProfileDomain(targetRole, profile);
  const isCivilEngineering = domain === "civil_engineering";
  const isMechanical = domain === "mechanical_engineering";
  const isFinanceHR = domain === "finance_hr";
  const isCybersecurity = domain === "cybersecurity";
  const isDevOps = domain === "devops_cloud";
  const isFrontend = domain === "frontend_web";
  const isMobile = domain === "mobile_app";
  const isQA = domain === "qa_testing";
  const isExecutive = domain === "executive";
  const isDesign = domain === "design";
  const isDataAI = domain === "data_ai";
  const isProduct = domain === "product";

  // Resolve targetRole intelligently if defaulted or unspecified
  if (!targetRole || (targetRole.toLowerCase().includes("full stack") && (isFinanceHR || isCivilEngineering || isMechanical))) {
    targetRole = profile.targetRole || (isCivilEngineering ? "Civil & Structural Engineer" : isFinanceHR ? "Finance & Accounts (F&A) Manager" : isMechanical ? "Mechanical Design Engineer" : "Senior Full Stack Engineer");
  } else if (!targetRole) {
    targetRole = profile.targetRole || (isDesign ? "Senior Product Designer" : isProduct ? "Senior Product Manager" : isCybersecurity ? "Information Security Specialist" : "Senior Full Stack Engineer");
  }

  if (!targetCompany) {
    targetCompany = profile.targetCompany || (isCivilEngineering ? "Premier Infrastructure Consultancy" : isFinanceHR ? "Corporate Enterprise" : "Top Organization");
  }

  // 2. Calculate Score Dynamically
  let score = 76;
  if (projects.length >= 3) score += 5;
  else if (projects.length >= 1) score += 3;

  if (skills.length >= 12) score += 5;
  else if (skills.length >= 6) score += 3;

  const allText = projects.map((p) => p.description).join(" ") + " " + bio;
  const hasMetrics = /\b(\d+[%kKmM+]|\d+\s*(ms|sec|users|queries|requests|rpm|yrs|years|cr|crore|lakh))\b/i.test(allText);
  if (hasMetrics) score += 5;

  const hasLiveLinks = projects.some((p) => Boolean(p.liveUrl));
  const hasGithub = projects.some((p) => Boolean(p.githubUrl));
  if (hasLiveLinks || isFinanceHR) score += 3;
  if (hasGithub) score += 2;

  score = Math.min(94, Math.max(70, score));

  // 3. Role-Specific Keyword Gaps Map
  const roleKeywordsMap = {
    finance_hr: [
      "Statutory Audits",
      "Corporate Taxation & GST",
      "Enterprise Risk Management",
      "EPF & ESI Compliance",
      "Payroll Systems & Automation",
      "Working Capital Optimization",
      "Financial Modeling & Budgeting",
      "Internal Controls & SOX",
      "HR Policies & Talent Acquisition",
      "ERP (SAP / Oracle / Tally)",
    ],
    executive: [
      "P&L Management",
      "Strategic Operations",
      "Cross-Functional Leadership",
      "Corporate Governance",
      "Budget Forecasting & Capex",
      "Change Management",
      "Vendor & Stakeholder Management",
    ],
    design: [
      "Design Systems & Tokens",
      "User Research & Usability Testing",
      "Interactive Prototyping",
      "Design Thinking",
      "Information Architecture",
      "WCAG Accessibility",
      "Motion & Micro-interactions",
    ],
    product: [
      "Product Roadmapping",
      "Agile / Scrum Methodologies",
      "A/B Testing & User Analytics",
      "User Journey Mapping",
      "Go-To-Market (GTM) Strategy",
      "PRD Documentation",
      "KPI & OKR Tracking",
    ],
    fullstack: [
      "Docker",
      "CI/CD Pipelines",
      "PostgreSQL",
      "Redis",
      "System Architecture",
      "RESTful APIs",
      "Unit Testing (Jest)",
      "Microservices",
      "AWS / Cloud Deployment",
      "GraphQL",
    ],
    frontend: [
      "TypeScript",
      "Next.js / SSR",
      "State Management (Redux/Zustand)",
      "Web Performance & Core Vitals",
      "TailwindCSS",
      "WCAG Accessibility",
      "Cypress / E2E Testing",
      "Responsive Layouts",
    ],
    backend: [
      "PostgreSQL / MongoDB",
      "Redis Caching",
      "Docker & Kubernetes",
      "Microservices Architecture",
      "gRPC / REST APIs",
      "Message Queues (Kafka/RabbitMQ)",
      "Database Indexing & Query Tuning",
      "Unit & Integration Testing",
    ],
    ai: [
      "PyTorch",
      "LLM Fine-tuning",
      "Vector Databases (Pinecone/Milvus)",
      "LangChain / LlamaIndex",
      "FastAPI",
      "Model Inference Optimization",
      "MLOps / ML Pipelines",
    ],
    civil_engineering: [
      "AutoCAD Civil 3D",
      "STAAD.Pro / ETABS",
      "BIM Coordination (Revit)",
      "Structural Analysis & RCC",
      "Project Estimation & BOQ",
      "Site Supervision & Quality",
      "Geotechnical / Soil Mechanics",
      "Construction Management",
    ],
    mechanical_engineering: [
      "SolidWorks / CATIA",
      "ANSYS (FEA & CFD)",
      "GD&T & Tolerance Analysis",
      "Thermal & Fluid Dynamics",
      "Mechatronics & Robotics",
      "Manufacturing & CNC",
      "DFM / DFA Principles",
      "Material Selection & Testing",
    ],
  };

  const roleKey = isFinanceHR
    ? "finance_hr"
    : isCivilEngineering
    ? "civil_engineering"
    : isMechanical
    ? "mechanical_engineering"
    : isExecutive
    ? "executive"
    : isDesign
    ? "design"
    : isProduct
    ? "product"
    : targetRole.toLowerCase().includes("front")
    ? "frontend"
    : targetRole.toLowerCase().includes("back")
    ? "backend"
    : targetRole.toLowerCase().includes("ai") || targetRole.toLowerCase().includes("machine")
    ? "ai"
    : "fullstack";

  const standardKeywords = roleKeywordsMap[roleKey] || roleKeywordsMap.fullstack;
  const existingSkillsLower = new Set(skills.map((s) => s.toLowerCase()));
  const missingKeywords = standardKeywords
    .filter((kw) => !existingSkillsLower.has(kw.toLowerCase().split(" ")[0]))
    .slice(0, 6);

  // 4. Generate Tailored Strengths Citing Real Projects
  const strengths = [];
  if (isFinanceHR) {
    strengths.push(
      "Demonstrates dual-domain executive mastery across Corporate Finance & Accounts (F&A) and Human Resources operations."
    );
    if (projects.length > 0) {
      strengths.push(
        `High-impact governance highlighted by "${projects[0].title}", establishing robust compliance and audit accuracy.`
      );
    }
    if (skills.length >= 8) {
      strengths.push(
        `Comprehensive regulatory and leadership coverage (${skills.slice(0, 6).join(", ")}) aligning with senior corporate mandates.`
      );
    }
  } else if (isCivilEngineering) {
    strengths.push(
      "Demonstrates solid civil engineering fundamentals across structural modeling, infrastructure design, and construction coordination."
    );
    if (projects.length > 0) {
      const p1 = projects[0];
      strengths.push(
        `Practical infrastructure execution highlighted by "${p1.title}", combining structural design tools with field-ready engineering deliverables.`
      );
    }
    if (skills.length >= 6) {
      strengths.push(
        `Core engineering tooling proficiency (${skills.slice(0, 6).join(", ")}) directly matching infrastructure consultant standards.`
      );
    }
  } else {
    if (projects.length > 0) {
      const p1 = projects[0];
      const techStr = p1.techStack.length ? p1.techStack.slice(0, 3).join(", ") : "modern full-stack libraries";
      strengths.push(
        `Strong core engineering showcased in "${p1.title}", combining ${techStr} with clean functional architecture.`
      );
    }
    if (projects.length > 1) {
      const titles = projects.slice(0, 3).map((p) => `"${p.title}"`).join(", ");
      strengths.push(
        `Demonstrated domain versatility across multiple distinct applications (${titles}), showing adaptability across real-world problem sets.`
      );
    }
    if (skills.length >= 8) {
      strengths.push(
        `Broad technical stack coverage (${skills.slice(0, 6).join(", ")}) aligning with high-demand competencies for ${targetRole}.`
      );
    }
  }

  // 5. Generate Tailored Weaknesses Citing Real Projects & Gaps
  const weaknesses = [];
  if (isFinanceHR) {
    weaknesses.push(
      `Project and operational descriptions for "${projects[0]?.title || "key initiatives"}" focus on operational duties; upgrading them with quantified financial ROI (% audit speedup, $ cost savings, zero-penalty track record) will maximize C-suite impact.`
    );
    weaknesses.push(
      `Could explicitly document modern enterprise ERP platforms (SAP, Oracle Financials, Tally Prime) and automated HRIS workflow integrations.`
    );
    if (missingKeywords.length > 0) {
      weaknesses.push(
        `Recommended inclusion of emerging executive governance proficiencies (${missingKeywords.slice(0, 3).join(", ")}).`
      );
    }
  } else if (isCivilEngineering) {
    weaknesses.push(
      `Project descriptions for "${projects[0]?.title || "civil projects"}" focus on operational duties; upgrading them with quantified engineering metrics (e.g. square footage managed, structural safety factors, cost variance, schedule compliance) will maximize recruiter impact.`
    );
    weaknesses.push(
      "Could explicitly showcase advanced BIM coordination (Autodesk Revit / Navisworks) or structural finite element simulations (STAAD.Pro / ETABS)."
    );
    if (missingKeywords.length > 0) {
      weaknesses.push(
        `Recommended inclusion of standard infrastructure proficiencies (${missingKeywords.slice(0, 3).join(", ")}).`
      );
    }
  } else {
    if (projects.length > 0 && !hasMetrics) {
      weaknesses.push(
        `Project descriptions for "${projects[0].title}"${projects[1] ? ` and "${projects[1].title}"` : ""} describe what features were created rather than quantifiable outcomes (e.g. latency reduction, query throughput, active users, load times).`
      );
    } else {
      weaknesses.push(
        `Impact metrics could be more explicitly tied to business ROI and performance benchmarks ($ saved, % faster build times, data volume handled).`
      );
    }
    if (projects.length > 0) {
      weaknesses.push(
        `Limited architectural trade-off documentation: projects should explain WHY specific frameworks, databases, or state management tools were selected over alternatives.`
      );
    }
    if (missingKeywords.length > 0) {
      weaknesses.push(
        `Noticeable absence of enterprise practices expected for ${targetRole} (${missingKeywords.slice(0, 3).join(", ")}).`
      );
    }
  }

  // 6. Generate Impressive Before vs After Diffs Using User's ACTUAL Content
  const contentSuggestions = [];

  if (isFinanceHR) {
    // Project 1 Suggestion (Statutory / Compliance / Finance)
    if (projects.length > 0) {
      const p = projects[0];
      const currentText = p.description || `Managed statutory and compliance operations for ${p.title}.`;
      const suggestedText = `Spearheaded enterprise statutory compliance and taxation modernization across corporate entities; eliminated non-compliance exposure by maintaining 100% on-time audit filings, streamlined tax reconciliation workflows, and institutionalized automated statutory registers that reduced annual audit cycle duration by 35%.`;

      contentSuggestions.push({
        id: `sug-proj-1`,
        field: "projects",
        category: "Statutory Governance & Audit Modernization",
        targetItem: `Project: ${p.title}`,
        current: currentText,
        suggested: suggestedText,
        impact: "Demonstrates executive governance, zero-variance statutory adherence & risk mitigation",
      });
    }

    // Project 2 Suggestion (HR / Payroll Infrastructure)
    if (projects.length > 1) {
      const p = projects[1];
      const currentText = p.description || `Directed HR operations and payroll for ${p.title}.`;
      const suggestedText = `Architected and executed an end-to-end HR, talent acquisition, and payroll infrastructure overhaul for 1,200+ employees; integrated automated attendance-to-payroll pipelines, ensured zero-variance statutory deductions (EPF, ESI, TDS), and accelerated monthly payroll disbursement cycles by 40%.`;

      contentSuggestions.push({
        id: `sug-proj-2`,
        field: "projects",
        category: "Human Capital Operations & Payroll Infrastructure",
        targetItem: `Project: ${p.title}`,
        current: currentText,
        suggested: suggestedText,
        impact: "Validates enterprise talent operations, compensation governance & workflow automation",
      });
    }

    // Project 3 Suggestion (Financial Control / Working Capital)
    if (projects.length > 2) {
      const p = projects[2];
      const currentText = p.description || `Managed financial control and commercial operations for ${p.title}.`;
      const suggestedText = `Structured robust expenditure monitoring and vendor billing reconciliation pipelines for high-capital engineering infrastructure projects; improved working capital liquidity and reduced vendor payment turnaround cycles by 25% while maintaining rigorous fiscal discipline.`;

      contentSuggestions.push({
        id: `sug-proj-3`,
        field: "projects",
        category: "Financial Control & Capital Governance",
        targetItem: `Project: ${p.title}`,
        current: currentText,
        suggested: suggestedText,
        impact: "Demonstrates cash flow optimization, vendor governance & capital expenditure discipline",
      });
    }

    // Hero Tagline Suggestion
    const currentTagline = tagline || `${targetRole} specializing in Corporate Finance, Statutory Compliances & Human Resources.`;
    const suggestedTagline = `${targetRole} | Corporate Finance (F&A), Statutory Governance, Audits & Strategic Talent Operations`;

    contentSuggestions.push({
      id: `sug-tagline`,
      field: "hero",
      category: "Executive Hero Pitch & Headline",
      targetItem: "Hero Headline & Tagline",
      current: currentTagline,
      suggested: suggestedTagline,
      impact: "Captures 3x higher executive recruiter engagement within first 3 seconds of scanning",
    });

    // Bio / Headline Suggestion for Finance & HR Executive
    const currentBio = bio || `Accomplished ${targetRole} with extensive domain expertise.`;
    const suggestedBio = `Accomplished ${targetRole} with proven executive leadership in corporate finance, statutory compliances, taxation, and human capital strategy. Proven record directing multi-tier statutory audits, instituting automated payroll & reconciliation frameworks, and aligning talent operations to safeguard enterprise profitability and maintain 100% regulatory compliance.`;

    contentSuggestions.push({
      id: `sug-bio`,
      field: "about",
      category: "Hero Tagline & Executive Positioning",
      targetItem: "Professional Bio & Headline",
      current: currentBio,
      suggested: suggestedBio,
      impact: "Positions you as a high-impact corporate executive and compliance authority within 5 seconds of scanning",
    });

    // Primary Career Experience Suggestion
    if (experience.length > 0) {
      const exp = experience[0];
      const currentExpText = exp.description || `Directing corporate finance, accounting, and human resources operations at ${exp.company}.`;
      const suggestedExpText = `Direct enterprise corporate finance, statutory compliance, and human resources governance across engineering operations; spearhead multi-tier statutory audits, institutionalize automated attendance-to-payroll pipelines, and administer fiscal controls safeguarding bottom-line margins.`;

      contentSuggestions.push({
        id: `sug-exp-1`,
        field: "experience",
        category: "Executive Leadership Scope & Board Governance",
        targetItem: `Experience: ${exp.role} at ${exp.company}`,
        current: currentExpText,
        suggested: suggestedExpText,
        impact: "Validates high-level executive authority, governance rigor & institutional leadership",
      });
    }
  } else {
    // Technical Developer Suggestions
    if (projects.length > 0) {
      const p = projects[0];
      const stack = p.techStack.length ? p.techStack.slice(0, 3).join(" and ") : "React and Node.js microservices";
      const currentText = p.description || `Built a web application using ${stack}.`;
      const suggestedText = `Architected and deployed "${p.title}", a scalable full-stack platform leveraging ${stack}; engineered modular API endpoints and optimized database indexing to achieve a 38% reduction in response latency while supporting 5k+ active sessions with 99.9% uptime.`;

      contentSuggestions.push({
        id: `sug-proj-1`,
        field: "projects",
        category: "Project Architecture & Impact",
        targetItem: `Project: ${p.title}`,
        current: currentText,
        suggested: suggestedText,
        impact: "Demonstrates production scale, latency discipline & architecture rigor",
      });
    }

    if (projects.length > 1) {
      const p = projects[1];
      const stack = p.techStack.length ? p.techStack.slice(0, 3).join(" and ") : "modern frontend and cloud services";
      const currentText = p.description || `Developed an application called ${p.title}.`;
      const isML = p.techStack.some((t) => /ml|python|flask|ai|vision|pcod/i.test(t)) || /risk|prediction|emotion/i.test(p.title);

      const suggestedText = isML
        ? `Engineered "${p.title}", an end-to-end predictive application using ${stack}; trained classification models achieving 93.4% validation accuracy and deployed high-concurrency REST inference endpoints with sub-150ms round-trip latency.`
        : `Spearheaded development of "${p.title}", an interactive platform built with ${stack}; integrated automated state synchronization, reduced initial bundle load by 45%, and ensured 100% WCAG AA accessibility compliance across devices.`;

      contentSuggestions.push({
        id: `sug-proj-2`,
        field: "projects",
        category: "Technical Depth & Storytelling",
        targetItem: `Project: ${p.title}`,
        current: currentText,
        suggested: suggestedText,
        impact: "Highlights specialized domain execution and performance engineering",
      });
    }

    if (projects.length > 2) {
      const p = projects[2];
      const stack = p.techStack.length ? p.techStack.slice(0, 3).join(" and ") : "cloud-native microservices";
      const currentText = p.description || `Developed ${p.title}.`;
      const suggestedText = `Engineered "${p.title}" using ${stack}; designed resilient asynchronous event processing pipelines and automated end-to-end telemetry, maintaining 99.95% system uptime under peak traffic.`;

      contentSuggestions.push({
        id: `sug-proj-3`,
        field: "projects",
        category: "Systems Engineering & Reliability",
        targetItem: `Project: ${p.title}`,
        current: currentText,
        suggested: suggestedText,
        impact: "Proves fault tolerance, telemetry instrumentation & production stability",
      });
    }

    // Hero Tagline Suggestion
    const currentTagline = tagline || `${targetRole} | Software Engineer`;
    const suggestedTagline = `${targetRole} | High-Concurrency Distributed Systems, Modern Cloud Architecture & Full-Lifecycle Engineering`;

    contentSuggestions.push({
      id: `sug-tagline`,
      field: "hero",
      category: "Hero Pitch & Positioning",
      targetItem: "Hero Headline & Tagline",
      current: currentTagline,
      suggested: suggestedTagline,
      impact: "Immediately communicates technical seniority and specialized domain within 3 seconds",
    });

    const currentBio = bio || "Full Stack Developer passionate about building modern web applications.";
    const suggestedBio = `Results-driven ${targetRole} with proven expertise designing resilient distributed systems, intuitive user interfaces, and high-throughput cloud architectures. Experienced in full-lifecycle product engineering from system design to production observability, with a dedication to shipping scalable, user-centric software.`;

    contentSuggestions.push({
      id: `sug-bio`,
      field: "about",
      category: "Hero Tagline & Executive Positioning",
      targetItem: "Professional Bio & Headline",
      current: currentBio,
      suggested: suggestedBio,
      impact: "Positions you as a high-caliber senior contributor within 5 seconds of scanning",
    });

    // Primary Career Experience Suggestion
    if (experience.length > 0) {
      const exp = experience[0];
      const currentExpText = exp.description || `Developed software solutions at ${exp.company}.`;
      const suggestedExpText = `Spearheaded full-lifecycle software delivery at ${exp.company}; architected reusable component libraries, streamlined CI/CD pipeline automation reducing release turnaround by 40%, and collaborated with cross-functional teams to engineer high-throughput web architectures.`;

      contentSuggestions.push({
        id: `sug-exp-1`,
        field: "experience",
        category: "Career Engineering Impact",
        targetItem: `Experience: ${exp.role} at ${exp.company}`,
        current: currentExpText,
        suggested: suggestedExpText,
        impact: "Proves enterprise delivery speed, team leadership & release velocity",
      });
    }
  }

  // 7. Assemble Categories
  const categories = buildStandardCategories(score, targetRole, missingKeywords, projects, domain);

  // Strategic Theme, UI Layout, and Certifications Advisory
  const themeRecommendation = getThemeRecommendation(domain, profile.template || "modern", targetCompany, targetRole);
  const uiSuggestions = getUISuggestions(domain, targetRole, targetCompany);
  const certificationsRecommendation = getCertificationsRecommendation(domain, targetRole, targetCompany, profile, missingKeywords);

  // Actionable Theme Switch Suggestion ONLY for portfolio analysis (never resume PDF) and ONLY if not already optimal
  const isResumeFallback =
    options?.inputType === "resume" ||
    (profile && typeof profile === "object" && profile.isResumeOnly) ||
    typeof profile === "string";

  if (
    !isResumeFallback &&
    !themeRecommendation.isAlreadyOptimal &&
    themeRecommendation.currentTemplate?.toLowerCase() !== themeRecommendation.recommendedTemplateId?.toLowerCase() &&
    !contentSuggestions.some((s) => s.field === "template")
  ) {
    contentSuggestions.unshift({
      id: "sug-theme",
      field: "template",
      category: "Theme & Visual Identity",
      targetItem: `Portfolio Layout Theme: ${themeRecommendation.recommendedTemplateName}`,
      current: `Currently active template: "${themeRecommendation.currentTemplate}"`,
      suggested: `Switch to "${themeRecommendation.recommendedTemplateName}" (${themeRecommendation.fitScore}% Domain Fit): ${themeRecommendation.reason}`,
      recommendedTemplateId: themeRecommendation.recommendedTemplateId,
      impact: `Instantly transforms portfolio presentation to match ${isFinanceHR ? "corporate executive expectations" : "industry best practices"}.`,
    });
  }

  // Actionable Certifications Suggestion (1-Click Applicable)
  if (!contentSuggestions.some((s) => s.field === "certifications")) {
    contentSuggestions.push({
      id: "sug-cert",
      field: "certifications",
      category: "High-Value Industry Certifications",
      targetItem: `Target Certifications for ${targetRole}`,
      current: profile.certifications?.length ? `${profile.certifications.length} certifications listed` : "No industry certifications currently showcased",
      suggested: `Incorporate recognized credentials: ${certificationsRecommendation.slice(0, 2).map((c) => c.name).join(" and ")}`,
      recommendedCertifications: certificationsRecommendation.slice(0, 2),
      impact: `Dramatically elevates ATS qualification score by +${certificationsRecommendation[0]?.atsScoreBoost || "15%"} and validates domain authority.`,
    });
  }

  const verdict = isFinanceHR
    ? `Distinguished executive portfolio demonstrating seasoned mastery in Corporate Finance, Accounts, and Human Resources. Quantifying audit turnaround metrics, ERP migrations, and payroll automation initiatives will firmly position you among the top tier of candidates for senior leadership roles${targetCompany ? ` at ${targetCompany}` : ""}.`
    : isCivilEngineering
    ? `Strong engineering portfolio demonstrating practical civil & infrastructure project execution. Highlighting formal BIM coordination, structural analysis (STAAD/Revit), and ${missingKeywords.slice(0, 2).join(" & ")} will position you at the top tier of candidates for ${targetRole}${targetCompany ? ` at ${targetCompany}` : ""}.`
    : projects.length > 0
    ? `Strong technical foundation highlighted by "${projects[0].title}" and modern stack fluency. Applying quantified engineering metrics and integrating ${missingKeywords.slice(0, 2).join(" & ")} will position you in the top 5% of candidates for ${targetRole}${targetCompany ? ` at ${targetCompany}` : ""}.`
    : `Promising technical profile with clean modern presentation. Adding detailed production project case studies with measurable outcomes will dramatically increase recruiter callback rates for ${targetRole}.`;

  return {
    targetRole,
    targetCompany,
    overallScore: score,
    atsScore: score,
    verdict,
    categories,
    strengths,
    weaknesses,
    missingKeywords,
    contentSuggestions,
    designSuggestions: [
      {
        id: "sug-des-1",
        category: "Visual Hierarchy",
        targetItem: isFinanceHR ? "Executive Highlights & Credentials" : "Project Showcase Grid",
        current: "Flat cards with standard border",
        suggested: isFinanceHR
          ? "Micro-hover elevation with refined slate borders and distinguished executive credential tags"
          : "Micro-hover elevation with 1px luminous border glow and prominent live demo badges",
        impact: isFinanceHR
          ? "Drives 2.5x higher engagement on executive governance milestones"
          : "Drives 2.5x higher recruiter engagement on project links",
      },
    ],
    themeRecommendation,
    uiSuggestions,
    certificationsRecommendation,
    domain,
    improvements: contentSuggestions.map((s) => s.suggested),
    analyzedAt: new Date(),
  };
};

// Legacy compatibility wrapper for existing ATS resume route
export const analyzeResumeWithGemini = async (resumeText) => {
  const result = await analyzePortfolioComprehensive(resumeText, { inputType: "resume" });
  return {
    atsScore: result.overallScore,
    summary: result.verdict,
    strengths: result.strengths,
    weaknesses: result.weaknesses,
    missingKeywords: result.missingKeywords,
    improvements: result.contentSuggestions.map((s) => s.suggested),
    categories: result.categories,
    contentSuggestions: result.contentSuggestions,
    designSuggestions: result.designSuggestions,
  };
};
