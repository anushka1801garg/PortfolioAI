import React, { useState } from "react";
import {
  Globe,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  Code2,
  BookOpen,
  Trophy,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Send,
  Layers,
  Terminal,
  Zap,
  Sliders,
  Copy,
  Check,
  Cpu,
  Camera,
  MapPin,
  Building2,
  DollarSign,
  Award,
  FileText,
  Eye,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
  TiltCard,
  SpotlightCard,
  ScrollReveal,
  PulseAura,
  MagneticButton,
  MagneticPill,
  ProjectDeepDiveModal,
  DocumentViewerModal,
} from "./motionComponents";

const CustomPortfolioTemplate = ({ portfolio, onEditPhoto, isOwner }) => {
  const [inspectedProject, setInspectedProject] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  const {
    name = "",
    tagline = "",
    about = "",
    skills = [],
    projects = [],
    experience = [],
    education = [],
    achievements = [],
    certifications = [],
    blog = [],
    contact = {},
    preferences = {},
    targetRole = "",
    targetCompany = "",
  } = portfolio || {};

  // Extract contact links
  const email = portfolio.email || contact.email || "";
  const phone = portfolio.phone || contact.phone || "";
  const github = portfolio.github || contact.github || "";
  const linkedin = portfolio.linkedin || contact.linkedin || "";
  const website = portfolio.website || contact.website || "";

  // Custom Architecture Preferences
  const customDesign = preferences.customDesign || {};
  const customLayout = preferences.customLayout || {};
  const defaultLayoutStyle = customDesign.theme || customLayout.layoutStyle || preferences.style || "bento";
  const [currentLayoutStyle, setCurrentLayoutStyle] = useState(defaultLayoutStyle);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const density = customDesign.density || customLayout.density || "balanced";
  const fontChoice = customDesign.fontChoice || customLayout.font || preferences.font || "sans";
  const borderRadius = customDesign.borderRadius || customLayout.borderRadius || "rounded";
  const primaryColor = customDesign.primaryColor || customLayout.primaryColor || preferences.primaryColor || "#6366f1";
  const secondaryColor = customDesign.secondaryColor || customLayout.secondaryColor || "#a855f7";
  const backgroundColor = customDesign.backgroundColor || customLayout.backgroundColor || "#070709";
  const cardElevation = customDesign.cardElevation || customLayout.cardElevation || "glow";
  const customPitch = customDesign.customPitch || customLayout.customPitch || preferences.customPitch || "";
  const customCta = customDesign.customCta || customLayout.customCta || preferences.customCta || "Get in Touch";
  const activeSections = customLayout.activeSections || [
    "hero",
    "pitch",
    "about",
    "skills",
    "projects",
    "experience",
    "education",
    "achievements",
    "certifications",
    "contact",
    "blog",
  ];

  const isSectionActive = (id) => activeSections.includes(id);

  // Styling token helpers
  const avatar = portfolio.avatar || portfolio.hero?.avatar || "";
  const displayName = name || portfolio.hero?.name || "Developer";
  const displayTitle = targetRole || portfolio.hero?.title || "Software Engineer";
  const displayTagline = tagline || portfolio.hero?.tagline || "Architecting high-impact digital solutions with modern technology.";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "DEV";

  // Density spacing classes
  const spacingClass =
    density === "compact"
      ? "py-8 space-y-10"
      : density === "spacious"
      ? "py-20 space-y-24"
      : "py-14 space-y-16";

  const getRadiusClass = (type = "card") => {
    if (borderRadius === "sharp") return "rounded-none";
    if (borderRadius === "pill") return type === "button" ? "rounded-full" : "rounded-3xl sm:rounded-[32px]";
    return type === "button" ? "rounded-xl" : "rounded-2xl sm:rounded-3xl";
  };
  const cardRadius = getRadiusClass("card");
  const buttonRadius = getRadiusClass("button");

  // Card style classes based on currentLayoutStyle
  const getCardStyle = () => {
    switch (currentLayoutStyle) {
      case "glass":
        return `bg-zinc-900/40 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-indigo-950/20 ${cardRadius}`;
      case "terminal":
        return `bg-[#090d0b] border border-emerald-500/30 font-mono ${cardRadius} shadow-lg shadow-emerald-950/20`;
      case "minimal":
        return `bg-zinc-950 border border-zinc-800 ${cardRadius} shadow-none`;
      case "cyberpunk":
        return `bg-[#090814] border-2 border-yellow-400/50 ${cardRadius} shadow-lg shadow-yellow-500/10`;
      case "editorial":
        return `bg-[#0c0a09] border border-stone-800/90 ${cardRadius} shadow-xl`;
      case "brutalist":
        return `bg-[#0d0d0d] border-2 border-white ${cardRadius} shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)]`;
      case "corporate":
        return `bg-[#0b1220] border border-blue-900/40 ${cardRadius} shadow-xl shadow-blue-950/20`;
      case "bento":
      default:
        return `bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 hover:border-zinc-700/80 transition-all ${cardRadius} shadow-xl`;
    }
  };

  const cardStyle = getCardStyle();
  const fontClass =
    fontChoice === "serif"
      ? "font-serif"
      : fontChoice === "mono"
      ? "font-mono"
      : "font-sans";

  const handleCopyEmail = () => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };

  return (
    <div
      style={{ backgroundColor: backgroundColor || "#070709" }}
      className={`min-h-screen text-zinc-100 selection:bg-indigo-500 selection:text-white ${fontClass} relative overflow-hidden`}
    >
      {/* Dynamic Ambient Canvas Lighting with Framer Motion Drift */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 25, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
          className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full blur-[170px]"
          style={{ backgroundColor: `${primaryColor}22` }}
        />
        <motion.div
          animate={{
            x: [0, -40, 30, 0],
            y: [0, 45, -25, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ repeat: Infinity, duration: 22, ease: "easeInOut" }}
          className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full blur-[170px]"
          style={{ backgroundColor: `${secondaryColor}1e` }}
        />
        <motion.div
          animate={{
            x: [0, 30, -40, 0],
            y: [0, -30, 30, 0],
          }}
          transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
          className="absolute bottom-10 -left-20 w-[500px] h-[500px] rounded-full blur-[170px]"
          style={{ backgroundColor: `${primaryColor}14` }}
        />
        {currentLayoutStyle === "terminal" && (
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#059669_1px,transparent_1px),linear-gradient(to_bottom,#059669_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10 pointer-events-none" />
        )}
        {currentLayoutStyle === "cyberpunk" && (
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(234,179,8,0.04)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
        )}
      </div>

      {/* Top Floating Bespoke Navigation */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-40 backdrop-blur-2xl bg-[#070709]/85 border-b border-zinc-800/80"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
              className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-black text-indigo-400 shadow-md"
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    if (e.currentTarget.nextElementSibling) {
                      e.currentTarget.nextElementSibling.style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <span className={avatar ? "hidden" : "flex"}>{initials}</span>
            </motion.div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                {displayName}
              </span>
              <span className="text-[10px] text-zinc-500 block font-mono -mt-0.5">
                {displayTitle}
              </span>
            </div>
          </a>

          {/* Dynamic Jump Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400 font-medium">
            {isSectionActive("about") && about && (
              <a href="#about" className="hover:text-white transition">About</a>
            )}
            {isSectionActive("skills") && skills.length > 0 && (
              <a href="#skills" className="hover:text-white transition">Skills</a>
            )}
            {isSectionActive("projects") && projects.length > 0 && (
              <a href="#projects" className="hover:text-white transition">Projects</a>
            )}
            {isSectionActive("experience") && experience.length > 0 && (
              <a href="#experience" className="hover:text-white transition">Experience</a>
            )}
            {isSectionActive("contact") && (email || phone || linkedin) && (
              <a href="#contact" className="hover:text-white transition">Contact</a>
            )}
          </nav>

          {/* Custom CTA & Quick Actions */}
          <div className="flex items-center gap-2.5">
            {email && (
              <button
                type="button"
                onClick={handleCopyEmail}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-700/60 transition relative"
                title="Copy Email Address"
              >
                {copiedEmail ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedEmail ? "Copied!" : "Email"}</span>
              </button>
            )}

            {(email || phone || linkedin) && (
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`px-4 py-2 ${buttonRadius} text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg`}
                style={{ backgroundColor: primaryColor, boxShadow: `0 8px 20px -4px ${primaryColor}40` }}
              >
                <Send size={12} />
                <span>{customCta}</span>
              </motion.a>
            )}
          </div>
        </div>
      </motion.header>

      {/* Interactive Studio Architecture Mode Switcher Pill */}
      <div className="max-w-6xl mx-auto px-6 pt-4 flex flex-wrap items-center justify-between gap-3 relative z-20">
        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
          <Sliders size={13} className="text-indigo-400" />
          <span>STUDIO PREVIEW:</span>
          <div className="flex flex-wrap items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 shadow-inner">
            {[
              { id: "bento", label: "Bento" },
              { id: "glass", label: "Glass" },
              { id: "terminal", label: "Terminal" },
              { id: "cyberpunk", label: "Cyber" },
              { id: "editorial", label: "Editorial" },
              { id: "minimal", label: "Minimal" },
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => setCurrentLayoutStyle(theme.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                  currentLayoutStyle === theme.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-zinc-400">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-400">
            <Cpu size={12} className="text-emerald-400" />
            <span>CALIBRATION: ONLINE</span>
          </div>
        </div>
      </div>

      {/* Main Bespoke Canvas */}
      <main className={`max-w-6xl mx-auto px-6 relative z-10 ${spacingClass}`}>
        
        {/* SECTION: HERO */}
        {isSectionActive("hero") && (
          <motion.section
            id="hero"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6 pt-4"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Available for Opportunities</span>
              {targetCompany && (
                <span className="text-zinc-500">• Calibrated for {targetCompany}</span>
              )}
            </div>

            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-4 sm:gap-6">
                {avatar ? (
                  <div className="relative group shrink-0">
                    <PulseAura
                      colors={[primaryColor, secondaryColor, "#6366f1"]}
                      size="135%"
                      blur="20px"
                      opacity={0.35}
                    />
                    <TiltCard maxTilt={14} perspective={800} className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl relative z-10">
                      <div
                        className="w-full h-full rounded-2xl overflow-hidden p-0.5 shadow-xl relative group"
                        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, boxShadow: `0 10px 25px -5px ${primaryColor}40` }}
                      >
                        <img
                          src={avatar}
                          alt={displayName}
                          className="w-full h-full object-cover rounded-[14px]"
                          onError={(e) => {
                            e.currentTarget.parentElement.style.display = "none";
                          }}
                        />
                        {onEditPhoto && (
                          <button
                            type="button"
                            onClick={onEditPhoto}
                            className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer text-white z-20"
                            title="Change Custom Avatar"
                          >
                            <Camera size={18} className="text-white" />
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                              Edit
                            </span>
                          </button>
                        )}
                      </div>
                    </TiltCard>
                  </div>
                ) : null}
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-3xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]"
                >
                  {displayName}
                </motion.h1>
              </div>
              <p className="text-lg sm:text-2xl font-medium" style={{ color: primaryColor }}>
                {displayTitle}
              </p>
              <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed max-w-2xl">
                {displayTagline}
              </p>
            </div>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {email && (
                <motion.a
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2.5 ${buttonRadius} text-white text-xs font-bold transition flex items-center gap-2 shadow-lg`}
                  style={{ backgroundColor: primaryColor, boxShadow: `0 8px 20px -4px ${primaryColor}30` }}
                >
                  <Mail size={14} />
                  <span>{email}</span>
                </motion.a>
              )}
              {linkedin && (
                <motion.a
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  href={linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition flex items-center gap-2"
                >
                  <FaLinkedin size={14} className="text-sky-400" />
                  <span>LinkedIn</span>
                  <ArrowUpRight size={12} className="text-zinc-500" />
                </motion.a>
              )}
              {github && (
                <motion.a
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  href={github}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition flex items-center gap-2"
                >
                  <FaGithub size={14} />
                  <span>GitHub</span>
                  <ArrowUpRight size={12} className="text-zinc-500" />
                </motion.a>
              )}
              {website && (
                <motion.a
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition flex items-center gap-2"
                >
                  <Globe size={14} className="text-emerald-400" />
                  <span>Website</span>
                  <ArrowUpRight size={12} className="text-zinc-500" />
                </motion.a>
              )}
              {(portfolio?.resumeUrl || portfolio?.resume) && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    const url = portfolio.resumeUrl || portfolio.resume;
                    if (url.startsWith("data:")) {
                      window.dispatchEvent(
                        new CustomEvent("portfolio:view-doc", {
                          detail: {
                            title: portfolio.resumeName || `${displayName}_Resume.pdf`,
                            url,
                            type: "pdf",
                          },
                        })
                      );
                    } else {
                      window.open(url, "_blank", "noopener,noreferrer");
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-semibold transition flex items-center gap-2 cursor-pointer shadow-md"
                  title="View attached candidate resume"
                >
                  <FileText size={14} className="text-emerald-400" />
                  <span>{portfolio.resumeName || "Resume / CV"}</span>
                  <ArrowUpRight size={12} className="text-emerald-400" />
                </motion.button>
              )}
            </div>
          </motion.section>
        )}

        {/* SECTION: CUSTOM VALUE PROPOSITION / PITCH HOOK */}
        {isSectionActive("pitch") && customPitch && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-zinc-900/60 border border-indigo-500/30 relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono uppercase font-bold text-indigo-400 tracking-wider flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-400" />
                  <span>Executive Pitch &amp; Core Value Proposition</span>
                </span>
                <p className="text-sm sm:text-base text-zinc-200 font-medium leading-relaxed">
                  &ldquo;{customPitch}&rdquo;
                </p>
              </div>
              {(email || phone || linkedin) && (
                <motion.a
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-4 py-2 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition shrink-0 self-start sm:self-center cursor-pointer shadow-md"
                >
                  Initiate Discussion
                </motion.a>
              )}
            </div>
          </motion.section>
        )}

        {/* SECTION: ABOUT NARRATIVE */}
        {isSectionActive("about") && about && (
          <motion.section
            id="about"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`${cardStyle} p-6 sm:p-10 space-y-4`}
          >
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Background &amp; Architectural Focus</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              About The Engineer
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
              {about}
            </p>
          </motion.section>
        )}

        {/* SECTION: SKILLS & TECH CAPABILITIES */}
        {isSectionActive("skills") && skills.length > 0 && (
          <motion.section
            id="skills"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Code2 size={20} className="text-indigo-400" />
                  <span>Technical Arsenal &amp; Specializations</span>
                </h2>
                <p className="text-xs text-zinc-400 pt-0.5">
                  Core competencies, distributed systems tooling, and modern frameworks.
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-500">
                {skills.length} Competencies
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {skills.map((skill, idx) => (
                <MagneticPill key={idx}>
                  <div
                    className="px-3.5 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-indigo-500/50 text-xs font-medium text-zinc-200 hover:text-white transition shadow-sm group flex items-center gap-2 cursor-default"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 group-hover:bg-emerald-400 transition" />
                    <span>{skill}</span>
                  </div>
                </MagneticPill>
              ))}
            </div>
          </motion.section>
        )}

        {/* SECTION: FEATURED PROJECTS */}
        {isSectionActive("projects") && projects.length > 0 && (
          <motion.section
            id="projects"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Layers size={20} className="text-purple-400" />
                  <span>Featured Engineering Projects</span>
                </h2>
                <p className="text-xs text-zinc-400 pt-0.5">
                  Production systems, open-source architectures, and quantified technical outcomes.
                </p>
              </div>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {projects.map((proj, idx) => {
                const projectUrl = proj.live || proj.url || proj.link || proj.github;
                const safeProjectUrl = projectUrl
                  ? projectUrl.startsWith("http")
                    ? projectUrl
                    : `https://${projectUrl}`
                  : null;

                return (
                  <TiltCard key={idx} maxTilt={6} perspective={900}>
                    <SpotlightCard
                      spotlightColor={`${primaryColor}20`}
                      className={`${cardStyle} p-6 sm:p-7 flex flex-col justify-between space-y-5 group hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg`}
                      onClick={() => setInspectedProject(proj)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-indigo-400 font-bold">
                            0{idx + 1} // PROJECT
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectedProject(proj);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white transition text-xs font-mono cursor-pointer"
                            >
                              inspect //
                            </button>
                            {proj.github && (
                              <a
                                href={proj.github.startsWith("http") ? proj.github : `https://${proj.github}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                                title="View GitHub Repository"
                              >
                                <FaGithub size={14} />
                              </a>
                            )}
                            {proj.live && (
                              <a
                                href={proj.live.startsWith("http") ? proj.live : `https://${proj.live}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition"
                                title="Visit Live Application"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                          <span>{proj.title}</span>
                          {safeProjectUrl && (
                            <ExternalLink size={14} className="text-indigo-400 opacity-60 group-hover:opacity-100 transition shrink-0" />
                          )}
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                          {proj.description}
                        </p>

                        {proj.impact && (
                          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 font-medium">
                            🚀 {proj.impact}
                          </div>
                        )}
                      </div>

                      {Array.isArray(proj.tags) && proj.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-800/80">
                          {proj.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-[10px] font-mono text-zinc-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </SpotlightCard>
                  </TiltCard>
                );
              })}
            </motion.div>
          </motion.section>
        )}

        {/* SECTION: WORK EXPERIENCE */}
        {isSectionActive("experience") && experience.length > 0 && (
          <motion.section
            id="experience"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Briefcase size={20} className="text-emerald-400" />
                <span>Professional Trajectory</span>
              </h2>
              <p className="text-xs text-zinc-400 pt-0.5">
                Demonstrated impact across high-velocity engineering organizations.
              </p>
            </div>

            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                  className={`${cardStyle} p-6 sm:p-8 space-y-4 border-l-4 border-l-indigo-500`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {exp.role}
                      </h3>
                      <p className="text-xs sm:text-sm text-indigo-300 font-medium">
                        {exp.company}
                      </p>
                      {/* Metadata Badges: Location, Workplace, Compensation */}
                      <div className="flex items-center gap-2 pt-1.5 flex-wrap">
                        {exp.location && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                            <MapPin size={11} className="text-indigo-400" />
                            <span>{exp.location}</span>
                          </span>
                        )}
                        {exp.workplaceType && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono">
                            <Building2 size={9} />
                            <span>{exp.workplaceType}</span>
                          </span>
                        )}
                        {exp.compensation && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                            <DollarSign size={9} />
                            <span>
                              {exp.compensation}
                              {exp.compensationAmount ? ` · ${exp.compensationAmount}` : ""}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    {exp.duration && (
                      <span className="text-xs font-mono text-zinc-400 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 self-start sm:self-center shrink-0">
                        {exp.duration}
                      </span>
                    )}
                  </div>

                  {exp.description && (
                    <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                      {exp.description}
                    </p>
                  )}

                  {/* Company Project Carried Out Under Company */}
                  {(exp.projectTitle || exp.projectLive || exp.projectGithub) && (
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs">
                      <div className="flex items-center gap-1.5 font-medium min-w-0">
                        <span className="text-indigo-400 font-bold flex items-center gap-1 text-[11px]">
                          <Code2 size={12} />
                          <span>Project:</span>
                        </span>
                        <span className="font-semibold text-white text-xs truncate">
                          {exp.projectTitle || "Key Deliverable"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {exp.projectLive && (
                          <a
                            href={exp.projectLive.startsWith("http") ? exp.projectLive : `https://${exp.projectLive}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-[10px] font-semibold transition cursor-pointer"
                          >
                            <span>Live</span>
                            <ExternalLink size={9} />
                          </a>
                        )}
                        {exp.projectGithub && (
                          <a
                            href={exp.projectGithub.startsWith("http") ? exp.projectGithub : `https://${exp.projectGithub}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-[10px] font-semibold transition cursor-pointer"
                          >
                            <FaGithub size={10} />
                            <span>Repo</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Credentials / View Document Buttons */}
                  {(exp.certificate || exp.offerLetter) && (
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {exp.certificate && (
                        <button
                          type="button"
                          onClick={() =>
                            setViewingDoc({
                              title: "Completion Certificate",
                              company: exp.company,
                              role: exp.role,
                              url: exp.certificate,
                              type: "certificate",
                              fileName: exp.certificateName,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition cursor-pointer shadow-sm shadow-amber-500/10"
                        >
                          <Award size={13} className="text-amber-400" />
                          <span>View Completion Certificate</span>
                          <Eye size={12} />
                        </button>
                      )}
                      {exp.offerLetter && (
                        <button
                          type="button"
                          onClick={() =>
                            setViewingDoc({
                              title: "Offer Letter",
                              company: exp.company,
                              role: exp.role,
                              url: exp.offerLetter,
                              type: "offerLetter",
                              fileName: exp.offerLetterName,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition cursor-pointer shadow-sm shadow-emerald-500/10"
                        >
                          <FileText size={13} className="text-emerald-400" />
                          <span>View Offer Letter</span>
                          <Eye size={12} />
                        </button>
                      )}
                    </div>
                  )}

                  {Array.isArray(exp.highlights) && exp.highlights.length > 0 && (
                    <ul className="space-y-2 pt-1">
                      {exp.highlights.map((h, hIdx) => (
                        <li
                          key={hIdx}
                          className="text-xs text-zinc-300 flex items-start gap-2.5 leading-relaxed"
                        >
                          <ChevronRight size={13} className="text-indigo-400 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* SECTION: EDUCATION */}
        {isSectionActive("education") && education.length > 0 && (
          <motion.section
            id="education"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <GraduationCap size={20} className="text-sky-400" />
                <span>Education &amp; Credentials</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {education.map((edu, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className={`${cardStyle} p-6 space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {edu.degree || "Degree"}
                    </h3>
                    {edu.year && (
                      <span className="text-xs font-mono text-zinc-400">
                        {edu.year}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-sky-400 font-medium">{edu.institution}</p>
                  {edu.description && (
                    <p className="text-xs text-zinc-400 font-light pt-1">
                      {edu.description}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* SECTION: ACHIEVEMENTS */}
        {(isSectionActive("achievements") || (!customLayout.activeSections && achievements.length > 0)) && achievements.length > 0 && (
          <motion.section
            id="achievements"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Trophy size={20} className="text-amber-400" />
                <span>Honors &amp; Recognitions</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((ach, idx) => {
                const title = typeof ach === "string" ? ach : (ach?.title || ach?.name || "");
                const organization = typeof ach === "object" ? ach?.organization : null;
                const description = typeof ach === "object" ? ach?.description : null;
                const metric = typeof ach === "object" ? ach?.metric : null;
                const achDate = typeof ach === "object" ? (ach?.date || ach?.year) : null;
                const achUrl = (typeof ach === "object" && ach !== null && typeof ach.link === "string" && ach.link) ||
                               (typeof ach === "object" && ach !== null && typeof ach.url === "string" && ach.url) || null;
                const safeAchUrl = achUrl ? (achUrl.startsWith("http") ? achUrl : `https://${achUrl}`) : null;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className={`${cardStyle} p-5 space-y-2 hover:border-amber-500/40 transition`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">🏆</span>
                      {achDate && (
                        <span className="text-[10px] font-mono text-zinc-500">{achDate}</span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white">{title}</h3>
                    {organization && (
                      <p className="text-xs text-zinc-400">{organization}</p>
                    )}
                    {description && (
                      <p className="text-xs text-zinc-300 font-light leading-relaxed">{description}</p>
                    )}
                    {metric && (
                      <span className="inline-block text-[11px] font-mono text-amber-300 font-bold">
                        {metric}
                      </span>
                    )}
                    {safeAchUrl && (
                      <div className="pt-1">
                        <a
                          href={safeAchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition font-medium"
                        >
                          <span>View Proof / Link</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* SECTION: CERTIFICATIONS */}
        {(isSectionActive("certifications") || (!customLayout.activeSections && certifications.length > 0)) && certifications.length > 0 && (
          <motion.section
            id="certifications"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <ShieldCheck size={20} className="text-purple-400" />
                <span>Licenses &amp; Certifications</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {certifications.map((cert, idx) => {
                const certUrl = cert.link || cert.url;
                const safeCertUrl = certUrl ? (certUrl.startsWith("http") ? certUrl : `https://${certUrl}`) : null;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className={`${cardStyle} p-5 space-y-2 hover:border-purple-500/40 transition`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">📜</span>
                      {cert.date && (
                        <span className="text-[10px] font-mono text-zinc-500">{cert.date}</span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white">{cert.name}</h3>
                    <p className="text-xs text-purple-300/80 font-medium">{cert.issuer}</p>
                    {cert.description && (
                      <p className="text-xs text-zinc-300 font-light leading-relaxed">{cert.description}</p>
                    )}
                    {safeCertUrl && (
                      <div className="pt-1">
                        <a
                          href={safeCertUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition font-medium"
                        >
                          <span>Verify Credential</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* SECTION: BLOG / WRITING */}
        {isSectionActive("blog") && blog.length > 0 && (
          <motion.section
            id="blog"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <BookOpen size={20} className="text-indigo-400" />
                <span>Publications &amp; Technical Writing</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blog.map((article, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className={`${cardStyle} p-6 space-y-3`}
                >
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                    <span>{article.date || "Article"}</span>
                    {article.readTime && <span>{article.readTime}</span>}
                  </div>
                  <h3 className="text-base font-bold text-white hover:text-indigo-300 transition">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-xs text-zinc-400 font-light leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}
                  {article.link && (
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold pt-1"
                    >
                      <span>Read Publication</span>
                      <ArrowUpRight size={12} />
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* SECTION: CONTACT HUB */}
        {isSectionActive("contact") && (
          <motion.section
            id="contact"
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={`${cardStyle} p-8 sm:p-12 text-center space-y-6 relative overflow-hidden`}
          >
            <div className="max-w-xl mx-auto space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
                Initiate Contact
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Let&apos;s Build Together
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-light">
                Have a project inquiry, engineering leadership role, or consulting opportunity?
              </p>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
              {email && (
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  <Mail size={15} />
                  <span>{email}</span>
                </motion.a>
              )}
              {phone && (
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={`tel:${phone}`}
                  className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition flex items-center gap-2"
                >
                  <Phone size={15} />
                  <span>{phone}</span>
                </motion.a>
              )}
              {linkedin && (
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition flex items-center gap-2"
                >
                  <FaLinkedin size={15} className="text-sky-400" />
                  <span>LinkedIn Profile</span>
                </motion.a>
              )}
              {github && (
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={github}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition flex items-center gap-2"
                >
                  <FaGithub size={15} />
                  <span>GitHub</span>
                </motion.a>
              )}
            </div>
          </motion.section>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-8 text-center text-xs text-zinc-500 relative z-10">
        <p>© {new Date().getFullYear()} {displayName}. All rights reserved.</p>
        <p className="text-[10px] text-zinc-600 pt-1 font-mono">Bespoke Custom Architecture</p>
      </footer>

      <ProjectDeepDiveModal
        project={inspectedProject}
        onClose={() => setInspectedProject(null)}
        accentColor={primaryColor}
      />

      <DocumentViewerModal
        doc={viewingDoc}
        onClose={() => setViewingDoc(null)}
      />
    </div>
  );
};

export default CustomPortfolioTemplate;
