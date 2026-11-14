import { useState, useRef, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import {
  Send,
  Sparkles,
  Trash2,
  Copy,
  Check,
  Layers,
  ArrowRight,
  ShieldCheck,
  Compass,
  Zap,
  Globe,
  ExternalLink,
  RefreshCw,
  Link as LinkIcon,
  GitBranch,
  MessageSquare,
  Plus,
  Search,
  Edit3,
  Clock,
  PanelLeft,
  PanelLeftClose,
  History,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import Sidebar from "../../dashboard/components/Sidebar";
import Topbar from "../../dashboard/components/Topbar";
import WorkspaceBackdrop from "../../../components/layout/WorkspaceBackdrop";
import { fetchPortfolios } from "../../../redux/portfolio/portfolioSlice";
import {
  chatWithPortfolioAI,
  getChatSessions,
  saveChatSession,
  deleteChatSession,
  clearChatSessions,
} from "../../portfolio/services/portfolioService";
import CyberBotAvatar from "../../../components/chat/CyberBotAvatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MermaidDiagram from "../../../components/chat/MermaidDiagram";
import ArchitecturePipeline from "../../../components/chat/ArchitecturePipeline";
import { isArchitecturePipeline } from "../../../components/chat/pipelineParser";

// Specialized Markdown Renderer for clear tables, typography, and code blocks
const MarkdownMessage = ({ content }) => {
  return (
    <div className="markdown-chat-body text-xs sm:text-sm leading-relaxed text-zinc-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="w-full my-3.5 overflow-x-auto rounded-xl border border-zinc-700/80 bg-zinc-950/90 shadow-xl">
              <table className="markdown-chat-table">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-zinc-800/95 text-indigo-300 font-bold uppercase tracking-wider text-[11px] border-b border-zinc-700">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 font-bold text-indigo-200 border-r border-zinc-700/60 last:border-r-0 whitespace-nowrap bg-zinc-800/80">
              {children}
            </th>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-zinc-800/80 bg-zinc-950/50">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-zinc-800/40 transition-colors">
              {children}
            </tr>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-zinc-300 border-r border-zinc-800/60 last:border-r-0 align-top leading-relaxed text-xs">
              {children}
            </td>
          ),
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-bold text-white mt-4 mb-2 pb-1 border-b border-zinc-800 flex items-center gap-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-bold text-indigo-300 mt-3.5 mb-1.5 flex items-center gap-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-bold text-zinc-100 mt-3 mb-1.5 flex items-center gap-1.5">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-semibold text-zinc-300 mt-2 mb-1">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <div className="my-2 leading-relaxed text-zinc-200">
              {children}
            </div>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 pl-3.5 py-2 border-l-4 border-indigo-500 bg-indigo-950/30 rounded-r-xl text-zinc-300 italic text-xs leading-relaxed shadow-sm">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="my-2 pl-4 list-disc space-y-1.5 text-zinc-300 text-xs sm:text-sm">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 pl-4 list-decimal space-y-1.5 text-zinc-300 text-xs sm:text-sm">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">
              {children}
            </strong>
          ),
          pre: ({ children }) => {
            const childProps = children?.props;
            if (childProps?.className?.includes("language-mermaid")) {
              return <MermaidDiagram code={String(childProps.children || "")} />;
            }
            const textContent = String(childProps?.children || "");
            if (isArchitecturePipeline(textContent)) {
              return <ArchitecturePipeline rawText={textContent} />;
            }
            return (
              <pre
                className="my-3.5 p-4 rounded-xl bg-zinc-950 border border-zinc-800/90 text-zinc-200 font-mono text-xs overflow-x-auto shadow-inner select-text"
                style={{
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
                  whiteSpace: "pre",
                  lineHeight: "1.35",
                  letterSpacing: "0px",
                }}
              >
                {children}
              </pre>
            );
          },
          code: ({ className, children, ...props }) => {
            if (className?.includes("language-mermaid")) {
              return <MermaidDiagram code={String(children || "")} />;
            }
            const textContent = String(children || "");
            if (isArchitecturePipeline(textContent)) {
              return <ArchitecturePipeline rawText={textContent} />;
            }
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code
                  className={`${className} font-mono text-xs`}
                  style={{
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
                    whiteSpace: "pre",
                  }}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className="px-1.5 py-0.5 rounded bg-zinc-800/90 text-indigo-300 font-mono text-[11px] border border-zinc-700/50" {...props}>
                {children}
              </code>
            );
          },
          hr: () => <hr className="my-3 border-zinc-800/80" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline font-medium transition inline-flex items-center gap-0.5"
            >
              <span>{children}</span>
              <ExternalLink size={10} className="inline opacity-70" />
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const SUGGESTED_PROMPTS = [
  {
    id: "all",
    category: "✨ All Topics",
    icon: Sparkles,
    questions: [
      "How can I improve this portfolio?",
      "Why is my score low for this portfolio?",
      "How can I make this portfolio recruiter-friendly?",
      "Explain the end-to-end workflow with arrows & data for this project",
      "What are the best full-stack projects to stand out in 2026?",
      "Which tech stack gets the most interviews right now?",
      "How do I explain complex backend architecture in my projects?",
      "Rewrite my About section to sound like a senior engineer.",
      "What technical questions will recruiters ask from my resume & projects?",
      "How to write high-converting STAR bullet points for projects?",
      "What makes a portfolio look modern vs junior-level?",
      "How can I achieve a 100/100 Lighthouse performance score?",
      "How to write a high-response cold outreach message on LinkedIn?",
    ],
  },
  {
    id: "projects",
    category: "🚀 Projects & Tech Stack",
    icon: Layers,
    questions: [
      "Explain the end-to-end workflow with arrows & data for this project",
      "What is the workflow for Study Sphere with arrows along with data?",
      "What is the workflow for Velvet Vogue with arrows along with data?",
      "What are the best full-stack projects to stand out in 2026?",
      "Which tech stack gets the most interviews right now?",
      "How do I explain complex backend architecture in my projects?",
      "How many projects should I display on my portfolio?",
    ],
  },
  {
    id: "ats",
    category: "🎯 ATS & Recruiter Appeal",
    icon: ShieldCheck,
    questions: [
      "How can I improve this portfolio?",
      "Why is my score low for this portfolio?",
      "How can I make this portfolio recruiter-friendly?",
      "How do recruiters scan portfolios in 6 seconds?",
      "What is missing from my current portfolio to pass ATS screens?",
      "How to write high-converting STAR bullet points for projects?",
    ],
  },
  {
    id: "design",
    category: "🎨 Design & UX",
    icon: Zap,
    questions: [
      "What makes a portfolio look modern vs junior-level?",
      "How can I achieve a 100/100 Lighthouse performance score?",
      "Should I use dark mode, neon accents, or minimalist styling?",
      "What are the best typography pairings and color palettes for developers?",
    ],
  },
  {
    id: "interviews",
    category: "💼 Interview Prep & Outreach",
    icon: Compass,
    questions: [
      "What technical questions will recruiters ask from my resume & projects?",
      "Rewrite my About section to sound like a senior engineer.",
      "How to write a high-response cold outreach message on LinkedIn?",
      "How can I make my portfolio stand out with zero professional work experience?",
    ],
  },
];

// Helper to categorize chat sessions by chronological recency (ChatGPT style)
const groupSessionsByDate = (sessions) => {
  const groups = {
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    "Previous 30 Days": [],
    Older: [],
  };

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  const startOfYesterday = startOfToday - oneDay;
  const startOf7Days = startOfToday - 7 * oneDay;
  const startOf30Days = startOfToday - 30 * oneDay;

  sessions.forEach((s) => {
    const timestamp = new Date(s.updatedAt || s.createdAt || Date.now()).getTime();
    if (timestamp >= startOfToday) {
      groups.Today.push(s);
    } else if (timestamp >= startOfYesterday) {
      groups.Yesterday.push(s);
    } else if (timestamp >= startOf7Days) {
      groups["Previous 7 Days"].push(s);
    } else if (timestamp >= startOf30Days) {
      groups["Previous 30 Days"].push(s);
    } else {
      groups.Older.push(s);
    }
  });

  return groups;
};

const LAST_ACTIVE_SESSION_KEY = "portfolio_chat_last_active_session_id";

const getStorageKey = (userId) => `portfolio_chat_sessions_${userId || "guest"}`;

const loadLocalSessions = (userId) => {
  try {
    // 1. Try userId-specific key
    if (userId) {
      const userRaw = localStorage.getItem(getStorageKey(userId));
      if (userRaw) {
        const parsed = JSON.parse(userRaw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }
    // 2. Try guest key
    const guestRaw = localStorage.getItem(getStorageKey("guest"));
    if (guestRaw) {
      const parsed = JSON.parse(guestRaw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    // 3. Scan any portfolio_chat_sessions_* key in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("portfolio_chat_sessions_")) {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    }
    return [];
  } catch (e) {
    console.error("Failed to load local chat sessions:", e);
    return [];
  }
};

const saveLocalSessions = (userId, sessions) => {
  try {
    if (!Array.isArray(sessions)) return;
    const json = JSON.stringify(sessions);
    if (userId) {
      localStorage.setItem(getStorageKey(userId), json);
    }
    localStorage.setItem(getStorageKey("guest"), json);
  } catch (e) {
    console.error("Failed to save local chat sessions:", e);
  }
};

const buildWelcomeMessage = (userName, link = "", portfolio = null) => ({
  id: "welcome",
  role: "assistant",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  content: link
    ? `👋 Hello **${userName}**! I'm inspecting **${portfolio?.title || portfolio?.fullName || link}**.

🔗 **Connected Link**: \`${link}\`
${portfolio?.targetRole ? `🎯 **Target Role**: \`${portfolio.targetRole}\`\n` : ""}
Ask me any question regarding your portfolio projects, ATS scoring, resume interview questions defense, or architectural enhancements for this portfolio!`
    : `👋 Hello **${userName}**! I'm your **PortfolioAI Career Copilot**.

I can answer **any question related to portfolios**, whether you need strategic advice or real-time audits:
• 🚀 **Projects & Tech Stacks**: What projects to build, best stacks for 2026, and distributed system design.
• 🎯 **ATS Scoring & Recruiter Appeal**: Scoring rubrics, 6-second recruiter scans, and STAR metric bullet points.
• 🎨 **Design, UX & Speed**: Modern aesthetics, mobile responsiveness, Lighthouse performance, and layout tips.
• 💼 **Interview Defense & Cold Outreach**: How to explain your projects, technical questions, and LinkedIn pitches.

💡 *Ask any question directly below, or connect your live portfolio / GitHub link at any time for personalized real-time audits!*`,
});

const generateSmartTitle = (text, link, portfolio) => {
  if (portfolio?.title) return `${portfolio.title} Advice`;
  if (/interview|recruiter.*ask|ques.*ask|resume.*ask/i.test(text)) return "Recruiter Interview Prep";
  if (/score|ats|audit|pillar/i.test(text)) return "ATS Score & Audit";
  if (/project|star|desc|bullet/i.test(text)) return "Project STAR Rewrites";
  if (/skill|tech|highlight|learn/i.test(text)) return "Skills & Tech Blueprint";
  if (/about|bio|intro/i.test(text)) return "About Section Polish";
  if (link) {
    try {
      const urlObj = new URL(link);
      const host = urlObj.hostname.replace("www.", "");
      return `Portfolio: ${host.split(".")[0] || host}`;
    } catch {
      return "Portfolio Chat";
    }
  }
  const clean = text.replace(/https?:\/\/[^\s]+/g, "").trim();
  if (!clean) return "Portfolio Advice";
  return clean.length > 26 ? clean.substring(0, 26) + "..." : clean;
};

const createFreshSession = (userName, initialUrl = "") => ({
  sessionId: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  title: "New Chat",
  activeLink: initialUrl || "",
  portfolioData: null,
  messages: [buildWelcomeMessage(userName, initialUrl || "")],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const ChatbotPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUrl = searchParams.get("url") || searchParams.get("link") || "";
  const initialId = searchParams.get("id") || searchParams.get("portfolioId") || "";
  const prevLocationKeyRef = useRef(location.key);

  const { portfolios = [] } = useSelector((state) => state.portfolio || {});
  const { profile } = useSelector((state) => state.profile || {});
  const { user } = useSelector((state) => state.auth || {});
  const currentUser = profile || user;
  const userName = currentUser?.fullName?.split(" ")[0] || "there";

  // ChatGPT History State:
  // Whenever the user arrives on the chatbot page, open a fresh New Chat by default —
  // unless enlarged from the floating Copilot widget with an active conversation or portfolio context.
  const initialSetup = useMemo(() => {
    const stored = loadLocalSessions(currentUser?._id);
    const pastChats = stored.filter((s) => Array.isArray(s.messages) && s.messages.some((m) => m.role === "user"));
    const existingEmpty = stored.find((s) => !s.messages || !s.messages.some((m) => m.role === "user"));

    const widgetState = location.state;
    const handoffId = widgetState?.handoffId ? String(widgetState.handoffId) : "";
    const alreadyConsumed =
      handoffId && sessionStorage.getItem("portfolio_chat_consumed_handoff") === handoffId;

    if (widgetState?.fromWidget && handoffId && !alreadyConsumed) {
      const wp = widgetState.widgetPortfolio || null;
      const wm = Array.isArray(widgetState.widgetMessages) ? widgetState.widgetMessages : null;
      const wLink =
        wp?.deployedUrl ||
        wp?.htmlUrl ||
        (wp?._id ? `${window.location.origin}/portfolio/${wp._id}` : "");

      if (wm && wm.some((m) => m.role === "user")) {
        const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const normalized = wm.map((m, idx) => ({
          id: m.id || `widget_${Date.now()}_${idx}`,
          role: m.role,
          timestamp: m.timestamp || nowTime,
          content: m.content,
        }));
        const firstUserText = normalized.find((m) => m.role === "user")?.content || "";
        const handoffSession = {
          sessionId: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          title: generateSmartTitle(firstUserText, wLink, wp),
          activeLink: wLink,
          portfolioData: wp,
          messages: normalized,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _fromWidgetHandoffId: handoffId,
        };
        return { fresh: handoffSession, initialList: [handoffSession, ...pastChats] };
      }

      if (wp) {
        const freshWithPortfolio = {
          ...(existingEmpty || createFreshSession(userName, wLink)),
          activeLink: wLink,
          portfolioData: wp,
          messages: [buildWelcomeMessage(userName, wLink, wp)],
          _fromWidgetHandoffId: handoffId,
        };
        return { fresh: freshWithPortfolio, initialList: [freshWithPortfolio, ...pastChats] };
      }
    }

    const fresh = existingEmpty || createFreshSession(userName, initialUrl);
    const initialList = [fresh, ...pastChats];
    return { fresh, initialList };
  }, [currentUser?._id]);

  const [sessions, setSessions] = useState(() => initialSetup.initialList);
  const [currentSessionId, setCurrentSessionId] = useState(() => initialSetup.fresh.sessionId);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [historySearch, setHistorySearch] = useState("");
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Active Chat State: starts on the fresh or widget-enlarged session
  const [activeLink, setActiveLink] = useState(() => initialSetup.fresh.activeLink || initialUrl || "");
  const [activePortfolioData, setActivePortfolioData] = useState(() => initialSetup.fresh.portfolioData || null);
  const [pendingQuestion, setPendingQuestion] = useState(null);
  const [sidebarLinkInput, setSidebarLinkInput] = useState("");
  const [messages, setMessages] = useState(() => initialSetup.fresh.messages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedPromptCategory, setSelectedPromptCategory] = useState("all");
  const messagesEndRef = useRef(null);
  const autoSentRef = useRef(false);

  // Persist widget handoff session and mark consumed so refreshes don't duplicate it
  useEffect(() => {
    const handoffId = initialSetup.fresh?._fromWidgetHandoffId;
    if (handoffId) {
      sessionStorage.setItem("portfolio_chat_consumed_handoff", String(handoffId));
      const { _fromWidgetHandoffId, ...cleanSession } = initialSetup.fresh;
      if (cleanSession.messages?.some((m) => m.role === "user")) {
        saveLocalSessions(currentUser?._id, initialSetup.initialList.map(({ _fromWidgetHandoffId: _, ...s }) => s));
        saveChatSession(cleanSession).catch(() => {});
      }
    }
  }, [initialSetup, currentUser?._id]);

  useEffect(() => {
    dispatch(fetchPortfolios());
  }, [dispatch]);

  // Load backend chat sessions & merge with local storage
  useEffect(() => {
    const fetchRemoteSessions = async () => {
      try {
        const res = await getChatSessions();
        if (res.data?.success && Array.isArray(res.data.sessions) && res.data.sessions.length > 0) {
          const remoteSessions = res.data.sessions;
          setSessions((prev) => {
            const currentActive = prev.find((s) => s.sessionId === currentSessionId);
            const combined = currentActive ? [currentActive] : [];
            remoteSessions.forEach((r) => {
              if (!combined.some((c) => c.sessionId === r.sessionId)) {
                combined.push(r);
              }
            });
            prev.forEach((local) => {
              if (!combined.some((c) => c.sessionId === local.sessionId)) {
                combined.push(local);
              }
            });
            combined.sort(
              (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
            );
            saveLocalSessions(currentUser?._id, combined);
            return combined;
          });
        }
      } catch (err) {
        // Guest mode or offline fallback
        console.warn("Could not sync remote chat sessions:", err.message);
      }
    };
    fetchRemoteSessions();
  }, [currentUser?._id]);

  // Merge any user chat history from local storage when currentUser?._id resolves
  useEffect(() => {
    const local = loadLocalSessions(currentUser?._id);
    if (local.length > 0) {
      setSessions((prev) => {
        const currentActive = prev.find((s) => s.sessionId === currentSessionId);
        const past = local.filter((s) => s.messages?.some((m) => m.role === "user"));
        const merged = currentActive ? [currentActive] : [];
        past.forEach((p) => {
          if (!merged.some((m) => m.sessionId === p.sessionId)) {
            merged.push(p);
          }
        });
        saveLocalSessions(currentUser?._id, merged);
        return merged;
      });
    }
  }, [currentUser?._id]);

  // If page loaded with URL params, automatically inspect once (never repeat on refresh)
  useEffect(() => {
    if (autoSentRef.current) return;

    // If the active session already contains user conversation, do not re-send
    const active = sessions.find((s) => s.sessionId === currentSessionId);
    if (active && Array.isArray(active.messages) && active.messages.length > 1) {
      autoSentRef.current = true;
      return;
    }

    if (initialId && !activePortfolioData && portfolios.length > 0) {
      const match = portfolios.find((p) => p._id === initialId);
      if (match) {
        autoSentRef.current = true;
        const link =
          match.deployedUrl || `${window.location.origin}/portfolio/${match._id}`;
        setActiveLink(link);
        handleSend(link);
      }
    } else if (initialUrl && !activeLink) {
      autoSentRef.current = true;
      setActiveLink(initialUrl);
      handleSend(initialUrl);
    }
  }, [initialId, initialUrl, portfolios, currentSessionId, sessions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Helper to persist session changes to state, localStorage, and MongoDB backend
  const updateSessionStore = (newMessages, linkOverride, portfolioOverride, titleOverride) => {
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.sessionId === currentSessionId);
      let updatedList;
      const currentLink = linkOverride !== undefined ? linkOverride : activeLink;
      const currentPortfolio = portfolioOverride !== undefined ? portfolioOverride : activePortfolioData;

      if (idx >= 0) {
        const existing = prev[idx];
        const newTitle =
          titleOverride ||
          (existing.title === "New Chat" && newMessages.length > 1
            ? generateSmartTitle(
                newMessages.find((m) => m.role === "user")?.content || "",
                currentLink,
                currentPortfolio
              )
            : existing.title);

        const updatedSession = {
          ...existing,
          title: newTitle,
          activeLink: currentLink,
          portfolioData: currentPortfolio,
          messages: newMessages,
          updatedAt: new Date().toISOString(),
        };

        updatedList = [...prev];
        updatedList[idx] = updatedSession;
        updatedList.sort(
          (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        );

        saveChatSession(updatedSession).catch(() => {});
      } else {
        const newSession = {
          sessionId: currentSessionId,
          title: titleOverride || "New Chat",
          activeLink: currentLink,
          portfolioData: currentPortfolio,
          messages: newMessages,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        updatedList = [newSession, ...prev];
        saveChatSession(newSession).catch(() => {});
      }

      saveLocalSessions(currentUser?._id, updatedList);
      localStorage.setItem(LAST_ACTIVE_SESSION_KEY, currentSessionId);
      return updatedList;
    });
  };

  // Create a brand new ChatGPT-style chat session
  const handleNewChat = () => {
    // If the active session is already fresh with no user messages, just ensure it's clean and selected
    const active = sessions.find((s) => s.sessionId === currentSessionId);
    const hasUserMessages = active?.messages?.some((m) => m.role === "user");

    if (active && !hasUserMessages) {
      setMessages([buildWelcomeMessage(userName, "")]);
      setActiveLink("");
      setActivePortfolioData(null);
      setPendingQuestion(null);
      setInput("");
      toast.success("Started new chat session");
      return;
    }

    const newId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newSession = {
      sessionId: newId,
      title: "New Chat",
      activeLink: "",
      portfolioData: null,
      messages: [buildWelcomeMessage(userName, "")],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Filter out any other empty sessions so history only contains active fresh chat + past chats with user messages
    const pastOnly = sessions.filter((s) => s.messages?.some((m) => m.role === "user"));
    const nextSessions = [newSession, ...pastOnly];
    setSessions(nextSessions);
    saveLocalSessions(currentUser?._id, nextSessions);
    saveChatSession(newSession).catch(() => {});

    setCurrentSessionId(newId);
    localStorage.setItem(LAST_ACTIVE_SESSION_KEY, newId);
    setMessages(newSession.messages);
    setActiveLink("");
    setActivePortfolioData(null);
    setPendingQuestion(null);
    setInput("");
    toast.success("Started new chat session");
  };

  // When re-navigating to the chatbot section from the menu, start a fresh chat automatically
  // (unless handed off from the floating widget with an active conversation)
  useEffect(() => {
    if (prevLocationKeyRef.current !== location.key) {
      prevLocationKeyRef.current = location.key;
      if (location.state?.fromWidget) return;
      const active = sessions.find((s) => s.sessionId === currentSessionId);
      const hasUserMessages = active?.messages?.some((m) => m.role === "user");
      if (hasUserMessages) {
        handleNewChat();
      }
    }
  }, [location.key, location.state]);

  // Switch to an existing chat session from history
  const handleSelectSession = (session) => {
    if (session.sessionId === currentSessionId) return;
    setCurrentSessionId(session.sessionId);
    localStorage.setItem(LAST_ACTIVE_SESSION_KEY, session.sessionId);
    setMessages(session.messages && session.messages.length > 0 ? session.messages : [buildWelcomeMessage(userName, session.activeLink, session.portfolioData)]);
    setActiveLink(session.activeLink || "");
    setActivePortfolioData(session.portfolioData || null);
    setPendingQuestion(null);
  };

  // Delete a chat session
  const handleDeleteSession = async (sessionId, e) => {
    e?.stopPropagation();
    try {
      const nextSessions = sessions.filter((s) => s.sessionId !== sessionId);
      setSessions(nextSessions);
      saveLocalSessions(currentUser?._id, nextSessions);
      await deleteChatSession(sessionId);

      if (sessionId === currentSessionId) {
        if (nextSessions.length > 0) {
          handleSelectSession(nextSessions[0]);
        } else {
          handleNewChat();
        }
      }
      toast.success("Chat deleted from history");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete chat session");
    }
  };

  // Inline rename session
  const handleStartRename = (session, e) => {
    e?.stopPropagation();
    setEditingSessionId(session.sessionId);
    setEditingTitle(session.title);
  };

  const handleSaveRename = async (sessionId, e) => {
    e?.stopPropagation?.();
    if (!editingTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    const trimmed = editingTitle.trim();
    setEditingSessionId(null);

    setSessions((prev) => {
      const updated = prev.map((s) =>
        s.sessionId === sessionId ? { ...s, title: trimmed, updatedAt: new Date().toISOString() } : s
      );
      saveLocalSessions(currentUser?._id, updated);
      const target = updated.find((s) => s.sessionId === sessionId);
      if (target) saveChatSession(target).catch(() => {});
      return updated;
    });
    toast.success("Chat title updated");
  };

  // Clear all chat conversations
  const handleClearAllHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your entire chat history?")) return;
    try {
      saveLocalSessions(currentUser?._id, []);
      setSessions([]);
      await clearChatSessions();
      handleNewChat();
      toast.success("All chat history cleared");
    } catch (err) {
      console.error(err);
      toast.error("Failed to clear chat history");
    }
  };

  // Filtered & grouped history for rendering
  const filteredSessions = useMemo(() => {
    if (!historySearch.trim()) return sessions;
    const q = historySearch.toLowerCase();
    return sessions.filter(
      (s) =>
        s.title?.toLowerCase().includes(q) ||
        s.activeLink?.toLowerCase().includes(q) ||
        s.messages?.some((m) => m.content?.toLowerCase().includes(q))
    );
  }, [sessions, historySearch]);

  const groupedSessions = useMemo(() => {
    return groupSessionsByDate(filteredSessions);
  }, [filteredSessions]);

  // Handle sending a message
  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      content: textToSend.trim(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    // Detect if text contains a URL
    const urlMatch = textToSend.match(/https?:\/\/[^\s]+/i);
    const linkInMessage = urlMatch ? urlMatch[0].replace(/[)>,;.]+$/, "") : "";
    const currentLink = linkInMessage || activeLink;

    if (linkInMessage) {
      setActiveLink(linkInMessage);
    }

    // Persist immediately with user message
    updateSessionStore(nextMessages, currentLink, activePortfolioData);

    try {
      const res = await chatWithPortfolioAI({
        message: textToSend.trim(),
        url: currentLink,
        githubUrl: currentLink?.includes("github.com") ? currentLink : undefined,
        portfolioData: activePortfolioData,
        portfolioId: activePortfolioData?._id,
        conversationHistory: messages
          .filter((m) => m.id !== "welcome")
          .slice(-6)
          .map((m) => ({ role: m.role, content: m.content })),
      });

      let updatedPortfolio = activePortfolioData;
      let finalLink = currentLink;

      if (res.data?.targetPortfolio) {
        updatedPortfolio = res.data.targetPortfolio;
        setActivePortfolioData(updatedPortfolio);
        if (res.data.targetPortfolio.deployedUrl && !activeLink) {
          finalLink = res.data.targetPortfolio.deployedUrl;
          setActiveLink(finalLink);
        }
        toast.success(`Inspected portfolio: ${res.data.targetPortfolio.title}!`);
      } else if (res.data?.githubRepo) {
        updatedPortfolio = res.data.githubRepo;
        setActivePortfolioData(updatedPortfolio);
        toast.success(`Connected GitHub: ${res.data.githubRepo.fullName}!`);
      }

      setPendingQuestion(null);

      const replyContent =
        res.data?.reply ||
        "I analyzed your portfolio query. Focus on quantified metrics ($ saved, % speedup) and high-demand keywords matching your target role.";

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        content: replyContent,
      };
      const finalMessages = [...nextMessages, aiMessage];
      setMessages(finalMessages);
      updateSessionStore(finalMessages, finalLink, updatedPortfolio);
    } catch (err) {
      console.error(err);
      const fallbackMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        content: `I encountered an issue reaching the live link. Please ensure the link is publicly accessible (e.g. your live Netlify URL, localhost preview, or GitHub repository link) and try again.`,
      };
      const finalMessages = [...nextMessages, fallbackMessage];
      setMessages(finalMessages);
      updateSessionStore(finalMessages, currentLink, activePortfolioData);
    } finally {
      setLoading(false);
    }
  };

  const handleResetLink = () => {
    setActiveLink("");
    setActivePortfolioData(null);
    setPendingQuestion(null);
    const resetMsg = {
      id: Date.now().toString(),
      role: "assistant",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      content: `🔄 **Ready to inspect another portfolio.**\n\n🔗 **Please provide me the live link or GitHub repo link of your portfolio:**`,
    };
    const nextList = [...messages, resetMsg];
    setMessages(nextList);
    updateSessionStore(nextList, "", null);
    toast.success("Ready for new portfolio link");
  };

  const handleSidebarLinkSubmit = (e) => {
    e.preventDefault();
    if (!sidebarLinkInput.trim() || loading) return;
    const link = sidebarLinkInput.trim();
    setSidebarLinkInput("");
    handleSend(link);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Advice copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex min-h-screen bg-[#0B0E17] text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <WorkspaceBackdrop />
        <Topbar />

        <main className="relative z-10 flex-1 p-3 sm:p-5 lg:p-6 max-w-[1720px] w-full mx-auto flex flex-col gap-5">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <CyberBotAvatar size="md" interactive={true} />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-zinc-950 animate-pulse shadow-md shadow-emerald-400/50" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    AI Career Chatbot
                  </h1>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold">
                    PORTFOLIO COPILOT
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  ChatGPT-style persistent history & strictly link-tailored recruiter advice
                </p>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2.5">
              {/* History Toggle Button */}
              <button
                onClick={() => setIsHistoryOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  isHistoryOpen
                    ? "bg-indigo-600/15 border-indigo-500/40 text-indigo-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
                title="Toggle ChatGPT History Sidebar"
              >
                {isHistoryOpen ? <PanelLeftClose size={14} /> : <PanelLeft size={14} />}
                <History size={13} className="text-indigo-400" />
                <span>History</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] font-mono text-zinc-300 font-bold">
                  {sessions.length}
                </span>
              </button>

              {/* New Chat Primary Button */}
              <button
                onClick={handleNewChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/20 cursor-pointer"
                title="Create a new conversation"
              >
                <Plus size={14} />
                <span>New Chat</span>
              </button>

              {activeLink && (
                <button
                  onClick={handleResetLink}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 text-xs text-zinc-400 hover:text-zinc-200 transition"
                  title="Inspect a different portfolio link"
                >
                  <RefreshCw size={12} />
                  <span className="hidden sm:inline">Change Link</span>
                </button>
              )}
            </div>
          </div>

          {/* Portfolio Link Context Section (Below heading and above chat option) */}
          <div className="p-4 sm:p-5 rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <LinkIcon size={16} className="text-indigo-400" />
                <span>Portfolio Link Context</span>
              </h3>
              {activeLink && (
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CONNECTED
                </span>
              )}
            </div>

            {activeLink ? (
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2.5 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-zinc-500 block text-[11px] mb-0.5">
                      Connected Link:
                    </span>
                    <a
                      href={activeLink}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-indigo-300 hover:underline break-all flex items-center gap-1"
                    >
                      <span>{activeLink}</span>
                      <ExternalLink size={11} className="shrink-0" />
                    </a>
                  </div>

                  <button
                    onClick={handleResetLink}
                    className="self-start sm:self-auto py-1 px-3 rounded-lg bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    <span>Inspect Different Link</span>
                  </button>
                </div>

                {activePortfolioData && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2.5 border-t border-zinc-800/60 text-zinc-400">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Portfolio Name:</span>
                      <span className="font-semibold text-white truncate block">
                        {activePortfolioData.title ||
                          activePortfolioData.fullName ||
                          "Portfolio"}
                      </span>
                    </div>
                    {activePortfolioData.targetRole && (
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Target Role:</span>
                        <span className="font-semibold text-white truncate block">
                          {activePortfolioData.targetRole}
                        </span>
                      </div>
                    )}
                    {activePortfolioData.template && (
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Template:</span>
                        <span className="font-semibold text-indigo-400 capitalize truncate block">
                          {activePortfolioData.template}
                        </span>
                      </div>
                    )}
                    {activePortfolioData.projectsCount !== undefined && (
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Projects Inspected:</span>
                        <span className="font-bold text-emerald-400 block">
                          {activePortfolioData.projectsCount} Projects
                        </span>
                      </div>
                    )}
                    {activePortfolioData.language && (
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Repo Language:</span>
                        <span className="font-semibold text-indigo-300 block">
                          {activePortfolioData.language}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles size={14} className="text-indigo-400" />
                  <span>Portfolio Knowledge Mode Active</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  You can ask <strong>any question related to portfolios, projects, tech stacks, or ATS</strong> right away. If you'd like a real-time audit of your actual live website or GitHub repository, connect your URL below!
                </p>
              </div>
            )}

            {/* Inspect Link Form */}
            <form
              onSubmit={handleSidebarLinkSubmit}
              className="space-y-2 pt-2 border-t border-zinc-800/80"
            >
              <label className="text-[11px] text-zinc-400 font-medium block">
                {activeLink ? "Inspect Another Link:" : "Connect Live Portfolio or GitHub URL (Optional):"}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sidebarLinkInput}
                  onChange={(e) => setSidebarLinkInput(e.target.value)}
                  placeholder="e.g. https://your-portfolio.vercel.app or github.com/user/repo"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!sidebarLinkInput.trim() || loading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-semibold text-white transition shrink-0 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  Inspect
                </button>
              </div>
            </form>
          </div>

          {/* Main Workspace (History Sidebar + Active Chat Area) */}
          <div className="flex gap-5 flex-1 min-h-[640px] relative">
            {/* 1. ChatGPT-Style Left History Sidebar */}
            {isHistoryOpen && (
              <aside className="w-72 lg:w-80 shrink-0 flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-200 z-10">
                {/* History Header & + New Chat */}
                <div className="p-3.5 border-b border-zinc-800/80 space-y-2.5 bg-zinc-900/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History size={15} className="text-indigo-400" />
                      <span className="font-bold text-xs uppercase tracking-wider text-zinc-300">
                        Chat History
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-400 font-mono">
                        {filteredSessions.length}
                      </span>
                    </div>

                    <button
                      onClick={() => setIsHistoryOpen(false)}
                      className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition"
                      title="Hide Sidebar"
                    >
                      <PanelLeftClose size={14} />
                    </button>
                  </div>

                  {/* + New Chat Button in Sidebar */}
                  <button
                    onClick={handleNewChat}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-200 hover:text-white text-xs font-semibold flex items-center justify-between transition cursor-pointer shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Plus size={14} className="text-indigo-400" />
                      New Conversation
                    </span>
                    <span className="text-[10px] font-mono text-indigo-400/80 uppercase">AI</span>
                  </button>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search
                      size={13}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <input
                      type="text"
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      placeholder="Search conversations..."
                      className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                    {historySearch && (
                      <button
                        onClick={() => setHistorySearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* History Session List with Date Grouping */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-4 max-h-[calc(100vh-320px)] custom-scrollbar">
                  {Object.entries(groupedSessions).map(([groupTitle, sessionList]) => {
                    if (!sessionList.length) return null;
                    return (
                      <div key={groupTitle} className="space-y-1">
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                          <Clock size={10} />
                          <span>{groupTitle}</span>
                        </div>

                        <div className="space-y-1">
                          {sessionList.map((s) => {
                            const isActive = s.sessionId === currentSessionId;
                            const isEditing = editingSessionId === s.sessionId;

                            return (
                              <div
                                key={s.sessionId}
                                onClick={() => handleSelectSession(s)}
                                className={`group relative w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs transition cursor-pointer ${
                                  isActive
                                    ? "bg-gradient-to-r from-indigo-900/40 to-purple-900/20 border border-indigo-500/40 text-white shadow-sm"
                                    : "border border-transparent hover:border-zinc-800/80 hover:bg-zinc-900/80 text-zinc-400 hover:text-zinc-200"
                                }`}
                              >
                                <MessageSquare
                                  size={13}
                                  className={`shrink-0 ${
                                    isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-400"
                                  }`}
                                />

                                {isEditing ? (
                                  <form
                                    onSubmit={(e) => handleSaveRename(s.sessionId, e)}
                                    className="flex-1 flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <input
                                      type="text"
                                      value={editingTitle}
                                      onChange={(e) => setEditingTitle(e.target.value)}
                                      autoFocus
                                      onKeyDown={(e) => e.key === "Escape" && setEditingSessionId(null)}
                                      className="flex-1 bg-zinc-900 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                                    />
                                    <button
                                      type="submit"
                                      className="p-1 text-emerald-400 hover:text-emerald-300"
                                      title="Save Title"
                                    >
                                      <Check size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingSessionId(null)}
                                      className="p-1 text-zinc-400 hover:text-zinc-200"
                                      title="Cancel"
                                    >
                                      <X size={12} />
                                    </button>
                                  </form>
                                ) : (
                                  <>
                                    <div className="flex-1 min-w-0">
                                      <p className="truncate font-medium leading-tight">
                                        {s.title || "New Chat"}
                                      </p>
                                      {s.activeLink ? (
                                        <p className="truncate text-[10px] text-zinc-500 font-mono mt-0.5">
                                          {s.activeLink.replace(/^https?:\/\//, "")}
                                        </p>
                                      ) : (
                                        <p className="text-[10px] text-zinc-600 mt-0.5">
                                          {s.messages?.length || 1} messages
                                        </p>
                                      )}
                                    </div>

                                    {/* Action buttons (Rename & Delete) */}
                                    <div
                                      className={`flex items-center gap-1 transition ${
                                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                      }`}
                                    >
                                      <button
                                        onClick={(e) => handleStartRename(s, e)}
                                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                                        title="Rename Chat"
                                      >
                                        <Edit3 size={11} />
                                      </button>
                                      <button
                                        onClick={(e) => handleDeleteSession(s.sessionId, e)}
                                        className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition"
                                        title="Delete Chat"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {filteredSessions.length === 0 && (
                    <div className="p-6 text-center text-xs text-zinc-500 space-y-2">
                      <MessageSquare size={20} className="mx-auto text-zinc-600" />
                      <p>No chat conversations found.</p>
                      <button
                        onClick={handleNewChat}
                        className="text-indigo-400 hover:underline text-[11px]"
                      >
                        Start a new conversation
                      </button>
                    </div>
                  )}
                </div>

                {/* History Footer Actions */}
                <div className="p-3 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-zinc-500">
                    {sessions.length} {sessions.length === 1 ? "chat" : "chats"} recorded
                  </span>
                  {sessions.length > 0 && (
                    <button
                      onClick={handleClearAllHistory}
                      className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                      title="Clear all chat history"
                    >
                      <Trash2 size={11} />
                      <span>Clear All</span>
                    </button>
                  )}
                </div>
              </aside>
            )}

            {/* 2. Middle Active Chat Area */}
            <div className="flex-1 flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-2xl overflow-hidden backdrop-blur-xl min-w-0">
              {/* Context Bar */}
              <div className="p-3.5 bg-zinc-900/80 border-b border-zinc-800/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-300 truncate">
                  {!isHistoryOpen && (
                    <button
                      onClick={() => setIsHistoryOpen(true)}
                      className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition mr-1"
                      title="Open Chat History"
                    >
                      <PanelLeft size={15} />
                    </button>
                  )}

                  {activeLink ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-sm shadow-emerald-400/50" />
                      <span className="text-zinc-400">Inspecting Link:</span>
                      <a
                        href={activeLink}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-indigo-300 hover:underline truncate max-w-[240px] sm:max-w-[340px] flex items-center gap-1"
                      >
                        {activeLink.includes("github.com") ? (
                          <GitBranch size={12} className="shrink-0 text-zinc-300" />
                        ) : (
                          <Globe size={12} className="shrink-0 text-emerald-400" />
                        )}
                        <span className="truncate">{activeLink}</span>
                        <ExternalLink size={10} className="shrink-0 opacity-70" />
                      </a>
                      {activePortfolioData?.targetRole && (
                        <span className="hidden md:inline-block px-2 py-0.5 rounded bg-zinc-800 text-[11px] text-zinc-300 font-medium">
                          {activePortfolioData.targetRole}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-sm shadow-emerald-400/50" />
                      <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <Sparkles size={13} />
                        Portfolio Knowledge Mode:
                      </span>
                      <span className="text-zinc-400 text-[11px] truncate">
                        Ready for any portfolio question (paste a link anytime for real-time audits)
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {activeLink ? (
                    <button
                      onClick={handleResetLink}
                      className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800/60 hover:bg-zinc-800 transition"
                    >
                      <RefreshCw size={11} />
                      <span className="hidden sm:inline">Change Link</span>
                    </button>
                  ) : null}

                  <Link
                    to="/analyzer"
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <span>7-Pillar Audit</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 max-h-[580px]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-3 sm:gap-4 ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {m.role === "assistant" && (
                      <div className="shrink-0 mt-1">
                        <CyberBotAvatar size="sm" />
                      </div>
                    )}

                    <div
                      className={`rounded-2xl p-4 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "max-w-[92%] sm:max-w-[80%] bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20"
                          : "w-full max-w-[96%] sm:max-w-[92%] bg-zinc-900/90 border border-zinc-800 text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1.5 text-[11px] opacity-70">
                        <span className="font-semibold">
                          {m.role === "user" ? "You" : "PortfolioAI Copilot"}
                        </span>
                        <span>{m.timestamp}</span>
                      </div>

                      {m.role === "user" ? (
                        <div className="space-y-2 whitespace-pre-line break-words text-white">
                          {m.content}
                        </div>
                      ) : (
                        <div className="space-y-2 break-words">
                          <MarkdownMessage content={m.content} />
                        </div>
                      )}

                      {m.role === "assistant" && (
                        <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                          <button
                            onClick={() => handleCopy(m.id, m.content)}
                            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition cursor-pointer"
                          >
                            {copiedId === m.id ? (
                              <>
                                <Check size={12} className="text-emerald-400" />
                                <span className="text-emerald-400 font-semibold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy Advice</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {m.role === "user" && (
                      <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0 mt-1 font-bold text-xs">
                        {currentUser?.fullName?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3 items-center text-zinc-400 text-xs">
                    <CyberBotAvatar size="sm" isThinking={true} />
                    <div className="px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                      <span>PortfolioAI is inspecting your portfolio link and projects...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Question Category Tabs & Chips */}
              <div className="p-3 bg-zinc-900/60 border-t border-zinc-800/80 space-y-2">
                {/* Category Pills */}
                <div
                  className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                    <Compass size={12} className="text-indigo-400" />
                    Topics:
                  </span>
                  {SUGGESTED_PROMPTS.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = selectedPromptCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedPromptCategory(cat.id)}
                        className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                            : "bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <Icon size={11} />
                        <span>{cat.category}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Question Pills for Selected Category */}
                <div
                  className="flex gap-2 overflow-x-auto no-scrollbar py-0.5"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {(
                    SUGGESTED_PROMPTS.find((c) => c.id === selectedPromptCategory)?.questions ||
                    SUGGESTED_PROMPTS[0].questions
                  ).map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      disabled={loading}
                      className="shrink-0 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-indigo-500/50 text-zinc-300 hover:text-white text-xs transition cursor-pointer flex items-center gap-1.5 group shadow-sm"
                      title={q}
                    >
                      <Sparkles size={11} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Bar */}
              <div className="p-3.5 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2.5">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder={
                    activeLink
                      ? `Ask any question about this portfolio (${activeLink})...`
                      : "Ask any question about portfolios, projects, tech stacks, ATS..."
                  }
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />

                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs flex items-center gap-1.5 hover:opacity-95 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <Send size={14} />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatbotPage;
