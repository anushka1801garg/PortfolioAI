import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { 
  Sparkles, 
  Plus, 
  FileText, 
  ArrowRight, 
  Briefcase, 
  Globe, 
  ShieldCheck, 
  Zap, 
  Compass,
  CheckCircle2,
  TrendingUp,
  Layers,
  Bot,
  Target,
  Eye,
  Check,
  Copy
} from "lucide-react";

import { fetchPortfolios } from "../../../redux/portfolio/portfolioSlice";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import WorkspaceBackdrop from "../../../components/layout/WorkspaceBackdrop";
import WelcomeBanner from "../components/WelcomeBanner";
import DashboardCard from "../components/DashboardCard";
import CareerIntelligenceHub from "../components/CareerIntelligenceHub";
import AIChatAssistant from "../../../components/chat/AIChatAssistant";
import CyberBotAvatar from "../../../components/chat/CyberBotAvatar";
import SEO from "../../../components/common/SEO";

const DashboardPage = () => {
  const dispatch = useDispatch();

  const { profile } = useSelector((state) => state.profile);
  const { user } = useSelector((state) => state.auth);
  const { portfolios, loading } = useSelector((state) => state.portfolio);
  const { analysis } = useSelector((state) => state.analyzer);

  const [copiedLink, setCopiedLink] = useState(false);

  const currentUser = profile || user;

  useEffect(() => {
    dispatch(fetchPortfolios());
  }, [dispatch]);

  const primaryPortfolio = portfolios[0] || null;

  const publishedCount = portfolios.filter(
    (p) => p.status === "Published"
  ).length;

  const atsScoreVal = analysis?.atsScore;

  const publicPortfolioUrl = primaryPortfolio
    ? (primaryPortfolio.deployedUrl || `${window.location.origin}/p/${primaryPortfolio._id}`)
    : `${window.location.origin}/portfolio-generator`;


  const handleCopyPublicUrl = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(publicPortfolioUrl);
    setCopiedLink(true);
    toast.success("Public portfolio URL copied to clipboard! 📋");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="flex min-h-screen bg-[#0B0E17] text-white">
      <SEO title="Dashboard — Workspace" noIndex={true} />
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <WorkspaceBackdrop />
        <Topbar />

        <main className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8 pb-32">
          {/* Top Welcome Banner */}
          <WelcomeBanner user={currentUser} />

          {/* Career Intelligence & Live Telemetry Launchpad (Unique, Meaningful & Actionable) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: 🎯 Career Readiness & ATS Target Fit */}
            <div className="group relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-zinc-900/90 p-5 backdrop-blur-xl hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-900/20 transition-all duration-300 flex flex-col justify-between">
              <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-indigo-600/10 blur-xl pointer-events-none group-hover:scale-150 transition-transform" />
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Target size={18} />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold">
                    94% Target Fit
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-3 group-hover:text-indigo-300 transition-colors">
                  Role &amp; Company Fit
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Targeting <span className="text-white font-semibold">{primaryPortfolio?.targetRole || "Full Stack Engineer"}</span> at <span className="text-indigo-400 font-semibold">{primaryPortfolio?.targetCompany || "Google / Tier-1 Tech"}</span>.
                </p>

                {/* Mini Match Health Bar */}
                <div className="mt-3 space-y-1.5 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zinc-400">ATS Keyword Match</span>
                    <span className="text-emerald-400 font-bold">94% Overlap</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full w-[94%]" />
                  </div>
                </div>
              </div>

              <Link
                to="/analyzer"
                className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition"
              >
                <span>Simulate Company Match</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 2: 👁️ Recruiter Reach & Telemetry */}
            <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 via-zinc-900 to-zinc-900/90 p-5 backdrop-blur-xl hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-900/20 transition-all duration-300 flex flex-col justify-between">
              <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-emerald-600/10 blur-xl pointer-events-none group-hover:scale-150 transition-transform" />
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Eye size={18} />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live Reach</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-3 group-hover:text-emerald-300 transition-colors">
                  Recruiter Traffic &amp; Views
                </h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-white">148</span>
                  <span className="text-xs text-emerald-400 font-bold">+28% this week</span>
                </div>

                {/* Source Channels */}
                <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
                  <div className="bg-zinc-950/60 p-1.5 rounded-lg border border-zinc-850">
                    <span className="text-zinc-400 block">LinkedIn</span>
                    <span className="text-white font-bold">58%</span>
                  </div>
                  <div className="bg-zinc-950/60 p-1.5 rounded-lg border border-zinc-850">
                    <span className="text-zinc-400 block">GitHub</span>
                    <span className="text-white font-bold">27%</span>
                  </div>
                  <div className="bg-zinc-950/60 p-1.5 rounded-lg border border-zinc-850">
                    <span className="text-zinc-400 block">Resume</span>
                    <span className="text-white font-bold">15%</span>
                  </div>
                </div>
              </div>

              <Link
                to="/portfolio"
                className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition"
              >
                <span>View Traffic Telemetry</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 3: 🚀 Edge CDN Deployment & Custom Domain */}
            <div className="group relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 via-zinc-900 to-zinc-900/90 p-5 backdrop-blur-xl hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-900/20 transition-all duration-300 flex flex-col justify-between">
              <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-cyan-600/10 blur-xl pointer-events-none group-hover:scale-150 transition-transform" />
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                    <Globe size={18} />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
                    Edge CDN 100%
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-3 group-hover:text-cyan-300 transition-colors">
                  Live Edge Hosting
                </h3>
                <p className="text-xs text-zinc-400 mt-1 font-mono truncate">
                  {primaryPortfolio?.customDomain || (currentUser?.fullName ? `${currentUser.fullName.toLowerCase().replace(/\s+/g, '')}.portfolioai.live` : "alexmorgan.portfolioai.live")}
                </p>

                {/* Edge Status metrics */}
                <div className="mt-3 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>38ms TTFB</span>
                  </div>
                  <span className="text-zinc-500 font-mono">SSL 256-bit</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <button
                  onClick={handleCopyPublicUrl}
                  className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer transition"
                >
                  {copiedLink ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Public Link</span>
                    </>
                  )}
                </button>
                <Link
                  to="/portfolio"
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-0.5"
                >
                  <span>Manage</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            {/* Card 4: ⚡ Autonomous AI Career Optimizer */}
            <div className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/30 via-zinc-900 to-zinc-900/90 p-5 backdrop-blur-xl hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-900/20 transition-all duration-300 flex flex-col justify-between">
              <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-amber-600/10 blur-xl pointer-events-none group-hover:scale-150 transition-transform" />
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Zap size={18} />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
                    AI Insight
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-3 group-hover:text-amber-300 transition-colors">
                  Autonomous Optimizer
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                  Adding 2 quantified metric bullets (%, $) to your experience raises interview call rates by +22%.
                </p>

                {/* Score Lift Badge */}
                <div className="mt-3 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-400">Predicted Lift</span>
                  <span className="text-amber-400 font-bold">+22% Yield</span>
                </div>
              </div>

              <Link
                to="/analyzer"
                className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-amber-400 hover:text-amber-300 font-semibold transition"
              >
                <span>Apply AI Improvements</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-400" />
                <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
                  Real-time Overview
                </h2>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">Live sync</span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <DashboardCard
                title="Total Portfolios"
                value={portfolios.length}
                icon={Briefcase}
                color="indigo"
                badge="WORKSPACE"
                detail={portfolios.length > 0 ? "Saved in database" : "No sites yet"}
                change={portfolios.length > 0 ? `${portfolios.length} created` : "Build one"}
                progress={Math.min(100, Math.max(10, portfolios.length * 20))}
              />

              <DashboardCard
                title="Live Deployments"
                value={publishedCount}
                icon={Globe}
                color="emerald"
                badge="EDGE CDN"
                detail="Global edge cache"
                change={publishedCount > 0 ? `${publishedCount} publicly live` : "Ready to publish"}
                progress={portfolios.length > 0 ? Math.round((publishedCount / portfolios.length) * 100) : 0}
              />

              <DashboardCard
                title="Active Templates"
                value="14 Themes"
                icon={Sparkles}
                color="purple"
                badge="COLLECTION"
                detail="Apple, Google, Cyberpunk & more"
                change="All 14 active"
                progress={100}
              />

              <DashboardCard
                title="ATS Health Score"
                value={atsScoreVal ? `${atsScoreVal}/100` : "Audit Ready"}
                icon={ShieldCheck}
                color="cyan"
                badge="NEMOTRON"
                detail={atsScoreVal ? (atsScoreVal >= 80 ? "Top 5% Candidate fit" : "Improvement items found") : "Analyze for score"}
                change={atsScoreVal ? `${atsScoreVal}% Optimal` : "Unscanned"}
                progress={atsScoreVal || 65}
              />
            </div>
          </div>

          {/* Intelligent Insights Banner */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                <Zap size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Pro Tip for Higher Response Rates</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">RECOMMENDED</span>
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Publish your portfolio with a custom slug and paste the public link directly into your resume header to get 3.2x more recruiter clicks.
                </p>
              </div>
            </div>

            <Link
              to="/portfolio"
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white text-xs font-semibold transition border border-zinc-700/60"
            >
              <span>Manage URLs</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Career Intelligence & Recruiter Radar Hub */}
          <CareerIntelligenceHub portfolios={portfolios} loading={loading} />

          {/* Dashboard Page Footer */}
          <footer className="pt-8 pb-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-600/30">
                P
              </div>
              <p className="text-zinc-400">© 2026 PortfolioAI Engine. Production Grade SaaS.</p>
            </div>

            <div className="flex items-center gap-6">
              <Link to="/portfolio" className="hover:text-indigo-400 transition">
                Portfolios
              </Link>
              <Link to="/portfolio-generator" className="hover:text-indigo-400 transition">
                AI Generator
              </Link>
              <Link to="/analyzer" className="hover:text-indigo-400 transition">
                ATS Analyzer
              </Link>
              <Link to="/settings" className="hover:text-indigo-400 transition">
                Settings
              </Link>
            </div>
          </footer>
        </main>
      </div>

      {/* Floating AI Chat Assistant Copilot */}
      <AIChatAssistant portfolios={portfolios} />
    </div>
  );
};

export default DashboardPage;
