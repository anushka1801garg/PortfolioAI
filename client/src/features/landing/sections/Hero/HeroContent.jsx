import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Sparkles,
  ArrowRight,
  Code2,
  CheckCircle2,
  Zap,
  TrendingUp,
  FileText,
} from "lucide-react";
import HeroStats from "./HeroStats";

const HeroContent = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const userName = user?.fullName ? user.fullName.split(" ")[0] : null;

  return (
    <div className="max-w-2xl text-left">
      {/* Eyebrow badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-cyan-500/15 px-3.5 py-1.5 text-xs font-mono font-bold text-indigo-300 shadow-inner">
        <Sparkles size={13} className="text-indigo-400 animate-pulse" />
        <span>AI-POWERED DEVELOPER PORTFOLIO SUITE</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
      </div>

      {/* Main Headline */}
      <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.12] text-white tracking-tight">
        Turn Your Resume Into A{" "}
        <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
          Recruiter-Ready Portfolio
        </span>{" "}
        In 60 Seconds.
      </h1>

      {/* Meaningful Subtitle */}
      <p className="mt-5 text-base sm:text-lg leading-relaxed text-zinc-300/90 font-normal">
        Stop losing dream interview callbacks to generic PDF resumes. Upload your resume, let AI extract your projects & calculate your ATS score, and publish a stunning developer portfolio with live links.
      </p>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap items-center gap-3.5">
        {isAuthenticated ? (
          <Link
            to="/portfolio-generator"
            className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 px-7 py-3.5 font-bold text-sm text-white shadow-xl shadow-indigo-600/30 transition-all duration-200 cursor-pointer active:scale-95 group"
          >
            <Sparkles size={16} />
            <span>Generate Portfolio ({userName || "AI"})</span>
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        ) : (
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 px-7 py-3.5 font-bold text-sm text-white shadow-xl shadow-indigo-600/30 transition-all duration-200 cursor-pointer active:scale-95 group"
          >
            <Zap size={16} />
            <span>Generate Your Portfolio — Free</span>
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        )}

        <Link
          to="/templates/preview"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/25 px-5 py-3.5 font-semibold text-sm text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer"
        >
          <Code2 size={16} className="text-zinc-400" />
          <span>Explore 14 Live Templates</span>
        </Link>
      </div>

      {/* Micro Value Props */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-400">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
          <span>No credit card required</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
          <span>Instant ATS Score 90+</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
          <span>Live shareable URL</span>
        </div>
      </div>

      {/* Hero Stats */}
      <HeroStats />
    </div>
  );
};

export default HeroContent;
