// ==========================================
// Standard ATS Resume Generator & Downloader Utility
// Formats complete authentic portfolio data into ATS-friendly Markdown / Plaintext
// ==========================================

export const formatATSResume = (portfolio = {}) => {
  const hero = portfolio.hero || {};
  const contact = portfolio.contact || {};

  const name = hero.name || portfolio.name || "Candidate Name";
  const title = hero.title || portfolio.targetRole || "Software Engineer";
  const email = contact.email || portfolio.email || "";
  const phone = contact.phone || portfolio.phone || "";
  const linkedin = contact.linkedin || portfolio.linkedin || "";
  const github = contact.github || portfolio.github || "";
  const website = contact.website || portfolio.website || "";

  // Contact line
  const contactParts = [];
  if (email) contactParts.push(`Email: ${email}`);
  if (phone) contactParts.push(`Phone: ${phone}`);
  if (linkedin) contactParts.push(`LinkedIn: ${linkedin}`);
  if (github) contactParts.push(`GitHub: ${github}`);
  if (website) contactParts.push(`Portfolio: ${website}`);
  const contactLine = contactParts.length > 0 ? contactParts.join(" | ") : "Contact: Available upon request";

  const sections = [];

  // 1. Header
  sections.push(`# ${name}\n**${title}**\n${contactLine}`);

  // 2. Summary
  const summary = portfolio.about || portfolio.description || hero.tagline || "";
  if (summary.trim()) {
    sections.push(`## PROFESSIONAL SUMMARY\n${summary.trim()}`);
  }

  // 3. Technical Skills
  const skills = Array.isArray(portfolio.skills) ? portfolio.skills.filter(Boolean) : [];
  if (skills.length > 0) {
    sections.push(`## TECHNICAL SKILLS\n${skills.join(" • ")}`);
  }

  // 4. Work Experience
  const experience = Array.isArray(portfolio.experience) ? portfolio.experience : [];
  if (experience.length > 0) {
    const expBlocks = experience.map((exp) => {
      const header = `### ${exp.role || "Software Engineer"} — ${exp.company || "Company"}${
        exp.duration ? ` (${exp.duration})` : ""
      }`;
      const desc = exp.description ? `${exp.description}\n` : "";
      const highlights = Array.isArray(exp.highlights) && exp.highlights.length > 0
        ? exp.highlights.map((h) => `- ${h}`).join("\n")
        : "";
      return [header, desc, highlights].filter(Boolean).join("\n");
    });
    sections.push(`## WORK EXPERIENCE\n\n${expBlocks.join("\n\n")}`);
  }

  // 5. Education
  const education = Array.isArray(portfolio.education) ? portfolio.education : [];
  if (education.length > 0) {
    const eduBlocks = education.map((edu) => {
      const degreeStr = edu.degree ? edu.degree : "Degree";
      const instStr = edu.institution ? edu.institution : "Institution";
      const yearStr = edu.year ? ` (${edu.year})` : "";
      let block = `### ${degreeStr} — ${instStr}${yearStr}`;
      if (edu.description) {
        block += `\n${edu.description}`;
      }
      return block;
    });
    sections.push(`## EDUCATION\n\n${eduBlocks.join("\n\n")}`);
  }

  // 6. Licenses & Certifications
  const certifications = Array.isArray(portfolio.certifications) ? portfolio.certifications : [];
  if (certifications.length > 0) {
    const certBlocks = certifications.map((c) => {
      const nameStr = c.name || "Certification";
      const issuerStr = c.issuer ? ` — ${c.issuer}` : "";
      const dateStr = c.date ? ` (${c.date})` : "";
      const urlStr = c.url ? ` [Credential: ${c.url}]` : "";
      return `- **${nameStr}**${issuerStr}${dateStr}${urlStr}`;
    });
    sections.push(`## LICENSES & CERTIFICATIONS\n\n${certBlocks.join("\n")}`);
  }

  // 7. Key Projects
  const projects = Array.isArray(portfolio.projects) ? portfolio.projects : [];
  if (projects.length > 0) {
    const projBlocks = projects.map((p) => {
      const tagsStr = Array.isArray(p.tags) && p.tags.length > 0 ? ` [${p.tags.join(", ")}]` : "";
      let block = `### ${p.title || "Project"}${tagsStr}`;
      if (p.description) block += `\n${p.description}`;
      if (p.impact) block += `\n- **Impact**: ${p.impact}`;
      const links = [];
      if (p.github) links.push(`GitHub: ${p.github}`);
      if (p.live) links.push(`Live Demo: ${p.live}`);
      if (links.length > 0) block += `\n- **Links**: ${links.join(" | ")}`;
      return block;
    });
    sections.push(`## KEY PROJECTS\n\n${projBlocks.join("\n\n")}`);
  }

  // 8. Achievements & Honors
  const achievements = Array.isArray(portfolio.achievements) ? portfolio.achievements : [];
  if (achievements.length > 0) {
    const achBlocks = achievements.map((a) => {
      const titleStr = a.title || "Award";
      const dateStr = a.date ? ` (${a.date})` : "";
      const metricStr = a.metric ? ` [${a.metric}]` : "";
      let block = `- **${titleStr}**${dateStr}${metricStr}`;
      if (a.description) block += `: ${a.description}`;
      return block;
    });
    sections.push(`## HONORS & AWARDS\n\n${achBlocks.join("\n")}`);
  }

  return sections.join("\n\n---\n\n");
};

export const downloadATSResume = (portfolio = {}) => {
  const text = formatATSResume(portfolio);
  const heroName = portfolio.hero?.name || portfolio.name || "Candidate";
  const filename = `${heroName.replace(/\s+/g, "_")}_ATS_Resume.md`;

  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
