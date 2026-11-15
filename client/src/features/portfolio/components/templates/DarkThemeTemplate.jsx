import { useState, useEffect } from "react";
import {
  Mail,
  ArrowUpRight,
  Award,
  GraduationCap,
  Code,
  Layers,
  Copy,
  Check,
  Terminal,
  Camera,
  Cpu,
  Zap,
  Activity,
  Globe,
  Lock,
} from 'lucide-react';
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { motion } from 'framer-motion';
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
  WarpStarfieldCanvas,
  ExperienceCredentialsBadges,
} from "./motionComponents";

const DarkThemeTemplate = ({ portfolio, onEditPhoto, isOwner }) => {
  const {
    name = "Developer",
    tagline = "Systems & Cloud Infrastructure Engineer",
    about = "",
    skills = [],
    projects = [],
    experience = [],
    education = [],
    achievements = [],
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

  const [rawViewMode, setRawViewMode] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [inspectedProject, setInspectedProject] = useState(null);
  const [cpuUsage, setCpuUsage] = useState(12);

  useEffect(() => {
    const timer = setInterval(() => {
      setCpuUsage(Math.floor(9 + Math.random() * 15));
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied: ${text} 🛡️`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const rawMarkdown = `# ${displayName}
> ${tagline}

## Overview
${about || "High-concurrency systems engineer."}

## Technical Stack
${skills.map((s) => `- ${s}`).join("\n")}

## Repositories & Builds
${projects.map((p) => `### ${p.title}\n${p.description}\nImpact: ${p.impact || "N/A"}`).join("\n\n")}
`;

  return (
    <div className="min-h-screen bg-[#020408] text-[#eaeaea] font-sans selection:bg-emerald-500/30 selection:text-white relative pb-32 overflow-x-hidden">
      {/* Interactive 3D Warp Starfield & Shooting Stars Canvas */}
      <WarpStarfieldCanvas starCount={160} accentColor="#10b981" speed={0.7} opacity={0.3} />

      {/* Animated laser emerald hairline boundary */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent z-50 animate-pulse" />

      {/* Background Stealth Matrix Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.035] bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-500/[0.04] rounded-full blur-[170px] pointer-events-none" />

      {/* Top Stealth Toolbar */}
      <header className="sticky top-0 z-40 bg-[#020408]/90 backdrop-blur-xl border-b border-zinc-900/90 px-6 py-3">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-300 font-bold uppercase tracking-widest text-[11px]">
              OLED STEALTH ENGINE // {displayName.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-zinc-500">
              <Activity size={12} className="text-emerald-400 animate-pulse" />
              <span>TELEMETRY: {cpuUsage}% LOAD</span>
            </div>
            <button
              onClick={() => {
                setRawViewMode(!rawViewMode);
                toast(`View mode: ${!rawViewMode ? "RAW SPECIFICATION" : "OLED INTERFACE"}`);
              }}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                rawViewMode
                  ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-400 shadow-lg shadow-emerald-500/10"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <Code size={12} />
              <span>{rawViewMode ? "GUI VIEW" : "RAW SPEC"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-24">
        {/* Raw Markdown Mode */}
        {rawViewMode ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 text-zinc-500">
              <span className="text-emerald-400">spec_manifest.md</span>
              <button
                onClick={() => copyToClipboard(rawMarkdown, "markdown")}
                className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                {copiedKey === "markdown" ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedKey === "markdown" ? "Copied" : "Copy Markdown"}</span>
              </button>
            </div>
            {rawMarkdown}
          </motion.div>
        ) : (
          <>
            {/* OLED Hero Section with 3D Tilt & Emerald Glow */}
            <ScrollReveal direction="up" immediate={true}>
              <section id="hero" data-section="hero" className="border-b border-zinc-900/90 pb-16 space-y-8 scroll-mt-24">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                  <Lock size={12} className="text-emerald-400" />
                  <span>ZERO-TRUST SECURED INFRASTRUCTURE</span>
                </div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-10">
                  {/* Avatar with TiltCard & PulseAura */}
                  <div className="shrink-0 flex flex-col items-center gap-3">
                    <TiltCard maxTilt={14}>
                      <PulseAura glowGradient="from-emerald-500 via-teal-500 to-cyan-500">
                        <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl p-0.5 bg-gradient-to-tr from-emerald-500 via-teal-500 to-zinc-700 shadow-2xl shadow-emerald-500/20 group">
                          <div className="w-full h-full rounded-[22px] overflow-hidden bg-zinc-950 flex items-center justify-center relative">
                            {avatar ? (
                              <motion.img
                                src={avatar}
                                alt={displayName}
                                whileHover={{ scale: 1.08 }}
                                transition={{ duration: 0.3 }}
                                className="w-full h-full object-cover filter contrast-110"
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
                                <Camera size={26} className="text-emerald-400 drop-shadow" />
                                <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-700 px-3 py-0.5 rounded-full shadow">
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
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 hover:border-emerald-500/60 text-[11px] font-semibold text-zinc-300 hover:text-white transition cursor-pointer shadow-sm"
                      >
                        <Camera size={12} className="text-emerald-400" />
                        <span>Change Photo</span>
                      </button>
                    )}
                  </div>

                  {/* Header Details */}
                  <div className="flex-1 text-center md:text-left space-y-4">
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
                      <ShimmerText gradient="from-emerald-400 via-teal-200 to-cyan-400">
                        {displayName}
                      </ShimmerText>
                    </h1>

                    <p className="text-xl sm:text-2xl text-emerald-400 font-medium">
                      {tagline}
                    </p>

                    {about && (
                      <p className="text-sm sm:text-base text-zinc-300 font-light max-w-2xl leading-relaxed">
                        {about}
                      </p>
                    )}

                    {/* Action Links */}
                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 pt-2">
                      {email && (
                        <MagneticButton>
                          <button
                            onClick={() => copyToClipboard(email, "dark-email")}
                            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs tracking-wider transition cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                          >
                            {copiedKey === "dark-email" ? <Check size={14} /> : <Mail size={14} />}
                            <span>{copiedKey === "dark-email" ? "Direct Socket Copied" : "Copy Direct Socket"}</span>
                          </button>
                        </MagneticButton>
                      )}

                      {github && (
                        <MagneticButton
                          href={github.startsWith("http") ? github : `https://${github}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:border-emerald-500/50 text-xs font-semibold transition flex items-center gap-2"
                        >
                          <FaGithub size={14} className="text-emerald-400" />
                          <span>GitHub Repos</span>
                        </MagneticButton>
                      )}

                      {linkedin && (
                        <MagneticButton
                          href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:border-emerald-500/50 text-xs font-semibold transition flex items-center gap-2"
                        >
                          <FaLinkedin size={14} className="text-emerald-400" />
                          <span>LinkedIn</span>
                        </MagneticButton>
                      )}

                      {website && (
                        <MagneticButton
                          href={website.startsWith("http") ? website : `https://${website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:border-emerald-500/50 text-xs font-semibold transition flex items-center gap-2"
                        >
                          <Globe size={14} className="text-emerald-400" />
                          <span>Website</span>
                        </MagneticButton>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </ScrollReveal>

            {/* Live Telemetry Spotlight Metric Grid */}
            <ScrollReveal delay={0.1}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { metric: "99.99%", label: "System Uptime", sub: "Production SLA" },
                  { metric: `${projects.length}+`, label: "Engineered Builds", sub: "Microservices & APIs" },
                  { metric: "< 1ms", label: "Kernel Latency", sub: "Zero-Overhead Routing" },
                  { metric: `${skills.length}+`, label: "Stack Modules", sub: "Enterprise Architecture" },
                ].map((stat, idx) => (
                  <SpotlightCard
                    key={idx}
                    spotlightColor="rgba(16, 185, 129, 0.15)"
                    borderColor="rgba(16, 185, 129, 0.5)"
                    className="p-5 text-center space-y-1 bg-[#05080c]/80 border-zinc-900"
                  >
                    <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                      {stat.metric}
                    </div>
                    <div className="text-xs font-bold text-white">{stat.label}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{stat.sub}</div>
                  </SpotlightCard>
                ))}
              </div>
            </ScrollReveal>

            {/* Skills: Stack Infrastructure with Spring Magnetic Pills */}
            {skills?.length > 0 && (
              <ScrollReveal delay={0.15}>
                <section id="skills" data-section="skills" className="space-y-4 scroll-mt-24">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-mono font-bold flex items-center gap-2">
                      <Cpu size={14} className="text-emerald-400" />
                      <span>// STACK INFRASTRUCTURE ({skills.length})</span>
                    </h2>
                    <span className="text-xs text-emerald-400 font-mono">STATUS: OPTIMAL</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {skills.map((skill, idx) => (
                      <MagneticPill
                        key={idx}
                        className="bg-[#05080c] border border-zinc-900 text-zinc-300 hover:border-emerald-500/50 hover:text-white"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{skill}</span>
                      </MagneticPill>
                    ))}
                  </div>
                </section>
              </ScrollReveal>
            )}

            {/* Projects with SpotlightCard, 3D Hover & Case Study Inspection */}
            {projects?.length > 0 && (
              <ScrollReveal delay={0.2}>
                <section id="projects" data-section="projects" className="space-y-6 scroll-mt-24">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                    <div className="space-y-1">
                      <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-mono font-bold flex items-center gap-2">
                        <Terminal size={14} className="text-emerald-400" />
                        <span>// PRODUCTION SYSTEMS &amp; BUILDS ({projects.length})</span>
                      </h2>
                      <p className="text-xs text-zinc-500">
                        Click any system for deep architectural breakdown
                      </p>
                    </div>
                    <span className="text-xs text-emerald-400 font-mono">HTTP 200 OK</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map((proj, idx) => (
                      <SpotlightCard
                        key={idx}
                        spotlightColor="rgba(16, 185, 129, 0.18)"
                        borderColor="rgba(16, 185, 129, 0.5)"
                        onClick={() => setInspectedProject(proj)}
                        className="p-7 bg-[#05080c]/90 border-zinc-900 hover:border-zinc-700/90 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider font-bold">
                              SYS_0{idx + 1}
                            </span>
                            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                              <span>inspect()</span>
                              <ArrowUpRight size={12} />
                            </span>
                          </div>

                          <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                            {proj.title}
                          </h3>

                          <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed line-clamp-3">
                            {proj.description}
                          </p>

                          {proj.impact && (
                            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-emerald-400 flex items-center gap-2">
                              <Zap size={13} className="text-emerald-400" />
                              <span>metric: {proj.impact}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3 pt-5 mt-4 border-t border-zinc-900">
                          {proj.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {proj.tags.map((t, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] px-2.5 py-0.5 rounded-md bg-zinc-950 text-zinc-400 border border-zinc-800 font-mono"
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
                                className="text-xs font-mono text-zinc-400 hover:text-white transition flex items-center gap-1.5"
                              >
                                <FaGithub size={13} />
                                <span>src/code</span>
                              </a>
                            )}

                            {proj.live && (
                              <a
                                href={proj.live.startsWith("http") ? proj.live : `https://${proj.live}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 text-xs font-mono font-bold transition flex items-center gap-1.5 ml-auto"
                              >
                                <span>execute()</span>
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
                  <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-mono font-bold border-b border-zinc-900 pb-2 flex items-center gap-2">
                    <Layers size={14} className="text-emerald-400" />
                    <span>// OPERATIONAL TIMELINE</span>
                  </h2>
                  <div className="space-y-3">
                    {experience.map((exp, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ x: 6 }}
                        transition={{ type: "spring", stiffness: 350, damping: 20 }}
                        className="p-6 rounded-2xl bg-[#05080c] border border-zinc-900 hover:border-zinc-800 transition space-y-2 shadow-lg"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                          <span className="font-bold text-white text-base">
                            {exp.role} · <span className="text-emerald-400">{exp.company}</span>
                          </span>
                          <span className="text-zinc-500 font-mono text-xs px-2.5 py-1 rounded bg-zinc-950 border border-zinc-900">
                            {exp.duration}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
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
                    <div className="p-6 rounded-2xl bg-[#05080c] border border-zinc-900 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                        <GraduationCap size={15} className="text-emerald-400" />
                        <span>Academic Foundation</span>
                      </div>
                      <div className="space-y-2.5">
                        {education.map((edu, idx) => (
                          <div key={idx} className="text-xs border-b border-zinc-900 pb-2 space-y-0.5">
                            <span className="font-bold text-white">{edu.institution}</span>
                            <p className="text-zinc-400">
                              {edu.degree} · <span className="text-emerald-400 font-mono">{edu.year}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {achievements?.length > 0 && (
                    <div className="p-6 rounded-2xl bg-[#05080c] border border-zinc-900 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                        <Award size={15} className="text-emerald-400" />
                        <span>Security &amp; Engineering Honors</span>
                      </div>
                      <div className="space-y-2.5">
                        {achievements.map((ach, idx) => (
                          <div key={idx} className="text-xs border-b border-zinc-900 pb-2 space-y-0.5">
                            <span className="font-bold text-white">{ach.title}</span>
                            <p className="text-zinc-400">{ach.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            )}

            {/* Encrypted Comms & Connection Section */}
            <ScrollReveal delay={0.25}>
              <section id="contact" data-section="contact" className="p-8 sm:p-12 rounded-2xl bg-[#05080c] border border-zinc-900 space-y-6 shadow-2xl scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>// SECURE TRANSMISSION CHANNEL // 2026</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white">Initialize Communication</h2>
                <p className="text-zinc-400 text-sm max-w-xl font-light">
                  Available for systems engineering, backend infrastructure architecture, zero-trust security consulting, and high-concurrency pipelines.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {email && (
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs tracking-wider transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                    >
                      <Mail size={14} />
                      <span>dispatch_mail({email})</span>
                    </a>
                  )}
                  {linkedin && (
                    <a
                      href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-xs hover:text-white transition flex items-center gap-2"
                    >
                      <FaLinkedin size={14} className="text-emerald-400" />
                      <span>net/linkedin</span>
                    </a>
                  )}
                  {github && (
                    <a
                      href={github.startsWith("http") ? github : `https://${github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-xs hover:text-white transition flex items-center gap-2"
                    >
                      <FaGithub size={14} />
                      <span>git/repositories</span>
                    </a>
                  )}
                </div>
              </section>
            </ScrollReveal>
          </>
        )}

        {/* Footer */}
        <footer className="pt-8 border-t border-zinc-900 text-center text-xs text-zinc-600 font-mono">
          <p>OLED STEALTH ENGINE // SYSTEM READY // ZERO-TRUST VERIFIED</p>
        </footer>
      </main>

      {/* Case Study Project Modal */}
      {inspectedProject && (
        <ProjectDeepDiveModal
          project={inspectedProject}
          onClose={() => setInspectedProject(null)}
          accentColor="#10b981"
        />
      )}
    </div>
  );
};

export default DarkThemeTemplate;
