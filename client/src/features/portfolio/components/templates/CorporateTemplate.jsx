import { useState, useMemo } from "react";
import {
  Shield,
  Building2,
  Briefcase,
  ExternalLink,
  Mail,
  Award,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  FileCheck,
  Phone,
  Globe,
  ArrowUpRight,
  Camera,
  Check,
  Copy,
  Layers,
  Zap,
  Clock,
  Calendar,
  ChevronRight,
  MapPin,
  Sparkles,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  SpotlightCard,
  TiltCard,
  ScrollReveal,
  ProjectDeepDiveModal,
  ShimmerText,
  MagneticButton,
  MagneticPill,
  PulseAura,
  ExperienceCredentialsBadges,
} from "./motionComponents";

const CorporateTemplate = ({ portfolio, onEditPhoto, isOwner }) => {
  const {
    name = "Executive",
    tagline = "Chief Manager F&A and Human Resources",
    about = "",
    skills = [],
    projects = [],
    experience = [],
    education = [],
    achievements = [],
    certifications = [],
    blog = [],
    contact = {},
    github = contact?.github,
    linkedin = contact?.linkedin,
    website = contact?.website,
    email = contact?.email || portfolio?.email,
    phone = contact?.phone || portfolio?.phone,
    title,
    location: rawLocation,
  } = portfolio || {};

  const avatar = portfolio?.avatar || portfolio?.hero?.avatar || "";
  const displayName = name || title || "Executive";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [briefingMode, setBriefingMode] = useState("SUMMARY"); // "SUMMARY" | "FULL"
  const [copied, setCopied] = useState(false);
  const [inspectedProject, setInspectedProject] = useState(null);

  const copyEmail = () => {
    if (!email) return;
    navigator.clipboard?.writeText(email);
    setCopied(true);
    toast.success("Executive correspondence address copied! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  // Domain detection for executive vs software engineering
  const isExecutive = useMemo(() => {
    const text = `${displayName} ${tagline} ${about} ${experience.map((e) => `${e.role} ${e.company}`).join(" ")}`.toLowerCase();
    return (
      text.includes("manager") ||
      text.includes("director") ||
      text.includes("chief") ||
      text.includes("finance") ||
      text.includes("accounts") ||
      text.includes("hr") ||
      text.includes("payroll") ||
      text.includes("audit") ||
      text.includes("compliance")
    );
  }, [displayName, tagline, about, experience]);

  // Executive Impact KPIs
  const corporateMetrics = useMemo(() => {
    if (isExecutive) {
      return [
        { metric: "25+", label: "Years Leadership", sub: "Strategic F&A, HR & Operations", badge: "Executive Tier" },
        { metric: `${experience.length || 5}`, label: "Organizations Led", sub: "Engineering, Oil & Gas & Corporate", badge: "Enterprise Tenures" },
        { metric: `${skills.length || 13}+`, label: "Core Competencies", sub: "Statutory, Taxation, Audits & HR", badge: "Governance Range" },
        { metric: "100%", label: "Statutory Governance", sub: "Zero-Penalty EPF, ESI, GST & Audits", badge: "Regulatory Rating" },
      ];
    }
    return [
      { metric: `${Math.max(8, experience.length * 2)}+`, label: "Years Enterprise Exp", sub: "Distributed Systems & Cloud", badge: "Production Tier" },
      { metric: `${projects.length || 6}+`, label: "Platforms Delivered", sub: "Mission-Critical Tier", badge: "Delivered Systems" },
      { metric: `${skills.length || 15}+`, label: "Tech Stack Standards", sub: "Enterprise Cloud Architecture", badge: "Standards Range" },
      { metric: "99.99%", label: "System Availability", sub: "Enterprise Reliability SLAs", badge: "Architecture SLA" },
    ];
  }, [isExecutive, experience.length, skills.length, projects.length]);

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
    <div className="min-h-screen bg-[#060A14] text-[#e2e8f0] font-sans selection:bg-blue-600/30 selection:text-white relative pb-32 overflow-x-hidden">
      {/* Executive Slate Ambient Top Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.12, 0.22, 0.12],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-blue-600/15 rounded-full blur-[170px] pointer-events-none"
      />

      {/* Top Corporate Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#060A14]/90 backdrop-blur-2xl border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-blue-400" />
            <span className="font-extrabold text-white uppercase tracking-wider font-mono text-sm">
              {displayName.toUpperCase()} // ENTERPRISE VERIFIED
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setBriefingMode("SUMMARY")}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  briefingMode === "SUMMARY"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Executive Summary
              </button>
              <button
                type="button"
                onClick={() => setBriefingMode("FULL")}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  briefingMode === "FULL"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Detailed Record
              </button>
            </div>

            {email && (
              <button
                type="button"
                onClick={copyEmail}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold cursor-pointer transition text-xs"
              >
                {copied ? <Check size={12} className="text-emerald-300" /> : <Mail size={12} />}
                <span>{copied ? "Copied" : "Contact Office"}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-14 space-y-20">
        {/* Executive Header Bento Card */}
        <ScrollReveal direction="up" immediate={true}>
          <section id="hero" data-section="about" className="bg-gradient-to-br from-[#0c1427] via-[#0c1324] to-[#070b16] rounded-3xl border border-slate-700/60 p-8 sm:p-14 space-y-8 shadow-2xl relative overflow-hidden scroll-mt-24">
            {/* Top Telemetry Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wider text-blue-400 font-mono pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Shield size={14} />
                <span>
                  {isExecutive
                    ? "Executive Governance & Corporate Leadership Dossier"
                    : "Enterprise Systems & Platform Architecture Dossier"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Executive Standing</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12">
              {/* Avatar with TiltCard & PulseAura */}
              <div className="shrink-0 flex flex-col items-center gap-3">
                <TiltCard maxTilt={12}>
                  <PulseAura glowGradient="from-blue-600 via-indigo-600 to-sky-400">
                    <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl p-1 bg-gradient-to-tr from-blue-600 via-slate-700 to-sky-400 shadow-2xl shadow-blue-500/20 group">
                      <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-950 flex items-center justify-center relative">
                        {avatar ? (
                          <motion.img
                            src={avatar}
                            alt={displayName}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              if (e.currentTarget.nextElementSibling) {
                                e.currentTarget.nextElementSibling.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-full items-center justify-center text-4xl sm:text-5xl font-black text-white ${
                            avatar ? "hidden" : "flex"
                          }`}
                        >
                          {initials}
                        </div>

                        {onEditPhoto && (
                          <button
                            type="button"
                            onClick={onEditPhoto}
                            className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer text-white backdrop-blur-xs z-30"
                            title="Click to Change Photo"
                          >
                            <Camera size={26} className="text-blue-400 drop-shadow" />
                            <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-600 px-3 py-0.5 rounded-full shadow">
                              Change Photo
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </PulseAura>
                </TiltCard>

                {onEditPhoto && (
                  <button
                    type="button"
                    onClick={onEditPhoto}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white transition cursor-pointer shadow-sm"
                  >
                    <Camera size={12} className="text-blue-400" />
                    <span>Change Picture</span>
                  </button>
                )}
              </div>

              {/* Identity & Headline */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-serif leading-tight">
                  <ShimmerText gradient="from-white via-blue-200 via-sky-200 to-blue-400">
                    {displayName}
                  </ShimmerText>
                </h1>

                {portfolio?._isTaglineAIHighlighted && portfolio?._showDiff && portfolio?._aiOriginalTagline ? (
                  <div className="space-y-2 my-2">
                    <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs">
                      <span className="text-rose-400 font-mono text-[9px] font-bold uppercase block mb-0.5">
                        ❌ Before (Original Executive Title)
                      </span>
                      <p className="text-rose-200/70 text-xs leading-relaxed line-through">
                        {portfolio._aiOriginalTagline}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-950/50 border border-blue-500/50 text-xs shadow-md">
                      <span className="text-blue-400 font-mono text-[9px] font-bold uppercase flex items-center gap-1 mb-0.5">
                        <Sparkles size={9} />
                        <span>✅ After (AI Optimized Executive Positioning)</span>
                      </span>
                      <p className="text-blue-200 text-base leading-relaxed font-semibold">
                        {tagline}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xl sm:text-2xl text-blue-300 font-medium">
                    {tagline}
                  </p>
                )}

                {about && (
                  <div className="relative pl-4 border-l-2 border-blue-500/40 py-0.5">
                    {portfolio?._isAboutAIHighlighted && portfolio?._showDiff && portfolio?._aiOriginalAbout ? (
                      <div className="space-y-2">
                        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs">
                          <span className="text-rose-400 font-mono text-[9px] font-bold uppercase block mb-0.5">
                            ❌ Before (Original Executive Bio)
                          </span>
                          <p className="text-rose-200/70 text-xs leading-relaxed line-through">
                            {portfolio._aiOriginalAbout}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-950/50 border border-blue-500/50 text-xs shadow-md">
                          <span className="text-blue-400 font-mono text-[9px] font-bold uppercase flex items-center gap-1 mb-0.5">
                            <Sparkles size={9} />
                            <span>✅ After (AI Optimized Executive Bio)</span>
                          </span>
                          <p className="text-slate-100 text-sm leading-relaxed font-light">
                            {about}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
                        {about}
                      </p>
                    )}
                  </div>
                )}

                {/* Executive Action CTAs */}
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 pt-3">
                  {email && (
                    <MagneticButton>
                      <button
                        type="button"
                        onClick={copyEmail}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide transition shadow-lg shadow-blue-600/25 flex items-center gap-2 cursor-pointer"
                      >
                        {copied ? <Check size={14} className="text-emerald-300" /> : <Mail size={14} />}
                        <span>{copied ? "Address Copied!" : "Contact Office"}</span>
                      </button>
                    </MagneticButton>
                  )}

                  {linkedin && (
                    <MagneticButton
                      href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold hover:text-white transition flex items-center gap-2 shadow"
                    >
                      <FaLinkedin size={14} className="text-blue-400" />
                      <span>Executive Profile</span>
                    </MagneticButton>
                  )}

                  {phone && (
                    <div className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono flex items-center gap-2">
                      <Phone size={13} className="text-blue-400" />
                      <span>{phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Executive Impact KPI Ledger */}
        <ScrollReveal delay={0.1}>
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {corporateMetrics.map((item, idx) => (
              <SpotlightCard
                key={idx}
                spotlightColor="rgba(59, 130, 246, 0.2)"
                borderColor="rgba(59, 130, 246, 0.45)"
                className="p-6 text-left space-y-2 bg-[#0c1427] border-slate-800"
              >
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  <span>{item.badge}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-blue-400 font-mono tracking-tight">
                  {item.metric}
                </div>
                <div className="text-xs font-bold text-white">{item.label}</div>
                <div className="text-[11px] text-slate-400 leading-tight">{item.sub}</div>
              </SpotlightCard>
            ))}
          </section>
        </ScrollReveal>

        {/* Strategic Initiatives & Solutions Showcase */}
        {projects?.length > 0 && (
          <ScrollReveal delay={0.15}>
            <section id="projects" data-section="projects" className="space-y-6 scroll-mt-24">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Briefcase size={18} className="text-blue-400" />
                    <span>
                      {isExecutive
                        ? "Enterprise Governance & Operational Initiatives"
                        : "Enterprise Platforms & Platform Architecture"}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Click any strategic initiative for executive briefing
                  </p>
                </div>
                <span className="text-xs text-blue-400 font-mono">
                  {projects.length} INITIATIVES
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((proj, idx) => (
                  <SpotlightCard
                    key={idx}
                    onClick={() => setInspectedProject(proj)}
                    spotlightColor="rgba(59, 130, 246, 0.22)"
                    borderColor="rgba(59, 130, 246, 0.5)"
                    className={`p-7 space-y-4 shadow-xl flex flex-col justify-between cursor-pointer group bg-[#0c1427] transition-all ${
                      proj._isAIHighlighted
                        ? "border-2 border-blue-500/70 shadow-blue-950/60 ring-2 ring-blue-500/30"
                        : "border-slate-800"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-mono text-blue-400 font-bold uppercase tracking-wider">
                          INITIATIVE 0{idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          {proj._isAIHighlighted && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                              <Sparkles size={10} className="text-blue-400" />
                              <span>AI Optimized</span>
                            </span>
                          )}
                          <span className="text-xs text-blue-400 font-semibold flex items-center gap-1 group-hover:underline">
                            <span>Executive Review</span>
                            <ArrowUpRight size={12} />
                          </span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">
                        {proj.title}
                      </h3>

                      {proj._isAIHighlighted ? (
                        <div className="space-y-2 mt-1">
                          {proj._showDiff && proj._aiOriginalDescription && (
                            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 text-xs font-mono">
                              <div className="text-rose-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                                ❌ Before (Original Initiative Brief)
                              </div>
                              <p className="text-rose-200/80 text-xs leading-relaxed font-sans line-through">
                                {proj._aiOriginalDescription}
                              </p>
                            </div>
                          )}
                          <div className="p-3 rounded-xl bg-blue-950/50 border-2 border-blue-500/60 text-xs font-mono shadow-lg shadow-blue-950/50">
                            <div className="text-blue-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 mb-1">
                              <Sparkles size={11} className="text-blue-400" />
                              <span>✅ After (AI Optimized Initiative Brief)</span>
                            </div>
                            <p className="text-slate-100 text-xs sm:text-sm leading-relaxed font-sans">
                              {proj.description}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed line-clamp-3">
                          {proj.description}
                        </p>
                      )}

                      {proj.impact && (
                        <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-300 font-medium flex items-center gap-2">
                          <Zap size={13} className="text-blue-400" />
                          <span>ROI / Value Delivered: {proj.impact}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-800">
                      {proj.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {proj.tags.map((t, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 font-mono"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-blue-400 font-semibold flex items-center gap-1">
                          <span>Inspect Full Dossier</span>
                          <ChevronRight size={12} />
                        </span>

                        {proj.live && (
                          <a
                            href={proj.live.startsWith("http") ? proj.live : `https://${proj.live}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 font-semibold"
                          >
                            <span>Live System</span>
                            <ArrowUpRight size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </SpotlightCard>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Enterprise Governance / Core Competencies */}
        {skills?.length > 0 && (
          <ScrollReveal delay={0.15}>
            <section id="skills" data-section="skills" className="space-y-4 scroll-mt-24">
              <h2 className="text-xs uppercase tracking-widest text-slate-400 font-mono font-bold border-b border-slate-800 pb-2">
                Executive Governance &amp; Core Competencies ({skills.length})
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {skills.map((skill, idx) => (
                  <MagneticPill
                    key={idx}
                    className="bg-[#0c1427] border border-slate-800 text-slate-200 hover:border-blue-500/50 hover:text-white shadow-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span>{skill}</span>
                  </MagneticPill>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Leadership Career Timeline */}
        {experience?.length > 0 && (
          <ScrollReveal delay={0.2}>
            <section id="experience" data-section="experience" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
                <Layers size={16} className="text-blue-400" />
                <span>Executive Appointments &amp; Leadership Record</span>
              </h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => {
                  const monogram = getCompanyInitials(exp.company);
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 350, damping: 20 }}
                      className="p-6 sm:p-7 rounded-2xl bg-[#0c1427] border border-slate-800 space-y-3 shadow-lg"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-blue-400 font-mono shrink-0">
                            {monogram}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white">
                              {exp.role}
                            </h3>
                            <p className="text-blue-400 font-semibold text-xs">
                              {exp.company}
                            </p>
                          </div>
                        </div>

                        <span className="text-slate-400 font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-800 w-fit">
                          {exp.duration}
                        </span>
                      </div>

                      {exp.description && (
                        <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed pt-1">
                          {exp.description}
                        </p>
                      )}

                      <ExperienceCredentialsBadges exp={exp} />
                    </motion.div>
                  );
                })}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Academic Credentials & Honors */}
        {(education?.length > 0 || certifications?.length > 0 || achievements?.length > 0) && (
          <ScrollReveal delay={0.25}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {education?.length > 0 && (
                <div className="p-7 rounded-3xl bg-[#0c1427] border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
                    <GraduationCap size={16} />
                    <span>Academic Credentials</span>
                  </div>
                  <div className="space-y-3">
                    {education.map((edu, idx) => (
                      <div key={idx} className="text-xs border-b border-slate-800/80 pb-3 space-y-1">
                        <span className="font-bold text-white text-sm">{edu.institution}</span>
                        <p className="text-slate-400">{edu.degree} ({edu.year})</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(certifications?.length > 0 || achievements?.length > 0) && (
                <div className="p-7 rounded-3xl bg-[#0c1427] border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
                    <Award size={16} />
                    <span>Executive Honors &amp; Certifications</span>
                  </div>
                  <div className="space-y-3">
                    {certifications?.map((cert, idx) => (
                      <div key={`cert-${idx}`} className="text-xs border-b border-slate-800/80 pb-3 space-y-1">
                        <span className="font-bold text-white text-sm">{cert.name}</span>
                        <p className="text-slate-400">{cert.issuer}</p>
                      </div>
                    ))}
                    {achievements?.map((ach, idx) => (
                      <div key={`ach-${idx}`} className="text-xs border-b border-slate-800/80 pb-3 space-y-1">
                        <span className="font-bold text-white text-sm">{ach.title}</span>
                        <p className="text-slate-400">{ach.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Executive Direct Office Communication Section */}
        <ScrollReveal delay={0.2}>
          <section
            id="contact"
            data-section="contact"
            className="p-8 sm:p-12 rounded-3xl bg-[#0c1427] border border-slate-700/60 shadow-2xl relative overflow-hidden space-y-6 scroll-mt-24"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                  EXECUTIVE DOSSIER // DIRECT OFFICE
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Initiate Executive Engagement
                </h3>
              </div>
              <span className="text-xs text-blue-400 font-mono flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE STANDING
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {email && (
                <button
                  type="button"
                  onClick={copyEmail}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-blue-600/30 cursor-pointer flex items-center gap-2"
                >
                  <Mail size={14} />
                  <span>{copied ? "Official Email Copied!" : `Contact Office (${email})`}</span>
                </button>
              )}
              {linkedin && (
                <a
                  href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white hover:border-blue-400 text-xs font-bold transition flex items-center gap-2"
                >
                  <FaLinkedin size={14} />
                  <span>Executive LinkedIn Dossier</span>
                </a>
              )}
              {github && (
                <a
                  href={github.startsWith("http") ? github : `https://${github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white hover:border-blue-400 text-xs font-bold transition flex items-center gap-2"
                >
                  <FaGithub size={14} />
                  <span>Code Repositories</span>
                </a>
              )}
            </div>
          </section>
        </ScrollReveal>
      </main>

      <ProjectDeepDiveModal
        project={inspectedProject}
        onClose={() => setInspectedProject(null)}
        accentColor="#2563eb"
      />
    </div>
  );
};

export default CorporateTemplate;
