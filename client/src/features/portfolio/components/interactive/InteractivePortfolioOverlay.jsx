import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Search,
  X,
  Filter,
  Sparkles,
  Share2,
  ArrowUp,
  Mail,
  Phone,
  ExternalLink,
  Check,
  Copy,
  Send,
  MessageSquare,
  Terminal,
  Volume2,
  VolumeX,
  Palette,
  Bot,
  ChevronRight,
  Briefcase,
  Flame,
  BookOpen,
  Smartphone,
  FileText,
} from 'lucide-react';
import { FaGithub, FaLinkedin } from "react-icons/fa";
import toast from "react-hot-toast";
import {
  getGmailComposeUrl,
  getOutlookComposeUrl,
  parseMailto,
} from "../../../../utils/contactUtils";
import { ProjectDeepDiveModal } from "../templates/motionComponents";

// ==========================================
// Web Audio API Synthesizer (Zero Dependencies)
// ==========================================
let sharedAudioCtx = null;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  try {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtxClass) return null;
    if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
      sharedAudioCtx = new AudioCtxClass();
    }
    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
};

// Global user gesture listener to unlock Web Audio on first interaction
if (typeof window !== "undefined") {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    window.removeEventListener("pointerdown", unlockAudio);
    window.removeEventListener("keydown", unlockAudio);
  };
  window.addEventListener("pointerdown", unlockAudio, { once: true, passive: true });
  window.addEventListener("keydown", unlockAudio, { once: true, passive: true });
}

const playTone = (ctx, freq, startTime, duration, peakGain = 0.2, waveType = "sine") => {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = waveType;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  } catch {
    // Ignore audio node setup errors
  }
};

const playSoundEffect = (type = "click", enabled = true) => {
  if (!enabled || typeof window === "undefined") return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const executeSound = () => {
      const t = ctx.currentTime;

      switch (type) {
        case "sound-on": {
          // Energetic ascending triad (C5 -> E5 -> G5 -> C6)
          playTone(ctx, 523.25, t, 0.09, 0.22, "triangle");
          playTone(ctx, 659.25, t + 0.07, 0.1, 0.24, "triangle");
          playTone(ctx, 783.99, t + 0.14, 0.12, 0.25, "triangle");
          playTone(ctx, 1046.5, t + 0.21, 0.22, 0.28, "sine");
          break;
        }

        case "sound-off": {
          // Subtle descending tone
          playTone(ctx, 659.25, t, 0.08, 0.16, "sine");
          playTone(ctx, 440.0, t + 0.07, 0.12, 0.14, "sine");
          break;
        }

        case "success": {
          // Warm success chord
          playTone(ctx, 523.25, t, 0.1, 0.22, "triangle");
          playTone(ctx, 659.25, t + 0.07, 0.11, 0.24, "triangle");
          playTone(ctx, 783.99, t + 0.14, 0.12, 0.25, "triangle");
          playTone(ctx, 1046.5, t + 0.21, 0.22, 0.26, "sine");
          break;
        }

        case "pop": {
          // Upward bubble sweep
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(450, t);
          osc.frequency.exponentialRampToValueAtTime(1150, t + 0.08);

          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.exponentialRampToValueAtTime(0.24, t + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.09);
          break;
        }

        case "terminal": {
          // Crisp 8-bit blip
          playTone(ctx, 1200, t, 0.04, 0.16, "square");
          break;
        }

        case "click":
        default: {
          // Modern snappy UI click
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(950, t);
          osc.frequency.exponentialRampToValueAtTime(420, t + 0.05);

          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.exponentialRampToValueAtTime(0.2, t + 0.006);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.06);
          break;
        }
      }
    };

    if (ctx.state === "suspended") {
      ctx.resume().then(executeSound).catch(() => {});
    } else {
      executeSound();
    }
  } catch {
    // Audio context may be restricted by browser policy
  }
};


// ==========================================
// Theme Color Mood Presets
// ==========================================
const COLOR_MOODS = [
  { id: "indigo", name: "Electric Indigo", hex: "#6366f1", rgb: "99, 102, 241" },
  { id: "violet", name: "Neon Violet", hex: "#a855f7", rgb: "168, 85, 247" },
  { id: "cyan", name: "Cyber Cyan", hex: "#06b6d4", rgb: "6, 182, 212" },
  { id: "emerald", name: "Matrix Emerald", hex: "#10b981", rgb: "16, 185, 129" },
  { id: "amber", name: "Sunset Gold", hex: "#f59e0b", rgb: "245, 158, 11" },
];

const InteractivePortfolioOverlay = ({
  portfolio,
  templateKey = "modern",
  onFilterChange,
  activeTag = "ALL",
  searchQuery = "",
  totalProjectsCount = 0,
  filteredProjectsCount = 0,
  children,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  // Interactive controls state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeMood, setActiveMood] = useState(COLOR_MOODS[0]);

  // Project inspect modal
  const [inspectedProject, setInspectedProject] = useState(null);

  // Copied feedback
  const [copiedField, setCopiedField] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });

  // Terminal state
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState([
    { text: "PortfolioAI Interactive Terminal v2.4 initialized.", type: "system" },
    { text: "Type 'help' to view all available commands.", type: "muted" },
  ]);
  const terminalBottomRef = useRef(null);

  // AI Copilot state
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState([
    {
      role: "assistant",
      text: `Hello! I'm ${portfolio?.name || "the developer"}'s AI Portfolio Copilot. Ask me anything about their engineering experience, architecture stack, or key projects!`,
    },
  ]);

  // Direct message composer form
  const [messageForm, setMessageForm] = useState({
    senderName: "",
    senderEmail: "",
    subject: "",
    body: "",
  });

  const {
    name = "Developer",
    title = "Software Engineer",
    tagline = "",
    about = "",
    email = portfolio?.contact?.email || portfolio?.email || "",
    phone = portfolio?.contact?.phone || portfolio?.phone || "",
    github = portfolio?.contact?.github || portfolio?.github || "",
    linkedin = portfolio?.contact?.linkedin || portfolio?.linkedin || "",
    website = portfolio?.contact?.website || portfolio?.website || "",
    skills = [],
    projects = [],
    experience = [],
    achievements = [],
    certifications = [],
  } = portfolio || {};

  // Extract unique project tags
  const allTags = useMemo(() => {
    const tagsMap = new Map();
    (projects || []).forEach((proj) => {
      if (Array.isArray(proj.tags)) {
        proj.tags.forEach((tag) => {
          if (typeof tag === "string" && tag.trim()) {
            const clean = tag.trim();
            tagsMap.set(clean, (tagsMap.get(clean) || 0) + 1);
          }
        });
      }
    });
    return Array.from(tagsMap.entries()).sort((a, b) => b[1] - a[1]);
  }, [projects]);

  // Track scroll progress and active section with multi-container support
  useEffect(() => {
    const handleScroll = (e) => {
      let scrollTop = window.scrollY;
      let totalScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;

      // Handle scrolls from inside preview modals or containers
      if (e && e.target && e.target !== document && e.target !== window && e.target.scrollHeight) {
        scrollTop = e.target.scrollTop;
        totalScroll = e.target.scrollHeight - e.target.clientHeight;
      }

      if (totalScroll > 0) {
        const currentProgress = (scrollTop / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
      setShowScrollTop(scrollTop > 250);

      // Section spy across all common IDs and data attributes
      const sections = ["contact", "achievements", "experience", "projects", "skills", "about", "hero"];
      for (const sec of sections) {
        const el =
          document.getElementById(sec) ||
          document.querySelector(`[data-section="${sec}"]`) ||
          document.querySelector(`[id*="${sec}"]`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 250 && rect.bottom >= 80) {
            setActiveSection(sec);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", handleScroll, { capture: true });
  }, []);

  // Track cursor for ambient spotlight
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("pointermove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMouseMove);
  }, []);

  const scrollToSectionRef = useRef();

  // Global project tag click delegator: clicking any '#tag' filters projects dynamically!
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const tagElem =
        e.target.closest("[data-project-tag]") ||
        (e.target.innerText?.startsWith("#") && e.target.closest("span, button"));

      if (tagElem) {
        const rawTag =
          tagElem.getAttribute("data-project-tag") ||
          tagElem.innerText.replace(/^#/, "").trim();
        if (rawTag && rawTag.length < 30) {
          e.preventDefault();
          e.stopPropagation();
          playSoundEffect("pop", soundEnabled);
          onFilterChange?.({ tag: rawTag, query: "" });
          scrollToSectionRef.current?.("projects");
          toast.success(`Filtered projects by #${rawTag} 🚀`);
        }
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, [onFilterChange, soundEnabled]);

  // Global project card inspect click listener
  useEffect(() => {
    const handleInspectClick = (e) => {
      const trigger = e.target.closest("[data-inspect-project]");
      if (trigger) {
        const idx = trigger.getAttribute("data-inspect-project");
        const targetProj = projects[parseInt(idx, 10)];
        if (targetProj) {
          e.preventDefault();
          e.stopPropagation();
          playSoundEffect("pop", soundEnabled);
          setInspectedProject(targetProj);
        }
      }
    };
    document.addEventListener("click", handleInspectClick);
    return () => document.removeEventListener("click", handleInspectClick);
  }, [projects, soundEnabled]);

  // Terminal scroll to bottom
  useEffect(() => {
    if (isTerminalOpen) {
      terminalBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalHistory, isTerminalOpen]);

  // Globally intercept any mailto link clicks within the portfolio
  // to prevent triggering the OS "Select an app to open this 'mailto' link" dialog.
  useEffect(() => {
    const handleMailtoClick = (e) => {
      const link = e.target.closest("a");
      if (link) {
        const href = link.getAttribute("href") || "";
        if (href.toLowerCase().startsWith("mailto:")) {
          e.preventDefault();
          e.stopPropagation();
          const { email: targetEmail, subject, body } = parseMailto(href);
          if (targetEmail) {
            if (navigator.clipboard?.writeText) {
              navigator.clipboard.writeText(targetEmail);
            }
            toast.success(`Opening Gmail for ${targetEmail} (Email copied to clipboard!) 📋`);
            const gmailUrl = getGmailComposeUrl(targetEmail, subject, body);
            window.open(gmailUrl, "_blank", "noopener,noreferrer");
          }
        }
      }
    };

    document.addEventListener("click", handleMailtoClick, true);
    return () => document.removeEventListener("click", handleMailtoClick, true);
  }, []);

  const scrollToTop = () => {
    playSoundEffect("click", soundEnabled);
    const scrollableContainer = document.querySelector(".flex-1.overflow-y-auto, [class*='overflow-y-auto']");
    if (scrollableContainer && scrollableContainer.scrollTop > 0) {
      scrollableContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = useCallback((sectionId) => {
    playSoundEffect("click", soundEnabled);
    setActiveSection(sectionId);

    const aliasMap = {
      skills: ["skills", "competencies", "toolkit", "tech", "dependencies", "stack", "abilities", "technical-skills", "frameworks"],
      projects: ["projects", "work", "creations", "builds", "initiatives", "repositories", "exhibits", "portfolio", "featured-work", "artifacts"],
      experience: ["experience", "career", "trajectory", "timeline", "history", "milestones", "commit-history", "tenure"],
      contact: ["contact", "connect", "comms", "sockets", "dispatch", "footer", "reach-out", "office"],
      about: ["about", "bio", "hero", "overview", "introduction"],
    };

    const targets = aliasMap[sectionId] || [sectionId];
    let targetElem = null;

    // 1. Try exact IDs first
    for (const t of targets) {
      const el = document.getElementById(t);
      if (el) {
        targetElem = el;
        break;
      }
    }

    // 2. Try data-section attribute
    if (!targetElem) {
      for (const t of targets) {
        const el = document.querySelector(`[data-section="${t}"]`);
        if (el) {
          targetElem = el;
          break;
        }
      }
    }

    // 3. Try id containing string
    if (!targetElem) {
      for (const t of targets) {
        const el = document.querySelector(`section[id*="${t}"]`) || document.querySelector(`[id*="${t}"]`);
        if (el) {
          targetElem = el;
          break;
        }
      }
    }

    // 4. Try semantic matching (headings or sections containing the section name)
    if (!targetElem) {
      const headings = document.querySelectorAll("h1, h2, h3, h4, section");
      for (const h of headings) {
        const text = (h.textContent || "").toLowerCase();
        if (targets.some((t) => text.includes(t))) {
          targetElem = h.closest("section") || h;
          break;
        }
      }
    }

    if (targetElem) {
      // Find whether element is in a scrollable ancestor (vertical or horizontal)
      let scrollParent = null;
      let isHorizontalContainer = false;
      let parent = targetElem.parentElement;
      while (parent && parent !== document.body && parent !== document.documentElement) {
        const computed = window.getComputedStyle(parent);
        const overflowY = computed.overflowY;
        const overflowX = computed.overflowX;
        if (overflowX === "auto" || overflowX === "scroll") {
          scrollParent = parent;
          isHorizontalContainer = true;
          break;
        }
        if (overflowY === "auto" || overflowY === "scroll") {
          scrollParent = parent;
          break;
        }
        parent = parent.parentElement;
      }

      if (isHorizontalContainer && scrollParent) {
        targetElem.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      } else if (scrollParent) {
        const parentRect = scrollParent.getBoundingClientRect();
        const elemRect = targetElem.getBoundingClientRect();
        const offset = 85;
        const targetScrollTop = scrollParent.scrollTop + (elemRect.top - parentRect.top) - offset;
        scrollParent.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: "smooth",
        });
      } else {
        const offset = 85;
        const elemTop = targetElem.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
          top: Math.max(0, elemTop),
          behavior: "smooth",
        });
      }
      return;
    }

    // Special fallback for contact: open the sleek direct contact modal if no contact section was found on page!
    if (sectionId === "contact") {
      setIsContactOpen(true);
      toast.success("Opened Direct Communication Channel! 📬");
    }
  }, [soundEnabled]);
  useEffect(() => {
    scrollToSectionRef.current = scrollToSection;
  }, [scrollToSection]);

  const handleCopy = (text, fieldLabel) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldLabel);
    playSoundEffect("success", soundEnabled);
    toast.success(`${fieldLabel} copied to clipboard! 📋`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleShare = async () => {
    playSoundEffect("click", soundEnabled);
    const shareUrl = window.location.href;
    const shareTitle = `${name}'s Portfolio — ${title}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `Check out ${name}'s interactive software portfolio:`,
          url: shareUrl,
        });
        toast.success("Shared successfully! 🎉");
        return;
      } catch {
        // Fallback to copy
      }
    }
    handleCopy(shareUrl, "Portfolio link");
  };

  // Terminal command processor
  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    playSoundEffect("click", soundEnabled);
    const newEntry = [{ text: `$ ${terminalInput}`, type: "command" }];

    switch (cmd) {
      case "help":
        newEntry.push({
          text: "Available commands:\n • skills: List categorized technical proficiencies\n • projects: List engineering projects & live URLs\n • experience: Display career history\n • accolades: Display awards & certifications\n • contact: View email, github, and social links\n • about: Display executive bio\n • hire: Launch direct recruitment workflow\n • clear: Clear terminal output\n • exit: Close terminal",
          type: "output",
        });
        break;
      case "skills":
        newEntry.push({
          text: `Technical Skills (${skills.length}):\n${skills.join(", ") || "Full-stack development"}`,
          type: "output",
        });
        break;
      case "projects":
        newEntry.push({
          text: `Projects (${projects.length}):\n${
            projects
              .map(
                (p, i) =>
                  `[${i + 1}] ${p.title} — ${p.live || p.url || p.github || "Internal Architecture"}`
              )
              .join("\n") || "No projects loaded"
          }`,
          type: "output",
        });
        break;
      case "experience":
        newEntry.push({
          text: `Career Experience:\n${
            experience
              .map((e) => `• ${e.role} @ ${e.company} (${e.duration || "Present"})`)
              .join("\n") || "No experience loaded"
          }`,
          type: "output",
        });
        break;
      case "accolades":
        newEntry.push({
          text: `Honors & Credentials:\n${
            achievements.map((a) => `🏆 ${a.title} (${a.metric || a.date || "Recognized"})`).join("\n") || "None"
          }\n${certifications.map((c) => `📜 ${c.name} — ${c.issuer}`).join("\n") || ""}`,
          type: "output",
        });
        break;
      case "about":
        newEntry.push({
          text: `${name} — ${title}\n${tagline ? `"${tagline}"\n\n` : ""}${about || "Software engineer."}`,
          type: "output",
        });
        break;
      case "contact":
        newEntry.push({
          text: `Contact Info:\n • Email: ${email || "Not specified"}\n • GitHub: ${github || "Not specified"}\n • LinkedIn: ${linkedin || "Not specified"}\n • Website: ${website || "Not specified"}`,
          type: "output",
        });
        break;
      case "hire":
      case "sudo hire":
        newEntry.push({
          text: `🎉 Exceptional choice! Initiating direct communication channel with ${name}...`,
          type: "success",
        });
        playSoundEffect("success", soundEnabled);
        setIsContactOpen(true);
        break;
      case "clear":
        setTerminalHistory([]);
        setTerminalInput("");
        return;
      case "exit":
      case "quit":
        setIsTerminalOpen(false);
        setTerminalInput("");
        return;
      default:
        newEntry.push({
          text: `Command not recognized: '${cmd}'. Type 'help' for available commands.`,
          type: "error",
        });
        break;
    }

    setTerminalHistory((prev) => [...prev, ...newEntry]);
    setTerminalInput("");
  };

  // AI Copilot prompt answerer
  const handleAskAi = (presetQuestion) => {
    const q = presetQuestion || aiQuestion;
    if (!q.trim()) return;

    playSoundEffect("click", soundEnabled);
    const userMsg = { role: "user", text: q };
    setAiQuestion("");

    // Answer deterministically from candidate's rich profile facts
    let answer = "";
    const lower = q.toLowerCase();

    if (lower.includes("skill") || lower.includes("stack") || lower.includes("technolog")) {
      answer = `${name}'s core technical stack includes: ${skills.slice(0, 10).join(", ")}. They specialize in building scalable, production-grade applications with clean software architecture.`;
    } else if (lower.includes("project")) {
      const topProjects = projects.slice(0, 3).map((p) => `"${p.title}" (${p.description?.slice(0, 80)}...)`).join("; ");
      answer = `${name} has built ${projects.length} featured engineering projects including: ${topProjects}. Every project features live deployment and repository inspection.`;
    } else if (lower.includes("experience") || lower.includes("work") || lower.includes("background")) {
      const latest = experience[0];
      answer = latest
        ? `${name} is currently/most recently ${latest.role} at ${latest.company} (${latest.duration || "Present"}). Their scope covers ${latest.description || "full-stack systems development"}.`
        : `${name} has a strong engineering background in modern software design and scalable digital products.`;
    } else if (lower.includes("award") || lower.includes("cert") || lower.includes("honor")) {
      const count = achievements.length + certifications.length;
      answer = `${name} holds ${count} accolades & certified credentials, including ${
        certifications[0]?.name || achievements[0]?.title || "industry-recognized milestones"
      }.`;
    } else if (lower.includes("contact") || lower.includes("hire") || lower.includes("email") || lower.includes("reach")) {
      answer = `You can contact ${name} directly via email at ${email || "their portfolio contact form"} or on LinkedIn at ${linkedin || "their profile"}.`;
    } else {
      answer = `${name} is a ${title} dedicated to high-impact software engineering. With proven expertise across ${skills.slice(0, 5).join(", ")}, they deliver resilient architectures and modern user experiences.`;
    }

    setAiChatHistory((prev) => [...prev, userMsg, { role: "assistant", text: answer }]);
  };

  const isFilterActive = activeTag !== "ALL" || searchQuery.trim() !== "";

  return (
    <div
      className="relative min-h-screen text-slate-100 selection:bg-indigo-500 selection:text-white"
      style={{
        "--portfolio-accent": activeMood.hex,
        "--portfolio-accent-rgb": activeMood.rgb,
      }}
    >
      {/* 1. Dynamic Top Reading & Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 z-[9999] pointer-events-none transition-all duration-150"
        style={{
          width: `${scrollProgress}%`,
          background: `linear-gradient(90deg, ${activeMood.hex} 0%, #ec4899 50%, #8b5cf6 100%)`,
          boxShadow: `0 0 10px ${activeMood.hex}`,
        }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin="0"
        aria-valuemax="100"
      />

      {/* 2. Dynamic Ambient Cursor Spotlight (Desktop only, behind content) */}
      <div
        className="fixed inset-0 pointer-events-none z-30 transition-opacity duration-300 opacity-80 hidden md:block"
        style={{
          background: `radial-gradient(600px circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(${activeMood.rgb}, 0.12), rgba(${activeMood.rgb}, 0.03) 40%, transparent 75%)`,
        }}
      />

      {/* 3. Floating Interactive Top Experience Dock (Differentiated across Templates!) */}
      <header className="fixed top-3 left-1/2 -translate-x-1/2 z-[9100] max-w-4xl w-[95%] sm:w-auto pointer-events-auto transition-all animate-in fade-in slide-in-from-top-3">
        {(() => {
          const tKey = (templateKey || "modern").toLowerCase();

          // Shared micro action icons helper
          const renderMicroTools = (theme = "modern") => {
            const isMinimal = theme === "minimal";
            const isDev = theme === "developer" || theme === "dark";
            const isCyber = theme === "cyberpunk";
            const isCorp = theme === "corporate" || theme === "academic";
            const isGoogle = theme === "google";
            const isDesigner = theme === "designer";
            const isStartup = theme === "startup";

            const btnBaseClass = isMinimal
              ? "p-1.5 border border-black bg-white hover:bg-black hover:text-white text-black transition cursor-pointer"
              : isDev
              ? "p-1.5 rounded hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
              : isCyber
              ? "p-1.5 border border-[#FFE600]/40 text-[#FFE600] hover:bg-[#FFE600] hover:text-black transition cursor-pointer"
              : isCorp
              ? "p-1.5 rounded-lg hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 transition cursor-pointer"
              : isGoogle
              ? "p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-[#4285f4] transition cursor-pointer"
              : isStartup
              ? "p-1.5 rounded-xl hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400 transition cursor-pointer"
              : isDesigner
              ? "p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-rose-300 transition cursor-pointer"
              : "p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer";

            return (
              <div className="flex items-center gap-1">
                {/* Theme Mood Palette Switcher */}
                <div className="relative">
                  <button
                    onClick={() => {
                      playSoundEffect("click", soundEnabled);
                      setIsPaletteOpen(!isPaletteOpen);
                    }}
                    className={btnBaseClass}
                    title="Change Color Mood Accent"
                  >
                    <Palette size={13} style={{ color: activeMood.hex }} />
                  </button>

                  {isPaletteOpen && (
                    <div className="absolute top-10 right-0 p-2 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 shadow-2xl flex gap-1.5 z-[9999] animate-in fade-in zoom-in-95">
                      {COLOR_MOODS.map((mood) => (
                        <button
                          key={mood.id}
                          onClick={() => {
                            playSoundEffect("pop", soundEnabled);
                            setActiveMood(mood);
                            setIsPaletteOpen(false);
                            toast.success(`Theme mood: ${mood.name} ✨`);
                          }}
                          className="w-5 h-5 rounded-full border-2 transition transform hover:scale-125 cursor-pointer"
                          style={{
                            backgroundColor: mood.hex,
                            borderColor: activeMood.id === mood.id ? "#ffffff" : "transparent",
                          }}
                          title={mood.name}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Audio Toggle */}
                <button
                  onClick={() => {
                    const nextState = !soundEnabled;
                    setSoundEnabled(nextState);
                    if (nextState) {
                      playSoundEffect("sound-on", true);
                    } else {
                      playSoundEffect("sound-off", true);
                    }
                    toast(nextState ? "Sound FX: On 🔊" : "Sound FX: Muted 🔇", { icon: nextState ? "🔊" : "🔇" });
                  }}
                  className={btnBaseClass}
                  title={soundEnabled ? "Mute interactive audio" : "Enable interactive audio"}
                >
                  {soundEnabled ? <Volume2 size={13} className="text-emerald-400" /> : <VolumeX size={13} />}
                </button>

                {/* Interactive Terminal Launcher */}
                <button
                  onClick={() => {
                    playSoundEffect("pop", soundEnabled);
                    setIsTerminalOpen(!isTerminalOpen);
                  }}
                  className={btnBaseClass}
                  title="Open Interactive CLI Terminal"
                >
                  <Terminal size={13} />
                </button>

                {/* AI Assistant Launcher */}
                <button
                  onClick={() => {
                    playSoundEffect("pop", soundEnabled);
                    setIsAiCopilotOpen(!isAiCopilotOpen);
                  }}
                  className={btnBaseClass}
                  title="Ask AI about this Portfolio"
                >
                  <Bot size={14} className={isDev ? "text-emerald-400" : isCyber ? "text-[#FFE600]" : "text-purple-400"} />
                </button>
              </div>
            );
          };

          // 1. DEVELOPER TEMPLATE: UNIX CLI TERMINAL NAVIGATION
          if (tKey === "developer") {
            return (
              <nav aria-label="UNIX CLI Navigation" className="flex items-center justify-between sm:justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-xl bg-[#0c1017]/95 backdrop-blur-xl border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)] text-xs font-mono text-emerald-400">
                <div className="flex items-center gap-1.5 cursor-pointer pr-1" onClick={scrollToTop}>
                  <span className="text-emerald-400 font-bold">$</span>
                  <span className="font-bold text-white tracking-tight hidden sm:inline">{name.toLowerCase().replace(/\s+/g, "")}@dev:~$</span>
                  <span className="inline-block w-1.5 h-3.5 bg-emerald-400 animate-pulse" />
                </div>
                <div className="h-4 w-px bg-emerald-500/30 hidden sm:block"></div>
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {[
                    { id: "skills", label: "./skills.sh" },
                    { id: "projects", label: "./projects.sh" },
                    { id: "experience", label: "./career.log" },
                    { id: "contact", label: "./contact.sh" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`px-2 sm:px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer ${
                        activeSection === item.id
                          ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/60 font-bold"
                          : "text-zinc-400 hover:text-emerald-400"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="h-4 w-px bg-emerald-500/30 hidden md:block"></div>
                <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                  <span className="text-emerald-400">PORT:8080</span>
                  <span>•</span>
                  <span>200 OK</span>
                </div>
                <div className="h-4 w-px bg-emerald-500/30"></div>
                {renderMicroTools("developer")}
              </nav>
            );
          }

          // 2. APPLE-INSPIRED TEMPLATE: CUPERTINO FROSTED DYNAMIC CAPSULE
          if (tKey === "apple") {
            return (
              <nav aria-label="Cupertino Capsule Navigation" className="flex items-center justify-between sm:justify-center gap-2 sm:gap-4 px-3 sm:px-5 py-2 rounded-full bg-zinc-950/75 backdrop-blur-3xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-xs text-white">
                <div className="flex items-center gap-2 cursor-pointer pr-1" onClick={scrollToTop}>
                  <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  <span className="font-semibold text-white tracking-tight hidden sm:inline text-[13px]">{name}</span>
                </div>
                <div className="h-3.5 w-px bg-white/20 hidden sm:block"></div>
                <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-full border border-white/10 overflow-x-auto no-scrollbar">
                  {["skills", "projects", "experience", "contact"].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => scrollToSection(sec)}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium capitalize transition cursor-pointer ${
                        activeSection === sec
                          ? "bg-white text-black font-semibold shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
                <div className="h-3.5 w-px bg-white/20"></div>
                {renderMicroTools("apple")}
              </nav>
            );
          }

          // 3. MINIMAL TEMPLATE: SWISS BRUTALIST ARCHITECTURAL BAR
          if (tKey === "minimal") {
            return (
              <nav aria-label="Swiss Architectural Navigation" className="flex items-center justify-between sm:justify-center gap-2 sm:gap-4 px-3 sm:px-5 py-2 bg-[#F5F5F0] border-2 border-black shadow-[4px_4px_0px_0px_#000] text-xs font-mono text-black">
                <div className="flex items-center gap-2 cursor-pointer pr-1" onClick={scrollToTop}>
                  <span className="w-2.5 h-2.5 bg-[#E11D48]" />
                  <span className="font-black text-black tracking-widest hidden sm:inline uppercase">[00: {name}]</span>
                </div>
                <div className="h-4 w-0.5 bg-black hidden sm:block"></div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: "skills", label: "01 // SKILLS" },
                    { id: "projects", label: "02 // WORKS" },
                    { id: "experience", label: "03 // CAREER" },
                    { id: "contact", label: "04 // DISPATCH" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`px-2.5 py-1 text-[11px] font-bold uppercase transition cursor-pointer border ${
                        activeSection === item.id
                          ? "bg-[#E11D48] text-white border-black shadow-[2px_2px_0px_0px_#000]"
                          : "bg-white text-zinc-900 border-black/40 hover:border-black hover:bg-black/5"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="h-4 w-0.5 bg-black"></div>
                {renderMicroTools("minimal")}
              </nav>
            );
          }

          // 4. CREATIVE & ANIMATED TEMPLATES: SYNTHWAVE NEON SPECTRUM BAR
          if (tKey === "creative" || tKey === "animated") {
            return (
              <nav aria-label="Synthwave Neon Navigation" className="flex items-center justify-between sm:justify-center gap-2 sm:gap-4 px-3 sm:px-5 py-2 rounded-2xl bg-zinc-950/90 backdrop-blur-2xl border border-fuchsia-500/50 shadow-[0_0_25px_rgba(236,72,153,0.3)] text-xs text-zinc-200">
                <div className="flex items-center gap-2 cursor-pointer pr-1" onClick={scrollToTop}>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-fuchsia-500"></span>
                  </span>
                  <span className="font-extrabold bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent hidden sm:inline">{name}</span>
                </div>
                <div className="h-4 w-px bg-zinc-800 hidden sm:block"></div>
                <div className="hidden lg:flex items-center gap-0.5 h-3 px-1">
                  {[40, 90, 60, 100, 30].map((h, i) => (
                    <span
                      key={i}
                      className="w-0.5 rounded-full bg-cyan-400 animate-pulse"
                      style={{ height: `${h}%`, animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {[
                    { id: "skills", label: "Skills" },
                    { id: "projects", label: "Creations" },
                    { id: "experience", label: "Journey" },
                    { id: "contact", label: "Connect" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize transition cursor-pointer ${
                        activeSection === item.id
                          ? "bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="h-4 w-px bg-zinc-800"></div>
                {renderMicroTools("creative")}
              </nav>
            );
          }

          // 5. CYBERPUNK TEMPLATE: TACTICAL MILITARY HUD
          if (tKey === "cyberpunk") {
            return (
              <nav aria-label="Cyber HUD Navigation" className="flex items-center justify-between sm:justify-center gap-2 sm:gap-4 px-3 sm:px-5 py-2 bg-black/95 border-2 border-[#FFE600] shadow-[0_0_20px_rgba(255,230,0,0.3)] text-xs font-mono text-[#FFE600]">
                <div className="flex items-center gap-2 cursor-pointer pr-1" onClick={scrollToTop}>
                  <span className="w-2 h-2 bg-[#FFE600] animate-ping" />
                  <span className="font-black text-[#FFE600] tracking-wider hidden sm:inline">// HUD // {name.toUpperCase()}</span>
                </div>
                <div className="h-4 w-px bg-[#FFE600]/40 hidden sm:block"></div>
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {[
                    { id: "skills", label: "[:: TECH ::]" },
                    { id: "projects", label: "[:: BUILDS ::]" },
                    { id: "experience", label: "[:: OPS ::]" },
                    { id: "contact", label: "[:: COMMS ::]" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`px-2.5 py-1 text-[11px] font-mono uppercase font-bold transition cursor-pointer ${
                        activeSection === item.id
                          ? "bg-[#FFE600] text-black font-black shadow-[0_0_10px_#FFE600]"
                          : "text-[#FFE600]/70 hover:text-[#FFE600] hover:bg-[#FFE600]/10"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="h-4 w-px bg-[#FFE600]/40"></div>
                {renderMicroTools("cyberpunk")}
              </nav>
            );
          }

          // 6. CORPORATE / PROFESSIONAL TEMPLATES: EXECUTIVE GOLD & NAVY RIBBON
          if (tKey === "corporate" || tKey === "professional") {
            return (
              <nav aria-label="Executive Dossier Navigation" className="flex items-center justify-between sm:justify-center gap-2 sm:gap-4 px-3 sm:px-5 py-2 rounded-xl bg-[#0c1527]/95 backdrop-blur-xl border border-amber-500/40 shadow-2xl text-xs text-slate-200">
                <div className="flex items-center gap-2 cursor-pointer pr-1" onClick={scrollToTop}>
                  <Briefcase size={13} className="text-amber-400" />
                  <span className="font-bold text-white tracking-wide hidden sm:inline">{name} <span className="text-amber-400 text-[10px] font-mono">| EXEC</span></span>
                </div>
                <div className="h-4 w-px bg-amber-500/30 hidden sm:block"></div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: "skills", label: "Governance" },
                    { id: "projects", label: "Initiatives" },
                    { id: "experience", label: "Tenure" },
                    { id: "contact", label: "Direct Office" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                        activeSection === item.id
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="h-4 w-px bg-amber-500/30"></div>
                {renderMicroTools("corporate")}
              </nav>
            );
          }

          // 7. GOOGLE INSPIRED TEMPLATE: MATERIAL 3 DYNAMIC FLOATING PILL
          if (tKey === "google") {
            return (
              <nav aria-label="Google Material Navigation" className="flex items-center justify-between sm:justify-center gap-2 sm:gap-4 px-3 sm:px-5 py-2 rounded-full bg-[#282a2c]/95 backdrop-blur-2xl border border-zinc-700/70 shadow-2xl text-xs text-zinc-300">
                <div className="flex items-center gap-1.5 cursor-pointer pr-1" onClick={scrollToTop}>
                  <span className="w-2 h-2 rounded-full bg-[#4285f4]" />
                  <span className="w-2 h-2 rounded-full bg-[#ea4335]" />
                  <span className="w-2 h-2 rounded-full bg-[#fbbc05]" />
                  <span className="w-2 h-2 rounded-full bg-[#34a853]" />
                  <span className="font-semibold text-white tracking-tight hidden sm:inline ml-1">{name}</span>
                </div>
                <div className="h-4 w-px bg-zinc-700 hidden sm:block"></div>
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {[
                    { id: "skills", label: "Stack" },
                    { id: "projects", label: "Knowledge" },
                    { id: "experience", label: "History" },
                    { id: "contact", label: "Contact" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
                        activeSection === item.id
                          ? "bg-[#4285f4] text-white font-semibold shadow-md shadow-[#4285f4]/30"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="h-4 w-px bg-zinc-700"></div>
                {renderMicroTools("google")}
              </nav>
            );
          }

          // 8. DESIGNER SHOWCASE TEMPLATE: ATELIER EDITORIAL LUXURY BAR
          if (tKey === "designer") {
            return (
              <nav aria-label="Designer Atelier Navigation" className="flex items-center justify-between sm:justify-center gap-2 sm:gap-4 px-4 sm:px-6 py-2 rounded-full bg-[#141210]/95 backdrop-blur-2xl border border-rose-500/30 shadow-[0_10px_35px_rgba(244,63,94,0.15)] text-xs text-stone-200">
                <div className="flex items-center gap-2 cursor-pointer pr-1" onClick={scrollToTop}>
                  <span className="text-rose-400 text-xs font-serif italic">atelier.</span>
                  <span className="font-bold tracking-wider text-white hidden sm:inline">{name}</span>
                </div>
                <div className="h-3.5 w-px bg-stone-800 hidden sm:block"></div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: "projects", label: "[ works ]" },
                    { id: "skills", label: "[ systems ]" },
                    { id: "experience", label: "[ journey ]" },
                    { id: "contact", label: "[ inquire ]" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-serif transition cursor-pointer ${
                        activeSection === item.id
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/50 font-bold"
                          : "text-stone-400 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="h-3.5 w-px bg-stone-800"></div>
                {renderMicroTools("designer")}
              </nav>
            );
          }

          // 9. STARTUP FOUNDER TEMPLATE: VENTURE COMMAND DOCK
          if (tKey === "startup") {
            return (
              <nav aria-label="Startup Venture Navigation" className="flex items-center justify-between sm:justify-center gap-2 sm:gap-4 px-3 sm:px-5 py-2 rounded-2xl bg-zinc-950/95 backdrop-blur-2xl border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)] text-xs font-mono text-amber-400">
                <div className="flex items-center gap-1.5 cursor-pointer pr-1" onClick={scrollToTop}>
                  <Flame size={13} className="text-amber-400 animate-pulse" />
                  <span className="font-bold text-white tracking-wide hidden sm:inline">{name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold hidden md:inline">VENTURE</span>
                </div>
                <div className="h-4 w-px bg-amber-500/30 hidden sm:block"></div>
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {[
                    { id: "hero", label: "Pitch" },
                    { id: "projects", label: "Ventures" },
                    { id: "skills", label: "Moat" },
                    { id: "experience", label: "Track Record" },
                    { id: "contact", label: "Deal Flow" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                        activeSection === item.id
                          ? "bg-amber-500 text-black shadow-md font-extrabold"
                          : "text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="h-4 w-px bg-amber-500/30"></div>
                {renderMicroTools("startup")}
              </nav>
            );
          }

          // 10. GLASSMORPHISM TEMPLATE: IRIDESCENT FROSTED ACRYLIC RIBBON
          if (tKey === "glassmorphism") {
            return (
              <nav aria-label="Frosted Glass Navigation" className="flex items-center justify-between sm:justify-center gap-2 sm:gap-4 px-3 sm:px-5 py-2 rounded-full bg-white/[0.08] backdrop-blur-3xl border border-white/25 shadow-[0_8px_32px_rgba(168,85,247,0.25)] text-xs text-purple-100">
                <div className="flex items-center gap-2 cursor-pointer pr-1" onClick={scrollToTop}>
                  <Sparkles size={13} className="text-purple-300 animate-spin" />
                  <span className="font-bold text-white tracking-tight hidden sm:inline">{name}</span>
                </div>
                <div className="h-4 w-px bg-white/20 hidden sm:block"></div>
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {[
                    { id: "skills", label: "Stack" },
                    { id: "projects", label: "Artifacts" },
                    { id: "experience", label: "Timeline" },
                    { id: "contact", label: "Comms" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
                        activeSection === item.id
                          ? "bg-white/25 text-white border border-white/40 font-bold shadow-md"
                          : "text-zinc-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="h-4 w-px bg-white/20"></div>
                {renderMicroTools("glassmorphism")}
              </nav>
            );
          }

          // 11. DARK THEME TEMPLATE: ZERO-TRUST OLED STEALTH BAR
          if (tKey === "dark") {
            return (
              <nav aria-label="Stealth OLED Navigation" className="flex items-center justify-between sm:justify-center gap-2 sm:gap-4 px-3 sm:px-5 py-2 rounded-lg bg-[#020408]/95 backdrop-blur-2xl border border-zinc-900 shadow-2xl text-xs font-mono text-zinc-300">
                <div className="flex items-center gap-1.5 cursor-pointer pr-1" onClick={scrollToTop}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-white tracking-wider hidden sm:inline">SYS::{name.toUpperCase()}</span>
                </div>
                <div className="h-4 w-px bg-zinc-800 hidden sm:block"></div>
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {[
                    { id: "skills", label: "// STACK" },
                    { id: "projects", label: "// BUILDS" },
                    { id: "experience", label: "// OPS" },
                    { id: "contact", label: "// COMMS" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`px-2.5 py-1 text-[11px] font-mono transition cursor-pointer ${
                        activeSection === item.id
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold"
                          : "text-zinc-400 hover:text-emerald-400"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="h-4 w-px bg-zinc-800"></div>
                {renderMicroTools("dark")}
              </nav>
            );
          }

          // 12. ACADEMIC TEMPLATE: OXFORD SCHOLARLY RESEARCH DOSSIER
          if (tKey === "academic") {
            return (
              <nav aria-label="Academic Research Navigation" className="flex items-center justify-between sm:justify-center gap-2 sm:gap-4 px-3 sm:px-5 py-2 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-blue-400/40 shadow-2xl text-xs font-sans text-slate-200">
                <div className="flex items-center gap-2 cursor-pointer pr-1" onClick={scrollToTop}>
                  <BookOpen size={13} className="text-blue-400" />
                  <span className="font-bold text-white tracking-wide hidden sm:inline">{name}, PhD</span>
                </div>
                <div className="h-4 w-px bg-blue-500/30 hidden sm:block"></div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: "projects", label: "Manuscripts" },
                    { id: "skills", label: "Methodologies" },
                    { id: "experience", label: "Appointments" },
                    { id: "contact", label: "Correspondence" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                        activeSection === item.id
                          ? "bg-blue-800 text-white font-bold shadow-sm"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="h-4 w-px bg-blue-500/30"></div>
                {renderMicroTools("academic")}
              </nav>
            );
          }

          // 13. RESPONSIVE TEMPLATE: MULTI-VIEWPORT ADAPTIVE DOCK
          if (tKey === "responsive") {
            return (
              <nav aria-label="Responsive Grid Navigation" className="flex items-center justify-between sm:justify-center gap-2 sm:gap-4 px-3 sm:px-5 py-2 rounded-full bg-zinc-950/90 backdrop-blur-2xl border border-purple-500/40 shadow-2xl text-xs text-zinc-300">
                <div className="flex items-center gap-2 cursor-pointer pr-1" onClick={scrollToTop}>
                  <Smartphone size={13} className="text-purple-400" />
                  <span className="font-bold text-white tracking-tight hidden sm:inline">{name}</span>
                </div>
                <div className="h-4 w-px bg-zinc-800 hidden sm:block"></div>
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {[
                    { id: "skills", label: "Arsenal" },
                    { id: "projects", label: "Works" },
                    { id: "experience", label: "Milestones" },
                    { id: "contact", label: "Connect" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium capitalize transition cursor-pointer ${
                        activeSection === item.id
                          ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="h-4 w-px bg-zinc-800"></div>
                {renderMicroTools("modern")}
              </nav>
            );
          }

          // 14. DEFAULT / MODERN / CUSTOM TEMPLATES: SLEEK GLASSMORPHIC ISLAND
          return (
            <nav aria-label="Quick section navigation" className="flex items-center justify-between sm:justify-center gap-2 sm:gap-4 px-3 sm:px-5 py-2 rounded-full bg-zinc-950/85 backdrop-blur-2xl border border-zinc-800/90 shadow-2xl text-xs text-zinc-300">
              {/* Quick Identity & Status Indicator */}
              <div className="flex items-center gap-2 cursor-pointer pr-1" onClick={scrollToTop}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-bold text-white tracking-tight hidden sm:inline">{name}</span>
              </div>

              <div className="h-4 w-px bg-zinc-800 hidden sm:block"></div>

              {/* Quick Section Anchors */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {["skills", "projects", "experience", "contact"].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => scrollToSection(sec)}
                    className={`px-2 sm:px-2.5 py-1 rounded-full text-[11px] font-medium capitalize transition cursor-pointer ${
                      activeSection === sec
                        ? "bg-zinc-800 text-white font-bold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-zinc-800"></div>

              {/* Micro Action Icons */}
              {renderMicroTools("modern")}
            </nav>
          );
        })()}
      </header>

      {/* 4. Filter Banner (when filter or search is active) */}
      {isFilterActive && (
        <div className="sticky top-16 z-[9000] max-w-xl mx-auto px-4 pointer-events-auto transition-all animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-indigo-500/40 text-xs shadow-2xl text-white">
            <div className="flex items-center gap-2 truncate">
              <Filter size={13} className="text-indigo-400 shrink-0" />
              <span className="text-zinc-300">
                Filtering by{" "}
                <span className="font-semibold text-white">
                  {activeTag !== "ALL" ? `#${activeTag}` : ""}
                  {activeTag !== "ALL" && searchQuery ? " + " : ""}
                  {searchQuery ? `"${searchQuery}"` : ""}
                </span>
                <span className="text-indigo-400 font-mono ml-1.5">
                  ({filteredProjectsCount} of {totalProjectsCount})
                </span>
              </span>
            </div>
            <button
              onClick={() => {
                playSoundEffect("pop", soundEnabled);
                onFilterChange?.({ tag: "ALL", query: "" });
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition font-medium text-[11px] shrink-0 cursor-pointer flex items-center gap-1"
            >
              <X size={11} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary Portfolio Content (Rendered Template) */}
      <div className="relative z-10">{children}</div>

      {/* 5. Floating Interactive Experience Dock (Bottom Right) */}
      <aside aria-label="Interactive portfolio controls" className="fixed bottom-5 right-5 z-[9200] flex flex-col items-end gap-2.5 pointer-events-none">
        {/* Floating Filter Panel Drawer */}
        {isFilterOpen && (
          <div className="pointer-events-auto w-80 sm:w-96 rounded-3xl bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800 p-5 shadow-2xl space-y-4 text-xs text-white animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <Filter size={15} style={{ color: activeMood.hex }} />
                <span>Interactive Project Filter</span>
              </div>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                title="Close Filter"
              >
                <X size={14} />
              </button>
            </div>

            {/* Live Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onFilterChange?.({ tag: activeTag, query: e.target.value })}
                placeholder="Search projects by title, stack, or impact..."
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => onFilterChange?.({ tag: activeTag, query: "" })}
                  className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Tech Stack Pills */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                <span>Filter by Technology ({allTags.length})</span>
                <span className="font-mono text-indigo-400">{filteredProjectsCount} matching</span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    playSoundEffect("pop", soundEnabled);
                    onFilterChange?.({ tag: "ALL", query: searchQuery });
                    scrollToSection("projects");
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition cursor-pointer ${
                    activeTag === "ALL"
                      ? "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                  }`}
                >
                  ALL ({totalProjectsCount})
                </button>

                {allTags.map(([tag, count]) => {
                  const isActive = activeTag.toLowerCase() === tag.toLowerCase();
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        playSoundEffect("pop", soundEnabled);
                        onFilterChange?.({ tag: isActive ? "ALL" : tag, query: searchQuery });
                        scrollToSection("projects");
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition cursor-pointer flex items-center gap-1 ${
                        isActive
                          ? "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                      }`}
                    >
                      <span>#{tag}</span>
                      <span className="text-[10px] opacity-75">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Project Showcase in Filter Drawer */}
            {projects && projects.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Quick Project Deep-Dive</span>
                  <span className="text-indigo-400 font-mono text-[10px]">{projects.length} Total</span>
                </div>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {projects.map((proj, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        playSoundEffect("pop", soundEnabled);
                        setInspectedProject(proj);
                        setIsFilterOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 hover:border-indigo-500/50 flex items-center justify-between cursor-pointer group transition"
                    >
                      <div className="truncate pr-2">
                        <div className="font-semibold text-white text-xs group-hover:text-indigo-300 truncate">
                          {proj.title}
                        </div>
                        <div className="text-[10px] text-zinc-400 truncate">
                          {proj.tags?.slice(0, 3).join(", ") || "Project Specs"}
                        </div>
                      </div>
                      <button className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition font-mono shrink-0">
                        Inspect
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px]">
              <button
                onClick={() => scrollToSection("projects")}
                className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                Jump to Projects ↓
              </button>
              {isFilterActive && (
                <button
                  onClick={() => onFilterChange?.({ tag: "ALL", query: "" })}
                  className="text-zinc-500 hover:text-red-400 transition cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Floating Quick Action Pill */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-full bg-zinc-950/85 backdrop-blur-xl border border-zinc-800/90 shadow-2xl">
          {/* Filter Trigger Button */}
          {totalProjectsCount > 0 && (
            <button
              onClick={() => {
                playSoundEffect("click", soundEnabled);
                setIsFilterOpen(!isFilterOpen);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                isFilterActive || isFilterOpen
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white"
              }`}
              title="Filter and search projects"
            >
              <Filter size={13} />
              <span>Projects</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                {filteredProjectsCount}
              </span>
            </button>
          )}

          {/* Candidate Resume / CV Button */}
          {(portfolio?.resumeUrl || portfolio?.resume) && (
            <button
              onClick={() => {
                playSoundEffect("pop", soundEnabled);
                const url = portfolio.resumeUrl || portfolio.resume;
                if (url.startsWith("data:")) {
                  window.dispatchEvent(
                    new CustomEvent("portfolio:view-doc", {
                      detail: {
                        title: portfolio.resumeName || `${portfolio.name || "Candidate"}_Resume.pdf`,
                        url,
                        type: "pdf",
                      },
                    })
                  );
                } else {
                  window.open(url, "_blank", "noopener,noreferrer");
                }
              }}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition cursor-pointer flex items-center gap-1.5"
              title={`View ${portfolio.name ? `${portfolio.name}'s` : "Candidate"} Resume / CV`}
            >
              <FileText size={13} />
              <span>Resume</span>
              <ExternalLink size={10} className="opacity-80" />
            </button>
          )}

          {/* Quick Contact / Hire Button */}
          <button
            onClick={() => {
              playSoundEffect("pop", soundEnabled);
              setIsContactOpen(true);
            }}
            className="px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 transition cursor-pointer flex items-center gap-1.5"
            title="Get in touch"
          >
            <Sparkles size={13} />
            <span>Connect</span>
          </button>

          {/* Share Portfolio */}
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
            title="Share portfolio"
          >
            <Share2 size={14} />
          </button>

          {/* Scroll to Top Button */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer animate-in fade-in"
              title="Scroll to top"
            >
              <ArrowUp size={14} />
            </button>
          )}
        </div>
      </aside>

      {/* 6. Interactive Developer CLI Terminal Modal */}
      {isTerminalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#090d16] border border-zinc-800 shadow-2xl overflow-hidden text-xs font-mono text-zinc-300 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            {/* Terminal Window Chrome */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                <span className="ml-2 text-zinc-400 font-sans text-xs font-semibold flex items-center gap-1.5">
                  <Terminal size={12} className="text-emerald-400" />
                  <span>{name.toLowerCase().replace(/\s+/g, "-")}-cli ~ interactive shell</span>
                </span>
              </div>
              <button
                onClick={() => setIsTerminalOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-2.5 leading-relaxed selection:bg-emerald-500 selection:text-black">
              {terminalHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`whitespace-pre-wrap ${
                    item.type === "command"
                      ? "text-emerald-400 font-bold"
                      : item.type === "error"
                      ? "text-rose-400"
                      : item.type === "success"
                      ? "text-amber-300"
                      : item.type === "muted"
                      ? "text-zinc-500"
                      : "text-zinc-300"
                  }`}
                >
                  {item.text}
                </div>
              ))}
              <div ref={terminalBottomRef} />
            </div>

            {/* Terminal Prompt Input */}
            <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 px-4 py-3 bg-zinc-950 border-t border-zinc-800">
              <span className="text-emerald-400 font-bold">visitor@portfolio:~$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="type 'skills', 'projects', 'contact', 'hire', or 'help'..."
                autoFocus
                className="flex-1 bg-transparent border-none text-white focus:outline-none text-xs font-mono"
              />
              <button
                type="submit"
                className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 text-[11px] transition cursor-pointer font-sans"
              >
                Run ↵
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. Interactive Recruiter AI Assistant Modal */}
      {isAiCopilotOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl space-y-4 text-white flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <span>Ask AI about {name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-normal">
                      Verified Facts
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">Instant candidate insight for recruiters & engineering managers.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiCopilotOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs leading-relaxed max-h-72">
              {aiChatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl ${
                    msg.role === "assistant"
                      ? "bg-zinc-900 border border-zinc-800 text-zinc-200"
                      : "bg-indigo-600/20 border border-indigo-500/30 text-indigo-200 ml-6"
                  }`}
                >
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
                    {msg.role === "assistant" ? <Sparkles size={10} className="text-purple-400" /> : <ChevronRight size={10} />}
                    <span>{msg.role === "assistant" ? `${name}'s Copilot` : "You"}</span>
                  </div>
                  <div>{msg.text}</div>
                </div>
              ))}
            </div>

            {/* Quick Suggested Prompts */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-zinc-800">
              {[
                "What is their core tech stack?",
                "Tell me about their projects",
                "What awards or certs do they have?",
                "How do I reach out?",
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleAskAi(prompt)}
                  className="px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-[11px] transition cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAi();
              }}
              className="flex items-center gap-2 pt-2"
            >
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder={`Ask any question about ${name}'s engineering experience...`}
                className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1"
              >
                <span>Ask</span>
                <Send size={11} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8. Interactive Quick Connect & Hire Modal */}
      {isContactOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-zinc-800 p-6 sm:p-7 shadow-2xl space-y-6 text-white animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
                  <Sparkles size={12} />
                  <span>Direct Communication</span>
                </div>
                <h3 className="text-xl font-bold text-white">Let&apos;s Connect with {name}</h3>
                <p className="text-xs text-zinc-400 font-light pt-0.5">
                  Reach out directly for engineering roles, consulting, or software partnerships.
                </p>
              </div>
              <button
                onClick={() => setIsContactOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Copy Contact Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {email && (
                <button
                  type="button"
                  onClick={() => handleCopy(email, "Email")}
                  className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 flex items-center justify-between transition cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Mail size={15} className="text-pink-400 shrink-0" />
                    <div className="truncate">
                      <div className="text-[10px] text-zinc-400 uppercase font-mono">Email Address</div>
                      <div className="text-zinc-200 font-medium truncate">{email}</div>
                    </div>
                  </div>
                  {copiedField === "Email" ? (
                    <Check size={14} className="text-emerald-400 shrink-0" />
                  ) : (
                    <Copy size={13} className="text-zinc-500 group-hover:text-white shrink-0" />
                  )}
                </button>
              )}

              {phone && (
                <button
                  type="button"
                  onClick={() => handleCopy(phone, "Phone")}
                  className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 flex items-center justify-between transition cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Phone size={15} className="text-emerald-400 shrink-0" />
                    <div className="truncate">
                      <div className="text-[10px] text-zinc-400 uppercase font-mono">Phone Number</div>
                      <div className="text-zinc-200 font-medium truncate">{phone}</div>
                    </div>
                  </div>
                  {copiedField === "Phone" ? (
                    <Check size={14} className="text-emerald-400 shrink-0" />
                  ) : (
                    <Copy size={13} className="text-zinc-500 group-hover:text-white shrink-0" />
                  )}
                </button>
              )}
            </div>

            {/* Social Channels */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-800">
              {linkedin && (
                <a
                  href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <FaLinkedin size={13} />
                  <span>LinkedIn Profile</span>
                  <ExternalLink size={10} />
                </a>
              )}
              {github && (
                <a
                  href={github.startsWith("http") ? github : `https://${github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <FaGithub size={13} />
                  <span>GitHub Repos</span>
                  <ExternalLink size={10} />
                </a>
              )}
              {website && (
                <a
                  href={website.startsWith("http") ? website : `https://${website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <span>Website</span>
                  <ExternalLink size={10} />
                </a>
              )}
              {(portfolio?.resumeUrl || portfolio?.resume) && (
                <button
                  type="button"
                  onClick={() => {
                    const url = portfolio.resumeUrl || portfolio.resume;
                    if (url.startsWith("data:")) {
                      window.dispatchEvent(
                        new CustomEvent("portfolio:view-doc", {
                          detail: {
                            title: portfolio.resumeName || `${portfolio.name || "Candidate"}_Resume.pdf`,
                            url,
                            type: "pdf",
                          },
                        })
                      );
                    } else {
                      window.open(url, "_blank", "noopener,noreferrer");
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileText size={13} />
                  <span>Resume / CV</span>
                  <ExternalLink size={10} />
                </button>
              )}
            </div>

            {/* Direct Message Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!messageForm.body.trim()) {
                  return toast.error("Please enter a message.");
                }
                playSoundEffect("success", soundEnabled);
                const targetEmail = email || "developer@portfolio.dev";
                const subject = messageForm.subject || `Inquiry from ${messageForm.senderName || "Recruiter"} via Portfolio`;
                const body = `Hi ${name},\n\n${messageForm.body}\n\nFrom: ${messageForm.senderName || "A Visitor"}${
                  messageForm.senderEmail ? ` (${messageForm.senderEmail})` : ""
                }`;

                if (navigator.clipboard?.writeText) {
                  navigator.clipboard.writeText(`To: ${targetEmail}\nSubject: ${subject}\n\n${body}`);
                }
                const gmailUrl = getGmailComposeUrl(targetEmail, subject, body);
                window.open(gmailUrl, "_blank", "noopener,noreferrer");
                toast.success("Opening Gmail in new tab! Message copied to clipboard 📋");
                setIsContactOpen(false);
              }}
              className="space-y-3 pt-2 border-t border-zinc-800 text-xs"
            >
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <MessageSquare size={13} className="text-indigo-400" />
                <span>Send a Quick Message</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={messageForm.senderName}
                  onChange={(e) => setMessageForm({ ...messageForm, senderName: e.target.value })}
                  placeholder="Your Name (e.g. Sarah Connor)"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                />
                <input
                  type="email"
                  value={messageForm.senderEmail}
                  onChange={(e) => setMessageForm({ ...messageForm, senderEmail: e.target.value })}
                  placeholder="Your Email"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <input
                type="text"
                value={messageForm.subject}
                onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                placeholder="Subject (e.g. Full Stack Engineering Role / Project Inquiry)"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
              />

              <textarea
                rows={3}
                value={messageForm.body}
                onChange={(e) => setMessageForm({ ...messageForm, body: e.target.value })}
                placeholder={`Hi ${name}, I loved your portfolio and would like to discuss...`}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none resize-none"
              />

              <div className="space-y-1.5">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30"
                >
                  <Send size={13} />
                  <span>Send via Gmail (Web) 🚀</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!messageForm.body.trim()) {
                        return toast.error("Please enter a message first.");
                      }
                      const targetEmail = email || "developer@portfolio.dev";
                      const subject = messageForm.subject || `Inquiry from ${messageForm.senderName || "Recruiter"} via Portfolio`;
                      const body = `Hi ${name},\n\n${messageForm.body}\n\nFrom: ${messageForm.senderName || "A Visitor"}${
                        messageForm.senderEmail ? ` (${messageForm.senderEmail})` : ""
                      }`;
                      if (navigator.clipboard?.writeText) {
                        navigator.clipboard.writeText(`To: ${targetEmail}\nSubject: ${subject}\n\n${body}`);
                      }
                      const outlookUrl = getOutlookComposeUrl(targetEmail, subject, body);
                      window.open(outlookUrl, "_blank", "noopener,noreferrer");
                      toast.success("Opening Outlook Web in new tab! 📬");
                      setIsContactOpen(false);
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-[11px] font-medium transition cursor-pointer"
                  >
                    Compose in Outlook
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!messageForm.body.trim()) {
                        return toast.error("Please enter a message first.");
                      }
                      const targetEmail = email || "developer@portfolio.dev";
                      const subject = messageForm.subject || `Inquiry from ${messageForm.senderName || "Recruiter"} via Portfolio`;
                      const body = `Hi ${name},\n\n${messageForm.body}\n\nFrom: ${messageForm.senderName || "A Visitor"}${
                        messageForm.senderEmail ? ` (${messageForm.senderEmail})` : ""
                      }`;
                      navigator.clipboard?.writeText(`To: ${targetEmail}\nSubject: ${subject}\n\n${body}`);
                      toast.success("Message & Email copied to clipboard! 📋");
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-[11px] font-medium transition cursor-pointer"
                  >
                    Copy Message
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Interactive Project Deep-Dive Case Study Modal */}
      {inspectedProject && (
        <ProjectDeepDiveModal
          project={inspectedProject}
          onClose={() => setInspectedProject(null)}
          accentColor={activeMood.hex}
        />
      )}
    </div>
  );
};

export default InteractivePortfolioOverlay;
