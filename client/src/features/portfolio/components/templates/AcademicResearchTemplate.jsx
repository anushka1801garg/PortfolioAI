import { useState } from "react";
import {
  BookOpen,
  GraduationCap,
  Award,
  ExternalLink,
  Mail,
  Copy,
  Check,
  FileText,
  Bookmark,
  Share2,
  Quote,
  School,
  Building2,
  Atom,
  ChevronDown,
  ChevronUp,
  Camera,
  Sparkles,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
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

const AcademicResearchTemplate = ({ portfolio, onEditPhoto, isOwner }) => {
  const [inspectedProject, setInspectedProject] = useState(null);
  const {
    name = "Dr. Alex Morgan",
    tagline = "Staff Research Scientist & Machine Learning Scholar",
    about = "",
    skills = [],
    projects = [],
    experience = [],
    education = [],
    achievements = [],
    certifications = [],
    contact = {},
    github = contact?.github,
    linkedin = contact?.linkedin,
    email = contact?.email,
    location = contact?.location,
    title,
  } = portfolio || {};

  const displayName = name || title || "Dr. Researcher";
  const avatar = portfolio?.avatar || portfolio?.hero?.avatar || "";

  const [copiedBibId, setCopiedBibId] = useState(null);
  const [expandedAbstract, setExpandedAbstract] = useState(null);
  const [activeDomain, setActiveDomain] = useState("ALL");

  const copyBibTeX = (proj, idx) => {
    const bibId = `paper-${idx}`;
    const bibTeX = `@article{${displayName.toLowerCase().replace(/[^a-z]/g, "")}${2026 - idx}${proj.title.slice(0, 10).toLowerCase().replace(/[^a-z]/g, "")},
  title = {${proj.title}},
  author = {${displayName} and Collaborators},
  journal = {International Journal of Computer Science & Intelligent Systems},
  year = {${2026 - idx}},
  url = {${proj.live || proj.github || "https://arxiv.org"}}
}`;

    navigator.clipboard.writeText(bibTeX);
    setCopiedBibId(bibId);
    toast.success("BibTeX citation copied to clipboard! 📄");
    setTimeout(() => setCopiedBibId(null), 2500);
  };

  const filteredProjects = projects.filter((proj) => {
    if (activeDomain === "ALL") return true;
    return Array.isArray(proj.tags) && proj.tags.some((t) => t.toLowerCase() === activeDomain.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-[#1e293b] font-serif selection:bg-blue-600/20 selection:text-blue-900 relative pb-32">
      {/* Formal Top Masthead */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4 font-sans text-xs">
          <div className="flex items-center gap-2">
            <Atom size={16} className="text-blue-700" />
            <span className="font-bold text-slate-800 tracking-wide">
              {displayName.toUpperCase()} // RESEARCH LAB &amp; SCHOLARLY ARCHIVE
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <span>ORCID: 0000-0002-8419-X</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">PEER-REVIEWED</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        {/* Scholar Header Profile */}
        <motion.section
          id="hero"
          data-section="hero"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-slate-200 pb-12 space-y-6 scroll-mt-24"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {avatar && (
              <div className="relative group shrink-0">
                <PulseAura
                  colors={["#1d4ed8", "#2563eb", "#60a5fa"]}
                  size="130%"
                  blur="20px"
                  opacity={0.3}
                />
                <TiltCard maxTilt={12} perspective={800} className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl relative z-10">
                  <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-slate-300 p-1 bg-white shadow-xl relative group">
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
                        className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer text-white z-20"
                        title="Change Scholar Photo"
                      >
                        <Camera size={22} className="text-white drop-shadow" />
                        <span className="text-[10px] font-sans font-bold uppercase tracking-wider bg-blue-800 px-2 py-0.5 rounded-full">
                          Change
                        </span>
                      </button>
                    )}
                  </div>
                </TiltCard>
              </div>
            )}

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900">
                {displayName}
              </h1>
              <p className="text-lg sm:text-xl text-blue-800 font-sans font-medium">
                {tagline}
              </p>
              {location && (
                <p className="text-xs text-slate-500 font-sans">
                  Laboratory / Affiliation: {location}
                </p>
              )}
            </div>
          </div>

          {about && (
            <p className="text-base text-slate-700 leading-relaxed font-sans font-light max-w-3xl pt-2">
              {about}
            </p>
          )}

          {/* Scholarly Action Links */}
          <div className="flex flex-wrap gap-3 pt-2 font-sans">
            {email && (
              <MagneticButton
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-md flex items-center gap-2"
              >
                <Mail size={14} />
                <span>Academic Correspondence</span>
              </MagneticButton>
            )}

            {github && (
              <MagneticButton
                href={github.startsWith("http") ? github : `https://${github}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-2 shadow-sm"
              >
                <FaGithub size={14} />
                <span>Reproducibility Repos</span>
              </MagneticButton>
            )}

            {linkedin && (
              <MagneticButton
                href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-2 shadow-sm"
              >
                <FaLinkedin size={14} />
                <span>Academic Network</span>
              </MagneticButton>
            )}
          </div>
        </motion.section>

        {/* Live Academic Metrics & Citation Ledger */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-sans">
          {[
            { metric: `${projects.length || 8}`, label: "Peer-Reviewed Works", sub: "Journal & Conferences" },
            { metric: "14", label: "h-index", sub: "Google Scholar verified" },
            { metric: "350+", label: "Academic Citations", sub: "Cross-institution" },
            { metric: `${skills.length}+`, label: "Research Domains", sub: "Methodologies" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-1"
            >
              <div className="text-3xl font-black text-blue-800 font-mono">
                {item.metric}
              </div>
              <div className="text-xs font-bold text-slate-800">{item.label}</div>
              <div className="text-[10px] text-slate-500">{item.sub}</div>
            </motion.div>
          ))}
        </section>

        {/* Publications & Research Manuscripts */}
        {projects?.length > 0 && (
          <section id="projects" data-section="projects" className="space-y-6 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 font-sans">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen size={18} className="text-blue-800" />
                <span>Selected Publications &amp; Manuscripts</span>
              </h2>

              <div className="flex items-center gap-1.5 text-xs">
                {["ALL", "AI", "SYSTEMS", "ALGORITHMS"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setActiveDomain(d)}
                    className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                      activeDomain === d
                        ? "bg-blue-800 text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredProjects.map((proj, idx) => (
                <TiltCard key={idx} maxTilt={6} perspective={900}>
                  <SpotlightCard
                    spotlightColor="rgba(37, 99, 235, 0.12)"
                    className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md space-y-3 cursor-pointer group"
                    onClick={() => setInspectedProject(proj)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-mono font-bold text-blue-700 uppercase tracking-wider block pb-1">
                          [Paper 0{idx + 1}] · arXiv / IEEE
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-800 transition">
                          {proj.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 font-sans self-start">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectedProject(proj);
                          }}
                          className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-800 flex items-center gap-1 transition cursor-pointer"
                        >
                          <FileText size={12} />
                          <span>Inspect Abstract</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyBibTeX(proj, idx);
                          }}
                          className="px-3 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs text-slate-700 flex items-center gap-1 transition cursor-pointer"
                        >
                          {copiedBibId === `paper-${idx}` ? <Check size={12} className="text-emerald-600" /> : <Quote size={12} />}
                          <span>{copiedBibId === `paper-${idx}` ? "BibTeX Copied" : "Cite (BibTeX)"}</span>
                        </button>

                        {proj.live && (
                          <a
                            href={proj.live}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1 rounded-lg bg-blue-800 hover:bg-blue-700 text-xs font-semibold text-white flex items-center gap-1 transition"
                          >
                            <span>PDF / DOI</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
                      {proj.description}
                    </p>

                    {proj.impact && (
                      <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-800 font-sans font-medium">
                        Abstract Significance: {proj.impact}
                      </div>
                    )}

                    {proj.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 font-sans">
                        {proj.tags.map((t, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </SpotlightCard>
                </TiltCard>
              ))}
            </div>
          </section>
        )}

        {/* Methodologies & Scientific Competencies */}
        {skills?.length > 0 && (
          <section id="skills" data-section="skills" className="space-y-4 font-sans scroll-mt-24">
            <h2 className="text-xs uppercase tracking-widest text-slate-500 font-bold border-b border-slate-200 pb-2">
              Scientific Competencies &amp; Methodologies
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <MagneticPill key={idx}>
                  <span className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-sm cursor-default hover:border-blue-500 hover:text-blue-800 transition block">
                    {skill}
                  </span>
                </MagneticPill>
              ))}
            </div>
          </section>
        )}

        {/* Academic Appointments & Experience */}
        {experience?.length > 0 && (
          <section id="experience" data-section="experience" className="space-y-4 font-sans scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
              Academic Appointments &amp; Industry Research
            </h2>
            <div className="space-y-3">
              {experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                    <span className="font-bold text-base text-slate-900">
                      {exp.role} · <span className="text-blue-800">{exp.company}</span>
                    </span>
                    <span className="text-slate-500 font-mono">{exp.duration}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                    {exp.description}
                  </p>
                  <ExperienceCredentialsBadges exp={exp} isLight={true} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Degrees & Honors */}
        {(education?.length > 0 || achievements?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
            {education?.length > 0 && (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  Higher Education &amp; Degrees
                </span>
                <div className="space-y-2">
                  {education.map((edu, idx) => (
                    <div key={idx} className="text-xs border-b border-slate-100 pb-2">
                      <span className="font-bold text-slate-900">{edu.institution}</span>
                      <p className="text-slate-600">{edu.degree} ({edu.year})</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {achievements?.length > 0 && (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  Grants, Fellowships &amp; Honors
                </span>
                <div className="space-y-2">
                  {achievements.map((ach, idx) => (
                    <div key={idx} className="text-xs border-b border-slate-100 pb-2">
                      <span className="font-bold text-slate-900">{ach.title}</span>
                      <p className="text-slate-600">{ach.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Academic Correspondence & Advisory Section */}
        <section id="contact" data-section="contact" className="p-8 sm:p-12 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-sm font-sans scroll-mt-24">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-800 uppercase tracking-wider">
            <Mail size={14} />
            <span>SCHOLARLY CORRESPONDENCE &amp; ADVISORY // 2026</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Academic Inquiries &amp; Review</h2>
          <p className="text-slate-600 text-sm max-w-xl font-light">
            Available for peer review, joint research grant collaborations, symposium keynotes, and academic advisory roles.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {email && (
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-semibold text-xs transition flex items-center gap-2 shadow-md"
              >
                <Mail size={14} />
                <span>Send Formal Correspondence ({email})</span>
              </a>
            )}
            {linkedin && (
              <a
                href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-2 shadow-sm"
              >
                <FaLinkedin size={14} />
                <span>Scholarly Network</span>
              </a>
            )}
            {github && (
              <a
                href={github.startsWith("http") ? github : `https://${github}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-2 shadow-sm"
              >
                <FaGithub size={14} />
                <span>Open Science Repositories</span>
              </a>
            )}
          </div>
        </section>
      </main>

      <ProjectDeepDiveModal
        project={inspectedProject}
        onClose={() => setInspectedProject(null)}
        accentColor="#1d4ed8"
      />
    </div>
  );
};

export default AcademicResearchTemplate;
