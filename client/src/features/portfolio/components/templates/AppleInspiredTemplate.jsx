import { useState } from "react";
import {
  Globe,
  Mail,
  ExternalLink,
  Award,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Phone,
  Sparkles,
  Command,
  Layers,
  ArrowUpRight,
  Briefcase,
  Compass,
  Check,
  Camera,
  Cpu,
  Zap,
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
  Perspective3DCard,
  InteractiveCursorFollower,
  KineticMarquee,
  ExperienceCredentialsBadges,
} from "./motionComponents";

const AppleInspiredTemplate = ({ portfolio, onEditPhoto, isOwner }) => {
  const [inspectedProject, setInspectedProject] = useState(null);
  const {
    name = "Developer",
    tagline = "Software Engineer & Interface Architect",
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
    email = contact?.email,
    phone = contact?.phone || portfolio?.phone,
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

  // Dynamic Island Expansion State
  const [islandExpanded, setIslandExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied: ${text} ✨`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filter projects by category
  const filteredProjects = projects.filter((proj) => {
    if (activeCategory === "ALL") return true;
    return (
      Array.isArray(proj.tags) &&
      proj.tags.some((t) => t.toLowerCase().includes(activeCategory.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] font-sans antialiased selection:bg-sky-500/30 selection:text-white relative pb-32 overflow-x-hidden">
      {/* Background ambient lighting */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.22),rgba(255,255,255,0))]"
      />
      <InteractiveCursorFollower color="rgba(56, 189, 248, 0.12)" size={520} blur={95} />

      {/* CUPERTINO DYNAMIC ISLAND (Top Center Floating Capsule) */}
      <div className="sticky top-4 z-50 flex justify-center px-4">
        <motion.div
          layout
          onClick={() => setIslandExpanded(!islandExpanded)}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="bg-black/90 backdrop-blur-2xl border border-white/20 rounded-full shadow-2xl cursor-pointer hover:border-white/35 transition-colors px-4 py-2 flex items-center gap-3 text-xs select-none"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white tracking-tight">
              {displayName}
            </span>
          </div>

          <span className="text-zinc-600">|</span>

          <span className="text-zinc-400 hidden sm:inline truncate max-w-xs font-light">
            {tagline}
          </span>

          <motion.div
            animate={{ rotate: islandExpanded ? 180 : 0 }}
            className="text-zinc-400 ml-1 text-[10px]"
          >
            ▼
          </motion.div>
        </motion.div>
      </div>

      {/* Expanded Island Drawer Modal */}
      <AnimatePresence>
        {islandExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md bg-zinc-900/90 backdrop-blur-3xl border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-semibold text-white tracking-wide uppercase">
                AirDrop &amp; Direct Channel
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                100% ProMotion // Active
              </span>
            </div>

            <p className="text-xs text-zinc-300 font-light leading-relaxed">
              {about || tagline}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {email && (
                <button
                  onClick={() => copyToClipboard(email, "island-email")}
                  className="px-3.5 py-1.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition cursor-pointer flex items-center gap-1.5 shadow"
                >
                  {copiedKey === "island-email" ? <Check size={12} /> : <Mail size={12} />}
                  <span>{copiedKey === "island-email" ? "Copied!" : "Copy Email"}</span>
                </button>
              )}
              {phone && (
                <button
                  onClick={() => copyToClipboard(phone, "island-phone")}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white font-medium text-xs hover:bg-white/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Phone size={12} />
                  <span>{phone}</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative max-w-5xl mx-auto px-6 pt-12 space-y-28">
        {/* Cupertino Hero Section with 3D Tilt & Titanium Refraction */}
        <ScrollReveal direction="up" immediate={true}>
          <section id="hero" data-section="about" className="text-center space-y-8 pt-4 scroll-mt-24">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-zinc-900/80 border border-white/15 text-zinc-300 backdrop-blur-xl shadow-lg"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
              <span>Cupertino Precision Engineering 2026</span>
            </motion.div>

            <div className="flex flex-col items-center justify-center gap-5">
              {/* Avatar with TiltCard & PulseAura */}
              <div className="flex flex-col items-center gap-2">
                <TiltCard maxTilt={15}>
                  <PulseAura glowGradient="from-sky-500 via-indigo-500 to-purple-500">
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1 bg-gradient-to-tr from-zinc-700 via-sky-600 to-zinc-500 shadow-2xl shadow-sky-500/20 group">
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
                          >
                            <Camera size={26} className="text-sky-300 drop-shadow" />
                            <span className="text-[11px] font-bold uppercase tracking-wider bg-sky-600 px-3 py-0.5 rounded-full shadow">
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
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/15 text-[11px] font-semibold text-zinc-300 hover:text-white transition cursor-pointer shadow-sm"
                  >
                    <Camera size={12} className="text-sky-400" />
                    <span>Change Photo</span>
                  </button>
                )}
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                <ShimmerText gradient="from-white via-slate-200 to-sky-300">
                  {displayName}
                </ShimmerText>
              </h1>
            </div>

            <p className="max-w-2xl mx-auto text-xl sm:text-2xl text-zinc-400 font-light leading-relaxed">
              {tagline}
            </p>

            {about && (
              <p className="max-w-3xl mx-auto text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
                {about}
              </p>
            )}

            {/* Action Buttons with Magnetic Pull */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {email && (
                <MagneticButton>
                  <button
                    onClick={() => copyToClipboard(email, "mail-btn")}
                    className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition shadow-xl cursor-pointer flex items-center gap-2"
                  >
                    {copiedKey === "mail-btn" ? <Check size={15} /> : <Mail size={15} />}
                    <span>{copiedKey === "mail-btn" ? "Email Copied!" : "Contact via Mail"}</span>
                  </button>
                </MagneticButton>
              )}

              {github && (
                <MagneticButton
                  href={github.startsWith("http") ? github : `https://${github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-full bg-zinc-900/90 border border-white/15 text-zinc-200 font-medium text-sm hover:text-white hover:border-white/30 transition flex items-center gap-2 shadow"
                >
                  <FaGithub size={15} />
                  <span>GitHub</span>
                </MagneticButton>
              )}

              {linkedin && (
                <MagneticButton
                  href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-full bg-zinc-900/90 border border-white/15 text-zinc-200 font-medium text-sm hover:text-white hover:border-white/30 transition flex items-center gap-2 shadow"
                >
                  <FaLinkedin size={15} />
                  <span>LinkedIn</span>
                </MagneticButton>
              )}

              {website && (
                <MagneticButton
                  href={website.startsWith("http") ? website : `https://${website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-full bg-zinc-900/90 border border-white/15 text-zinc-200 font-medium text-sm hover:text-white hover:border-white/30 transition flex items-center gap-2 shadow"
                >
                  <Globe size={15} />
                  <span>Website</span>
                </MagneticButton>
              )}
            </div>
          </section>
        </ScrollReveal>

        {/* Cupertino Silicon Telemetry Banner */}
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { val: "120Hz", label: "ProMotion Flow", sub: "Ultra Fluid Motion" },
              { val: `${projects.length}+`, label: "Engineered Products", sub: "Zero Compromise" },
              { val: "Retina", label: "Sub-pixel Calibrated", sub: "Dynamic Typography" },
              { val: `${skills.length}+`, label: "Technologies", sub: "Full Stack Mastery" },
            ].map((stat, i) => (
              <SpotlightCard
                key={i}
                spotlightColor="rgba(56, 189, 248, 0.15)"
                borderColor="rgba(56, 189, 248, 0.35)"
                className="p-5 text-center space-y-1 bg-zinc-900/60 border-white/10 backdrop-blur-2xl"
              >
                <div className="text-3xl font-black text-white font-mono tracking-tight">
                  {stat.val}
                </div>
                <div className="text-xs font-bold text-sky-400">{stat.label}</div>
                <div className="text-[10px] text-zinc-400">{stat.sub}</div>
              </SpotlightCard>
            ))}
          </div>
        </ScrollReveal>

        {/* Technical Capabilities (Skills Chips) */}
        {skills?.length > 0 && (
          <ScrollReveal delay={0.15}>
            <section id="skills" data-section="skills" className="space-y-6 scroll-mt-24">
              <div className="text-center space-y-2">
                <span className="text-xs uppercase tracking-widest text-sky-400 font-medium">
                  Core Architecture
                </span>
                <h2 className="text-2xl sm:text-3xl font-semibold text-white">
                  Technologies &amp; Frameworks ({skills.length})
                </h2>
              </div>

              {/* Kinetic Ticker Marquee */}
              <div className="py-2 -mx-6 sm:-mx-12 overflow-hidden border-y border-white/5 bg-zinc-950/40 backdrop-blur-md">
                <KineticMarquee
                  items={skills}
                  speed={28}
                  renderItem={(skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900/80 border border-white/10 text-xs font-medium text-zinc-200 shadow-sm backdrop-blur-md"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      <span>{skill}</span>
                    </span>
                  )}
                />
              </div>

              <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto pt-2">
                {skills.map((skill, idx) => (
                  <MagneticPill
                    key={idx}
                    className="bg-zinc-900/80 border border-white/10 text-zinc-200 hover:border-sky-400/50 hover:text-white backdrop-blur-md shadow-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span>{skill}</span>
                  </MagneticPill>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Selected Works (Projects) with Cupertino Segment Control */}
        {projects?.length > 0 && (
          <ScrollReveal delay={0.2}>
            <section id="projects" data-section="projects" className="space-y-8 scroll-mt-24">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-sky-400 font-medium">
                    Portfolio Showcase
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-semibold text-white pt-1">
                    Engineered Products ({projects.length})
                  </h2>
                </div>

                {/* Segmented Filter Control */}
                <div className="flex items-center p-1 rounded-full bg-zinc-900/90 border border-white/10 text-xs">
                  {["ALL", "WEB", "SYSTEM", "CLOUD"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
                        activeCategory === cat
                          ? "bg-white text-black shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProjects.map((proj, idx) => (
                  <Perspective3DCard
                    key={idx}
                    maxTilt={9}
                    glareColor="rgba(255, 255, 255, 0.16)"
                    glowBorderColor="rgba(56, 189, 248, 0.45)"
                    className="rounded-3xl bg-zinc-900/60 border border-white/10 p-7 sm:p-8 flex flex-col justify-between space-y-5 hover:border-white/30 transition-all shadow-xl group backdrop-blur-2xl cursor-pointer"
                    onClick={() => setInspectedProject(proj)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                          Product 0{idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-sky-300 font-medium group-hover:underline flex items-center gap-1">
                            <span>Inspect Specs</span>
                            <ArrowUpRight size={12} />
                          </span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-semibold text-white group-hover:text-sky-300 transition-colors">
                        {proj.title}
                      </h3>

                      <p className="text-sm text-zinc-400 leading-relaxed font-light line-clamp-3">
                        {proj.description}
                      </p>

                      {proj.impact && (
                        <p className="text-xs text-emerald-400 font-medium pt-1">
                          Impact: {proj.impact}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-white/5">
                      {proj.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {proj.tags.map((t, i) => (
                            <span
                              key={i}
                              className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 text-zinc-300 font-light"
                            >
                              {t}
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
                            className="px-3.5 py-1.5 rounded-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 ml-auto"
                          >
                            <span>Live Product</span>
                            <ArrowUpRight size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                  </Perspective3DCard>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Experience Timeline */}
        {experience?.length > 0 && (
          <ScrollReveal delay={0.2}>
            <section id="experience" data-section="experience" className="space-y-8 scroll-mt-24">
              <div>
                <span className="text-xs uppercase tracking-widest text-sky-400 font-medium">
                  Professional Journey
                </span>
                <h2 className="text-2xl sm:text-3xl font-semibold text-white pt-1">
                  Career Experience
                </h2>
              </div>

              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ x: 6 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    className="rounded-3xl bg-zinc-900/40 border border-white/10 p-6 sm:p-8 space-y-3 shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="text-lg font-semibold text-white">
                        {exp.role} · <span className="text-zinc-400">{exp.company}</span>
                      </h3>
                      <span className="text-xs text-zinc-400 font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        {exp.duration}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed font-light">
                      {exp.description}
                    </p>
                    <ExperienceCredentialsBadges exp={exp} />
                  </motion.div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Education & Credentials */}
        {(education?.length > 0 || certifications?.length > 0 || achievements?.length > 0) && (
          <ScrollReveal delay={0.25}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {education?.length > 0 && (
                <div className="rounded-3xl bg-zinc-900/40 border border-white/10 p-6 sm:p-8 space-y-4 shadow-xl">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <GraduationCap size={18} className="text-sky-400" />
                    <span>Education</span>
                  </h3>
                  <div className="space-y-3">
                    {education.map((edu, idx) => (
                      <div key={idx} className="space-y-1 border-b border-white/5 pb-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-white">{edu.institution}</span>
                          <span className="text-xs text-zinc-400 font-mono">{edu.year}</span>
                        </div>
                        <p className="text-xs text-zinc-400">{edu.degree}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {achievements?.length > 0 && (
                <div className="rounded-3xl bg-zinc-900/40 border border-white/10 p-6 sm:p-8 space-y-4 shadow-xl">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Award size={18} className="text-sky-400" />
                    <span>Achievements &amp; Honors</span>
                  </h3>
                  <div className="space-y-3">
                    {achievements.map((ach, idx) => (
                      <div key={idx} className="space-y-1 border-b border-white/5 pb-2">
                        <span className="font-medium text-sm text-white">{ach.title}</span>
                        <p className="text-xs text-zinc-400">{ach.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Cupertino Direct Communication / Contact Section */}
        <ScrollReveal delay={0.2}>
          <section
            id="contact"
            data-section="contact"
            className="rounded-3xl bg-zinc-900/40 border border-white/10 p-8 sm:p-12 text-center space-y-6 shadow-2xl backdrop-blur-xl relative overflow-hidden scroll-mt-24"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
            <span className="text-xs uppercase tracking-widest text-sky-400 font-medium">
              Direct Communication
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
              Connect with {displayName}
            </h2>
            <p className="text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed font-light">
              Available for engineering roles, technical advisory, and high-concurrency systems design.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 relative z-10">
              {email && (
                <button
                  onClick={() => copyToClipboard(email, "main-email")}
                  className="px-6 py-3 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition cursor-pointer flex items-center gap-2 shadow-xl"
                >
                  {copiedKey === "main-email" ? <Check size={14} /> : <Mail size={14} />}
                  <span>{copiedKey === "main-email" ? "Email Copied!" : `Email ${email}`}</span>
                </button>
              )}
              {github && (
                <a
                  href={github.startsWith("http") ? github : `https://${github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium text-xs hover:bg-white/10 transition flex items-center gap-2"
                >
                  <FaGithub size={14} />
                  <span>GitHub Profile</span>
                </a>
              )}
              {linkedin && (
                <a
                  href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium text-xs hover:bg-white/10 transition flex items-center gap-2"
                >
                  <FaLinkedin size={14} />
                  <span>LinkedIn Profile</span>
                </a>
              )}
            </div>
          </section>
        </ScrollReveal>
      </main>

      {/* CUPERTINO FLOATING DOCK BAR (Bottom Center) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2 p-2 rounded-full bg-zinc-900/85 backdrop-blur-2xl border border-white/15 shadow-2xl"
        >
          {[
            { icon: Compass, label: "Top", href: "#" },
            { icon: Layers, label: "Skills", href: "#skills" },
            { icon: Briefcase, label: "Work", href: "#work" },
            { icon: Mail, label: "Contact", href: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email || "")}`, isExternal: true },
          ].map((item, idx) => (
            <motion.a
              key={idx}
              href={item.href}
              target={item.isExternal ? "_blank" : undefined}
              rel={item.isExternal ? "noreferrer" : undefined}
              whileHover={{ scale: 1.3, y: -6 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors shadow"
              title={item.label}
            >
              <item.icon size={17} />
            </motion.a>
          ))}
        </motion.div>
      </div>

      <ProjectDeepDiveModal
        project={inspectedProject}
        onClose={() => setInspectedProject(null)}
        accentColor="#38bdf8"
      />
    </div>
  );
};

export default AppleInspiredTemplate;
