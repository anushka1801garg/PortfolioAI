import { useState } from "react";

/**
 * CyberBotAvatar
 * An interactive, state-of-the-art holographic AI mascot symbol.
 * Features:
 * - Animated blinking cyber eyes
 * - Interactive hover expression change (happy eyes + energetic pulse)
 * - Holographic pulsing antenna with neon drop shadow
 * - Ambient gradient rim lighting
 */
const CyberBotAvatar = ({
  size = "md",
  interactive = true,
  isThinking = false,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Size mappings
  const dimensions = {
    xs: { px: 22, viewBox: 100 },
    sm: { px: 28, viewBox: 100 },
    md: { px: 40, viewBox: 100 },
    lg: { px: 56, viewBox: 100 },
    xl: { px: 76, viewBox: 100 },
  }[size] || { px: 40, viewBox: 100 };

  return (
    <div
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      className={`relative inline-flex items-center justify-center select-none transition-transform duration-300 ${
        interactive && isHovered ? "scale-110" : ""
      } ${className}`}
      style={{ width: dimensions.px, height: dimensions.px }}
    >
      {/* Outer ambient glow halo */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 blur-md pointer-events-none transition-opacity duration-300 ${
          isThinking
            ? "opacity-90 animate-pulse"
            : isHovered
            ? "opacity-80 scale-125"
            : "opacity-40"
        }`}
      />

      {/* SVG Mascot Graphic */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-lg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="chassisGrad" x1="10" y1="10" x2="90" y2="90">
            <stop offset="0%" stopColor="#2e1065" />
            <stop offset="50%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="visorGrad" x1="20" y1="35" x2="80" y2="75">
            <stop offset="0%" stopColor="#030712" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="neonCyan" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          <linearGradient id="neonPink" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Antenna Stem */}
        <line
          x1="50"
          y1="22"
          x2="50"
          y2="10"
          stroke="#818cf8"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Pulsing Antenna Orb */}
        <circle
          cx="50"
          cy="9"
          r={isHovered ? "6" : "5"}
          fill={isHovered ? "#38bdf8" : "#a855f7"}
          className="animate-antenna-pulse"
        />
        <circle cx="50" cy="9" r="2.5" fill="#ffffff" />

        {/* Ear Pods / Cyber Headsets */}
        <rect
          x="12"
          y="42"
          width="7"
          height="22"
          rx="3.5"
          fill="#4f46e5"
          stroke="#818cf8"
          strokeWidth="1.5"
        />
        <rect
          x="81"
          y="42"
          width="7"
          height="22"
          rx="3.5"
          fill="#4f46e5"
          stroke="#818cf8"
          strokeWidth="1.5"
        />

        {/* Head Chassis */}
        <rect
          x="16"
          y="22"
          width="68"
          height="62"
          rx="22"
          fill="url(#chassisGrad)"
          stroke={isHovered ? "#38bdf8" : "#6366f1"}
          strokeWidth="2.5"
          className="transition-colors duration-300"
        />

        {/* Metallic Top Sheen Reflection */}
        <path
          d="M 28 26 C 40 24, 60 24, 72 26"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Cyber Visor Screen */}
        <rect
          x="23"
          y="35"
          width="54"
          height="34"
          rx="12"
          fill="url(#visorGrad)"
          stroke={isHovered ? "#06b6d4" : "#4338ca"}
          strokeWidth="1.5"
        />

        {/* Eyes: Dynamic Expression Rendering */}
        {!isHovered && !isThinking && (
          // Default: Focused cyber eyes with periodic blink
          <g className="animate-eye-blink">
            {/* Left Eye */}
            <circle cx="39" cy="51" r="5" fill="#38bdf8" filter="url(#neonGlow)" />
            <circle cx="40.5" cy="49.5" r="1.8" fill="#ffffff" />

            {/* Right Eye */}
            <circle cx="61" cy="51" r="5" fill="#38bdf8" filter="url(#neonGlow)" />
            <circle cx="62.5" cy="49.5" r="1.8" fill="#ffffff" />
          </g>
        )}

        {isHovered && !isThinking && (
          // Hover state: Happy energetic curved cyber arcs ( ^ ^ )
          <g className="transition-all duration-200">
            <path
              d="M 33 53 Q 39 44 45 53"
              stroke="#38bdf8"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              filter="url(#neonGlow)"
            />
            <path
              d="M 55 53 Q 61 44 67 53"
              stroke="#38bdf8"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              filter="url(#neonGlow)"
            />
          </g>
        )}

        {isThinking && (
          // Thinking state: Concentric sonic radar ripples
          <g>
            <circle
              cx="39"
              cy="51"
              r="4.5"
              fill="#ec4899"
              className="animate-ping"
            />
            <circle
              cx="61"
              cy="51"
              r="4.5"
              fill="#ec4899"
              className="animate-ping"
            />
          </g>
        )}

        {/* Sub-visor Audio/Status Equalizer Bars */}
        <g opacity={isHovered || isThinking ? "0.9" : "0.5"}>
          <rect
            x="41"
            y="61"
            width="3"
            height={isHovered ? "4" : "2"}
            rx="1"
            fill="#38bdf8"
          />
          <rect
            x="46"
            y="60"
            width="3"
            height={isHovered ? "5" : "3"}
            rx="1"
            fill="#818cf8"
          />
          <rect
            x="51"
            y="59"
            width="3"
            height={isHovered ? "6" : "4"}
            rx="1"
            fill="#c084fc"
          />
          <rect
            x="56"
            y="61"
            width="3"
            height={isHovered ? "4" : "2"}
            rx="1"
            fill="#38bdf8"
          />
        </g>

        {/* Cute Cyber Cheek Dots */}
        {isHovered && (
          <>
            <circle cx="28" cy="56" r="2.2" fill="#ec4899" opacity="0.8" />
            <circle cx="72" cy="56" r="2.2" fill="#ec4899" opacity="0.8" />
          </>
        )}
      </svg>
    </div>
  );
};

export default CyberBotAvatar;
