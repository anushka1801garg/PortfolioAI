import { useState } from "react";
import {
  TrendingUp,
  Zap,
  Target,
  ExternalLink,
  Mail,
  Award,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Briefcase,
  Layers,
  Phone,
  Globe,
  ArrowUpRight,
  Flame,
  Check,
  Sparkles,
  Camera,
  Copy,
  Rocket,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
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

const StartupFounderTemplate = ({ portfolio, onEditPhoto, isOwner }) => {
  const {
    name = "Founder",
    tagline = "Technical Founder & Systems Architect",
    about = "",
    skills = [],
    projects = [],
    experience = [],
    education = [],
    achievements = [],
    certifications = [],
    blog = [],
    contact = {},
    title,
  } = portfolio || {};

  const email = portfolio?.email || contact?.email;
  const phone = portfolio?.phone || contact?.phone;
  const linkedin = portfolio?.linkedin || contact?.linkedin;
  const github = portfolio?.github || contact?.github;
  const website = portfolio?.website || contact?.website;
  const avatar = portfolio?.avatar || portfolio?.hero?.avatar || "";
  const displayName = name || title || "Founder";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [deckMode, setDeckMode] = useState("INVESTOR"); // "INVESTOR" | "PRODUCT"
  const [copiedKey, setCopiedKey] = useState(null);
  const [inspectedProject, setInspectedProject] = useState(null);

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied to clipboard: ${text} 🚀`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans selection:bg-amber-500/20 selection:text-amber-300 relative pb-32 overflow-x-hidden">
      {/* Background ambient lighting with framer-motion drift */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.08, 0.16, 0.08],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-0 right-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.06, 0.14, 0.06],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[160px] pointer-events-none"
      />

      {/* Top Founder Navigation & Mode Switcher */}
      <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-xl border-b border-zinc-800/80 px-6 py-3">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="font-bold text-white tracking-wide uppercase font-mono">
              {displayName} // VENTURE STAGE
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Pitch Deck Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-bold">
              <button
                onClick={() => setDeckMode("INVESTOR")}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  deckMode === "INVESTOR"
                    ? "bg-amber-500 text-black shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Investor Deck View
              </button>
              <button
                onClick={() => setDeckMode("PRODUCT")}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  deckMode === "PRODUCT"
                    ? "bg-amber-500 text-black shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Product Specs View
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-24">
        {/* Founder Hero Card with 3D Tilt & Amber PulseAura */}
        <ScrollReveal direction="up" immediate={true}>
          <section id="hero" data-section="hero" className="rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 p-8 sm:p-14 space-y-8 shadow-2xl relative overflow-hidden scroll-mt-24">
            {/* AI Theme Optimization Banner (in diff mode) */}
            {portfolio?._showDiff && (portfolio?._isTemplateAIHighlighted || portfolio?._aiOriginalTemplate) && (
              <DiffThemeBanner
                originalTemplate={portfolio._aiOriginalTemplate || "Modern"}
                suggestedTemplate="Startup Founder"
              />
            )}

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Flame size={14} className="text-amber-400 animate-pulse" />
              <span>BUILDING IN PUBLIC // HIGH VELOCITY REVENUE ENGINE</span>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar with TiltCard & PulseAura */}
              <div className="shrink-0 flex flex-col items-center gap-2">
                <TiltCard maxTilt={15}>
                  <PulseAura glowGradient="from-amber-500 via-orange-500 to-yellow-400">
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl p-1 bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 shadow-2xl shadow-amber-500/20 group">
                      <div className="w-full h-full rounded-[22px] overflow-hidden bg-zinc-950 flex items-center justify-center relative">
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
                          className={`w-full h-full items-center justify-center text-4xl sm:text-5xl font-black text-amber-400 ${
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
                          >
                            <Camera size={26} className="text-amber-400 drop-shadow" />
                            <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-500 text-black px-3 py-0.5 rounded-full shadow">
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
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-zinc-300 hover:text-white transition cursor-pointer shadow-sm"
                  >
                    <Camera size={12} className="text-amber-400" />
                    <span>Change Photo</span>
                  </button>
                )}
              </div>

              {/* Title & Tagline */}
              <div className="flex-1 text-center md:text-left space-y-2">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-tight">
                  <ShimmerText gradient="from-white via-amber-200 to-orange-400">
                    {displayName}
                  </ShimmerText>
                </h1>

                {/* Subtitle / Tagline: Support Before vs After Diff */}
                {portfolio?._showDiff && (portfolio?._isTaglineAIHighlighted || portfolio?._aiOriginalTagline) ? (
                  <DiffBox
                    original={portfolio._aiOriginalTagline || `${displayName} | Technical Founder`}
                    suggested={tagline}
                    originalLabel="Before (Original Tagline)"
                    suggestedLabel="After (AI Optimized Headline)"
                    category="Hero Headline & Tagline"
                  />
                ) : (
                  <p className="text-xl sm:text-2xl text-amber-400 font-semibold pt-1">
                    {tagline}
                  </p>
                )}

                {/* Professional Bio / Pitch: Support Before vs After Diff */}
                {portfolio?._showDiff && (portfolio?._isAboutAIHighlighted || portfolio?._aiOriginalAbout) ? (
                  <DiffBox
                    original={portfolio._aiOriginalAbout || "Technical Founder passionate about shipping high-velocity scalable products."}
                    suggested={about}
                    originalLabel="Before (Original Bio)"
                    suggestedLabel="After (AI High-Impact Summary)"
                    category="Professional Bio & Summary"
                  />
                ) : about ? (
                  <p className="text-zinc-300 text-sm sm:text-base font-light leading-relaxed max-w-2xl pt-2">
                    {about}
                  </p>
                ) : null}

                {/* Magnetic Action CTAs */}
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 pt-3">
                  {email && (
                    <MagneticButton>
                      <button
                        onClick={() => copyToClipboard(email, "founder-email")}
                        className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2"
                      >
                        {copiedKey === "founder-email" ? <Check size={14} /> : <Zap size={14} />}
                        <span>{copiedKey === "founder-email" ? "Founder Intro Copied!" : "Fast-Track Founder Intro"}</span>
                      </button>
                    </MagneticButton>
                  )}

                  {linkedin && (
                    <MagneticButton
                      href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition flex items-center gap-2 shadow"
                    >
                      <FaLinkedin size={14} className="text-amber-400" />
                      <span>LinkedIn</span>
                    </MagneticButton>
                  )}

                  {github && (
                    <MagneticButton
                      href={github.startsWith("http") ? github : `https://${github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition flex items-center gap-2 shadow"
                    >
                      <FaGithub size={14} className="text-amber-400" />
                      <span>Code Repos</span>
                    </MagneticButton>
                  )}

                  {website && (
                    <MagneticButton
                      href={website.startsWith("http") ? website : `https://${website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition flex items-center gap-2 shadow"
                    >
                      <Globe size={14} className="text-amber-400" />
                      <span>Company Site</span>
                    </MagneticButton>
                  )}
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Live Traction & KPI Scoreboard with Spotlight Cards */}
        <ScrollReveal delay={0.1}>
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { metric: `${projects.length}+`, label: "Products Shipped", sub: "Production scale ventures" },
              { metric: "100%", label: "System Uptime", sub: "Zero-downtime microservices" },
              { metric: `${skills.length}+`, label: "Tech Weapons", sub: "Full Stack & Cloud Architecture" },
              { metric: "24/7", label: "Execution Velocity", sub: "Continuous Shipping" },
            ].map((item, idx) => (
              <SpotlightCard
                key={idx}
                spotlightColor="rgba(245, 158, 11, 0.18)"
                borderColor="rgba(245, 158, 11, 0.45)"
                className="p-5 text-center space-y-1 bg-zinc-900/60 border-zinc-800"
              >
                <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
                  {item.metric}
                </div>
                <div className="text-xs font-bold text-white">{item.label}</div>
                <div className="text-[10px] text-zinc-500">{item.sub}</div>
              </SpotlightCard>
            ))}
          </section>
        </ScrollReveal>

        {/* Products / Portfolios (Pitch Deck format) with SpotlightCards & Deep-Dive Modals */}
        {projects?.length > 0 && (
          <ScrollReveal delay={0.15}>
            <section id="projects" data-section="projects" className="space-y-6 scroll-mt-24">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                    {deckMode === "INVESTOR" ? "Traction & Portfolio Ventures" : "Technical Architecture & Repos"}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white pt-1">
                    Built Products &amp; Platforms ({projects.length})
                  </h2>
                </div>
                <span className="text-xs text-zinc-500 font-mono">
                  {projects.length} VENTURES
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((proj, idx) => (
                  <SpotlightCard
                    key={idx}
                    onClick={() => setInspectedProject(proj)}
                    spotlightColor="rgba(245, 158, 11, 0.2)"
                    borderColor="rgba(245, 158, 11, 0.5)"
                    className="p-7 rounded-3xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/40 transition-all space-y-4 shadow-xl flex flex-col justify-between cursor-pointer group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                          Venture 0{idx + 1}
                        </span>
                        <span className="text-xs text-amber-300 font-semibold flex items-center gap-1 group-hover:underline">
                          <span>Inspect Pitch Deck</span>
                          <ArrowUpRight size={12} />
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-white group-hover:text-amber-300 transition-colors flex items-center justify-between gap-2">
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
                        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light line-clamp-3">
                          {proj.description}
                        </p>
                      )}

                      {proj.impact && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-semibold flex items-center gap-2">
                          <TrendingUp size={13} className="shrink-0" />
                          <span>Key Metric: {proj.impact}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-zinc-800/80">
                      {proj.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {proj.tags.map((t, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono border border-zinc-700/50"
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
                            <FaGithub size={13} />
                            <span>Codebase</span>
                          </a>
                        )}

                        {proj.live && (
                          <a
                            href={proj.live.startsWith("http") ? proj.live : `https://${proj.live}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-3.5 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1 transition ml-auto"
                          >
                            <span>Live Venture</span>
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

        {/* Stack / Founder Moat with Magnetic Pills */}
        {skills?.length > 0 && (
          <ScrollReveal delay={0.15}>
            <section id="skills" data-section="skills" className="space-y-4 scroll-mt-24">
              <h2 className="text-xs uppercase tracking-widest text-amber-400 font-bold border-b border-zinc-800 pb-2 flex items-center gap-2">
                <Target size={14} className="text-amber-400" />
                <span>Technology Moat &amp; Stack Weapons ({skills.length})</span>
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {skills.map((skill, idx) => (
                  <MagneticPill
                    key={idx}
                    className="bg-zinc-900 border border-zinc-800 text-zinc-200 hover:border-amber-500/50 hover:text-amber-300 shadow-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>{skill}</span>
                  </MagneticPill>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Experience Track Record */}
        {experience?.length > 0 && (
          <ScrollReveal delay={0.2}>
            <section id="experience" data-section="experience" className="space-y-4 scroll-mt-24">
              <h2 className="text-xs uppercase tracking-widest text-amber-400 font-bold border-b border-zinc-800 pb-2 flex items-center gap-2">
                <Layers size={14} className="text-amber-400" />
                <span>Leadership &amp; Founder Track Record</span>
              </h2>
              <div className="space-y-3">
                {experience.map((exp, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ x: 6 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2 shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                      <span className="text-base font-bold text-white">
                        {exp.role} @ <span className="text-amber-400">{exp.company}</span>
                      </span>
                      <span className="text-zinc-400 font-mono px-3 py-1 rounded-full bg-zinc-800">
                        {exp.duration}
                      </span>
                    </div>
                    {portfolio?._showDiff && (exp._isAIHighlighted || exp._aiOriginalDescription) ? (
                      <DiffBox
                        original={exp._aiOriginalDescription || "Original role responsibilities and executive achievements."}
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

        {/* Honors & Education */}
        {(achievements?.length > 0 || education?.length > 0) && (
          <ScrollReveal delay={0.25}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements?.length > 0 && (
                <div className="p-7 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
                    <Award size={16} />
                    <span>Milestones &amp; Awards</span>
                  </div>
                  <div className="space-y-3">
                    {achievements.map((ach, idx) => (
                      <div key={idx} className="text-xs border-b border-zinc-800/80 pb-3 space-y-1">
                        <div className="font-bold text-white text-sm">{ach.title}</div>
                        <p className="text-zinc-400 text-xs font-light">{ach.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {education?.length > 0 && (
                <div className="p-7 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
                    <GraduationCap size={16} />
                    <span>Academic Background</span>
                  </div>
                  <div className="space-y-3">
                    {education.map((edu, idx) => (
                      <div key={idx} className="text-xs border-b border-zinc-800/80 pb-3 space-y-1">
                        <div className="font-bold text-white text-sm">{edu.institution}</div>
                        <p className="text-amber-400 text-xs font-mono">{edu.degree} ({edu.year})</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Founder Direct Comms & Deal Flow Section */}
        <ScrollReveal delay={0.25}>
          <section id="contact" data-section="contact" className="p-8 sm:p-12 rounded-3xl bg-zinc-900/80 border border-amber-500/30 space-y-6 shadow-2xl scroll-mt-24">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Flame size={14} className="text-amber-400 animate-pulse" />
              <span>DIRECT DEAL FLOW &amp; VENTURE OFFICE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Let&apos;s Build the Future</h2>
            <p className="text-zinc-300 text-sm max-w-xl">
              Open to investor conversations, enterprise pilot partnerships, CTO/advisory discussions, and early-stage syndicate co-investment.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {email && (
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-7 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs tracking-wider transition shadow-xl shadow-amber-500/20 flex items-center gap-2"
                >
                  <Mail size={14} />
                  <span>Send Direct Email ({email})</span>
                </a>
              )}
              {linkedin && (
                <a
                  href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition flex items-center gap-2"
                >
                  <FaLinkedin size={14} className="text-amber-400" />
                  <span>Founder LinkedIn</span>
                </a>
              )}
              {github && (
                <a
                  href={github.startsWith("http") ? github : `https://${github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition flex items-center gap-2"
                >
                  <FaGithub size={14} />
                  <span>GitHub Repos</span>
                </a>
              )}
            </div>
          </section>
        </ScrollReveal>
      </main>

      {/* Venture Case Study Modal */}
      {inspectedProject && (
        <ProjectDeepDiveModal
          project={inspectedProject}
          onClose={() => setInspectedProject(null)}
          accentColor="#f59e0b"
        />
      )}
    </div>
  );
};

export default StartupFounderTemplate;
