import { motion } from "framer-motion";

const metrics = [
  { label: "ATS Score", value: "98%", score: 98 },
  { label: "SEO", value: "94%", score: 94 },
  { label: "Accessibility", value: "92%", score: 92 },
  { label: "Performance", value: "95%", score: 95 },
];

const PortfolioScoreCard = ({ className = "" }) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const scorePercent = 96;
  const strokeOffset = circumference - (circumference * scorePercent) / 100;

  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-3.5 sm:p-4 backdrop-blur-xl relative overflow-hidden transition-all duration-300 hover:border-white/15 ${className}`}
    >
      {/* Subtle interior glow */}
      <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center relative z-10">
        {/* Left: Circular Score Gauge */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-[11px] font-semibold text-zinc-300 tracking-wide mb-2">
            Portfolio Score
          </span>

          <div className="relative w-24 h-24 sm:w-26 sm:h-26 flex items-center justify-center">
            <svg
              className="w-full h-full -rotate-90 transform overflow-visible"
              viewBox="0 0 100 100"
            >
              <defs>
                <linearGradient id="scoreRingGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>

                <filter id="ringGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-zinc-800/80"
                strokeWidth="7"
                stroke="currentColor"
                fill="transparent"
              />

              {/* Glowing Animated Progress Ring */}
              <motion.circle
                cx="50"
                cy="50"
                r={radius}
                stroke="url(#scoreRingGrad)"
                strokeWidth="7.5"
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: strokeOffset }}
                transition={{ duration: 1.4, ease: "easeOut" }}
                filter="url(#ringGlow)"
              />
            </svg>

            {/* Center Percentage Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-2xl sm:text-3xl font-black text-white tracking-tight"
              >
                96%
              </motion.span>
            </div>
          </div>
        </div>

        {/* Right: Metrics Breakdown List */}
        <div className="sm:col-span-7 flex flex-col justify-center space-y-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          {metrics.map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx, duration: 0.3 }}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] shrink-0" />
                <span className="text-zinc-300 font-medium">{item.label}</span>
              </div>
              <span className="font-bold text-white font-mono">{item.value}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioScoreCard;
