import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import Tilt from "react-parallax-tilt";
import toast from "react-hot-toast";
import {
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Globe,
  Star,
  ShieldCheck,
  Briefcase,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Terminal,
  Activity,
  Send,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  RefreshCw,
  X,
  ArrowLeft,
  TrendingUp,
} from 'lucide-react';
import { FaGithub, FaLinkedinIn, FaTwitter, FaEnvelope } from "react-icons/fa";
import { SiReact, SiNextdotjs, SiNodedotjs, SiMongodb } from "react-icons/si";
import CosmicRing from "./CosmicRing";
import PortfolioScoreCard from "./PortfolioScoreCard";
import FloatingBadge from "./FloatingBadge";

const projects = [
  {
    id: 1,
    name: "OmniChain AI • Autonomous Web3 Agent",
    version: "v2.4",
    tagline: "Autonomous multi-chain arbitrage & risk mitigation engine.",
    desc: "Processes 1.2M transactions with real-time risk classification & automated arbitrage execution.",
    tech: ["Next.js", "FastAPI", "TypeScript", "Docker"],
    stars: 342,
    demoUrl: "https://omnichain-ai.demo",
    githubUrl: "https://github.com/anushka/omnichain-ai",
    metrics: [
      { label: "Volume", val: "1.2M+ txns" },
      { label: "P99 Latency", val: "14.2ms" },
      { label: "Uptime", val: "99.99%" },
    ],
    logs: [
      "[09:24:12] Initializing OmniChain Agent v2.4...",
      "[09:24:13] Connected to Ethereum & Solana RPC clusters",
      "[09:24:14] Neural risk model: 14.2ms latency [OPTIMAL]",
      "[09:24:15] Monitoring 42 liquidity pools in real time ⚡",
    ],
  },
  {
    id: 2,
    name: "DevPulse • Real-Time Telemetry Engine",
    version: "v1.8",
    tagline: "Distributed microservice observability pipeline.",
    desc: "Distributed microservice observability pipeline reducing mean-time-to-detection by 46%.",
    tech: ["React 19", "Node.js", "Redis", "Docker"],
    stars: 518,
    demoUrl: "https://devpulse.io",
    githubUrl: "https://github.com/anushka/devpulse",
    metrics: [
      { label: "Ingestion", val: "85k ev/s" },
      { label: "MTTD Cut", val: "-46%" },
      { label: "Hit Ratio", val: "99.4%" },
    ],
    logs: [
      "[09:24:10] Ingesting 85,000 metrics/sec across 12 clusters",
      "[09:24:11] Redis pipeline cache hit ratio: 99.4%",
      "[09:24:12] Prometheus exporter online at port :9090",
      "[09:24:13] Zero anomalies detected in active pods ✅",
    ],
  },
  {
    id: 3,
    name: "NeuralResume • Context-Aware ATS Parser",
    version: "v3.1",
    tagline: "Transformer-based resume optimizer matching 50k+ job specs.",
    desc: "Transformer-based resume optimizer matching candidate skills against 50k+ job descriptions.",
    tech: ["TypeScript", "Next.js", "PostgreSQL", "TailwindCSS"],
    stars: 890,
    demoUrl: "https://neuralresume.ai",
    githubUrl: "https://github.com/anushka/neural-resume",
    metrics: [
      { label: "Corpus", val: "50k+ JDs" },
      { label: "Accuracy", val: "98.6%" },
      { label: "Speed", val: "180ms" },
    ],
    logs: [
      "[09:24:08] Loaded fine-tuned RoBERTa ATS classifier",
      "[09:24:09] Benchmarked against 52,000 FAANG JD patterns",
      "[09:24:10] Extracted 48 verified technical competencies",
      "[09:24:11] Recruiter match probability: 98.6% [TOP 1%]",
    ],
  },
];

const liveEvents = [
  { text: "Senior Recruiter at Microsoft viewed System Architecture", time: "2m ago", icon: "💼" },
  { text: "Razorpay Tech Lead sent a direct recruiter inquiry", time: "8m ago", icon: "⚡" },
  { text: "Developer in Berlin starred OmniChain AI repository", time: "19m ago", icon: "⭐" },
  { text: "ATS Scanner verified 99% keyword compatibility", time: "31m ago", icon: "🎯" },
];

const PortfolioPreview = () => {
  const { user } = useSelector((state) => state.auth);

  // States
  const [activeTheme, setActiveTheme] = useState("modern"); // 'modern' | 'creative' | 'minimal'
  const [viewMode, setViewMode] = useState("portfolio"); // 'portfolio' | 'ats' | 'recruiter'
  const [currentProjectIdx, setCurrentProjectIdx] = useState(0);
  const [projectSubTab, setProjectSubTab] = useState("overview"); // 'overview' | 'terminal' | 'metrics'
  const [copied, setCopied] = useState(false);
  const [isOpenToWork, setIsOpenToWork] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [starCounts, setStarCounts] = useState({ 1: 342, 2: 518, 3: 890 });
  const [starredMap, setStarredMap] = useState({});
  const [isScanning, setIsScanning] = useState(false);
  const [currentEventIdx, setCurrentEventIdx] = useState(0);
  const [dmMessage, setDmMessage] = useState("");
  const [dmSending, setDmSending] = useState(false);
  const [latencyMs, setLatencyMs] = useState(18);

  const [showProjectsExplorer, setShowProjectsExplorer] = useState(false);
  const devName = user?.fullName || "John Doe";
  const devRole = user?.role || "Frontend Developer";
  const devBio = "Crafting beautiful and performant web experiences.";
  const devAvatar =
    user?.avatar ||
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80";
  const userSlug = devName.toLowerCase().replace(/\s+/g, "-");

  // Subtle web audio synthesizer click sound
  const playSound = (type = "click") => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "click") {
        osc.frequency.setValueAtTime(580, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === "star") {
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1040, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === "scan") {
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // AudioContext policy blocked or disabled
    }
  };

  // Cycle live notifications
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEventIdx((prev) => (prev + 1) % liveEvents.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  // Jitter latency slightly for live telemetry feel
  useEffect(() => {
    const pingTimer = setInterval(() => {
      setLatencyMs((prev) => Math.max(12, Math.min(26, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 3000);
    return () => clearInterval(pingTimer);
  }, []);

  const themes = {
    modern: {
      id: "modern",
      name: "Modern",
      cardBg: "from-zinc-900/95 via-zinc-900/85 to-zinc-950/95 border-indigo-500/40 shadow-indigo-500/15",
      accent: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
      pill: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:border-indigo-400/50",
      activePill: "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/30",
      button: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30",
      glow: "from-indigo-600/35 to-purple-600/25",
      highlightBorder: "border-indigo-500/30",
    },
    creative: {
      id: "creative",
      name: "Creative",
      cardBg: "from-slate-950/95 via-zinc-900/85 to-slate-950/95 border-emerald-500/40 shadow-emerald-500/15",
      accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      pill: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:border-emerald-400/50",
      activePill: "bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-500/30",
      button: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30",
      glow: "from-emerald-600/35 to-cyan-600/25",
      highlightBorder: "border-emerald-500/30",
    },
    minimal: {
      id: "minimal",
      name: "Minimal",
      cardBg: "from-zinc-900/95 via-zinc-900/85 to-zinc-950/95 border-zinc-700/80 shadow-white/5",
      accent: "text-zinc-200 bg-white/10 border-white/20",
      pill: "bg-white/5 text-zinc-300 border-white/10 hover:border-white/30",
      activePill: "bg-white text-black border-white shadow-md font-bold",
      button: "bg-white hover:bg-zinc-200 text-black shadow-md font-bold",
      glow: "from-white/20 to-zinc-500/15",
      highlightBorder: "border-white/20",
    },
  };

  const current = themes[activeTheme];
  const activeProj = projects[currentProjectIdx];

  const handleCopyLink = () => {
    playSound("click");
    navigator.clipboard.writeText(`https://portfolioai.me/p/${userSlug}`);
    setCopied(true);
    toast.success(`Copied live link: https://portfolioai.me/p/${userSlug} 🚀`);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleNextProject = () => {
    playSound("click");
    setCurrentProjectIdx((prev) => (prev + 1) % projects.length);
  };

  const handlePrevProject = () => {
    playSound("click");
    setCurrentProjectIdx((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const handleStarProject = (projId) => {
    playSound("star");
    const isStarred = starredMap[projId];
    setStarredMap((prev) => ({ ...prev, [projId]: !isStarred }));
    setStarCounts((prev) => ({
      ...prev,
      [projId]: prev[projId] + (isStarred ? -1 : 1),
    }));

    if (!isStarred) {
      toast.success(`⭐ Starred ${activeProj.name}! (Simulated GitHub Sync)`);
    } else {
      toast("Star removed", { icon: "↩️" });
    }
  };

  const handleRunScan = () => {
    playSound("scan");
    setIsScanning(true);
    toast("🤖 Re-running deep ATS algorithm across 50k job specs...", {
      icon: "🔍",
      duration: 1600,
    });
    setTimeout(() => {
      setIsScanning(false);
      toast.success("✅ Audit Complete: 98/100 • Top 1% of Engineering Portfolios!");
    }, 1500);
  };

  const handleSendDM = (e) => {
    e?.preventDefault();
    if (!dmMessage.trim()) {
      toast.error("Please enter a short note or select an inquiry option.");
      return;
    }
    playSound("click");
    setDmSending(true);
    setTimeout(() => {
      setDmSending(false);
      setViewMode("portfolio");
      setDmMessage("");
      toast.success(`📬 Direct note sent to ${devName}! Auto-reply forwarded to recruiter dashboard.`);
    }, 1000);
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-4 sm:py-6 w-full max-w-xl mx-auto select-none">
      {/* 1. REAL-TIME TICKER BANNER (ABOVE CARD) */}
      <div className="w-full mb-3 flex items-center justify-between px-3 py-1.5 rounded-full bg-zinc-950/80 border border-white/10 backdrop-blur-xl text-[11px] shadow-lg">
        <div className="flex items-center gap-2 overflow-hidden min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-zinc-400 shrink-0 font-medium">LIVE:</span>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentEventIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-1.5 truncate text-zinc-300"
            >
              <span>{liveEvents[currentEventIdx].icon}</span>
              <span className="truncate">{liveEvents[currentEventIdx].text}</span>
              <span className="text-[10px] text-zinc-500 shrink-0">
                • {liveEvents[currentEventIdx].time}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 shrink-0 pl-2">
          {/* Sound FX Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              toast(soundEnabled ? "Sound effects muted 🔇" : "Sound effects enabled 🔊", {
                duration: 1200,
              });
            }}
            title={soundEnabled ? "Mute interactive UI audio" : "Enable interactive UI audio"}
            className="p-1 rounded-md bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            {soundEnabled ? <Volume2 size={13} className="text-emerald-400" /> : <VolumeX size={13} />}
          </button>
        </div>
      </div>

      {/* COSMIC ORBITAL RING (FROM DESIGN) */}
      <CosmicRing />

      {/* 2. FLOATING BADGES (MATCHING DESIGN IN SCREENSHOT) */}
      {/* Top-Right Badge: ATS Score +98% */}
      <FloatingBadge
        icon={<TrendingUp size={14} className="text-emerald-400" />}
        text="ATS Score"
        subtext="+98% ↗ Top Tier"
        className="-right-3 sm:-right-8 -top-3 hidden sm:flex"
        delay={0.1}
        active={viewMode === "ats"}
        onClick={() => {
          playSound("click");
          setViewMode("ats");
          toast("📊 Switched to ATS Deep Scan View", { icon: "⚡" });
        }}
      />

      {/* Middle-Right Badge: Improved Content */}
      <FloatingBadge
        icon={<CheckCircle2 size={14} className="text-emerald-400" />}
        text="Improved Content"
        subtext="AI Optimized Impact Points"
        className="-right-4 sm:-right-10 top-32 hidden sm:flex"
        delay={0.25}
        onClick={() => {
          playSound("click");
          toast.success("✨ Content enhanced with AI action verbs!");
        }}
      />

      {/* Bottom-Right Badge: Published Live on web */}
      <FloatingBadge
        icon={<Globe size={14} className="text-cyan-400" />}
        text="Published"
        subtext="Live on web"
        className="-right-3 sm:-right-8 -bottom-3 hidden sm:flex"
        delay={0.4}
        onClick={() => {
          playSound("click");
          handleCopyLink();
        }}
      />

      {/* Bottom-Left Badge: AI Suggestion */}
      <FloatingBadge
        icon={<Sparkles size={14} className="text-purple-400" />}
        text="AI Suggestion"
        subtext="Optimize your project descriptions"
        className="-left-3 sm:-left-10 -bottom-3 hidden sm:flex"
        delay={0.5}
        onClick={() => {
          playSound("click");
          toast("💡 Tip: Quantify achievements to boost recruiter response rate!", {
            icon: "💡",
          });
        }}
      />

      {/* 3. MAIN 3D PARALLAX TILT CARD (TILTED TOWARDS LEFT IN 3D) */}
      <div className="w-full [perspective:1400px] [transform:rotate(-2deg)] transition-all duration-500">
        <Tilt
          tiltMaxAngleX={10}
          tiltMaxAngleY={10}
          tiltAngleXInitial={4}
          tiltAngleYInitial={8}
          perspective={1200}
          scale={1.01}
          transitionSpeed={1400}
          glareEnable={true}
          glareMaxOpacity={0.08}
          glareColor="#ffffff"
          glarePosition="all"
          className="w-full"
        >
          <motion.div
            layout
            className={`relative w-full rounded-3xl border border-indigo-500/30 border-l-indigo-400/50 border-b-purple-500/50 bg-gradient-to-b ${current.cardBg} p-5 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_35px_rgba(99,102,241,0.2)] backdrop-blur-2xl transition-all duration-500 overflow-hidden text-left`}
          >
            {/* Top-left glass corner bracket accent (from design) */}
            <div className="absolute top-3.5 left-3.5 w-3 h-3 border-t-2 border-l-2 border-white/25 rounded-tl-sm pointer-events-none" />

            {/* Top-right starlight sparkle accent (from design) */}
            <div className="absolute top-4 right-14 text-white/50 text-[10px] pointer-events-none animate-pulse">
              ✦
            </div>

            {/* Ambient Glow */}
            <div
              className={`absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br ${current.glow} blur-[90px] pointer-events-none transition-all duration-700`}
            />

          {/* Scanner laser beam effect during live audit */}
          {isScanning && (
            <motion.div
              initial={{ top: 0, opacity: 0.8 }}
              animate={{ top: "100%", opacity: [0.8, 1, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10B981] z-50 pointer-events-none"
            />
          )}

          {/* 4. MAC WINDOW HEADER & VIEW TABS (ALWAYS ACCESSIBLE AT ALL TIMES) */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] relative z-10 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {/* Traffic light dots */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div
                  onClick={() => {
                    playSound("click");
                    setViewMode("portfolio");
                  }}
                  title="Close to Portfolio"
                  className="w-2.5 h-2.5 rounded-full bg-rose-500/80 cursor-pointer hover:opacity-100 transition"
                />
                <div
                  onClick={() => {
                    playSound("click");
                    setViewMode("ats");
                  }}
                  title="ATS Scan"
                  className="w-2.5 h-2.5 rounded-full bg-amber-500/80 cursor-pointer hover:opacity-100 transition"
                />
                <div
                  onClick={() => {
                    playSound("click");
                    setViewMode("recruiter");
                  }}
                  title="Recruiter Note"
                  className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 cursor-pointer hover:opacity-100 transition"
                />
              </div>

              {/* Live URL Pill with One-Click Copy */}
              <button
                onClick={handleCopyLink}
                title="Click to copy public link"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-[11px] text-zinc-300 font-mono transition cursor-pointer group truncate max-w-[170px] sm:max-w-[200px]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="truncate">portfolioai.me/p/{userSlug}</span>
                {copied ? (
                  <Check size={11} className="text-emerald-400 shrink-0" />
                ) : (
                  <Copy size={11} className="text-zinc-500 group-hover:text-white shrink-0" />
                )}
              </button>
            </div>

            {/* View Mode Toggle: Portfolio vs ATS Scan vs Recruiter Note */}
            <div className="flex items-center gap-1 bg-black/40 border border-white/[0.08] p-1 rounded-xl shrink-0">
              <button
                onClick={() => {
                  playSound("click");
                  setViewMode("portfolio");
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  viewMode === "portfolio"
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Portfolio
              </button>
              <button
                onClick={() => {
                  playSound("click");
                  setViewMode("ats");
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  viewMode === "ats"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <ShieldCheck size={11} className="text-emerald-400" />
                <span>ATS Scan</span>
              </button>

              {viewMode === "recruiter" && (
                <button
                  onClick={() => {
                    playSound("click");
                    setViewMode("recruiter");
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm flex items-center gap-1"
                >
                  <Briefcase size={11} className="text-purple-400" />
                  <span>DM Note</span>
                </button>
              )}
            </div>
          </div>

          {/* 5. THEME SWITCHER DOCK (ALWAYS ACCESSIBLE AT ALL TIMES) */}
          <div className="mt-3 flex items-center justify-between text-xs relative z-10 pt-0.5">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal size={11} className="text-indigo-400" />
              <span>Theme:</span>
            </span>

            <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-xl border border-white/5">
              {Object.values(themes).map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    playSound("click");
                    setActiveTheme(t.id);
                  }}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    activeTheme === t.id
                      ? `${t.button} scale-105`
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === "portfolio" ? (
              /* VIEW 1: INTERACTIVE LIVE PORTFOLIO */
              <motion.div
                key="portfolio-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Developer Bio Header (Matching Screenshot Layout) */}
                <div className="mt-4 flex items-start justify-between gap-4 relative z-10">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                      {devName}
                    </h3>
                    <p className="text-xs sm:text-sm text-indigo-300 font-medium mt-0.5 truncate">
                      {devRole}
                    </p>
                    <p className="text-xs text-zinc-400 font-normal mt-1 leading-relaxed">
                      {devBio}
                    </p>

                    {/* Social Profiles Row */}
                    <div className="flex items-center gap-2 mt-3">
                      <a
                        href="https://github.com"
                        target="_blank"
                        rel="noreferrer"
                        title="GitHub Profile"
                        className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer"
                      >
                        <FaGithub size={12} />
                      </a>
                      <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noreferrer"
                        title="LinkedIn Profile"
                        className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer"
                      >
                        <FaLinkedinIn size={11} />
                      </a>
                      <a
                        href="https://twitter.com"
                        target="_blank"
                        rel="noreferrer"
                        title="Twitter Profile"
                        className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer"
                      >
                        <FaTwitter size={11} />
                      </a>
                      <button
                        onClick={() => {
                          playSound("click");
                          setViewMode("recruiter");
                        }}
                        title="Send Direct Note"
                        className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer"
                      >
                        <FaEnvelope size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Circular Avatar on Right */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 shadow-xl">
                      <div className="w-full h-full rounded-full overflow-hidden bg-zinc-950 flex items-center justify-center">
                        <img
                          src={devAvatar}
                          alt={devName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    {/* Active Availability Indicator */}
                    <button
                      onClick={() => {
                        playSound("click");
                        setIsOpenToWork(!isOpenToWork);
                        toast(isOpenToWork ? "Status: Booking Q3 Projects 🟣" : "Status: Available for Hire 🟢");
                      }}
                      title="Toggle availability status"
                      className="absolute bottom-0 right-0 cursor-pointer transition active:scale-90"
                    >
                      <span className="w-4 h-4 rounded-full border-2 border-zinc-950 bg-emerald-500 flex items-center justify-center shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      </span>
                    </button>
                  </div>
                </div>

                {/* Tech Stack Pills (Matching Screenshot) */}
                <div className="pt-2 relative z-10">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                    Tech Stack
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: "React", icon: <SiReact className="text-[#06b6d4]" size={13} /> },
                      { name: "Next.js", icon: <SiNextdotjs className="text-white" size={13} /> },
                      { name: "Node.js", icon: <SiNodedotjs className="text-[#22c55e]" size={13} /> },
                      { name: "MongoDB", icon: <SiMongodb className="text-[#10b981]" size={13} /> },
                    ].map((tech) => (
                      <div
                        key={tech.name}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/20 text-xs font-semibold text-zinc-200 transition"
                      >
                        {tech.icon}
                        <span>{tech.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. PORTFOLIO SCORE CARD & RING GAUGE (96% CIRCULAR RING) */}
                <PortfolioScoreCard className="mt-2 relative z-10" />

                {/* Interactive Project Showcase Drawer Toggle */}
                <div className="pt-1 flex items-center justify-between relative z-10">
                  <button
                    onClick={() => {
                      playSound("click");
                      setShowProjectsExplorer(!showProjectsExplorer);
                    }}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition cursor-pointer py-1 group"
                  >
                    <Code2 size={13} className="group-hover:rotate-12 transition-transform" />
                    <span>{showProjectsExplorer ? "Hide Live Projects" : "Explore Featured Projects & Logs (3)"}</span>
                    <span className="text-[10px] text-zinc-500">
                      {showProjectsExplorer ? "▲" : "▼"}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      playSound("click");
                      setViewMode("ats");
                    }}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
                  >
                    <ShieldCheck size={13} />
                    <span>Deep ATS Scan</span>
                  </button>
                </div>

                {/* 6. FEATURED PROJECTS CARD (EXPANDABLE DRAWER) */}
                {showProjectsExplorer && (
                  <div className="space-y-4 relative z-10 pt-2 border-t border-white/[0.08] mt-2">
                    <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Code2 size={12} className="text-indigo-400" />
                      <span>Featured Projects (Live Preview)</span>
                    </span>

                    {/* Interactive Carousel Navigator */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {currentProjectIdx + 1} / {projects.length}
                      </span>
                      <button
                        onClick={handlePrevProject}
                        title="Previous Project"
                        className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition cursor-pointer border border-white/5"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <button
                        onClick={handleNextProject}
                        title="Next Project"
                        className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition cursor-pointer border border-white/5"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Active Project Box */}
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] p-3.5 transition group/proj">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                            {activeProj.name}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                            {activeProj.version}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                          {activeProj.desc}
                        </p>
                      </div>

                      {/* External Action Links & Interactive Star */}
                      <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                        {/* Interactive Star Button */}
                        <button
                          onClick={() => handleStarProject(activeProj.id)}
                          title="Star this repository on GitHub"
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                            starredMap[activeProj.id]
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : "bg-white/5 hover:bg-white/15 text-zinc-300 border-white/10"
                          }`}
                        >
                          <Star
                            size={12}
                            className={starredMap[activeProj.id] ? "fill-amber-400 text-amber-400" : ""}
                          />
                          <span>{starCounts[activeProj.id]}</span>
                        </button>

                        <button
                          onClick={() => {
                            playSound("click");
                            toast.success(`Opening GitHub: ${activeProj.name}`);
                          }}
                          title="View GitHub Repository"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition cursor-pointer"
                        >
                          <FaGithub size={13} />
                        </button>

                        <button
                          onClick={() => {
                            playSound("click");
                            toast.success(`Launching Live Demo: ${activeProj.name} 🚀`);
                          }}
                          title="Launch Live Demo"
                          className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition cursor-pointer"
                        >
                          <ExternalLink size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Sub-Tabs: Overview | Live Console | Telemetry */}
                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            playSound("click");
                            setProjectSubTab("overview");
                          }}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition cursor-pointer ${
                            projectSubTab === "overview"
                              ? "bg-white/15 text-white"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          Stack
                        </button>
                        <button
                          onClick={() => {
                            playSound("click");
                            setProjectSubTab("terminal");
                          }}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                            projectSubTab === "terminal"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          <Terminal size={10} />
                          <span>Console</span>
                        </button>
                        <button
                          onClick={() => {
                            playSound("click");
                            setProjectSubTab("metrics");
                          }}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                            projectSubTab === "metrics"
                              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          <Activity size={10} />
                          <span>Metrics</span>
                        </button>
                      </div>

                      {/* Carousel Indicator Dots */}
                      <div className="flex items-center gap-1">
                        {projects.map((p, i) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              playSound("click");
                              setCurrentProjectIdx(i);
                            }}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${
                              currentProjectIdx === i ? "w-4 bg-indigo-400" : "w-1.5 bg-white/20 hover:bg-white/40"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Sub-Tab Content */}
                    <div className="mt-2.5">
                      {projectSubTab === "overview" && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {activeProj.tech.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-mono text-zinc-300 bg-black/50 px-2 py-0.5 rounded border border-white/5"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {projectSubTab === "terminal" && (
                        <div className="p-2.5 rounded-xl bg-black/80 border border-white/10 font-mono text-[10px] text-emerald-400/90 space-y-1">
                          {activeProj.logs.map((log, idx) => (
                            <div key={idx} className="truncate flex items-center gap-1.5">
                              <span className="text-zinc-600 select-none">&gt;</span>
                              <span>{log}</span>
                            </div>
                          ))}
                          <div className="flex items-center gap-1 text-zinc-500">
                            <span>$</span>
                            <span className="w-1.5 h-3 bg-emerald-400 animate-pulse inline-block" />
                          </div>
                        </div>
                      )}

                      {projectSubTab === "metrics" && (
                        <div className="grid grid-cols-3 gap-2">
                          {activeProj.metrics.map((m, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded-xl bg-black/40 border border-white/5 text-center"
                            >
                              <div className="text-[10px] text-zinc-400">{m.label}</div>
                              <div className="text-xs font-bold text-white mt-0.5">{m.val}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 7. ATS MATCH SCORE SECTION */}
                <div className="pt-3 border-t border-white/[0.08] relative z-10">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-400" />
                      <span className="font-bold text-zinc-200 text-[11px]">
                        ATS Match Score
                      </span>
                    </div>

                    <button
                      onClick={handleRunScan}
                      title="Run live recalculation"
                      className="font-black text-emerald-400 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Sparkles size={11} />
                      <span>98 / 100 • Exceptional</span>
                      <RefreshCw size={10} className={`ml-0.5 ${isScanning ? "animate-spin" : ""}`} />
                    </button>
                  </div>

                  {/* Gradient Progress Bar */}
                  <div className="mt-2.5 h-2 w-full rounded-full bg-zinc-800/80 overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: isScanning ? ["98%", "40%", "98%"] : "98%" }}
                      transition={{ duration: isScanning ? 1.4 : 1.2, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 shadow-sm shadow-emerald-400/50"
                    />
                  </div>

                    <div className="mt-2 flex justify-between text-[10px] text-zinc-400 font-medium">
                      <span>Keyword Match: 99%</span>
                      <span>Formatting: 100%</span>
                      <span>Mobile Ready: Yes</span>
                    </div>
                  </div>
                  </div>
                )}
              </motion.div>
            ) : viewMode === "ats" ? (
              /* VIEW 2: INTERACTIVE ATS SCAN AUDIT */
              <motion.div
                key="ats-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mt-4 space-y-3.5 relative z-10"
              >
                {/* Back to Portfolio bar inside ATS */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <button
                    onClick={() => {
                      playSound("click");
                      setViewMode("portfolio");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer border border-white/10"
                  >
                    <ArrowLeft size={13} />
                    <span>Back to Portfolio</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        playSound("click");
                        setViewMode("recruiter");
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold transition cursor-pointer"
                    >
                      <Briefcase size={12} className="text-purple-400" />
                      <span>3 Recruiter DMs</span>
                    </button>
                    <button
                      onClick={() => {
                        playSound("click");
                        setViewMode("portfolio");
                      }}
                      className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition cursor-pointer border border-white/10"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Overall ATS Readiness
                    </span>
                    <h4 className="text-xl font-black text-white">98 / 100 — Exceptional</h4>
                  </div>
                  <div className="text-right text-[11px] text-emerald-300 font-medium">
                    <span>Tier-1 Qualified</span>
                    <span className="block text-[10px] text-zinc-400">Google • Stripe • Razorpay</span>
                  </div>
                </div>

                {/* Audit Checklist */}
                <div className="space-y-2 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Live AI Enhancements Detected
                  </span>

                  <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span className="text-zinc-200 text-[11px]">Action Verbs ("Architected", "Deployed")</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">+12%</span>
                  </div>

                  <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span className="text-zinc-200 text-[11px]">Quantified Impact ("1.2M txns, 46% speed")</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">+18%</span>
                  </div>

                  <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span className="text-zinc-200 text-[11px]">Missing Keywords Integrated (Docker, Redis)</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">+14%</span>
                  </div>
                </div>

                {/* Recruiter Simulation Trigger */}
                <div className="pt-1">
                  <button
                    onClick={handleRunScan}
                    disabled={isScanning}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Activity size={14} className={isScanning ? "animate-spin" : ""} />
                    <span>{isScanning ? "Analyzing 50k Job Specs..." : "Run Live Recruiter Simulation"}</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* VIEW 3: IN-CARD RECRUITER DISPATCH NOTE (EASILY DISMISSIBLE & CONNECTED) */
              <motion.div
                key="recruiter-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mt-4 space-y-3 relative z-10"
              >
                {/* Top Navigation Bar with Direct Return & ATS Shortcuts */}
                <div className="flex items-center justify-between pb-2.5 border-b border-white/10 gap-2">
                  <button
                    onClick={() => {
                      playSound("click");
                      setViewMode("portfolio");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer border border-white/10 shadow-sm"
                  >
                    <ArrowLeft size={13} />
                    <span>Back to Portfolio</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        playSound("click");
                        setViewMode("ats");
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition cursor-pointer"
                      title="Switch directly to ATS Score"
                    >
                      <ShieldCheck size={12} className="text-emerald-400" />
                      <span>ATS Score (98%)</span>
                    </button>

                    <button
                      onClick={() => {
                        playSound("click");
                        setViewMode("portfolio");
                      }}
                      title="Close and return"
                      className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition cursor-pointer border border-white/10"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                      <Briefcase size={15} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                        Direct Recruiter Dispatch
                      </span>
                      <h4 className="text-sm font-bold text-white">Contact {devName}</h4>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-purple-300 font-medium">
                    <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                      Priority Inbox
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  Send a direct dispatch to <strong className="text-white">{devName}</strong>. Simulates real-time recruiter message routing.
                </p>

                {/* Quick Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "👋 Staff / Senior Role Inquiry",
                    "🚀 Early-Stage Founding Engineer",
                    "☕ 15-min Tech Chat",
                  ].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => {
                        playSound("click");
                        setDmMessage(chip);
                      }}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] transition cursor-pointer text-left ${
                        dmMessage === chip
                          ? "bg-purple-600 text-white border-purple-400 shadow-sm"
                          : "bg-white/5 hover:bg-white/15 text-zinc-300 border-white/10"
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSendDM}>
                  <textarea
                    rows={3}
                    value={dmMessage}
                    onChange={(e) => setDmMessage(e.target.value)}
                    placeholder="Type your message or role details here..."
                    className="w-full rounded-xl bg-black/60 border border-white/15 p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition resize-none"
                  />
                </form>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      playSound("click");
                      setViewMode("portfolio");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    Cancel &amp; Return
                  </button>
                  <button
                    onClick={handleSendDM}
                    disabled={dmSending}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-purple-600/30 flex items-center gap-1.5"
                  >
                    {dmSending ? (
                      <span>Delivering...</span>
                    ) : (
                      <>
                        <Send size={12} />
                        <span>Send Recruiter Note</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Tilt>
      </div>

      {/* 9. BOTTOM TELEMETRY BAR */}
      <div className="w-full mt-3 flex items-center justify-between px-3 text-[10px] text-zinc-500">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Edge Ping: {latencyMs}ms</span>
          <span>•</span>
          <span>SSL 256-bit Encrypted</span>
        </div>
        <span className="text-zinc-500 hover:text-zinc-300 transition cursor-pointer">
          Powered by PortfolioAI v2.4
        </span>
      </div>
    </div>
  );
};

export default PortfolioPreview;
