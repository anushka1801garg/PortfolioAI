import * as archiverPkg from "archiver";
import stream from "stream";
import fs from "fs";
import path from "path";

/**
 * Escapes HTML entities to prevent XSS.
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeLink(url, defaultPrefix = "https://") {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  // Strip dangerous schemes like javascript:, data:, vbscript:
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return "#";
  }
  if (/^(https?:\/\/|\/\/|mailto:|tel:)/i.test(trimmed)) {
    return escapeHtml(trimmed);
  }
  if (trimmed.startsWith("#") || trimmed.startsWith("/")) {
    return escapeHtml(trimmed);
  }
  return `${defaultPrefix}${escapeHtml(trimmed)}`;
}

/**
 * Generates a complete, beautiful, standalone HTML file for a portfolio tailored
 * to the exact chosen template (startup, developer, minimal, apple, google, cyberpunk, modern, etc.).
 * Works 100% offline or on any cloud hosting (Netlify, Vercel, GitHub Pages)
 * with ZERO dependencies on localhost or server running!
 */
export function generateStandaloneHtml(portfolio) {
  const common = {
    name: escapeHtml(portfolio.name || portfolio.title || "Developer"),
    title: escapeHtml(portfolio.title || "Portfolio"),
    tagline: escapeHtml(
      portfolio.tagline || portfolio.description || "Software Engineer & Builder",
    ),
    about: escapeHtml(portfolio.about || portfolio.description || ""),
    avatar: escapeHtml(portfolio.avatar || portfolio.hero?.avatar || ""),
    targetRole: escapeHtml(portfolio.targetRole || ""),
    targetCompany: escapeHtml(portfolio.targetCompany || ""),
    email: escapeHtml(portfolio.email || portfolio.contact?.email || ""),
    github: safeLink(portfolio.github || portfolio.contact?.github || "", "https://github.com/"),
    linkedin: safeLink(portfolio.linkedin || portfolio.contact?.linkedin || "", "https://linkedin.com/in/"),
    website: safeLink(portfolio.website || portfolio.contact?.website || ""),
    phone: escapeHtml(portfolio.phone || portfolio.contact?.phone || ""),
    skills: Array.isArray(portfolio.skills) ? portfolio.skills : [],
    projects: Array.isArray(portfolio.projects) ? portfolio.projects : [],
    experience: Array.isArray(portfolio.experience) ? portfolio.experience : [],
    education: Array.isArray(portfolio.education) ? portfolio.education : [],
    achievements: Array.isArray(portfolio.achievements) ? portfolio.achievements : [],
    certifications: Array.isArray(portfolio.certifications) ? portfolio.certifications : [],
    blogs: Array.isArray(portfolio.blog) ? portfolio.blog : [],
    primaryColor: portfolio.preferences?.primaryColor || "#6366f1",
  };

  const template = (portfolio.template || "modern").toLowerCase().trim();

  switch (template) {
    case "startup":
      return renderStartupTemplate(common);
    case "developer":
      return renderDeveloperTemplate(common);
    case "minimal":
      return renderMinimalTemplate(common);
    case "apple":
    case "designer":
      return renderAppleTemplate(common);
    case "creative":
      return renderCreativeTemplate(common);
    case "cyberpunk":
    case "animated":
      return renderCyberpunkTemplate(common);
    case "corporate":
    case "professional":
      return renderCorporateTemplate(common);
    case "google":
      return renderGoogleTemplate(common);
    case "glassmorphism":
    case "dark":
    case "academic":
    case "responsive":
    case "custom":
    case "modern":
    default:
      return renderModernTemplate(common);
  }
}

// ==========================================
// 1. STARTUP FOUNDER TEMPLATE
// ==========================================
function renderStartupTemplate(p) {
  const { name, title, tagline, about, avatar, targetRole, email, github, linkedin, website, skills, projects, experience, education, achievements, certifications } = p;

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — ${title}</title>
  <meta name="description" content="${tagline}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --amber: #f59e0b;
      --amber-light: #fbbf24;
      --bg: #0a0a0b;
      --bg-card: rgba(24, 24, 27, 0.85);
      --border: rgba(39, 39, 42, 0.9);
      --text: #fafafa;
      --text-muted: #a1a1aa;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .container { max-width: 1040px; margin: 0 auto; padding: 0 24px; }
    
    /* Header Nav */
    header.top-nav {
      position: sticky; top: 0; z-index: 50;
      background: rgba(10, 10, 11, 0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      padding: 18px 0;
    }
    .nav-inner { display: flex; justify-content: space-between; align-items: center; }
    .nav-logo { font-size: 16px; font-weight: 800; color: #fff; text-decoration: none; display: flex; align-items: center; gap: 8px; }
    .nav-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .nav-links { display: flex; gap: 24px; list-style: none; }
    .nav-links a { color: var(--text-muted); text-decoration: none; font-size: 13px; font-weight: 600; transition: color 0.2s; }
    .nav-links a:hover { color: #fff; }

    /* Founder Hero */
    .hero-wrap { padding: 48px 0 24px; }
    .hero-card {
      background: linear-gradient(180deg, rgba(24, 24, 27, 0.95) 0%, rgba(10, 10, 11, 0.98) 100%);
      border: 1px solid rgba(63, 63, 70, 0.8);
      border-radius: 32px;
      padding: 48px 40px;
      box-shadow: 0 20px 50px -10px rgba(0,0,0,0.7);
      position: relative; overflow: hidden;
    }
    .hero-card::before {
      content: ''; position: absolute; top: -100px; right: -100px;
      width: 400px; height: 400px; background: radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(10, 10, 11, 0) 70%);
      pointer-events: none;
    }
    .venture-tag {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 9999px;
      background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fbbf24; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 24px;
    }
    .founder-header { display: flex; align-items: center; gap: 24px; margin-bottom: 20px; flex-wrap: wrap; }
    .founder-avatar {
      width: 80px; height: 80px; border-radius: 20px;
      border: 2px solid rgba(245, 158, 11, 0.4);
      object-fit: cover; background: #18181b; box-shadow: 0 8px 24px -4px rgba(245, 158, 11, 0.2);
    }
    .founder-placeholder {
      width: 80px; height: 80px; border-radius: 20px;
      border: 2px solid rgba(245, 158, 11, 0.4);
      background: linear-gradient(135deg, #d97706, #b45309);
      display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; color: #fff;
    }
    .founder-name { font-size: 42px; font-weight: 900; letter-spacing: -0.03em; color: #fff; line-height: 1.1; }
    .founder-tagline { font-size: 18px; color: #d4d4d8; max-width: 720px; font-weight: 400; line-height: 1.6; margin-bottom: 32px; }

    /* KPI Highlight Strip */
    .kpi-strip {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
      padding-top: 28px; border-top: 1px solid rgba(63, 63, 70, 0.8);
      margin-bottom: 32px;
    }
    .kpi-card { padding: 12px 0; }
    .kpi-val { font-size: 32px; font-weight: 900; color: #fbbf24; line-height: 1; margin-bottom: 4px; }
    .kpi-val.white { color: #fff; }
    .kpi-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #71717a; font-family: 'JetBrains Mono', monospace; font-weight: 600; }

    /* Action Buttons */
    .btn-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn {
      padding: 12px 24px; border-radius: 14px; font-size: 13px; font-weight: 700;
      text-decoration: none; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
    }
    .btn-amber { background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; border: none; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3); }
    .btn-amber:hover { opacity: 0.95; transform: translateY(-1px); }
    .btn-zinc { background: rgba(39, 39, 42, 0.8); color: #fff; border: 1px solid var(--border); }
    .btn-zinc:hover { background: rgba(63, 63, 70, 0.9); }

    /* Sections */
    section { padding: 48px 0; }
    .sec-tag { font-size: 12px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; font-family: 'JetBrains Mono', monospace; }
    .sec-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.02em; margin-bottom: 24px; }
    
    .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; padding: 32px; transition: transform 0.2s ease; }
    .card:hover { border-color: rgba(245, 158, 11, 0.4); transform: translateY(-2px); }
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }

    /* Skills Pill Strip */
    .skill-pills { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-pill {
      padding: 8px 16px; border-radius: 9999px;
      background: rgba(24, 24, 27, 0.9); border: 1px solid rgba(63, 63, 70, 0.8);
      font-size: 13px; font-weight: 600; color: #e4e4e7; display: flex; align-items: center; gap: 6px;
    }
    .skill-pill::before { content: ''; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #f59e0b; }

    /* Project Cards */
    .proj-card { display: flex; flex-direction: column; justify-content: space-between; }
    .proj-title { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px; }
    .proj-desc { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 16px; }
    .proj-impact { font-size: 12px; color: #fbbf24; background: rgba(245, 158, 11, 0.08); border-left: 2px solid #f59e0b; padding: 8px 12px; border-radius: 0 8px 8px 0; margin-bottom: 16px; font-weight: 500; }
    .tag-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
    .tag { font-size: 11px; padding: 4px 10px; border-radius: 8px; background: rgba(39, 39, 42, 0.8); color: #a1a1aa; font-family: 'JetBrains Mono', monospace; font-weight: 600; }
    .proj-links { display: flex; gap: 12px; }
    .proj-link { font-size: 13px; color: #fbbf24; text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; }
    .proj-link:hover { text-decoration: underline; }

    /* Timeline */
    .timeline { position: relative; padding-left: 28px; }
    .timeline::before { content: ''; position: absolute; left: 8px; top: 8px; bottom: 8px; width: 2px; background: var(--border); }
    .timeline-item { position: relative; margin-bottom: 28px; }
    .timeline-item::before { content: ''; position: absolute; left: -24px; top: 6px; width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 10px #f59e0b; }
    .role-title { font-size: 17px; font-weight: 700; color: #fff; }
    .comp-name { font-size: 14px; color: #fbbf24; font-weight: 600; margin-bottom: 4px; }
    .duration { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; margin-bottom: 8px; }
    .bullets { list-style: disc; margin-left: 18px; color: var(--text-muted); font-size: 13px; line-height: 1.6; }

    /* Footer */
    footer { padding: 48px 0; border-top: 1px solid var(--border); text-align: center; color: var(--text-muted); font-size: 13px; }

    @media (max-width: 640px) {
      .founder-name { font-size: 32px; }
      .kpi-strip { grid-template-columns: repeat(2, 1fr); gap: 20px; }
      .nav-links { display: none; }
      .hero-card { padding: 32px 24px; }
    }
  </style>
</head>
<body>
  <header class="top-nav">
    <div class="container nav-inner">
      <a href="#" class="nav-logo">
        <span>${name}</span>
        <span class="nav-badge">FOUNDER</span>
      </a>
      <ul class="nav-links">
        ${about ? '<li><a href="#about">About</a></li>' : ""}
        ${skills.length ? '<li><a href="#skills">Tech Stack</a></li>' : ""}
        ${projects.length ? '<li><a href="#projects">Ventures</a></li>' : ""}
        ${experience.length ? '<li><a href="#experience">Track Record</a></li>' : ""}
        <li><a href="#contact">Contact</a></li>
      </ul>
    </div>
  </header>

  <main class="container">
    <div class="hero-wrap">
      <div class="hero-card">
        <div class="venture-tag">
          <span>⚡ BUILDING IN PUBLIC • VENTURE &amp; PRODUCT READY</span>
        </div>

        <div class="founder-header">
          ${
            avatar
              ? `<img src="${avatar}" alt="${name}" class="founder-avatar" onerror="this.style.display='none'">`
              : `<div class="founder-placeholder">${name.charAt(0)}</div>`
          }
          <div>
            <h1 class="founder-name">${name}</h1>
            <p style="color: #fbbf24; font-size: 15px; font-weight: 700; margin-top: 4px;">${targetRole || "Technical Founder & Full Stack Engineer"}</p>
          </div>
        </div>

        <p class="founder-tagline">${tagline}</p>

        <!-- Signature Startup KPI Strip -->
        <div class="kpi-strip">
          <div class="kpi-card">
            <div class="kpi-val">99.99%</div>
            <div class="kpi-lbl">Uptime Reliability</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-val white">100k+</div>
            <div class="kpi-lbl">Users Scaled</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-val">&lt;45ms</div>
            <div class="kpi-lbl">p99 Latency</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-val white">Top 1%</div>
            <div class="kpi-lbl">Delivery Velocity</div>
          </div>
        </div>

        <div class="btn-row">
          ${email ? `<a href="https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}" target="_blank" rel="noopener noreferrer" class="btn btn-amber">✉️ Get in Touch</a>` : ""}
          ${github ? `<a href="${github}" target="_blank" rel="noreferrer" class="btn btn-zinc">🐙 GitHub</a>` : ""}
          ${linkedin ? `<a href="${linkedin}" target="_blank" rel="noreferrer" class="btn btn-zinc">💼 LinkedIn</a>` : ""}
        </div>
      </div>
    </div>

    <!-- About Section -->
    ${
      about
        ? `
    <section id="about">
      <div class="sec-tag">01 // Founder Mission</div>
      <h2 class="sec-title">About Me</h2>
      <div class="card">
        <p style="font-size: 16px; color: #d4d4d8; line-height: 1.8;">${about}</p>
      </div>
    </section>`
        : ""
    }

    <!-- Skills Section -->
    ${
      skills.length
        ? `
    <section id="skills">
      <div class="sec-tag">02 // Core Architecture</div>
      <h2 class="sec-title">Technical Capabilities</h2>
      <div class="skill-pills">
        ${skills.map((s) => `<div class="skill-pill">${escapeHtml(s)}</div>`).join("")}
      </div>
    </section>`
        : ""
    }

    <!-- Projects Section -->
    ${
      projects.length
        ? `
    <section id="projects">
      <div class="sec-tag">03 // Ventures &amp; Products</div>
      <h2 class="sec-title">Featured Products</h2>
      <div class="grid-2">
        ${projects
          .map(
            (proj) => `
        <div class="card proj-card">
          <div>
            <h3 class="proj-title">${escapeHtml(proj.title || "Untitled Venture")}</h3>
            <p class="proj-desc">${escapeHtml(proj.description || "")}</p>
            ${
              proj.impact
                ? `<div class="proj-impact"><strong>Metric / Traction:</strong> ${escapeHtml(proj.impact)}</div>`
                : ""
            }
            ${
              Array.isArray(proj.tags) && proj.tags.length
                ? `<div class="tag-row">${proj.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>`
                : ""
            }
          </div>
          <div class="proj-links">
            ${
              proj.live || proj.url || proj.link
                ? `<a href="${safeLink(proj.live || proj.url || proj.link)}" target="_blank" rel="noreferrer" class="proj-link">Live Demo &nearr;</a>`
                : ""
            }
            ${
              proj.github
                ? `<a href="${safeLink(proj.github, "https://github.com/")}" target="_blank" rel="noreferrer" class="proj-link">Repository &nearr;</a>`
                : ""
            }
          </div>
        </div>`,
          )
          .join("")}
      </div>
    </section>`
        : ""
    }

    <!-- Experience Section -->
    ${
      experience.length
        ? `
    <section id="experience">
      <div class="sec-tag">04 // Track Record</div>
      <h2 class="sec-title">Experience &amp; Leadership</h2>
      <div class="timeline">
        ${experience
          .map(
            (exp) => `
        <div class="timeline-item">
          <div class="role-title">${escapeHtml(exp.role || "Role")}</div>
          <div class="comp-name">${escapeHtml(exp.company || "Company")}</div>
          <div class="duration">${escapeHtml(exp.duration || "")}</div>
          ${exp.description ? `<p style="font-size: 14px; color: #a1a1aa; margin-bottom: 8px;">${escapeHtml(exp.description)}</p>` : ""}
          ${
            Array.isArray(exp.highlights) && exp.highlights.length
              ? `<ul class="bullets">${exp.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}</ul>`
              : ""
          }
        </div>`,
          )
          .join("")}
      </div>
    </section>`
        : ""
    }

    <!-- Education Section -->
    ${
      education.length
        ? `
    <section id="education">
      <div class="sec-tag">05 // Academic Foundation</div>
      <h2 class="sec-title">Education</h2>
      <div class="grid-2">
        ${education
          .map(
            (edu) => `
        <div class="card">
          <h3 style="font-size: 17px; font-weight: 700; color: #fff;">${escapeHtml(edu.degree || "Degree")}</h3>
          <p style="font-size: 14px; color: #fbbf24; font-weight: 600;">${escapeHtml(edu.institution || "")}</p>
          <div class="mono" style="font-size: 12px; color: #71717a; margin-top: 4px;">${escapeHtml(edu.year || "")}</div>
          ${edu.description ? `<p style="font-size: 13px; color: #a1a1aa; margin-top: 8px;">${escapeHtml(edu.description)}</p>` : ""}
        </div>`,
          )
          .join("")}
      </div>
    </section>`
        : ""
    }

    <!-- Contact Section -->
    <section id="contact" style="padding: 60px 0 80px;">
      <div class="card" style="text-align: center; max-width: 650px; margin: 0 auto; padding: 48px 32px; background: linear-gradient(180deg, rgba(39, 39, 42, 0.6) 0%, rgba(24, 24, 27, 0.95) 100%);">
        <h2 style="font-size: 28px; font-weight: 900; color: #fff; margin-bottom: 12px;">Let's Build the Next Big Thing</h2>
        <p style="font-size: 15px; color: #a1a1aa; margin-bottom: 28px; line-height: 1.6;">
          Open for engineering opportunities, technical advisory, and collaborative ventures.
        </p>
        <div class="btn-row" style="justify-content: center;">
          ${email ? `<a href="https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}" target="_blank" rel="noopener noreferrer" class="btn btn-amber">✉️ ${email}</a>` : ""}
          ${linkedin ? `<a href="${linkedin}" target="_blank" rel="noreferrer" class="btn btn-zinc">LinkedIn Profile</a>` : ""}
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${name}. Built &amp; Deployed via PortfolioAI.</p>
    </div>
  </footer>
</body>
</html>`;
}

// ==========================================
// 2. DEVELOPER TERMINAL TEMPLATE
// ==========================================
function renderDeveloperTemplate(p) {
  const { name, title, tagline, about, avatar, email, github, linkedin, skills, projects, experience, education } = p;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — ${title}</title>
  <meta name="description" content="${tagline}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0d1117; color: #c9d1d9;
      font-family: 'JetBrains Mono', monospace; line-height: 1.6; padding: 40px 16px;
    }
    .container { max-width: 900px; margin: 0 auto; }
    .term-window {
      background: #161b22; border: 1px solid #30363d; border-radius: 16px;
      box-shadow: 0 25px 60px -15px rgba(0,0,0,0.8); overflow: hidden;
    }
    .term-bar {
      background: #0d1117; padding: 12px 18px; border-bottom: 1px solid #30363d;
      display: flex; justify-content: space-between; align-items: center;
    }
    .dots { display: flex; gap: 8px; }
    .dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
    .dot.r { background: #f85149; }
    .dot.y { background: #d29922; }
    .dot.g { background: #2ea043; }
    .term-title { font-size: 12px; color: #8b949e; font-weight: 600; }
    .term-body { padding: 36px 32px; }
    .prompt { color: #8b949e; font-size: 13px; margin-bottom: 6px; }
    .prompt span { color: #58a6ff; font-weight: 700; }
    .h1-row { display: flex; align-items: center; gap: 20px; margin: 8px 0 16px; flex-wrap: wrap; }
    .avatar { width: 64px; height: 64px; border-radius: 12px; border: 1px solid #3fb950; object-fit: cover; }
    h1 { font-size: 32px; color: #fff; font-weight: 800; }
    .tagline { color: #3fb950; font-size: 16px; margin-bottom: 24px; }
    .sec-block { margin-top: 36px; padding-top: 24px; border-top: 1px solid #21262d; }
    .skill-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .skill-tag {
      background: #21262d; border: 1px solid #30363d; padding: 6px 14px;
      border-radius: 6px; font-size: 12px; color: #58a6ff;
    }
    .proj-card {
      background: #0d1117; border: 1px solid #30363d; border-radius: 10px;
      padding: 20px; margin-top: 14px;
    }
    .proj-name { color: #fff; font-size: 16px; font-weight: 700; }
    .proj-desc { color: #8b949e; font-size: 13px; margin: 6px 0 12px; }
    .links { display: flex; gap: 14px; margin-top: 10px; }
    .link { color: #3fb950; text-decoration: none; font-size: 12px; font-weight: 600; }
    .link:hover { text-decoration: underline; }
    .btn-row { display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap; }
    .btn {
      padding: 10px 18px; border-radius: 8px; text-decoration: none; font-size: 12px; font-weight: 700;
      background: #238636; color: #fff; border: 1px solid rgba(255,255,255,0.1);
    }
    .btn-dark { background: #21262d; color: #c9d1d9; border: 1px solid #30363d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="term-window">
      <div class="term-bar">
        <div class="dots"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span></div>
        <div class="term-title">bash — 80x24</div>
        <div style="font-size: 11px; color: #3fb950;">git:(main)*</div>
      </div>
      <div class="term-body">
        <div class="prompt"><span>~</span> $ whoami</div>
        <div class="h1-row">
          ${avatar ? `<img src="${avatar}" alt="${name}" class="avatar">` : ""}
          <h1>${name}</h1>
        </div>
        <p class="tagline">&gt; ${tagline}</p>
        
        <div class="btn-row">
          ${email ? `<a href="https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}" target="_blank" rel="noopener noreferrer" class="btn">✉️ mailto:${email}</a>` : ""}
          ${github ? `<a href="${github}" target="_blank" rel="noreferrer" class="btn btn-dark">🐙 GitHub</a>` : ""}
          ${linkedin ? `<a href="${linkedin}" target="_blank" rel="noreferrer" class="btn btn-dark">💼 LinkedIn</a>` : ""}
        </div>

        ${
          about
            ? `
        <div class="sec-block">
          <div class="prompt"><span>~</span> $ cat bio.txt</div>
          <p style="color: #c9d1d9; font-size: 14px; line-height: 1.7; margin-top: 8px;">${about}</p>
        </div>`
            : ""
        }

        ${
          skills.length
            ? `
        <div class="sec-block">
          <div class="prompt"><span>~</span> $ cat stack.json</div>
          <div class="skill-grid">
            ${skills.map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`).join("")}
          </div>
        </div>`
            : ""
        }

        ${
          projects.length
            ? `
        <div class="sec-block">
          <div class="prompt"><span>~</span> $ ls -la projects/</div>
          ${projects
            .map(
              (p) => `
          <div class="proj-card">
            <div class="proj-name">📦 ${escapeHtml(p.title || "Project")}</div>
            <p class="proj-desc">${escapeHtml(p.description || "")}</p>
            ${p.impact ? `<div style="color: #58a6ff; font-size: 12px; margin-bottom: 8px;">// Impact: ${escapeHtml(p.impact)}</div>` : ""}
            <div class="links">
              ${p.live || p.url ? `<a href="${safeLink(p.live || p.url)}" target="_blank" rel="noreferrer" class="link">[Live Demo]</a>` : ""}
              ${p.github ? `<a href="${safeLink(p.github, "https://github.com/")}" target="_blank" rel="noreferrer" class="link">[View Source]</a>` : ""}
            </div>
          </div>`,
            )
            .join("")}
        </div>`
            : ""
        }

        ${
          experience.length
            ? `
        <div class="sec-block">
          <div class="prompt"><span>~</span> $ git log --oneline experience/</div>
          <div style="margin-top: 12px;">
            ${experience
              .map(
                (exp) => `
            <div style="margin-bottom: 18px;">
              <span style="color: #d29922; font-weight: 700;">commit ${Math.random().toString(36).substring(2, 9)}</span>
              <div style="color: #fff; font-weight: 700; margin-top: 2px;">${escapeHtml(exp.role || "Role")} @ <span style="color: #58a6ff;">${escapeHtml(exp.company || "")}</span></div>
              <div style="color: #8b949e; font-size: 11px;">Date: ${escapeHtml(exp.duration || "")}</div>
              <p style="font-size: 13px; color: #8b949e; margin-top: 4px;">${escapeHtml(exp.description || "")}</p>
            </div>`,
              )
              .join("")}
          </div>
        </div>`
            : ""
        }
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ==========================================
// 3. MINIMAL SWISS TEMPLATE
// ==========================================
function renderMinimalTemplate(p) {
  const { name, title, tagline, about, avatar, email, github, linkedin, skills, projects, experience, education } = p;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — ${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root { --crimson: #e11d48; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #09090b; color: #f4f4f5;
      font-family: 'Space Grotesk', -apple-system, sans-serif;
      padding: 60px 24px;
    }
    .container { max-width: 860px; margin: 0 auto; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; border-bottom: 2px solid #27272a; padding-bottom: 32px; }
    h1 { font-size: 44px; font-weight: 800; letter-spacing: -0.04em; color: #fff; line-height: 1.1; }
    .tagline { font-size: 18px; color: #a1a1aa; margin-top: 12px; font-weight: 400; }
    .avatar { width: 72px; height: 72px; border-radius: 12px; object-fit: cover; border: 1px solid #3f3f46; }
    .sec-block { margin-top: 56px; }
    .sec-num { font-size: 11px; font-weight: 700; color: var(--crimson); letter-spacing: 0.1em; }
    .sec-title { font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 18px; }
    .skill-row { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-item { padding: 6px 12px; border: 1px solid #27272a; border-radius: 4px; font-size: 12px; font-family: 'JetBrains Mono', monospace; color: #d4d4d8; }
    .proj-item { padding: 24px 0; border-bottom: 1px solid #27272a; }
    .proj-item:last-child { border-bottom: none; }
    .proj-title { font-size: 17px; font-weight: 700; color: #fff; }
    .proj-desc { color: #a1a1aa; font-size: 14px; margin: 6px 0; }
    .proj-link { color: var(--crimson); font-size: 12px; font-weight: 700; text-decoration: none; font-family: 'JetBrains Mono', monospace; }
    .links-row { display: flex; gap: 16px; margin-top: 24px; }
    .link-btn { font-size: 13px; font-weight: 700; color: #fff; text-decoration: underline; text-underline-offset: 4px; }
    .link-btn:hover { color: var(--crimson); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-row">
      <div>
        <h1>${name}</h1>
        <p class="tagline">${tagline}</p>
        <div class="links-row">
          ${email ? `<a href="https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}" target="_blank" rel="noopener noreferrer" class="link-btn">Contact</a>` : ""}
          ${github ? `<a href="${github}" target="_blank" rel="noreferrer" class="link-btn">GitHub</a>` : ""}
          ${linkedin ? `<a href="${linkedin}" target="_blank" rel="noreferrer" class="link-btn">LinkedIn</a>` : ""}
        </div>
      </div>
      ${avatar ? `<img src="${avatar}" alt="${name}" class="avatar">` : ""}
    </div>

    ${about ? `<div class="sec-block"><div class="sec-num mono">01 // BACKGROUND</div><h2 class="sec-title">About</h2><p style="color: #d4d4d8; font-size: 15px; line-height: 1.8;">${about}</p></div>` : ""}

    ${skills.length ? `<div class="sec-block"><div class="sec-num mono">02 // ARSENAL</div><h2 class="sec-title">Skills &amp; Technologies</h2><div class="skill-row">${skills.map(s => `<span class="skill-item">${escapeHtml(s)}</span>`).join("")}</div></div>` : ""}

    ${projects.length ? `<div class="sec-block"><div class="sec-num mono">03 // SELECTED WORK</div><h2 class="sec-title">Featured Projects</h2>${projects.map(p => `<div class="proj-item"><div class="proj-title">${escapeHtml(p.title || "Project")}</div><p class="proj-desc">${escapeHtml(p.description || "")}</p>${p.live || p.url ? `<a href="${safeLink(p.live || p.url)}" target="_blank" rel="noreferrer" class="proj-link">VIEW PROJECT &rarr;</a>` : ""}</div>`).join("")}</div>` : ""}

    ${experience.length ? `<div class="sec-block"><div class="sec-num mono">04 // CHRONOLOGY</div><h2 class="sec-title">Experience</h2>${experience.map(e => `<div class="proj-item"><div class="proj-title">${escapeHtml(e.role || "")} @ ${escapeHtml(e.company || "")}</div><div class="mono" style="font-size: 12px; color: #71717a; margin-top: 2px;">${escapeHtml(e.duration || "")}</div><p class="proj-desc">${escapeHtml(e.description || "")}</p></div>`).join("")}</div>` : ""}
  </div>
</body>
</html>`;
}

// ==========================================
// 4. APPLE INSPIRED TEMPLATE
// ==========================================
function renderAppleTemplate(p) {
  const { name, title, tagline, about, avatar, email, github, linkedin, skills, projects, experience, education } = p;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — ${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #000; color: #f5f5f7;
      font-family: 'Inter', -apple-system, sans-serif;
      padding: 60px 24px; -webkit-font-smoothing: antialiased;
    }
    .container { max-width: 960px; margin: 0 auto; }
    .hero { text-align: center; padding: 60px 0 40px; }
    .avatar { width: 96px; height: 96px; border-radius: 50%; object-fit: cover; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(255,255,255,0.1); }
    h1 { font-size: 48px; font-weight: 800; letter-spacing: -0.03em; color: #fff; }
    .tagline { font-size: 19px; color: #86868b; max-width: 600px; margin: 12px auto 28px; line-height: 1.5; }
    .glass-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(20px);
      border-radius: 24px; padding: 32px; margin-bottom: 24px;
    }
    .sec-title { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 20px; }
    .skill-chip { display: inline-block; padding: 8px 16px; border-radius: 9999px; background: rgba(255,255,255,0.08); font-size: 13px; font-weight: 500; margin: 4px; color: #fff; }
    .btn-apple {
      display: inline-block; padding: 12px 24px; border-radius: 9999px;
      background: #0071e3; color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; margin: 6px;
    }
    .btn-secondary {
      display: inline-block; padding: 12px 24px; border-radius: 9999px;
      background: rgba(255,255,255,0.1); color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; margin: 6px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      ${avatar ? `<img src="${avatar}" alt="${name}" class="avatar">` : ""}
      <h1>${name}</h1>
      <p class="tagline">${tagline}</p>
      <div>
        ${email ? `<a href="https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}" target="_blank" rel="noopener noreferrer" class="btn-apple">Connect</a>` : ""}
        ${github ? `<a href="${github}" target="_blank" rel="noreferrer" class="btn-secondary">GitHub</a>` : ""}
        ${linkedin ? `<a href="${linkedin}" target="_blank" rel="noreferrer" class="btn-secondary">LinkedIn</a>` : ""}
      </div>
    </div>

    ${about ? `<div class="glass-card"><h2 class="sec-title">Overview</h2><p style="color: #a1a1a6; font-size: 16px; line-height: 1.7;">${about}</p></div>` : ""}

    ${skills.length ? `<div class="glass-card"><h2 class="sec-title">Technologies</h2><div>${skills.map(s => `<span class="skill-chip">${escapeHtml(s)}</span>`).join("")}</div></div>` : ""}

    ${projects.length ? `<div class="glass-card"><h2 class="sec-title">Selected Projects</h2><div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">${projects.map(p => `<div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);"><h3 style="color:#fff; font-size:16px; font-weight:700;">${escapeHtml(p.title || "")}</h3><p style="color:#86868b; font-size:13px; margin: 8px 0;">${escapeHtml(p.description || "")}</p>${p.live || p.url ? `<a href="${safeLink(p.live || p.url)}" target="_blank" rel="noreferrer" style="color: #2997ff; font-size: 13px; font-weight: 600; text-decoration: none;">View Project &rarr;</a>` : ""}</div>`).join("")}</div></div>` : ""}
  </div>
</body>
</html>`;
}

// ==========================================
// 5. CREATIVE NEON / CYBER TEMPLATE
// ==========================================
function renderCreativeTemplate(p) {
  const { name, title, tagline, about, avatar, email, phone, github, linkedin, website, skills, projects, experience, education, achievements, certifications, blog } = p;

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — ${title}</title>
  <meta name="description" content="${about.slice(0, 160) || tagline}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #070b14;
      --card-bg: rgba(15, 23, 42, 0.6);
      --border: rgba(30, 41, 59, 0.8);
      --emerald: #10b981;
      --emerald-glow: rgba(16, 185, 129, 0.15);
      --cyan: #06b6d4;
      --cyan-glow: rgba(6, 182, 212, 0.15);
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
      position: relative;
    }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .container { max-width: 1040px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 10; }
    
    /* Background Ambience */
    .glow-1 {
      position: fixed; top: 0; right: 20%; width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(7, 11, 20, 0) 70%);
      pointer-events: none; z-index: 1; filter: blur(60px);
    }
    .glow-2 {
      position: fixed; bottom: 20%; left: 10%; width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, rgba(7, 11, 20, 0) 70%);
      pointer-events: none; z-index: 1; filter: blur(60px);
    }

    /* Terminal Badge */
    .dev-badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 16px; border-radius: 9999px;
      background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399; font-size: 12px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
      letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 24px;
    }

    /* Hero */
    .hero-wrap { padding: 80px 0 40px; }
    .hero-flex { display: flex; align-items: center; gap: 24px; margin-bottom: 16px; flex-wrap: wrap; }
    .avatar-frame {
      width: 90px; height: 90px; border-radius: 24px; padding: 3px;
      background: linear-gradient(135deg, #10b981, #06b6d4);
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.25);
    }
    .avatar-img { width: 100%; height: 100%; border-radius: 21px; object-fit: cover; background: #0f172a; }
    h1.hero-name { font-size: 52px; font-weight: 900; letter-spacing: -0.03em; color: #fff; line-height: 1.05; }
    .hero-tagline { font-size: 22px; color: #34d399; font-weight: 300; margin-bottom: 28px; display: flex; align-items: center; gap: 10px; }
    
    /* Social Pill Row */
    .pills-row { display: flex; flex-wrap: wrap; gap: 10px; }
    .pill-link {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 20px; border-radius: 9999px;
      background: #0f172a; border: 1px solid rgba(51, 65, 85, 0.8);
      color: #cbd5e1; font-size: 13px; font-weight: 600; text-decoration: none;
      transition: all 0.2s ease;
    }
    .pill-link:hover { border-color: rgba(16, 185, 129, 0.6); color: #34d399; transform: translateY(-1px); }

    /* Sections */
    section { padding: 48px 0; }
    .sec-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .sec-title { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.02em; }
    .sec-count { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: #34d399; font-weight: 600; }

    /* Story Card */
    .story-card {
      position: relative; background: linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.9) 100%);
      border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 28px; padding: 40px;
      box-shadow: 0 20px 40px -15px rgba(0,0,0,0.6);
    }
    .profile-tag {
      position: absolute; top: -14px; right: 32px;
      padding: 4px 14px; border-radius: 9999px; background: #10b981;
      color: #020617; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;
    }

    /* Skills Grid */
    .skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
    .skill-box {
      background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(30, 41, 59, 0.9);
      border-radius: 16px; padding: 14px 18px; text-align: center;
      font-size: 13px; font-weight: 600; color: #e2e8f0; transition: all 0.2s ease;
    }
    .skill-box:hover { border-color: rgba(16, 185, 129, 0.4); transform: translateY(-2px); }

    /* Projects Grid */
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }
    .proj-card {
      background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(30, 41, 59, 0.9);
      border-radius: 24px; padding: 32px; display: flex; flex-direction: column; justify-content: space-between;
      transition: all 0.3s ease;
    }
    .proj-card:hover { border-color: rgba(16, 185, 129, 0.5); background: rgba(15, 23, 42, 0.85); transform: translateY(-3px); }
    .proj-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .proj-idx { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: #34d399; font-weight: 700; }
    .proj-title { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 8px; }
    .proj-desc { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 16px; }
    .proj-impact { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: #34d399; font-weight: 600; margin-bottom: 14px; }
    .tag-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
    .tag { font-size: 11px; padding: 4px 10px; border-radius: 9999px; background: #0f172a; border: 1px solid #1e293b; color: #94a3b8; font-weight: 500; }
    .proj-btns { display: flex; gap: 12px; }
    .btn-link { font-size: 12px; font-weight: 700; color: #34d399; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
    .btn-link:hover { text-decoration: underline; }

    /* Experience */
    .exp-card {
      background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(30, 41, 59, 0.9);
      border-radius: 20px; padding: 28px; margin-bottom: 16px;
    }
    .exp-role { font-size: 18px; font-weight: 700; color: #fff; }
    .exp-comp { font-size: 14px; color: #34d399; font-weight: 600; margin-bottom: 4px; }
    .exp-dur { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: #64748b; margin-bottom: 10px; }
    .exp-bullets { list-style: disc; margin-left: 20px; color: var(--text-muted); font-size: 13px; line-height: 1.6; }

    footer { padding: 48px 0; border-top: 1px solid var(--border); text-align: center; color: var(--text-muted); font-size: 13px; }

    @media (max-width: 640px) {
      h1.hero-name { font-size: 36px; }
      .hero-wrap { padding: 40px 0 20px; }
    }
  </style>
</head>
<body>
  <div class="glow-1"></div>
  <div class="glow-2"></div>

  <main class="container">
    <div class="hero-wrap">
      <div class="dev-badge">&gt;_ developer_mode: active</div>
      <div class="hero-flex">
        ${avatar ? `<div class="avatar-frame"><img src="${avatar}" alt="${name}" class="avatar-img" onerror="this.parentElement.style.display='none'"></div>` : ""}
        <div>
          <h1 class="hero-name">${name}</h1>
        </div>
      </div>
      <p class="hero-tagline">⚡ <span>${tagline}</span></p>

      <div class="pills-row">
        ${email ? `<a href="https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}" target="_blank" rel="noopener noreferrer" class="pill-link">✉️ ${email}</a>` : ""}
        ${github ? `<a href="${github}" target="_blank" rel="noreferrer" class="pill-link">🐙 GitHub</a>` : ""}
        ${linkedin ? `<a href="${linkedin}" target="_blank" rel="noreferrer" class="pill-link">💼 LinkedIn</a>` : ""}
        ${website ? `<a href="${website}" target="_blank" rel="noreferrer" class="pill-link">🌐 Live Site</a>` : ""}
      </div>
    </div>

    <!-- About Section -->
    ${about ? `
    <section>
      <div class="story-card">
        <div class="profile-tag">Profile</div>
        <h2 class="sec-title" style="margin-bottom: 16px;">Story &amp; Vision</h2>
        <p style="color: #cbd5e1; font-size: 16px; line-height: 1.8;">${about}</p>
      </div>
    </section>` : ""}

    <!-- Skills Section -->
    ${skills.length ? `
    <section>
      <div class="sec-header">
        <h2 class="sec-title">&lt;/&gt; Tech Stack &amp; Arsenal</h2>
        <span class="sec-count">${skills.length} Technologies</span>
      </div>
      <div class="skills-grid">
        ${skills.map(s => `<div class="skill-box">${escapeHtml(s)}</div>`).join("")}
      </div>
    </section>` : ""}

    <!-- Projects Section -->
    ${projects.length ? `
    <section>
      <div class="sec-header">
        <h2 class="sec-title">Selected Creations</h2>
        <span class="sec-count" style="color: #06b6d4;">${projects.length} Repositories</span>
      </div>
      <div class="projects-grid">
        ${projects.map((proj, idx) => `
        <div class="proj-card">
          <div>
            <div class="proj-top">
              <span class="proj-idx">// 0${idx + 1}</span>
            </div>
            <h3 class="proj-title">${escapeHtml(proj.title || "Project")}</h3>
            <p class="proj-desc">${escapeHtml(proj.description || "")}</p>
            ${proj.impact ? `<div class="proj-impact">★ ${escapeHtml(proj.impact)}</div>` : ""}
            ${Array.isArray(proj.tags) && proj.tags.length ? `<div class="tag-row">${proj.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
          </div>
          <div class="proj-btns">
            ${proj.live || proj.url || proj.link ? `<a href="${safeLink(proj.live || proj.url || proj.link)}" target="_blank" rel="noreferrer" class="btn-link">Live Demo &nearr;</a>` : ""}
            ${proj.github ? `<a href="${safeLink(proj.github, "https://github.com/")}" target="_blank" rel="noreferrer" class="btn-link">Source &nearr;</a>` : ""}
          </div>
        </div>`).join("")}
      </div>
    </section>` : ""}

    <!-- Experience Section -->
    ${experience.length ? `
    <section>
      <div class="sec-header">
        <h2 class="sec-title">Career Milestones</h2>
      </div>
      <div>
        ${experience.map(e => `
        <div class="exp-card">
          <div class="exp-role">${escapeHtml(e.role || "")}</div>
          <div class="exp-comp">${escapeHtml(e.company || "")}</div>
          <div class="exp-dur">${escapeHtml(e.duration || "")}</div>
          ${e.description ? `<p style="font-size: 14px; color: #94a3b8; margin-bottom: 8px;">${escapeHtml(e.description)}</p>` : ""}
          ${Array.isArray(e.highlights) && e.highlights.length ? `<ul class="exp-bullets">${e.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join("")}</ul>` : ""}
        </div>`).join("")}
      </div>
    </section>` : ""}

    <!-- Education Section -->
    ${education.length ? `
    <section>
      <div class="sec-header">
        <h2 class="sec-title">Academic Background</h2>
      </div>
      <div>
        ${education.map(edu => `
        <div class="exp-card">
          <div class="exp-role">${escapeHtml(edu.degree || "")}</div>
          <div class="exp-comp">${escapeHtml(edu.institution || "")}</div>
          <div class="exp-dur">${escapeHtml(edu.year || "")}</div>
          ${edu.description ? `<p style="font-size: 13px; color: #94a3b8;">${escapeHtml(edu.description)}</p>` : ""}
        </div>`).join("")}
      </div>
    </section>` : ""}
  </main>

  <footer>
    <div class="container">&copy; ${new Date().getFullYear()} ${name}. Built &amp; Deployed via PortfolioAI.</div>
  </footer>
</body>
</html>`;
}

// ==========================================
// 6. CYBERPUNK TEMPLATE
// ==========================================
function renderCyberpunkTemplate(p) {
  const { name, title, tagline, about, avatar, email, github, linkedin, skills, projects, experience } = p;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — ${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@600;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #050508; color: #00f0ff;
      font-family: 'Share Tech Mono', monospace; padding: 40px 20px;
    }
    .container { max-width: 900px; margin: 0 auto; }
    h1 { font-family: 'Orbitron', sans-serif; font-size: 40px; color: #fff; text-shadow: 0 0 20px rgba(0,240,255,0.6); }
    .neon-card {
      background: rgba(10, 10, 20, 0.9);
      border: 1px solid #00f0ff; border-radius: 8px;
      padding: 28px; margin-bottom: 24px;
      box-shadow: 0 0 15px rgba(0,240,255,0.15);
    }
    .btn-cyber {
      background: #ff003c; color: #fff; padding: 10px 20px;
      text-decoration: none; font-weight: bold; border-radius: 4px;
      display: inline-block; margin-right: 8px; box-shadow: 0 0 10px rgba(255,0,60,0.5);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="neon-card">
      <h1>${name}</h1>
      <p style="color: #ff003c; font-size: 16px; margin: 8px 0 18px;">&gt; ${tagline}</p>
      <div>
        ${email ? `<a href="https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}" target="_blank" rel="noopener noreferrer" class="btn-cyber">TRANSMIT</a>` : ""}
        ${github ? `<a href="${github}" target="_blank" rel="noreferrer" class="btn-cyber" style="background:#00f0ff; color:#000;">GITHUB</a>` : ""}
      </div>
    </div>
    ${about ? `<div class="neon-card"><h2 style="font-family:'Orbitron'; font-size:18px; margin-bottom:10px;">// SYSTEM BIO</h2><p style="color:#e0e0e0; line-height:1.7;">${about}</p></div>` : ""}
    ${skills.length ? `<div class="neon-card"><h2 style="font-family:'Orbitron'; font-size:18px; margin-bottom:10px;">// TECH MATRIX</h2><div>${skills.map(s => `<span style="display:inline-block; border:1px solid #ff003c; color:#ff003c; padding:4px 10px; margin:4px; border-radius:3px;">${escapeHtml(s)}</span>`).join("")}</div></div>` : ""}
  </div>
</body>
</html>`;
}

// ==========================================
// 6. CORPORATE EXECUTIVE TEMPLATE
// ==========================================
function renderCorporateTemplate(p) {
  const { name, title, tagline, about, avatar, targetRole, email, github, linkedin, website, skills, projects, experience, education } = p;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — ${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Cinzel:wght@700&display=swap" rel="stylesheet">
  <style>
    :root { --blue: #3b82f6; --navy: #0b1329; --card: #111d38; --border: #1e293b; --text: #f8fafc; --text-muted: #94a3b8; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: var(--navy); color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; padding: 48px 24px; line-height: 1.6; }
    .container { max-width: 960px; margin: 0 auto; }
    .exec-hero { background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 40px; margin-bottom: 32px; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5); }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 9999px; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); color: #60a5fa; font-size: 11px; font-weight: 700; margin-bottom: 16px; }
    .h1-row { display: flex; align-items: center; gap: 24px; margin-bottom: 16px; flex-wrap: wrap; }
    .avatar { width: 80px; height: 80px; border-radius: 16px; border: 2px solid var(--blue); object-fit: cover; }
    h1 { font-size: 38px; font-weight: 800; color: #fff; letter-spacing: -0.02em; }
    .tagline { font-size: 17px; color: var(--text-muted); max-width: 700px; margin-bottom: 24px; }
    .btn-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn { padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
    .btn-blue { background: #2563eb; color: #fff; }
    .btn-navy { background: #1e293b; color: #cbd5e1; border: 1px solid #334155; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 28px; margin-bottom: 20px; }
    .sec-title { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
    .chip { display: inline-block; padding: 6px 14px; border-radius: 8px; background: #1e293b; border: 1px solid #334155; font-size: 12px; color: #cbd5e1; margin: 4px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="exec-hero">
      <div class="badge">🏛️ EXECUTIVE &amp; ENTERPRISE LEADERSHIP</div>
      <div class="h1-row">
        ${avatar ? `<img src="${avatar}" alt="${name}" class="avatar">` : ""}
        <div>
          <h1>${name}</h1>
          <p style="color: #60a5fa; font-weight: 600; font-size: 15px;">${targetRole || "Executive Leader & Architect"}</p>
        </div>
      </div>
      <p class="tagline">${tagline}</p>
      <div class="btn-row">
        ${email ? `<a href="https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}" target="_blank" rel="noopener noreferrer" class="btn btn-blue">✉️ Contact Executive</a>` : ""}
        ${linkedin ? `<a href="${linkedin}" target="_blank" rel="noreferrer" class="btn btn-navy">💼 LinkedIn Profile</a>` : ""}
        ${github ? `<a href="${github}" target="_blank" rel="noreferrer" class="btn btn-navy">🐙 GitHub</a>` : ""}
      </div>
    </div>

    ${about ? `<div class="card"><div class="sec-title">Executive Summary</div><p style="color: #cbd5e1; font-size: 15px; line-height: 1.8;">${about}</p></div>` : ""}
    ${skills.length ? `<div class="card"><div class="sec-title">Core Competencies</div><div>${skills.map(s => `<span class="chip">${escapeHtml(s)}</span>`).join("")}</div></div>` : ""}
    ${projects.length ? `<div class="card"><div class="sec-title">Strategic Initiatives &amp; Projects</div>${projects.map(p => `<div style="padding: 14px 0; border-bottom: 1px solid #1e293b;"><h3 style="color:#fff; font-size:16px;">${escapeHtml(p.title || "")}</h3><p style="color:#94a3b8; font-size:13px; margin: 4px 0;">${escapeHtml(p.description || "")}</p>${p.live || p.url ? `<a href="${safeLink(p.live || p.url)}" target="_blank" rel="noreferrer" style="color:#60a5fa; font-size:12px; font-weight:700;">Initiative Link &rarr;</a>` : ""}</div>`).join("")}</div>` : ""}
    ${experience.length ? `<div class="card"><div class="sec-title">Leadership &amp; Career History</div>${experience.map(e => `<div style="padding: 14px 0; border-bottom: 1px solid #1e293b;"><h3 style="color:#fff; font-size:16px;">${escapeHtml(e.role || "")} @ <span style="color:#60a5fa;">${escapeHtml(e.company || "")}</span></h3><div style="color:#64748b; font-size:12px; margin: 2px 0 6px;">${escapeHtml(e.duration || "")}</div><p style="color:#94a3b8; font-size:13px;">${escapeHtml(e.description || "")}</p></div>`).join("")}</div>` : ""}
  </div>
</body>
</html>`;
}

// ==========================================
// 7. GOOGLE INSPIRED TEMPLATE
// ==========================================
function renderGoogleTemplate(p) {
  const { name, title, tagline, about, avatar, email, github, linkedin, skills, projects, experience } = p;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — ${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root { --g-blue: #4285f4; --g-red: #ea4335; --g-yellow: #fbbc05; --g-green: #34a853; --g-bg: #131314; --g-card: #1e1f20; --g-border: #333537; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: var(--g-bg); color: #e3e3e3; font-family: 'Roboto', -apple-system, sans-serif; padding: 48px 24px; line-height: 1.6; }
    .container { max-width: 920px; margin: 0 auto; }
    .card { background: var(--g-card); border: 1px solid var(--g-border); border-radius: 24px; padding: 36px; margin-bottom: 24px; }
    .g-bar { height: 4px; border-radius: 2px; background: linear-gradient(90deg, #4285f4 25%, #ea4335 25% 50%, #fbbc05 50% 75%, #34a853 75%); margin-bottom: 24px; }
    .h1-row { display: flex; align-items: center; gap: 20px; margin-bottom: 16px; flex-wrap: wrap; }
    .avatar { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 2px solid var(--g-blue); }
    h1 { font-family: 'Google Sans', sans-serif; font-size: 36px; font-weight: 700; color: #fff; }
    .btn { padding: 10px 20px; border-radius: 9999px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
    .btn-g { background: #4285f4; color: #fff; }
    .chip { display: inline-block; padding: 6px 14px; border-radius: 9999px; background: #282a2c; border: 1px solid var(--g-border); font-size: 12px; color: #c4c7c5; margin: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="g-bar"></div>
      <div class="h1-row">
        ${avatar ? `<img src="${avatar}" alt="${name}" class="avatar">` : ""}
        <div><h1>${name}</h1><p style="color: #4285f4; font-weight: 500;">${title}</p></div>
      </div>
      <p style="color: #c4c7c5; font-size: 16px; margin-bottom: 20px;">${tagline}</p>
      <div>
        ${email ? `<a href="https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}" target="_blank" rel="noopener noreferrer" class="btn btn-g">✉️ Send Email</a>` : ""}
        ${github ? `<a href="${github}" target="_blank" rel="noreferrer" class="btn" style="background:#282a2c; color:#e3e3e3; margin-left:8px;">GitHub</a>` : ""}
      </div>
    </div>
    ${about ? `<div class="card"><h2 style="font-family:'Google Sans'; font-size:20px; margin-bottom:12px; color:#fff;">About</h2><p style="color:#c4c7c5; line-height:1.7;">${about}</p></div>` : ""}
    ${skills.length ? `<div class="card"><h2 style="font-family:'Google Sans'; font-size:20px; margin-bottom:12px; color:#fff;">Skills &amp; Technologies</h2><div>${skills.map(s => `<span class="chip">${escapeHtml(s)}</span>`).join("")}</div></div>` : ""}
    ${projects.length ? `<div class="card"><h2 style="font-family:'Google Sans'; font-size:20px; margin-bottom:12px; color:#fff;">Projects</h2>${projects.map(p => `<div style="padding:12px 0;"><h3 style="color:#fff; font-size:16px;">${escapeHtml(p.title || "")}</h3><p style="color:#8e918f; font-size:13px; margin:4px 0;">${escapeHtml(p.description || "")}</p>${p.live || p.url ? `<a href="${safeLink(p.live || p.url)}" target="_blank" rel="noreferrer" style="color:#4285f4; font-size:13px;">View Project &rarr;</a>` : ""}</div>`).join("")}</div>` : ""}
  </div>
</body>
</html>`;
}

// ==========================================
// 8. MODERN TEMPLATE (DEFAULT)
// ==========================================
function renderModernTemplate(p) {
  const { name, title, tagline, about, avatar, targetRole, email, github, linkedin, skills, projects, experience, education, primaryColor } = p;

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — ${title}</title>
  <meta name="description" content="${about.slice(0, 160) || tagline}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${primaryColor || "#6366f1"};
      --bg: #09090b;
      --bg-card: rgba(24, 24, 27, 0.7);
      --border: rgba(39, 39, 42, 0.8);
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Inter', -apple-system, sans-serif;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .container { max-width: 1040px; margin: 0 auto; padding: 0 24px; }
    nav {
      position: sticky; top: 0; z-index: 50;
      background: rgba(9, 9, 11, 0.85); backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border); padding: 16px 0;
    }
    .nav-inner { display: flex; justify-content: space-between; align-items: center; }
    .nav-logo { font-size: 16px; font-weight: 800; color: #fff; text-decoration: none; }
    .nav-links { display: flex; gap: 24px; list-style: none; }
    .nav-links a { color: var(--text-muted); text-decoration: none; font-size: 13px; font-weight: 500; transition: color 0.2s; }
    .nav-links a:hover { color: #fff; }
    .hero { padding: 80px 0 50px; text-align: center; position: relative; }
    .avatar-wrap {
      width: 100px; height: 100px; margin: 0 auto 20px; border-radius: 50%;
      border: 3px solid rgba(99, 102, 241, 0.4); padding: 3px; background: rgba(99, 102, 241, 0.1);
    }
    .avatar-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
    .avatar-placeholder { width: 100%; height: 100%; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #9333ea); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 800; color: #fff; }
    .hero h1 { font-size: 44px; font-weight: 900; letter-spacing: -0.03em; color: #fff; margin-bottom: 12px; }
    .hero p { font-size: 18px; color: var(--text-muted); max-width: 650px; margin: 0 auto 28px; }
    .btn-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .btn {
      padding: 12px 24px; border-radius: 12px; font-size: 13px; font-weight: 600;
      text-decoration: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px;
    }
    .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
    .btn-secondary { background: rgba(39, 39, 42, 0.8); color: #fff; border: 1px solid var(--border); }
    section { padding: 50px 0; border-top: 1px solid var(--border); }
    .sec-tag { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #818cf8; font-weight: 700; margin-bottom: 6px; }
    .sec-title { font-size: 26px; font-weight: 800; color: #fff; margin-bottom: 24px; }
    .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 28px; }
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }
    .skills-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-chip { padding: 8px 16px; background: rgba(39, 39, 42, 0.6); border: 1px solid rgba(63, 63, 70, 0.8); border-radius: 10px; font-size: 13px; color: #e4e4e7; font-weight: 600; }
  </style>
</head>
<body>
  <nav>
    <div class="container nav-inner">
      <a href="#" class="nav-logo">${name}</a>
      <ul class="nav-links">
        ${about ? '<li><a href="#about">About</a></li>' : ""}
        ${skills.length ? '<li><a href="#skills">Skills</a></li>' : ""}
        ${projects.length ? '<li><a href="#projects">Projects</a></li>' : ""}
        ${experience.length ? '<li><a href="#experience">Experience</a></li>' : ""}
      </ul>
    </div>
  </nav>

  <header class="hero">
    <div class="container">
      ${
        avatar
          ? `<div class="avatar-wrap"><img src="${avatar}" alt="${name}" class="avatar-img" onerror="this.style.display='none'"></div>`
          : `<div class="avatar-wrap"><div class="avatar-placeholder">${name.charAt(0)}</div></div>`
      }
      <h1>${name}</h1>
      <p>${tagline}</p>
      <div class="btn-row">
        ${email ? `<a href="https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">✉️ Get in Touch</a>` : ""}
        ${github ? `<a href="${github}" target="_blank" rel="noreferrer" class="btn btn-secondary">🐙 GitHub</a>` : ""}
        ${linkedin ? `<a href="${linkedin}" target="_blank" rel="noreferrer" class="btn btn-secondary">💼 LinkedIn</a>` : ""}
      </div>
    </div>
  </header>

  <main class="container">
    ${about ? `<section id="about"><div class="sec-tag mono">Background</div><h2 class="sec-title">About Me</h2><div class="card"><p style="font-size:16px; color:#d4d4d8; line-height:1.8;">${about}</p></div></section>` : ""}

    ${skills.length ? `<section id="skills"><div class="sec-tag mono">Technologies</div><h2 class="sec-title">Skills &amp; Capabilities</h2><div class="skills-wrap">${skills.map(s => `<span class="skill-chip">${escapeHtml(s)}</span>`).join("")}</div></section>` : ""}

    ${projects.length ? `<section id="projects"><div class="sec-tag mono">Showcase</div><h2 class="sec-title">Featured Projects</h2><div class="grid-2">${projects.map(p => `<div class="card"><h3 style="color:#fff; font-size:18px; margin-bottom:8px;">${escapeHtml(p.title || "")}</h3><p style="color:#a1a1aa; font-size:14px; margin-bottom:14px;">${escapeHtml(p.description || "")}</p>${p.impact ? `<div style="color:#a5b4fc; font-size:12px; margin-bottom:12px; border-left:2px solid #6366f1; padding-left:8px;">${escapeHtml(p.impact)}</div>` : ""}${p.live || p.url ? `<a href="${safeLink(p.live || p.url)}" target="_blank" rel="noreferrer" style="color:#818cf8; text-decoration:none; font-size:13px; font-weight:600;">Live Demo &rarr;</a>` : ""}</div>`).join("")}</div></section>` : ""}

    ${experience.length ? `<section id="experience"><div class="sec-tag mono">Career</div><h2 class="sec-title">Work Experience</h2><div>${experience.map(e => `<div class="card" style="margin-bottom:16px;"><h3 style="color:#fff; font-size:17px;">${escapeHtml(e.role || "")} @ <span style="color:#818cf8;">${escapeHtml(e.company || "")}</span></h3><div class="mono" style="font-size:12px; color:#a1a1aa; margin:4px 0 8px;">${escapeHtml(e.duration || "")}</div><p style="color:#a1a1aa; font-size:13px;">${escapeHtml(e.description || "")}</p></div>`).join("")}</div></section>` : ""}
  </main>

  <footer style="padding:48px 0; border-top:1px solid var(--border); text-align:center; color:var(--text-muted); font-size:13px;">
    <div class="container">&copy; ${new Date().getFullYear()} ${name}. Deployed via PortfolioAI.</div>
  </footer>
</body>
</html>`;
}

/**
 * Creates an in-memory ZIP buffer containing index.html, _redirects, and README.md.
 */
export async function createPortfolioZipBuffer(portfolio) {
  return new Promise((resolve, reject) => {
    const archive = new archiverPkg.ZipArchive({ zlib: { level: 6 } });
    const buffers = [];

    const passthrough = new stream.PassThrough();
    passthrough.on("data", (chunk) => buffers.push(chunk));
    passthrough.on("end", () => resolve(Buffer.concat(buffers)));
    passthrough.on("error", (err) => reject(err));

    archive.pipe(passthrough);

    const distPath = path.resolve(process.cwd(), "../client/dist");
    const distHtmlPath = path.join(distPath, "index.html");

    const cleanPortfolio = typeof portfolio.toObject === "function" ? portfolio.toObject() : { ...portfolio };
    cleanPortfolio.status = "Published";
    cleanPortfolio.isPublic = true;

    if (fs.existsSync(distHtmlPath)) {
      // 1. Production React SPA bundle (Exact 1:1 pixel-perfect parity with localhost)
      const baseHtml = fs.readFileSync(distHtmlPath, "utf-8");
      const title = escapeHtml(cleanPortfolio.name || cleanPortfolio.title || "Portfolio");
      const role = escapeHtml(cleanPortfolio.targetRole || cleanPortfolio.tagline || "Developer Portfolio");
      const pageTitle = cleanPortfolio.seo?.title ? escapeHtml(cleanPortfolio.seo.title) : `${title} — ${role}`;
      const desc = escapeHtml(
        cleanPortfolio.seo?.description ||
        cleanPortfolio.about ||
        cleanPortfolio.tagline ||
        `Explore the professional developer portfolio of ${title}.`
      );
      const keywords = escapeHtml(
        Array.isArray(cleanPortfolio.seo?.keywords) && cleanPortfolio.seo.keywords.length > 0
          ? cleanPortfolio.seo.keywords.join(", ")
          : (Array.isArray(cleanPortfolio.skills) && cleanPortfolio.skills.length > 0
              ? cleanPortfolio.skills.join(", ")
              : "Portfolio, Software Engineer, Developer")
      );
      const ogImage = escapeHtml(cleanPortfolio.seo?.ogImage || cleanPortfolio.avatar || "");

      const safeJsonData = JSON.stringify(cleanPortfolio)
        .replace(/</g, "\\u003c")
        .replace(/>/g, "\\u003e");

      const personSchema = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "mainEntity": {
          "@type": "Person",
          "name": cleanPortfolio.name || cleanPortfolio.title,
          "description": cleanPortfolio.about || cleanPortfolio.tagline,
          "jobTitle": cleanPortfolio.targetRole || cleanPortfolio.tagline || "Software Engineer",
          ...(cleanPortfolio.avatar ? { "image": cleanPortfolio.avatar } : {}),
          ...(cleanPortfolio.skills && cleanPortfolio.skills.length > 0 ? { "knowsAbout": cleanPortfolio.skills } : {}),
        }
      }).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

      const seoHeadSnippet = `<title>${pageTitle}</title>
    <meta name="description" content="${desc}">
    <meta name="keywords" content="${keywords}">
    <meta name="author" content="${title}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <meta property="og:type" content="profile">
    <meta property="og:title" content="${pageTitle}">
    <meta property="og:description" content="${desc}">
    ${ogImage ? `<meta property="og:image" content="${ogImage}">` : ""}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${pageTitle}">
    <meta name="twitter:description" content="${desc}">
    ${ogImage ? `<meta name="twitter:image" content="${ogImage}">` : ""}
    <script type="application/ld+json">${personSchema}</script>
    <script>window.__PORTFOLIO_DATA__ = ${safeJsonData};</script>`;

      // Inject window.__PORTFOLIO_DATA__ and comprehensive SEO metadata directly into <head>
      const customHtml = baseHtml.replace(
        /<title>.*?<\/title>/i,
        seoHeadSnippet
      );

      archive.append(customHtml, { name: "index.html" });

      // Add all pre-compiled assets, fonts, palettes, and icons from client/dist
      const distEntries = fs.readdirSync(distPath);
      for (const entry of distEntries) {
        if (entry === "index.html" || entry === "test.html") continue;
        const fullEntryPath = path.join(distPath, entry);
        const stat = fs.statSync(fullEntryPath);
        if (stat.isDirectory()) {
          archive.directory(fullEntryPath, entry);
        } else {
          archive.file(fullEntryPath, { name: entry });
        }
      }
    } else {
      // Fallback: standalone self-contained HTML
      const html = generateStandaloneHtml(cleanPortfolio);
      archive.append(html, { name: "index.html" });
    }

    // 2. _redirects for Netlify SPA / clean routing
    archive.append("/* /index.html 200\n", { name: "_redirects" });

    // 3. .nojekyll for GitHub Pages static hosting
    archive.append("", { name: ".nojekyll" });

    // 4. README.md with deployment guidance
    const readme = `# ${cleanPortfolio.name || cleanPortfolio.title} — Standalone Deployment Package

This package contains the fully compiled, self-contained production web application for **${cleanPortfolio.name || cleanPortfolio.title}** (Template: **${cleanPortfolio.template || "modern"}**).

## Cloud Hosting Options (100% Free, Global CDN, No Server Required)
- **Netlify Drop**: Drag and drop this .zip into [https://app.netlify.com/drop](https://app.netlify.com/drop)
- **GitHub Pages**: Push this package to GitHub and enable GitHub Pages under Settings.
`;
    archive.append(readme, { name: "README.md" });

    archive.finalize();
  });
}
