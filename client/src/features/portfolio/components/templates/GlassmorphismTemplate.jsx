import { useState } from "react";
import {
  Sparkles,
  ExternalLink,
  Mail,
  ArrowUpRight,
  Award,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Briefcase,
  Phone,
  Globe,
  Layers,
  Eye,
  Camera,
  Check,
  Copy,
  Zap,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  SpotlightCard,
  TiltCard,
  ShimmerText,
  MagneticButton,
  MagneticPill,
  ScrollReveal,
  PulseAura,
  ProjectDeepDiveModal,
  PrismaticLiquidCanvas,
  ExperienceCredentialsBadges,
} from "./motionComponents";

const GlassmorphismTemplate = ({ portfolio, onEditPhoto, isOwner }) => {
  const {
    name = "Developer",
    tagline = "Full Stack Engineer & Interface Architect",
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
    phone = contact?.phone,
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

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [blurMode, setBlurMode] = useState("ULTRA"); // "ULTRA" | "CRISP"
  const [inspectedProject, setInspectedProject] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied: ${text} 💎`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#060714] text-white font-sans relative overflow-x-hidden selection:bg-purple-500/40 selection:text-white pb-32">
      {/* Interactive Prismatic Liquid Glass Bubbles Canvas */}
      <PrismaticLiquidCanvas bubbleCount={22} opacity={0.28} />

      {/* Dynamic drifting iridescent light leaks with framer-motion */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ repeat: Infinity, duration: 16, ease: "easeInOut" }}
        className="fixed top-[-10%] left-[-10%] w-[680px] h-[680px] rounded-full bg-violet-600/25 blur-[160px] pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, -60, 0],
          y: [0, 50, 0],
          scale: [1, 1.25, 1],
        }}
        transition={{ repeat: Infinity, duration: 20, ease: "easeInOut", delay: 2 }}
        className="fixed bottom-[-10%] right-[-10%] w-[680px] h-[680px] rounded-full bg-indigo-600/25 blur-[160px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
        className="fixed top-[40%] left-[30%] w-[500px] h-[500px] rounded-full bg-fuchsia-600/20 blur-[170px] pointer-events-none"
      />

      {/* Top Glassmorphic Navigation Bar */}
      <header className="sticky top-4 z-40 max-w-4xl mx-auto px-4">
        <div className="rounded-full bg-white/[0.07] border border-white/20 backdrop-blur-2xl px-6 py-2.5 shadow-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-purple-400 animate-spin" />
            <span className="font-bold text-white tracking-wide font-mono">
              {displayName.toUpperCase()} // PURE GLASS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextMode = blurMode === "ULTRA" ? "CRISP" : "ULTRA";
                setBlurMode(nextMode);
                toast(`Glass blur calibrated to ${nextMode}! 💎`);
              }}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 shadow"
            >
              <Eye size={12} className="text-purple-300" />
              <span>{blurMode === "ULTRA" ? "Ultra Frosted" : "Crisp Glass"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-6 pt-12 space-y-28">
        {/* Glass Hero Section with 3D Tilt & Specular Refraction */}
        <ScrollReveal direction="up" immediate={true}>
          <motion.section
            id="hero"
            data-section="hero"
            onMouseMove={handleMouseMove}
            className={`rounded-3xl border border-white/20 p-8 sm:p-14 shadow-2xl space-y-6 text-center relative overflow-hidden transition-all duration-500 scroll-mt-24 ${
              blurMode === "ULTRA"
                ? "bg-white/[0.05] backdrop-blur-3xl"
                : "bg-white/[0.09] backdrop-blur-md"
            }`}
          >
            {/* Mouse follow specular shimmer */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle 380px at ${mousePos.x}px ${mousePos.y}px, rgba(168, 85, 247, 0.25), transparent 80%)`,
              }}
            />

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.1] border border-white/20 text-xs font-semibold text-purple-200 shadow-inner">
              <Sparkles size={13} className="text-purple-300" />
              <span>Refractive Multi-Layer Acrylic 2026</span>
            </div>

            <div className="flex flex-col items-center justify-center gap-5 sm:gap-6">
              {/* Avatar with TiltCard & PulseAura */}
              <TiltCard maxTilt={15}>
                <PulseAura glowGradient="from-violet-500 via-fuchsia-500 to-indigo-500">
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1 bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-indigo-500 shadow-2xl shadow-purple-500/30 group">
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
                          className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer text-white backdrop-blur-xs z-30"
                        >
                          <Camera size={26} className="text-purple-300 drop-shadow" />
                          <span className="text-[11px] font-bold uppercase tracking-wider bg-purple-600 px-3 py-0.5 rounded-full shadow">
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
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-semibold text-purple-200 transition cursor-pointer shadow-sm"
                >
                  <Camera size={12} className="text-purple-400" />
                  <span>Change Photo</span>
                </button>
              )}

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white drop-shadow-lg">
                <ShimmerText gradient="from-purple-300 via-pink-200 to-cyan-300">
                  {displayName}
                </ShimmerText>
              </h1>
            </div>

            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-purple-100/90 font-light leading-relaxed">
              {tagline}
            </p>

            {about && (
              <p className="max-w-3xl mx-auto text-sm sm:text-base text-zinc-300 font-light leading-relaxed border-t border-white/10 pt-4">
                {about}
              </p>
            )}

            {/* Frosted Magnetic Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              {email && (
                <MagneticButton>
                  <button
                    onClick={() => handleCopy(email, "glass-email")}
                    className="px-6 py-3 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold text-xs tracking-wider transition shadow-xl backdrop-blur-xl flex items-center gap-2 cursor-pointer"
                  >
                    {copiedKey === "glass-email" ? <Check size={14} className="text-emerald-300" /> : <Mail size={14} />}
                    <span>{copiedKey === "glass-email" ? "Email Copied!" : "Transmit Email"}</span>
                  </button>
                </MagneticButton>
              )}

              {github && (
                <MagneticButton
                  href={github.startsWith("http") ? github : `https://${github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/20 text-zinc-200 text-xs font-semibold transition backdrop-blur-lg flex items-center gap-2 shadow"
                >
                  <FaGithub size={14} />
                  <span>GitHub Repos</span>
                </MagneticButton>
              )}

              {linkedin && (
                <MagneticButton
                  href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/20 text-zinc-200 text-xs font-semibold transition backdrop-blur-lg flex items-center gap-2 shadow"
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
                  className="px-5 py-3 rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/20 text-zinc-200 text-xs font-semibold transition backdrop-blur-lg flex items-center gap-2 shadow"
                >
                  <Globe size={14} />
                  <span>Website</span>
                </MagneticButton>
              )}
            </div>
          </motion.section>
        </ScrollReveal>

        {/* Enthusiastic Frosted Acrylic Stats Ribbon */}
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { val: `${projects.length}+`, label: "Showcased Builds", sub: "Production Deployed" },
              { val: `${skills.length}+`, label: "Glass Stack", sub: "Mastered Systems" },
              { val: "100%", label: "Visual Fidelity", sub: "Sub-pixel Precision" },
              { val: "24/7", label: "Active Availability", sub: "Open for Contracts" },
            ].map((stat, i) => (
              <SpotlightCard
                key={i}
                spotlightColor="rgba(192, 132, 252, 0.2)"
                borderColor="rgba(216, 180, 254, 0.4)"
                className="p-5 text-center space-y-1 bg-white/[0.04] border-white/15 backdrop-blur-2xl"
              >
                <div className="text-3xl font-black text-purple-300 font-mono tracking-tight">
                  {stat.val}
                </div>
                <div className="text-xs font-bold text-white">{stat.label}</div>
                <div className="text-[10px] text-zinc-400 font-mono">{stat.sub}</div>
              </SpotlightCard>
            ))}
          </div>
        </ScrollReveal>

        {/* Skills with Spring Magnetic Pills */}
        {skills?.length > 0 && (
          <ScrollReveal delay={0.15}>
            <section id="skills" data-section="skills" className="space-y-4 scroll-mt-24">
              <h2 className="text-xs uppercase tracking-widest text-purple-300 font-mono font-bold text-center">
                // TRANSLUCENT COMPONENT STACK ({skills.length})
              </h2>
              <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
                {skills.map((skill, idx) => (
                  <MagneticPill
                    key={idx}
                    className="bg-white/[0.06] border border-white/15 text-purple-100 hover:border-purple-400/60 hover:text-white backdrop-blur-xl shadow-md"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>{skill}</span>
                  </MagneticPill>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Projects with Frosted SpotlightCards & Deep-Dive Modals */}
        {projects?.length > 0 && (
          <ScrollReveal delay={0.2}>
            <section id="projects" data-section="projects" className="space-y-6 scroll-mt-24">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="space-y-1">
                  <h2 className="text-xs uppercase tracking-widest text-purple-300 font-mono font-bold flex items-center gap-2">
                    <Sparkles size={14} className="text-purple-400" />
                    <span>// SHOWCASE BUILDS &amp; ARCHITECTURE ({projects.length})</span>
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Click any artifact for deep architectural case study
                  </p>
                </div>
                <span className="text-xs text-purple-300 font-mono">
                  {projects.length} ARTIFACTS
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((proj, idx) => (
                  <SpotlightCard
                    key={idx}
                    spotlightColor="rgba(192, 132, 252, 0.2)"
                    borderColor="rgba(216, 180, 254, 0.45)"
                    onClick={() => setInspectedProject(proj)}
                    className="p-7 bg-white/[0.04] border-white/15 backdrop-blur-2xl flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-purple-300 font-bold">
                          Artifact 0{idx + 1}
                        </span>
                        <span className="text-[11px] font-semibold text-purple-300 flex items-center gap-1">
                          <span>Inspect</span>
                          <ArrowUpRight size={12} />
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                        {proj.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light line-clamp-3">
                        {proj.description}
                      </p>

                      {proj.impact && (
                        <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 text-xs text-purple-200 font-medium flex items-center gap-2">
                          <Zap size={13} className="text-purple-300" />
                          <span>{proj.impact}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pt-5 mt-4 border-t border-white/10">
                      {proj.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {proj.tags.map((t, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.08] text-purple-200 border border-white/10 font-mono"
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
                            className="text-xs font-semibold text-zinc-300 hover:text-white transition flex items-center gap-1.5"
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
                            className="px-3.5 py-1.5 rounded-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 shadow ml-auto"
                          >
                            <span>Live Site</span>
                            <ArrowUpRight size={13} />
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
              <h2 className="text-xs uppercase tracking-widest text-purple-300 font-mono font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                <Layers size={14} className="text-purple-400" />
                <span>// CAREER &amp; EXPERIENCE TIMELINE</span>
              </h2>
              <div className="space-y-3">
                {experience.map((exp, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ x: 6 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    className="p-6 sm:p-7 rounded-3xl bg-white/[0.04] border border-white/15 backdrop-blur-2xl space-y-2 shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                      <span className="font-bold text-lg text-white">
                        {exp.role} · <span className="text-purple-300">{exp.company}</span>
                      </span>
                      <span className="text-zinc-300 font-mono text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10">
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
                <div className="p-7 rounded-3xl bg-white/[0.04] border border-white/15 backdrop-blur-2xl space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
                    <GraduationCap size={15} />
                    <span>Academic Foundation</span>
                  </div>
                  <div className="space-y-3">
                    {education.map((edu, idx) => (
                      <div key={idx} className="text-xs border-b border-white/10 pb-3 space-y-1">
                        <span className="font-bold text-white text-sm">{edu.institution}</span>
                        <p className="text-zinc-300">
                          {edu.degree} · <span className="font-mono text-purple-300">{edu.year}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {achievements?.length > 0 && (
                <div className="p-7 rounded-3xl bg-white/[0.04] border border-white/15 backdrop-blur-2xl space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
                    <Award size={15} />
                    <span>Recognition &amp; Honors</span>
                  </div>
                  <div className="space-y-3">
                    {achievements.map((ach, idx) => (
                      <div key={idx} className="text-xs border-b border-white/10 pb-3 space-y-1">
                        <span className="font-bold text-white text-sm">{ach.title}</span>
                        <p className="text-zinc-300">{ach.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Pure Acrylic Direct Communication Section */}
        <ScrollReveal delay={0.25}>
          <section id="contact" data-section="contact" className="p-8 sm:p-12 rounded-3xl bg-white/[0.05] border border-white/20 backdrop-blur-3xl space-y-6 text-center shadow-2xl relative overflow-hidden scroll-mt-24">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/15 text-xs font-semibold text-purple-200 shadow-inner">
              <Sparkles size={13} className="text-purple-300" />
              <span>DIRECT DISPATCH &amp; CONNECTION // 2026</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Let&apos;s Connect</h2>
            <p className="text-zinc-300 text-sm max-w-xl mx-auto">
              Ready to collaborate on modern web architectures, Web3 experiences, and high-performance frontend products.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {email && (
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-7 py-3 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-xs tracking-wider transition shadow-xl shadow-purple-600/30 flex items-center gap-2"
                >
                  <Mail size={14} />
                  <span>Send Direct Email</span>
                </a>
              )}
              {linkedin && (
                <a
                  href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-zinc-200 text-xs font-semibold transition flex items-center gap-2"
                >
                  <FaLinkedin size={14} />
                  <span>LinkedIn Profile</span>
                </a>
              )}
              {github && (
                <a
                  href={github.startsWith("http") ? github : `https://${github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-zinc-200 text-xs font-semibold transition flex items-center gap-2"
                >
                  <FaGithub size={14} />
                  <span>GitHub Repos</span>
                </a>
              )}
            </div>
          </section>
        </ScrollReveal>
      </main>

      {/* Case Study Project Modal */}
      {inspectedProject && (
        <ProjectDeepDiveModal
          project={inspectedProject}
          onClose={() => setInspectedProject(null)}
          accentColor="#a855f7"
        />
      )}
    </div>
  );
};

export default GlassmorphismTemplate;
