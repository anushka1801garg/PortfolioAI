import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, CheckCircle2, Building2 } from "lucide-react";
import Container from "../../../../components/ui/Container/Container";

const companies = [
  { name: "Google", hires: "340+ hires", role: "Frontend & Cloud" },
  { name: "Microsoft", hires: "280+ hires", role: "Full Stack & AI" },
  { name: "Razorpay", hires: "190+ hires", role: "Backend & Systems" },
  { name: "Amazon", hires: "260+ hires", role: "Distributed Eng" },
  { name: "Uber", hires: "140+ hires", role: "Mobile & Infra" },
  { name: "Stripe", hires: "110+ hires", role: "Core API Eng" },
  { name: "Postman", hires: "95+ hires", role: "DevRel & API" },
  { name: "Atlassian", hires: "130+ hires", role: "Full Stack" },
  { name: "Swiggy", hires: "175+ hires", role: "Backend Eng" },
  { name: "Meta", hires: "210+ hires", role: "Product & AI" },
];

const TrustedCompanies = () => {
  const [hoveredCompany, setHoveredCompany] = useState(null);

  // Duplicate list for infinite seamless marquee loop
  const marqueeItems = [...companies, ...companies];

  return (
    <section className="py-8 sm:py-10 border-y border-white/[0.08] bg-[#0A0A0E] overflow-hidden relative select-none">
      {/* Subtle ambient lateral gradient masks for smooth fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#0A0A0E] to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#0A0A0E] to-transparent z-20 pointer-events-none" />

      <Container>
        {/* Live Status Pulse Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
              Live Hiring Pulse
            </span>
            <span className="text-xs text-zinc-500 hidden sm:inline">•</span>
            <span className="text-xs text-zinc-400 hidden sm:inline">
              18 developers secured interview callbacks today
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <span className="font-medium text-zinc-300">Top Tech Companies Hiring PortfolioAI Users</span>
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 font-mono text-[10px]">
              15k+ Hired
            </span>
          </div>
        </div>
      </Container>

      {/* Infinite Smooth Auto-Scrolling Marquee */}
      <div className="flex overflow-hidden group">
        <div className="flex shrink-0 items-center gap-6 sm:gap-8 animate-marquee group-hover:[animation-play-state:paused]">
          {marqueeItems.map((company, idx) => (
            <div
              key={`${company.name}-${idx}`}
              onMouseEnter={() => setHoveredCompany(company.name)}
              onMouseLeave={() => setHoveredCompany(null)}
              className="relative flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.06] hover:border-indigo-500/40 transition-all duration-300 cursor-pointer shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 font-black text-xs">
                {company.name[0]}
              </div>

              <div className="text-left">
                <span className="text-sm sm:text-base font-bold text-zinc-200 group-hover:text-white tracking-tight">
                  {company.name}
                </span>
                <span className="block text-[10px] font-mono text-emerald-400/90 font-medium">
                  {company.hires}
                </span>
              </div>

              {hoveredCompany === company.name && (
                <span className="hidden sm:inline-block ml-1 text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md font-sans">
                  {company.role}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedCompanies;
