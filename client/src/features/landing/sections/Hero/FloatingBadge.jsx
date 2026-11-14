import { motion } from "framer-motion";

const FloatingBadge = ({
  icon,
  text,
  subtext,
  className = "",
  delay = 0,
  onClick,
  active = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -5, 0],
      }}
      transition={{
        y: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay * 1.5,
        },
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.5, delay },
      }}
      whileHover={{ scale: 1.06, y: -4 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`absolute z-30 whitespace-nowrap rounded-2xl border border-white/15 bg-zinc-950/90 backdrop-blur-2xl p-2.5 sm:p-3 text-xs font-semibold text-white shadow-xl shadow-black/80 flex items-center gap-2.5 transition cursor-pointer select-none group ${
        active ? "ring-2 ring-indigo-500/80 border-indigo-400/50" : "hover:border-white/30"
      } ${className}`}
    >
      {icon && (
        <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      )}
      <div className="text-left leading-tight">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-bold text-white tracking-tight">{text}</p>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-80 animate-pulse" />
        </div>
        {subtext && <p className="text-[10px] text-zinc-400 font-normal mt-0.5">{subtext}</p>}
      </div>
    </motion.div>
  );
};

export default FloatingBadge;
