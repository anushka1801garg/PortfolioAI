import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Activity, Zap, CheckCircle2, Bot } from "lucide-react";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const WelcomeBanner = ({ user }) => {
  const [greeting] = useState(getGreeting);

  const firstName = (user?.fullName || "Developer").split(" ")[0];
  const isPro = user?.plan && user.plan.toLowerCase() !== "free";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-500/25 bg-gradient-to-br from-indigo-950/70 via-zinc-900/90 to-purple-950/50 p-6 sm:p-8 lg:p-10 backdrop-blur-2xl shadow-2xl shadow-indigo-950/40">
      {/* Background Glows and Cyber Orbs */}
      <div className="absolute -right-16 -top-20 w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute -left-16 -bottom-20 w-80 h-80 rounded-full bg-purple-600/15 blur-3xl pointer-events-none"></div>
      
      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          {/* Status Badges Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>AI Engine Online</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles size={12} className="text-indigo-400" />
              <span>Studio 2.0</span>
            </div>

            {isPro ? (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide uppercase">
                <Zap size={12} className="text-amber-400 fill-amber-400" />
                <span>Pro Member</span>
              </div>
            ) : (
              <Link
                to="/#pricing"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/80 text-zinc-300 hover:text-white text-xs font-medium transition"
              >
                <span>Free Plan</span>
                <ArrowRight size={11} />
              </Link>
            )}
          </div>

          {/* Greeting & Headline */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {greeting},{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                {firstName}
              </span>{" "}
              ✨
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
              Your intelligent career hub is primed. Generate high-converting portfolios, score your resume against real ATS models, and stand out to top recruiters.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>Edge CDN Deployed</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-700 hidden sm:block"></div>
            <div className="flex items-center gap-1.5">
              <Activity size={14} className="text-indigo-400" />
              <span>Zero-Downtime Hosting</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-700 hidden sm:block"></div>
            <div className="flex items-center gap-1.5">
              <Bot size={14} className="text-purple-400" />
              <span>OpenAI / Nemotron ATS Guard</span>
            </div>
          </div>
        </div>

        {/* Action Showcase Card on Right */}
        <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
          <Link
            to="/portfolio-generator"
            className="group relative inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Sparkles size={16} className="text-indigo-200 group-hover:rotate-12 transition-transform" />
            <span>Generate Portfolio with AI</span>
            <ArrowRight size={14} className="text-indigo-200 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/analyzer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-700/80 bg-zinc-900/80 hover:bg-zinc-850 hover:border-zinc-600 px-6 py-3 text-sm font-semibold text-zinc-300 hover:text-white backdrop-blur transition-all duration-200"
          >
            <span>Run ATS Resume Audit</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
