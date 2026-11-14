import { useState, useEffect } from "react";
import { Star, Users, ShieldCheck, Zap } from "lucide-react";

const stats = [
  {
    icon: Users,
    number: "15.4k+",
    label: "Developers",
    detail: "At Google, Razorpay, Uber",
    color: "text-indigo-400",
    glow: "group-hover:border-indigo-500/40",
    live: true,
  },
  {
    icon: ShieldCheck,
    number: "98%",
    label: "ATS Pass Rate",
    detail: "Ranked Top 1% by recruiters",
    color: "text-emerald-400",
    glow: "group-hover:border-emerald-500/40",
  },
  {
    icon: Zap,
    number: "< 60s",
    label: "Time to Build",
    detail: "Zero manual HTML/CSS",
    color: "text-purple-400",
    glow: "group-hover:border-purple-500/40",
  },
  {
    icon: Star,
    number: "4.9 ★",
    label: "User Rating",
    detail: "From 12,000+ verified devs",
    color: "text-amber-400",
    glow: "group-hover:border-amber-500/40",
  },
];

const HeroStats = () => {
  const [liveCount, setLiveCount] = useState(15420);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveCount((prev) => prev + (Math.random() > 0.6 ? 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 border-t border-white/[0.08]">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={`p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] transition-all duration-300 text-left group cursor-pointer shadow-sm ${item.glow}`}
          >
            <div className="flex items-center justify-between mb-1">
              <Icon
                size={16}
                className={`${item.color} group-hover:scale-110 transition-transform`}
              />
              {item.live && (
                <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                  Live
                </span>
              )}
            </div>

            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {item.live ? `${(liveCount / 1000).toFixed(1)}k+` : item.number}
            </div>

            <p className="text-xs font-bold text-zinc-300 mt-0.5">{item.label}</p>
            <p className="text-[10px] text-zinc-500 truncate mt-0.5">{item.detail}</p>
          </div>
        );
      })}
    </div>
  );
};

export default HeroStats;
