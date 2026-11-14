import { motion } from "framer-motion";

const DashboardCard = ({
  title,
  value,
  icon: Icon,
  change,
  detail,
  badge,
  color = "indigo",
  progress,
}) => {
  const colorSchemes = {
    indigo: {
      border: "hover:border-indigo-500/50",
      iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white",
      glow: "from-indigo-600/15 to-transparent",
      badge: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
      progress: "from-indigo-500 to-purple-500",
    },
    emerald: {
      border: "hover:border-emerald-500/50",
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white",
      glow: "from-emerald-600/15 to-transparent",
      badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      progress: "from-emerald-500 to-teal-400",
    },
    purple: {
      border: "hover:border-purple-500/50",
      iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white",
      glow: "from-purple-600/15 to-transparent",
      badge: "bg-purple-500/10 text-purple-300 border-purple-500/20",
      progress: "from-purple-500 to-indigo-500",
    },
    cyan: {
      border: "hover:border-cyan-500/50",
      iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 group-hover:bg-cyan-600 group-hover:text-white",
      glow: "from-cyan-600/15 to-transparent",
      badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
      progress: "from-cyan-500 to-blue-500",
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.indigo;

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-900/60 p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 group shadow-lg shadow-black/30 ${scheme.border} flex flex-col justify-between`}
    >
      {/* Subtle Radial Glow in corner */}
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${scheme.glow} blur-2xl pointer-events-none transition-opacity duration-300 opacity-60 group-hover:opacity-100`}
      />

      <div>
        <div className="flex items-center justify-between gap-2">
          {Icon && (
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300 shadow-sm shrink-0 ${scheme.iconBg}`}
            >
              <Icon size={18} />
            </div>
          )}

          {badge && (
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${scheme.badge}`}
            >
              {badge}
            </span>
          )}
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">
            {title}
          </p>

          <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
            {value}
          </h3>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-1.5 text-left">
        {progress !== undefined && (
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full bg-gradient-to-r ${scheme.progress}`}
            />
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-zinc-400">
          {detail && <span className="truncate">{detail}</span>}
          {change && (
            <span className="text-[11px] font-mono text-emerald-400 font-bold shrink-0 ml-1">
              {change}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardCard;
