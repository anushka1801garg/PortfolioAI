import { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles,
  ExternalLink,
  Mail,
  Award,
  GraduationCap,
  Briefcase,
  Zap,
  Camera,
  Layers,
  Check,
  Copy,
  ChevronLeft,
  ChevronRight,
  Eye,
  Radio,
  FileText,
  Terminal,
  Cpu,
  MapPin,
  Building2,
  DollarSign,
  Code2,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  ProjectDeepDiveModal,
  DocumentViewerModal,
  TiltCard,
  ShimmerText,
  MagneticPill,
  PulseAura,
} from "./motionComponents";

// Zero-dependency Web Audio synthesizer for futuristic cybernetic card transitions
const playCyberSwoosh = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.19);
  } catch {
    // Audio context may be restricted before interaction
  }
};

// Rich Cybernetic 3D Transformation Variants
const CYBER_VARIANTS = {
  // 1. Quantum 3D Perspective Flip
  warp: {
    enter: (direction) => ({
      rotateY: direction > 0 ? 75 : -75,
      rotateZ: direction > 0 ? 6 : -6,
      x: direction > 0 ? 120 : -120,
      scale: 0.86,
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
        stiffness: 280,
        damping: 24,
        mass: 0.9,
      },
    },
    exit: (direction) => ({
      rotateY: direction > 0 ? -75 : 75,
      rotateZ: direction > 0 ? -7 : 7,
      x: direction > 0 ? -150 : 150,
      scale: 0.82,
      opacity: 0,
      filter: "blur(8px)",
      transition: {
        duration: 0.38,
        ease: [0.32, 0.72, 0, 1],
      },
    }),
  },
  // 2. Hyper Slide
  slide: {
    enter: (direction) => ({
      x: direction > 0 ? 340 : -340,
      rotate: direction > 0 ? 8 : -8,
      scale: 0.88,
      opacity: 0,
    }),
    center: {
      x: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 310,
        damping: 27,
      },
    },
    exit: (direction) => ({
      x: direction > 0 ? -340 : 340,
      rotate: direction > 0 ? -10 : 10,
      scale: 0.84,
      opacity: 0,
      transition: {
        duration: 0.34,
        ease: "easeInOut",
      },
    }),
  },
  // 3. Matrix Portal Pop
  portal: {
    enter: (direction) => ({
      scale: 0.72,
      y: direction > 0 ? 80 : -80,
      opacity: 0,
      filter: "blur(8px)",
    }),
    center: {
      scale: 1,
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 22,
      },
    },
    exit: (direction) => ({
      scale: 1.16,
      y: direction > 0 ? -60 : 60,
      opacity: 0,
      filter: "blur(10px)",
      transition: {
        duration: 0.36,
        ease: "easeInOut",
      },
    }),
  },
};

const AnimatedTemplate = ({ portfolio, onEditPhoto }) => {
  const {
    name = "Developer",
    tagline = "Interactive Creative Engineer & Kinetic Systems Architect",
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
    phone = contact?.phone || portfolio?.phone,
    title,
  } = portfolio || {};

  const avatar = portfolio?.avatar || portfolio?.hero?.avatar || "";
  const displayName = name || title || "Developer";
  const hero = {
    name: portfolio?.hero?.name || name,
    title: portfolio?.hero?.title || title || portfolio?.role || "Developer",
    tagline: portfolio?.hero?.tagline || tagline,
    avatar: portfolio?.hero?.avatar || avatar,
    ...(portfolio?.hero || {}),
  };
  const role = portfolio?.role || portfolio?.title || hero?.title || title || "Developer";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [inspectedProject, setInspectedProject] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [animStyle, setAnimStyle] = useState("warp"); // "warp" | "slide" | "portal"
  const [activeProjectTab, setActiveProjectTab] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [isClickRipple, setIsClickRipple] = useState(false);

  const canvasRef = useRef(null);

  // Floating Particle Interactive Canvas in Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles = Array.from({ length: 44 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? "rgba(168, 85, 247, 0.45)" : "rgba(6, 182, 212, 0.4)",
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.16 * (1 - dist / 110)})`;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Real-time telemetry clock
  useEffect(() => {
    const update = () => {
      try {
        const now = new Date();
        setCurrentTime(
          new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }).format(now)
        );
      } catch {
        setCurrentTime("CYBER ONLINE");
      }
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeSections = [
    { id: "hero", title: "Kinetic Hero", sub: "Vibe Matrix & Avatar", available: true },
    { id: "about", title: "Superpowers & Mission", sub: "Mission & Narrative", available: Boolean(about?.trim() || hero?.tagline) },
    { id: "skills", title: "Technical Arsenal", sub: "Technical Capabilities", available: Boolean(skills && skills.length > 0) },
    { id: "projects", title: "Holographic Projects", sub: "Holographic Showcases", available: Boolean(projects && projects.length > 0) },
    {
      id: "experience",
      title: experience?.length > 0 ? "Career Trajectory" : "Telemetry & Credentials",
      sub: experience?.length > 0 ? "Career Milestones" : "Education & Honors",
      available: Boolean((experience && experience.length > 0) || (education && education.length > 0) || (achievements && achievements.length > 0)),
    },
    { id: "contact", title: "Warp Connect", sub: "Connect & Telemetry", available: Boolean(email || linkedin || github || phone || website) },
  ].filter((s) => s.available);

  const CARD_METAS = (activeSections.length > 0 ? activeSections : [{ id: "hero", title: "Kinetic Hero", sub: "Vibe Matrix & Avatar", available: true }]).map((s, idx) => ({
    ...s,
    cardNum: idx + 1,
    formattedNum: String(idx + 1).padStart(2, "0"),
    label: `${String(idx + 1).padStart(2, "0")} // ${s.sub.split(" ")[0]}`,
  }));

  const TOTAL_CARDS = CARD_METAS.length;

  // Advance to next card with 3D animation
  const handleNext = useCallback(() => {
    playCyberSwoosh();
    setDirection(1);
    setIsClickRipple(true);
    setTimeout(() => setIsClickRipple(false), 300);
    setActiveCardIndex((prev) => (prev + 1) % TOTAL_CARDS);
  }, [TOTAL_CARDS]);

  // Go to previous card with reverse 3D animation
  const handlePrev = useCallback(() => {
    playCyberSwoosh();
    setDirection(-1);
    setIsClickRipple(true);
    setTimeout(() => setIsClickRipple(false), 300);
    setActiveCardIndex((prev) => (prev - 1 + TOTAL_CARDS) % TOTAL_CARDS);
  }, [TOTAL_CARDS]);

  // Jump to card index
  const goToCard = useCallback((index) => {
    setActiveCardIndex((prev) => {
      if (index === prev) return prev;
      playCyberSwoosh();
      setDirection(index > prev ? 1 : -1);
      return index;
    });
  }, []);

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
      const targetIdx = CARD_METAS.findIndex((c) => c.id === hash);
      if (targetIdx !== -1) {
        goToCard(targetIdx);
      }
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [CARD_METAS, goToCard]);

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
    toast.success(`Copied: ${text} 🚀`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const currentProject = projects[activeProjectTab] || projects[0] || null;

  const safeActiveIndex = activeCardIndex < TOTAL_CARDS ? activeCardIndex : 0;
  const currentCard = CARD_METAS[safeActiveIndex] || CARD_METAS[0] || { id: "hero", formattedNum: "01", cardNum: 1, sub: "Vibe Matrix", title: "Kinetic Hero" };
  const currentCardId = currentCard.id;
  const nextCardIndex = (safeActiveIndex + 1) % TOTAL_CARDS;
  const nextCard = CARD_METAS[nextCardIndex] || currentCard;
  const nextHint = nextCardIndex === 0
    ? `Click Card to Loop Back to ${nextCard.title} ↺`
    : `Click Card for ${nextCard.title} ⟶`;

  return (
    <div className="min-h-screen bg-[#050814] text-[#f8fafc] font-sans selection:bg-purple-500/30 selection:text-white relative overflow-hidden flex flex-col justify-between">
      {/* Background Interactive Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 opacity-75"
      />

      {/* Cybernetic Neon Background Glows */}
      <div className="fixed -top-40 -left-40 w-[640px] h-[640px] bg-purple-600/20 blur-[160px] rounded-full pointer-events-none z-0" />
      <div className="fixed -bottom-40 -right-40 w-[640px] h-[640px] bg-cyan-600/18 blur-[160px] rounded-full pointer-events-none z-0" />

      {/* Top Header with Telemetry & Card Jump Anchors */}
      <header className="shrink-0 z-40 bg-[#050814]/90 backdrop-blur-xl border-b border-purple-500/20 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-bold tracking-wider uppercase font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 text-xs sm:text-sm">
                {displayName} // KINETIC CARDS
              </span>
            </div>
            {currentTime && (
              <span className="hidden md:flex items-center gap-1.5 text-[11px] text-cyan-400/80 font-mono pl-3 border-l border-purple-500/30">
                <Radio size={12} className="animate-pulse text-cyan-400" />
                <span>UTC: {currentTime}</span>
              </span>
            )}
          </div>

          {/* Quick Jump Navigation Anchors */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/80 border border-purple-500/30 p-1 rounded-full text-[11px] font-mono shadow-lg shadow-purple-950/40">
            {CARD_METAS.map((btn, idx) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => goToCard(idx)}
                className={`px-3 py-1 rounded-full transition cursor-pointer ${
                  safeActiveIndex === idx
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-md shadow-purple-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Animation Style Selector */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-slate-900/70 border border-purple-500/30 px-2 py-1 rounded-full text-[10px] font-mono text-slate-300">
              <span className="text-purple-400 font-bold">WARP:</span>
              {[
                { id: "warp", label: "3D Warp" },
                { id: "slide", label: "Slide" },
                { id: "portal", label: "Portal" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setAnimStyle(m.id);
                    toast(`Warp transition set to ${m.label}! ⚡`);
                  }}
                  className={`px-2 py-0.5 rounded-full transition cursor-pointer ${
                    animStyle === m.id
                      ? "bg-purple-600 text-white font-bold shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              120 FPS
            </span>
          </div>
        </div>
      </header>

      {/* Main Presentation Stage: Centered Card with 3D Stack */}
      <main className="flex-1 w-full flex items-center justify-center p-3 sm:p-6 md:p-8 relative z-10 overflow-hidden">
        <div
          className="relative w-full max-w-[840px] h-[580px] sm:h-[620px] md:h-[660px] max-h-[82vh] flex items-center justify-center"
          style={{ perspective: 1500 }}
        >
          {/* Card Stack Background Layer 2 (Deep Holographic Card) */}
          <div
            className="absolute inset-0 rounded-[36px] bg-slate-950/60 border border-cyan-500/30 pointer-events-none transition-all duration-500 hidden sm:block"
            style={{
              transform: "translateY(24px) translateX(14px) scale(0.91) rotate(-2.5deg)",
              opacity: 0.35,
              filter: "blur(1px)",
              boxShadow: "0 0 30px rgba(6, 182, 212, 0.15)",
            }}
          />

          {/* Card Stack Background Layer 1 (Mid Holographic Card) */}
          <div
            className="absolute inset-0 rounded-[36px] bg-slate-950/80 border border-purple-500/40 pointer-events-none transition-all duration-500 hidden sm:block"
            style={{
              transform: "translateY(12px) translateX(7px) scale(0.96) rotate(1.5deg)",
              opacity: 0.65,
              boxShadow: "0 20px 60px rgba(168, 85, 247, 0.2)",
            }}
          />

          {/* Active Center Card with Framer Motion AnimatePresence */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={safeActiveIndex}
              custom={direction}
              variants={CYBER_VARIANTS[animStyle]}
              initial="enter"
              animate="center"
              exit="exit"
              onClick={handleCardClick}
              className={`w-full h-full rounded-[36px] bg-gradient-to-br from-[#0c102b]/95 via-[#080d21]/95 to-[#130b2e]/95 border border-purple-500/40 shadow-[0_30px_90px_rgba(0,0,0,0.9)] p-5 sm:p-8 md:p-10 flex flex-col justify-between overflow-hidden relative backdrop-blur-2xl transition-all duration-300 hover:border-purple-400/80 cursor-pointer group select-none ${
                isClickRipple ? "ring-2 ring-cyan-400/50" : ""
              }`}
              style={{
                boxShadow: "0 30px 90px rgba(0,0,0,0.9), 0 0 45px rgba(168, 85, 247, 0.22)",
              }}
            >
              {/* Holographic Ambient Glow */}
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-purple-500/15 blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-cyan-500/15 blur-[100px] pointer-events-none" />

              {/* CARD 01: KINETIC HERO & VIBE MATRIX */}
              {currentCardId === "hero" && (
                <div id="hero" data-section="hero" className="flex flex-col justify-between h-full space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                    <span className="text-xs uppercase tracking-[0.25em] font-mono font-bold flex items-center gap-2 text-cyan-400">
                      <Sparkles size={13} className="text-pink-400 animate-spin" />
                      CARD {currentCard.formattedNum} // KINETIC MATRIX
                    </span>
                    <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      SYSTEM STATUS: ONLINE
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 pt-1">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      {/* 3D Tilt Avatar */}
                      <div className="shrink-0 flex flex-col items-center gap-2" data-no-card-click="true">
                        <TiltCard maxTilt={15}>
                          <PulseAura glowGradient="from-cyan-400 via-purple-500 to-pink-500">
                            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl p-1 bg-slate-900 border-2 border-purple-500/60 shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-colors group/avatar">
                              <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-950 flex items-center justify-center relative">
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
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow">
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
                          <ShimmerText gradient="from-cyan-300 via-purple-300 to-pink-400">
                            {displayName}
                          </ShimmerText>
                        </h1>
                        <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
                          {tagline}
                        </p>
                        {contact?.location && (
                          <p className="text-xs text-cyan-400/90 font-mono pt-0.5">
                            Station: <span className="text-white">{contact.location}</span>
                          </p>
                        )}

                        {/* Quick Contact Actions */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2" data-no-card-click="true">
                          {email && (
                            <button
                              type="button"
                              onClick={() => handleCopy(email, "card1-email")}
                              className="px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-900/40 transition flex items-center gap-2 cursor-pointer"
                            >
                              {copiedKey === "card1-email" ? <Check size={14} /> : <Mail size={14} />}
                              <span>{copiedKey === "card1-email" ? "Email Copied!" : "Transmit Signal"}</span>
                            </button>
                          )}

                          {linkedin && (
                            <a
                              href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 border border-purple-500/30 text-slate-200 text-xs font-semibold transition flex items-center gap-2 shadow"
                            >
                              <FaLinkedin size={13} className="text-cyan-400" />
                              <span>LinkedIn</span>
                            </a>
                          )}

                          {github && (
                            <a
                              href={github.startsWith("http") ? github : `https://${github}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 border border-purple-500/30 text-slate-200 text-xs font-semibold transition flex items-center gap-2 shadow"
                            >
                              <FaGithub size={13} className="text-pink-400" />
                              <span>GitHub</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Core Engineering Telemetry & Verified Impact Metrics Ribbon */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      {(() => {
                        const stats = [
                          { val: "100%", label: "Code Quality", sub: "Modular Architecture" },
                          { val: "120 FPS", label: "Render Target", sub: "Zero-Latency UI" },
                        ];
                        if (projects.length > 0) {
                          stats.splice(1, 0, { val: `${projects.length}`, label: "Projects Built", sub: "Case Studies" });
                        }
                        if (skills.length > 0) {
                          stats.push({ val: `${skills.length}`, label: "Stack Modules", sub: "Verified Stack" });
                        } else if (experience.length > 0) {
                          stats.push({ val: `${experience.length}`, label: "Appointments", sub: "Career Tenure" });
                        } else if (achievements.length > 0) {
                          stats.push({ val: `${achievements.length}`, label: "Honors", sub: "Recognitions" });
                        }
                        return stats.map((stat, i) => (
                          <div key={i} className="p-3 rounded-2xl bg-slate-950/70 border border-purple-500/25 text-center space-y-0.5 shadow-sm">
                            <div className="text-xl sm:text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400">
                              {stat.val}
                            </div>
                            <div className="text-[11px] font-bold text-white">{stat.label}</div>
                            <div className="text-[9px] text-slate-400 font-mono">{stat.sub}</div>
                          </div>
                        ));
                      })()}
                    </div>

                    {/* Lower Section: Dual-Panel Cybernetic Command Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {/* Left: Active Arsenal & Verified Stack */}
                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400">
                            <Terminal size={13} className="text-cyan-400" />
                            <span>ACTIVE TECHNICAL ARSENAL</span>
                          </div>
                          {skills.length > 0 && (
                            <span className="text-[10px] font-mono text-purple-400 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30">
                              {skills.length} MODULES
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5" data-no-card-click="true">
                          {skills.length > 0 ? (
                            skills.slice(0, 8).map((s, i) => (
                              <MagneticPill
                                key={i}
                                className="bg-slate-900/90 border border-purple-500/30 text-slate-200 hover:border-cyan-400 text-[11px] px-2.5 py-1 transition shadow-xs"
                              >
                                <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-gradient-to-r from-cyan-400 to-pink-500" />
                                <span>{s}</span>
                              </MagneticPill>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 font-mono italic">
                              Full technical stack details available upon direct request.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Mission Directive & Live Telemetry */}
                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-pink-400">
                            <Cpu size={13} className="text-pink-400" />
                            <span>SYSTEM DIRECTIVE &amp; TELEMETRY</span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            ONLINE
                          </span>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-start gap-2">
                            <span className="text-cyan-400 font-mono text-[10px] uppercase font-bold shrink-0 pt-0.5">FOCUS:</span>
                            <span className="text-slate-300 text-[11px] leading-snug">
                              {skills?.length > 0
                                ? `Engineering high-impact applications with ${skills.slice(0, 3).join(", ")} & modern architectures.`
                                : (hero?.tagline || `Architecting scalable solutions as ${role}.`)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-pink-400 font-mono text-[10px] uppercase font-bold shrink-0">STATUS:</span>
                            <span className="text-emerald-300 font-mono text-[11px]">
                              Available for High-Impact Roles &amp; Contracts
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-purple-400 font-mono text-[10px] uppercase font-bold shrink-0">STATION:</span>
                            <span className="text-slate-300 font-mono text-[11px]">
                              {contact?.location || "Remote Worldwide"} // Zero-Jank SLA
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Flagship Build Spotlight Strip (only if authentic project exists) */}
                    {currentProject && (
                      <div
                        className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/50 via-slate-950/80 to-cyan-950/50 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                        data-no-card-click="true"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="px-2 py-0.5 rounded-md bg-pink-500/20 border border-pink-500/40 text-pink-400 text-[10px] font-mono font-bold shrink-0">
                            FLAGSHIP
                          </span>
                          <div className="min-w-0 truncate">
                            <span className="text-xs font-bold text-white pr-2 truncate">{currentProject.title}</span>
                            <span className="text-[11px] text-slate-400 truncate hidden md:inline">
                              — {currentProject.impact || currentProject.description?.slice(0, 60)}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectedProject(currentProject);
                          }}
                          className="self-end sm:self-center px-3 py-1 rounded-full bg-slate-900 border border-purple-500/40 hover:border-cyan-400 text-[11px] font-bold text-cyan-300 hover:text-white transition cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <Eye size={12} />
                          <span>Inspect Build &rarr;</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Card Transformation Hint Footer */}
                  <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span className="font-mono text-[11px] text-cyan-300">
                        Card {currentCard.formattedNum} / {String(TOTAL_CARDS).padStart(2, "0")} // {currentCard.sub}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-white group-hover:translate-x-1 transition-transform">
                      <span className="text-pink-400">{nextHint}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 02: SUPERPOWERS & MISSION NARRATIVE */}
              {currentCardId === "about" && (
                <div id="about" data-section="about" className="flex flex-col justify-between h-full space-y-4">
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                    <span className="text-xs uppercase tracking-[0.25em] font-mono font-bold flex items-center gap-2 text-cyan-400">
                      <Zap size={13} className="text-pink-400" />
                      CARD {currentCard.formattedNum} // SUPERPOWERS &amp; MISSION
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {currentCard.formattedNum} / {String(TOTAL_CARDS).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 pt-1">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-950/60 to-cyan-950/40 border border-purple-500/30">
                      <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-400">
                        {hero?.tagline
                          ? (hero.tagline.includes("|") ? hero.tagline.split("|").slice(0, 2).join(" • ") : hero.tagline)
                          : (role ? `Engineering Scalable Systems as ${role}` : "Mission & Core Architecture")}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed pt-2">
                        {about || "Specialized in building robust, dynamic applications and interactive software products that turn ideas into high-impact digital experiences."}
                      </p>
                    </div>

                    {/* Authentic Superpowers from Stack */}
                    {skills?.length >= 2 && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {(() => {
                          const topFront = skills.find((s) => /react|next|vue|front|ui|angular|tailwind/i.test(s));
                          const topBack = skills.find((s) => /node|express|api|flask|python|mongo|sql|back/i.test(s));
                          const topSpecialty = skills.find((s) => /ai|ml|machine|cloud|docker|aws|system|full/i.test(s)) || skills[2] || skills[0];

                          const powers = [
                            {
                              title: topFront ? `${topFront} Interface Architecture` : `${skills[0]} Engineering`,
                              desc: `Building responsive, accessible interfaces and state-driven components with ${topFront || skills[0]}.`,
                              icon: "⚡",
                            },
                            {
                              title: topBack ? `${topBack} Services & APIs` : `${skills[1]} Services`,
                              desc: `Designing resilient services, secure authentication, and data models with ${topBack || skills[1]}.`,
                              icon: "🚀",
                            },
                            {
                              title: `${topSpecialty} & Delivery`,
                              desc: `Applying modern best practices, automated workflows, and production delivery standards.`,
                              icon: "💎",
                            },
                          ];

                          return powers.map((power, i) => (
                            <div key={i} className="p-3.5 rounded-2xl bg-slate-950/70 border border-purple-500/30 space-y-1.5">
                              <div className="text-lg">{power.icon}</div>
                              <h3 className="text-xs font-bold text-white">{power.title}</h3>
                              <p className="text-[11px] text-slate-400 leading-relaxed font-light">{power.desc}</p>
                            </div>
                          ));
                        })()}
                      </div>
                    )}

                    {/* Authentic Honors & Competitive Achievements */}
                    {achievements?.length > 0 ? (
                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono text-cyan-400 font-bold">
                          <span className="flex items-center gap-1.5">
                            <Award size={14} className="text-pink-400" />
                            <span>HONORS &amp; COMPETITIVE ACHIEVEMENTS:</span>
                          </span>
                          <span className="text-emerald-400 font-mono text-[10px]">{achievements.length} VERIFIED</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                          {achievements.slice(0, 4).map((ach, idx) => (
                            <div key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-purple-500/20">
                              <span className="text-pink-400 font-bold shrink-0">✦</span>
                              <span className="text-slate-200 text-[11px] leading-snug">{typeof ach === "string" ? ach : ach.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : education?.length > 0 ? (
                      <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-purple-500/25 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono text-cyan-400 font-bold">
                          <span className="flex items-center gap-1.5">
                            <GraduationCap size={14} className="text-cyan-400" />
                            <span>ACADEMIC FOUNDATION &amp; CREDENTIALS:</span>
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                          {education.slice(0, 2).map((edu, idx) => (
                            <div key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl border border-purple-500/20">
                              <span className="text-cyan-400 font-bold shrink-0">🎓</span>
                              <span className="text-slate-200 text-[11px] leading-snug">{edu.institution} ({edu.degree})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span className="font-mono text-[11px] text-cyan-300">
                        Card {currentCard.formattedNum} / {String(TOTAL_CARDS).padStart(2, "0")} // {currentCard.sub}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-white group-hover:translate-x-1 transition-transform">
                      <span className="text-pink-400">{nextHint}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 03: TECHNICAL ARSENAL & CAPABILITIES */}
              {currentCardId === "skills" && (
                <div id="skills" data-section="skills" className="flex flex-col justify-between h-full space-y-4">
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                    <span className="text-xs uppercase tracking-[0.25em] font-mono font-bold flex items-center gap-2 text-cyan-400">
                      <Layers size={13} className="text-pink-400" />
                      CARD {currentCard.formattedNum} // TECHNICAL ARSENAL
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {currentCard.formattedNum} / {String(TOTAL_CARDS).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pt-1">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">
                        Full-Spectrum Technical Capabilities
                      </h2>
                      <p className="text-xs text-slate-400 pt-0.5">
                        Interactive frontend architectures, real-time distributed backend sockets, and 3D graphics.
                      </p>
                    </div>

                    {/* Interactive Magnetic Skills Cloud */}
                    {skills?.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
                          VERIFIED MODULES &amp; DEPENDENCIES ({skills.length}):
                        </span>
                        <div className="flex flex-wrap gap-2" data-no-card-click="true">
                          {skills.map((skill, idx) => (
                            <MagneticPill
                              key={idx}
                              className="bg-slate-950/80 border border-purple-500/40 text-slate-200 hover:border-cyan-400 transition shadow-sm text-xs px-3 py-1"
                            >
                              <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-gradient-to-r from-cyan-400 to-pink-500" />
                              <span>{skill}</span>
                            </MagneticPill>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Category Modules */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      {(() => {
                        const front = skills.filter((s) => /react|next|vue|angular|front|ui|html|css|tailwind|javascript|typescript|framer|redux/i.test(s));
                        const back = skills.filter((s) => /node|express|flask|python|django|sql|mongo|redis|api|back|database|ai|ml|learning|scikit/i.test(s));
                        const tools = skills.filter((s) => !front.includes(s) && !back.includes(s));

                        const displayFront = front.length > 0 ? front.slice(0, 5).join(", ") : (skills.slice(0, 4).join(", ") || "Modern UI & Web Engineering");
                        const displayBack = back.length > 0 ? back.slice(0, 5).join(", ") : (skills.slice(4, 8).join(", ") || "REST APIs & Data Services");
                        const displayTools = tools.length > 0 ? tools.slice(0, 5).join(", ") : (skills.slice(8, 12).join(", ") || "Git, CI/CD & Cloud Tooling");

                        return (
                          <>
                            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-purple-500/30 space-y-1">
                              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
                                01. FRONTEND &amp; UI
                              </span>
                              <p className="text-xs font-semibold text-white">{displayFront}</p>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-purple-500/30 space-y-1">
                              <span className="text-[10px] font-mono uppercase text-pink-400 font-bold block">
                                02. BACKEND &amp; APIS
                              </span>
                              <p className="text-xs font-semibold text-white">{displayBack}</p>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-purple-500/30 space-y-1">
                              <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block">
                                03. TOOLS &amp; ARCHITECTURE
                              </span>
                              <p className="text-xs font-semibold text-white">{displayTools}</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span className="font-mono text-[11px] text-cyan-300">
                        Card {currentCard.formattedNum} / {String(TOTAL_CARDS).padStart(2, "0")} // {currentCard.sub}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-white group-hover:translate-x-1 transition-transform">
                      <span className="text-pink-400">{nextHint}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 04: HOLOGRAPHIC PROJECT SHOWCASE */}
              {currentCardId === "projects" && (
                <div id="projects" data-section="projects" className="flex flex-col justify-between h-full space-y-4">
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-[0.25em] font-mono font-bold flex items-center gap-2 text-cyan-400">
                        <Zap size={13} className="text-pink-400" />
                        CARD {currentCard.formattedNum} // HOLOGRAPHIC SHOWCASE
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
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
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/40"
                                : "bg-slate-800 text-slate-400 hover:text-white"
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
                    {currentProject ? (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                              CYBERNETIC CASE STUDY
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
                                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-xs font-semibold text-white flex items-center gap-1.5 transition shadow"
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
                                className="p-2 rounded-full bg-slate-900 border border-purple-500/30 hover:border-purple-400 text-slate-300 hover:text-white transition"
                                title="GitHub Repository"
                              >
                                <FaGithub size={13} />
                              </a>
                            )}
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                          {currentProject.description}
                        </p>

                        {/* Impact Metric */}
                        {currentProject.impact && (
                          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/30 text-xs text-slate-200 font-medium flex items-center gap-3">
                            <Zap size={16} className="text-pink-400 shrink-0" />
                            <span><strong className="text-white">Telemetry &amp; Impact:</strong> {currentProject.impact}</span>
                          </div>
                        )}

                        {/* Tag Pills */}
                        {currentProject.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {currentProject.tags.map((t, i) => (
                              <span
                                key={i}
                                className="text-xs px-3 py-1 rounded-full bg-slate-950 border border-purple-500/30 text-cyan-300 font-mono"
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
                            className="px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 hover:opacity-95 text-white transition shadow-lg shadow-purple-950/50 flex items-center gap-2 cursor-pointer"
                          >
                            <Eye size={14} />
                            <span>Inspect Deep Dive Case Study</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-purple-500/20 text-xs text-slate-400 font-mono">
                        No projects cataloged yet in this profile.
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span className="font-mono text-[11px] text-cyan-300">
                        Card {currentCard.formattedNum} / {String(TOTAL_CARDS).padStart(2, "0")} // {currentCard.sub}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-white group-hover:translate-x-1 transition-transform">
                      <span className="text-pink-400">{nextHint}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 05: CAREER TRAJECTORY & MILESTONES */}
              {currentCardId === "experience" && (
                <div id="experience" data-section="experience" className="flex flex-col justify-between h-full space-y-4">
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                    <span className="text-xs uppercase tracking-[0.25em] font-mono font-bold flex items-center gap-2 text-cyan-400">
                      <Briefcase size={13} className="text-pink-400" />
                      CARD {currentCard.formattedNum} // {currentCard.title.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {currentCard.formattedNum} / {String(TOTAL_CARDS).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pt-1">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">
                        {experience?.length > 0 ? "Mission Log & Appointments" : "Academic & Honor Milestones"}
                      </h2>
                      <p className="text-xs text-slate-400 pt-0.5">
                        {experience?.length > 0
                          ? "Chronological record of verified roles, technical engagements, and appointments."
                          : "Verified educational background and competitive achievements."}
                      </p>
                    </div>

                    {/* Milestones List */}
                    {experience?.length > 0 && (
                      <div className="space-y-3">
                        {experience.slice(0, 4).map((exp, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-slate-950/70 border border-purple-500/30 space-y-2.5 transition hover:border-purple-500/50"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between text-xs gap-1.5">
                              <div>
                                <span className="text-sm sm:text-base font-bold text-white">
                                  {exp.role} · <span className="text-cyan-400">{exp.company}</span>
                                </span>
                                {/* Company Metadata Badges */}
                                <div className="flex items-center gap-2 pt-1 flex-wrap">
                                  {exp.location && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-300 font-mono">
                                      <MapPin size={10} className="text-cyan-400" />
                                      <span>{exp.location}</span>
                                    </span>
                                  )}
                                  {exp.workplaceType && (
                                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono">
                                      <Building2 size={9} />
                                      <span>{exp.workplaceType}</span>
                                    </span>
                                  )}
                                  {exp.compensation && (
                                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono">
                                      <DollarSign size={9} />
                                      <span>
                                        {exp.compensation}
                                        {exp.compensationAmount ? ` · ${exp.compensationAmount}` : ""}
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </div>
                              {exp.duration && (
                                <span className="text-slate-400 font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-purple-500/30 text-[10px] self-start sm:self-center shrink-0">
                                  {exp.duration}
                                </span>
                              )}
                            </div>

                            {exp.description && (
                              <p className="text-xs text-slate-300 font-light leading-relaxed">
                                {exp.description}
                              </p>
                            )}

                            {/* Company Project Carried Out Under Company */}
                            {(exp.projectTitle || exp.projectLive || exp.projectGithub) && (
                              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/90 border border-purple-500/30 text-xs" data-no-card-click="true">
                                <div className="flex items-center gap-1.5 font-medium min-w-0">
                                  <span className="text-cyan-400 font-bold flex items-center gap-1 text-[11px]">
                                    <Code2 size={12} />
                                    <span>Project:</span>
                                  </span>
                                  <span className="font-semibold text-white text-xs truncate">
                                    {exp.projectTitle || "Key Deliverable"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {exp.projectLive && (
                                    <a
                                      href={exp.projectLive.startsWith("http") ? exp.projectLive : `https://${exp.projectLive}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-[10px] font-semibold transition cursor-pointer"
                                    >
                                      <span>Live</span>
                                      <ExternalLink size={9} />
                                    </a>
                                  )}
                                  {exp.projectGithub && (
                                    <a
                                      href={exp.projectGithub.startsWith("http") ? exp.projectGithub : `https://${exp.projectGithub}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-purple-500/30 text-slate-300 hover:text-white text-[10px] font-semibold transition cursor-pointer"
                                    >
                                      <FaGithub size={10} />
                                      <span>Repo</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Credentials & Certificate Buttons */}
                            {(exp.certificate || exp.offerLetter) && (
                              <div className="flex items-center gap-2 pt-1 flex-wrap" data-no-card-click="true">
                                {exp.certificate && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewingDoc({
                                        title: "Completion Certificate",
                                        company: exp.company,
                                        role: exp.role,
                                        url: exp.certificate,
                                        type: "certificate",
                                        fileName: exp.certificateName,
                                      });
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition cursor-pointer shadow-sm shadow-amber-500/10"
                                    title="View Completion Certificate"
                                  >
                                    <Award size={13} className="text-amber-400" />
                                    <span>View Completion Certificate</span>
                                    <Eye size={12} />
                                  </button>
                                )}

                                {exp.offerLetter && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewingDoc({
                                        title: "Offer Letter",
                                        company: exp.company,
                                        role: exp.role,
                                        url: exp.offerLetter,
                                        type: "offerLetter",
                                        fileName: exp.offerLetterName,
                                      });
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition cursor-pointer shadow-sm shadow-emerald-500/10"
                                    title="View Offer Letter"
                                  >
                                    <FileText size={13} className="text-emerald-400" />
                                    <span>View Offer Letter</span>
                                    <Eye size={12} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Education & Honors badges */}
                    {(education?.length > 0 || achievements?.length > 0) && (
                      <div className="pt-2 border-t border-purple-500/20">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase block pb-1.5">
                          TELEMETRY &amp; CREDENTIALS
                        </span>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {education.slice(0, 2).map((edu, i) => (
                            <span key={i} className="px-3 py-1 rounded-xl bg-slate-950 border border-purple-500/30 text-slate-300">
                              🎓 {edu.institution} ({edu.degree})
                            </span>
                          ))}
                          {achievements.slice(0, 2).map((ach, i) => (
                            <span key={i} className="px-3 py-1 rounded-xl bg-slate-950 border border-purple-500/30 text-slate-300">
                              🏆 {typeof ach === "string" ? ach : ach.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span className="font-mono text-[11px] text-cyan-300">
                        Card {currentCard.formattedNum} / {String(TOTAL_CARDS).padStart(2, "0")} // {currentCard.sub}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-white group-hover:translate-x-1 transition-transform">
                      <span className="text-pink-400">{nextHint}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 06: WARP SPEED CONNECT & TELEMETRY */}
              {currentCardId === "contact" && (
                <div id="contact" data-section="contact" className="flex flex-col justify-between h-full space-y-4">
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                    <span className="text-xs uppercase tracking-[0.25em] font-mono font-bold flex items-center gap-2 text-cyan-400">
                      <Mail size={13} className="text-pink-400" />
                      CARD {currentCard.formattedNum} // WARP SPEED CONNECT
                    </span>
                    <span className="text-xs text-cyan-400 font-mono">STATUS: TRANSMISSION READY</span>
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pt-1">
                    <div className="space-y-1">
                      <h2 className="text-2xl sm:text-3xl font-black text-white">Initialize Connection</h2>
                      <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
                        Ready to deploy high-impact web products, interactive user experiences, or lead full-stack engineering initiatives.
                      </p>
                    </div>

                    {/* Direct Contact Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-no-card-click="true">
                      {email && (
                        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-purple-500/30 space-y-2">
                          <span className="text-[10px] font-mono text-cyan-400 uppercase block">DIRECT EMAIL SOCKET</span>
                          <p className="font-bold text-white text-xs truncate">{email}</p>
                          <div className="flex gap-2 pt-1">
                            <a
                              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow"
                            >
                              <Mail size={12} />
                              <span>Compose</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopy(email, "final-email")}
                              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                            >
                              {copiedKey === "final-email" ? <Check size={12} /> : <Copy size={12} />}
                              <span>{copiedKey === "final-email" ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {linkedin && (
                        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-purple-500/30 space-y-2">
                          <span className="text-[10px] font-mono text-cyan-400 uppercase block">PROFESSIONAL NETWORK</span>
                          <p className="font-bold text-white text-xs">LinkedIn Engineering Profile</p>
                          <a
                            href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition mt-1"
                          >
                            <FaLinkedin size={13} className="text-cyan-400" />
                            <span>Connect &rarr;</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Resume / Location telemetry */}
                    <div className="p-3 rounded-2xl bg-slate-950/50 border border-purple-500/20 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <FileText size={14} className="text-cyan-400" />
                        <span>Technical Dossier &amp; Engineering Resume</span>
                      </div>
                      {email && (
                        <a
                          href={`mailto:${email}?subject=Resume%20Request`}
                          className="text-cyan-400 hover:underline font-mono text-[11px]"
                          data-no-card-click="true"
                        >
                          Request PDF &rarr;
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span className="font-mono text-[11px] text-cyan-300">
                        Card {currentCard.formattedNum} / {String(TOTAL_CARDS).padStart(2, "0")} // {currentCard.sub}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-white group-hover:translate-x-1 transition-transform">
                      <span className="text-pink-400">{nextHint}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Cybernetic Bottom Dock */}
      <footer className="shrink-0 z-40 bg-[#050814]/95 backdrop-blur-2xl border-t border-purple-500/20 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Card Prev & Next Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-purple-500/30 text-slate-300 hover:text-white hover:border-purple-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Previous Card (Left Arrow)"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-purple-900/40"
              title="Next Card (Right Arrow / Click Card)"
            >
              <span className="hidden sm:inline font-bold">Next Card</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Interactive Card Dots Indicator */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold text-cyan-400">
              CARD {currentCard.formattedNum} / {String(TOTAL_CARDS).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1.5">
              {CARD_METAS.map((meta, dotIdx) => (
                <button
                  key={meta.id}
                  type="button"
                  onClick={() => goToCard(dotIdx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    safeActiveIndex === dotIdx
                      ? "w-7 bg-gradient-to-r from-cyan-400 to-pink-500 shadow-sm shadow-cyan-400/50"
                      : "w-2 bg-slate-700 hover:bg-slate-500"
                  }`}
                  title={`Jump to ${meta.sub}`}
                />
              ))}
            </div>
          </div>

          {/* Click to Transform Hint */}
          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <Sparkles size={13} className="text-pink-400" />
            <span>Click card or press &rarr; key to warp</span>
          </div>
        </div>
      </footer>

      {/* Deep Dive Case Study Modal */}
      <ProjectDeepDiveModal
        project={inspectedProject}
        onClose={() => setInspectedProject(null)}
        accentColor="#a855f7"
      />

      {/* Document Viewer Modal for Certificates & Offer Letters */}
      <DocumentViewerModal
        doc={viewingDoc}
        onClose={() => setViewingDoc(null)}
      />
    </div>
  );
};

export default AnimatedTemplate;
