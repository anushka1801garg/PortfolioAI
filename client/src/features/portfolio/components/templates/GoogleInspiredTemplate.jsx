import { useState, useMemo } from "react";
import {
  ExternalLink,
  Award,
  ShieldCheck,
  Mail,
  GraduationCap,
  ArrowUpRight,
  Globe,
  Search,
  Sparkles,
  Shuffle,
  Check,
  X,
  Camera,
  Layers,
  Zap,
} from 'lucide-react';
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { motion } from 'framer-motion';
import toast from "react-hot-toast";
import {
  SpotlightCard,
  TiltCard,
  ScrollReveal,
  ShimmerText,
  MagneticButton,
  MagneticPill,
  PulseAura,
  ProjectDeepDiveModal,
  ExperienceCredentialsBadges,
  DiffBox,
  DiffThemeBanner,
} from "./motionComponents";

const GoogleInspiredTemplate = ({ portfolio, onEditPhoto, isOwner, previewDevice }) => {
  const [inspectedProject, setInspectedProject] = useState(null);
  const isMobile = previewDevice === "mobile" || portfolio?._previewDevice === "mobile";
  const {
    name = "Developer",
    tagline = "Software Engineer",
    about = "",
    skills = [],
    projects = [],
    experience = [],
    education = [],
    achievements = [],
    certifications = [],
    contact = {},
    github = contact?.github,
    linkedin = contact?.linkedin,
    website = contact?.website,
    email = contact?.email,
    title,
  } = portfolio || {};

  const avatar = portfolio?.avatar || portfolio?.hero?.avatar || "";
  const displayName = name || title || "Developer";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Google Search Bar State
  const [searchQuery, setSearchQuery] = useState("");
  const selectedChip = "ALL";
  const [luckyProject, setLuckyProject] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Filter projects by live Google Search input
  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        proj.title?.toLowerCase().includes(q) ||
        proj.description?.toLowerCase().includes(q) ||
        (Array.isArray(proj.tags) && proj.tags.some((t) => t.toLowerCase().includes(q)));

      const matchesChip =
        selectedChip === "ALL" ||
        (Array.isArray(proj.tags) && proj.tags.some((t) => t.toLowerCase() === selectedChip.toLowerCase()));

      return matchesSearch && matchesChip;
    });
  }, [projects, searchQuery, selectedChip]);

  // "I'm Feeling Lucky" randomizer
  const handleFeelingLucky = () => {
    if (projects.length === 0) return;
    const randomProj = projects[Math.floor(Math.random() * projects.length)];
    setLuckyProject(randomProj);
    setInspectedProject(randomProj);
    toast.success(`🎲 I'm Feeling Lucky: Opening "${randomProj.title}"!`);
  };

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied: ${text} 🔍`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-[#e3e3e3] font-sans selection:bg-[#4285f4]/30 selection:text-white relative pb-32 overflow-x-hidden">
      {/* Google 4-Color Animated Gradient Accent Bar */}
      <div className="sticky top-0 z-50 h-1.5 w-full bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc05] to-[#34a853]" />

      <main className={`max-w-5xl mx-auto space-y-12 sm:space-y-20 ${isMobile ? "px-3 py-6" : "px-4 sm:px-6 py-8 sm:py-12"}`}>
        {/* Google Style Hero with 3D Tilt Card & 4-Color Glowing Aura */}
        <ScrollReveal direction="up" immediate={true}>
          <section id="hero" data-section="hero" className={`bg-[#282a2c] rounded-3xl border border-zinc-700/50 shadow-2xl space-y-6 scroll-mt-24 ${isMobile ? "p-4" : "p-6 sm:p-14"}`}>
            {/* AI Theme Optimization Banner (in diff mode) */}
            {portfolio?._showDiff && (portfolio?._isTemplateAIHighlighted || portfolio?._aiOriginalTemplate) && (
              <DiffThemeBanner
                originalTemplate={portfolio._aiOriginalTemplate || "Modern"}
                suggestedTemplate="Google Inspired"
              />
            )}

            <div className={`flex items-center gap-2 ${isMobile ? "justify-center" : ""}`}>
              <span className="w-3 h-3 rounded-full bg-[#ea4335]" />
              <span className="w-3 h-3 rounded-full bg-[#4285f4]" />
              <span className="w-3 h-3 rounded-full bg-[#34a853]" />
              <span className="w-3 h-3 rounded-full bg-[#fbbc05]" />
              <span className="text-xs font-mono text-zinc-400 font-bold ml-2 uppercase truncate max-w-[240px]">
                Google Search Knowledge Graph // 2026
              </span>
            </div>

            <div className={`flex items-center gap-6 sm:gap-8 ${isMobile ? "flex-col text-center" : "flex-col md:flex-row md:items-start md:text-left"}`}>
              {/* Avatar with TiltCard & 4-Color PulseAura */}
              <div className="shrink-0 flex flex-col items-center gap-2">
                <TiltCard maxTilt={15}>
                  <PulseAura glowGradient="from-[#4285f4] via-[#ea4335] to-[#34a853]">
                    <div className={`relative rounded-full p-1 bg-gradient-to-tr from-[#4285f4] via-[#ea4335] to-[#34a853] shadow-2xl group ${isMobile ? "w-28 h-28" : "w-32 h-32 sm:w-40 sm:h-40"}`}>
                      <div className="w-full h-full rounded-full overflow-hidden bg-zinc-950 flex items-center justify-center relative">
                        {avatar ? (
                          <motion.img
                            src={avatar}
                            alt={displayName}
                            whileHover={{ scale: 1.08 }}
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
                          className={`w-full h-full items-center justify-center font-black text-white ${
                            avatar ? "hidden" : "flex"
                          } ${isMobile ? "text-3xl" : "text-4xl sm:text-5xl"}`}
                        >
                          {initials}
                        </div>

                        {onEditPhoto && (
                          <button
                            type="button"
                            onClick={onEditPhoto}
                            className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer text-white backdrop-blur-xs z-30"
                          >
                            <Camera size={26} className="text-[#4285f4] drop-shadow" />
                            <span className="text-[11px] font-bold uppercase tracking-wider bg-[#4285f4] px-3 py-0.5 rounded-full shadow">
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
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-[11px] font-semibold text-zinc-300 hover:text-white transition cursor-pointer shadow-sm"
                  >
                    <Camera size={12} className="text-[#4285f4]" />
                    <span>Change Photo</span>
                  </button>
                )}
              </div>

              {/* Title & Tagline */}
              <div className={`flex-1 space-y-3 min-w-0 ${isMobile ? "text-center" : "text-center md:text-left"}`}>
                <h1 className={`font-extrabold tracking-tight text-white leading-tight break-words ${isMobile ? "text-2xl sm:text-3xl" : "text-4xl sm:text-6xl md:text-7xl"}`}>
                  <ShimmerText className="break-words max-w-full" gradient="from-[#4285f4] via-[#ea4335] via-[#fbbc05] to-[#34a853]">
                    {displayName}
                  </ShimmerText>
                </h1>

                {/* Subtitle / Tagline: Support Before vs After Diff */}
                {portfolio?._showDiff && (portfolio?._isTaglineAIHighlighted || portfolio?._aiOriginalTagline) ? (
                  <DiffBox
                    original={portfolio._aiOriginalTagline || `${displayName} | Software Specialist`}
                    suggested={tagline}
                    originalLabel="Before (Original Tagline)"
                    suggestedLabel="After (AI Optimized Headline)"
                    category="Hero Headline & Tagline"
                  />
                ) : (
                  <p className={`text-[#8ab4f8] font-medium break-words ${isMobile ? "text-base" : "text-xl sm:text-2xl"}`}>
                    {tagline}
                  </p>
                )}

                {/* Professional Bio / Pitch: Support Before vs After Diff */}
                {portfolio?._showDiff && (portfolio?._isAboutAIHighlighted || portfolio?._aiOriginalAbout) ? (
                  <DiffBox
                    original={portfolio._aiOriginalAbout || "Passionate professional building modern software and solving complex challenges."}
                    suggested={about}
                    originalLabel="Before (Original Bio)"
                    suggestedLabel="After (AI High-Impact Summary)"
                    category="Professional Bio & Summary"
                  />
                ) : about ? (
                  <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed max-w-2xl break-words">
                    {about}
                  </p>
                ) : null}

                {/* Magnetic Action Buttons */}
                <div className={`flex flex-wrap items-center gap-3 pt-3 ${isMobile ? "justify-center" : "justify-center md:justify-start"}`}>
                  {email && (
                    <MagneticButton>
                      <button
                        onClick={() => handleCopy(email, "g-email")}
                        className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#4285f4] hover:bg-[#3367d6] text-white font-semibold text-xs tracking-wider transition cursor-pointer flex items-center gap-2 shadow-lg shadow-[#4285f4]/25 shrink-0"
                      >
                        {copiedKey === "g-email" ? <Check size={14} /> : <Mail size={14} />}
                        <span>{copiedKey === "g-email" ? "Gmail Address Copied" : "Contact via Gmail"}</span>
                      </button>
                    </MagneticButton>
                  )}

                  {github && (
                    <MagneticButton
                      href={github.startsWith("http") ? github : `https://${github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 rounded-full bg-[#303134] hover:bg-[#3c4043] border border-zinc-700 text-zinc-200 text-xs font-semibold transition flex items-center gap-2 shadow"
                    >
                      <FaGithub size={14} />
                      <span>GitHub</span>
                    </MagneticButton>
                  )}

                  {linkedin && (
                    <MagneticButton
                      href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 rounded-full bg-[#303134] hover:bg-[#3c4043] border border-zinc-700 text-zinc-200 text-xs font-semibold transition flex items-center gap-2 shadow"
                    >
                      <FaLinkedin size={14} />
                      <span>LinkedIn</span>
                    </MagneticButton>
                  )}

                  {website && (
                    <MagneticButton
                      href={website.startsWith("http") ? website : `https://${website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 rounded-full bg-[#303134] hover:bg-[#3c4043] border border-zinc-700 text-zinc-200 text-xs font-semibold transition flex items-center gap-2 shadow"
                    >
                      <Globe size={14} />
                      <span>Website</span>
                    </MagneticButton>
                  )}
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Google Knowledge Graph Telemetry Ribbon */}
        <ScrollReveal delay={0.1}>
          <div className={`grid gap-3 sm:gap-4 ${isMobile ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
            {[
              { val: "0.04s", label: "Query Response", sub: "Optimized Search Index" },
              { val: `${projects.length}+`, label: "Indexed Artifacts", sub: "Production Repos" },
              { val: "100%", label: "Core Web Vitals", sub: "Lighthouse Performance" },
              { val: `${skills.length}+`, label: "Stack Entities", sub: "Knowledge Graph" },
            ].map((stat, i) => (
              <SpotlightCard
                key={i}
                spotlightColor="rgba(66, 133, 244, 0.16)"
                borderColor="rgba(66, 133, 244, 0.4)"
                className={`${isMobile ? "p-3" : "p-5"} text-center space-y-1 bg-[#282a2c] border-zinc-700/60`}
              >
                <div className={`${isMobile ? "text-2xl" : "text-3xl"} font-black text-[#8ab4f8] font-mono tracking-tight`}>
                  {stat.val}
                </div>
                <div className="text-xs font-bold text-white">{stat.label}</div>
                <div className="text-[10px] text-zinc-400">{stat.sub}</div>
              </SpotlightCard>
            ))}
          </div>
        </ScrollReveal>

        {/* Interactive Google Omnibox Search Bar */}
        <ScrollReveal delay={0.15}>
          <section className="space-y-4">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-3 px-5 py-3.5 rounded-full bg-[#303134] border border-zinc-700 shadow-2xl focus-within:border-[#4285f4] focus-within:ring-2 focus-within:ring-[#4285f4]/30 transition-all">
                <Search size={18} className="text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${displayName}'s projects, skills, or stack...`}
                  className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-zinc-400 hover:text-white mr-1 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Lucky & Search Buttons */}
              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleFeelingLucky}
                  className="px-5 py-2 rounded-full bg-[#303134] hover:bg-[#3c4043] border border-zinc-700 text-xs font-medium text-zinc-300 transition cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <Shuffle size={13} className="text-[#fbbc05]" />
                  <span>I&apos;m Feeling Lucky</span>
                </button>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Skills Chip Matrix with Magnetic Pills */}
        {skills?.length > 0 && (
          <ScrollReveal delay={0.15}>
            <section id="skills" data-section="skills" className="space-y-3 scroll-mt-24">
              <h2 className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
                Material 3 Component Stack ({skills.length})
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {skills.map((skill, idx) => {
                  const colors = [
                    "border-[#4285f4]/40 hover:bg-[#4285f4]/10 text-blue-300",
                    "border-[#ea4335]/40 hover:bg-[#ea4335]/10 text-red-300",
                    "border-[#fbbc05]/40 hover:bg-[#fbbc05]/10 text-yellow-300",
                    "border-[#34a853]/40 hover:bg-[#34a853]/10 text-emerald-300",
                  ];
                  const colorClass = colors[idx % colors.length];

                  return (
                    <MagneticPill
                      key={idx}
                      onClick={() => setSearchQuery(skill)}
                      className={`bg-[#282a2c] border ${colorClass} cursor-pointer`}
                      title={`Click to filter projects by ${skill}`}
                    >
                      <span>{skill}</span>
                    </MagneticPill>
                  );
                })}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Featured / Filtered Projects */}
        {projects?.length > 0 && (
          <ScrollReveal delay={0.2}>
            <section id="projects" data-section="projects" className="space-y-6 scroll-mt-24">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>Indexed Knowledge Results ({filteredProjects.length})</span>
                  </h2>
                  {searchQuery && (
                    <span className="text-xs text-[#4285f4]">
                      Filtered by &quot;{searchQuery}&quot;
                    </span>
                  )}
                </div>
                <span className="text-xs text-zinc-500 font-mono">
                  {filteredProjects.length} OF {projects.length} RESULTS
                </span>
              </div>

              <div className={`grid gap-6 ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                {filteredProjects.map((proj, idx) => (
                  <SpotlightCard
                    key={idx}
                    spotlightColor="rgba(66, 133, 244, 0.18)"
                    borderColor="rgba(66, 133, 244, 0.45)"
                    className={`rounded-3xl bg-[#282a2c] border transition-all space-y-4 shadow-xl cursor-pointer flex flex-col justify-between ${isMobile ? "p-4" : "p-7"} ${
                      luckyProject?.title === proj.title
                        ? "border-[#fbbc05] ring-2 ring-[#fbbc05]/50"
                        : "border-zinc-700/60 hover:border-[#4285f4]/60"
                    }`}
                    onClick={() => setInspectedProject(proj)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-[#34a853] font-bold">
                          google.drive // build_{idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#8ab4f8] font-medium flex items-center gap-1 group-hover:underline">
                            <span>Deep Dive</span>
                            <ArrowUpRight size={12} />
                          </span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors flex items-center justify-between gap-2">
                        <span>{proj.title}</span>
                        {proj._isAIHighlighted && portfolio?._showDiff && (
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1 shrink-0">
                            <Sparkles size={10} />
                            <span>AI Optimized</span>
                          </span>
                        )}
                      </h3>

                      {portfolio?._showDiff && (proj._isAIHighlighted || proj._aiOriginalDescription) ? (
                        <DiffBox
                          original={proj._aiOriginalDescription || "Original project implementation."}
                          suggested={proj.description}
                          originalLabel="Before (Original Description)"
                          suggestedLabel="After (AI Optimized Description)"
                        />
                      ) : (
                        <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed line-clamp-3">
                          {proj.description}
                        </p>
                      )}

                      {proj.impact && (
                        <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-[#34a853] font-medium flex items-center gap-2">
                          <Zap size={13} className="text-[#34a853]" />
                          <span>Outcome: {proj.impact}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-zinc-700/40">
                      {proj.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {proj.tags.map((t, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/50 font-mono"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        {proj.github && (
                          <a
                            href={proj.github.startsWith("http") ? proj.github : `https://${proj.github}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-zinc-400 hover:text-white transition flex items-center gap-1.5 font-medium"
                          >
                            <FaGithub size={14} />
                            <span>Repository</span>
                          </a>
                        )}

                        {proj.live && (
                          <a
                            href={proj.live.startsWith("http") ? proj.live : `https://${proj.live}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-3.5 py-1.5 rounded-full bg-[#4285f4]/15 hover:bg-[#4285f4]/25 text-[#8ab4f8] hover:text-white border border-[#4285f4]/30 text-xs font-semibold flex items-center gap-1 transition ml-auto"
                          >
                            <span>Open Build</span>
                            <ExternalLink size={12} />
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

        {/* Experience Timeline */}
        {experience?.length > 0 && (
          <ScrollReveal delay={0.2}>
            <section id="experience" data-section="experience" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-2 flex items-center gap-2">
                <Layers size={16} className="text-[#4285f4]" />
                <span>Career Appointments &amp; History</span>
              </h2>
              <div className="space-y-3">
                {experience.map((exp, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ x: 6 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    className={`p-6 rounded-3xl border space-y-2 shadow-lg transition-all ${
                      exp._isAIHighlighted && portfolio?._showDiff
                        ? "bg-emerald-950/20 border-emerald-500/50 ring-1 ring-emerald-500/40"
                        : "bg-[#282a2c] border-zinc-700/60"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                      <span className="font-bold text-base text-white flex flex-wrap items-center gap-2">
                        <span>{exp.role} · <span className="text-[#4285f4]">{exp.company}</span></span>
                        {exp._isAIHighlighted && portfolio?._showDiff && (
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                            <Sparkles size={10} />
                            <span>AI High-Impact</span>
                          </span>
                        )}
                      </span>
                      <span className="text-zinc-400 font-mono px-3 py-1 rounded-full bg-zinc-800 shrink-0 w-fit">
                        {exp.duration}
                      </span>
                    </div>

                    {portfolio?._showDiff && (exp._isAIHighlighted || exp._aiOriginalDescription) ? (
                      <DiffBox
                        original={exp._aiOriginalDescription || "Original role responsibilities and technical deliverables."}
                        suggested={exp.description}
                        originalLabel="Before (Original Role Summary)"
                        suggestedLabel="After (AI ATS Impact Rewrite)"
                      />
                    ) : (
                      <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                        {exp.description}
                      </p>
                    )}

                    <ExperienceCredentialsBadges exp={exp} />
                  </motion.div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Education & Honors */}
        {(education?.length > 0 || achievements?.length > 0) && (
          <ScrollReveal delay={0.25}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {education?.length > 0 && (
                <div className="p-7 rounded-3xl bg-[#282a2c] border border-zinc-700/60 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-xs uppercase font-bold text-[#4285f4]">
                    <GraduationCap size={16} />
                    <span>Academic History</span>
                  </div>
                  <div className="space-y-3">
                    {education.map((edu, idx) => (
                      <div key={idx} className="text-xs border-b border-zinc-700/50 pb-3 space-y-1">
                        <span className="font-bold text-white text-sm">{edu.institution}</span>
                        <p className="text-zinc-400">{edu.degree} ({edu.year})</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {achievements?.length > 0 && (
                <div className="p-7 rounded-3xl bg-[#282a2c] border border-zinc-700/60 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-xs uppercase font-bold text-[#34a853]">
                    <Award size={16} />
                    <span>Honors &amp; Awards</span>
                  </div>
                  <div className="space-y-3">
                    {achievements.map((ach, idx) => (
                      <div key={idx} className="text-xs border-b border-zinc-700/50 pb-3 space-y-1">
                        <span className="font-bold text-white text-sm">{ach.title}</span>
                        <p className="text-zinc-400">{ach.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Verified Credentials & Target Certifications */}
        {certifications?.length > 0 && (
          <ScrollReveal delay={0.25}>
            <section id="certifications" data-section="certifications" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-2 flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#34a853]" />
                <span>Verified Credentials &amp; Target Certifications ({certifications.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certifications.map((cert, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-3xl border space-y-2 transition-all shadow-md ${
                      cert._isAICertHighlighted && portfolio?._showDiff
                        ? "bg-emerald-950/35 border-emerald-500/60 ring-1 ring-emerald-500/50 shadow-emerald-950/30"
                        : "bg-[#282a2c] border-zinc-700/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-white text-sm">{cert.name}</span>
                      {cert._isAICertHighlighted && portfolio?._showDiff && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold flex items-center gap-1 shrink-0">
                          <Sparkles size={9} />
                          <span>AI Recommended</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#8ab4f8]">
                      <span>{cert.issuer}</span>
                      {cert.date && <span className="text-zinc-500">• {cert.date}</span>}
                    </div>
                    {cert.description && (
                      <p className="text-xs text-zinc-300 font-light leading-relaxed">
                        {cert.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Google Workspace Direct Communication Section */}
        <ScrollReveal delay={0.25}>
          <section id="contact" data-section="contact" className="p-8 sm:p-12 rounded-3xl bg-[#282a2c] border border-zinc-700/60 space-y-6 shadow-2xl scroll-mt-24">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4285f4]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ea4335]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#fbbc05]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#34a853]" />
              <span className="text-xs uppercase font-bold text-zinc-400 font-mono ml-1">
                GOOGLE WORKSPACE DIRECT COMMS // 2026
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Send Direct Message or Inquire</h2>
            <p className="text-sm text-zinc-300 max-w-xl">
              Connect directly regarding engineering appointments, collaborative builds, or technical architecture.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {email && (
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-full bg-[#4285f4] hover:bg-[#3367d6] text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-[#4285f4]/25"
                >
                  <Mail size={14} />
                  <span>Compose via Gmail ({email})</span>
                </a>
              )}
              {linkedin && (
                <a
                  href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-full bg-[#303134] hover:bg-[#3c4043] border border-zinc-700 text-zinc-200 text-xs font-semibold transition flex items-center gap-2 shadow"
                >
                  <FaLinkedin size={14} />
                  <span>LinkedIn Network</span>
                </a>
              )}
              {github && (
                <a
                  href={github.startsWith("http") ? github : `https://${github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-full bg-[#303134] hover:bg-[#3c4043] border border-zinc-700 text-zinc-200 text-xs font-semibold transition flex items-center gap-2 shadow"
                >
                  <FaGithub size={14} />
                  <span>GitHub Repositories</span>
                </a>
              )}
            </div>
          </section>
        </ScrollReveal>
      </main>

      <ProjectDeepDiveModal
        project={inspectedProject}
        onClose={() => setInspectedProject(null)}
        accentColor="#4285f4"
      />
    </div>
  );
};

export default GoogleInspiredTemplate;
