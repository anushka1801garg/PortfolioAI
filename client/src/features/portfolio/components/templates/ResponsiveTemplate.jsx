import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Tablet,
  Monitor,
  ArrowUpRight,
  ExternalLink,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Layers,
  Sparkles,
  Award,
  ShieldCheck,
  BookOpen,
  Globe,
  Compass,
  Terminal,
  Code2,
  Copy,
  Check,
  Camera,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
  TiltCard,
  SpotlightCard,
  ScrollReveal,
  PulseAura,
  MagneticButton,
  MagneticPill,
  ProjectDeepDiveModal,
  ExperienceCredentialsBadges,
} from "./motionComponents";

const ResponsiveTemplate = ({ portfolio, onEditPhoto, isOwner, previewDevice }) => {
  const [inspectedProject, setInspectedProject] = useState(null);
  const {
    name = "Alex Morgan",
    tagline = "Full-stack engineer crafting responsive interfaces and scalable architectures across all form factors.",
    about = "",
    skills = [],
    projects = [],
    experience = [],
    education = [],
    achievements = [],
    certifications = [],
    blog = [],
    github,
    linkedin,
    website,
    email,
    phone,
    title,
  } = portfolio || {};

  const effectiveDevice = previewDevice || portfolio?._previewDevice || "desktop";
  const [deviceMode, setDeviceMode] = useState(effectiveDevice); // 'desktop' | 'tablet' | 'mobile'
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (previewDevice) {
      setDeviceMode(previewDevice);
    }
  }, [previewDevice]);

  const avatar = portfolio?.avatar || portfolio?.hero?.avatar || "";
  const displayName = name || title || "Alex Morgan";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleCopyEmail = () => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  // Container width constraint based on simulated device
  const getDeviceContainerClass = () => {
    switch (deviceMode) {
      case "mobile":
        return "max-w-[400px] border-x border-zinc-700/80 shadow-2xl rounded-3xl my-6 bg-zinc-950 p-4 transition-all duration-300 preview-device-mobile";
      case "tablet":
        return "max-w-[768px] border-x border-zinc-700/80 shadow-2xl rounded-3xl my-6 bg-zinc-950 p-6 transition-all duration-300 preview-device-tablet";
      case "desktop":
      default:
        return "max-w-6xl transition-all duration-300";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-zinc-100 font-sans selection:bg-purple-500 selection:text-white pb-24">
      {/* Device Simulation Toolbar */}
      <div className="sticky top-0 z-30 border-b border-zinc-800 bg-[#0B0F19]/90 backdrop-blur-lg px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <Compass size={14} className="text-purple-400" />
            <span className="font-medium text-white">Fluid Responsive Architecture</span>
            <span className="hidden sm:inline text-zinc-500">• Test Across Viewports:</span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            {[
              { id: "desktop", label: "Desktop", icon: Monitor },
              { id: "tablet", label: "Tablet (768px)", icon: Tablet },
              { id: "mobile", label: "Mobile (390px)", icon: Smartphone },
            ].map((d) => {
              const Icon = d.icon;
              return (
                <button
                  key={d.id}
                  onClick={() => setDeviceMode(d.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                    deviceMode === d.id
                      ? "bg-purple-600 text-white shadow"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                  }`}
                >
                  <Icon size={13} />
                  <span>{d.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Responsive Bento Grid Canvas */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 220, damping: 25 }}
        className={`mx-auto px-4 sm:px-6 py-8 sm:py-12 ${getDeviceContainerClass()}`}
      >
        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-4 sm:gap-6">
          {/* Main Hero Card (Large Bento Tile) */}
          <motion.div
            id="hero"
            data-section="hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="col-span-12 lg:col-span-8 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-purple-950/20 p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden backdrop-blur scroll-mt-24"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                <Sparkles size={13} />
                <span>Responsive Dynamic Architecture • Calibrated Viewport</span>
              </div>

              <div className="flex items-center gap-4 sm:gap-5">
                {avatar && (
                  <div className="relative group shrink-0">
                    <PulseAura
                      colors={["#9333ea", "#6366f1", "#a855f7"]}
                      size="135%"
                      blur="18px"
                      opacity={0.35}
                    />
                    <TiltCard maxTilt={15} perspective={800} className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl relative z-10">
                      <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-purple-600/30 overflow-hidden relative group">
                        <img
                          src={avatar}
                          alt={displayName}
                          className="w-full h-full object-cover rounded-[14px]"
                          onError={(e) => {
                            e.currentTarget.parentElement.style.display = "none";
                          }}
                        />
                        {onEditPhoto && (
                          <button
                            type="button"
                            onClick={onEditPhoto}
                            className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer text-white z-20"
                            title="Change Responsive Avatar"
                          >
                            <Camera size={18} className="text-purple-300" />
                          </button>
                        )}
                      </div>
                    </TiltCard>
                  </div>
                )}
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                  {displayName}
                </h1>
              </div>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
                {tagline}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-6 mt-6 border-t border-zinc-800/80 text-xs">
              {email && (
                <div className="flex items-center gap-1.5">
                  <MagneticButton
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-purple-600/30 border border-zinc-700/60 text-zinc-300 hover:text-white transition"
                  >
                    <Mail size={13} className="text-purple-400" />
                    <span>{email}</span>
                  </MagneticButton>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition border border-zinc-700/60"
                    title="Copy Email"
                  >
                    {copiedEmail ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
              )}
              {phone && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-300">
                  <Phone size={13} className="text-purple-400" />
                  <span>{phone}</span>
                </span>
              )}
              {github && (
                <MagneticButton
                  href={github.startsWith("http") ? github : `https://${github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-purple-600/30 border border-zinc-700/60 text-zinc-300 hover:text-white transition"
                >
                  <FaGithub size={13} className="text-purple-400" />
                  <span>GitHub</span>
                </MagneticButton>
              )}
              {linkedin && (
                <MagneticButton
                  href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-purple-600/30 border border-zinc-700/60 text-zinc-300 hover:text-white transition"
                >
                  <FaLinkedin size={13} className="text-purple-400" />
                  <span>LinkedIn</span>
                </MagneticButton>
              )}
              {website && (
                <motion.a
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  href={website.startsWith("http") ? website : `https://${website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-purple-600/30 border border-zinc-700/60 text-zinc-300 hover:text-white transition"
                >
                  <ExternalLink size={13} className="text-purple-400" />
                  <span>Website</span>
                </motion.a>
              )}
            </div>
          </motion.div>

          {/* Quick Metrics & Avatar Bento Tile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            whileHover={{ y: -3 }}
            className="col-span-12 lg:col-span-4 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col justify-between gap-6 backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-purple-600/30 overflow-hidden">
                <div className="w-full h-full rounded-[14px] bg-zinc-950 flex items-center justify-center overflow-hidden">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={displayName}
                      className="w-full h-full object-cover rounded-[14px]"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        if (e.currentTarget.nextElementSibling) {
                          e.currentTarget.nextElementSibling.style.display = "flex";
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full items-center justify-center text-xl font-black text-white ${
                      avatar ? "hidden" : "flex"
                    }`}
                  >
                    {initials}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active: {deviceMode.toUpperCase()}
                </span>
                <p className="text-[11px] text-zinc-500 mt-1 font-mono">100% Responsive</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-zinc-800/60 p-3 border border-zinc-800">
                <p className="text-xl font-bold text-white">6+</p>
                <p className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Years Exp.</p>
              </div>
              <div className="rounded-xl bg-zinc-800/60 p-3 border border-zinc-800">
                <p className="text-xl font-bold text-purple-400">{projects.length || 4}</p>
                <p className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Projects</p>
              </div>
            </div>

            <div className="text-xs text-zinc-400 leading-relaxed bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/60">
              ⚡ Adapts seamlessly across ultra-wide monitors, tablets, and handheld devices.
            </div>
          </motion.div>

          {/* About Tile */}
          {about && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="col-span-12 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                <Terminal size={18} className="text-purple-400" />
                <span>Biography &amp; Architectural Focus</span>
              </h2>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                {about}
              </p>
            </motion.div>
          )}

          {/* Skills Pill Cloud (Bento Tile) */}
          {skills && skills.length > 0 && (
            <motion.div
              id="skills"
              data-section="skills"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="col-span-12 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 space-y-4 scroll-mt-24"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code2 size={18} className="text-purple-400" />
                  <span>Technical Arsenal</span>
                </h2>
                <span className="text-xs font-mono text-zinc-500">{skills.length} competencies</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => {
                  const skillName = typeof skill === "string" ? skill : (skill?.name || skill?.title || "");
                  return (
                    <MagneticPill key={index}>
                      <span className="px-3.5 py-1.5 rounded-xl bg-zinc-800/90 border border-zinc-700/60 text-zinc-200 text-xs font-semibold hover:border-purple-500/50 hover:bg-purple-600/20 transition cursor-default block">
                        {skillName}
                      </span>
                    </MagneticPill>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Projects Bento Cards */}
          {projects && projects.length > 0 && (
            <motion.div
              id="projects"
              data-section="projects"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="col-span-12 space-y-4 scroll-mt-24"
            >
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-purple-400" />
                <span>Selected Works</span>
              </h2>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {projects.map((project, index) => {
                  const projectUrl = project.live || project.url || project.link || project.github;
                  const safeProjectUrl = projectUrl
                    ? projectUrl.startsWith("http")
                      ? projectUrl
                      : `https://${projectUrl}`
                    : null;
                  return (
                    <TiltCard key={index} maxTilt={6} perspective={900}>
                      <SpotlightCard
                        spotlightColor="rgba(168, 85, 247, 0.18)"
                        className="group rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between space-y-4 cursor-pointer shadow-lg"
                        onClick={() => setInspectedProject(project)}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono text-purple-400 font-bold">
                              APP #{index + 1}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInspectedProject(project);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-white transition text-xs font-mono cursor-pointer"
                              >
                                inspect //
                              </button>
                              {project.github && (
                                <a
                                  href={project.github.startsWith("http") ? project.github : `https://${project.github}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:text-white text-zinc-400 transition"
                                >
                                  <FaGithub size={13} />
                                </a>
                              )}
                              {project.live && (
                                <a
                                  href={project.live.startsWith("http") ? project.live : `https://${project.live}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white transition"
                                >
                                  <ExternalLink size={13} />
                                </a>
                              )}
                            </div>
                          </div>

                          <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition flex items-center gap-2">
                            <span>{project.title}</span>
                            {safeProjectUrl && <ExternalLink size={13} className="text-zinc-500 group-hover:text-purple-300 transition" />}
                          </h3>

                          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                            {project.description}
                          </p>

                          {project.tags && project.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {project.tags.map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="px-2 py-0.5 rounded-md bg-zinc-800 text-purple-300 text-[10px] font-mono"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </SpotlightCard>
                    </TiltCard>
                  );
                })}
              </motion.div>
            </motion.div>
          )}

          {/* Experience & Education 2-Column Split */}
          {experience && experience.length > 0 && (
            <motion.div
              id="experience"
              data-section="experience"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="col-span-12 md:col-span-7 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4 scroll-mt-24"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase size={18} className="text-purple-400" />
                <span>Career Milestones</span>
              </h2>

              <div className="space-y-4">
                {experience.map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                    className="border-l-2 border-purple-500/40 pl-4 space-y-1"
                  >
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-bold text-white">{item.role}</h3>
                      <span className="text-[11px] font-mono text-zinc-500">{item.duration}</span>
                    </div>
                    <p className="text-xs font-semibold text-purple-400">{item.company}</p>
                    <p className="text-xs text-zinc-400 pt-0.5 leading-relaxed">{item.description}</p>
                    <ExperienceCredentialsBadges exp={item} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {education && education.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="col-span-12 md:col-span-5 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <GraduationCap size={18} className="text-purple-400" />
                <span>Education</span>
              </h2>

              <div className="space-y-4">
                {education.map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -3 }}
                    className="rounded-xl bg-zinc-800/40 p-4 space-y-1.5 border border-zinc-800"
                  >
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-bold text-white">{item.degree}</h3>
                      <span className="text-[11px] font-mono text-zinc-500">{item.year}</span>
                    </div>
                    <p className="text-xs text-purple-300 font-medium">{item.institution}</p>
                    {item.description && (
                      <p className="text-xs text-zinc-400 pt-0.5">{item.description}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Accolades & Certifications */}
        {(achievements?.length > 0 || certifications?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {achievements?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4"
              >
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award size={18} className="text-amber-400" />
                  <span>Key Recognitions</span>
                </h2>
                <div className="space-y-3">
                  {achievements.map((item, idx) => {
                    const title = typeof item === "string" ? item : (item?.title || item?.name || "");
                    const metric = typeof item === "object" ? item?.metric : null;
                    const description = typeof item === "object" ? item?.description : null;
                    const achUrl = (typeof item === "object" && item !== null && typeof item.link === "string" && item.link) ||
                                   (typeof item === "object" && item !== null && typeof item.url === "string" && item.url) || null;
                    return (
                      <motion.div
                        key={idx}
                        whileHover={{ y: -3 }}
                        className="rounded-xl bg-zinc-800/40 p-4 space-y-2 border border-zinc-800 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-white">{title}</h3>
                            {metric && (
                              <span className="text-xs font-mono text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded">
                                {metric}
                              </span>
                            )}
                          </div>
                          {description && <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>}
                        </div>
                        {achUrl && (
                          <div className="pt-1">
                            <a
                              href={achUrl.startsWith("http") ? achUrl : `https://${achUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 hover:underline"
                            >
                              <span>Verification Link</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {certifications?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4"
              >
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={18} className="text-purple-400" />
                  <span>Verified Credentials</span>
                </h2>
                <div className="space-y-3">
                  {certifications.map((item, idx) => {
                    const certUrl = item.link || item.url;
                    return (
                      <motion.div
                        key={idx}
                        whileHover={{ y: -3 }}
                        className="rounded-xl bg-zinc-800/40 p-4 space-y-2 border border-zinc-800 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-white">{item.name}</h3>
                          <p className="text-xs text-zinc-400">
                            {item.issuer} {item.date ? `• ${item.date}` : ""}
                          </p>
                          {item.description && (
                            <p className="text-xs text-zinc-400 leading-relaxed pt-0.5">{item.description}</p>
                          )}
                        </div>
                        {certUrl && (
                          <div className="pt-1">
                            <a
                              href={certUrl.startsWith("http") ? certUrl : `https://${certUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 hover:underline"
                            >
                              <span>Verify License</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Engineering Articles & Publications */}
        {blog?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4 mt-6"
          >
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen size={20} className="text-purple-400" />
              <span>Articles &amp; Thoughts</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blog.map((post, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-2 hover:border-purple-500/40 transition group"
                >
                  <div className="flex justify-between items-center text-xs font-mono text-zinc-500">
                    <span>{post.readTime || "5 min read"}</span>
                    {post.date && <span>{post.date}</span>}
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition">
                    {post.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{post.summary}</p>
                  {post.link && (
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium pt-1"
                    >
                      <span>Read Publication</span>
                      <ArrowUpRight size={12} />
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Contact Section */}
        {(email || phone || github || linkedin || website) && (
          <motion.section
            id="contact"
            data-section="contact"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4 mt-6 scroll-mt-24"
          >
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Mail size={20} className="text-purple-400" />
              <span>Get In Touch</span>
            </h2>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 space-y-4">
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                Feel free to connect regarding engineering roles, consulting, or technical collaborations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {email && (
                  <motion.a
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/60 text-xs text-zinc-300 hover:text-white transition group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                      <Mail size={14} />
                    </div>
                    <div className="truncate">
                      <p className="text-[10px] text-zinc-500 uppercase">Email</p>
                      <p className="font-semibold text-white truncate">{email}</p>
                    </div>
                  </motion.a>
                )}

                {phone && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-800/40 border border-zinc-700/60 text-xs text-zinc-300">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Phone size={14} />
                    </div>
                    <div className="truncate">
                      <p className="text-[10px] text-zinc-500 uppercase">Phone</p>
                      <p className="font-semibold text-white truncate">{phone}</p>
                    </div>
                  </div>
                )}

                {linkedin && (
                  <motion.a
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/60 text-xs text-zinc-300 hover:text-white transition group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                      <FaLinkedin size={14} />
                    </div>
                    <div className="truncate">
                      <p className="text-[10px] text-zinc-500 uppercase">LinkedIn</p>
                      <p className="font-semibold text-white truncate">Profile</p>
                    </div>
                  </motion.a>
                )}

                {github && (
                  <motion.a
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    href={github.startsWith("http") ? github : `https://${github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/60 text-xs text-zinc-300 hover:text-white transition group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0">
                      <FaGithub size={14} />
                    </div>
                    <div className="truncate">
                      <p className="text-[10px] text-zinc-500 uppercase">GitHub</p>
                      <p className="font-semibold text-white truncate">Repositories</p>
                    </div>
                  </motion.a>
                )}

                {website && (
                  <motion.a
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    href={website.startsWith("http") ? website : `https://${website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/60 text-xs text-zinc-300 hover:text-white transition group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Globe size={14} />
                    </div>
                    <div className="truncate">
                      <p className="text-[10px] text-zinc-500 uppercase">Website</p>
                      <p className="font-semibold text-white truncate">{website.replace(/^https?:\/\//, "")}</p>
                    </div>
                  </motion.a>
                )}
              </div>
            </div>
          </motion.section>
        )}

        {/* Footer */}
        <footer className="pt-12 text-center text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} {displayName} • Multi-Device Responsive Template</p>
        </footer>
      </motion.div>

      <ProjectDeepDiveModal
        project={inspectedProject}
        onClose={() => setInspectedProject(null)}
        accentColor="#a855f7"
      />
    </div>
  );
};

export default ResponsiveTemplate;
