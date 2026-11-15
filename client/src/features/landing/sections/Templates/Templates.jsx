import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Layout,
  Monitor,
  Palette,
  Smartphone,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

import Container from "../../../../components/ui/Container/Container";
import Section from "../../../../components/ui/Section/Section";
import Heading from "../../../../components/ui/Heading/Heading";

const templates = [
  {
    id: "minimal",
    icon: <Layout size={20} />,
    title: "Minimal Swiss",
    badge: "Clean & Monospace",
    badgeColor: "bg-white/10 text-white border-white/20",
    desc: "Apple-inspired clean dark aesthetic. Focused entirely on clean typography, architecture code, and project achievements.",
    stats: "8.4k+ Devs",
    accent: "group-hover:border-zinc-500/80 group-hover:shadow-white/5",
    previewBg: "from-zinc-950 via-zinc-900 to-zinc-950",
    renderPreview: () => (
      <div className="w-full h-32 rounded-xl bg-zinc-950 border border-white/10 p-2.5 flex flex-col justify-between overflow-hidden font-mono text-[9px] text-zinc-400">
        <div className="flex items-center justify-between border-b border-white/5 pb-1">
          <span className="text-white font-bold tracking-wider">ANUSHKA.DEV</span>
          <span className="text-[8px] text-emerald-400">● AVAILABLE</span>
        </div>
        <div className="space-y-1 my-auto">
          <div className="h-2 w-3/4 bg-white/20 rounded" />
          <div className="h-1.5 w-1/2 bg-white/10 rounded" />
          <div className="flex gap-1 pt-1">
            <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300">React</span>
            <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300">Go</span>
            <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300">Docker</span>
          </div>
        </div>
        <div className="flex justify-between text-[8px] text-zinc-600 border-t border-white/5 pt-1">
          <span>0.08s LATENCY</span>
          <span>ATS: 99%</span>
        </div>
      </div>
    ),
  },
  {
    id: "creative",
    icon: <Palette size={20} />,
    title: "Creative Cyber",
    badge: "Neon & Glass",
    badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    desc: "Cyberpunk neon gradients with glassmorphic cards and interactive glow. Ideal for full-stack developers and UI engineers.",
    stats: "6.2k+ Devs",
    accent: "group-hover:border-emerald-500/60 group-hover:shadow-emerald-500/15",
    previewBg: "from-emerald-950/40 via-zinc-950 to-slate-950",
    renderPreview: () => (
      <div className="w-full h-32 rounded-xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-black border border-emerald-500/30 p-2.5 flex flex-col justify-between overflow-hidden text-[9px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-md bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 text-[8px] font-bold">
              AI
            </div>
            <span className="font-bold text-white">CyberCore</span>
          </div>
          <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            v2.4 Live
          </span>
        </div>
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
          <div className="text-[10px] font-bold text-emerald-300 truncate">OmniChain Agent</div>
          <div className="text-[8px] text-zinc-400 line-clamp-1 mt-0.5">1.2M automated transactions</div>
        </div>
        <div className="flex items-center justify-between text-[8px] text-emerald-400/80">
          <span>★ 518 Stars</span>
          <span>Matrix Glow</span>
        </div>
      </div>
    ),
  },
  {
    id: "professional",
    icon: <Monitor size={20} />,
    title: "Executive Pro",
    badge: "ATS Gold Standard",
    badgeColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
    desc: "Recruiter-optimized corporate layout. Features a chronological timeline, verified skill badges, and ATS score metrics.",
    stats: "Top Recruiter Pick",
    accent: "group-hover:border-indigo-500/60 group-hover:shadow-indigo-500/15",
    previewBg: "from-indigo-950/40 via-zinc-950 to-purple-950/40",
    renderPreview: () => (
      <div className="w-full h-32 rounded-xl bg-zinc-950 border border-indigo-500/30 p-2.5 flex flex-col justify-between overflow-hidden text-[9px]">
        <div className="flex items-center justify-between pb-1 border-b border-white/5">
          <div className="flex items-center gap-1">
            <span className="font-bold text-white text-[10px]">Staff Engineer</span>
            <CheckCircle2 size={10} className="text-indigo-400" />
          </div>
          <span className="text-[8px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-bold">
            98/100 ATS
          </span>
        </div>
        <div className="space-y-1 my-auto text-[8px]">
          <div className="flex items-center justify-between text-zinc-300">
            <span>● Lead Engineer @ Apex Labs</span>
            <span className="text-zinc-500">2023 - Pres</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span>○ Senior Full Stack @ TechCorp</span>
            <span className="text-zinc-500">2021 - 2023</span>
          </div>
        </div>
        <div className="flex justify-between text-[8px] text-indigo-300 border-t border-white/5 pt-1">
          <span>Verified Experience</span>
          <span>FAANG Ready</span>
        </div>
      </div>
    ),
  },
  {
    id: "responsive",
    icon: <Smartphone size={20} />,
    title: "Adaptive Responsive",
    badge: "Dual Device Sync",
    badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    desc: "Designed to render flawlessly on iPhones, iPads, and ultra-wide desktop monitors without horizontal scrolling.",
    stats: "100% Mobile Ready",
    accent: "group-hover:border-cyan-500/60 group-hover:shadow-cyan-500/15",
    previewBg: "from-cyan-950/40 via-zinc-950 to-blue-950/40",
    renderPreview: () => (
      <div className="w-full h-32 rounded-xl bg-zinc-950 border border-cyan-500/30 p-2 flex items-center justify-around overflow-hidden">
        {/* Desktop Mini Mockup */}
        <div className="w-24 h-20 rounded-lg bg-black/60 border border-white/10 p-1.5 flex flex-col justify-between text-[7px] text-zinc-400">
          <div className="flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-rose-500" />
            <span className="w-1 h-1 rounded-full bg-amber-500" />
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
          </div>
          <div className="h-2 w-3/4 bg-cyan-400/30 rounded" />
          <div className="h-1.5 w-1/2 bg-white/10 rounded" />
          <span className="text-[6px] text-cyan-300">Desktop View</span>
        </div>

        {/* Mobile Mini Mockup */}
        <div className="w-10 h-24 rounded-lg bg-black/80 border-2 border-cyan-500/50 p-1 flex flex-col justify-between text-[6px] text-zinc-400 shadow-lg">
          <div className="w-3 h-0.5 bg-zinc-600 rounded-full mx-auto" />
          <div className="h-1.5 w-full bg-cyan-400/30 rounded my-auto" />
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 mx-auto" />
        </div>
      </div>
    ),
  },
];

const Templates = () => {
  return (
    <Section className="bg-[#09090B] relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-indigo-600/10 blur-[160px] pointer-events-none" />

      <Container>
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
            <Sparkles size={13} className="text-indigo-400" />
            <span>AI Template Studio</span>
          </div>

          <Heading
            title="Production-Ready Portfolio Templates"
            subtitle="Choose from professionally crafted, recruiter-optimized templates with instant live previews."
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-10 md:mt-12">
          {templates.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="flex"
            >
              <div
                className={`w-full rounded-3xl border border-white/10 bg-zinc-900/40 hover:bg-zinc-900/70 p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between group shadow-xl shadow-black/20 ${item.accent}`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  {/* Visual Live Interactive Mockup Frame */}
                  <div className="mb-4 rounded-2xl overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
                    {item.renderPreview()}
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition duration-200">
                      {item.title}
                    </h3>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {item.stats}
                    </span>
                  </div>

                  <p className="text-zinc-400 mt-2 text-xs leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-white/5">
                  <Link
                    to={`/templates/preview/${item.id}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-indigo-600 hover:text-white border border-white/10 text-xs font-bold text-zinc-200 transition-all duration-200 cursor-pointer shadow-sm group-hover:border-indigo-500 active:scale-95"
                  >
                    <span>Launch Live Preview</span>
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default Templates;
