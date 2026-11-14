import { motion } from "framer-motion";

const CosmicRing = () => {
  return (
    <div className="absolute inset-0 -m-16 sm:-m-24 lg:-m-32 pointer-events-none flex items-center justify-center z-0 overflow-visible select-none">
      {/* Deep space radial ambient nebula */}
      <div className="absolute w-[600px] h-[350px] sm:w-[750px] sm:h-[450px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-600/20 via-purple-900/15 to-transparent blur-3xl -z-10" />

      {/* Animated SVG Cosmic Rings */}
      <motion.svg
        className="w-full h-full max-w-[950px] max-h-[620px] overflow-visible"
        viewBox="0 0 950 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{
          opacity: 1,
          scale: [1, 1.018, 1],
        }}
        transition={{
          opacity: { duration: 1 },
          scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <defs>
          {/* Main Ring Gradient - Cyan to Violet to Pink */}
          <linearGradient id="cosmicNeonGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="55%" stopColor="#818cf8" stopOpacity="1" />
            <stop offset="80%" stopColor="#a855f7" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.85" />
          </linearGradient>

          {/* Secondary Track Gradient */}
          <linearGradient id="cosmicSecondaryGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.5" />
          </linearGradient>

          {/* Heavy Bloom Filter */}
          <filter id="cosmicHeavyBloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Crisp Glow Filter */}
          <filter id="cosmicGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Star Sparkle Glow */}
          <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. OUTER CELESTIAL ORBIT TRACK (Subtle dashed line) */}
        <ellipse
          cx="475"
          cy="300"
          rx="450"
          ry="195"
          transform="rotate(-20 475 300)"
          stroke="url(#cosmicSecondaryGrad)"
          strokeWidth="1.2"
          strokeDasharray="6 14"
          className="opacity-40"
        />

        {/* 2. MAIN GLOWING NEON RING - MULTI-LAYER BLOOM */}
        {/* Layer A: Ambient Wide Neon Halo */}
        <ellipse
          cx="475"
          cy="300"
          rx="400"
          ry="170"
          transform="rotate(-20 475 300)"
          stroke="url(#cosmicNeonGrad)"
          strokeWidth="22"
          filter="url(#cosmicHeavyBloom)"
          className="opacity-30"
        />

        {/* Layer B: Intense Mid Bloom */}
        <ellipse
          cx="475"
          cy="300"
          rx="400"
          ry="170"
          transform="rotate(-20 475 300)"
          stroke="url(#cosmicNeonGrad)"
          strokeWidth="8"
          filter="url(#cosmicGlow)"
          className="opacity-70"
        />

        {/* Layer C: Razor Core Luminous Ring */}
        <ellipse
          cx="475"
          cy="300"
          rx="400"
          ry="170"
          transform="rotate(-20 475 300)"
          stroke="url(#cosmicNeonGrad)"
          strokeWidth="2.5"
          className="opacity-95"
        />

        {/* 3. INNER ORBITAL ACCENT TRACK */}
        <ellipse
          cx="475"
          cy="300"
          rx="330"
          ry="140"
          transform="rotate(-20 475 300)"
          stroke="url(#cosmicNeonGrad)"
          strokeWidth="1"
          strokeDasharray="3 9"
          className="opacity-25"
        />

        {/* 4. GLOWING ENERGY NODES ON RING PATH */}
        {/* Top-Right Energy Node */}
        <circle
          cx="810"
          cy="180"
          r="4.5"
          fill="#38bdf8"
          filter="url(#starGlow)"
          className="animate-pulse"
        />
        <circle cx="810" cy="180" r="2" fill="#ffffff" />

        {/* Top-Left Energy Node */}
        <circle
          cx="170"
          cy="260"
          r="4"
          fill="#c084fc"
          filter="url(#starGlow)"
          className="animate-pulse"
        />
        <circle cx="170" cy="260" r="1.8" fill="#ffffff" />

        {/* Bottom-Right Energy Node */}
        <circle
          cx="790"
          cy="420"
          r="3.5"
          fill="#818cf8"
          filter="url(#starGlow)"
        />
        <circle cx="790" cy="420" r="1.5" fill="#ffffff" />

        {/* Bottom-Left Energy Node */}
        <circle
          cx="220"
          cy="390"
          r="4"
          fill="#38bdf8"
          filter="url(#starGlow)"
        />
        <circle cx="220" cy="390" r="1.8" fill="#ffffff" />

        {/* 5. TWINKLING 4-POINT CELESTIAL STARS */}
        {/* Star 1: Top-Right prominent star */}
        <g transform="translate(835, 155)">
          <path
            d="M 0 -10 Q 0 0 10 0 Q 0 0 0 10 Q 0 0 -10 0 Q 0 0 0 -10 Z"
            fill="#ffffff"
            filter="url(#starGlow)"
            className="animate-pulse"
          />
        </g>

        {/* Star 2: Top-Left soft star */}
        <g transform="translate(130, 230)">
          <path
            d="M 0 -7 Q 0 0 7 0 Q 0 0 0 7 Q 0 0 -7 0 Q 0 0 0 -7 Z"
            fill="#c084fc"
            filter="url(#starGlow)"
            className="opacity-80"
          />
        </g>

        {/* Star 3: Bottom-Left accent star */}
        <g transform="translate(260, 445)">
          <path
            d="M 0 -8 Q 0 0 8 0 Q 0 0 0 8 Q 0 0 -8 0 Q 0 0 0 -8 Z"
            fill="#38bdf8"
            filter="url(#starGlow)"
            className="animate-pulse"
          />
        </g>

        {/* Star 4: Top-Center distant sparkle */}
        <g transform="translate(560, 110)">
          <path
            d="M 0 -6 Q 0 0 6 0 Q 0 0 0 6 Q 0 0 -6 0 Q 0 0 0 -6 Z"
            fill="#ffffff"
            filter="url(#starGlow)"
            className="opacity-70"
          />
        </g>

        {/* Ambient Starlight Dots */}
        <circle cx="290" cy="180" r="1" fill="#ffffff" opacity="0.6" />
        <circle cx="710" cy="130" r="1.5" fill="#38bdf8" opacity="0.7" />
        <circle cx="850" cy="310" r="1" fill="#ffffff" opacity="0.5" />
        <circle cx="160" cy="370" r="1.2" fill="#c084fc" opacity="0.6" />
        <circle cx="680" cy="470" r="1.4" fill="#ffffff" opacity="0.8" />
        <circle cx="390" cy="480" r="1" fill="#38bdf8" opacity="0.5" />
      </motion.svg>
    </div>
  );
};

export default CosmicRing;
