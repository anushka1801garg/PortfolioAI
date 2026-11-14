import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  Globe,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Clock,
  LayoutGrid,
  List,
  Check,
  Camera,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  ScrollReveal,
  TiltCard,
  ShimmerText,
  MagneticButton,
  MagneticPill,
  ProjectDeepDiveModal,
  Perspective3DCard,
  InteractiveCursorFollower,
  KineticMarquee,
  KineticWordReveal,
  ExperienceCredentialsBadges,
  DiffThemeBanner,
} from "./motionComponents";

const MinimalTemplate = ({ portfolio, onEditPhoto, isOwner }) => {
  const {
    name = "Developer",
    tagline = "Software Engineer & Systems Architect",
    about = "",
    skills = [],
    projects = [],
    experience = [],
    education = [],
    achievements = [],
    certifications = [],
    github,
    linkedin,
    website,
    email,
    phone,
    location,
    title,
    contact = {},
  } = portfolio || {};

  const userEmail = email || contact?.email;
  const userPhone = phone || contact?.phone;
  const userGithub = github || contact?.github;
  const userLinkedin = linkedin || contact?.linkedin;
  const userWebsite = website || contact?.website;
  const userLocation = location || contact?.location || "Global / Remote";
  const displayName = name || title || "Developer";
  const avatar = portfolio?.avatar || portfolio?.hero?.avatar || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // View Mode: "GRID" | "CATALOG"
  const [viewMode, setViewMode] = useState("GRID");
  const [swissTime, setSwissTime] = useState("");
  const [copied, setCopied] = useState(false);
  const [inspectedProject, setInspectedProject] = useState(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setSwissTime(
        now.toLocaleTimeString("de-CH", {
          timeZone: "Europe/Zurich",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const copyEmail = () => {
    if (!userEmail) return;
    navigator.clipboard?.writeText(userEmail);
    setCopied(true);
    toast.success("Swiss index correspondence copied! 📮");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#111111] font-sans selection:bg-[#E11D48] selection:text-white antialiased pb-32">
      <InteractiveCursorFollower color="rgba(225, 29, 72, 0.08)" size={420} blur={80} />

      {/* Top Swiss Architectural Masthead */}
      <header className="border-b-2 border-black px-6 sm:px-12 py-5 bg-[#F5F5F0]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-700">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] animate-pulse" />
            <span className="text-black">SWISS TYPOGRAPHY 2026 // {displayName.toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 font-mono">
              <Clock size={13} className="text-[#E11D48]" />
              <span>ZRH CLOCK: {swissTime || "12:00:00"}</span>
            </div>

            {/* Layout Mode Switcher */}
            <div className="flex items-center border-2 border-black p-0.5 bg-white shadow-[2px_2px_0px_0px_#000]">
              <button
                onClick={() => setViewMode("GRID")}
                className={`p-1 transition cursor-pointer ${
                  viewMode === "GRID" ? "bg-black text-white" : "text-black hover:bg-zinc-100"
                }`}
                title="Grid View"
              >
                <LayoutGrid size={13} />
              </button>
              <button
                onClick={() => setViewMode("CATALOG")}
                className={`p-1 transition cursor-pointer ${
                  viewMode === "CATALOG" ? "bg-black text-white" : "text-black hover:bg-zinc-100"
                }`}
                title="Catalog List View"
              >
                <List size={13} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Swiss Architectural Kinetic Marquee Ribbon */}
      <div className="border-b-2 border-black bg-black text-white py-2 overflow-hidden select-none">
        <KineticMarquee
          items={skills.length > 0 ? skills : ["ARCHITECTURE", "SYSTEMS", "TYPOGRAPHY", "MINIMALISM", "PRECISION"]}
          speed={22}
          renderItem={(skill, idx) => (
            <span key={idx} className="inline-flex items-center gap-3 px-4 font-mono font-black text-xs tracking-widest uppercase">
              <span className="text-[#E11D48]">■</span>
              <span>{typeof skill === "string" ? skill : skill.name}</span>
            </span>
          )}
        />
      </div>

      <main className="max-w-6xl mx-auto px-6 sm:px-12 py-12 space-y-24">
        {/* Swiss Hero Block with 3D Tilt Card and Sharp Editorial Shadows */}
        <ScrollReveal direction="up" immediate={true}>
          <section id="hero" data-section="about" className="border-b-2 border-black pb-14 space-y-8 scroll-mt-24">
            {/* AI Theme Optimization Banner (in diff mode) */}
            {portfolio?._showDiff && (portfolio?._isTemplateAIHighlighted || portfolio?._aiOriginalTemplate) && (
              <DiffThemeBanner
                originalTemplate={portfolio._aiOriginalTemplate || "Modern"}
                suggestedTemplate="Minimal Brutalist"
                className="mb-4"
              />
            )}

            <div className="flex flex-wrap items-center gap-3">
              <motion.span
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-block px-3 py-1 bg-black text-white text-[11px] font-mono font-bold tracking-widest uppercase shadow-[3px_3px_0px_0px_#E11D48]"
              >
                [INDEX 00] • ARCHITECTURAL PORTFOLIO SPECIFICATION
              </motion.span>
              <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
                LOC: {userLocation}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  {/* Avatar with TiltCard & Brutalist Drop Shadow */}
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <TiltCard maxTilt={14}>
                      <div className="relative w-28 h-28 sm:w-36 sm:h-36 border-2 border-black p-1 bg-white shrink-0 shadow-[6px_6px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#E11D48] transition-all group">
                        <div className="w-full h-full bg-zinc-100 flex items-center justify-center overflow-hidden relative">
                          {avatar ? (
                            <motion.img
                              src={avatar}
                              alt={displayName}
                              whileHover={{ scale: 1.06 }}
                              transition={{ duration: 0.3 }}
                              className="w-full h-full object-cover filter grayscale contrast-125"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                if (e.currentTarget.nextElementSibling) {
                                  e.currentTarget.nextElementSibling.style.display = "flex";
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full items-center justify-center text-4xl sm:text-5xl font-black text-black ${
                              avatar ? "hidden" : "flex"
                            }`}
                          >
                            {initials}
                          </div>

                          {onEditPhoto && (
                            <button
                              type="button"
                              onClick={onEditPhoto}
                              className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-white z-30"
                            >
                              <Camera size={24} className="text-[#E11D48]" />
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#E11D48] px-2 py-0.5 shadow">
                                Change
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </TiltCard>

                    {onEditPhoto && (
                      <button
                        type="button"
                        onClick={onEditPhoto}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-black text-[10px] font-mono font-bold uppercase text-black hover:bg-black hover:text-white transition cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                      >
                        <Camera size={11} className="text-[#E11D48]" />
                        <span>Change Photo</span>
                      </button>
                    )}
                  </div>

                  <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-black uppercase leading-[0.9]">
                    {displayName}
                  </h1>
                </div>

                {portfolio?._isTaglineAIHighlighted && portfolio?._showDiff && portfolio?._aiOriginalTagline ? (
                  <div className="space-y-2 my-2 max-w-2xl font-mono text-xs">
                    <div className="p-3 border-2 border-rose-600 bg-rose-50 text-rose-900 shadow-[3px_3px_0px_0px_#e11d48]">
                      <span className="font-bold uppercase tracking-wider block mb-1">
                        ❌ BEFORE (ORIGINAL TAGLINE)
                      </span>
                      <p className="line-through text-xs font-sans">
                        {portfolio._aiOriginalTagline}
                      </p>
                    </div>
                    <div className="p-3 border-2 border-emerald-600 bg-emerald-50 text-emerald-950 shadow-[3px_3px_0px_0px_#059669]">
                      <span className="font-bold uppercase tracking-wider flex items-center gap-1 mb-1 text-emerald-800">
                        <Sparkles size={11} />
                        <span>✅ AFTER (AI OPTIMIZED TAGLINE)</span>
                      </span>
                      <p className="font-bold text-sm sm:text-base font-sans">
                        {tagline}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xl sm:text-3xl text-zinc-900 font-extrabold max-w-2xl pt-2 leading-tight">
                    {tagline}
                  </p>
                )}

                {about && (
                  <div className="pt-2 max-w-2xl">
                    {portfolio?._isAboutAIHighlighted && portfolio?._showDiff && portfolio?._aiOriginalAbout ? (
                      <div className="space-y-2 font-mono text-xs">
                        <div className="p-3 border-2 border-rose-600 bg-rose-50 text-rose-900 shadow-[3px_3px_0px_0px_#e11d48]">
                          <span className="font-bold uppercase tracking-wider block mb-1">
                            ❌ BEFORE (ORIGINAL BIO)
                          </span>
                          <p className="line-through text-xs font-sans">
                            {portfolio._aiOriginalAbout}
                          </p>
                        </div>
                        <div className="p-3 border-2 border-emerald-600 bg-emerald-50 text-emerald-950 shadow-[3px_3px_0px_0px_#059669]">
                          <span className="font-bold uppercase tracking-wider flex items-center gap-1 mb-1 text-emerald-800">
                            <Sparkles size={11} />
                            <span>✅ AFTER (AI OPTIMIZED BIO)</span>
                          </span>
                          <p className="font-medium text-xs sm:text-sm font-sans leading-relaxed">
                            {about}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-sans">
                        {about}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Contact Swiss Block */}
              <div
                id="contact"
                data-section="contact"
                className="lg:col-span-4 border-2 border-black p-6 bg-white shadow-[6px_6px_0px_0px_#000] space-y-3 font-mono text-xs scroll-mt-24"
              >
                <span className="font-bold uppercase tracking-wider text-[#E11D48] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-ping" />
                  <span>DISPATCH // SOCKETS</span>
                </span>
                <p className="text-zinc-600 text-[11px] font-sans font-medium">
                  Available for engineering systems, high-scale architecture, and advisory.
                </p>

                <div className="pt-2 flex flex-col gap-2">
                  {userEmail && (
                    <MagneticButton>
                      <button
                        onClick={copyEmail}
                        className="w-full py-2.5 px-4 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#E11D48]"
                      >
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Mail size={14} />}
                        <span>{copied ? "COPIED TO BUFFER" : "TRANSMIT EMAIL"}</span>
                      </button>
                    </MagneticButton>
                  )}

                  <div className="flex gap-2">
                    {userGithub && (
                      <MagneticButton
                        href={userGithub.startsWith("http") ? userGithub : `https://${userGithub}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 border-2 border-black text-black hover:bg-black hover:text-white font-bold text-[11px] text-center uppercase transition shadow-[2px_2px_0px_0px_#000]"
                      >
                        GITHUB
                      </MagneticButton>
                    )}
                    {userLinkedin && (
                      <MagneticButton
                        href={userLinkedin.startsWith("http") ? userLinkedin : `https://${userLinkedin}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 border-2 border-black text-black hover:bg-black hover:text-white font-bold text-[11px] text-center uppercase transition shadow-[2px_2px_0px_0px_#000]"
                      >
                        LINKEDIN
                      </MagneticButton>
                    )}
                    {userWebsite && (
                      <MagneticButton
                        href={userWebsite.startsWith("http") ? userWebsite : `https://${userWebsite}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 border-2 border-black text-black hover:bg-black hover:text-white font-bold text-[11px] text-center uppercase transition shadow-[2px_2px_0px_0px_#000]"
                      >
                        WWW
                      </MagneticButton>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {about && (
              <div className="pt-6 border-t-2 border-black/10">
                <p className="text-lg text-zinc-800 font-medium max-w-3xl leading-relaxed">
                  {about}
                </p>
              </div>
            )}
          </section>
        </ScrollReveal>

        {/* Swiss Architectural Metrics Ribbon */}
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { val: `${projects.length}+`, label: "PRODUCTION ARTIFACTS", sub: "Modular Deployments" },
              { val: `${skills.length}+`, label: "CORE TECHNOLOGIES", sub: "Mastered Capabilities" },
              { val: "100%", label: "EDITORIAL RIGOR", sub: "Zero Unnecessary Code" },
              { val: "ZRH", label: "SWISS STANDARD", sub: "Precision Architecture" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="p-5 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] text-center space-y-1"
              >
                <div className="text-3xl font-black font-mono text-black">{stat.val}</div>
                <div className="text-xs font-bold uppercase text-[#E11D48] tracking-wider">
                  {stat.label}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* Selected Works (Projects) with Grid or Catalog mode */}
        {projects?.length > 0 && (
          <ScrollReveal delay={0.15}>
            <section id="projects" data-section="projects" className="space-y-6 scroll-mt-24">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold tracking-widest text-[#E11D48] uppercase block">
                    [INDEX 01] • VERIFIED PRODUCTION ARTIFACTS ({projects.length})
                  </span>
                  <p className="text-xs text-zinc-600 font-medium">
                    Click any artifact for comprehensive system case study
                  </p>
                </div>
                <span className="text-xs font-mono text-zinc-600 font-bold">
                  MODE: {viewMode}
                </span>
              </div>

              {viewMode === "GRID" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {projects.map((proj, idx) => (
                    <Perspective3DCard
                      key={idx}
                      maxTilt={8}
                      glareColor="rgba(225, 29, 72, 0.12)"
                      glowBorderColor="#000000"
                      onClick={() => setInspectedProject(proj)}
                      className={`p-8 border-2 bg-white transition-all space-y-4 flex flex-col justify-between cursor-pointer group ${
                        proj._isAIHighlighted
                          ? "border-[#E11D48] shadow-[8px_8px_0px_0px_#E11D48]"
                          : "border-black shadow-[6px_6px_0px_0px_#000] hover:shadow-[10px_10px_0px_0px_#E11D48]"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#E11D48] font-bold">
                            NO. 0{idx + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            {proj._isAIHighlighted && (
                              <span className="px-2 py-0.5 border border-black bg-emerald-100 text-emerald-950 font-bold text-[10px] flex items-center gap-1 shadow-[2px_2px_0px_0px_#000]">
                                <Sparkles size={10} className="text-emerald-700" />
                                <span>AI OPTIMIZED</span>
                              </span>
                            )}
                            <span className="font-bold text-black flex items-center gap-1 group-hover:text-[#E11D48] transition">
                              <span>INSPECT CASE STUDY</span>
                              <ArrowUpRight size={13} />
                            </span>
                          </div>
                        </div>

                        <h3 className="text-2xl font-black text-black uppercase tracking-tight group-hover:text-[#E11D48] transition-colors">
                          {proj.title}
                        </h3>

                        {proj._isAIHighlighted ? (
                          <div className="space-y-2 mt-1 font-mono text-xs">
                            {proj._showDiff && proj._aiOriginalDescription && (
                              <div className="p-3 border-2 border-rose-600 bg-rose-50 text-rose-900 shadow-[3px_3px_0px_0px_#e11d48]">
                                <span className="font-bold uppercase tracking-wider block mb-1">
                                  ❌ BEFORE (ORIGINAL DESCRIPTION)
                                </span>
                                <p className="line-through text-xs font-sans">
                                  {proj._aiOriginalDescription}
                                </p>
                              </div>
                            )}
                            <div className="p-3 border-2 border-emerald-600 bg-emerald-50 text-emerald-950 shadow-[3px_3px_0px_0px_#059669]">
                              <span className="font-bold uppercase tracking-wider flex items-center gap-1 mb-1 text-emerald-800">
                                <Sparkles size={11} />
                                <span>✅ AFTER (AI OPTIMIZED)</span>
                              </span>
                              <p className="font-medium text-xs sm:text-sm font-sans leading-relaxed">
                                {proj.description}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-zinc-700 leading-relaxed font-medium line-clamp-3">
                            {proj.description}
                          </p>
                        )}

                        {proj.impact && (
                          <div className="p-3 border-l-4 border-[#E11D48] bg-zinc-50 text-xs font-mono font-bold text-zinc-900">
                            BENCHMARK: {proj.impact}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 pt-4 border-t-2 border-black/10">
                        {proj.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 font-mono">
                            {proj.tags.map((t, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2.5 py-0.5 border border-black bg-zinc-100 font-bold text-black"
                              >
                                {t.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          {proj.github && (
                            <a
                              href={proj.github.startsWith("http") ? proj.github : `https://${proj.github}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs font-mono font-bold text-black hover:text-[#E11D48] transition flex items-center gap-1"
                            >
                              <FaGithub size={13} />
                              <span>SOURCE</span>
                            </a>
                          )}

                          {proj.live && (
                            <a
                              href={proj.live.startsWith("http") ? proj.live : `https://${proj.live}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="px-3 py-1 bg-black text-white hover:bg-[#E11D48] text-xs font-mono font-bold uppercase transition flex items-center gap-1 ml-auto shadow-[2px_2px_0px_0px_#000]"
                            >
                              <span>LIVE SITE</span>
                              <ArrowUpRight size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    </Perspective3DCard>
                  ))}
                </div>
              ) : (
                /* Catalog List Mode */
                <div className="border-2 border-black divide-y-2 divide-black bg-white shadow-[6px_6px_0px_0px_#000]">
                  {projects.map((proj, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 6 }}
                      onClick={() => setInspectedProject(proj)}
                      className="p-6 hover:bg-zinc-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-[#E11D48]">
                            0{idx + 1}
                          </span>
                          <h4 className="text-lg font-black uppercase text-black group-hover:text-[#E11D48] transition-colors">
                            {proj.title}
                          </h4>
                        </div>
                        <p className="text-xs text-zinc-600 max-w-xl font-medium">
                          {proj.description}
                        </p>
                      </div>

                      {proj.live && (
                        <a
                          href={proj.live}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-4 py-2 bg-black text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#E11D48] transition self-start sm:self-auto shrink-0 flex items-center gap-1 shadow-[2px_2px_0px_0px_#000]"
                        >
                          <span>INSPECT</span>
                          <ArrowUpRight size={12} />
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </ScrollReveal>
        )}

        {/* Stack Dependencies with Brutalist Magnetic Pills */}
        {skills?.length > 0 && (
          <ScrollReveal delay={0.15}>
            <section id="skills" data-section="skills" className="space-y-4 scroll-mt-24">
              <span className="text-xs font-mono font-bold tracking-widest text-[#E11D48] uppercase block border-b-2 border-black pb-2">
                [INDEX 02] • TECHNICAL FRAMEWORKS &amp; CAPABILITIES ({skills.length})
              </span>
              <div className="flex flex-wrap gap-2.5">
                {skills.map((skill, idx) => (
                  <motion.span
                    key={idx}
                    whileHover={{ scale: 1.08, y: -2 }}
                    className="px-4 py-2 border-2 border-black bg-white font-mono text-xs font-bold text-black uppercase shadow-[3px_3px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#E11D48] hover:border-[#E11D48] transition-all cursor-default"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Experience Timeline */}
        {experience?.length > 0 && (
          <ScrollReveal delay={0.2}>
            <section id="experience" data-section="experience" className="space-y-4 scroll-mt-24">
              <span className="text-xs font-mono font-bold tracking-widest text-[#E11D48] uppercase block border-b-2 border-black pb-2">
                [INDEX 03] • CAREER APPOINTMENTS &amp; TENURE
              </span>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ x: 6 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    className="p-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 font-mono">
                      <span className="font-black text-base uppercase text-black">
                        {exp.role} · <span className="text-[#E11D48]">{exp.company}</span>
                      </span>
                      <span className="text-zinc-600 font-bold px-2 py-0.5 bg-zinc-100 border border-black">
                        {exp.duration}
                      </span>
                    </div>
                    {portfolio?._showDiff && (exp._isAIHighlighted || exp._aiOriginalDescription) ? (
                      <div className="space-y-2 font-mono text-xs pt-1">
                        <div className="p-2.5 border-2 border-rose-600 bg-rose-50 text-rose-900 shadow-[2px_2px_0px_0px_#e11d48]">
                          <span className="font-bold uppercase tracking-wider block mb-0.5 text-[10px]">
                            ❌ BEFORE (ORIGINAL SUMMARY)
                          </span>
                          <p className="line-through text-xs font-sans">
                            {exp._aiOriginalDescription || "Original role responsibilities and accomplishments."}
                          </p>
                        </div>
                        <div className="p-2.5 border-2 border-emerald-600 bg-emerald-50 text-emerald-950 shadow-[2px_2px_0px_0px_#059669]">
                          <span className="font-bold uppercase tracking-wider flex items-center gap-1 mb-0.5 text-emerald-800 text-[10px]">
                            <Sparkles size={10} />
                            <span>✅ AFTER (AI ATS REWRITE)</span>
                          </span>
                          <p className="font-bold text-xs sm:text-sm font-sans">
                            {exp.description}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-zinc-700 font-medium leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                    <ExperienceCredentialsBadges exp={exp} isLight={true} />
                  </motion.div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Education & Credentials */}
        {(education?.length > 0 || achievements?.length > 0) && (
          <ScrollReveal delay={0.25}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {education?.length > 0 && (
                <div className="p-6 border-2 border-black bg-white shadow-[5px_5px_0px_0px_#000] space-y-3">
                  <span className="text-xs font-mono font-bold text-[#E11D48] uppercase">
                    ACADEMIC RECORD
                  </span>
                  <div className="space-y-2.5">
                    {education.map((edu, idx) => (
                      <div key={idx} className="text-xs border-b border-black/10 pb-2 space-y-0.5">
                        <span className="font-bold text-black uppercase text-sm">{edu.institution}</span>
                        <p className="text-zinc-600 font-mono">{edu.degree} ({edu.year})</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {achievements?.length > 0 && (
                <div className="p-6 border-2 border-black bg-white shadow-[5px_5px_0px_0px_#000] space-y-3">
                  <span className="text-xs font-mono font-bold text-[#E11D48] uppercase">
                    RECOGNITION &amp; HONORS
                  </span>
                  <div className="space-y-2.5">
                    {achievements.map((ach, idx) => (
                      <div key={idx} className="text-xs border-b border-black/10 pb-2 space-y-0.5">
                        <span className="font-bold text-black uppercase text-sm">{ach.title}</span>
                        <p className="text-zinc-600">{ach.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Swiss Final Dispatch / Direct Communication Section */}
        <ScrollReveal delay={0.2}>
          <section className="border-2 border-black bg-black text-white p-8 sm:p-12 shadow-[8px_8px_0px_0px_#E11D48] space-y-6 font-mono scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs text-[#E11D48] font-bold uppercase tracking-widest">[INDEX 04] // DIRECT DISPATCH PROTOCOL</span>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-sans">
                  Initiate System Engagement
                </h3>
              </div>
              <span className="text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 font-bold">
                STATUS: AVAILABLE FOR ARCHITECTURE
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {userEmail && (
                <button
                  onClick={copyEmail}
                  className="px-6 py-3 bg-[#E11D48] hover:bg-white hover:text-black text-white font-bold text-xs uppercase tracking-widest transition cursor-pointer border border-black shadow-[3px_3px_0px_0px_#FFF]"
                >
                  {copied ? "EMAIL BUFFER COPIED" : "TRANSMIT EMAIL DIRECT"}
                </button>
              )}
              {userGithub && (
                <a
                  href={userGithub.startsWith("http") ? userGithub : `https://${userGithub}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 border border-white text-white hover:bg-white hover:text-black text-xs font-bold uppercase tracking-wider transition"
                >
                  GITHUB // REPOSITORY
                </a>
              )}
              {userLinkedin && (
                <a
                  href={userLinkedin.startsWith("http") ? userLinkedin : `https://${userLinkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 border border-white text-white hover:bg-white hover:text-black text-xs font-bold uppercase tracking-wider transition"
                >
                  LINKEDIN // DOSSIER
                </a>
              )}
            </div>
          </section>
        </ScrollReveal>
      </main>

      {/* Swiss Index Project Deep-Dive Modal */}
      {inspectedProject && (
        <ProjectDeepDiveModal
          project={inspectedProject}
          onClose={() => setInspectedProject(null)}
          accentColor="#e11d48"
        />
      )}
    </div>
  );
};

export default MinimalTemplate;
