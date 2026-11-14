import { useState, useEffect, useRef, useCallback } from "react";
import {
  ExternalLink,
  Mail,
  ArrowUpRight,
  Briefcase,
  GraduationCap,
  Award,
  ShieldCheck,
  BookOpen,
  Sparkles,
  Palette,
  Eye,
  Camera,
  Check,
  Copy,
  Layers,
  Zap,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRight,
  Compass,
  RotateCcw,
  Sliders,
  Maximize2,
  FileText,
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
} from "./motionComponents";

const DESIGNER_PALETTES = {
  ROSE: {
    name: "Rose Atelier",
    accent: "#ec4899",
    glow: "rgba(236, 72, 153, 0.28)",
    tag: "text-rose-400 border-rose-500/30",
    button: "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25",
    gradient: "from-white via-rose-200 to-pink-400",
  },
  AMBER: {
    name: "Amber Gold",
    accent: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.28)",
    tag: "text-amber-400 border-amber-500/30",
    button: "bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/25",
    gradient: "from-white via-amber-200 to-yellow-400",
  },
  MINT: {
    name: "Emerald Sage",
    accent: "#10b981",
    glow: "rgba(16, 185, 129, 0.28)",
    tag: "text-emerald-400 border-emerald-500/30",
    button: "bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/25",
    gradient: "from-white via-emerald-200 to-teal-400",
  },
};

// Zero-dependency sound effect for card transformations
const playCardSwoosh = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(260, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.17);
  } catch {
    // Audio context may be restricted before interaction
  }
};

// Rich 3D Card Animation Variants
const TRANSFORMATION_VARIANTS = {
  // 1. 3D Perspective Flip & Tilt
  flip: {
    enter: (direction) => ({
      rotateY: direction > 0 ? 70 : -70,
      rotateZ: direction > 0 ? 5 : -5,
      x: direction > 0 ? 110 : -110,
      scale: 0.88,
      opacity: 0,
      filter: "blur(6px)",
    }),
    center: {
      rotateY: 0,
      rotateZ: 0,
      x: 0,
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 270,
        damping: 24,
        mass: 0.9,
      },
    },
    exit: (direction) => ({
      rotateY: direction > 0 ? -70 : 70,
      rotateZ: direction > 0 ? -6 : 6,
      x: direction > 0 ? -140 : 140,
      scale: 0.84,
      opacity: 0,
      filter: "blur(8px)",
      transition: {
        duration: 0.4,
        ease: [0.32, 0.72, 0, 1],
      },
    }),
  },
  // 2. Kinetic Horizontal Throw & Slide
  slide: {
    enter: (direction) => ({
      x: direction > 0 ? 320 : -320,
      rotate: direction > 0 ? 9 : -9,
      scale: 0.9,
      opacity: 0,
    }),
    center: {
      x: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 27,
      },
    },
    exit: (direction) => ({
      x: direction > 0 ? -320 : 320,
      rotate: direction > 0 ? -11 : 11,
      scale: 0.86,
      opacity: 0,
      transition: {
        duration: 0.35,
        ease: "easeInOut",
      },
    }),
  },
  // 3. Depth Stack Portal Pop
  depth: {
    enter: (direction) => ({
      scale: 0.76,
      y: direction > 0 ? 70 : -70,
      opacity: 0,
      filter: "blur(6px)",
    }),
    center: {
      scale: 1,
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 250,
        damping: 22,
      },
    },
    exit: (direction) => ({
      scale: 1.14,
      y: direction > 0 ? -50 : 50,
      opacity: 0,
      filter: "blur(8px)",
      transition: {
        duration: 0.38,
        ease: "easeInOut",
      },
    }),
  },
};

const DesignerTemplate = ({ portfolio, onEditPhoto, isOwner }) => {
  const {
    name = "Creator",
    tagline = "Product Designer & Frontend Architect",
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
  const displayName = name || title || "Creator";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [activeMood, setActiveMood] = useState("ROSE");
  const [inspectedProject, setInspectedProject] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [animStyle, setAnimStyle] = useState("flip"); // "flip" | "slide" | "depth"
  const [activeProjectTab, setActiveProjectTab] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [isClickRipple, setIsClickRipple] = useState(false);

  const palette = DESIGNER_PALETTES[activeMood];

  // Real-time clock update
  useEffect(() => {
    const update = () => {
      try {
        const now = new Date();
        setCurrentTime(
          new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZoneName: "short",
          }).format(now)
        );
      } catch {
        setCurrentTime("Studio Active");
      }
    };
    update();
    const timer = setInterval(update, 10000);
    return () => clearInterval(timer);
  }, []);

  const TOTAL_CARDS = 6;

  // Advance to next card with 3D animation
  const handleNext = useCallback(() => {
    playCardSwoosh();
    setDirection(1);
    setIsClickRipple(true);
    setTimeout(() => setIsClickRipple(false), 300);
    setActiveCardIndex((prev) => (prev + 1) % TOTAL_CARDS);
  }, [TOTAL_CARDS]);

  // Go to previous card with reverse 3D animation
  const handlePrev = useCallback(() => {
    playCardSwoosh();
    setDirection(-1);
    setIsClickRipple(true);
    setTimeout(() => setIsClickRipple(false), 300);
    setActiveCardIndex((prev) => (prev - 1 + TOTAL_CARDS) % TOTAL_CARDS);
  }, [TOTAL_CARDS]);

  // Jump directly to a card index
  const goToCard = (index) => {
    if (index === activeCardIndex) return;
    playCardSwoosh();
    setDirection(index > activeCardIndex ? 1 : -1);
    setActiveCardIndex(index);
  };

  // Keyboard navigation: ArrowRight / ArrowLeft / Space to flip card
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleNext, handlePrev]);

  // Listen to hash / section links so clicking top overlay nav jumps to corresponding card
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      const map = {
        hero: 0,
        about: 1,
        skills: 2,
        projects: 3,
        experience: 4,
        contact: 5,
      };
      if (map[hash] !== undefined) {
        goToCard(map[hash]);
      }
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [activeCardIndex]);

  // Smart Card Click handler: triggers transformation unless user clicked an interactive control
  const handleCardClick = (e) => {
    if (
      e.target.closest("button") ||
      e.target.closest("a") ||
      e.target.closest("input") ||
      e.target.closest("textarea") ||
      e.target.closest("[data-no-card-click]")
    ) {
      return;
    }
    handleNext();
  };

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied: ${text} 🎨`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const currentProject = projects[activeProjectTab] || projects[0] || {
    title: "Editorial Design System & Mobile Atelier",
    description: "Architecting high-frequency tactile design systems, bespoke micro-interactions, and responsive layout primitives.",
    tags: ["Figma", "Design Tokens", "React", "Tailwind CSS"],
    impact: "40% reduction in design-to-production latency across 12 product modules",
  };

  // Card meta descriptor
  const CARD_METAS = [
    { id: "hero", label: "01 // Atelier", sub: "Identity & Atelier Hero" },
    { id: "about", label: "02 // Manifesto", sub: "Design Philosophy & Pillars" },
    { id: "skills", label: "03 // Systems", sub: "Craft Competencies & Tech Stack" },
    { id: "projects", label: "04 // Works", sub: "Curated Works & Case Studies" },
    { id: "experience", label: "05 // Journey", sub: "Tenure & Career Milestones" },
    { id: "contact", label: "06 // Inquire", sub: "Direct Inquiries & Colophon" },
  ];

  return (
    <div className="min-h-screen bg-[#0c0a09] text-[#f5f5f4] font-sans selection:bg-rose-500/30 selection:text-white relative overflow-hidden flex flex-col justify-between">
      {/* Ambient glowing atmosphere */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.18, 0.32, 0.18],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-0 right-0 w-[640px] h-[640px] blur-[160px] rounded-full pointer-events-none transition-colors duration-700 z-0"
        style={{ backgroundColor: palette.glow }}
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.12, 0.24, 0.12],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="fixed -bottom-40 -left-40 w-[640px] h-[640px] blur-[160px] rounded-full pointer-events-none transition-colors duration-700 z-0"
        style={{ backgroundColor: palette.glow }}
      />

      {/* Top Header with Palette Tuner & Quick Card Nav */}
      <header className="shrink-0 z-40 bg-[#0c0a09]/90 backdrop-blur-xl border-b border-zinc-800/80 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: palette.accent }} />
              <span className="font-bold tracking-wider uppercase font-mono text-white text-xs sm:text-sm">
                {displayName} // ATELIER CARDS
              </span>
            </div>
            {currentTime && (
              <span className="hidden md:flex items-center gap-1 text-[11px] text-zinc-400 font-mono pl-2 border-l border-zinc-800">
                <Clock size={11} style={{ color: palette.accent }} />
                <span>{currentTime}</span>
              </span>
            )}
          </div>

          {/* Center Card Jump Anchors */}
          <div className="hidden lg:flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 p-1 rounded-full text-[11px] font-mono">
            {CARD_METAS.map((btn, idx) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => goToCard(idx)}
                className={`px-3 py-1 rounded-full transition cursor-pointer ${
                  activeCardIndex === idx
                    ? "bg-white text-black font-bold shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Palette Mood Tuner & Animation Mode Switcher */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800 px-2 py-1 rounded-full text-[10px] font-mono text-zinc-400">
              <span>ANIMATION:</span>
              {[
                { id: "flip", label: "3D Flip" },
                { id: "slide", label: "Slide" },
                { id: "depth", label: "Depth" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setAnimStyle(m.id);
                    toast(`Transition set to ${m.label} 💫`);
                  }}
                  className={`px-2 py-0.5 rounded-full transition cursor-pointer ${
                    animStyle === m.id ? "bg-zinc-800 text-white font-bold" : "hover:text-zinc-200"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              {Object.keys(DESIGNER_PALETTES).map((mKey) => (
                <motion.button
                  key={mKey}
                  whileHover={{ scale: 1.25 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setActiveMood(mKey);
                    toast(`Atelier palette set to ${mKey}! 🎨`);
                  }}
                  className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                    activeMood === mKey ? "scale-125 border-white shadow-md ring-2 ring-white/20" : "border-transparent opacity-50"
                  }`}
                  style={{ backgroundColor: DESIGNER_PALETTES[mKey].accent }}
                  title={`Switch to ${mKey} palette`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Presentation Stage: Centered Card with 3D Stack */}
      <main className="flex-1 w-full flex items-center justify-center p-3 sm:p-6 md:p-8 relative z-10 overflow-hidden">
        <div
          className="relative w-full max-w-[840px] h-[580px] sm:h-[620px] md:h-[660px] max-h-[82vh] flex items-center justify-center"
          style={{ perspective: 1400 }}
        >
          {/* Card Stack Background Layer 2 (Deep preview card) */}
          <div
            className="absolute inset-0 rounded-[36px] bg-zinc-950/40 border border-zinc-800/50 pointer-events-none transition-all duration-500 hidden sm:block"
            style={{
              transform: "translateY(22px) translateX(12px) scale(0.92) rotate(2.5deg)",
              opacity: 0.3,
              filter: "blur(1px)",
            }}
          />

          {/* Card Stack Background Layer 1 (Mid preview card) */}
          <div
            className="absolute inset-0 rounded-[36px] bg-zinc-950/70 border border-zinc-800/80 pointer-events-none transition-all duration-500 hidden sm:block"
            style={{
              transform: "translateY(11px) translateX(6px) scale(0.96) rotate(-1.5deg)",
              opacity: 0.6,
              boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
            }}
          />

          {/* Active Center Card with Framer Motion AnimatePresence */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeCardIndex}
              custom={direction}
              variants={TRANSFORMATION_VARIANTS[animStyle]}
              initial="enter"
              animate="center"
              exit="exit"
              onClick={handleCardClick}
              className={`w-full h-full rounded-[36px] bg-gradient-to-br from-[#151210]/98 via-[#100d0c]/95 to-[#191412]/98 border border-zinc-800/90 shadow-[0_30px_90px_rgba(0,0,0,0.85)] p-5 sm:p-8 md:p-10 flex flex-col justify-between overflow-hidden relative backdrop-blur-2xl transition-all duration-300 hover:border-zinc-700/90 cursor-pointer group select-none ${
                isClickRipple ? "ring-2 ring-white/30" : ""
              }`}
              style={{
                boxShadow: `0 30px 90px rgba(0,0,0,0.85), 0 0 35px ${palette.glow}`,
              }}
            >
              {/* Subtle Ambient Card Glow */}
              <div
                className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[110px] pointer-events-none opacity-20 transition-colors"
                style={{ backgroundColor: palette.accent }}
              />

              {/* CARD 01: IDENTITY & ATELIER HERO */}
              {activeCardIndex === 0 && (
                <div id="hero" data-section="hero" className="flex flex-col justify-between h-full space-y-4">
                  {/* Card Top Header */}
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                    <span
                      className="text-xs uppercase tracking-[0.25em] font-mono font-bold flex items-center gap-2"
                      style={{ color: palette.accent }}
                    >
                      <Sparkles size={13} />
                      CARD 01 // EDITORIAL ATELIER
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      AVAILABLE FOR COMMISSIONS
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pt-2">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      {/* 3D Tilt Avatar */}
                      <div className="shrink-0 flex flex-col items-center gap-2" data-no-card-click="true">
                        <TiltCard maxTilt={15}>
                          <PulseAura glowGradient={`from-white via-rose-500 to-${palette.accent}`}>
                            <div
                              className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl p-1 bg-zinc-900 border-2 shadow-2xl transition-colors group/avatar"
                              style={{ borderColor: palette.accent }}
                            >
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
                                  className={`w-full h-full items-center justify-center text-4xl font-black text-white ${
                                    avatar ? "hidden" : "flex"
                                  }`}
                                >
                                  {initials}
                                </div>

                                {onEditPhoto && (
                                  <button
                                    type="button"
                                    onClick={onEditPhoto}
                                    className="absolute inset-0 bg-black/75 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer text-white backdrop-blur-xs z-30"
                                  >
                                    <Camera size={22} className="text-white drop-shadow" />
                                    <span
                                      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow text-white"
                                      style={{ backgroundColor: palette.accent }}
                                    >
                                      Change
                                    </span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </PulseAura>
                        </TiltCard>
                      </div>

                      {/* Name & Tagline */}
                      <div className="flex-1 text-center sm:text-left space-y-2">
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                          <ShimmerText gradient={palette.gradient}>{displayName}</ShimmerText>
                        </h1>
                        <p className="text-base sm:text-lg text-zinc-300 font-light leading-relaxed">
                          {tagline}
                        </p>
                        {contact?.location && (
                          <p className="text-xs text-zinc-400 font-mono pt-1">
                            Based in: <span className="text-white">{contact.location}</span>
                          </p>
                        )}

                        {/* Social & Contact Actions */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2" data-no-card-click="true">
                          {email && (
                            <button
                              type="button"
                              onClick={() => handleCopy(email, "card1-email")}
                              className={`px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 cursor-pointer ${palette.button}`}
                            >
                              {copiedKey === "card1-email" ? <Check size={14} /> : <Mail size={14} />}
                              <span>{copiedKey === "card1-email" ? "Email Copied!" : "Discuss Project"}</span>
                            </button>
                          )}

                          {linkedin && (
                            <a
                              href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition flex items-center gap-2"
                            >
                              <FaLinkedin size={13} />
                              <span>LinkedIn</span>
                            </a>
                          )}

                          {github && (
                            <a
                              href={github.startsWith("http") ? github : `https://${github}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition flex items-center gap-2"
                            >
                              <FaGithub size={13} />
                              <span>GitHub</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metrics Ribbon */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                      {[
                        { val: "100%", label: "Pixel Precision", sub: "Design Tokens" },
                        { val: `${projects.length || 6}+`, label: "Curated Works", sub: "Case Studies" },
                        { val: "60 FPS", label: "Smooth Motion", sub: "Spring Physics" },
                        { val: `${skills.length || 12}+`, label: "Capabilities", sub: "Design Systems" },
                      ].map((stat, i) => (
                        <div key={i} className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-center space-y-0.5">
                          <div className="text-xl sm:text-2xl font-black font-mono" style={{ color: palette.accent }}>
                            {stat.val}
                          </div>
                          <div className="text-[11px] font-bold text-white">{stat.label}</div>
                          <div className="text-[9px] text-zinc-400">{stat.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Transformation Hint Footer */}
                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: palette.accent }} />
                      <span className="font-mono text-[11px]">Card 01 / 06 // Identity</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-white group-hover:translate-x-1 transition-transform">
                      <span>Click Card to Unveil Manifesto ⟶</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 02: DESIGN MANIFESTO & PHILOSOPHY */}
              {activeCardIndex === 1 && (
                <div id="about" data-section="about" className="flex flex-col justify-between h-full space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                    <span
                      className="text-xs uppercase tracking-[0.25em] font-mono font-bold flex items-center gap-2"
                      style={{ color: palette.accent }}
                    >
                      <BookOpen size={13} />
                      CARD 02 // CREATIVE MANIFESTO
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">02 / {TOTAL_CARDS}</span>
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 pt-2">
                    <blockquote
                      className="text-xl sm:text-2xl font-serif italic text-zinc-100 leading-snug border-l-2 pl-4 py-1"
                      style={{ borderColor: palette.accent }}
                    >
                      &ldquo;Form follows emotion; interaction defines intent. Great design is the quiet harmony between architectural clarity and sensory delight.&rdquo;
                    </blockquote>

                    {about ? (
                      <div className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed space-y-2">
                        <p>{about}</p>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                        Dedicated to crafting high-fidelity design systems, intuitive digital platforms, and immersive product interactions that elevate brands and engage audiences across web and mobile.
                      </p>
                    )}

                    {/* Core Pillars */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      {[
                        { title: "Radical Ergonomics", desc: "Every touchpoint is calibrated for tactile feedback, visual hierarchy, and frictionless intuition." },
                        { title: "Living Systems", desc: "Multi-platform design tokens and modular primitives engineered for infinite scale." },
                        { title: "Kinetic Polish", desc: "Fluid micro-animations that communicate state, guide focus, and delight users without cognitive noise." },
                      ].map((pillar, i) => (
                        <div key={i} className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/90 space-y-1.5">
                          <div
                            className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono text-black"
                            style={{ backgroundColor: palette.accent }}
                          >
                            0{i + 1}
                          </div>
                          <h3 className="text-xs font-bold text-white pt-0.5">{pillar.title}</h3>
                          <p className="text-[11px] text-zinc-400 leading-relaxed font-light">{pillar.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: palette.accent }} />
                      <span className="font-mono text-[11px]">Card 02 / 06 // Philosophy</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-white group-hover:translate-x-1 transition-transform">
                      <span>Click Card to Inspect Craft Systems ⟶</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 03: CRAFT COMPETENCIES & TECH STACK */}
              {activeCardIndex === 2 && (
                <div id="skills" data-section="skills" className="flex flex-col justify-between h-full space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                    <span
                      className="text-xs uppercase tracking-[0.25em] font-mono font-bold flex items-center gap-2"
                      style={{ color: palette.accent }}
                    >
                      <Layers size={13} />
                      CARD 03 // CRAFT COMPETENCIES
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">03 / {TOTAL_CARDS}</span>
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 pt-2">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        Design Architecture &amp; Engineering Stack
                      </h2>
                      <p className="text-xs text-zinc-400 pt-0.5">
                        Bridging conceptual product strategy, high-fidelity UI design systems, and frontend implementation.
                      </p>
                    </div>

                    {/* Interactive Skills Cloud */}
                    {skills?.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                          Verified Disciplines &amp; Tools ({skills.length}):
                        </span>
                        <div className="flex flex-wrap gap-2" data-no-card-click="true">
                          {skills.map((skill, idx) => (
                            <MagneticPill
                              key={idx}
                              className="bg-zinc-950/80 border border-zinc-800 text-zinc-200 hover:border-zinc-600 transition shadow-sm text-xs px-3 py-1"
                            >
                              <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: palette.accent }} />
                              <span>{skill}</span>
                            </MagneticPill>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Discipline Matrix */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                        <span className="text-[10px] font-mono uppercase font-bold block" style={{ color: palette.accent }}>
                          01. INTERFACE &amp; DESIGN
                        </span>
                        <p className="text-xs font-semibold text-white">Figma, Design Tokens, Spatial Hierarchy, Micro-Interactions, Typography</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                        <span className="text-[10px] font-mono uppercase font-bold block" style={{ color: palette.accent }}>
                          02. FRONTEND ARCHITECTURE
                        </span>
                        <p className="text-xs font-semibold text-white">React 19, TypeScript, Next.js, Tailwind CSS, Framer Motion, WebGL</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                        <span className="text-[10px] font-mono uppercase font-bold block" style={{ color: palette.accent }}>
                          03. STRATEGY &amp; TESTING
                        </span>
                        <p className="text-xs font-semibold text-white">User Research, Rapid Prototyping, A/B Calibration, Usability Audits</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: palette.accent }} />
                      <span className="font-mono text-[11px]">Card 03 / 06 // Capabilities</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-white group-hover:translate-x-1 transition-transform">
                      <span>Click Card to Explore Curated Works ⟶</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 04: SELECTED WORKS & CASE STUDIES */}
              {activeCardIndex === 3 && (
                <div id="projects" data-section="projects" className="flex flex-col justify-between h-full space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs uppercase tracking-[0.25em] font-mono font-bold flex items-center gap-2"
                        style={{ color: palette.accent }}
                      >
                        <Zap size={13} />
                        CARD 04 // CURATED WORKS
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">
                        ({activeProjectTab + 1} OF {Math.max(projects.length, 1)})
                      </span>
                    </div>

                    {/* Mini Project Switcher Pills inside Card */}
                    {projects.length > 1 && (
                      <div className="flex items-center gap-1.5" data-no-card-click="true">
                        {projects.slice(0, 5).map((p, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveProjectTab(pIdx);
                            }}
                            className={`w-5 h-5 rounded-full text-[10px] font-mono font-bold transition cursor-pointer flex items-center justify-center ${
                              activeProjectTab === pIdx
                                ? "bg-white text-black shadow"
                                : "bg-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                            title={p.title}
                          >
                            {pIdx + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pt-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                          FEATURED CASE STUDY
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                          {currentProject.title}
                        </h3>
                      </div>

                      {/* Live Links */}
                      <div className="flex items-center gap-2 shrink-0" data-no-card-click="true">
                        {currentProject.live && (
                          <a
                            href={currentProject.live}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-white flex items-center gap-1.5 transition"
                          >
                            <span>Live Product</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                        {currentProject.github && (
                          <a
                            href={currentProject.github}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition"
                            title="GitHub Repository"
                          >
                            <FaGithub size={13} />
                          </a>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                      {currentProject.description}
                    </p>

                    {/* Impact Metric */}
                    {currentProject.impact && (
                      <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 text-xs text-zinc-200 font-medium flex items-center gap-3">
                        <Zap size={16} style={{ color: palette.accent }} className="shrink-0" />
                        <span><strong className="text-white">Design Impact &amp; Metrics:</strong> {currentProject.impact}</span>
                      </div>
                    )}

                    {/* Tag Pills */}
                    {currentProject.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {currentProject.tags.map((t, i) => (
                          <span
                            key={i}
                            className="text-xs px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Deep Dive Inspect CTA */}
                    <div className="pt-2" data-no-card-click="true">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectedProject(currentProject);
                        }}
                        className="px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition shadow flex items-center gap-2 cursor-pointer"
                        style={{
                          backgroundColor: palette.accent,
                          color: activeMood === "AMBER" || activeMood === "MINT" ? "#000" : "#fff",
                        }}
                      >
                        <Eye size={14} />
                        <span>Inspect Deep Dive Case Study</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: palette.accent }} />
                      <span className="font-mono text-[11px]">Card 04 / 06 // Selected Works</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-white group-hover:translate-x-1 transition-transform">
                      <span>Click Card to Trace Career Journey ⟶</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 05: CAREER JOURNEY & MILESTONES */}
              {activeCardIndex === 4 && (
                <div id="experience" data-section="experience" className="flex flex-col justify-between h-full space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                    <span
                      className="text-xs uppercase tracking-[0.25em] font-mono font-bold flex items-center gap-2"
                      style={{ color: palette.accent }}
                    >
                      <Briefcase size={13} />
                      CARD 05 // CAREER JOURNEY
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">05 / {TOTAL_CARDS}</span>
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pt-1">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        Leadership &amp; Industry Milestones
                      </h2>
                      <p className="text-xs text-zinc-400 pt-0.5">
                        Chronological track record directing product systems, design teams, and customer experience architectures.
                      </p>
                    </div>

                    {/* Milestones List */}
                    <div className="space-y-2.5">
                      {experience?.length > 0 ? (
                        experience.slice(0, 3).map((exp, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-1"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                              <span className="text-sm font-bold text-white">
                                {exp.role} · <span style={{ color: palette.accent }}>{exp.company}</span>
                              </span>
                              <span className="text-zinc-400 font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px]">
                                {exp.duration}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-300 font-light leading-relaxed">
                              {exp.description}
                            </p>
                            <ExperienceCredentialsBadges exp={exp} />
                          </div>
                        ))
                      ) : (
                        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-400">
                          Senior Product Designer &amp; Design Technologist with 5+ years building design systems for enterprise and hyper-growth scaleups.
                        </div>
                      )}
                    </div>

                    {/* Education & Honors badges */}
                    {(education?.length > 0 || achievements?.length > 0) && (
                      <div className="pt-2 border-t border-zinc-800/60">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block pb-1.5">
                          CREDENTIALS &amp; RECOGNITIONS
                        </span>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {education.slice(0, 2).map((edu, i) => (
                            <span key={i} className="px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300">
                              🎓 {edu.institution} ({edu.degree})
                            </span>
                          ))}
                          {achievements.slice(0, 2).map((ach, i) => (
                            <span key={i} className="px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300">
                              🏆 {ach.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: palette.accent }} />
                      <span className="font-mono text-[11px]">Card 05 / 06 // Journey</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-white group-hover:translate-x-1 transition-transform">
                      <span>Click Card for Direct Inquiries ⟶</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 06: DIRECT INQUIRIES & COLOPHON */}
              {activeCardIndex === 5 && (
                <div id="contact" data-section="contact" className="flex flex-col justify-between h-full space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                    <span
                      className="text-xs uppercase tracking-[0.25em] font-mono font-bold flex items-center gap-2"
                      style={{ color: palette.accent }}
                    >
                      <Mail size={13} />
                      CARD 06 // DIRECT INQUIRIES
                    </span>
                    <span className="text-xs text-emerald-400 font-mono">STATUS: OPEN FOR WORK</span>
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pt-1">
                    <div className="space-y-1">
                      <h2 className="text-2xl sm:text-3xl font-black text-white">Start a Conversation</h2>
                      <p className="text-zinc-300 text-xs sm:text-sm font-light leading-relaxed">
                        Currently accepting selected brand identity systems, product architecture commissions, and executive design leadership inquiries.
                      </p>
                    </div>

                    {/* Direct Contact Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-no-card-click="true">
                      {email && (
                        <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block">DIRECT EMAIL SOCKET</span>
                          <p className="font-bold text-white text-xs truncate">{email}</p>
                          <div className="flex gap-2 pt-1">
                            <a
                              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                              style={{
                                backgroundColor: palette.accent,
                                color: activeMood === "AMBER" || activeMood === "MINT" ? "#000" : "#fff",
                              }}
                            >
                              <Mail size={12} />
                              <span>Compose</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopy(email, "final-email")}
                              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                            >
                              {copiedKey === "final-email" ? <Check size={12} /> : <Copy size={12} />}
                              <span>{copiedKey === "final-email" ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {linkedin && (
                        <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block">PROFESSIONAL NETWORK</span>
                          <p className="font-bold text-white text-xs">LinkedIn Atelier Profile</p>
                          <a
                            href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition mt-1"
                          >
                            <FaLinkedin size={13} />
                            <span>Connect &rarr;</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Resume / Location telemetry */}
                    <div className="p-3 rounded-2xl bg-zinc-950/50 border border-zinc-800/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <FileText size={14} style={{ color: palette.accent }} />
                        <span>Curriculum Vitae &amp; Portfolio Dossier</span>
                      </div>
                      {email && (
                        <a
                          href={`mailto:${email}?subject=Resume%20Request`}
                          className="text-white hover:underline font-mono text-[11px]"
                          data-no-card-click="true"
                        >
                          Request PDF &rarr;
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: palette.accent }} />
                      <span className="font-mono text-[11px]">Card 06 / 06 // Colophon</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-white group-hover:translate-x-1 transition-transform">
                      <span>Click Card to Return to Card 01 ↺</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Bottom Deck Controls Bar */}
      <footer className="shrink-0 z-40 bg-[#0c0a09]/95 backdrop-blur-2xl border-t border-zinc-800/80 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Card Prev & Next Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Previous Card (Left Arrow)"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              style={{
                backgroundColor: palette.accent,
                borderColor: palette.accent,
                color: activeMood === "AMBER" || activeMood === "MINT" ? "#000" : "#fff",
              }}
              title="Next Card (Right Arrow / Click Card)"
            >
              <span className="hidden sm:inline font-bold">Next Card</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Interactive Card Dots Indicator */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold text-zinc-400">
              CARD 0{activeCardIndex + 1} / 0{TOTAL_CARDS}
            </span>
            <div className="flex items-center gap-1.5">
              {CARD_METAS.map((meta, dotIdx) => (
                <button
                  key={meta.id}
                  type="button"
                  onClick={() => goToCard(dotIdx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeCardIndex === dotIdx
                      ? "w-7 bg-white shadow"
                      : "w-2 bg-zinc-700 hover:bg-zinc-500"
                  }`}
                  title={`Jump to ${meta.sub}`}
                />
              ))}
            </div>
          </div>

          {/* Click to Transform Hint */}
          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            <Sparkles size={13} style={{ color: palette.accent }} />
            <span>Click card or press &rarr; key to transform</span>
          </div>
        </div>
      </footer>

      {/* Deep Dive Case Study Modal */}
      <ProjectDeepDiveModal
        project={inspectedProject}
        onClose={() => setInspectedProject(null)}
        accentColor={palette.accent}
      />
    </div>
  );
};

export default DesignerTemplate;
