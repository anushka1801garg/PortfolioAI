import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Sparkles,
  LayoutDashboard,
  Brain,
  Rocket,
  Library,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RotateCw,
} from "lucide-react";
import Container from "../../../../components/ui/Container/Container";
import Section from "../../../../components/ui/Section/Section";
import Heading from "../../../../components/ui/Heading/Heading";

const categories = [
  { id: "all", label: "All Features" },
  { id: "ai", label: "AI Generation" },
  { id: "ats", label: "ATS & Recruiter Scoring" },
  { id: "cloud", label: "Edge Hosting & CDN" },
];

const Features = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [activeCategory, setActiveCategory] = useState("all");
  const [atsSimScore, setAtsSimScore] = useState(98);
  const [isSimulatingAts, setIsSimulatingAts] = useState(false);
  const [templatePreviewTab, setTemplatePreviewTab] = useState("creative");
  const [activeSuggestion, setActiveSuggestion] = useState("after");

  const handleFeatureClick = (feature) => {
    if (feature.isPublic || isAuthenticated) {
      navigate(feature.path);
    } else {
      navigate("/login", {
        state: {
          from: feature.path,
          message: `Please sign in to access ${feature.title}`,
        },
      });
    }
  };

  const runAtsSimulation = (e) => {
    e.stopPropagation();
    setIsSimulatingAts(true);
    setAtsSimScore(64);
    setTimeout(() => {
      setAtsSimScore(98);
      setIsSimulatingAts(false);
    }, 900);
  };

  const featureCards = [
    {
      id: "generator",
      category: "ai",
      icon: <Sparkles size={24} />,
      title: "AI Portfolio Generator",
      badge: "Real-time AI",
      badgeColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
      description:
        "Upload any resume PDF and let our deep AI extract your projects, skills, and metrics into a live site.",
      path: "/portfolio-generator",
      cta: "Launch Generator",
      isPublic: false,
      renderLiveWidget: () => (
        <div className="mt-4 p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-zinc-300 space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Parser: 4 Projects & 18 Skills Extracted</span>
          </div>
          <div className="text-[10px] text-zinc-400 truncate">
            &gt; Model: GPT-4o Resume-to-JSX Pipeline
          </div>
          <div className="flex items-center justify-between text-[10px] text-indigo-300 pt-1 border-t border-white/5">
            <span>Compilation: 1.4s</span>
            <span className="text-emerald-400">Status: 200 OK</span>
          </div>
        </div>
      ),
    },
    {
      id: "analyzer",
      category: "ats",
      icon: <ShieldCheck size={24} />,
      title: "ATS Deep Analyzer",
      badge: "Top 1% Benchmark",
      badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      description:
        "Benchmarked against 50,000+ FAANG and startup job descriptions to guarantee you pass automated filters.",
      path: "/analyzer",
      cta: "Analyze Resume",
      isPublic: false,
      renderLiveWidget: () => (
        <div className="mt-4 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-[11px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 font-semibold">Live ATS Match Score:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-emerald-400 font-mono">{atsSimScore}/100</span>
              <button
                onClick={runAtsSimulation}
                title="Run live recalculation"
                className="p-1 rounded bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <RotateCw size={11} className={isSimulatingAts ? "animate-spin text-emerald-400" : ""} />
              </button>
            </div>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${atsSimScore}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
            />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-400">
            <span>Keywords: 99%</span>
            <span>Readability: 100%</span>
            <span className="text-emerald-400">Tier-1 Ready</span>
          </div>
        </div>
      ),
    },
    {
      id: "templates",
      category: "cloud",
      icon: <LayoutDashboard size={24} />,
      title: "Interactive Templates",
      badge: "14 Themes Live",
      badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/20",
      description:
        "Switch seamlessly between 14 signature themes including Apple, Cyberpunk, Google, Developer, and Minimal.",
      path: "/templates/preview/minimal",
      cta: "Explore 14 Templates",
      isPublic: true,
      renderLiveWidget: () => (
        <div className="mt-4 p-2.5 rounded-xl bg-black/60 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-zinc-400">Template Switcher:</span>
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              {["minimal", "creative", "pro"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplatePreviewTab(t)}
                  className={`px-2 py-0.5 rounded capitalize font-mono text-[9px] transition cursor-pointer ${
                    templatePreviewTab === t
                      ? "bg-indigo-600 text-white font-bold"
                      : "bg-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-zinc-900/90 border border-white/5 text-[10px] text-zinc-300 flex items-center justify-between">
            <span className="truncate">
              Active: {templatePreviewTab === "minimal" ? "Swiss Minimal (Dark)" : templatePreviewTab === "creative" ? "Cyberpunk Neon Glow" : "Executive ATS Standard"}
            </span>
            <span className="text-indigo-400 shrink-0 ml-1">Live Preview ↗</span>
          </div>
        </div>
      ),
    },
    {
      id: "suggestions",
      category: "ai",
      icon: <Brain size={24} />,
      title: "AI Bullet Optimization",
      badge: "Smart Suggestions",
      badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      description:
        "Transforms passive resume bullet points into impact-quantified engineering achievements.",
      path: "/analyzer",
      cta: "Get AI Advice",
      isPublic: false,
      renderLiveWidget: () => (
        <div className="mt-4 p-3 rounded-xl bg-black/60 border border-white/10 space-y-2 text-[11px]">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-zinc-400">Compare Optimization:</span>
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setActiveSuggestion("before")}
                className={`px-1.5 py-0.5 rounded text-[9px] cursor-pointer ${
                  activeSuggestion === "before" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "text-zinc-500"
                }`}
              >
                Before
              </button>
              <button
                onClick={() => setActiveSuggestion("after")}
                className={`px-1.5 py-0.5 rounded text-[9px] cursor-pointer ${
                  activeSuggestion === "after" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold" : "text-zinc-500"
                }`}
              >
                AI Enhanced
              </button>
            </div>
          </div>
          <p className="text-[10px] text-zinc-300 leading-relaxed font-mono">
            {activeSuggestion === "before"
              ? "❌ 'Worked on the backend APIs and helped speed up the database queries.'"
              : "✅ 'Architected Redis caching layer, cutting P99 latency by 46% across 1.2M transactions.'"}
          </p>
        </div>
      ),
    },
    {
      id: "publish",
      category: "cloud",
      icon: <Rocket size={24} />,
      title: "One-Click Edge Deploy",
      badge: "Public /p/:slug",
      badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
      description:
        "Deploy to a blazing-fast global CDN with automated SSL, custom subdomains, and instant live sharing.",
      path: "/portfolio",
      cta: "Publish & Share",
      isPublic: false,
      renderLiveWidget: () => (
        <div className="mt-4 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 font-mono text-[10px]">portfolioai.me/p/anushka</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold font-mono">
              0.12s
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 size={11} /> 100% Uptime SLA
            </span>
            <span>•</span>
            <span>SSL 256-bit</span>
          </div>
        </div>
      ),
    },
    {
      id: "archive",
      category: "cloud",
      icon: <Library size={24} />,
      title: "Version History & Archive",
      badge: "Version Archive",
      badgeColor: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
      description:
        "Tailor different portfolio versions for different job roles (e.g. AI Engineer vs Full Stack Lead).",
      path: "/portfolio",
      cta: "Manage Portfolios",
      isPublic: false,
      renderLiveWidget: () => (
        <div className="mt-4 p-3 rounded-xl bg-black/60 border border-white/10 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-zinc-300 font-semibold">Active Portfolios:</span>
            <span className="text-indigo-400 font-mono">3 Saved</span>
          </div>
          <div className="flex flex-col gap-1 text-[10px] font-mono">
            <div className="flex justify-between text-emerald-400 bg-white/[0.02] px-2 py-1 rounded border border-white/5">
              <span>● FullStack_v2.4 (Live)</span>
              <span>1.4k views</span>
            </div>
            <div className="flex justify-between text-zinc-400 bg-white/[0.02] px-2 py-1 rounded border border-white/5">
              <span>○ AI_ML_Specialist (Draft)</span>
              <span>v1.8</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const filteredFeatures =
    activeCategory === "all"
      ? featureCards
      : featureCards.filter((f) => f.category === activeCategory);

  return (
    <Section className="bg-[#09090B] relative overflow-hidden">
      {/* Background Ambient Blur */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <Container>
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider mb-3 shadow-sm">
            <Sparkles size={12} className="text-indigo-400" />
            <span>Interactive Engineering Suite</span>
          </div>

          <Heading
            title="Everything You Need to Land Dream Roles"
            subtitle="Build, analyze, optimize and deploy your developer portfolio with the power of Artificial Intelligence."
          />

          {/* Interactive Feature Category Tabs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/50 scale-105"
                    : "bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 sm:gap-8 mt-10 md:mt-12">
          {filteredFeatures.map((feature) => (
            <div
              key={feature.id}
              onClick={() => handleFeatureClick(feature)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleFeatureClick(feature);
                }
              }}
              className="group cursor-pointer rounded-3xl border border-white/10 bg-zinc-900/40 hover:bg-zinc-900/80 p-6 sm:p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-500/60 hover:shadow-2xl hover:shadow-indigo-500/15 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300 shadow-md">
                    {feature.icon}
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border transition ${feature.badgeColor}`}
                  >
                    {feature.badge}
                  </span>
                </div>

                <h3 className="mt-5 text-lg sm:text-xl font-bold text-white group-hover:text-indigo-300 transition duration-200">
                  {feature.title}
                </h3>

                <p className="mt-2 text-zinc-400 leading-relaxed text-xs sm:text-sm">
                  {feature.description}
                </p>

                {/* Embedded Live Interactive Widget */}
                {feature.renderLiveWidget && feature.renderLiveWidget()}
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition">
                <span>{feature.cta}</span>
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:translate-x-1 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200">
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default Features;
