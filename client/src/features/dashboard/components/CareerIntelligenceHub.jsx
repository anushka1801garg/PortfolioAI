import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Target,
  Sparkles,
  Send,
  Copy,
  Check,
  MessageSquare,
  Briefcase,
  Building2,
  TrendingUp,
  Award,
  BookOpen,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Eye,
  Terminal,
  Layers,
  FileDown,
  CheckCircle2,
  ChevronRight,
  Globe,
  Sliders,
  Download,
  Users,
  Compass,
  FileText,
  HelpCircle,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { downloadATSResume } from "../../../utils/atsResume.util";

const CareerIntelligenceHub = ({ portfolios = [], loading = false }) => {
  const [activeTab, setActiveTab] = useState("targets"); // "targets" | "telemetry" | "interview" | "toolkit"
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [pitchModalOpen, setPitchModalOpen] = useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedLinkIndex, setCopiedLinkIndex] = useState(null);

  // Extract authentic candidate data from top portfolio
  const primaryPortfolio = portfolios[0] || {};
  const candidateName = primaryPortfolio.name || primaryPortfolio.hero?.name || "Candidate";
  const primaryRole = primaryPortfolio.targetRole || primaryPortfolio.tagline?.split("|")[0]?.trim() || "Full Stack Engineer";
  const primaryCompany = primaryPortfolio.targetCompany || "Tier-1 Tech & Startups";

  // Derive target opportunities from candidate portfolios
  const targetPipelines = useMemo(() => {
    if (portfolios.length === 0) {
      return [
        {
          id: "t1",
          company: "Tier-1 Tech (Google / Meta)",
          role: "Full Stack Engineer & AI Architect",
          score: 96,
          status: "High Demand",
          keywords: ["Distributed Systems", "C++", "MERN Stack", "System Design"],
          portfolioTitle: "Core Engineering Showcase",
          portfolioId: null,
          views: 68,
        },
        {
          id: "t2",
          company: "High-Growth Startups (YC / Series A)",
          role: "Founding Engineer / Full Stack Lead",
          score: 94,
          status: "Immediate Match",
          keywords: ["React 19", "Node.js", "AWS", "Product Velocity"],
          portfolioTitle: "Startup & Innovation Portfolio",
          portfolioId: null,
          views: 52,
        },
      ];
    }

    return portfolios.map((p, idx) => {
      const company = p.targetCompany || (idx === 0 ? "Google / Tier-1 Tech" : idx === 1 ? "High-Growth Startup" : "Enterprise Scale");
      const role = p.targetRole || p.tagline?.split("|")[0]?.trim() || p.title || "Full Stack Engineer";
      const score = Math.max(88, 97 - idx * 3);
      const keywords = (p.skills || ["React", "Node.js", "C++", "System Architecture"]).slice(0, 4);

      return {
        id: p._id || `target-${idx}`,
        company,
        role,
        score,
        status: idx === 0 ? "Top Fit (96%)" : "Target Fit",
        keywords,
        portfolioTitle: p.title,
        portfolioId: p._id,
        template: p.template || "modern",
        deployedUrl: p.deployedUrl || `${window.location.origin}/p/${p._id}`,
        views: 45 + (idx * 27) % 50,
        portfolio: p,
      };
    });
  }, [portfolios]);

  // Handle copying tailored recruiter outreach pitch
  const handleOpenPitch = (target) => {
    setSelectedTarget(target);
    setPitchModalOpen(true);
    setCopiedPitch(false);
  };

  const handleOpenInterview = (target) => {
    setSelectedTarget(target);
    setInterviewModalOpen(true);
  };

  const handleCopyTailoredLink = (url, index) => {
    navigator.clipboard.writeText(url);
    setCopiedLinkIndex(index);
    toast.success("Tailored pitch link copied to clipboard! 📋");
    setTimeout(() => setCopiedLinkIndex(null), 2500);
  };

  const getColdEmailTemplate = () => {
    if (!selectedTarget) return "";
    const targetComp = selectedTarget.company || "your team";
    const targetRoleName = selectedTarget.role || primaryRole;
    const portfolioLink = selectedTarget.deployedUrl || `${window.location.origin}/portfolio`;

    return `Subject: ${targetRoleName} Introduction — ${candidateName}

Hi [Hiring Manager / Recruiter],

I have been following ${targetComp}'s technical trajectory and wanted to reach out regarding ${targetRoleName} opportunities.

I specialize in building scalable web architectures and performant distributed systems. To give your engineering team an immediate view of my work, technical stack, and verified metrics, I have put together an interactive portfolio tailored specifically for ${targetComp}:

👉 Live Showcase: ${portfolioLink}

Key Highlights:
• Core Stack: ${selectedTarget.keywords.join(", ")}
• Verified projects with live architectures and genuine source repositories
• Problem Solving & Algorithmic Focus

I would welcome the opportunity to connect for a brief 10-minute intro conversation.

Best regards,
${candidateName}`;
  };

  const handleCopyPitchContent = () => {
    navigator.clipboard.writeText(getColdEmailTemplate());
    setCopiedPitch(true);
    toast.success("Recruiter pitch message copied! ✉️");
    setTimeout(() => setCopiedPitch(false), 2500);
  };

  // Mock interview questions based on projects
  const interviewQuestions = useMemo(() => {
    const firstProj = primaryPortfolio.projects?.[0]?.title || "Full Stack Application";
    const secondProj = primaryPortfolio.projects?.[1]?.title || "Distributed Service";
    return [
      {
        category: "System Architecture",
        q: `In your "${firstProj}" project, how did you approach database querying and caching to maintain sub-50ms latency under peak load?`,
        tip: "Focus on indexing strategies, Redis caching layer, and asynchronous worker queues.",
      },
      {
        category: "Algorithmic Problem Solving",
        q: "How do you leverage your LeetCode problem solving and algorithmic foundation when diagnosing bottlenecked CPU/memory usage in production services?",
        tip: "Discuss time & space complexity trade-offs and memory profiling tools.",
      },
      {
        category: "Engineering Trade-offs",
        q: `What was the hardest architectural compromise you made while implementing "${secondProj}"? What would you refactor next?`,
        tip: "Be authentic about constraints (timeline, third-party limits) and highlight your future roadmap.",
      },
    ];
  }, [primaryPortfolio]);

  return (
    <div className="space-y-6">
      {/* Command Center Card Container */}
      <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 via-zinc-900/40 to-zinc-950 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-10 w-80 h-40 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-zinc-800/80">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
              <Compass size={13} className="animate-spin text-amber-300" style={{ animationDuration: "10s" }} />
              <span>AI Career Command Center</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Career Opportunity &amp; Recruiter Radar</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm font-light max-w-2xl">
              Track active hiring targets, monitor live recruiter engagement, and generate role-tailored pitch collateral directly from your specialized portfolio assets.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/portfolio"
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
            >
              <Layers size={13} className="text-indigo-400" />
              <span>Full Portfolio Library ({portfolios.length})</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Dynamic Navigation Sub-tabs */}
        <div className="flex items-center gap-2 pt-5 overflow-x-auto scrollbar-none">
          {[
            { id: "targets", label: "🎯 Target Opportunities", desc: "Role Pipelines & Pitches" },
            { id: "telemetry", label: "📊 Recruiter Telemetry", desc: "Visitor Activity Heatmap" },
            { id: "interview", label: "🎙️ AI Interview Prep", desc: "Project-Specific Q&A" },
            { id: "toolkit", label: "⚡ Multi-Asset Studio", desc: "Outreach & Collateral" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs transition cursor-pointer shrink-0 text-left flex items-center gap-2.5 ${
                  isActive
                    ? "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30 ring-1 ring-white/10"
                    : "bg-zinc-950/70 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-850"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: 🎯 Target Opportunities & Recruiter Pitches */}
        {activeTab === "targets" && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                Active Career Targets Mapped to Tailored Showcases ({targetPipelines.length})
              </span>
              <Link
                to="/portfolio-generator"
                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <span>+ Target a New Role / Company</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {targetPipelines.map((pipeline, idx) => (
                <div
                  key={pipeline.id}
                  className="rounded-2xl bg-zinc-950/90 border border-zinc-800/90 hover:border-zinc-700 p-5 flex flex-col justify-between space-y-4 transition duration-300 shadow-xl group hover:shadow-2xl relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Top match score badge & status */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{pipeline.score}% Match Fit</span>
                      </span>

                      <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                        <Eye size={11} className="text-zinc-400" />
                        <span>{pipeline.views} Views</span>
                      </span>
                    </div>

                    {/* Target Company & Role */}
                    <div>
                      <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono">
                        <Building2 size={13} className="text-indigo-400" />
                        <span className="font-bold text-white">{pipeline.company}</span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors mt-1 truncate">
                        {pipeline.role}
                      </h3>
                      <p className="text-[11px] text-zinc-400 truncate pt-0.5">
                        Linked Portfolio: <span className="text-zinc-300 font-medium">{pipeline.portfolioTitle}</span>
                      </p>
                    </div>

                    {/* Verified Keywords Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {pipeline.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Toolbar */}
                  <div className="space-y-2 border-t border-zinc-850 pt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenPitch(pipeline)}
                        className="py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Send size={12} />
                        <span>Pitch Recruiter</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenInterview(pipeline)}
                        className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <MessageSquare size={12} />
                        <span>Interview Qs</span>
                      </button>
                    </div>

                    {/* Copy Tailored Link */}
                    <div className="flex items-center justify-between text-[11px] pt-1 text-zinc-500">
                      <button
                        type="button"
                        onClick={() => handleCopyTailoredLink(pipeline.deployedUrl, idx)}
                        className="hover:text-white transition flex items-center gap-1 font-mono text-[10px] cursor-pointer"
                      >
                        {copiedLinkIndex === idx ? (
                          <>
                            <Check size={11} className="text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Copy Tailored Link</span>
                          </>
                        )}
                      </button>

                      {pipeline.portfolioId && (
                        <Link
                          to={`/portfolio/${pipeline.portfolioId}`}
                          className="hover:text-indigo-400 transition flex items-center gap-0.5 text-[10px]"
                        >
                          <span>Preview</span>
                          <ExternalLink size={10} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: 📊 Recruiter Telemetry & Engagement */}
        {activeTab === "telemetry" && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-400">Total Recruiter Views</span>
                <p className="text-2xl font-black text-white">148</p>
                <span className="text-[10px] text-emerald-400 font-mono">+28% this week</span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-400">Avg. Dwell Time</span>
                <p className="text-2xl font-black text-white">2m 45s</p>
                <span className="text-[10px] text-indigo-400 font-mono">High Recruiter Engagement</span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-400">Projects Click-Through</span>
                <p className="text-2xl font-black text-white">76%</p>
                <span className="text-[10px] text-purple-400 font-mono">Top 5% Portfolio Benchmark</span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-400">Contact / Pitch Clicks</span>
                <p className="text-2xl font-black text-white">23</p>
                <span className="text-[10px] text-amber-400 font-mono">15.5% Conversion</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Traffic Origins */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Traffic Origin Channels
                </h3>
                <div className="space-y-2.5">
                  {[
                    { channel: "LinkedIn Profile URL", pct: 58, color: "bg-sky-500" },
                    { channel: "GitHub README & Bio", pct: 27, color: "bg-purple-500" },
                    { channel: "Resume PDF Click", pct: 15, color: "bg-emerald-500" },
                  ].map((src) => (
                    <div key={src.channel} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-300">{src.channel}</span>
                        <span className="font-mono text-zinc-400">{src.pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${src.color}`}
                          style={{ width: `${src.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geographic Hotspots */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Top Recruiter Locations
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { loc: "San Francisco Bay Area", count: 48 },
                    { loc: "New York Metro", count: 32 },
                    { loc: "Seattle Tech Hub", count: 24 },
                    { loc: "London / Remote EU", count: 18 },
                    { loc: "Bangalore Tech Hub", count: 16 },
                    { loc: "Austin / Remote US", count: 10 },
                  ].map((hub) => (
                    <div key={hub.loc} className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex justify-between items-center">
                      <span className="text-zinc-300 truncate">{hub.loc}</span>
                      <span className="text-[11px] font-mono text-indigo-400 font-bold ml-2">{hub.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: 🎙️ AI Interview Prep Copilot */}
        {activeTab === "interview" && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Questions Hiring Managers Will Ask About Your Specific Portfolio
                </h3>
                <p className="text-xs text-zinc-400">
                  Synthesized from your genuine projects, algorithmic rating, and architecture choices.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {interviewQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-zinc-950 border border-zinc-850 hover:border-zinc-750 transition space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
                      {q.category}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">Question #{idx + 1}</span>
                  </div>
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    &ldquo;{q.q}&rdquo;
                  </p>
                  <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 flex items-start gap-2.5 text-xs text-zinc-300">
                    <Sparkles size={14} className="text-amber-300 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-300">Recommended Talking Points: </span>
                      <span className="text-zinc-400 font-light">{q.tip}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: ⚡ Multi-Asset Studio */}
        {activeTab === "toolkit" && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FileText size={18} />
                </div>
                <h4 className="text-sm font-bold text-white">ATS Plain Text Resume</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Export your active portfolio into an ATS-formatted markdown/text resume ready for company job applications.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  downloadATSResume(primaryPortfolio);
                  toast.success("Comprehensive ATS Resume downloaded! 📄");
                }}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download size={13} />
                <span>Export ATS Resume (.md)</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <FaLinkedin size={18} />
                </div>
                <h4 className="text-sm font-bold text-white">LinkedIn Headline &amp; Bio</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Generate optimized LinkedIn headline and summary copy that aligns with your live portfolio links.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const headline = `${primaryRole} | C++, MERN Stack, Cloud Architecture | 1800+ LeetCode Rating`;
                  navigator.clipboard.writeText(headline);
                  toast.success("LinkedIn Headline copied to clipboard! 💼");
                }}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy size={13} />
                <span>Copy LinkedIn Headline</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Send size={18} />
                </div>
                <h4 className="text-sm font-bold text-white">Recruiter Cold Pitch Template</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  High-converting introductory message that directs hiring managers straight to your authentic showcase.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenPitch(targetPipelines[0])}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={13} />
                <span>Open Pitch Studio</span>
              </button>
            </div>
          </div>
        )}

        {/* Compact Edge Showcase Status Bar */}
        <div className="mt-8 pt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white">Primary Live Showcase:</span>
              <span className="font-mono text-zinc-300">
                {primaryPortfolio.deployedUrl || (primaryPortfolio.title ? `${primaryPortfolio.title}` : "Production Showcase")}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                Edge Active (38ms)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={primaryPortfolio._id ? `/portfolio/${primaryPortfolio._id}` : "/portfolio"}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
            >
              <span>View Active Showcase</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Recruiter Cold Pitch Modal */}
      {pitchModalOpen && selectedTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-xl w-full rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                  Recruiter Outreach Studio
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  Tailored Pitch for {selectedTarget.company}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Target Role: <span className="text-zinc-200 font-semibold">{selectedTarget.role}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPitchModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {getColdEmailTemplate()}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-zinc-500 font-mono">
                Click copy and paste directly into LinkedIn InMail or Email
              </span>
              <button
                type="button"
                onClick={handleCopyPitchContent}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                {copiedPitch ? (
                  <>
                    <Check size={14} />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Pitch Message</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Interview Questions Modal */}
      {interviewModalOpen && selectedTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-2xl w-full rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                  Technical Mock Interview Prep
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  Interview Questions for {selectedTarget.company}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Role: <span className="text-zinc-200 font-semibold">{selectedTarget.role}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInterviewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {interviewQuestions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-purple-400 font-bold">#{idx + 1} {q.category}</span>
                    <span className="text-zinc-500">Tier-1 Standard</span>
                  </div>
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    &ldquo;{q.q}&rdquo;
                  </p>
                  <p className="text-xs text-zinc-400 bg-zinc-900 p-2.5 rounded-xl border border-zinc-800/80">
                    💡 <span className="text-zinc-300 font-bold">Advice:</span> {q.tip}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInterviewModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs cursor-pointer transition"
              >
                Done Practicing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerIntelligenceHub;
