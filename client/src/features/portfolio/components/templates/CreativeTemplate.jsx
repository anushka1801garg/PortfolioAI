import { useState } from "react";
import {
  Globe,
  Mail,
  Phone,
  ExternalLink,
  Code2,
  Terminal,
  Zap,
  Award,
  ShieldCheck,
  BookOpen,
  ArrowUpRight,
  Sparkles,
  Music,
  Radio,
  Sliders,
  Camera,
  Layers,
  Check,
  Copy,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  SpotlightCard,
  TiltCard,
  GlowCard,
  ShimmerText,
  MagneticButton,
  MagneticPill,
  HoloBadge,
  PulseAura,
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  ProjectDeepDiveModal,
  Perspective3DCard,
  InteractiveCursorFollower,
  KineticMarquee,
  DynamicSoundwaveVisualizer,
  KineticWordReveal,
  BioluminescentOrbsCanvas,
  ExperienceCredentialsBadges,
} from "./motionComponents";

const NEON_PALETTES = {
  CYAN: {
    accent: "#06b6d4",
    glow: "rgba(6, 182, 212, 0.45)",
    tag: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
    button: "bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/30",
    borderGlow: "from-cyan-500 via-blue-500 to-indigo-500",
  },
  MAGENTA: {
    accent: "#ec4899",
    glow: "rgba(236, 72, 153, 0.45)",
    tag: "text-pink-400 border-pink-500/40 bg-pink-500/10",
    button: "bg-pink-500 hover:bg-pink-400 text-white shadow-pink-500/30",
    borderGlow: "from-pink-500 via-purple-500 to-rose-500",
  },
  LIME: {
    accent: "#84cc16",
    glow: "rgba(132, 204, 22, 0.45)",
    tag: "text-lime-400 border-lime-500/40 bg-lime-500/10",
    button: "bg-lime-500 hover:bg-lime-400 text-black shadow-lime-500/30",
    borderGlow: "from-lime-400 via-emerald-500 to-teal-500",
  },
};

const CreativeTemplate = ({ portfolio, onEditPhoto, isOwner }) => {
  const {
    name = "Developer",
    tagline = "Innovator & Creative Systems Engineer",
    about = "",
    skills = [],
    projects = [],
    experience = [],
    education = [],
    achievements = [],
    certifications = [],
    blog = [],
    github,
    linkedin,
    website,
    email,
    phone,
    title,
  } = portfolio || {};

  const avatar = portfolio?.avatar || portfolio?.hero?.avatar || "";
  const displayName = name || title || "Creator";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [activePalette, setActivePalette] = useState("CYAN");
  const [equalizerActive, setEqualizerActive] = useState(true);
  const [inspectedProject, setInspectedProject] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const palette = NEON_PALETTES[activePalette];

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied: ${text} ✨`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black relative overflow-x-hidden pb-32">
      {/* Interactive Bioluminescent Orbs Background Canvas */}
      <BioluminescentOrbsCanvas
        colorPalette={[palette.accent, "#ec4899", "#8b5cf6", "#06b6d4"]}
        orbCount={20}
        opacity={0.3}
      />

      {/* Dynamic ambient glow orbs with framer-motion continuous drift */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: palette.glow }}
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="fixed bottom-1/4 left-10 w-[550px] h-[550px] bg-purple-600/15 rounded-full blur-[150px] pointer-events-none"
      />
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
      <InteractiveCursorFollower color={palette.glow} size={520} blur={100} />

      {/* Top Creative Synthwave Control Bar with Interactive Equalizer */}
      <header className="sticky top-0 z-40 bg-[#060913]/90 backdrop-blur-xl border-b border-zinc-800/80 px-6 py-2.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Animated Equalizer Bars with Interactive Frequency Toggle */}
          <div
            onClick={() => setEqualizerActive(!equalizerActive)}
            className="flex items-center gap-2 cursor-pointer group select-none"
            title="Click to toggle audio visualizer"
          >
            <Radio size={13} className="animate-pulse" style={{ color: palette.accent }} />
            <span className="font-mono text-zinc-400 text-[11px] uppercase font-bold tracking-wider group-hover:text-white transition">
              SYNTHWAVE FREQUENCY //
            </span>
            <DynamicSoundwaveVisualizer
              barCount={14}
              color="rounded-full shadow-sm"
              className="h-4"
              isActive={equalizerActive}
            />
          </div>

          {/* Live Neon Palette Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-[11px] font-mono hidden sm:inline">NEON THEME:</span>
            {Object.keys(NEON_PALETTES).map((pKey) => (
              <motion.button
                key={pKey}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setActivePalette(pKey);
                  toast(`Neon palette shifted to ${pKey}! ✨`);
                }}
                className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                  activePalette === pKey ? "scale-125 border-white shadow-lg" : "border-transparent opacity-60"
                }`}
                style={{ backgroundColor: NEON_PALETTES[pKey].accent }}
                title={`Switch to ${pKey} glow`}
              />
            ))}
          </div>
        </div>
      </header>

      <div className="relative max-w-6xl mx-auto px-6 py-16 space-y-28">
        {/* Creative Hero Section with 3D Tilt and Avatar Transformation */}
        <ScrollReveal direction="up" immediate={true}>
          <section id="hero" data-section="about" className="space-y-8 pt-4 scroll-mt-24">
            <div className="flex flex-wrap items-center gap-3">
              <HoloBadge icon={Sparkles}>
                CREATIVE MULTI-DISCIPLINARY STUDIO
              </HoloBadge>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>ONLINE & AVAILABLE</span>
              </motion.div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12">
              {/* Photo on the Left with 3D Tilt Card & Pulse Aura */}
              <div className="shrink-0 flex flex-col items-center gap-3">
                <TiltCard maxTilt={14}>
                  <PulseAura glowGradient={palette.borderGlow}>
                    <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl p-1 bg-gradient-to-tr from-cyan-500 via-fuchsia-500 to-emerald-400 shadow-2xl shadow-cyan-500/20 group">
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
                            className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer text-white backdrop-blur-xs z-30"
                          >
                            <Camera size={26} className="text-white drop-shadow" />
                            <span className="text-[11px] font-bold uppercase tracking-wider bg-cyan-600 px-3 py-0.5 rounded-full shadow">
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
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 text-[11px] font-semibold text-zinc-300 hover:text-white transition cursor-pointer shadow-sm"
                  >
                    <Camera size={12} className="text-cyan-400" />
                    <span>Change Photo</span>
                  </button>
                )}
              </div>

              {/* Details on the Right */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
                  Hi, I&apos;m{" "}
                  <ShimmerText
                    gradient={
                      activePalette === "CYAN"
                        ? "from-cyan-400 via-teal-300 to-indigo-400"
                        : activePalette === "MAGENTA"
                        ? "from-pink-400 via-purple-300 to-rose-400"
                        : "from-lime-400 via-emerald-300 to-cyan-400"
                    }
                  >
                    {displayName}
                  </ShimmerText>
                </h1>

                <p
                  className="text-xl sm:text-2xl font-bold tracking-tight transition-colors duration-300"
                  style={{ color: palette.accent }}
                >
                  {tagline}
                </p>

                {about && (
                  <p className="max-w-2xl text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
                    {about}
                  </p>
                )}

                {/* Magnetic Interactive Action Links */}
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 pt-3">
                  {email && (
                    <MagneticButton>
                      <button
                        onClick={() => handleCopy(email, "email")}
                        className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition shadow-xl flex items-center gap-2 cursor-pointer ${palette.button}`}
                      >
                        {copiedKey === "email" ? <Check size={14} /> : <Mail size={14} />}
                        <span>{copiedKey === "email" ? "Email Copied!" : "Start Collaboration"}</span>
                      </button>
                    </MagneticButton>
                  )}

                  {github && (
                    <MagneticButton
                      href={github.startsWith("http") ? github : `https://${github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-3 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 text-zinc-200 text-xs font-semibold hover:text-white hover:border-cyan-400/50 transition flex items-center gap-2 shadow-lg"
                    >
                      <FaGithub size={15} />
                      <span>GitHub Repos</span>
                    </MagneticButton>
                  )}

                  {linkedin && (
                    <MagneticButton
                      href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-3 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 text-zinc-200 text-xs font-semibold hover:text-white hover:border-cyan-400/50 transition flex items-center gap-2 shadow-lg"
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
                      className="px-5 py-3 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 text-zinc-200 text-xs font-semibold hover:text-white hover:border-cyan-400/50 transition flex items-center gap-2 shadow-lg"
                    >
                      <Globe size={15} />
                      <span>Website</span>
                    </MagneticButton>
                  )}
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Dynamic Interactive Stats Banner with Spotlight Cards */}
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Production Builds", val: `${projects.length}+`, icon: Zap },
              { label: "Technologies", val: `${skills.length}+`, icon: Code2 },
              { label: "Delivery Speed", val: "10x", icon: Sparkles },
              { label: "Creative Aura", val: "100%", icon: Sliders },
            ].map((stat, i) => (
              <SpotlightCard
                key={i}
                spotlightColor={palette.glow}
                className="p-5 text-center space-y-1.5"
              >
                <div
                  className="text-3xl font-black font-mono tracking-tight"
                  style={{ color: palette.accent }}
                >
                  {stat.val}
                </div>
                <div className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                  <stat.icon size={13} style={{ color: palette.accent }} />
                  <span>{stat.label}</span>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </ScrollReveal>

        {/* Kinetic Neon Marquee Ticker */}
        {skills?.length > 0 && (
          <div className="py-2 -mx-6 sm:-mx-12 overflow-hidden border-y border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md">
            <KineticMarquee
              items={skills}
              speed={28}
              renderItem={(skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono font-bold text-zinc-200 shadow-sm transition hover:border-cyan-400/60"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: palette.accent }} />
                  <span>{skill}</span>
                </span>
              )}
            />
          </div>
        )}

        {/* Skills Tag Cloud with Spring Magnetic Pills */}
        {skills?.length > 0 && (
          <ScrollReveal delay={0.15}>
            <section id="skills" data-section="skills" className="space-y-4 scroll-mt-24">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h2 className="text-xs uppercase tracking-widest text-zinc-400 font-mono font-bold flex items-center gap-2">
                  <Terminal size={14} style={{ color: palette.accent }} />
                  <span>// CREATIVE TOOLKIT &amp; TECHNOLOGIES</span>
                </h2>
                <span className="text-xs text-zinc-500 font-mono">{skills.length} MODULES</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {skills.map((skill, idx) => (
                  <MagneticPill
                    key={idx}
                    className="bg-zinc-900/90 border border-zinc-800 text-zinc-200 hover:border-cyan-400/60 hover:text-white"
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: palette.accent }} />
                    <span>{skill}</span>
                  </MagneticPill>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Projects Grid with 3D GlowCards & Deep-Dive Modals */}
        {projects?.length > 0 && (
          <ScrollReveal delay={0.2}>
            <section id="projects" data-section="projects" className="space-y-6 scroll-mt-24">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="space-y-1">
                  <h2 className="text-xs uppercase tracking-widest text-zinc-400 font-mono font-bold flex items-center gap-2">
                    <Sparkles size={14} style={{ color: palette.accent }} />
                    <span>// SHOWCASED CREATIONS &amp; BUILDS</span>
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Click any artifact for high-profile architectural breakdown
                  </p>
                </div>
                <span className="text-xs text-zinc-500 font-mono">
                  {projects.length} EXHIBITS
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((proj, idx) => (
                  <Perspective3DCard
                    key={idx}
                    maxTilt={10}
                    glareColor={palette.glow}
                    glowBorderColor={palette.accent}
                    onClick={() => setInspectedProject(proj)}
                    className="h-full"
                  >
                    <GlowCard
                      glowColor={palette.borderGlow}
                      className="h-full flex flex-col justify-between"
                    >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider font-bold">
                          EXHIBIT 0{idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-white transition flex items-center gap-1">
                            Inspect Case Study <ArrowUpRight size={12} />
                          </span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-black text-white group-hover:text-cyan-300 transition-colors">
                        {proj.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light line-clamp-3">
                        {proj.description}
                      </p>

                      {proj.impact && (
                        <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 text-xs font-semibold flex items-center gap-2">
                          <Zap size={13} style={{ color: palette.accent }} />
                          <span style={{ color: palette.accent }}>{proj.impact}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pt-5 mt-4 border-t border-zinc-800/80">
                      {proj.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {proj.tags.map((t, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-800/90 text-zinc-300 border border-zinc-700/50 font-mono"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        {proj.github && (
                          <a
                            href={proj.github.startsWith("http") ? proj.github : `https://${proj.github}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-semibold text-zinc-400 hover:text-white transition flex items-center gap-1.5"
                          >
                            <FaGithub size={14} />
                            <span>Source Code</span>
                          </a>
                        )}

                        {proj.live && (
                          <a
                            href={proj.live.startsWith("http") ? proj.live : `https://${proj.live}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-md ml-auto"
                            style={{
                              backgroundColor: `${palette.accent}20`,
                              color: palette.accent,
                              border: `1px solid ${palette.accent}60`,
                            }}
                          >
                            <span>Live Launch</span>
                            <ArrowUpRight size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                  </GlowCard>
                </Perspective3DCard>
              ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Experience Timeline */}
        {experience?.length > 0 && (
          <ScrollReveal delay={0.2}>
            <section id="experience" data-section="experience" className="space-y-4 scroll-mt-24">
              <h2 className="text-xs uppercase tracking-widest text-zinc-400 font-mono font-bold border-b border-zinc-800 pb-2 flex items-center gap-2">
                <Layers size={14} style={{ color: palette.accent }} />
                <span>// PRODUCTION MILESTONES &amp; JOURNEY</span>
              </h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ x: 6 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    className="p-6 sm:p-7 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition space-y-2 shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                      <span className="text-lg font-bold text-white">
                        {exp.role} · <span style={{ color: palette.accent }}>{exp.company}</span>
                      </span>
                      <span className="text-zinc-400 font-mono text-xs font-semibold px-3 py-1 rounded-full bg-zinc-800">
                        {exp.duration}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                      {exp.description}
                    </p>
                    <ExperienceCredentialsBadges exp={exp} />
                  </motion.div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Education & Achievements */}
        {(education?.length > 0 || achievements?.length > 0) && (
          <ScrollReveal delay={0.25}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {education?.length > 0 && (
                <div className="p-7 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <BookOpen size={15} style={{ color: palette.accent }} />
                    <span>Academic Foundation</span>
                  </div>
                  <div className="space-y-3">
                    {education.map((edu, idx) => (
                      <div key={idx} className="text-xs border-b border-zinc-800/80 pb-3 space-y-1">
                        <span className="font-bold text-white text-sm">{edu.institution}</span>
                        <p className="text-zinc-400 font-medium">
                          {edu.degree} · <span className="font-mono text-cyan-300">{edu.year}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {achievements?.length > 0 && (
                <div className="p-7 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <Award size={15} style={{ color: palette.accent }} />
                    <span>Awards &amp; Recognition</span>
                  </div>
                  <div className="space-y-3">
                    {achievements.map((ach, idx) => (
                      <div key={idx} className="text-xs border-b border-zinc-800/80 pb-3 space-y-1">
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

        {/* Synthwave Neon Direct Transmission / Contact Channel */}
        <ScrollReveal delay={0.2}>
          <section
            id="contact"
            data-section="contact"
            className="p-8 sm:p-12 rounded-3xl bg-zinc-900/60 border border-zinc-800 shadow-2xl relative overflow-hidden space-y-6 scroll-mt-24"
          >
            <div
              className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[90px] pointer-events-none opacity-40"
              style={{ background: palette.borderGlow }}
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4 relative z-10">
              <div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase" style={{ color: palette.accent }}>
                  // DIRECT TRANSMISSION SOCKET
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Initiate Creative Engagement
                </h3>
              </div>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                CHANNELS ACTIVE
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 relative z-10">
              {email && (
                <MagneticButton>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(email);
                      toast.success("Email copied to buffer! 📋");
                    }}
                    className="px-6 py-3 rounded-2xl text-white font-bold text-xs uppercase tracking-wider transition shadow-lg cursor-pointer flex items-center gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${palette.accent}, #ec4899)`,
                    }}
                  >
                    <Mail size={15} />
                    <span>Copy Direct Socket ({email})</span>
                  </button>
                </MagneticButton>
              )}
              {github && (
                <a
                  href={github.startsWith("http") ? github : `https://${github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-2xl border border-zinc-700 bg-zinc-800/80 text-white hover:border-cyan-400 text-xs font-bold transition flex items-center gap-2"
                >
                  <FaGithub size={14} />
                  <span>GitHub Studio</span>
                </a>
              )}
              {linkedin && (
                <a
                  href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-2xl border border-zinc-700 bg-zinc-800/80 text-white hover:border-cyan-400 text-xs font-bold transition flex items-center gap-2"
                >
                  <FaLinkedin size={14} />
                  <span>LinkedIn Profile</span>
                </a>
              )}
            </div>
          </section>
        </ScrollReveal>
      </div>

      {/* Case Study Project Modal */}
      {inspectedProject && (
        <ProjectDeepDiveModal
          project={inspectedProject}
          onClose={() => setInspectedProject(null)}
          accentColor={palette.accent}
        />
      )}
    </div>
  );
};

export default CreativeTemplate;
