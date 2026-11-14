import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, CheckCircle2, TrendingUp, Sparkles, Building2 } from "lucide-react";

const TestimonialCard = ({
  name,
  role,
  company,
  avatar,
  review,
  metric,
  rating = 5,
  tags = [],
  verified = true,
}) => {
  const [imgError, setImgError] = useState(false);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="h-full"
    >
      <div className="group relative flex flex-col justify-between h-full rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/80 via-zinc-900/40 to-zinc-950/90 p-6 sm:p-7 backdrop-blur-xl shadow-xl shadow-black/40 transition-all duration-300 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden">
        {/* Subtle Ambient Glow on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.04] via-transparent to-purple-500/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Decorative Quote Mark Watermark */}
        <div className="absolute top-4 right-4 text-zinc-800/40 group-hover:text-indigo-500/15 transition-colors duration-300 pointer-events-none">
          <Quote size={52} strokeWidth={1.2} />
        </div>

        <div>
          {/* Top Row: Metric Highlight Badge & Star Rating */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 relative z-10">
            {metric ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold shadow-sm">
                <Sparkles size={11} className="text-indigo-400 shrink-0" />
                <span>{metric}</span>
              </div>
            ) : <div />}

            {/* Stars */}
            <div className="flex items-center gap-1">
              {[...Array(rating)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className="fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]"
                />
              ))}
            </div>
          </div>

          {/* Testimonial Quote */}
          <p className="text-zinc-300 text-sm sm:text-[15px] leading-relaxed relative z-10 font-normal">
            "{review}"
          </p>

          {/* Skill / Feature Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-zinc-800/60">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-medium text-zinc-400 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded-md group-hover:text-indigo-300 group-hover:border-indigo-500/20 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div className="w-11 h-11 rounded-full ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/60 transition-all overflow-hidden shrink-0 bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {!imgError && avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {/* Name & Role */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-white tracking-tight truncate">
                  {name}
                </h4>
                {verified && (
                  <span title="Verified Developer" className="inline-flex">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 truncate">
                {role}
              </p>
            </div>
          </div>

          {/* Company Badge */}
          {company && (
            <div className="shrink-0 hidden xs:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-zinc-300 group-hover:border-indigo-500/30 transition">
              <Building2 size={11} className="text-indigo-400" />
              <span>{company}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
