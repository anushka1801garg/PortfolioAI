import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { ExternalLink, X, Copy, Sparkles, FileText, Award, Download, MapPin, Building2, DollarSign } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import toast from "react-hot-toast";

// =========================================================================
// 1. SpotlightCard: Linear/Vercel-style cursor-tracking radial highlight
// =========================================================================
export const SpotlightCard = ({
  children,
  className = "",
  spotlightColor = "rgba(99, 102, 241, 0.18)",
  borderColor = "rgba(99, 102, 241, 0.4)",
  onClick,
  ...props
}) => {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: -500, y: -500 });
      }}
      onClick={onClick}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`relative overflow-hidden rounded-3xl border border-zinc-800/90 bg-zinc-900/60 backdrop-blur-xl transition-colors duration-300 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Radial Overlay */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-300 z-10"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      {/* Dynamic Border Shimmer on Hover */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-300 z-20"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, ${borderColor}, transparent 70%)`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1.2px",
        }}
      />
      <div className="relative z-30 h-full">{children}</div>
    </motion.div>
  );
};

// =========================================================================
// 2. TiltCard: 3D perspective magnetic tilt reacting to mouse position
// =========================================================================
export const TiltCard = ({
  children,
  className = "",
  maxTilt = 10,
  onClick,
  ...props
}) => {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 250, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 250, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`transition-shadow duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 ${className}`}
      {...props}
    >
      <div style={{ transform: "translateZ(30px)" }}>{children}</div>
    </motion.div>
  );
};

// =========================================================================
// 3. ShimmerText: Animated gradient shimmer highlight
// =========================================================================
export const ShimmerText = ({
  children,
  className = "",
  gradient = "from-indigo-400 via-purple-300 via-cyan-300 to-indigo-400",
}) => {
  return (
    <motion.span
      className={`inline-block max-w-full break-words bg-gradient-to-r ${gradient} bg-[length:200%_auto] bg-clip-text text-transparent font-extrabold ${className}`}
      animate={{
        backgroundPosition: ["0% 50%", "200% 50%"],
      }}
      transition={{
        duration: 4.5,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {children}
    </motion.span>
  );
};

// =========================================================================
// 4. MagneticButton: Button that pulls toward cursor with spring physics
// =========================================================================
export const MagneticButton = ({
  children,
  className = "",
  onClick,
  href,
  target,
  rel,
  ...props
}) => {
  const btnRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 350, damping: 18 });
  const springY = useSpring(y, { stiffness: 350, damping: 18 });

  const handleMouseMove = (e) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.25);
    y.set((e.clientY - centerY) * 0.25);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Tag = href ? "a" : (props.as || (onClick ? "button" : "div"));

  return (
    <motion.div
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="inline-block"
    >
      <Tag
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        className={className}
        {...props}
      >
        {children}
      </Tag>
    </motion.div>
  );
};

// =========================================================================
// 5. ScrollReveal: Staggered smooth viewport reveal with on-load immediate trigger support
// =========================================================================
export const ScrollReveal = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
  immediate = false,
  ...props
}) => {
  const getInitial = () => {
    switch (direction) {
      case "down":
        return { opacity: 0, y: -24 };
      case "left":
        return { opacity: 0, x: -24 };
      case "right":
        return { opacity: 0, x: 24 };
      case "scale":
        return { opacity: 0, scale: 0.95 };
      case "up":
      default:
        return { opacity: 0, y: 28 };
    }
  };

  const animTarget = { opacity: 1, x: 0, y: 0, scale: 1 };

  return (
    <motion.div
      initial={getInitial()}
      {...(immediate
        ? { animate: animTarget }
        : { whileInView: animTarget, viewport: { once: true, amount: 0.05 } })}
      transition={{
        duration: 0.65,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// =========================================================================
// 5B. AutomaticEntranceReveal: Guarantees dynamic animation automatically as soon as page/modal opens
// =========================================================================
export const AutomaticEntranceReveal = ({
  children,
  className = "",
  delay = 0,
  duration = 0.65,
  scale = 0.96,
  y = 24,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y, scale }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// =========================================================================
// 6. LiveAmbientMesh: Interactive animated background canvas & gradient orbs
// =========================================================================
export const LiveAmbientMesh = ({
  color1 = "rgba(99, 102, 241, 0.12)",
  color2 = "rgba(168, 85, 247, 0.1)",
  color3 = "rgba(6, 182, 212, 0.08)",
  showGrid = true,
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Animated Gradient Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[140px]"
        style={{ background: color1 }}
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-1/3 -right-32 w-[550px] h-[550px] rounded-full blur-[140px]"
        style={{ background: color2 }}
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
        className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px]"
        style={{ background: color3 }}
      />

      {/* Subtle Matrix / Dot Grid */}
      {showGrid && (
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      )}
    </div>
  );
};

// =========================================================================
// 7. ProjectDeepDiveModal: High-profile case study modal for project cards
// =========================================================================
export const ProjectDeepDiveModal = ({ project, onClose }) => {
  if (!project) return null;

  const projectUrl = (project.live || project.url || project.link || "").trim();
  const githubUrl = (project.github || "").trim();
  const hasExternalLink = Boolean(projectUrl || githubUrl);

  const handleCopyLink = () => {
    if (!projectUrl) return;
    navigator.clipboard.writeText(projectUrl);
    toast.success("Live project URL copied to clipboard! 📋");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 320 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-zinc-950/95 border border-zinc-800 p-6 sm:p-8 shadow-2xl z-10 text-white space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                <Sparkles size={12} />
                <span>CASE STUDY & ARCHITECTURE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {project.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Description & Impact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
              System Architecture & Overview
            </h4>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/80">
              {project.description || "Production-grade digital system engineered with performance, scalability, and modular maintainability."}
            </p>
          </div>

          {/* Key Engineering Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1">
              <div className="text-[11px] font-mono text-zinc-400">TYPE</div>
              <div className="text-xs font-bold text-white">Full-Stack System</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1">
              <div className="text-[11px] font-mono text-zinc-400">STATUS</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Production</span>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1 col-span-2 sm:col-span-1">
              <div className="text-[11px] font-mono text-zinc-400">METRICS</div>
              <div className="text-xs font-bold text-indigo-400">High Throughput</div>
            </div>
          </div>

          {/* Technologies Used */}
          {project.tags && project.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                Technology Stack ({project.tags.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action CTAs: Only show if an external project or repo link exists */}
          {hasExternalLink && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-800">
              {projectUrl ? (
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition cursor-pointer border border-zinc-800"
                >
                  <Copy size={14} />
                  <span>Copy Link</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                {githubUrl && (
                  <a
                    href={githubUrl.startsWith("http") ? githubUrl : `https://${githubUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition"
                  >
                    <FaGithub size={15} />
                    <span>GitHub Repository</span>
                  </a>
                )}

                {projectUrl && (
                  <a
                    href={projectUrl.startsWith("http") ? projectUrl : `https://${projectUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition transform hover:scale-105"
                  >
                    <span>Launch Live Demo</span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// =========================================================================
// 7b. DocumentViewerModal: Interactive viewer for Offer Letters & Completion Certificates (PDF / Image / Web URL)
// =========================================================================
export const DocumentViewerModal = ({
  doc, // { title, company, role, url, type, fileName }
  onClose,
}) => {
  if (!doc || !doc.url) return null;

  const isPdf =
    doc.url.startsWith("data:application/pdf") ||
    doc.url.toLowerCase().includes(".pdf") ||
    (doc.fileName && doc.fileName.toLowerCase().endsWith(".pdf"));

  const isImage =
    doc.url.startsWith("data:image/") ||
    /\.(png|jpe?g|webp|gif|svg)($|\?)/i.test(doc.url);

  const getSafeUrl = () => {
    if (doc.url.startsWith("data:")) {
      try {
        const arr = doc.url.split(",");
        const mime = arr[0].match(/:(.*?);/)?.[1] || "application/pdf";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return URL.createObjectURL(new Blob([u8arr], { type: mime }));
      } catch {
        return doc.url;
      }
    }
    return doc.url.startsWith("http") ? doc.url : `https://${doc.url}`;
  };

  const handleOpenExternal = () => {
    const safe = getSafeUrl();
    window.open(safe, "_blank", "noopener,noreferrer");
  };

  const handleDownload = () => {
    const safe = getSafeUrl();
    const a = document.createElement("a");
    a.href = safe;
    a.download = doc.fileName || `${(doc.company || "Experience").replace(/\s+/g, "_")}_${doc.type || "Certificate"}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" data-no-card-click="true">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 320 }}
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-zinc-950/95 border border-zinc-800 shadow-2xl z-10 text-white overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                {doc.type === "offerLetter" ? <FileText size={18} /> : <Award size={18} />}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {doc.title || (doc.type === "offerLetter" ? "Offer Letter" : "Completion Certificate")}
                </h3>
                <p className="text-[11px] text-zinc-400 truncate">
                  {doc.company ? `${doc.role ? `${doc.role} @ ` : ""}${doc.company}` : "Verified Employment Credential"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition cursor-pointer"
                title="Download Document"
              >
                <Download size={13} />
                <span className="hidden sm:inline">Download</span>
              </button>

              <button
                type="button"
                onClick={handleOpenExternal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 border border-amber-500/40 text-amber-300 hover:text-zinc-950 text-xs font-semibold transition cursor-pointer"
                title="Open in new window"
              >
                <ExternalLink size={13} />
                <span className="hidden sm:inline">New Tab</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer ml-1"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Viewer Content */}
          <div className="flex-1 p-3 sm:p-5 overflow-y-auto bg-zinc-950/80 flex items-center justify-center min-h-[50vh]">
            {isPdf ? (
              <iframe
                src={getSafeUrl()}
                title={doc.title || "Document Preview"}
                className="w-full h-[65vh] rounded-2xl border border-zinc-800/80 bg-zinc-900"
              />
            ) : isImage ? (
              <div className="w-full flex items-center justify-center p-2">
                <img
                  src={doc.url}
                  alt={doc.title || "Document"}
                  className="max-h-[65vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-zinc-800"
                />
              </div>
            ) : (
              <div className="text-center p-8 space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                  <ExternalLink size={28} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">External Document Link</h4>
                  <p className="text-xs text-zinc-400">
                    This document is hosted on an external drive or cloud service. Click below to view it directly in full resolution.
                  </p>
                </div>
                <a
                  href={doc.url.startsWith("http") ? doc.url : `https://${doc.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <span>Open Document ↗</span>
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Global helper to trigger the DocumentViewerModal anywhere
const openPortfolioDocument = (doc) => {
  if (typeof window !== "undefined" && doc) {
    window.dispatchEvent(new CustomEvent("portfolio:view-doc", { detail: doc }));
  }
};

// =========================================================================
// 7c. ExperienceCredentialsBadges: Universal badge & document viewer button component for work experiences
// =========================================================================
export const ExperienceCredentialsBadges = ({
  exp,
  isLight = false,
  className = "",
}) => {
  if (!exp) return null;

  const hasBadges = Boolean(exp.location || exp.workplaceType || exp.compensation);
  const hasDocs = Boolean(exp.certificate || exp.offerLetter);
  const hasProject = Boolean(exp.projectTitle || exp.projectLive || exp.projectGithub);

  if (!hasBadges && !hasDocs && !hasProject) return null;

  return (
    <div className={`flex flex-col gap-2 pt-2.5 ${className}`} data-no-card-click="true">
      {hasBadges && (
        <div className="flex flex-wrap items-center gap-2">
          {exp.location && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                isLight
                  ? "bg-slate-100 text-slate-700 border border-slate-300/80 shadow-xs"
                  : "bg-zinc-900/90 text-zinc-300 border border-zinc-700/60 font-mono shadow-xs"
              }`}
            >
              <MapPin size={11} className={isLight ? "text-indigo-600" : "text-cyan-400"} />
              <span>{exp.location}</span>
            </span>
          )}

          {exp.workplaceType && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                isLight
                  ? "bg-purple-50 text-purple-700 border border-purple-200 shadow-xs"
                  : "bg-purple-950/60 text-purple-300 border border-purple-800/60 font-mono shadow-xs"
              }`}
            >
              <Building2 size={11} className={isLight ? "text-purple-600" : "text-purple-400"} />
              <span>{exp.workplaceType}</span>
            </span>
          )}

          {exp.compensation && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                isLight
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs"
                  : "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-mono shadow-xs"
              }`}
            >
              <DollarSign size={11} className={isLight ? "text-emerald-600" : "text-emerald-400"} />
              <span>
                {exp.compensation}
                {exp.compensationAmount ? ` · ${exp.compensationAmount}` : ""}
              </span>
            </span>
          )}
        </div>
      )}

      {/* Company Project / Deliverable Carried Out Under Company */}
      {hasProject && (
        <div
          className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs ${
            isLight
              ? "bg-slate-50 border-slate-200/90 text-slate-800"
              : "bg-zinc-950/80 border-zinc-800/90 text-zinc-200"
          }`}
        >
          <div className="flex items-center gap-1.5 font-medium min-w-0">
            <span className={isLight ? "text-indigo-600 font-bold" : "text-cyan-400 font-bold"}>
              🚀 Project:
            </span>
            <span className="font-semibold truncate">
              {exp.projectTitle || "Key Deliverable"}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {exp.projectLive && (
              <a
                href={exp.projectLive.startsWith("http") ? exp.projectLive : `https://${exp.projectLive}`}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  isLight
                    ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                    : "bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30"
                }`}
              >
                <span>Live URL</span>
                <ExternalLink size={10} />
              </a>
            )}
            {exp.projectGithub && (
              <a
                href={exp.projectGithub.startsWith("http") ? exp.projectGithub : `https://${exp.projectGithub}`}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  isLight
                    ? "bg-slate-200 hover:bg-slate-300 text-slate-800"
                    : "bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white"
                }`}
              >
                <FaGithub size={11} />
                <span>GitHub</span>
              </a>
            )}
          </div>
        </div>
      )}

      {hasDocs && (
        <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
          {exp.certificate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                openPortfolioDocument({
                  title: "Completion Certificate",
                  company: exp.company,
                  role: exp.role,
                  url: exp.certificate,
                  type: "certificate",
                  fileName: exp.certificateName,
                });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-semibold transition cursor-pointer shadow-sm shadow-amber-500/10 active:scale-95"
              title="View Completion Certificate"
            >
              <Award size={13} className="text-amber-400" />
              <span>View Completion Certificate</span>
            </button>
          )}

          {exp.offerLetter && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                openPortfolioDocument({
                  title: "Official Offer Letter",
                  company: exp.company,
                  role: exp.role,
                  url: exp.offerLetter,
                  type: "offerLetter",
                  fileName: exp.offerLetterName,
                });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 hover:text-purple-200 text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95"
              title="View Official Offer Letter"
            >
              <FileText size={13} className="text-purple-400" />
              <span>View Offer Letter</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 8. FloatingBadge: Ambient floating micro-pill with breathing animation
// =========================================================================
export const FloatingBadge = ({
  children,
  className = "",
  duration = 4,
  yOffset = 8,
}) => {
  return (
    <motion.div
      animate={{ y: [0, -yOffset, 0] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
};

// =========================================================================
// 9. StaggerContainer & StaggerItem: Staggered animated layout wrappers
// =========================================================================
export const StaggerContainer = ({
  children,
  className = "",
  staggerDelay = 0.08,
  ...props
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = "", ...props }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24, scale: 0.96 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: "spring", stiffness: 350, damping: 25 },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// =========================================================================
// 10. GlowCard: Dynamic rotating neon border aura with 3D spring transformation
// =========================================================================
export const GlowCard = ({
  children,
  className = "",
  glowColor = "from-indigo-500 via-purple-500 to-cyan-500",
  onClick,
  ...props
}) => {
  return (
    <motion.div
      whileHover={{ y: -7, scale: 1.018 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      onClick={onClick}
      className={`relative group rounded-3xl p-[1.5px] overflow-hidden ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {/* Animated Conic Gradient Border Highlight */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className={`absolute -inset-[150%] bg-gradient-to-r ${glowColor} opacity-20 group-hover:opacity-100 blur-sm transition-opacity duration-500 pointer-events-none`}
      />
      {/* Internal Content Container */}
      <div className="relative z-10 w-full h-full rounded-[22px] bg-zinc-950/90 backdrop-blur-2xl p-6 sm:p-7 border border-zinc-800/80 group-hover:border-zinc-700/80 transition-colors">
        {children}
      </div>
    </motion.div>
  );
};

// =========================================================================
// 11. MagneticPill: Spring-physics interactive chip for skills & tags
// =========================================================================
export const MagneticPill = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <motion.span
      whileHover={{
        scale: 1.08,
        y: -3,
        rotate: [-1, 1, 0],
        transition: { type: "spring", stiffness: 450, damping: 15 },
      }}
      whileTap={{ scale: 0.95 }}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-default transition-shadow select-none shadow-sm hover:shadow-lg ${className}`}
      {...props}
    >
      {children}
    </motion.span>
  );
};

// =========================================================================
// 12. HoloBadge: Holographic badge with continuous iridescent shimmer
// =========================================================================
export const HoloBadge = ({
  children,
  className = "",
  icon: Icon,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 350, damping: 20 }}
      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-lg shadow-purple-500/10 ${className}`}
    >
      {Icon && <Icon size={13} className="text-cyan-300 animate-pulse" />}
      <span className="text-xs font-bold tracking-wide bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
        {children}
      </span>
    </motion.div>
  );
};

// =========================================================================
// 13. PulseAura: Ambient breathing halo for avatars and hero spotlights
// =========================================================================
export const PulseAura = ({
  children,
  className = "",
  glowGradient = "from-cyan-500 via-indigo-500 to-purple-500",
}) => {
  return (
    <div className={`relative group inline-block ${className}`}>
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.45, 0.85, 0.45],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute -inset-2 rounded-full bg-gradient-to-r ${glowGradient} blur-xl pointer-events-none group-hover:opacity-100 transition-opacity`}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// =========================================================================
// 14. Perspective3DCard: State-of-the-Art Dribbble 3D Tilt with Specular Sheen & Depth
// =========================================================================

export const Perspective3DCard = ({
  children,
  className = "",
  maxTilt = 12,
  glareColor = "rgba(255, 255, 255, 0.15)",
  glowBorderColor = "rgba(99, 102, 241, 0.4)",
  onClick,
  ...props
}) => {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 20 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);

    setGlarePos({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1200,
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      className={`relative overflow-hidden rounded-3xl border border-white/[0.08] transition-shadow duration-300 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {/* Dynamic Specular Sheen Glare */}
      <div
        className="pointer-events-none absolute -inset-full transition-opacity duration-300 z-20"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle 350px at ${glarePos.x}% ${glarePos.y}%, ${glareColor}, transparent 70%)`,
        }}
      />

      {/* Dynamic Responsive Border Shimmer */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300 z-10"
        style={{
          opacity: isHovered ? 1 : 0,
          boxShadow: `inset 0 0 0 1px ${glowBorderColor}`,
        }}
      />

      {/* 3D Depth Layer for Content */}
      <div
        className="relative z-30 h-full w-full"
        style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
      >
        {children}
      </div>
    </motion.div>
  );
};

// =========================================================================
// 15. InteractiveCursorFollower: Fluid Spring Luminous Halo (Awwwards/Dribbble)
// =========================================================================
export const InteractiveCursorFollower = ({
  color = "rgba(99, 102, 241, 0.12)",
  size = 480,
  blur = 90,
}) => {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const springConfig = { stiffness: 180, damping: 28 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMove = (e) => {
      mouseX.set(e.clientX - size / 2);
      mouseY.set(e.clientY - size / 2);
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMove);
  }, [mouseX, mouseY, size]);

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 rounded-full z-0 transition-opacity duration-500"
      style={{
        x: smoothX,
        y: smoothY,
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: `blur(${blur}px)`,
      }}
    />
  );
};

// =========================================================================
// 16. KineticMarquee: Continuous Infinite Ticker with Seamless Velocity
// =========================================================================
export const KineticMarquee = ({
  items = [],
  speed = 28,
  direction = "left",
  pauseOnHover = true,
  className = "",
  renderItem,
}) => {
  const [isPaused, setIsPaused] = useState(false);

  if (!items || items.length === 0) return null;

  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div
      className={`relative w-full overflow-hidden select-none py-3 ${className}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {/* Edge gradient masks for smooth fade */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-zinc-950 to-transparent z-10" />

      <motion.div
        className="flex gap-4 w-max items-center"
        animate={{
          x: direction === "left" ? ["0%", "-33.333%"] : ["-33.333%", "0%"],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
          ...(isPaused ? { repeatType: "loop", duration: 999999 } : {}),
        }}
      >
        {duplicatedItems.map((item, idx) => (
          <div key={idx} className="shrink-0">
            {renderItem ? (
              renderItem(item, idx)
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900/80 border border-white/[0.08] text-xs font-mono font-medium text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>{typeof item === "string" ? item : item.name || item.title}</span>
              </span>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// =========================================================================
// 17. DynamicSoundwaveVisualizer: Interactive Audio Equalizer Bars
// =========================================================================
export const DynamicSoundwaveVisualizer = ({
  barCount = 18,
  color = "bg-gradient-to-t from-indigo-500 to-cyan-400",
  className = "",
  isActive = true,
}) => {
  return (
    <div className={`flex items-end gap-1 h-6 sm:h-8 px-2 select-none ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => {
        const minH = 20;
        const maxH = 95;
        const duration = 0.5 + ((i % 5) * 0.15);
        return (
          <motion.div
            key={i}
            className={`w-1 rounded-full ${color}`}
            animate={
              isActive
                ? {
                    height: [`${minH}%`, `${maxH}%`, `${minH + 15}%`, `${maxH - 20}%`, `${minH}%`],
                  }
                : { height: "20%" }
            }
            transition={{
              duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: (i * 0.05) % 0.4,
            }}
          />
        );
      })}
    </div>
  );
};

// =========================================================================
// 18. KineticWordReveal: Staggered Word Entrance Animation
// =========================================================================
export const KineticWordReveal = ({
  text = "",
  className = "",
  delay = 0,
  immediate = true,
}) => {
  const words = text.split(" ");
  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, idx) => (
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          {...(immediate
            ? { animate: { opacity: 1, y: 0, filter: "blur(0px)" } }
            : { whileInView: { opacity: 1, y: 0, filter: "blur(0px)" }, viewport: { once: true } })}
          transition={{
            duration: 0.5,
            delay: delay + idx * 0.045,
            ease: [0.2, 0.65, 0.3, 0.9],
          }}
          className="inline-block mr-[0.28em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

// =========================================================================
// 19. CyberMatrixRainCanvas: Falling Digital Code Rain with Glitch Pulses
// =========================================================================
export const CyberMatrixRainCanvas = ({
  color = "#00ffcc",
  leadColor = "#ffffff",
  fontSize = 14,
  speed = 1.0,
  opacity = 0.22,
  className = "",
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));
    };
    window.addEventListener("resize", onResize);

    const chars = "0123456789ABCDEFλΩ⚡<>/{}$%#@*!~XYZアイウエオカキサシスセタチツテトナニヌネハヒフヘホマミムメモヤユヨラリルレロワヲン";
    let columns = Math.floor(width / fontSize);
    let drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));

    let mouseX = -999;
    let mouseY = -999;
    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove);

    const render = () => {
      ctx.fillStyle = "rgba(7, 9, 14, 0.12)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Mouse proximity glow
        const dist = Math.hypot(x - mouseX, y - mouseY);
        const isNearMouse = dist < 120;

        if (isNearMouse) {
          ctx.fillStyle = leadColor;
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
        } else if (Math.random() > 0.88) {
          ctx.fillStyle = leadColor;
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = color;
          ctx.shadowBlur = 0;
        }

        ctx.fillText(char, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += speed;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [color, leadColor, fontSize, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity }}
    />
  );
};

// =========================================================================
// 20. BioluminescentOrbsCanvas: Floating Chromatic Bokeh Orbs with Mouse Repulsion
// =========================================================================
export const BioluminescentOrbsCanvas = ({
  colorPalette = ["#06b6d4", "#ec4899", "#8b5cf6", "#3b82f6"],
  orbCount = 18,
  opacity = 0.28,
  className = "",
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    let mouse = { x: -999, y: -999, active: false };
    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onMouseLeave = () => {
      mouse.active = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    const orbs = Array.from({ length: orbCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      baseRadius: Math.random() * 80 + 50,
      radius: Math.random() * 80 + 50,
      color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
      pulseSpeed: Math.random() * 0.02 + 0.01,
      phase: Math.random() * Math.PI * 2,
    }));

    const sparkles = [];

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "screen";

      orbs.forEach((orb) => {
        orb.phase += orb.pulseSpeed;
        orb.radius = orb.baseRadius + Math.sin(orb.phase) * 16;

        // Mouse repulsion
        if (mouse.active) {
          const dx = orb.x - mouse.x;
          const dy = orb.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 200 && dist > 0) {
            const force = (200 - dist) / 200;
            orb.vx += (dx / dist) * force * 0.3;
            orb.vy += (dy / dist) * force * 0.3;

            // Spawn stardust sparkle
            if (sparkles.length < 35 && Math.random() > 0.8) {
              sparkles.push({
                x: orb.x + (Math.random() - 0.5) * 20,
                y: orb.y + (Math.random() - 0.5) * 20,
                alpha: 1,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                color: orb.color,
                size: Math.random() * 2.5 + 1,
              });
            }
          }
        }

        // Apply friction & boundary wrap
        orb.vx *= 0.985;
        orb.vy *= 0.985;
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -orb.radius) orb.x = width + orb.radius;
        if (orb.x > width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = height + orb.radius;
        if (orb.y > height + orb.radius) orb.y = -orb.radius;

        // Draw radial glowing orb
        const grad = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          orb.radius
        );
        grad.addColorStop(0, orb.color);
        grad.addColorStop(0.5, orb.color.replace(")", ", 0.45)").replace("rgb", "rgba"));
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw sparkles
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= 0.02;
        if (s.alpha <= 0) {
          sparkles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha * 0.8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = "source-over";

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, [colorPalette, orbCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity }}
    />
  );
};

// =========================================================================
// 21. TerminalBinaryStreamCanvas: Minimalist Hacker Terminal Data Streams
// =========================================================================
export const TerminalBinaryStreamCanvas = ({
  color = "#10b981",
  opacity = 0.16,
  className = "",
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const tokens = [
      "0101", "1100", "0011", "$_cmd", "commit:a4f8", "git push", "=> 200 OK",
      "::root", "0x7F", "sh_init", "ACK", "SYN", "chmod 755", "ping -c1",
      "0110", "1010", "[PASS]", "ready", "async", "await", "0x00", "node:v20",
    ];

    const streams = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: Math.random() * 0.8 + 0.4,
      token: tokens[Math.floor(Math.random() * tokens.length)],
      alpha: Math.random() * 0.6 + 0.3,
      fontSize: Math.floor(Math.random() * 3) + 11,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      streams.forEach((stream) => {
        stream.y += stream.speed;
        if (stream.y > height + 20) {
          stream.y = -20;
          stream.x = Math.random() * width;
          stream.token = tokens[Math.floor(Math.random() * tokens.length)];
        }

        ctx.font = `${stream.fontSize}px monospace`;
        ctx.fillStyle = color;
        ctx.globalAlpha = stream.alpha;
        ctx.fillText(stream.token, stream.x, stream.y);
      });

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity }}
    />
  );
};

// =========================================================================
// 22. PrismaticLiquidCanvas: Frosted Glass Bubbles & Caustic Light Dispersion
// =========================================================================
export const PrismaticLiquidCanvas = ({
  color1 = "#8b5cf6",
  color2 = "#06b6d4",
  color3 = "#ec4899",
  bubbleCount = 20,
  opacity = 0.24,
  className = "",
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const bubbles = Array.from({ length: bubbleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.6 - 0.2,
      radius: Math.random() * 45 + 20,
      baseRadius: Math.random() * 45 + 20,
      phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      t += 0.008;

      bubbles.forEach((b) => {
        b.x += b.vx + Math.sin(t + b.phase) * 0.4;
        b.y += b.vy;

        if (b.y < -b.radius) {
          b.y = height + b.radius;
          b.x = Math.random() * width;
        }

        // Draw translucent refractive glass bubble
        const grad = ctx.createRadialGradient(
          b.x - b.radius * 0.3,
          b.y - b.radius * 0.3,
          b.radius * 0.1,
          b.x,
          b.y,
          b.radius
        );
        grad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
        grad.addColorStop(0.35, "rgba(139, 92, 246, 0.15)");
        grad.addColorStop(0.7, "rgba(6, 182, 212, 0.1)");
        grad.addColorStop(1, "rgba(236, 72, 153, 0.25)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Rim highlight
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Specular reflection glint
        ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
        ctx.beginPath();
        ctx.arc(b.x - b.radius * 0.38, b.y - b.radius * 0.38, b.radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
    };
  }, [color1, color2, color3, bubbleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity }}
    />
  );
};

// =========================================================================
// 23. WarpStarfieldCanvas: Deep Space 3D Starfield & Shooting Stars
// =========================================================================
export const WarpStarfieldCanvas = ({
  starCount = 180,
  accentColor = "#10b981",
  speed = 0.8,
  opacity = 0.32,
  className = "",
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const stars = Array.from({ length: starCount }, () => ({
      x: (Math.random() - 0.5) * width * 1.5,
      y: (Math.random() - 0.5) * height * 1.5,
      z: Math.random() * width,
      size: Math.random() * 1.5 + 0.5,
    }));

    let shootingStar = null;

    const render = () => {
      ctx.fillStyle = "rgba(2, 4, 8, 0.25)";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      stars.forEach((star) => {
        star.z -= speed * 1.5;
        if (star.z <= 0) {
          star.z = width;
          star.x = (Math.random() - 0.5) * width * 1.5;
          star.y = (Math.random() - 0.5) * height * 1.5;
        }

        const k = 180 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        if (px >= 0 && px < width && py >= 0 && py < height) {
          const size = (1 - star.z / width) * star.size * 2;
          const alpha = 1 - star.z / width;

          ctx.fillStyle = Math.random() > 0.8 ? accentColor : "#ffffff";
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.5, size), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Occasional shooting star
      if (!shootingStar && Math.random() > 0.985) {
        shootingStar = {
          x: Math.random() * width * 0.8,
          y: Math.random() * height * 0.3,
          vx: Math.random() * 8 + 6,
          vy: Math.random() * 4 + 3,
          length: Math.random() * 80 + 40,
          alpha: 1,
        };
      }

      if (shootingStar) {
        ctx.strokeStyle = accentColor;
        ctx.globalAlpha = shootingStar.alpha;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(
          shootingStar.x - shootingStar.vx * (shootingStar.length / 10),
          shootingStar.y - shootingStar.vy * (shootingStar.length / 10)
        );
        ctx.stroke();

        shootingStar.x += shootingStar.vx;
        shootingStar.y += shootingStar.vy;
        shootingStar.alpha -= 0.03;

        if (shootingStar.alpha <= 0) {
          shootingStar = null;
        }
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
    };
  }, [starCount, accentColor, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity }}
    />
  );
};

// =========================================================================
// 24. NeuralMeshCanvas: Interactive Connected Graph with Energy Synapse Pulses
// =========================================================================
export const NeuralMeshCanvas = ({
  nodeCount = 45,
  color = "rgba(99, 102, 241, 0.4)",
  pulseColor = "#06b6d4",
  opacity = 0.26,
  className = "",
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    let mouse = { x: -999, y: -999, active: false };
    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onMouseLeave = () => {
      mouse.active = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: Math.random() * 2 + 1.5,
    }));

    // Traveling energy pulses along connections
    const pulses = [];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update & draw nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Mouse attraction
        if (mouse.active) {
          const dx = mouse.x - node.x;
          const dy = mouse.y - node.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 140 && dist > 0) {
            node.x += (dx / dist) * 0.6;
            node.y += (dy / dist) * 0.6;

            // Connect to mouse
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.35 * (1 - dist / 140)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        ctx.fillStyle = pulseColor;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Connect nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.8 * (1 - dist / 130);
            ctx.stroke();

            // Randomly spawn traveling energy pulses
            if (pulses.length < 15 && Math.random() > 0.992) {
              pulses.push({
                x1: n1.x,
                y1: n1.y,
                x2: n2.x,
                y2: n2.y,
                progress: 0,
                speed: Math.random() * 0.03 + 0.015,
              });
            }
          }
        }
      }

      // Draw energy pulses
      for (let k = pulses.length - 1; k >= 0; k--) {
        const p = pulses[k];
        p.progress += p.speed;
        if (p.progress >= 1) {
          pulses.splice(k, 1);
          continue;
        }

        const px = p.x1 + (p.x2 - p.x1) * p.progress;
        const py = p.y1 + (p.y2 - p.y1) * p.progress;

        ctx.fillStyle = pulseColor;
        ctx.shadowColor = pulseColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, [nodeCount, color, pulseColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity }}
    />
  );
};

// =========================================================================
// 27. DiffBox: High-contrast red/green Before vs After comparison card
// =========================================================================
export const DiffBox = ({
  original,
  suggested,
  originalLabel = "Before (Original)",
  suggestedLabel = "After (AI Optimized)",
  category = "",
  className = "",
}) => {
  if (!original && !suggested) return null;

  return (
    <div className={`space-y-2.5 my-3 ${className}`}>
      {category && (
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
          <Sparkles size={11} className="text-emerald-400" />
          <span>{category}</span>
        </div>
      )}
      {original && (
        <div className="p-3 rounded-xl bg-rose-950/40 border-2 border-rose-500/50 text-xs shadow-md shadow-rose-950/20 text-left">
          <span className="text-rose-400 font-mono text-[10px] font-bold uppercase block mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>❌ {originalLabel}</span>
          </span>
          <p className="text-rose-200 text-xs sm:text-sm leading-relaxed line-through decoration-rose-400 decoration-2 font-light break-words">
            {original}
          </p>
        </div>
      )}
      {suggested && (
        <div className="p-3.5 rounded-xl bg-emerald-950/45 border-2 border-emerald-500/70 text-xs shadow-lg shadow-emerald-950/40 text-left">
          <span className="text-emerald-400 font-mono text-[10px] font-bold uppercase flex items-center gap-1.5 mb-1">
            <Sparkles size={12} className="text-emerald-400 animate-pulse" />
            <span>✅ {suggestedLabel}</span>
          </span>
          <p className="text-emerald-50 text-xs sm:text-sm leading-relaxed font-semibold break-words">
            {suggested}
          </p>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 28. DiffThemeBanner: Layout theme recommendation diff callout
// =========================================================================
export const DiffThemeBanner = ({
  originalTemplate = "Modern",
  suggestedTemplate = "Google Inspired",
  className = "",
}) => {
  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-zinc-900 to-indigo-950/70 border-2 border-emerald-500/60 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl ${className}`}>
      <div className="flex items-center gap-2.5">
        <Sparkles size={16} className="text-emerald-400 shrink-0" />
        <span className="text-zinc-200">
          <strong className="text-white">AI Layout Theme:</strong> Switched to{" "}
          <span className="text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
            {suggestedTemplate}
          </span>{" "}
          (Original:{" "}
          <span className="text-rose-300 line-through bg-rose-950/40 px-1.5 py-0.5 rounded">
            {originalTemplate}
          </span>
          ) &mdash; Tailored for target recruiter ATS &amp; technical screenings.
        </span>
      </div>
      <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shrink-0 self-start sm:self-auto">
        AI Theme Match
      </span>
    </div>
  );
};



