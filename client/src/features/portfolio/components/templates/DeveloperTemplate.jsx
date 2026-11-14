import { useState, useEffect, useRef } from "react";
import {
  Terminal,
  GitBranch,
  GitCommit,
  ExternalLink,
  Award,
  ShieldCheck,
  Mail,
  Cpu,
  Activity,
  Play,
  Check,
  Copy,
  ChevronRight,
  Monitor,
  CornerDownLeft,
  Camera,
  Sparkles,
  Radio,
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
  TerminalBinaryStreamCanvas,
  ExperienceCredentialsBadges,
  DiffThemeBanner,
} from "./motionComponents";

const DeveloperTemplate = ({ portfolio, onEditPhoto, isOwner, previewDevice }) => {
  const [inspectedProject, setInspectedProject] = useState(null);
  const isMobile = previewDevice === "mobile" || portfolio?._previewDevice === "mobile";
  const {
    name = "",
    tagline = "Full Stack Systems Engineer",
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
    email = contact?.email,
    title,
  } = portfolio || {};

  const avatar = portfolio?.avatar || portfolio?.hero?.avatar || "";
  const displayName = name || portfolio?.name || portfolio?.hero?.name || title?.replace(/portfolio/i, "").trim() || "Developer";

  // Interactive Terminal State
  const [cliInput, setCliInput] = useState("");
  const [commandHistory, setCommandHistory] = useState([
    {
      cmd: "curl -s https://api.profile/init",
      output: `System initialized for ${displayName}. Type "help" to view all available commands.`,
      type: "system",
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [enteredCmds, setEnteredCmds] = useState([]);
  const cliEndRef = useRef(null);

  // Live Telemetry & CRT Mode
  const [crtMode, setCrtMode] = useState(true);
  const [systemUptime, setSystemUptime] = useState("99.98%");
  const [cpuUsage, setCpuUsage] = useState(14);
  const [copiedKey, setCopiedKey] = useState(null);
  const [selectedTag, setSelectedTag] = useState("ALL");

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(10 + Math.random() * 18));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    cliEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [commandHistory]);

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    const rawCmd = cliInput.trim();
    if (!rawCmd) return;

    const cmdLower = rawCmd.toLowerCase();
    setEnteredCmds((prev) => [...prev, rawCmd]);
    setHistoryIndex(-1);
    setCliInput("");

    let response = "";
    let type = "output";

    switch (cmdLower) {
      case "help":
        response = `AVAILABLE COMMANDS:
  whoami     - Print developer profile & credentials
  skills     - List technical dependencies & stack (${skills.length} detected)
  projects   - Display built systems & repository repositories
  bio        - Read README.md / professional summary
  contact    - Print active communication sockets (email, github, linkedin)
  hire       - Run automated hiring handshake protocol
  crt        - Toggle CRT scanline & retro monitor effect
  uptime     - Query server health & telemetry
  clear      - Clear terminal buffer`;
        break;
      case "whoami":
        response = `${displayName} // ${tagline}\nStatus: Ready for high-concurrency architecture & full stack contracts.`;
        break;
      case "skills":
        response = `STACK MATRIX (${skills.length} packages):\n${skills.map((s, i) => `  [${i + 1}] npm:${s.toLowerCase().replace(/\s+/g, "-")}`).join("\n")}`;
        break;
      case "projects":
        response = `REPOSITORIES (${projects.length} builds):\n${projects.map((p, i) => `  * ${p.title} -> ${p.impact || p.description?.slice(0, 60)}...`).join("\n")}`;
        break;
      case "bio":
        response = about || "No bio.txt found on root partition.";
        break;
      case "contact":
        response = `SOCKETS:\n  Email: ${email || "N/A"}\n  GitHub: ${github || "N/A"}\n  LinkedIn: ${linkedin || "N/A"}`;
        break;
      case "hire":
      case "sudo hire":
        response = `🤝 HANDSHAKE INITIATED! Opening communication bridge with ${displayName}...`;
        if (email) {
          window.open(
            `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=Engineering+Opportunity`,
            "_blank",
          );
        }
        break;
      case "crt":
        setCrtMode((prev) => !prev);
        response = `CRT scanline emulation toggled: ${!crtMode ? "ENABLED" : "DISABLED"}`;
        break;
      case "uptime":
        response = `System Uptime: 421 days, 14 hours | Latency: 18ms | CPU: ${cpuUsage}% | Memory: 4.1GB/16GB`;
        break;
      case "clear":
        setCommandHistory([]);
        return;
      default:
        response = `bash: command not found: "${rawCmd}". Type "help" for valid commands.`;
        type = "error";
    }

    setCommandHistory((prev) => [
      ...prev,
      { cmd: rawCmd, output: response, type },
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      if (enteredCmds.length > 0) {
        const nextIdx = historyIndex === -1 ? enteredCmds.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIdx);
        setCliInput(enteredCmds[nextIdx]);
      }
    } else if (e.key === "ArrowDown") {
      if (historyIndex !== -1) {
        const nextIdx = historyIndex + 1;
        if (nextIdx < enteredCmds.length) {
          setHistoryIndex(nextIdx);
          setCliInput(enteredCmds[nextIdx]);
        } else {
          setHistoryIndex(-1);
          setCliInput("");
        }
      }
    }
  };

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied to clipboard: ${text} 📋`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filter projects by tag
  const filteredProjects = projects.filter((p) => {
    if (selectedTag === "ALL") return true;
    return Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
  });

  return (
    <div
      className={`min-h-screen bg-[#090d12] text-[#c9d1d9] font-mono selection:bg-emerald-500/20 selection:text-emerald-300 relative ${
        crtMode ? "crt-active" : ""
      }`}
    >
      {/* Interactive Terminal Data Streams Background Canvas */}
      <TerminalBinaryStreamCanvas color="#10b981" opacity={0.16} />

      {/* Background Matrix/Subtle Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:32px_32px]" />
      <InteractiveCursorFollower color="rgba(16, 185, 129, 0.12)" size={520} blur={95} />

      {/* CRT Scanline Overlay when enabled */}
      {crtMode && (
        <div
          className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[radial-gradient(rgba(16,185,129,0.2)_1px,transparent_0)] bg-[size:100%_3px]"
          style={{ mixBlendMode: "overlay" }}
        />
      )}

      {/* Top Telemetry Diagnostic HUD Bar */}
      <header className="sticky top-0 z-40 bg-[#0d1117]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-2.5 text-xs text-zinc-400">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              SYS://READY
            </span>
            <span className="hidden sm:inline text-zinc-500">|</span>
            <span className="hidden sm:flex items-center gap-1">
              <Activity size={12} className="text-indigo-400" />
              <span>CPU: {cpuUsage}%</span>
            </span>
            <span className="hidden md:inline text-zinc-500">|</span>
            <span className="hidden md:inline">UPTIME: {systemUptime}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCrtMode(!crtMode)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                crtMode
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:text-white"
              }`}
              title="Toggle CRT Scanlines"
            >
              <Monitor size={11} />
              <span>CRT: {crtMode ? "ON" : "OFF"}</span>
            </button>
            <a
              href="#interactive-terminal"
              className="px-2.5 py-1 rounded bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:text-white text-[11px] font-bold transition"
            >
              Open Live CLI ↓
            </a>
          </div>
        </div>
      </header>

      <main className={`max-w-4xl mx-auto py-8 sm:py-12 space-y-10 sm:space-y-16 overflow-x-hidden w-full ${isMobile ? "px-3" : "px-4 sm:px-6"}`}>
        {/* Terminal Masthead / Hero Window */}
        <motion.div
          id="hero"
          data-section="about"
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="rounded-2xl border border-zinc-800 bg-[#161b22] shadow-2xl overflow-hidden scroll-mt-24 w-full"
        >
          {/* Mac-style Window Titlebar */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-[#0d1117] border-b border-zinc-800 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-rose-500/80 shrink-0"></span>
              <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-amber-500/80 shrink-0"></span>
              <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-emerald-500/80 shrink-0"></span>
              <span className="ml-1 sm:ml-3 text-[11px] sm:text-xs text-zinc-400 font-bold font-mono truncate max-w-[150px] sm:max-w-none">
                {displayName.toLowerCase().replace(/\s+/g, "-")}@dev-cluster: ~
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-zinc-500 shrink-0">
              <GitBranch size={12} className="text-emerald-400 shrink-0" />
              <span className="font-mono">{isMobile ? "prod*" : "branch: production*"}</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* AI Theme Optimization Banner (in diff mode) */}
            {portfolio?._showDiff && portfolio?._isTemplateAIHighlighted && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-indigo-950/60 border-2 border-emerald-500/60 text-xs font-mono flex items-center justify-between gap-3 shadow-xl">
                <div className="flex items-center gap-2.5">
                  <Sparkles size={16} className="text-emerald-400 shrink-0" />
                  <span className="text-zinc-200">
                    <strong className="text-white">AI Layout Theme:</strong> Applied{" "}
                    <span className="text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                      Terminal Dev
                    </span>{" "}
                    (Original:{" "}
                    <span className="text-rose-300 line-through bg-rose-950/40 px-1.5 py-0.5 rounded">
                      {portfolio._aiOriginalTemplate || "Modern"}
                    </span>
                    ) &mdash; Tailored for Engineering Recruiter ATS &amp; Architecture Screenings.
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shrink-0 hidden sm:inline-block">
                  Optimal Theme
                </span>
              </div>
            )}

            {/* AI Theme Optimization Banner (in diff mode) */}
            {portfolio?._showDiff && (portfolio?._isTemplateAIHighlighted || portfolio?._aiOriginalTemplate) && (
              <DiffThemeBanner
                originalTemplate={portfolio._aiOriginalTemplate || "Modern"}
                suggestedTemplate="Developer Terminal"
                className="mb-4"
              />
            )}

            {/* Automatic Boot Sequence Banner (triggers immediately on open!) */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 text-[11px] font-mono text-emerald-300 space-y-1 shadow-inner"
            >
              <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                <span>[INIT: DEVELOPER KERNEL v2.4 // MOUNTED]</span>
                <span className="flex items-center gap-1.5 text-emerald-300 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LATENCY: 18ms
                </span>
              </div>
              <p>&gt; Initializing runtime architecture for <span className="text-white font-bold">{displayName}</span>... <span className="text-emerald-400 font-bold">READY</span></p>
              <p className="text-zinc-400 text-[10px]">&gt; Dependencies: {skills.length} packages &bull; Repos: {projects.length} verified builds &bull; Status: Available for hire</p>
            </motion.div>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                <Terminal size={12} />
                <span>$ whoami --verbose</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-1">
                {avatar && (
                  <div className="relative group shrink-0">
                    <PulseAura
                      colors={["#10b981", "#059669", "#34d399"]}
                      size="130%"
                      blur="18px"
                      opacity={0.35}
                    />
                    <TiltCard maxTilt={15} perspective={800} className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 relative z-10">
                      <div className="w-full h-full rounded-2xl border-2 border-emerald-500/40 p-1 bg-black/60 shadow-lg shadow-emerald-500/20 relative group overflow-hidden">
                        <img
                          src={avatar}
                          alt={displayName}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            e.currentTarget.parentElement.style.display = "none";
                          }}
                        />
                        {/* Camera hover trigger for photo changing */}
                        {onEditPhoto && (
                          <button
                            type="button"
                            onClick={onEditPhoto}
                            className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer text-white z-20"
                            title="Change Avatar Photo"
                          >
                            <Camera size={18} className="text-emerald-400" />
                            <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-300">
                              Edit
                            </span>
                          </button>
                        )}
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#161b22] animate-pulse" />
                      </div>
                    </TiltCard>
                  </div>
                )}

                <div className="space-y-1 flex-1">
                  <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                    <ShimmerText
                      gradient="linear-gradient(90deg, #10b981 0%, #34d399 35%, #a7f3d0 50%, #10b981 100%)"
                      className="inline-block"
                    >
                      {displayName}
                    </ShimmerText>
                  </h1>

                  {portfolio?._isTaglineAIHighlighted && portfolio?._showDiff && portfolio?._aiOriginalTagline ? (
                    <div className="space-y-2 pt-2">
                      <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-xs font-mono">
                        <div className="text-rose-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                          ❌ Before (Original Tagline):
                        </div>
                        <p className="text-rose-200/80 line-through leading-relaxed">
                          &gt; {portfolio._aiOriginalTagline}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-950/50 border-2 border-emerald-500/60 text-xs font-mono shadow-lg shadow-emerald-950/50">
                        <div className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 mb-1">
                          <Sparkles size={11} className="text-emerald-400" />
                          <span>✅ After (AI Optimized Tagline):</span>
                        </div>
                        <p className="text-emerald-300 font-semibold leading-relaxed flex items-center gap-1.5">
                          <span>&gt;</span>
                          <span>{tagline}</span>
                          <span className="inline-block w-1.5 h-3.5 bg-emerald-400 animate-pulse ml-0.5" />
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-emerald-400 text-sm sm:text-base font-semibold flex items-center gap-2">
                      <span>&gt;</span>
                      <span>{tagline}</span>
                      <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-1" />
                    </p>
                  )}
                </div>
              </div>
            </div>

            {about && (
              <div className="space-y-2 border-t border-zinc-800/80 pt-4 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <p className="text-zinc-500 font-mono text-xs flex items-center gap-1.5">
                    <Play size={10} className="text-emerald-400" />
                    <span>cat README.md</span>
                  </p>
                  {portfolio?._isAboutAIHighlighted && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                      <Sparkles size={10} className="text-emerald-400" />
                      <span>AI OPTIMIZED BIO</span>
                    </span>
                  )}
                </div>

                {portfolio?._isAboutAIHighlighted && portfolio?._showDiff && portfolio?._aiOriginalAbout ? (
                  <div className="space-y-2 pt-1">
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 text-xs font-mono">
                      <div className="text-rose-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                        ❌ Before (Original Bio)
                      </div>
                      <p className="text-rose-200/80 text-xs leading-relaxed font-sans line-through">
                        {portfolio._aiOriginalAbout}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-950/50 border-2 border-emerald-500/60 text-xs font-mono shadow-lg shadow-emerald-950/50">
                      <div className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 mb-1">
                        <Sparkles size={11} className="text-emerald-400" />
                        <span>✅ After (AI Optimized Bio)</span>
                      </div>
                      <p className="text-emerald-200 text-xs sm:text-sm leading-relaxed font-sans">
                        {about}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-300 leading-relaxed font-sans pt-1">
                    {about}
                  </p>
                )}
              </div>
            )}

            {/* Live Interactive Action Pills */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {email && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(email, "email")}
                  className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer"
                  title="Copy direct email socket"
                >
                  {copiedKey === "email" ? <Check size={13} /> : <Mail size={13} />}
                  <span>{copiedKey === "email" ? "socket copied!" : "ping email"}</span>
                </button>
              )}

              {github && (
                <a
                  href={github.startsWith("http") ? github : `https://${github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-300 text-xs hover:text-white hover:border-zinc-500 transition flex items-center gap-1.5"
                >
                  <FaGithub size={13} />
                  <span>git remote: github</span>
                </a>
              )}

              {linkedin && (
                <a
                  href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-300 text-xs hover:text-white hover:border-zinc-500 transition flex items-center gap-1.5"
                >
                  <FaLinkedin size={13} />
                  <span>profile: linkedin</span>
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Interactive Telemetry Stats Ledger */}
        <ScrollReveal delay={0.1}>
          <section className={`grid gap-2.5 sm:gap-3 ${isMobile ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
            {[
              { label: "Build Repos", val: `${projects.length || 6}`, tag: "git log --oneline" },
              { label: "Stack Packages", val: `${skills.length || 12}`, tag: "npm ls --depth=0" },
              { label: "System Uptime", val: systemUptime, tag: "uptime -p" },
              { label: "CLI Core", val: "BASH v5.2", tag: "exec echo $SHELL" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -2, scale: 1.01 }}
                className="p-3 sm:p-4 rounded-xl bg-[#161b22] border border-zinc-800/90 text-left space-y-1 relative overflow-hidden group shadow-md min-w-0"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition" />
                <p className="text-[9px] sm:text-[10px] text-zinc-500 font-mono font-semibold truncate">{stat.tag}</p>
                <p className="text-xl sm:text-2xl font-black text-white font-mono flex items-center gap-1.5 min-w-0">
                  <span className="text-emerald-400 shrink-0">&gt;</span>
                  <span className="truncate">{stat.val}</span>
                </p>
                <p className="text-[10px] sm:text-xs font-bold text-zinc-400 font-mono uppercase tracking-wider truncate">{stat.label}</p>
              </motion.div>
            ))}
          </section>
        </ScrollReveal>

        {/* Technical Dependencies & Stack */}
        {skills?.length > 0 && (
          <motion.section
            id="skills"
            data-section="skills"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4 scroll-mt-24 w-full"
          >
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
              <h2 className="text-xs uppercase tracking-widest text-emerald-400 flex items-center gap-2 font-bold">
                <Terminal size={14} />
                <span>dependencies &amp; stack packages ({skills.length})</span>
              </h2>
              <span className="text-[11px] text-zinc-500 font-mono">package.json</span>
            </div>

            {/* Continuous Terminal Dependency Marquee */}
            <div className={`py-1 overflow-hidden border-y border-zinc-800/80 bg-zinc-950/40 w-full max-w-full ${isMobile ? "mx-0" : "-mx-2 sm:-mx-4"}`}>
              <KineticMarquee
                items={skills}
                speed={25}
                renderItem={(skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#161b22] border border-zinc-800 text-[10px] sm:text-[11px] font-mono text-zinc-300 shrink-0"
                  >
                    <span className="text-emerald-400">npm i</span>
                    <span className="font-bold text-white">{typeof skill === "string" ? skill.toLowerCase().replace(/\s+/g, "-") : skill}</span>
                  </span>
                )}
              />
            </div>

            <div className={`grid gap-2 sm:gap-2.5 ${isMobile ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"}`}>
              {skills.map((skill, idx) => (
                <MagneticPill key={idx}>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-[#161b22] border border-zinc-800/90 text-[11px] sm:text-xs text-zinc-200 font-mono hover:border-emerald-500/60 hover:text-emerald-300 transition flex items-center justify-between group shadow-sm cursor-default min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 truncate min-w-0 flex-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 group-hover:scale-125 transition shrink-0" />
                      <span className="truncate">{skill}</span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-zinc-600 font-mono font-bold group-hover:text-emerald-500/60 ml-1 shrink-0">
                      ^v{(idx % 5) + 1}.0
                    </span>
                  </div>
                </MagneticPill>
              ))}
            </div>
          </motion.section>
        )}

        {/* Repositories & Builds (Projects) */}
        {projects?.length > 0 && (
          <ScrollReveal direction="up" delay={0.15}>
            <section id="projects" data-section="projects" className="space-y-4 scroll-mt-24">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-2">
                <h2 className="text-xs uppercase tracking-widest text-emerald-400 flex items-center gap-2 font-bold">
                  <GitCommit size={14} />
                  <span>verified builds &amp; repositories</span>
                </h2>

                {/* Tag filters */}
                <div className="flex flex-wrap gap-1 text-[11px]">
                  {["ALL", "REACT", "NODE", "AI", "SYSTEMS"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition cursor-pointer ${
                        selectedTag === tag
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      #{tag.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredProjects.map((proj, idx) => {
                  const projectUrl = proj.live || proj.url || proj.link || proj.github;
                  const safeProjectUrl = projectUrl
                    ? projectUrl.startsWith("http")
                      ? projectUrl
                      : `https://${projectUrl}`
                    : null;

                  return (
                    <Perspective3DCard
                      key={idx}
                      maxTilt={7}
                      glareColor="rgba(16, 185, 129, 0.16)"
                      glowBorderColor="rgba(16, 185, 129, 0.5)"
                      className={`p-4 sm:p-6 rounded-2xl bg-[#161b22] border transition-all space-y-3 shadow-md group cursor-pointer w-full overflow-hidden ${
                        proj._isAIHighlighted
                          ? "border-emerald-500/70 ring-2 ring-emerald-500/30 shadow-xl shadow-emerald-950/60"
                          : "border-zinc-800/90 hover:border-emerald-500/50"
                      }`}
                      onClick={() => setInspectedProject(proj)}
                      data-inspect-project="true"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white flex items-center gap-2 group-hover:text-emerald-300 transition">
                            <span className="text-emerald-400 font-mono">~/builds/</span>
                            <span>{proj.title}</span>
                          </h3>
                          {proj._isAIHighlighted && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1 shrink-0">
                              <Sparkles size={10} className="text-emerald-400" />
                              <span>AI Optimized</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectedProject(proj);
                            }}
                            className="px-2.5 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition flex items-center gap-1 cursor-pointer"
                          >
                            <span>inspect //</span>
                          </button>
                          {proj.live && (
                            <a
                              href={proj.live}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 hover:bg-emerald-500/20 flex items-center gap-1 font-bold transition"
                            >
                              <ExternalLink size={11} />
                              <span>live</span>
                            </a>
                          )}
                          {proj.github && (
                            <a
                              href={proj.github}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition"
                            >
                              <FaGithub size={12} />
                              <span>src</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {proj._isAIHighlighted ? (
                        <div className="space-y-2 mt-1">
                          {proj._showDiff && proj._aiOriginalDescription && (
                            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 text-xs font-mono">
                              <div className="text-rose-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                                ❌ Before (Original Description)
                              </div>
                              <p className="text-rose-200/80 text-xs leading-relaxed font-sans line-through">
                                {proj._aiOriginalDescription}
                              </p>
                            </div>
                          )}
                          <div className="p-3 rounded-xl bg-emerald-950/50 border-2 border-emerald-500/60 text-xs font-mono shadow-lg shadow-emerald-950/50">
                            <div className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 mb-1">
                              <Sparkles size={11} className="text-emerald-400" />
                              <span>✅ After (AI Optimized)</span>
                            </div>
                            <p className="text-emerald-200 text-xs sm:text-sm leading-relaxed font-sans">
                              {proj.description}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
                          {proj.description}
                        </p>
                      )}

                      {proj.impact && (
                        <div className="p-2.5 rounded-lg bg-[#0d1117] border border-emerald-500/20 text-xs text-emerald-400 font-mono flex items-center gap-2">
                          <Activity size={12} className="shrink-0 text-emerald-400" />
                          <span>METRIC: {proj.impact}</span>
                        </div>
                      )}

                      {proj.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {proj.tags.map((t, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded bg-[#0d1117] text-zinc-500 border border-zinc-800/90 font-mono"
                            >
                              npm:{t.toLowerCase().replace(/\s+/g, "-")}
                            </span>
                          ))}
                        </div>
                      )}
                    </Perspective3DCard>
                  );
                })}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Experience - Git Commit Timeline */}
        {experience?.length > 0 && (
          <motion.section
            id="experience"
            data-section="experience"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4 scroll-mt-24"
          >
            <h2 className="text-xs uppercase tracking-widest text-emerald-400 flex items-center gap-2 font-bold border-b border-zinc-800/80 pb-2">
              <GitBranch size={14} />
              <span>git commit history // career milestones</span>
            </h2>

            <div className="space-y-3 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-[1px] before:bg-zinc-800">
              {experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="relative pl-10 p-5 rounded-2xl bg-[#161b22] border border-zinc-800/90 hover:border-zinc-700 transition space-y-2"
                >
                  <span className="absolute left-2.5 top-6 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#161b22]" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                    <span className="font-bold text-white text-sm">
                      commit [{idx + 1}]: {exp.role} @ {exp.company}
                    </span>
                    <span className="text-emerald-400 font-mono text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded self-start sm:self-auto">
                      {exp.duration}
                    </span>
                  </div>

                  {exp._isAIHighlighted ? (
                    <div className="space-y-2 mt-1">
                      {exp._showDiff && exp._aiOriginalDescription && (
                        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 text-xs font-mono">
                          <div className="text-rose-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                            ❌ Before (Original)
                          </div>
                          <p className="text-rose-200/80 text-xs leading-relaxed font-sans line-through">
                            {exp._aiOriginalDescription}
                          </p>
                        </div>
                      )}
                      <div className="p-3 rounded-xl bg-emerald-950/50 border-2 border-emerald-500/60 text-xs font-mono shadow-lg shadow-emerald-950/50">
                        <div className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 mb-1">
                          <Sparkles size={11} className="text-emerald-400" />
                          <span>✅ After (AI Optimized)</span>
                        </div>
                        <p className="text-emerald-200 text-xs sm:text-sm leading-relaxed font-sans">
                          {exp.description}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                      {exp.description}
                    </p>
                  )}

                  <ExperienceCredentialsBadges exp={exp} />
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Interactive Live Command Terminal (THE STAR USER-INTERACTIVE FEATURE!) */}
        <section id="interactive-terminal" className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-widest text-emerald-400 flex items-center gap-2 font-bold">
              <Terminal size={14} />
              <span>interactive bash session // type commands below</span>
            </h2>
            <span className="text-[11px] text-zinc-500 font-mono">
              Try: "help", "whoami", "skills", "projects", "hire", "crt"
            </span>
          </div>

          <div className="rounded-2xl border border-emerald-500/40 bg-[#0d1117] p-5 shadow-2xl space-y-4 overflow-hidden font-mono text-xs">
            {/* Terminal History */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2 scrollbar-thin">
              {commandHistory.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <span>$</span>
                    <span>{item.cmd}</span>
                  </div>
                  <pre
                    className={`whitespace-pre-wrap pl-4 font-mono leading-relaxed ${
                      item.type === "error"
                        ? "text-rose-400"
                        : item.type === "system"
                        ? "text-zinc-400 italic"
                        : "text-zinc-300"
                    }`}
                  >
                    {item.output}
                  </pre>
                </div>
              ))}
              <div ref={cliEndRef} />
            </div>

            {/* Prompt Input Form */}
            <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 border-t border-zinc-800 pt-3">
              <span className="text-emerald-400 font-bold">$</span>
              <input
                type="text"
                value={cliInput}
                onChange={(e) => setCliInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="type a command (e.g. 'help', 'skills', 'hire')..."
                className="flex-1 bg-transparent text-emerald-300 placeholder-zinc-600 focus:outline-none font-mono text-xs"
                autoFocus={false}
              />
              <button
                type="submit"
                className="px-3 py-1 rounded bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition cursor-pointer flex items-center gap-1"
              >
                <span>EXEC</span>
                <CornerDownLeft size={11} />
              </button>
            </form>
          </div>
        </section>

        {/* Honors, Certifications & Education */}
        {(achievements?.length > 0 || certifications?.length > 0 || education?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {achievements?.length > 0 && (
              <div className="p-5 rounded-2xl bg-[#161b22] border border-zinc-800 space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-emerald-400 flex items-center gap-2 font-bold font-mono">
                  <Award size={14} />
                  <span>honors &amp; awards</span>
                </h3>
                <div className="space-y-2">
                  {achievements.map((ach, idx) => (
                    <div key={idx} className="text-xs border-b border-zinc-800/60 pb-2 last:border-0">
                      <span className="font-bold text-white">{ach.title}</span>
                      {ach.description && <p className="text-zinc-400 text-[11px] pt-0.5">{ach.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {certifications?.length > 0 && (
              <div className={`p-5 rounded-2xl bg-[#161b22] border space-y-3 ${
                certifications.some((c) => c._isAICertHighlighted)
                  ? "border-emerald-500/70 shadow-lg shadow-emerald-950/50"
                  : "border-zinc-800"
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-widest text-emerald-400 flex items-center gap-2 font-bold font-mono">
                    <ShieldCheck size={14} />
                    <span>industry certifications ({certifications.length})</span>
                  </h3>
                  {certifications.some((c) => c._isAICertHighlighted) && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                      <Sparkles size={10} className="text-emerald-400" />
                      <span>AI Target</span>
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {certifications.map((cert, idx) => (
                    <div
                      key={idx}
                      className={`text-xs p-2.5 rounded-xl border transition ${
                        cert._isAICertHighlighted
                          ? "bg-emerald-950/35 border-emerald-500/50 text-emerald-200"
                          : "border-zinc-800/60 bg-zinc-900/40 text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white font-mono">{cert.name}</span>
                        {cert._isAICertHighlighted && (
                          <span className="text-[10px] text-emerald-400 font-mono">★ AI Recommended</span>
                        )}
                      </div>
                      <p className="text-emerald-400 text-[11px] font-mono">
                        {cert.issuer || "Accredited"} {cert.date ? `• ${cert.date}` : ""}
                      </p>
                      {cert.description && (
                        <p className="text-zinc-400 text-[11px] pt-1 font-sans">{cert.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {education?.length > 0 && (
              <div className="p-5 rounded-2xl bg-[#161b22] border border-zinc-800 space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-emerald-400 flex items-center gap-2 font-bold font-mono">
                  <ShieldCheck size={14} />
                  <span>academic credentials</span>
                </h3>
                <div className="space-y-2">
                  {education.map((edu, idx) => (
                    <div key={idx} className="text-xs border-b border-zinc-800/60 pb-2 last:border-0">
                      <span className="font-bold text-white">{edu.institution}</span>
                      <p className="text-emerald-400 text-[11px]">{edu.degree} ({edu.year})</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Communication Sockets / Contact */}
        <section
          id="contact"
          data-section="contact"
          className="p-6 rounded-2xl bg-[#161b22] border border-zinc-800 space-y-4 scroll-mt-24 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 font-mono">
            <h2 className="text-xs uppercase tracking-widest text-emerald-400 flex items-center gap-2 font-bold">
              <Radio size={14} className="text-emerald-400 animate-pulse" />
              <span>active communication sockets // contact channel</span>
            </h2>
            <span className="text-[11px] text-zinc-500">STATUS: LISTENING</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            {email && (
              <button
                type="button"
                onClick={() => copyToClipboard(email, "footer-email")}
                className="p-3.5 rounded-xl bg-[#0d1117] border border-zinc-800 hover:border-emerald-500/50 text-left transition group cursor-pointer"
              >
                <span className="text-zinc-500 text-[10px] block">SOCKET 01: EMAIL</span>
                <span className="text-white font-bold group-hover:text-emerald-300 transition truncate block pt-0.5">
                  {email}
                </span>
                <span className="text-[10px] text-emerald-400 mt-1 block">
                  {copiedKey === "footer-email" ? "Copied!" : "Click to copy"}
                </span>
              </button>
            )}
            {github && (
              <a
                href={github.startsWith("http") ? github : `https://${github}`}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl bg-[#0d1117] border border-zinc-800 hover:border-emerald-500/50 text-left transition group block"
              >
                <span className="text-zinc-500 text-[10px] block">SOCKET 02: REPOSITORY</span>
                <span className="text-white font-bold group-hover:text-emerald-300 transition truncate block pt-0.5">
                  github.com/profile
                </span>
                <span className="text-[10px] text-emerald-400 mt-1 block">Open source remote &rarr;</span>
              </a>
            )}
            {linkedin && (
              <a
                href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl bg-[#0d1117] border border-zinc-800 hover:border-emerald-500/50 text-left transition group block"
              >
                <span className="text-zinc-500 text-[10px] block">SOCKET 03: PROFESSIONAL</span>
                <span className="text-white font-bold group-hover:text-emerald-300 transition truncate block pt-0.5">
                  linkedin.com/profile
                </span>
                <span className="text-[10px] text-emerald-400 mt-1 block">Network profile &rarr;</span>
              </a>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-zinc-800 text-center text-xs text-zinc-600 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <p>$ exit 0 • Verified Developer Terminal</p>
          <p className="text-emerald-500/80">LATENCY: 18ms • STATUS: 200 OK</p>
        </footer>
      </main>

      <ProjectDeepDiveModal
        project={inspectedProject}
        onClose={() => setInspectedProject(null)}
        accentColor="#10b981"
      />
    </div>
  );
};

export default DeveloperTemplate;
