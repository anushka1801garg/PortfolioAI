import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import {
  Sparkles,
  ArrowRight,
  Terminal,
  CheckCircle2,
  ExternalLink,
  Zap,
  Code2,
  FileCheck,
  ShieldCheck,
  Copy,
  Check,
  Globe,
} from "lucide-react";
import Container from "../../../../components/ui/Container/Container";
import Section from "../../../../components/ui/Section/Section";

const CTA = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [copied, setCopied] = useState(false);

  const userName = user?.fullName ? user.fullName.split(" ")[0] : "developer";
  const userSlug = user?.fullName
    ? user.fullName.toLowerCase().replace(/\s+/g, "-")
    : "anushka-garg";

  const handleCopyCommand = () => {
    navigator.clipboard.writeText("npx portfolioai-cli build");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Section className="relative overflow-hidden py-12 md:py-16 select-none">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0e0f1a] via-[#0b0c14] to-[#07080c] p-6 sm:p-10 lg:p-14 shadow-2xl shadow-black/80 hover:border-indigo-500/30 transition-all duration-500">
          {/* Ambient Lighting Orbs */}
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-[130px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-600/20 blur-[130px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-[600px] bg-cyan-500/10 blur-[150px] pointer-events-none" />

          {/* Cybernetic Subtle Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none opacity-40" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-12 lg:items-center">
            {/* LEFT COLUMN: The Relatable Pitch & Action */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold tracking-wide uppercase shadow-inner">
                <Sparkles size={13} className="text-indigo-400 animate-pulse" />
                <span>Zero Boilerplate • Instant Deployment</span>
              </div>

              {/* Main Headline */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
                Stop procrastinating. <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                  Launch your portfolio
                </span>{" "}
                tonight.
              </h2>

              {/* Relatable Subtitle */}
              <p className="text-sm sm:text-base text-zinc-300/90 leading-relaxed max-w-xl">
                Tired of spending entire weekends re-centering flexboxes and fighting CSS?
                Upload your resume, let PortfolioAI extract your projects & ATS keywords, and get a shareable live portfolio link before your next recruiter application.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                {isAuthenticated ? (
                  <Link
                    to="/portfolio-generator"
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all duration-200 cursor-pointer active:scale-95 group"
                  >
                    <Sparkles size={16} />
                    <span>Launch AI Builder ({userName})</span>
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all duration-200 cursor-pointer active:scale-95 group"
                  >
                    <Zap size={16} />
                    <span>Build Your Portfolio — Free</span>
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                )}

                <Link
                  to="/templates/preview"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white font-semibold text-sm transition-all duration-200 cursor-pointer"
                >
                  <Code2 size={16} className="text-zinc-400" />
                  <span>Preview 14 Templates</span>
                </Link>
              </div>

              {/* Trust Value Props */}
              <div className="pt-3 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>ATS Analyzer included</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Public shareable URL</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: 3D Parallax Tilt Floating Command Center */}
            <div className="lg:col-span-5 relative">
              {/* Top-Left Floating Badge Accent */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                animate={{ y: [0, -4, 0] }}
                transition={{
                  y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 0.5 },
                }}
                className="absolute -top-3 -left-3 sm:-left-6 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950/90 border border-indigo-500/30 backdrop-blur-xl shadow-lg shadow-black/80 text-[10px] font-mono text-indigo-300 pointer-events-none"
              >
                <Zap size={12} className="text-amber-400" />
                <span>Zero Boilerplate</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </motion.div>

              {/* Bottom-Right Floating Badge Accent */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                animate={{ y: [0, -5, 0] }}
                transition={{
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                  opacity: { duration: 0.5 },
                }}
                className="absolute -bottom-3 -right-3 sm:-right-6 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950/90 border border-emerald-500/30 backdrop-blur-xl shadow-lg shadow-black/80 text-[10px] font-mono text-emerald-300 pointer-events-none"
              >
                <Globe size={12} className="text-emerald-400" />
                <span>0.18s Edge Deployed</span>
              </motion.div>

              {/* 3D PARALLAX TILT CONTAINER (LIKE THE HERO CARD) */}
              <Tilt
                tiltMaxAngleX={6}
                tiltMaxAngleY={6}
                perspective={1000}
                scale={1.02}
                transitionSpeed={1000}
                glareEnable={true}
                glareMaxOpacity={0.07}
                glareColor="#818cf8"
                glarePosition="all"
                className="w-full"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative rounded-2xl border border-zinc-800 hover:border-indigo-500/50 bg-[#07080c]/90 backdrop-blur-2xl shadow-2xl shadow-black/90 overflow-hidden font-mono transition-colors duration-300"
                >
                  {/* Terminal Window Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-zinc-900/60">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                      <span className="text-[11px] text-zinc-400 ml-2 font-medium">
                        portfolioai-cli ~ zsh
                      </span>
                    </div>

                    <button
                      onClick={handleCopyCommand}
                      title="Copy command"
                      className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check size={11} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Terminal Body */}
                  <div className="p-4 sm:p-5 text-xs text-left space-y-3">
                    {/* Step 1: Input */}
                    <div className="space-y-1">
                      <p className="text-zinc-500 text-[11px]"># 1. Upload your resume or run via CLI</p>
                      <p className="text-zinc-200 flex items-center gap-2">
                        <span className="text-emerald-400">➜</span>
                        <span className="text-indigo-400">portfolio-ai</span>
                        <span>generate --resume</span>
                        <span className="text-amber-300">./resume.pdf</span>
                      </p>
                    </div>

                    {/* Step 2: Processing */}
                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3 space-y-2 text-[11px]">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span className="flex items-center gap-1.5 text-zinc-300">
                          <FileCheck size={13} className="text-cyan-400" />
                          <span>Extracting Skills & Experience</span>
                        </span>
                        <span className="text-emerald-400 font-bold">100% Done</span>
                      </div>

                      <div className="flex items-center justify-between text-zinc-400">
                        <span className="flex items-center gap-1.5 text-zinc-300">
                          <ShieldCheck size={13} className="text-emerald-400" />
                          <span>ATS Optimization Score</span>
                        </span>
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          96 / 100
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-zinc-400">
                        <span className="flex items-center gap-1.5 text-zinc-300">
                          <Code2 size={13} className="text-purple-400" />
                          <span>Applied Template</span>
                        </span>
                        <span className="text-purple-300 font-bold">Modern Glassmorphic</span>
                      </div>
                    </div>

                    {/* Step 3: Output Result */}
                    <div className="pt-1">
                      <p className="text-zinc-500 text-[11px]"># 2. Your live recruiter-ready URL</p>
                      <div className="mt-1.5 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                          <span className="text-indigo-300 font-mono text-[11px] truncate">
                            https://portfolioai.me/p/{userSlug}
                          </span>
                        </div>

                        <Link
                          to="/templates/preview"
                          className="shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1 rounded-md transition shadow"
                        >
                          <span>Live Demo</span>
                          <ExternalLink size={10} />
                        </Link>
                      </div>
                    </div>

                    {/* Live Status Bar */}
                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Edge CDN Deployed</span>
                      </span>
                      <span>Load time: 0.18s</span>
                    </div>
                  </div>
                </motion.div>
              </Tilt>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default CTA;
