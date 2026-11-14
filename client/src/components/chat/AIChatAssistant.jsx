import { useState, useRef, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Sparkles, X, ChevronDown, Check, Zap, GripHorizontal, Maximize2 } from "lucide-react";
import { chatWithPortfolioAI } from "../../features/portfolio/services/portfolioService";
import CyberBotAvatar from "./CyberBotAvatar";

const GENERAL_QUESTIONS = [
  "What projects should I build for Full Stack?",
  "How can I make my portfolio recruiter-ready?",
  "How do ATS algorithms score dev resumes?",
  "How do I design a 3-tier architecture diagram?",
];

const PORTFOLIO_QUESTIONS = [
  "Rewrite project descriptions with STAR metrics",
  "Audit this portfolio against 6-second recruiter criteria",
  "What high-demand tech skills should I highlight?",
  "Show me an architecture flowchart for this project",
];

const GENERAL_WELCOME_MESSAGE = `👋 Hello! I'm your **PortfolioAI Career Copilot**.

I'm here to help you review, optimize, and elevate your developer portfolio, projects, and ATS score.

🔗 **Please share your portfolio link or GitHub repository URL to get started!** Once you paste it, I will analyze your projects, tech stack, and ATS readiness in real time.

*(Or feel free to ask me any general question about developer resumes, system architecture, or high-impact project ideas.)*`;

const AIChatAssistant = ({ portfolioData = null, portfolios = [] }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const userName = user?.fullName || user?.name || "";

  // ALWAYS start in General Mode (selectedPortfolio = null)
  // Only connect to a portfolio when the user pastes a link or explicitly chooses to connect it!
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [showPortfolioMenu, setShowPortfolioMenu] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLauncherHovered, setIsLauncherHovered] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: GENERAL_WELCOME_MESSAGE,
    },
  ]);

  const messagesEndRef = useRef(null);
  const launcherRef = useRef(null);
  const chatWindowRef = useRef(null);
  const dragStateRef = useRef({
    active: false,
    target: null, // 'launcher' | 'window'
    startX: 0,
    startY: 0,
    origLeft: 0,
    origTop: 0,
    moved: false,
  });

  // Custom dragged positions ({ left, top }); null uses default bottom-6 right-6
  const [launcherPos, setLauncherPos] = useState(null);
  const [windowPos, setWindowPos] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const clampPosition = (left, top, el, margin = 12) => {
    const rect = el?.getBoundingClientRect();
    const width = rect?.width || 380;
    const height = rect?.height || 520;
    const maxLeft = Math.max(margin, window.innerWidth - width - margin);
    const maxTop = Math.max(margin, window.innerHeight - height - margin);
    return {
      left: Math.min(Math.max(margin, left), maxLeft),
      top: Math.min(Math.max(margin, top), maxTop),
    };
  };

  const startDrag = (e, target) => {
    if (e.button !== undefined && e.button !== 0) return;
    // Don't hijack clicks on buttons, inputs, links inside the chat header
    if (target === "window" && e.target.closest("button, a, input, select, textarea")) {
      return;
    }

    const el = target === "launcher" ? launcherRef.current : chatWindowRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    dragStateRef.current = {
      active: true,
      target,
      startX: e.clientX,
      startY: e.clientY,
      origLeft: rect.left,
      origTop: rect.top,
      moved: false,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e) => {
      const ds = dragStateRef.current;
      if (!ds.active) return;

      const dx = e.clientX - ds.startX;
      const dy = e.clientY - ds.startY;
      if (!ds.moved && Math.hypot(dx, dy) > 5) {
        ds.moved = true;
      }
      if (!ds.moved) return;

      const el = ds.target === "launcher" ? launcherRef.current : chatWindowRef.current;
      const next = clampPosition(ds.origLeft + dx, ds.origTop + dy, el);

      if (ds.target === "launcher") {
        setLauncherPos(next);
      } else {
        setWindowPos(next);
      }
    };

    const handlePointerUp = () => {
      if (!dragStateRef.current.active) return;
      dragStateRef.current.active = false;
      setIsDragging(false);
      // Reset `moved` flag on next tick so click handler can inspect it
      setTimeout(() => {
        dragStateRef.current.moved = false;
      }, 0);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isDragging]);

  // Keep dragged positions inside the viewport on window resize
  useEffect(() => {
    const handleResize = () => {
      if (launcherPos && launcherRef.current) {
        setLauncherPos((prev) => (prev ? clampPosition(prev.left, prev.top, launcherRef.current) : null));
      }
      if (windowPos && chatWindowRef.current) {
        setWindowPos((prev) => (prev ? clampPosition(prev.left, prev.top, chatWindowRef.current) : null));
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [launcherPos, windowPos]);

  // Flip speech bubble to the right of the bot when launcher is dragged to the left half
  const isLauncherOnLeft =
    launcherPos !== null && typeof window !== "undefined" && launcherPos.left < window.innerWidth / 2 - 80;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Combine available portfolios from props for optional manual selection
  const availablePortfoliosList = useMemo(() => {
    const list = [...(portfolios || [])];
    if (portfolioData && !list.some((p) => (p._id && p._id === portfolioData._id) || p.title === portfolioData.title)) {
      list.unshift(portfolioData);
    }
    return list;
  }, [portfolioData, portfolios]);

  const handleEnlargeToFullPage = () => {
    const hasConversation = messages.some((m) => m.role === "user");
    setShowPortfolioMenu(false);
    setIsOpen(false);
    navigate("/chat", {
      state: {
        fromWidget: true,
        handoffId: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        widgetMessages: hasConversation ? messages : null,
        widgetPortfolio: selectedPortfolio || null,
      },
    });
  };

  const handleSelectPortfolio = (p) => {
    setSelectedPortfolio(p);
    setShowPortfolioMenu(false);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: p
          ? `📂 **Connected to ${p.title || "Selected Portfolio"}** (${p.targetRole || "Software Engineer"}). Ask me anything about this portfolio!`
          : `🌐 **Switched to General Career Copilot** (no portfolio context attached). Please paste a portfolio or GitHub link anytime, or ask a general career question!`,
      },
    ]);
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await chatWithPortfolioAI({
        message: query,
        portfolioData: selectedPortfolio, // null until user provides link or connects portfolio
        userName,
        conversationHistory: messages.slice(-4),
      });

      if (res.data?.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.data.reply },
        ]);
      }

      // If user provided a link in their message, the backend extracts it and returns targetPortfolio or githubRepo!
      // Automatically lock onto that context for all future messages in this conversation:
      if (res.data?.targetPortfolio) {
        setSelectedPortfolio(res.data.targetPortfolio);
      } else if (res.data?.githubRepo) {
        setSelectedPortfolio({
          title: res.data.githubRepo.name || res.data.githubRepo.fullName,
          targetRole: res.data.githubRepo.language ? `${res.data.githubRepo.language} Engineer` : "Software Engineer",
          projects: [{
            title: res.data.githubRepo.name,
            description: res.data.githubRepo.description,
            tags: res.data.githubRepo.dependencies || [],
          }],
          htmlUrl: res.data.githubRepo.htmlUrl,
        });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Here is my key recommendation: Ensure all your project descriptions contain quantifiable metrics ($ saved, % speedup) and high-demand keywords matching your target role. Paste your portfolio link anytime for an in-depth audit!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Interactive Holographic Floating Bot Symbol */}
      {!isOpen && (
        <div
          ref={launcherRef}
          onPointerDown={(e) => startDrag(e, "launcher")}
          style={
            launcherPos
              ? { left: `${launcherPos.left}px`, top: `${launcherPos.top}px` }
              : undefined
          }
          className={`fixed z-50 flex items-center gap-3 select-none touch-none ${
            launcherPos ? "" : "bottom-6 right-6"
          } ${isLauncherOnLeft ? "flex-row-reverse" : "flex-row"} ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          onMouseEnter={() => setIsLauncherHovered(true)}
          onMouseLeave={() => setIsLauncherHovered(false)}
          title="Drag to move anywhere • Click to open AI Copilot"
        >
          {/* Interactive Speech Bubble & Quick Action Chip */}
          <div
            onClick={() => {
              if (!dragStateRef.current.moved) setIsOpen(true);
            }}
            className={`cursor-pointer transition-all duration-300 transform ${
              isLauncherOnLeft ? "origin-left" : "origin-right"
            } ${
              isLauncherHovered
                ? "opacity-100 translate-x-0 scale-100"
                : "opacity-0 translate-x-4 scale-95 pointer-events-none sm:opacity-90 sm:translate-x-0 sm:scale-100 sm:pointer-events-auto"
            }`}
          >
            <div className="relative px-3.5 py-2 rounded-2xl bg-zinc-950/90 border border-indigo-500/40 shadow-xl shadow-indigo-950/50 backdrop-blur-xl flex items-center gap-2 group hover:border-indigo-400">
              {/* Online pulse beacon */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>

              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white flex items-center gap-1">
                  <span>AI Copilot</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    LIVE
                  </span>
                </span>
                <span className="text-[10px] text-zinc-400 group-hover:text-indigo-300 transition-colors">
                  {isLauncherHovered
                    ? "Click to open • Drag to move 🚀"
                    : "Ask AI Copilot"}
                </span>
              </div>

              {/* Speech bubble pointer arrow */}
              {isLauncherOnLeft ? (
                <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[6px] border-r-zinc-950" />
              ) : (
                <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[6px] border-l-zinc-950" />
              )}
            </div>
          </div>

          {/* Main Floating Bot Mascot Launcher */}
          <button
            onClick={() => {
              if (!dragStateRef.current.moved) setIsOpen(true);
            }}
            className={`relative group p-1 rounded-full focus:outline-none ${
              isDragging ? "cursor-grabbing" : "cursor-pointer"
            }`}
            aria-label="Open AI Career Copilot Chat"
          >
            {/* Concentric Ambient Radar Waves */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
            <div className="absolute -inset-2 rounded-full border border-indigo-500/30 animate-bot-pulse-ring pointer-events-none" />

            {/* Orbiting Cyber Ring Outer */}
            <svg
              className="absolute -inset-2.5 w-[calc(100%+20px)] h-[calc(100%+20px)] pointer-events-none animate-bot-orbit"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                stroke="url(#orbitGradient)"
                strokeWidth="1.8"
                strokeDasharray="6 8"
                fill="none"
              />
              <defs>
                <linearGradient id="orbitGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>

            {/* Orbiting Cyber Ring Inner (Reverse) */}
            <svg
              className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] pointer-events-none animate-bot-orbit-rev"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="#6366f1"
                strokeWidth="1"
                strokeDasharray="2 6"
                fill="none"
                opacity="0.6"
              />
            </svg>

            {/* Floating Bobbing Mascot Capsule */}
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-indigo-500/50 group-hover:border-cyan-400 shadow-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 animate-bot-float">
              <CyberBotAvatar size="md" interactive={false} isThinking={loading} />

              {/* Status Jewel Indicator */}
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-md shadow-emerald-500/50" />
            </div>
          </button>
        </div>
      )}

      {/* Chat Drawer / Modal */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          style={
            windowPos
              ? { left: `${windowPos.left}px`, top: `${windowPos.top}px` }
              : undefined
          }
          className={`fixed z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[calc(100vh-24px)] rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl ${
            windowPos ? "" : "bottom-6 right-6 animate-in fade-in zoom-in-95 duration-200"
          } ${isDragging ? "select-none ring-2 ring-indigo-500/40" : ""}`}
        >
          {/* Draggable Header */}
          <div
            onPointerDown={(e) => startDrag(e, "window")}
            onDoubleClick={(e) => {
              if (e.target.closest("button, a, input, select")) return;
              setWindowPos(null);
            }}
            title="Drag header to move anywhere • Double-click to reset position"
            className={`relative p-4 pt-5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between select-none touch-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            {/* Visual Drag Handle Bar */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 text-zinc-500 hover:text-zinc-300 pointer-events-none">
              <GripHorizontal size={14} />
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <CyberBotAvatar size="sm" isThinking={loading} />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-zinc-950 animate-pulse" />
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>AI Career Copilot</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono">
                    v2.0
                  </span>
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-zinc-400 truncate max-w-[150px]">
                    {selectedPortfolio
                      ? `Context: ${selectedPortfolio.title || selectedPortfolio.targetRole || "Active Portfolio"}`
                      : "Mode: General Advisor"}
                  </span>

                  {availablePortfoliosList.length > 0 && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowPortfolioMenu((prev) => !prev)}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-indigo-300 border border-zinc-700/80 flex items-center gap-0.5 transition cursor-pointer"
                        title="Change portfolio context"
                      >
                        <span>{selectedPortfolio ? "Switch" : "Connect"}</span>
                        <ChevronDown size={9} />
                      </button>

                      {showPortfolioMenu && (
                        <div className="absolute left-0 top-full mt-1.5 w-60 rounded-xl bg-zinc-950 border border-zinc-700 shadow-2xl z-50 py-1.5 backdrop-blur-xl animate-in fade-in duration-150">
                          <button
                            type="button"
                            onClick={() => handleSelectPortfolio(null)}
                            className={`w-full text-left px-3 py-1.5 hover:bg-zinc-800/80 flex items-center justify-between text-[11px] transition ${
                              !selectedPortfolio ? "text-indigo-400 font-semibold" : "text-zinc-300"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span>🌐</span>
                              <span>General Advisor (No Portfolio)</span>
                            </span>
                            {!selectedPortfolio && <Check size={12} className="text-indigo-400 shrink-0" />}
                          </button>

                          <div className="my-1 border-t border-zinc-800/80" />
                          <div className="px-3 py-0.5 text-[9px] font-mono uppercase tracking-wider text-zinc-500">
                            Available Portfolios ({availablePortfoliosList.length})
                          </div>

                          <div className="max-h-40 overflow-y-auto">
                            {availablePortfoliosList.map((p) => {
                              const isSelected = selectedPortfolio?._id === p._id || selectedPortfolio?.title === p.title;
                              return (
                                <button
                                  key={p._id || p.title}
                                  type="button"
                                  onClick={() => handleSelectPortfolio(p)}
                                  className={`w-full text-left px-3 py-1.5 hover:bg-zinc-800/80 flex items-center justify-between text-[11px] transition truncate ${
                                    isSelected ? "text-indigo-400 font-semibold" : "text-zinc-300"
                                  }`}
                                >
                                  <span className="truncate flex items-center gap-1.5">
                                    <span>📂</span>
                                    <span className="truncate">{p.title}</span>
                                  </span>
                                  {isSelected && <Check size={12} className="text-indigo-400 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleEnlargeToFullPage}
                className="w-8 h-8 rounded-xl text-zinc-400 hover:text-indigo-300 hover:bg-indigo-500/15 flex items-center justify-center transition cursor-pointer"
                title="Enlarge to Full-Page AI Career Chatbot"
                aria-label="Enlarge to Full-Page AI Career Chatbot"
              >
                <Maximize2 size={15} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPortfolioMenu(false);
                  setIsOpen(false);
                }}
                className="w-8 h-8 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer"
                title="Close Copilot"
                aria-label="Close Copilot"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick suggestions chips */}
          <div className="px-3 py-2 bg-zinc-900/60 border-b border-zinc-800/80 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            {!selectedPortfolio && availablePortfoliosList.length > 0 && (
              <button
                onClick={() => handleSelectPortfolio(availablePortfoliosList[0])}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 text-[11px] text-indigo-300 transition cursor-pointer shrink-0 flex items-center gap-1 font-medium"
                title={`Connect ${availablePortfoliosList[0].title}`}
              >
                <Zap size={10} className="text-indigo-400" />
                <span className="truncate max-w-[140px]">Connect "{availablePortfoliosList[0].title}"</span>
              </button>
            )}
            {(selectedPortfolio ? PORTFOLIO_QUESTIONS : GENERAL_QUESTIONS).map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-indigo-600/20 hover:border-indigo-500/40 border border-zinc-700/60 text-[11px] text-zinc-300 hover:text-indigo-300 transition cursor-pointer shrink-0 flex items-center gap-1"
              >
                <Sparkles size={10} className="text-indigo-400" />
                <span>{q}</span>
              </button>
            ))}
          </div>

          {/* Messages stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="shrink-0 mt-0.5">
                    <CyberBotAvatar size="xs" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-tr-none shadow-md shadow-indigo-600/20"
                      : "bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-tl-none space-y-1.5 overflow-hidden"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="markdown-copilot-body text-[11px] leading-relaxed text-zinc-200">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ children }) => (
                            <div className="w-full my-2 overflow-x-auto rounded-xl border border-zinc-700/80 bg-zinc-950/90 shadow-md">
                              <table className="w-full text-left border-collapse text-[10px]">{children}</table>
                            </div>
                          ),
                          thead: ({ children }) => (
                            <thead className="bg-zinc-800/95 text-indigo-300 font-bold uppercase tracking-wider text-[9px] border-b border-zinc-700">
                              {children}
                            </thead>
                          ),
                          th: ({ children }) => (
                            <th className="px-2.5 py-1.5 font-bold text-indigo-200 border-r border-zinc-700/60 last:border-r-0 whitespace-nowrap bg-zinc-800/80">
                              {children}
                            </th>
                          ),
                          tbody: ({ children }) => (
                            <tbody className="divide-y divide-zinc-800/80 bg-zinc-950/50">{children}</tbody>
                          ),
                          tr: ({ children }) => (
                            <tr className="hover:bg-zinc-800/40 transition-colors">{children}</tr>
                          ),
                          td: ({ children }) => (
                            <td className="px-2.5 py-1.5 text-zinc-300 border-r border-zinc-800/60 last:border-r-0 align-top leading-relaxed text-[10px]">
                              {children}
                            </td>
                          ),
                          h1: ({ children }) => (
                            <h1 className="text-xs font-bold text-white mt-2 mb-1 pb-0.5 border-b border-zinc-800 flex items-center gap-1.5">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-[11px] font-bold text-indigo-300 mt-2 mb-0.5 flex items-center gap-1">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-[11px] font-bold text-cyan-300 mt-2 mb-0.5 flex items-center gap-1">
                              {children}
                            </h3>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside space-y-0.5 my-1 text-zinc-300 text-[10.5px]">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-inside space-y-0.5 my-1 text-zinc-300 text-[10.5px]">{children}</ol>
                          ),
                          li: ({ children }) => <li className="text-[10.5px] leading-relaxed">{children}</li>,
                          p: ({ children }) => <p className="leading-relaxed text-[11px] my-1">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                          code: ({ inline, children }) =>
                            inline ? (
                              <code className="px-1 py-0.2 rounded bg-zinc-800 border border-zinc-700 text-indigo-300 font-mono text-[10px]">
                                {children}
                              </code>
                            ) : (
                              <pre className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-[10px] text-zinc-300 overflow-x-auto my-1">
                                <code>{children}</code>
                              </pre>
                            ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 shrink-0 mt-0.5 text-[10px] font-bold">
                    U
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-zinc-400 text-xs">
                <CyberBotAvatar size="xs" isThinking={true} />
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  <span>AI Copilot is formulating strategy...</span>
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your portfolio or career..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 disabled:opacity-40 text-white flex items-center justify-center transition cursor-pointer shrink-0 shadow-md shadow-indigo-600/30"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatAssistant;
