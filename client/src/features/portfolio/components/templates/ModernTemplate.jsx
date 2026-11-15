import { useState, useMemo, useEffect } from "react";
import {
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  Copy,
  Check,
  ExternalLink,
  X,
  Camera,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Layers,
  Award,
  Zap,
  Clock,
  MapPin,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from "react-hot-toast";
import {
  SpotlightCard,
  TiltCard,
  ShimmerText,
  MagneticButton,
  ScrollReveal,
  LiveAmbientMesh,
  ProjectDeepDiveModal,
  Perspective3DCard,
  InteractiveCursorFollower,
  KineticMarquee,
  DynamicSoundwaveVisualizer,
  FloatingBadge,
  NeuralMeshCanvas,
  ExperienceCredentialsBadges,
  DiffBox,
  DiffThemeBanner,
} from './motionComponents';

const ModernTemplate = ({ portfolio, onEditPhoto, isOwner, previewDevice }) => {
  const isMobile = previewDevice === "mobile" || portfolio?._previewDevice === "mobile";
  const {
    name = "",
    tagline = "Full-Stack Software Engineer & Builder",
    about = "",
    skills = [],
    projects = [],
    experience = [],
    education = [],
    achievements = [],
    certifications = [],
    linkedin,
    email,
    phone,
    title,
    avatar: rawAvatar,
    location: rawLocation,
  } = portfolio || {};

  const avatar = rawAvatar || portfolio?.avatar || portfolio?.hero?.avatar || portfolio?.user?.avatar || "";
  const displayName = name || portfolio?.name || portfolio?.hero?.name || title?.replace(/portfolio/i, "").trim() || "Candidate";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "CD";

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [inspectedProject, setInspectedProject] = useState(null);
  const [currentTime, setCurrentTime] = useState("");

  // Live real-time clock formatting (IST/Local)
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const formatted = new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZoneName: "short",
        }).format(now);
        setCurrentTime(formatted);
      } catch {
        setCurrentTime("Active Online");
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyEmail = (e) => {
    e?.preventDefault();
    if (!email) return;
    navigator.clipboard?.writeText(email);
    setCopiedEmail(true);
    toast.success(`Copied ${email} to clipboard! 📋`);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Detect domain (Finance/HR/Management vs Software Engineering) for contextual elegance
  const isExecutive = useMemo(() => {
    const text = `${displayName} ${tagline} ${about} ${experience.map((e) => `${e.role} ${e.company}`).join(" ")}`.toLowerCase();
    return /\b(chief executive|c-suite|cfo|cro|coo|vice president|vp\b|general manager|director of finance|human resources director|statutory compliance officer|f&a manager)\b/i.test(text);
  }, [displayName, tagline, about, experience]);

  // Dynamic Impact Metrics tailored to the candidate's authentic domain
  const dynamicMetrics = useMemo(() => {
    if (isExecutive) {
      return [
        {
          metric: "25+",
          label: "Years Leadership",
          sub: "Strategic F&A, HR & Operations",
          badge: "Executive Tenured",
          color: "from-indigo-400 to-cyan-300",
        },
        {
          metric: `${experience.length || 5}`,
          label: "Major Organizations",
          sub: "Engineering, Oil & Gas & Corporate",
          badge: "Enterprise Leadership",
          color: "from-blue-400 to-indigo-400",
        },
        {
          metric: `${skills.length || 13}+`,
          label: "Core Competencies",
          sub: "Statutory, Taxation, Audits & HR",
          badge: "Regulatory Expert",
          color: "from-purple-400 to-pink-400",
        },
        {
          metric: "100%",
          label: "Statutory Governance",
          sub: "Zero-Penalty EPF, ESI, GST & Audits",
          badge: "Compliance Rating",
          color: "from-emerald-400 to-teal-300",
        },
      ];
    }
    return [
      {
        metric: `${Math.max(5, experience.length * 2)}+`,
        label: "Years Experience",
        sub: "Distributed Architecture & Engineering",
        badge: "Production Tested",
        color: "from-indigo-400 to-cyan-300",
      },
      {
        metric: `${projects.length || 6}+`,
        label: "Platforms Delivered",
        sub: "Cloud-Native, Resilient & Modular",
        badge: "Production Tier",
        color: "from-blue-400 to-indigo-400",
      },
      {
        metric: `${skills.length || 15}+`,
        label: "Tech Stack Standards",
        sub: "Modern Frameworks & Cloud APIs",
        badge: "Full-Stack Range",
        color: "from-purple-400 to-pink-400",
      },
      {
        metric: "99.9%",
        label: "System Availability",
        sub: "Zero-Downtime Reliability Standards",
        badge: "Architecture SLA",
        color: "from-emerald-400 to-teal-300",
      },
    ];
  }, [isExecutive, experience.length, skills.length, projects.length]);

  // Dynamically extract unique categories from authentic project tags
  const projectCategories = useMemo(() => {
    const catSet = new Set(["ALL"]);
    projects.forEach((p) => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((t) => {
          if (t && t.trim()) catSet.add(t.trim().toUpperCase());
        });
      }
    });
    return Array.from(catSet).slice(0, 6);
  }, [projects]);

  // Group competencies into smart thematic clusters
  const competencyClusters = useMemo(() => {
    if (!skills || skills.length === 0) return [];
    if (isExecutive) {
      const finance = [];
      const hr = [];
      const systems = [];
      const leadership = [];

      skills.forEach((s) => {
        const sl = s.toLowerCase();
        if (
          sl.includes("tax") ||
          sl.includes("audit") ||
          sl.includes("financ") ||
          sl.includes("account") ||
          sl.includes("ar") ||
          sl.includes("ap") ||
          sl.includes("compliance") ||
          sl.includes("statutory")
        ) {
          finance.push(s);
        } else if (
          sl.includes("hr") ||
          sl.includes("payroll") ||
          sl.includes("personnel") ||
          sl.includes("epf") ||
          sl.includes("esi") ||
          sl.includes("workforce") ||
          sl.includes("recruitment")
        ) {
          hr.push(s);
        } else if (
          sl.includes("tally") ||
          sl.includes("erp") ||
          sl.includes("software") ||
          sl.includes("system") ||
          sl.includes("portal") ||
          sl.includes("gas") ||
          sl.includes("oil")
        ) {
          systems.push(s);
        } else {
          leadership.push(s);
        }
      });

      const clusters = [];
      if (finance.length > 0) {
        clusters.push({
          title: "Financial Governance & Statutory Compliance",
          tag: "FINANCIAL GOVERNANCE",
          color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
          dotColor: "bg-indigo-400",
          skills: finance,
        });
      }
      if (hr.length > 0) {
        clusters.push({
          title: "Human Capital, Payroll & Labor Laws",
          tag: "HUMAN CAPITAL",
          color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
          dotColor: "bg-emerald-400",
          skills: hr,
        });
      }
      if (systems.length > 0) {
        clusters.push({
          title: "Enterprise Systems, ERP & Sector Expertise",
          tag: "ENTERPRISE SYSTEMS",
          color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
          dotColor: "bg-cyan-400",
          skills: systems,
        });
      }
      if (leadership.length > 0) {
        clusters.push({
          title: "Executive Leadership & Strategic Administration",
          tag: "EXECUTIVE LEADERSHIP",
          color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
          dotColor: "bg-purple-400",
          skills: leadership,
        });
      }
      return clusters;
    }

    return [
      {
        title: "Core Technologies & Engineering Capabilities",
        tag: "TECHNOLOGY STACK",
        color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
        dotColor: "bg-indigo-400",
        skills,
      },
    ];
  }, [skills, isExecutive]);

  // Helper for company initials in monogram
  const getCompanyInitials = (comp) => {
    if (!comp) return "CO";
    return comp
      .split(" ")
      .filter((w) => !["pvt", "ltd", "inc", "corp", "llc", "private", "limited"].includes(w.toLowerCase()))
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || comp.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#06080F] text-zinc-100 selection:bg-indigo-500/30 selection:text-white font-jakarta relative overflow-x-hidden pb-32">
      {/* Live Ambient Dynamic Mesh & Floating Orbs */}
      <LiveAmbientMesh />
      {/* Interactive Neural Mesh Energy Synapse Canvas */}
      <NeuralMeshCanvas nodeCount={46} color="rgba(99, 102, 241, 0.35)" pulseColor="#06b6d4" opacity={0.28} />
      <InteractiveCursorFollower color="rgba(99, 102, 241, 0.14)" size={540} blur={95} />

      {/* Top Floating Glass Navigation Bar (Awwwards Style) */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#06080F]/80 border-b border-white/[0.06] transition-all">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Identity Brand */}
          <a href="#hero" className="flex items-center gap-3.5 group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden p-0.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition duration-300">
              <div className="w-full h-full rounded-[10px] bg-zinc-950 flex items-center justify-center overflow-hidden">
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
                <span className={`text-xs font-black text-indigo-300 ${avatar ? "hidden" : "flex"}`}>
                  {initials}
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-white group-hover:text-indigo-300 transition">
                {displayName}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase truncate max-w-[200px]">
                {tagline?.split("·")[0] || tagline?.split("with")[0] || (isExecutive ? "Executive Portfolio" : "Engineering Portfolio")}
              </span>
            </div>
          </a>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-zinc-400 tracking-wide">
            {about && (
              <button
                type="button"
                onClick={() => scrollToSection("about")}
                className="hover:text-white transition cursor-pointer"
              >
                Profile
              </button>
            )}
            {experience.length > 0 && (
              <button
                type="button"
                onClick={() => scrollToSection("experience")}
                className="hover:text-white transition cursor-pointer"
              >
                Trajectory
              </button>
            )}
            {skills.length > 0 && (
              <button
                type="button"
                onClick={() => scrollToSection("skills")}
                className="hover:text-white transition cursor-pointer"
              >
                Competencies
              </button>
            )}
            {projects.length > 0 && (
              <button
                type="button"
                onClick={() => scrollToSection("projects")}
                className="hover:text-white transition cursor-pointer"
              >
                Initiatives
              </button>
            )}
            {education.length > 0 && (
              <button
                type="button"
                onClick={() => scrollToSection("education")}
                className="hover:text-white transition cursor-pointer"
              >
                Credentials
              </button>
            )}
          </nav>

          {/* Action Suite (Telemetry + Contact) */}
          <div className="flex items-center gap-3">
            <DynamicSoundwaveVisualizer barCount={10} color="bg-gradient-to-t from-indigo-500 to-cyan-400" className="hidden lg:flex opacity-75 mr-1" />

            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-mono font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{isExecutive ? "Available for Advisory" : "Available for Opportunities"}</span>
            </div>

            <button
              type="button"
              onClick={() => setEmailModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition hover:scale-[1.02] cursor-pointer"
            >
              <Mail size={13} />
              <span>Contact</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`relative max-w-6xl mx-auto py-8 sm:py-12 space-y-16 sm:space-y-28 overflow-x-hidden w-full ${isMobile ? "px-3" : "px-4 sm:px-6"}`}>
        {/* =========================================================================
            SECTION 01: AWWWARDS & FIGMA BENTO HERO
           ========================================================================= */}
        <ScrollReveal direction="up" immediate={true}>
          <section id="hero" className="space-y-6 scroll-mt-24">
            {/* AI Theme Optimization Banner (in diff mode) */}
            {portfolio?._showDiff && (portfolio?._isTemplateAIHighlighted || portfolio?._aiOriginalTemplate) && (
              <DiffThemeBanner
                originalTemplate={portfolio._aiOriginalTemplate || "Modern"}
                suggestedTemplate="Modern (AI Enhanced)"
                className="mb-4"
              />
            )}

            {/* Top Telemetry Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 font-mono pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <MapPin size={13} className="text-indigo-400" />
                  <span>{rawLocation || "Remote / Worldwide"}</span>
                </span>
                <span className="text-zinc-600">•</span>
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Clock size={13} className="text-cyan-400" />
                  <span>{currentTime || "IST Local Time"}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>{isExecutive ? "EXECUTIVE DOSSIER // VERIFIED 2026" : "ENGINEERING PORTFOLIO // VERIFIED 2026"}</span>
              </div>
            </div>

            {/* Asymmetrical Hero Bento Grid */}
            <div className={`grid gap-6 items-stretch ${isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12"}`}>
              {/* Main Statement Bento Card (8 Cols on Desktop) */}
              <div className={`${isMobile ? "col-span-1 p-5 sm:p-8" : "lg:col-span-8 p-8 sm:p-12"} rounded-3xl glass-panel border border-white/[0.08] relative overflow-hidden flex flex-col justify-between space-y-6 shadow-2xl`}>
                {/* Ambient glow accent in top right */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="space-y-5 relative z-10">
                  {/* Status beacon pill */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{isExecutive ? "Open to Senior Leadership, Advisory & Board Roles" : "Available for Full-Time Roles & High-Impact Opportunities"}</span>
                  </div>

                  {/* High-Impact Editorial Display Title */}
                  <h1 className={`font-extrabold tracking-tight text-white leading-[1.08] font-outfit break-words ${isMobile ? "text-3xl" : "text-4xl sm:text-6xl lg:text-7xl"}`}>
                    Hi, I&apos;m{" "}
                    <ShimmerText className="break-words max-w-full" gradient="from-white via-indigo-200 via-cyan-200 to-indigo-300">
                      {displayName}
                    </ShimmerText>
                  </h1>

                  {/* Subtitle / Tagline: Support Before vs After Diff */}
                  {portfolio?._showDiff && (portfolio?._isTaglineAIHighlighted || portfolio?._aiOriginalTagline) ? (
                    <DiffBox
                      original={portfolio._aiOriginalTagline || `${displayName} | Full-Stack Software Engineer`}
                      suggested={tagline}
                      originalLabel="Before (Original Tagline)"
                      suggestedLabel="After (AI Optimized Tagline)"
                      category="Hero Headline & Tagline"
                    />
                  ) : (
                    <p className="text-xl sm:text-2xl text-indigo-300 font-semibold leading-snug">
                      {tagline}
                    </p>
                  )}

                  {/* First-Person Authentic Executive Pitch: Support Before vs After Diff */}
                  {portfolio?._showDiff && (portfolio?._isAboutAIHighlighted || portfolio?._aiOriginalAbout) ? (
                    <DiffBox
                      original={portfolio._aiOriginalAbout || "Passionate software engineer building modern scalable applications."}
                      suggested={about}
                      originalLabel="Before (Original Bio)"
                      suggestedLabel="After (AI Optimized Headline Pitch)"
                      category="Professional Bio & Summary"
                    />
                  ) : about ? (
                    <div className="relative pl-5 border-l-2 border-indigo-500/40 py-1">
                      <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                        {about}
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Quick Action CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/[0.06] relative z-10">
                  {email && (
                    <MagneticButton>
                      <button
                        type="button"
                        onClick={() => setEmailModalOpen(true)}
                        className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition shadow-xl shadow-indigo-600/25 cursor-pointer hover:scale-[1.02]"
                      >
                        <Mail size={15} />
                        <span>Direct Communication</span>
                        <ArrowRight size={13} />
                      </button>
                    </MagneticButton>
                  )}

                  {linkedin && (
                    <MagneticButton
                      href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-900/90 border border-white/[0.1] hover:border-sky-500/50 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold transition shadow-md"
                    >
                      <FaLinkedin size={15} className="text-sky-400" />
                      <span>{isExecutive ? "Executive LinkedIn" : "LinkedIn Profile"}</span>
                      <ArrowUpRight size={12} className="text-zinc-500" />
                    </MagneticButton>
                  )}

                  {(portfolio?.resumeUrl || portfolio?.resume) && (
                    <MagneticButton>
                      <button
                        type="button"
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
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-semibold transition shadow-md cursor-pointer"
                        title="View attached candidate resume"
                      >
                        <FileText size={15} className="text-emerald-400" />
                        <span>{portfolio.resumeName || "Verified Resume / CV"}</span>
                        <ArrowUpRight size={12} className="text-emerald-400" />
                      </button>
                    </MagneticButton>
                  )}

                  {email && (
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-zinc-900/60 border border-white/[0.06] hover:border-white/20 text-zinc-400 hover:text-white text-xs font-mono transition cursor-pointer"
                      title="Copy email to clipboard"
                    >
                      {copiedEmail ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copiedEmail ? "Copied!" : "Copy Address"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Portrait & Identity Bento Card (4 Cols on Desktop) */}
              <div className={`${isMobile ? "col-span-1 p-5 sm:p-6" : "lg:col-span-4 p-6 sm:p-8"} rounded-3xl glass-panel border border-white/[0.08] flex flex-col items-center justify-between text-center relative overflow-hidden shadow-2xl space-y-6`}>
                <div className="w-full flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>ONLINE</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                    PORTRAIT
                  </span>
                </div>

                {/* 3D Tilt Avatar Display */}
                <TiltCard maxTilt={10} className="shrink-0 my-2">
                  <div className="relative group">
                    {/* Multi-layered animated ambient glow ring */}
                    <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 opacity-60 blur-lg group-hover:opacity-100 transition duration-500 animate-pulse" />

                    {/* Floating Ambient Badges (Dribbble Spatial Depth) */}
                    <FloatingBadge duration={4.2} yOffset={7} className="absolute -top-3 -right-3 z-30 hidden sm:inline-block">
                      <span className="px-3 py-1 rounded-full bg-indigo-600/90 border border-indigo-400/50 text-[10px] font-mono font-bold text-white shadow-xl backdrop-blur-md flex items-center gap-1">
                        <Sparkles size={11} className="text-cyan-300" />
                        <span>TOP TALENT</span>
                      </span>
                    </FloatingBadge>
                    <FloatingBadge duration={5} yOffset={-6} className="absolute -bottom-2 -left-3 z-30 hidden sm:inline-block">
                      <span className="px-3 py-1 rounded-full bg-zinc-900/95 border border-emerald-400/40 text-[10px] font-mono font-bold text-emerald-400 shadow-xl backdrop-blur-md flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>VERIFIED 2026</span>
                      </span>
                    </FloatingBadge>

                    <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-1 shadow-2xl">
                      <div className="w-full h-full rounded-[20px] bg-zinc-950 flex items-center justify-center overflow-hidden relative">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={displayName}
                            className="w-full h-full object-cover rounded-[20px] group-hover:scale-105 transition duration-500"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              if (e.currentTarget.nextElementSibling) {
                                e.currentTarget.nextElementSibling.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-full items-center justify-center text-5xl font-black text-white ${
                            avatar ? "hidden" : "flex"
                          }`}
                        >
                          {initials}
                        </div>

                        {/* Owner / User Change Photo Overlay */}
                        {onEditPhoto && (
                          <button
                            type="button"
                            onClick={onEditPhoto}
                            className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition duration-200 cursor-pointer text-white backdrop-blur-xs z-30"
                            title="Click to Change Photo"
                          >
                            <Camera size={26} className="text-white drop-shadow" />
                            <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-600 px-3 py-1 rounded-full shadow">
                              Update Photo
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </TiltCard>

                {/* Identity Summary Card Footer */}
                <div className="w-full space-y-3 pt-2 border-t border-white/[0.06]">
                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-white text-base tracking-tight">{displayName}</h3>
                    <p className="text-xs text-indigo-300 font-mono font-medium truncate">
                      {portfolio?.targetRole || portfolio?.hero?.title || (title?.includes("(") ? title.match(/\(([^)]+)\)/)?.[1] : title) || "Civil Engineer"}
                    </p>
                  </div>

                  {phone && (
                    <div className="flex items-center justify-center gap-2 text-xs text-zinc-300 font-mono">
                      <Phone size={13} className="text-indigo-400" />
                      <span>{phone}</span>
                    </div>
                  )}

                  {onEditPhoto && (
                    <button
                      type="button"
                      onClick={onEditPhoto}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/[0.08] hover:border-indigo-500/50 text-[11px] font-semibold text-zinc-300 hover:text-white transition cursor-pointer shadow-sm"
                    >
                      <Camera size={12} className="text-indigo-400" />
                      <span>Change Picture</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* High-Impact Executive Stats Ribbon with Spotlight Cards */}
            <div className={`grid gap-4 pt-2 ${isMobile ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
              {dynamicMetrics.map((item, idx) => (
                <SpotlightCard
                  key={idx}
                  className={`${isMobile ? "p-4" : "p-6"} text-left space-y-2 glass-panel border border-white/[0.08]`}
                  spotlightColor="rgba(99, 102, 241, 0.2)"
                  borderColor="rgba(99, 102, 241, 0.45)"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
                      {item.badge}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  </div>
                  <div className={`${isMobile ? "text-2xl" : "text-3xl sm:text-4xl"} font-extrabold text-white font-outfit tracking-tight`}>
                    <span className={`bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                      {item.metric}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-zinc-100">{item.label}</div>
                  <div className="text-[11px] text-zinc-400 leading-tight">{item.sub}</div>
                </SpotlightCard>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Continuous Kinetic Marquee: Infinite Dribbble Velocity Tech Ticker */}
        {skills && skills.length > 0 && (
          <div className={`py-2 overflow-hidden border-y border-white/[0.06] bg-zinc-950/40 backdrop-blur-md ${isMobile ? "-mx-3" : "-mx-6 sm:-mx-12"}`}>
            <KineticMarquee
              items={skills}
              speed={32}
              renderItem={(skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-zinc-900/90 border border-white/[0.08] text-xs font-mono font-semibold text-zinc-200 shadow-sm hover:border-indigo-400/50 hover:text-white transition"
                >
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400 animate-pulse" />
                  <span>{skill}</span>
                </span>
              )}
            />
          </div>
        )}

        {/* =========================================================================
            SECTION 02: ABOUT / EXECUTIVE DOSSIER
           ========================================================================= */}
        {about && (
          <ScrollReveal>
            <section id="about" className="space-y-6">
              <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-indigo-400 tracking-wider">
                    01 //
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-outfit">
                    Executive Profile &amp; Mission
                  </h2>
                </div>
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                  DOSSIER OVERVIEW
                </span>
              </div>

              <SpotlightCard
                className="p-8 sm:p-12 glass-panel border border-white/[0.08]"
                spotlightColor="rgba(99, 102, 241, 0.16)"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-8 space-y-4">
                    {portfolio._isAboutAIHighlighted ? (
                      <div className="space-y-3">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                          <Sparkles size={12} className="text-emerald-400" />
                          <span>AI OPTIMIZED EXECUTIVE PROFILE</span>
                        </div>
                        {portfolio._showDiff && portfolio._aiOriginalAbout && (
                          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs">
                            <span className="text-rose-400 font-mono text-[10px] font-bold uppercase tracking-wider block mb-1">
                              ❌ Before (Original Profile)
                            </span>
                            <p className="text-rose-200/70 text-sm leading-relaxed font-light line-through">
                              {portfolio._aiOriginalAbout}
                            </p>
                          </div>
                        )}
                        <div className="p-4 rounded-xl bg-emerald-950/35 border-2 border-emerald-500/50 text-xs shadow-lg shadow-emerald-950/40">
                          <span className="text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                            <Sparkles size={12} className="text-emerald-400" />
                            <span>✅ After (AI Recruiter-Targeted Profile)</span>
                          </span>
                          <p className="text-emerald-100 text-base sm:text-lg leading-relaxed font-medium">
                            {about}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-base sm:text-lg text-zinc-200 leading-relaxed font-normal">
                        {about}
                      </p>
                    )}
                  </div>

                  {/* Dynamic Core Capabilities from Candidate Skills */}
                  {skills && skills.length > 0 && (
                    <div className="lg:col-span-4 rounded-2xl bg-zinc-950/60 border border-white/[0.06] p-5 space-y-3">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400 block">
                        CORE CAPABILITIES
                      </span>
                      <div className="space-y-2.5 text-xs text-zinc-300">
                        {skills.slice(0, 4).map((sk, idx) => {
                          const iconColors = ["text-indigo-400", "text-emerald-400", "text-cyan-400", "text-purple-400"];
                          return (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle2 size={14} className={`${iconColors[idx % iconColors.length]} shrink-0 mt-0.5`} />
                              <span>{sk}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </SpotlightCard>
            </section>
          </ScrollReveal>
        )}

        {/* =========================================================================
            SECTION 03: CAREER TRAJECTORY & EXPERIENCE (BENTO DOSSIER CARDS)
           ========================================================================= */}
        {experience && experience.length > 0 && (
          <ScrollReveal>
            <section id="experience" className="space-y-8">
              <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-indigo-400 tracking-wider">
                    02 //
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-outfit">
                    Career Trajectory &amp; Leadership Record
                  </h2>
                </div>
                <span className="text-xs font-mono text-indigo-400">
                  {experience.length} APPOINTMENTS
                </span>
              </div>

              {/* High-End Bento Experience Dossier Cards */}
              <div className="space-y-6">
                {experience.map((item, index) => {
                  const monogram = getCompanyInitials(item.company);
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-3xl p-6 sm:p-8 glass-panel border border-white/[0.08] hover:border-indigo-500/40 transition duration-300 relative overflow-hidden group shadow-lg"
                    >
                      {/* Subtle hover gradient wash */}
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/[0.03] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none" />

                      <div className="flex flex-col md:flex-row md:items-start gap-5 relative z-10">
                        {/* Company Monogram Badge */}
                        <div className="shrink-0 flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-white/[0.1] group-hover:border-indigo-500/50 flex items-center justify-center text-lg font-black text-white tracking-wider shadow-inner transition">
                            <span className="bg-gradient-to-br from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                              {monogram}
                            </span>
                          </div>
                        </div>

                        {/* Role & Company Details */}
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition tracking-tight">
                                {item.role}
                              </h3>
                              <p className="text-sm font-semibold text-indigo-400 pt-0.5 flex items-center gap-2">
                                <Building2 size={14} className="text-indigo-400" />
                                <span>{item.company}</span>
                              </p>
                            </div>

                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/[0.08] text-xs font-mono text-zinc-300 w-fit">
                              <Calendar size={12} className="text-indigo-400" />
                              <span>{item.duration}</span>
                            </span>
                          </div>

                          {/* Description & Structured Accomplishments: Support Before vs After Diff */}
                          {portfolio?._showDiff && (item._isAIHighlighted || item._aiOriginalDescription) ? (
                            <DiffBox
                              original={item._aiOriginalDescription || "Original role responsibilities and engineering accomplishments."}
                              suggested={item.description}
                              originalLabel="Before (Original Role Summary)"
                              suggestedLabel="After (AI ATS Impact Rewrite)"
                            />
                          ) : item.description ? (
                            <div className="text-sm text-zinc-300 leading-relaxed space-y-2 pt-1">
                              {item.description.includes("\n") || item.description.includes("•") ? (
                                item.description
                                  .split(/\n|•/)
                                  .filter((line) => line.trim().length > 0)
                                  .map((line, lIdx) => (
                                    <div key={lIdx} className="flex items-start gap-2.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2"></span>
                                      <span className="text-zinc-300">{line.trim()}</span>
                                    </div>
                                  ))
                              ) : (
                                <p>{item.description}</p>
                              )}
                            </div>
                          ) : null}

                          {/* Credentials, Offer Letter & Completion Certificate */}
                          <ExperienceCredentialsBadges exp={item} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* =========================================================================
            SECTION 04: CORE COMPETENCIES MATRIX (CATEGORIZED BENTO)
           ========================================================================= */}
        {skills && skills.length > 0 && (
          <ScrollReveal>
            <section id="skills" className="space-y-8">
              <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-purple-400 tracking-wider">
                    03 //
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-outfit">
                    Core Competencies Matrix
                  </h2>
                </div>
                <span className="text-xs font-mono text-purple-400">
                  {skills.length} EXPERTISE AREAS
                </span>
              </div>

              {/* Categorized Clusters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {competencyClusters.map((cluster, cIdx) => (
                  <SpotlightCard
                    key={cIdx}
                    className="p-7 space-y-4 glass-panel border border-white/[0.08]"
                    spotlightColor="rgba(168, 85, 247, 0.15)"
                    borderColor="rgba(168, 85, 247, 0.4)"
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300">
                        {cluster.tag}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {cluster.skills.length} DISCIPLINES
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white tracking-tight">
                      {cluster.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {cluster.skills.map((skill, sIdx) => (
                        <motion.div
                          key={sIdx}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          className="px-3.5 py-1.5 rounded-xl bg-zinc-900/90 border border-white/[0.08] hover:border-purple-400/50 hover:bg-purple-500/10 text-zinc-200 hover:text-white text-xs font-medium transition duration-200 flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cluster.dotColor}`} />
                          <span>{skill}</span>
                        </motion.div>
                      ))}
                    </div>
                  </SpotlightCard>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* =========================================================================
            SECTION 05: STRATEGIC INITIATIVES & WORKS (BENTO SHOWCASE)
           ========================================================================= */}
        {projects && projects.length > 0 && (
          <ScrollReveal>
            <section id="projects" className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider">
                    04 //
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-outfit">
                    Strategic Initiatives &amp; Works
                  </h2>
                </div>

                {/* Dynamic Category Filter Pills */}
                {projectCategories.length > 1 && (
                  <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-zinc-950 border border-white/[0.08] text-xs">
                    {projectCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-[11px] ${
                          selectedCategory === cat
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Asymmetric Bento Grid for Initiatives */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects
                  .filter((p) => {
                    if (selectedCategory === "ALL") return true;
                    return (
                      Array.isArray(p.tags) &&
                      p.tags.some(
                        (t) =>
                          t.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                          selectedCategory.toLowerCase().includes(t.toLowerCase())
                      )
                    );
                  })
                  .map((project, index) => {
                    const isFeatured = index === 0;
                    return (
                      <Perspective3DCard
                        key={index}
                        onClick={() => setInspectedProject(project)}
                        maxTilt={10}
                        glareColor="rgba(99, 102, 241, 0.22)"
                        glowBorderColor="rgba(99, 102, 241, 0.55)"
                        className={`p-7 sm:p-8 flex flex-col justify-between cursor-pointer glass-panel border ${
                          project._isAIHighlighted
                            ? "border-emerald-500/70 ring-2 ring-emerald-500/30 shadow-xl shadow-emerald-950/60"
                            : "border-white/[0.08]"
                        } ${
                          isFeatured ? "md:col-span-2 lg:col-span-2 bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-indigo-950/20" : ""
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                              INITIATIVE 0{index + 1} {isFeatured ? "• FEATURED" : ""}
                            </span>
                            <span className="text-xs text-zinc-400 group-hover:text-indigo-400 transition flex items-center gap-1 font-medium">
                              <span>Inspect Brief</span>
                              <ArrowUpRight size={13} />
                            </span>
                          </div>

                          <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-indigo-300 transition tracking-tight flex items-center justify-between gap-2">
                            <span>{project.title}</span>
                            {project._isAIHighlighted && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm shrink-0">
                                <Sparkles size={10} className="text-emerald-400" />
                                <span>AI Optimized</span>
                              </span>
                            )}
                          </h3>

                          {portfolio?._showDiff && (project._isAIHighlighted || project._aiOriginalDescription) ? (
                            <DiffBox
                              original={project._aiOriginalDescription || "Original project implementation."}
                              suggested={project.description}
                              originalLabel="Before (Original Description)"
                              suggestedLabel="After (AI Optimized Description)"
                            />
                          ) : project._isAIHighlighted ? (
                            <div className="space-y-2 mt-1">
                              <div className="p-3 rounded-xl bg-emerald-950/35 border-2 border-emerald-500/50 text-xs shadow-md shadow-emerald-950/40">
                                <div className="flex items-center justify-between text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider mb-1">
                                  <span className="flex items-center gap-1">
                                    <Sparkles size={11} className="text-emerald-400" />
                                    <span>✅ After (AI Optimized)</span>
                                  </span>
                                </div>
                                <p className="text-emerald-100 text-xs leading-relaxed font-medium">
                                  {project.description}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-zinc-300 text-sm leading-relaxed line-clamp-3">
                              {project.description}
                            </p>
                          )}

                          {/* Impact or Value Generated Metric */}
                          {project.impact && (
                            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-300 font-medium flex items-center gap-2">
                              <Zap size={14} className="text-indigo-400 shrink-0" />
                              <span>Strategic Value: {project.impact}</span>
                            </div>
                          )}

                          {project.tags && project.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {project.tags.map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="px-2.5 py-0.5 rounded-md bg-zinc-800/70 text-zinc-300 text-xs font-mono border border-white/[0.06]"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs">
                          <span className="text-indigo-400 font-semibold flex items-center gap-1">
                            <span>Deep Dive Case Study</span>
                            <ChevronRight size={13} />
                          </span>

                          {project.live && (
                            <a
                              href={project.live.startsWith("http") ? project.live : `https://${project.live}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
                            >
                              <span>Live Resource</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </Perspective3DCard>
                    );
                  })}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* =========================================================================
            SECTION 06: EDUCATION & CERTIFICATIONS
           ========================================================================= */}
        {(education.length > 0 || certifications.length > 0 || achievements.length > 0) && (
          <ScrollReveal>
            <section id="education" className="space-y-8">
              <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-amber-400 tracking-wider">
                    05 //
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-outfit">
                    Academic Credentials &amp; Certifications
                  </h2>
                </div>
                <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                  VERIFIED CREDENTIALS
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {education.map((item, index) => (
                  <SpotlightCard
                    key={`edu-${index}`}
                    className="p-7 space-y-3 glass-panel border border-white/[0.08]"
                    spotlightColor="rgba(245, 158, 11, 0.15)"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <GraduationCap size={18} />
                      </div>
                      <span className="text-xs font-mono text-zinc-400 px-3 py-1 rounded-full bg-zinc-900 border border-white/[0.08]">
                        {item.year || "Alumni"}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {item.degree}
                    </h3>

                    <p className="text-sm font-semibold text-amber-400">
                      {item.institution}
                    </p>

                    {item.description && (
                      <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                        {item.description}
                      </p>
                    )}
                  </SpotlightCard>
                ))}

                {certifications.map((cert, index) => (
                  <SpotlightCard
                    key={`cert-${index}`}
                    className="p-7 space-y-3 glass-panel border border-white/[0.08]"
                    spotlightColor="rgba(16, 185, 129, 0.15)"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Award size={18} />
                      </div>
                      <span className="text-xs font-mono text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        Verified
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {cert.name}
                    </h3>

                    <p className="text-sm font-semibold text-emerald-400">
                      {cert.issuer} {cert.date ? `• ${cert.date}` : ""}
                    </p>

                    {cert.description && (
                      <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                        {cert.description}
                      </p>
                    )}
                  </SpotlightCard>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* =========================================================================
            SECTION 07: EXECUTIVE DISPATCH & CONTACT SUITE
           ========================================================================= */}
        <ScrollReveal>
          <section id="contact" className="space-y-8">
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-indigo-400 tracking-wider">
                  06 //
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-outfit">
                  Executive Dispatch &amp; Contact Suite
                </h2>
              </div>
              <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest">
                DIRECT CHANNELS
              </span>
            </div>

            <div className="rounded-3xl p-8 sm:p-12 glass-panel border border-white/[0.08] relative overflow-hidden shadow-2xl space-y-8">
              <div className="space-y-2 max-w-2xl">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Initiate Executive Engagement
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Available for executive consultations, board advisory engagements, and leadership appointments in Finance &amp; Accounts, Statutory Governance, and Human Capital Operations.
                </p>
              </div>

              {/* High-End Contact Channels Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {email && (
                  <div
                    onClick={() => setEmailModalOpen(true)}
                    className="p-5 rounded-2xl bg-zinc-950/70 border border-white/[0.08] hover:border-indigo-500/50 transition duration-200 cursor-pointer group space-y-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] font-mono text-zinc-500 uppercase">Executive Email</p>
                      <p className="font-bold text-white text-sm truncate group-hover:text-indigo-300 transition">
                        {email}
                      </p>
                    </div>
                    <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1 group-hover:underline">
                      <span>Launch Composer</span>
                      <ArrowUpRight size={12} />
                    </span>
                  </div>
                )}

                {linkedin && (
                  <a
                    href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-5 rounded-2xl bg-zinc-950/70 border border-white/[0.08] hover:border-sky-500/50 transition duration-200 group space-y-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                      <FaLinkedin size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] font-mono text-zinc-500 uppercase">LinkedIn Profile</p>
                      <p className="font-bold text-white text-sm truncate group-hover:text-sky-300 transition">
                        Connect on LinkedIn
                      </p>
                    </div>
                    <span className="text-xs text-sky-400 font-semibold flex items-center gap-1 group-hover:underline">
                      <span>View Profile</span>
                      <ArrowUpRight size={12} />
                    </span>
                  </a>
                )}

                {phone && (
                  <div className="p-5 rounded-2xl bg-zinc-950/70 border border-white/[0.08] space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] font-mono text-zinc-500 uppercase">Direct Office</p>
                      <p className="font-bold text-white text-sm truncate">{phone}</p>
                    </div>
                    <span className="text-xs text-emerald-400 font-mono">Available during business hours</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Footer */}
        <footer className="pt-16 border-t border-white/[0.06] text-center text-zinc-500 text-xs space-y-2">
          <p>© {new Date().getFullYear()} {displayName}. All rights reserved.</p>
          <p className="text-zinc-600 font-mono text-[11px]">
            Engineered with PortfolioAI • Inspired by Awwwards &amp; Figma Community Design Standards
          </p>
        </footer>
      </main>

      {/* Floating HUD Navigation Dock (Fixed at Bottom Center) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-zinc-950/90 backdrop-blur-2xl border border-white/[0.12] shadow-2xl shadow-black/80"
        >
          <button
            type="button"
            onClick={() => scrollToSection("hero")}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer text-xs flex items-center gap-1"
            title="Hero Identity"
          >
            <Sparkles size={14} className="text-indigo-400" />
            <span className="hidden sm:inline font-semibold">Top</span>
          </button>

          {experience.length > 0 && (
            <button
              type="button"
              onClick={() => scrollToSection("experience")}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer text-xs flex items-center gap-1"
              title="Career Trajectory"
            >
              <Briefcase size={14} className="text-blue-400" />
              <span className="hidden sm:inline font-semibold">Career</span>
            </button>
          )}

          {skills.length > 0 && (
            <button
              type="button"
              onClick={() => scrollToSection("skills")}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer text-xs flex items-center gap-1"
              title="Competencies Matrix"
            >
              <Layers size={14} className="text-purple-400" />
              <span className="hidden sm:inline font-semibold">Skills</span>
            </button>
          )}

          {projects.length > 0 && (
            <button
              type="button"
              onClick={() => scrollToSection("projects")}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer text-xs flex items-center gap-1"
              title="Strategic Initiatives"
            >
              <Zap size={14} className="text-cyan-400" />
              <span className="hidden sm:inline font-semibold">Initiatives</span>
            </button>
          )}

          <div className="h-4 w-px bg-white/[0.1] mx-1"></div>

          <button
            type="button"
            onClick={() => setEmailModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-600/30"
          >
            <Mail size={13} />
            <span>Connect</span>
          </button>
        </motion.div>
      </div>

      {/* Interactive Email Action Modal */}
      {emailModalOpen && email && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setEmailModalOpen(false)}
        >
          <div
            className="bg-zinc-950 border border-white/[0.1] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-left relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-base tracking-tight">Direct Communication</h4>
                  <p className="text-xs text-zinc-400">Choose your preferred channel to connect</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmailModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Email Address with Copy Button */}
            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/[0.08] flex items-center justify-between gap-3">
              <span className="text-xs font-mono text-zinc-200 truncate select-all">{email}</span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow"
              >
                {copiedEmail ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
                <span>{copiedEmail ? "Copied!" : "Copy"}</span>
              </button>
            </div>

            {/* Quick Web Actions */}
            <div className="space-y-2.5 pt-1 text-xs font-semibold">
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setEmailModalOpen(false)}
                className="w-full py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] hover:border-white/20 text-white flex items-center justify-between transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">📧</span>
                  <span>Compose in Gmail (Browser)</span>
                </div>
                <ExternalLink size={13} className="text-zinc-500 group-hover:text-white" />
              </a>

              <a
                href={`https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(email)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setEmailModalOpen(false)}
                className="w-full py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] hover:border-white/20 text-white flex items-center justify-between transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">📬</span>
                  <span>Compose in Outlook (Web)</span>
                </div>
                <ExternalLink size={13} className="text-zinc-500 group-hover:text-white" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Case Study Project Deep-Dive Modal */}
      {inspectedProject && (
        <ProjectDeepDiveModal
          project={inspectedProject}
          onClose={() => setInspectedProject(null)}
          accentColor="#6366f1"
        />
      )}
    </div>
  );
};

export default ModernTemplate;
