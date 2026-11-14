// Centralized helper to detect missing portfolio sections and calculate profile completeness

export const detectPortfolioMissingInfo = (portfolio) => {
  if (!portfolio) return [];
  const missing = [];
  const contact = portfolio.contact || {};

  // 1. Profile Photo
  const rawAvatar = portfolio.avatar || portfolio.hero?.avatar || "";
  const avatar = typeof rawAvatar === "string" ? rawAvatar.trim() : "";
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

  // 2. Resume / CV Document
  const resume = portfolio.resumeUrl || portfolio.resume || "";
  if (!resume || (typeof resume === "string" && resume.trim() === "")) {
    missing.push({
      section: "Resume",
      field: "resumeUrl",
      label: "Resume / CV Document",
      type: "file",
      priority: "recommended",
      message: "No candidate resume or CV file was attached to this portfolio.",
      placeholder: "Attach your PDF resume so visitors and recruiters can view it",
    });
  }

  // 3. LinkedIn Profile URL
  const linkedin = typeof contact.linkedin === "string" ? contact.linkedin.trim() : (portfolio.linkedin || "");
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

  // 4. Work Experience
  if (!portfolio.experience || portfolio.experience.length === 0) {
    missing.push({
      section: "Experience",
      field: "experience",
      label: "Work Experience",
      type: "array",
      priority: "recommended",
      message: "No work experience or internships were detected in your document.",
    });
  }

  // 5. Software Projects
  if (!portfolio.projects || portfolio.projects.length === 0) {
    missing.push({
      section: "Projects",
      field: "projects",
      label: "Software Projects",
      type: "array",
      priority: "recommended",
      message: "No software projects were detected in your document.",
    });
  }

  // 6. Education & Degree
  if (!portfolio.education || portfolio.education.length === 0) {
    missing.push({
      section: "Education",
      field: "education",
      label: "Education & Degree",
      type: "array",
      priority: "recommended",
      message: "No educational background was detected in your document.",
    });
  }

  // 7. Technical Skills
  if (!portfolio.skills || portfolio.skills.length === 0) {
    missing.push({
      section: "Skills",
      field: "skills",
      label: "Technical Skills",
      type: "array",
      priority: "recommended",
      message: "No technical skills or frameworks were detected.",
    });
  }

  // 8. Certifications & Credentials
  if (!portfolio.certifications || portfolio.certifications.length === 0) {
    missing.push({
      section: "Certifications",
      field: "certifications",
      label: "Certifications & Credentials",
      type: "array",
      priority: "recommended",
      message: "No professional certifications or licenses were detected.",
    });
  }

  // 9. Achievements & Honors
  if (!portfolio.achievements || portfolio.achievements.length === 0) {
    missing.push({
      section: "Achievements",
      field: "achievements",
      label: "Achievements & Honors",
      type: "array",
      priority: "optional",
      message: "No awards, hackathon recognitions, or honors were detected.",
    });
  }

  // 10. Technical Blog & Publications
  if (!portfolio.blog || portfolio.blog.length === 0) {
    missing.push({
      section: "Blog",
      field: "blog",
      label: "Technical Blog & Publications",
      type: "array",
      priority: "optional",
      message: "No technical articles, blog links, or research papers were detected.",
    });
  }

  // 11. Personal Website / Domain
  const website = typeof contact.website === "string" ? contact.website.trim() : (portfolio.website || "");
  if (!website || website === "") {
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

  return missing;
};

export const filterStillMissing = (missingList, updatedPortfolio) => {
  if (!missingList || missingList.length === 0) return [];
  return missingList.filter((item) => {
    if (item.section === "Resume" || item.field === "resumeUrl") {
      const val = updatedPortfolio.resumeUrl || updatedPortfolio.resume;
      return !val || (typeof val === "string" && val.trim() === "");
    }
    if (item.section === "Profile Photo" || item.field === "avatar") {
      const val = updatedPortfolio.avatar || updatedPortfolio.hero?.avatar;
      return !val || val === "" || val.includes("dicebear.com/api/initials") || val.includes("unavatar.io");
    }
    if (item.section === "Contact") {
      const val = updatedPortfolio.contact?.[item.field] || updatedPortfolio[item.field];
      return !val || (typeof val === "string" && val.trim() === "");
    }
    if (item.section === "Experience") {
      return !updatedPortfolio.experience || updatedPortfolio.experience.length === 0;
    }
    if (item.section === "Projects") {
      return !updatedPortfolio.projects || updatedPortfolio.projects.length === 0;
    }
    if (item.section === "Education") {
      return !updatedPortfolio.education || updatedPortfolio.education.length === 0;
    }
    if (item.section === "Skills") {
      return !updatedPortfolio.skills || updatedPortfolio.skills.length === 0;
    }
    if (item.section === "Certifications") {
      return !updatedPortfolio.certifications || updatedPortfolio.certifications.length === 0;
    }
    if (item.section === "Achievements") {
      return !updatedPortfolio.achievements || updatedPortfolio.achievements.length === 0;
    }
    if (item.section === "Blog") {
      return !updatedPortfolio.blog || updatedPortfolio.blog.length === 0;
    }
    return true;
  });
};
