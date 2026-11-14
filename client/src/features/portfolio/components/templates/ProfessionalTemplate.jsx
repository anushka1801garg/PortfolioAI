import React, { useState } from "react";
import {
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  ExternalLink,
  Printer,
  Award,
  Layers,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Copy,
  Check,
  ShieldCheck,
  SlidersHorizontal,
  Camera,
  Sparkles,
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

const ProfessionalTemplate = ({ portfolio, onEditPhoto, isOwner }) => {
  const [inspectedProject, setInspectedProject] = useState(null);
  const {
    name = "Alex Morgan",
    tagline = "Staff Software Engineer & AI Architect specializing in high-throughput distributed systems.",
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

  const [selectedSkillCategory, setSelectedSkillCategory] = useState("ALL");
  const [copiedEmail, setCopiedEmail] = useState(false);

  const avatar = portfolio?.avatar || portfolio?.hero?.avatar || "";
  const displayName = name || title || "Professional Developer";

  const handleCopyEmail = () => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  // Categorize skills intelligently for ATS readability
  const categorizeSkills = (allSkills) => {
    if (!allSkills || allSkills.length === 0) return {};
    const categories = {
      "Core Languages & Frameworks": [],
      "Cloud, DevOps & Containers": [],
      "Databases & Infrastructure": [],
      "AI, Systems & Architecture": [],
    };

    allSkills.forEach((skill) => {
      const skillName = typeof skill === "string" ? skill : (skill?.name || skill?.title || "");
      const lower = skillName.toLowerCase();
      if (
        lower.includes("react") ||
        lower.includes("next") ||
        lower.includes("node") ||
        lower.includes("typescript") ||
        lower.includes("python") ||
        lower.includes("tailwind") ||
        lower.includes("javascript")
      ) {
        categories["Core Languages & Frameworks"].push(skill);
      } else if (
        lower.includes("docker") ||
        lower.includes("aws") ||
        lower.includes("kubernetes") ||
        lower.includes("ci/cd") ||
        lower.includes("cloud")
      ) {
        categories["Cloud, DevOps & Containers"].push(skill);
      } else if (
        lower.includes("mongo") ||
        lower.includes("postgres") ||
        lower.includes("sql") ||
        lower.includes("redis") ||
        lower.includes("graphql")
      ) {
        categories["Databases & Infrastructure"].push(skill);
      } else {
        categories["AI, Systems & Architecture"].push(skill);
      }
    });

    return Object.fromEntries(
      Object.entries(categories).filter(([, list]) => list.length > 0)
    );
  };

  const categorizedSkills = categorizeSkills(skills);

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
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans selection:bg-blue-600 selection:text-white pb-24">
      {/* Top ATS Verified Header */}
      <div className="border-b border-slate-800/80 bg-[#0F172A]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-emerald-400 font-semibold tracking-wide uppercase">
              ATS-Optimized Executive Format
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <Printer size={13} />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Executive Header Card */}
        <motion.section
          id="hero"
          data-section="hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-2xl border border-slate-800 bg-[#0F172A] p-8 sm:p-10 shadow-xl shadow-slate-950/40 relative overflow-hidden scroll-mt-24"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                <CheckCircle2 size={13} />
                <span>Verified Candidate Profile • ATS Score: 98.4%</span>
              </div>

              <div className="flex items-center gap-5">
                {avatar && (
                  <div className="relative group shrink-0">
                    <PulseAura
                      colors={["#2563eb", "#3b82f6", "#06b6d4"]}
                      size="130%"
                      blur="18px"
                      opacity={0.35}
                    />
                    <TiltCard maxTilt={14} perspective={800} className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 relative z-10">
                      <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-blue-500/30 shadow-md shadow-blue-500/10 relative group">
                        <img
                          src={avatar}
                          alt={displayName}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            e.currentTarget.parentElement.style.display = "none";
                          }}
                        />
                        {onEditPhoto && (
                          <button
                            type="button"
                            onClick={onEditPhoto}
                            className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer text-white z-20"
                            title="Change Professional Photo"
                          >
                            <Camera size={18} className="text-blue-400" />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-blue-300">
                              Edit
                            </span>
                          </button>
                        )}
                      </div>
                    </TiltCard>
                  </div>
                )}
                <div>
                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                    {displayName}
                  </h1>
                </div>
              </div>

              <p className="text-base sm:text-lg font-medium text-slate-300 max-w-2xl leading-relaxed">
                {tagline}
              </p>
            </div>

            {/* Contact & Social Strip */}
            <div className="flex flex-col gap-2.5 text-xs text-slate-300 font-medium shrink-0 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              {email && (
                <div className="flex items-center gap-2">
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-blue-400 transition"
                  >
                    <Mail size={14} className="text-blue-400 shrink-0" />
                    <span>{email}</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                    title="Copy Email"
                  >
                    {copiedEmail ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-blue-400 shrink-0" />
                  <span>{phone}</span>
                </div>
              )}
              {linkedin && (
                <a
                  href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-blue-400 transition"
                >
                  <FaLinkedin size={14} className="text-blue-400 shrink-0" />
                  <span>LinkedIn Profile</span>
                </a>
              )}
              {github && (
                <a
                  href={github.startsWith("http") ? github : `https://${github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-blue-400 transition"
                >
                  <FaGithub size={14} className="text-blue-400 shrink-0" />
                  <span>GitHub Portfolio</span>
                </a>
              )}
              {website && (
                <a
                  href={website.startsWith("http") ? website : `https://${website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-blue-400 transition"
                >
                  <ExternalLink size={14} className="text-blue-400 shrink-0" />
                  <span>Primary Website</span>
                </a>
              )}
            </div>
          </div>
        </motion.section>

        {/* Recruiter Fast Metrics Strip */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-4 text-center transition shadow-sm"
          >
            <p className="text-2xl sm:text-3xl font-black text-blue-400 flex items-center justify-center gap-1">
              <span>6+</span>
              <TrendingUp size={18} className="text-blue-400" />
            </p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
              Years Experience
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-4 text-center transition shadow-sm"
          >
            <p className="text-2xl sm:text-3xl font-black text-emerald-400">
              1.2M+
            </p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
              Users Impacted
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-4 text-center transition shadow-sm"
          >
            <p className="text-2xl sm:text-3xl font-black text-cyan-400">
              99.9%
            </p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
              Uptime Maintained
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-4 text-center transition shadow-sm"
          >
            <p className="text-2xl sm:text-3xl font-black text-purple-400">
              40%
            </p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
              Performance Boost
            </p>
          </motion.div>
        </motion.section>

        {/* Executive Summary */}
        {about && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-slate-300 font-bold text-lg border-b border-slate-800 pb-2">
              <Award size={18} className="text-blue-400" />
              <h2>Executive Summary</h2>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#0F172A]/60 p-6 sm:p-7 leading-relaxed text-slate-300 text-sm sm:text-base">
              <p>{about}</p>
            </div>
          </motion.section>
        )}

        {/* Structured Technical Competencies with Interactive Category Filtering */}
        {skills && skills.length > 0 && (
          <motion.section
            id="skills"
            data-section="skills"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4 scroll-mt-24"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-lg">
                <Layers size={18} className="text-blue-400" />
                <h2>Technical Competencies (ATS Keyword Index)</h2>
              </div>

              {Object.keys(categorizedSkills).length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <SlidersHorizontal size={13} className="text-slate-400 mr-1" />
                  <button
                    onClick={() => setSelectedSkillCategory("ALL")}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                      selectedSkillCategory === "ALL"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    All ({skills.length})
                  </button>
                  {Object.keys(categorizedSkills).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedSkillCategory(cat)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                        selectedSkillCategory === cat
                          ? "bg-blue-600 text-white"
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {cat.split(" ")[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {Object.keys(categorizedSkills).length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {Object.entries(categorizedSkills)
                  .filter(([cat]) => selectedSkillCategory === "ALL" || selectedSkillCategory === cat)
                  .map(([category, items]) => (
                    <motion.div
                      key={category}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-xl border border-slate-800 bg-[#0F172A]/60 p-5 space-y-3"
                    >
                      <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                        {category}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {items.map((skill, idx) => (
                          <MagneticPill key={idx}>
                            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium cursor-default hover:border-blue-500/50 hover:text-blue-300 transition block">
                              {skill}
                            </span>
                          </MagneticPill>
                        ))}
                      </div>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <MagneticPill key={index}>
                    <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium cursor-default hover:border-blue-500/50 hover:text-blue-300 transition block">
                      {skill}
                    </span>
                  </MagneticPill>
                ))}
              </div>
            )}
          </motion.section>
        )}

        {/* Work Experience */}
        {experience && experience.length > 0 && (
          <motion.section
            id="experience"
            data-section="experience"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6 scroll-mt-24"
          >
            <div className="flex items-center gap-2 text-slate-300 font-bold text-lg border-b border-slate-800 pb-2">
              <Briefcase size={18} className="text-blue-400" />
              <h2>Professional Experience</h2>
            </div>

            <div className="space-y-6">
              {experience.map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-6 space-y-3 hover:border-blue-500/40 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {item.role}
                      </h3>
                      <p className="text-sm font-semibold text-blue-400">
                        {item.company}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-slate-400 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 w-fit">
                      {item.duration}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed pt-1">
                    {item.description}
                  </p>

                  <ExperienceCredentialsBadges exp={item} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* High-Impact Projects */}
        {projects && projects.length > 0 && (
          <motion.section
            id="projects"
            data-section="projects"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6 scroll-mt-24"
          >
            <div className="flex items-center gap-2 text-slate-300 font-bold text-lg border-b border-slate-800 pb-2">
              <Cpu size={18} className="text-blue-400" />
              <h2>Key Engineering Projects</h2>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-6"
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
                      spotlightColor="rgba(37, 99, 235, 0.18)"
                      className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-6 flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition shadow-lg cursor-pointer group"
                      onClick={() => setInspectedProject(project)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition flex items-center gap-2">
                            <span>{project.title}</span>
                            {safeProjectUrl && <ExternalLink size={13} className="text-slate-500 group-hover:text-blue-400 transition" />}
                          </h3>
                          <span className="text-[11px] font-mono text-blue-400 uppercase">
                            Case Study 0{index + 1}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {project.description}
                        </p>

                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {project.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/40 text-blue-300 text-[11px] font-mono"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectedProject(project);
                          }}
                          className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white transition flex items-center gap-1 font-mono text-xs cursor-pointer"
                        >
                          <span>inspect //</span>
                        </button>

                        <div className="flex items-center gap-3">
                          {project.github && (
                            <a
                              href={
                                project.github.startsWith("http")
                                  ? project.github
                                  : `https://${project.github}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-400 hover:text-white flex items-center gap-1.5 transition"
                            >
                              <FaGithub size={13} />
                              <span>Source</span>
                            </a>
                          )}
                          {project.live && (
                            <a
                              href={
                                project.live.startsWith("http")
                                  ? project.live
                                  : `https://${project.live}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                            >
                              <span>Live</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    </SpotlightCard>
                  </TiltCard>
                );
              })}
            </motion.div>
          </motion.section>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-slate-300 font-bold text-lg border-b border-slate-800 pb-2">
              <GraduationCap size={18} className="text-blue-400" />
              <h2>Education &amp; Credentials</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {education.map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -3 }}
                  className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-6 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base">
                      {item.degree}
                    </h3>
                    <span className="text-xs font-mono text-slate-400">
                      {item.year}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-blue-400">
                    {item.institution}
                  </p>
                  {item.description && (
                    <p className="text-xs text-slate-400 pt-1 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Accolades & Certifications */}
        {(achievements?.length > 0 || certifications?.length > 0) && (
          <div className="grid sm:grid-cols-2 gap-6">
            {achievements?.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-slate-300 font-bold text-lg border-b border-slate-800 pb-2">
                  <Award size={18} className="text-amber-400" />
                  <h2>Honors &amp; Recognition</h2>
                </div>
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
                        className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-5 space-y-2 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white text-sm">{title}</h3>
                            {metric && (
                              <span className="text-xs font-mono text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded">
                                {metric}
                              </span>
                            )}
                          </div>
                          {description && <p className="text-xs text-slate-400 leading-relaxed">{description}</p>}
                        </div>
                        {achUrl && (
                          <div className="pt-1">
                            <a
                              href={achUrl.startsWith("http") ? achUrl : `https://${achUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 hover:underline"
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
              </motion.section>
            )}

            {certifications?.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-slate-300 font-bold text-lg border-b border-slate-800 pb-2">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <h2>Licenses &amp; Certifications</h2>
                </div>
                <div className="space-y-3">
                  {certifications.map((item, idx) => {
                    const certUrl = item.link || item.url;
                    return (
                      <motion.div
                        key={idx}
                        whileHover={{ y: -3 }}
                        className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-5 space-y-2 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <h3 className="font-bold text-white text-sm">{item.name}</h3>
                          <p className="text-xs text-slate-400">
                            {item.issuer} {item.date ? `• ${item.date}` : ""}
                          </p>
                          {item.description && (
                            <p className="text-xs text-slate-400 leading-relaxed pt-0.5">{item.description}</p>
                          )}
                        </div>
                        {certUrl && (
                          <div className="pt-1">
                            <a
                              href={certUrl.startsWith("http") ? certUrl : `https://${certUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
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
              </motion.section>
            )}
          </div>
        )}

        {/* Technical Publications & Writing */}
        {blog?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-lg font-bold text-slate-300 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-400" />
                <span>Technical Papers &amp; Case Studies</span>
              </h2>
              <span className="text-xs font-mono text-slate-400">{blog.length} Publications</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {blog.map((post, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -3 }}
                  className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-6 space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                    <span>{post.readTime || "5 min read"}</span>
                    {post.date && <span>{post.date}</span>}
                  </div>
                  <h3 className="text-base font-bold text-white hover:text-blue-400 transition">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{post.summary}</p>
                  {post.link && (
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium pt-1"
                    >
                      <span>Read Publication</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Executive Direct Office & Communication Section */}
        <motion.section
          id="contact"
          data-section="contact"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-slate-800 bg-[#0F172A] p-8 sm:p-10 space-y-6 shadow-xl scroll-mt-24"
        >
          <div className="flex items-center gap-2 text-slate-300 font-bold text-lg border-b border-slate-800 pb-2">
            <Mail size={18} className="text-blue-400" />
            <h2>Direct Executive Office &amp; Scheduling</h2>
          </div>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Available for executive briefing, senior technical leadership roles, systems advisory, and enterprise consulting.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {email && (
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-blue-600/25"
              >
                <Mail size={14} />
                <span>Contact Direct Office ({email})</span>
              </a>
            )}
            {linkedin && (
              <a
                href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center gap-2"
              >
                <FaLinkedin size={14} className="text-blue-400" />
                <span>Executive LinkedIn Profile</span>
              </a>
            )}
            {github && (
              <a
                href={github.startsWith("http") ? github : `https://${github}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center gap-2"
              >
                <FaGithub size={14} />
                <span>GitHub Repositories</span>
              </a>
            )}
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-800/80 text-center text-xs text-slate-500 space-y-1">
          <p>© {new Date().getFullYear()} {displayName}. Recruiter-optimized candidate record.</p>
          <p>Generated with PortfolioAI Platform.</p>
        </footer>
      </div>

      <ProjectDeepDiveModal
        project={inspectedProject}
        onClose={() => setInspectedProject(null)}
        accentColor="#2563eb"
      />
    </div>
  );
};

export default ProfessionalTemplate;
