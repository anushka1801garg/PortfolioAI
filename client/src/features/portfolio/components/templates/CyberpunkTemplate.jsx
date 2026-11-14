import { useState } from "react";
import {
  Cpu,
  ExternalLink,
  Mail,
  Radio,
  Terminal,
  Award,
  ShieldAlert,
  BookOpen,
  ArrowUpRight,
  GraduationCap,
  Zap,
  Volume2,
  VolumeX,
  Crosshair,
  Check,
  Camera,
  Globe,
  Lock,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  TiltCard,
  ShimmerText,
  MagneticButton,
  MagneticPill,
  ScrollReveal,
  PulseAura,
  ProjectDeepDiveModal,
  CyberMatrixRainCanvas,
  ExperienceCredentialsBadges,
} from "./motionComponents";

const CyberpunkTemplate = ({ portfolio, onEditPhoto, isOwner }) => {
  const {
    name = "NETRUNNER",
    tagline = "CYBERNETIC SYSTEMS ARCHITECT",
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
  const github = portfolio?.github || contact?.github;
  const linkedin = portfolio?.linkedin || contact?.linkedin;
  const website = portfolio?.website || contact?.website;
  const avatar = portfolio?.avatar || portfolio?.hero?.avatar || "";
  const displayName = name || title || "NETRUNNER";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hudTarget, setHudTarget] = useState("CORE_CPU");
  const [copiedKey, setCopiedKey] = useState(null);
  const [inspectedProject, setInspectedProject] = useState(null);

  // Web Audio Synthetic Cyberpunk Beep
  const playCyberBeep = (freq = 880, type = "sine") => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // AudioContext not allowed or unsupported
    }
  };

  const copyToClipboard = (text, key) => {
    if (!text) return;
    playCyberBeep(1200, "square");
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    toast.success(`[DATALINK COPIED]: ${text} ⚡`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-[#fcee0a] font-mono selection:bg-[#fcee0a] selection:text-black relative overflow-x-hidden pb-32">
      {/* Interactive Matrix Digital Rain Canvas */}
      <CyberMatrixRainCanvas color="#00ffcc" leadColor="#fcee0a" speed={0.9} opacity={0.24} />

      {/* Background cyber grid */}
      <div className="fixed inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_right,#00ffcc_1px,transparent_1px),linear-gradient(to_bottom,#00ffcc_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="fixed -top-40 right-0 w-[600px] h-[600px] rounded-full bg-[#fcee0a]/[0.03] blur-[160px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-[#ff003c]/[0.04] blur-[160px] pointer-events-none" />

      {/* Cyberpunk Glitch & Scanline HUD bar */}
      <header className="sticky top-0 z-40 bg-[#07090e]/95 border-b-2 border-[#fcee0a] px-6 py-2.5 shadow-[0_0_20px_rgba(252,238,10,0.2)]">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Radio size={14} className="text-[#ff003c] animate-pulse" />
            <span className="text-[#00ffcc] font-black tracking-widest uppercase">
              NIGHT_CITY // NETRUNNER_OS v4.2
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-zinc-500 hidden sm:inline">ICE_STATUS: BREACHED</span>
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playCyberBeep(600);
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#0c1017] border border-[#fcee0a]/60 text-[#fcee0a] hover:bg-[#fcee0a] hover:text-black transition cursor-pointer text-[11px] font-bold"
            >
              {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              <span>{soundEnabled ? "SFX: ON" : "SFX: MUTED"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-24">
        {/* Cyber Hero Section */}
        <ScrollReveal direction="up" immediate={true}>
          <section id="hero" data-section="about" className="border-2 border-[#fcee0a] bg-[#0c1017] p-8 sm:p-12 relative shadow-[0_0_30px_rgba(252,238,10,0.15)] space-y-6 overflow-hidden scroll-mt-24">
            {/* HUD Corner Decorators */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00ffcc] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#ff003c] pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar with 3D Tilt & Cyber Ring */}
              <div className="shrink-0 flex flex-col items-center gap-3">
                <TiltCard maxTilt={15}>
                  <PulseAura glowGradient="from-[#fcee0a] via-[#00ffcc] to-[#ff003c]">
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 border-2 border-[#00ffcc] bg-black p-1 shadow-[0_0_20px_rgba(0,255,204,0.4)] group">
                      <div className="w-full h-full bg-zinc-950 flex items-center justify-center overflow-hidden relative">
                        {avatar ? (
                          <motion.img
                            src={avatar}
                            alt={displayName}
                            whileHover={{ scale: 1.08 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full object-cover filter contrast-125 saturate-125"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              if (e.currentTarget.nextElementSibling) {
                                e.currentTarget.nextElementSibling.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-full items-center justify-center text-4xl sm:text-5xl font-black text-[#fcee0a] ${
                            avatar ? "hidden" : "flex"
                          }`}
                        >
                          {initials}
                        </div>

                        {onEditPhoto && (
                          <button
                            type="button"
                            onClick={onEditPhoto}
                            className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer text-white backdrop-blur-xs z-30"
                          >
                            <Camera size={26} className="text-[#fcee0a] drop-shadow" />
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#00ffcc] text-black px-2.5 py-0.5 shadow">
                              CHANGE_PHOTO
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
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-black border border-[#00ffcc] hover:bg-[#00ffcc] hover:text-black text-[11px] font-bold transition cursor-pointer text-[#00ffcc]"
                  >
                    <Camera size={12} />
                    <span>CHANGE_PHOTO</span>
                  </button>
                )}
              </div>

              {/* Identity & Status */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ff003c]/20 border border-[#ff003c] text-[#ff003c] text-xs font-bold tracking-widest uppercase">
                  <Crosshair size={12} className="animate-spin" />
                  <span>TARGET ACQUIRED: CYBERNETIC OPERATOR</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tight">
                  <ShimmerText gradient="from-[#fcee0a] via-[#00ffcc] to-[#ff003c]">
                    {displayName}
                  </ShimmerText>
                </h1>

                <p className="text-lg sm:text-xl text-[#00ffcc] font-bold tracking-wide">
                  {tagline}
                </p>

                {about && (
                  <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed max-w-2xl">
                    {about}
                  </p>
                )}

                {/* Cyber Action Uplinks */}
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 pt-3">
                  {email && (
                    <MagneticButton>
                      <button
                        onClick={() => copyToClipboard(email, "cyber-email")}
                        className="px-6 py-3 bg-[#fcee0a] hover:bg-white text-black font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(252,238,10,0.5)]"
                      >
                        {copiedKey === "cyber-email" ? <Check size={14} /> : <Mail size={14} />}
                        <span>{copiedKey === "cyber-email" ? "SOCKET CONNECTED" : "ESTABLISH UPLINK"}</span>
                      </button>
                    </MagneticButton>
                  )}

                  {github && (
                    <MagneticButton
                      href={github.startsWith("http") ? github : `https://${github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-3 border border-[#00ffcc] bg-black text-[#00ffcc] hover:bg-[#00ffcc] hover:text-black text-xs font-bold transition flex items-center gap-2"
                    >
                      <FaGithub size={14} />
                      <span>GIT_MAINFRAME</span>
                    </MagneticButton>
                  )}

                  {linkedin && (
                    <MagneticButton
                      href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-3 border border-[#00ffcc] bg-black text-[#00ffcc] hover:bg-[#00ffcc] hover:text-black text-xs font-bold transition flex items-center gap-2"
                    >
                      <FaLinkedin size={14} />
                      <span>LINKEDIN_GRID</span>
                    </MagneticButton>
                  )}

                  {website && (
                    <MagneticButton
                      href={website.startsWith("http") ? website : `https://${website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-3 border border-[#00ffcc] bg-black text-[#00ffcc] hover:bg-[#00ffcc] hover:text-black text-xs font-bold transition flex items-center gap-2"
                    >
                      <Globe size={14} />
                      <span>WEB_INTERFACE</span>
                    </MagneticButton>
                  )}
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Cyberpunk HUD Telemetry Ribbon */}
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { val: "CYBERDECK v9", label: "NEURAL BUS", sub: "THROUGHPUT: 10GB/s", color: "#fcee0a" },
              { val: `${projects.length}+ BUILDS`, label: "CLASSIFIED", sub: "EXPLOITS & EXEs", color: "#00ffcc" },
              { val: "0% FAIL", label: "ICE SHIELD", sub: "IMMUTABLE CORES", color: "#ff003c" },
              { val: `${skills.length}+ MODS`, label: "CYBERWARE", sub: "HARDWARE ENGINES", color: "#fcee0a" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className="p-4 border border-zinc-800 bg-[#0c1017] text-center space-y-1 relative"
              >
                <div className="text-xl sm:text-2xl font-black font-mono" style={{ color: stat.color }}>
                  {stat.val}
                </div>
                <div className="text-[11px] font-bold text-white uppercase">{stat.label}</div>
                <div className="text-[9px] text-zinc-500 font-mono">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* Cyberware Skills Matrix */}
        {skills?.length > 0 && (
          <ScrollReveal delay={0.15}>
            <section id="skills" data-section="skills" className="space-y-4 scroll-mt-24">
              <div className="flex items-center justify-between border-b-2 border-[#00ffcc] pb-2 text-xs text-[#00ffcc] font-black uppercase tracking-widest">
                <span className="flex items-center gap-2">
                  <Cpu size={14} />
                  <span>[01] // CYBERWARE MODULES &amp; TECH MATRIX</span>
                </span>
                <span>SYNAPSE: 100% ONLINE</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {skills.map((skill, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.04, y: -2 }}
                    onClick={() => playCyberBeep(700 + idx * 50)}
                    className="p-3.5 border border-[#00ffcc]/60 bg-[#0c1017] text-xs space-y-1.5 cursor-pointer hover:border-[#fcee0a] hover:bg-[#00ffcc]/10 transition shadow-sm"
                  >
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span>MOD.{idx + 1}</span>
                      <span className="text-[#00ffcc] font-bold">ONLINE</span>
                    </div>
                    <div className="font-bold text-white text-sm uppercase">{skill}</div>
                    <div className="w-full h-1 bg-zinc-800 overflow-hidden rounded-full mt-1">
                      <div
                        className="h-full bg-[#00ffcc]"
                        style={{ width: `${80 + (idx % 20)}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Cyberpunk Projects (Hacks & Deployments) with Case Study Inspection */}
        {projects?.length > 0 && (
          <ScrollReveal delay={0.2}>
            <section id="projects" data-section="projects" className="space-y-6 scroll-mt-24">
              <div className="flex items-center justify-between border-b-2 border-[#ff003c] pb-2 text-xs text-[#ff003c] font-black uppercase tracking-widest">
                <span className="flex items-center gap-2">
                  <Terminal size={14} />
                  <span>[02] // EXECUTED BREACHES &amp; SYSTEM BUILDS ({projects.length})</span>
                </span>
                <span>CLICK ARTIFACT TO DECRYPT</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((proj, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -6, scale: 1.015 }}
                    transition={{ type: "spring", stiffness: 350, damping: 22 }}
                    onClick={() => {
                      playCyberBeep(950);
                      setInspectedProject(proj);
                    }}
                    className="p-7 border-2 border-zinc-800 bg-[#0c1017] hover:border-[#fcee0a] transition-all space-y-4 relative group cursor-pointer flex flex-col justify-between shadow-xl"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                        <span className="text-[#fcee0a] font-bold">SYS.EXE_0{idx + 1}</span>
                        <span className="text-[#00ffcc] flex items-center gap-1 font-bold text-[11px]">
                          <span>DECRYPT_CASE_STUDY</span>
                          <ArrowUpRight size={12} />
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-white group-hover:text-[#fcee0a] uppercase transition-colors">
                        {proj.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed line-clamp-3">
                        {proj.description}
                      </p>

                      {proj.impact && (
                        <div className="p-2.5 bg-[#ff003c]/15 border border-[#ff003c]/40 text-xs text-[#ff003c] font-bold">
                          PAYLOAD_IMPACT: {proj.impact}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-zinc-800">
                      {proj.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {proj.tags.map((t, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2.5 py-0.5 border border-[#00ffcc]/30 text-[#00ffcc] bg-[#00ffcc]/5"
                            >
                              #{t.toUpperCase()}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              playCyberBeep(1100);
                            }}
                            className="text-xs text-zinc-400 hover:text-white transition flex items-center gap-1.5"
                          >
                            <FaGithub size={13} />
                            <span>SOURCE_CODE</span>
                          </a>
                        )}

                        {proj.live && (
                          <a
                            href={proj.live.startsWith("http") ? proj.live : `https://${proj.live}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                              playCyberBeep(1400);
                            }}
                            className="px-3.5 py-1.5 bg-[#00ffcc] text-black font-black text-xs uppercase flex items-center gap-1 hover:bg-[#fcee0a] transition ml-auto"
                          >
                            <span>LIVE_UPLINK</span>
                            <ArrowUpRight size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Experience Cyber Chronology */}
        {experience?.length > 0 && (
          <ScrollReveal delay={0.2}>
            <section id="experience" data-section="experience" className="space-y-4 scroll-mt-24">
              <div className="flex items-center justify-between border-b-2 border-[#fcee0a] pb-2 text-xs text-[#fcee0a] font-black uppercase tracking-widest">
                <span>[03] // SERVICE RECORD &amp; FACTION HISTORY</span>
                <span>VERIFIED CHIP</span>
              </div>

              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ x: 6 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    className="p-6 border border-zinc-800 bg-[#0c1017] space-y-2 relative shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                      <span className="font-bold text-white text-base">
                        {exp.role} @ <span className="text-[#00ffcc]">{exp.company}</span>
                      </span>
                      <span className="text-[#fcee0a] font-mono px-2 py-0.5 border border-[#fcee0a]/30">
                        {exp.duration}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
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
        {(education?.length > 0 || achievements?.length > 0 || certifications?.length > 0) && (
          <ScrollReveal delay={0.25}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {education?.length > 0 && (
                <div className="p-6 border border-[#00ffcc]/50 bg-[#0c1017] space-y-3 shadow-lg">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#00ffcc] uppercase tracking-widest">
                    <GraduationCap size={15} />
                    <span>// ACADEMIC DATA VAULT</span>
                  </div>
                  <div className="space-y-2.5">
                    {education.map((edu, idx) => (
                      <div key={idx} className="text-xs border-b border-zinc-800/80 pb-2 space-y-0.5">
                        <div className="font-bold text-white">{edu.institution}</div>
                        <p className="text-zinc-400 font-sans">
                          {edu.degree} · <span className="text-[#00ffcc] font-mono">{edu.year}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {achievements?.length > 0 && (
                <div className="p-6 border border-[#fcee0a]/50 bg-[#0c1017] space-y-3 shadow-lg">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#fcee0a] uppercase tracking-widest">
                    <Award size={15} />
                    <span>// COMBAT MEDALS &amp; HONORS</span>
                  </div>
                  <div className="space-y-2.5">
                    {achievements.map((ach, idx) => (
                      <div key={idx} className="text-xs border-b border-zinc-800/80 pb-2 space-y-0.5">
                        <div className="font-bold text-white">{ach.title}</div>
                        <p className="text-zinc-400 text-[11px] font-sans">{ach.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Tactical Comms / Contact Socket */}
        <ScrollReveal delay={0.2}>
          <section id="contact" data-section="contact" className="border-2 border-[#FFE600] bg-[#0c1017] p-8 sm:p-12 space-y-6 scroll-mt-24 shadow-[0_0_30px_rgba(255,230,0,0.15)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#FFE600] pb-4">
              <div>
                <span className="text-xs text-[#00ffcc] font-bold uppercase tracking-widest">[04] // SECURE QUANTUM COMMS</span>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  ESTABLISH NEURAL UPLINK
                </h3>
              </div>
              <span className="text-xs text-[#FFE600] font-mono border border-[#FFE600] px-3 py-1 font-bold">
                FREQUENCY: 142.800 MHz // ENCRYPTED
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {email && (
                <button
                  onClick={() => copyToClipboard(email, "footer-email")}
                  className="px-6 py-3 bg-[#FFE600] text-black font-black text-xs uppercase tracking-widest hover:bg-white transition cursor-pointer shadow-[0_0_15px_#FFE600]"
                >
                  {copiedKey === "footer-email" ? "UPLINK KEY COPIED!" : `PING OPERATOR (${email})`}
                </button>
              )}
              {github && (
                <a
                  href={github.startsWith("http") ? github : `https://${github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 border border-[#00ffcc] text-[#00ffcc] hover:bg-[#00ffcc] hover:text-black text-xs font-bold uppercase tracking-wider transition"
                >
                  GITHUB_CIPHER // SRC
                </a>
              )}
              {linkedin && (
                <a
                  href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 border border-[#00ffcc] text-[#00ffcc] hover:bg-[#00ffcc] hover:text-black text-xs font-bold uppercase tracking-wider transition"
                >
                  LINKEDIN_DOSSIER // ACCESS
                </a>
              )}
            </div>
          </section>
        </ScrollReveal>

        {/* Footer */}
        <footer className="pt-8 border-t-2 border-zinc-800 text-center text-xs text-zinc-600 font-mono">
          <p>NETRUNNER TERMINAL // END OF LINE // ALL RIGHTS RESERVED 2077</p>
        </footer>
      </main>

      {/* Case Study Modal */}
      {inspectedProject && (
        <ProjectDeepDiveModal
          project={inspectedProject}
          onClose={() => setInspectedProject(null)}
          accentColor="#00ffcc"
        />
      )}
    </div>
  );
};

export default CyberpunkTemplate;
