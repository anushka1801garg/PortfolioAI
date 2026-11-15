import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DocumentViewerModal } from "./motionComponents";
import ModernTemplate from "./ModernTemplate";
import MinimalTemplate from "./MinimalTemplate";
import CreativeTemplate from "./CreativeTemplate";
import ProfessionalTemplate from "./ProfessionalTemplate";
import ResponsiveTemplate from "./ResponsiveTemplate";
import AppleInspiredTemplate from "./AppleInspiredTemplate";
import GoogleInspiredTemplate from "./GoogleInspiredTemplate";
import DeveloperTemplate from "./DeveloperTemplate";
import DesignerTemplate from "./DesignerTemplate";
import StartupFounderTemplate from "./StartupFounderTemplate";
import GlassmorphismTemplate from "./GlassmorphismTemplate";
import DarkThemeTemplate from "./DarkThemeTemplate";
import CyberpunkTemplate from "./CyberpunkTemplate";
import CorporateTemplate from "./CorporateTemplate";
import AcademicResearchTemplate from "./AcademicResearchTemplate";
import AnimatedTemplate from "./AnimatedTemplate";
import CustomPortfolioTemplate from "./CustomPortfolioTemplate";

import TemplateErrorBoundary from "./TemplateErrorBoundary";
import InteractivePortfolioOverlay from "../interactive/InteractivePortfolioOverlay";
import { synthesizeEfficientAbout, extractAchievementsFromAbout } from "./templateHelpers";

const TemplateRenderer = ({
  portfolio,
  data,
  portfolioData,
  templateOverride,
  templateId,
  onEditPhoto,
  isOwner: isOwnerProp,
  interactive = true,
  previewDevice,
}) => {
  const [activeTag, setActiveTag] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingDoc, setViewingDoc] = useState(null);

  useEffect(() => {
    const handleViewDoc = (e) => {
      if (e.detail) {
        setViewingDoc(e.detail);
      }
    };
    window.addEventListener("portfolio:view-doc", handleViewDoc);
    return () => window.removeEventListener("portfolio:view-doc", handleViewDoc);
  }, []);

  const rawPortfolio = portfolio || data || portfolioData;
  const safePortfolio = rawPortfolio || {};

  const github = safePortfolio.github || safePortfolio.contact?.github || "";
  const linkedin = safePortfolio.linkedin || safePortfolio.contact?.linkedin || "";
  const candidateName = safePortfolio.name || safePortfolio.hero?.name || safePortfolio.title || "";
  const ownerName = safePortfolio.user?.fullName || "";
  const isOwner = Boolean(
    isOwnerProp ||
    (ownerName && candidateName && (
      ownerName.trim().toLowerCase() === candidateName.trim().toLowerCase() ||
      candidateName.trim().toLowerCase().includes(ownerName.trim().toLowerCase()) ||
      ownerName.trim().toLowerCase().includes(candidateName.trim().toLowerCase())
    ))
  );

  let resolvedAvatar = safePortfolio.avatar || safePortfolio.hero?.avatar || "";
  // If no avatar is explicitly set, or if isOwner and unavatar was set, prioritize user's real uploaded avatar
  if (!resolvedAvatar || (isOwner && safePortfolio.user?.avatar && resolvedAvatar.includes("unavatar.io"))) {
    if (isOwner && safePortfolio.user?.avatar) {
      resolvedAvatar = safePortfolio.user.avatar;
    }
  }

  // Prevent owner's avatar leaking onto another candidate's portfolio
  if (resolvedAvatar && !isOwner && safePortfolio.user?.avatar && resolvedAvatar === safePortfolio.user.avatar) {
    resolvedAvatar = "";
  }

  if (!resolvedAvatar) {
    const liMatch = linkedin.match(/linkedin\.com\/in\/([a-zA-Z0-9_%-]+)/i);
    const ghMatch = github.match(/(?:github\.com\/|^@?)([a-zA-Z0-9-]+)/i);
    if (isOwner && safePortfolio.user?.avatar) {
      resolvedAvatar = safePortfolio.user.avatar;
    } else if (liMatch && liMatch[1]) {
      const cleanLiSlug = liMatch[1].toLowerCase().replace(/[^a-z0-9_%-]/g, "");
      resolvedAvatar = `https://unavatar.io/linkedin/${cleanLiSlug}`;
    } else if (ghMatch && ghMatch[1] && !["topics", "search", "explore", "settings"].includes(ghMatch[1].toLowerCase())) {
      resolvedAvatar = `https://github.com/${ghMatch[1]}.png`;
    } else if (candidateName) {
      resolvedAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(candidateName)}&backgroundColor=6366f1,8b5cf6,ec4899&textColor=ffffff`;
    }
  }

  // Prevent owner's email leaking onto another candidate's portfolio
  const resolvedEmail =
    safePortfolio.email ||
    safePortfolio.contact?.email ||
    (isOwner ? (safePortfolio.user?.email || "") : "");

  // Ensure "about" bio is naturally phrased and efficiently synthesized
  let resolvedAbout = safePortfolio.about || "";
  if (resolvedAbout) {
    resolvedAbout = synthesizeEfficientAbout(resolvedAbout, { name: candidateName });
  }

  // Repair split project titles if necessary
  const resolvedProjects = (Array.isArray(safePortfolio.projects) ? safePortfolio.projects : []).map((proj) => {
    if (!proj || typeof proj !== "object") return proj;
    let title = proj.title || "";
    let description = proj.description || "";
    let impact = proj.impact || "";

    if (title === "Cook" && /^With-Zavo\s*[-—–]/i.test(description)) {
      title = "Cook-With-Zavo";
      description = description.replace(/^With-Zavo\s*[-—–]\s*/i, "").trim();
      impact = impact.replace(/^With-Zavo\s*[-—–]\s*/i, "").trim();
    }
    return {
      ...proj,
      title,
      description,
      impact: impact || description.slice(0, 100),
    };
  });

  // Extract achievements from about if raw list was empty, and normalize schema safely
  const rawAchievements = Array.isArray(safePortfolio.achievements) && safePortfolio.achievements.length > 0
    ? safePortfolio.achievements
    : extractAchievementsFromAbout(safePortfolio.about || "");

  const resolvedAchievements = (rawAchievements || []).map((item) => {
    if (typeof item === "string") {
      return {
        title: item.trim(),
        description: "",
        link: "",
        url: "",
      };
    }
    if (item && typeof item === "object") {
      const rawLink = typeof item.link === "string" ? item.link : (typeof item.url === "string" ? item.url : "");
      return {
        ...item,
        title: String(item.title || item.name || item.award || "").trim(),
        description: String(item.description || item.detail || "").trim(),
        link: rawLink,
        url: rawLink,
      };
    }
    return { title: String(item || "").trim(), description: "", link: "", url: "" };
  }).filter((a) => a.title);

  // Normalize skills to clean string arrays to prevent React child rendering errors
  const rawSkills = Array.isArray(safePortfolio.skills)
    ? safePortfolio.skills
    : typeof safePortfolio.skills === "string"
    ? safePortfolio.skills.split(",")
    : [];

  const resolvedSkills = rawSkills
    .map((s) => {
      if (typeof s === "string") return s.trim();
      if (s && typeof s === "object") return (s.name || s.title || s.skill || "").trim();
      return "";
    })
    .filter(Boolean);

  const resolvedResumeUrl =
    safePortfolio.resumeUrl ||
    safePortfolio.resume ||
    safePortfolio.contact?.resumeUrl ||
    safePortfolio.contact?.resume ||
    "";
  const resolvedResumeName =
    safePortfolio.resumeName ||
    safePortfolio.contact?.resumeName ||
    (candidateName ? `${candidateName}_Resume.pdf` : "Resume.pdf");

  const actualPortfolio = {
    ...safePortfolio,
    name: candidateName,
    about: resolvedAbout,
    description: resolvedAbout,
    avatar: resolvedAvatar,
    hero: {
      ...(safePortfolio.hero || {}),
      title: safePortfolio.hero?.title || safePortfolio.targetRole || (safePortfolio.title?.includes("(") ? safePortfolio.title.match(/\(([^)]+)\)/)?.[1] : "") || "Professional",
      name: candidateName,
      avatar: resolvedAvatar,
    },
    projects: resolvedProjects,
    skills: resolvedSkills,
    achievements: resolvedAchievements,
    resumeUrl: resolvedResumeUrl,
    resumeName: resolvedResumeName,
    email: resolvedEmail,
    phone: safePortfolio.phone || safePortfolio.contact?.phone || "",
    github,
    linkedin,
    website: safePortfolio.website || safePortfolio.contact?.website || "",
    contact: {
      email: resolvedEmail,
      phone: safePortfolio.phone || safePortfolio.contact?.phone || "",
      github,
      linkedin,
      website: safePortfolio.website || safePortfolio.contact?.website || "",
      resumeUrl: resolvedResumeUrl,
      resumeName: resolvedResumeName,
      ...(safePortfolio.contact || {}),
    },
    _showDiff: Boolean(safePortfolio._showDiff),
  };

  const originalProjects = useMemo(() => actualPortfolio.projects || [], [actualPortfolio.projects]);

  const filteredProjects = useMemo(() => {
    return originalProjects.filter((proj) => {
      const matchesTag =
        activeTag === "ALL" ||
        (Array.isArray(proj.tags) &&
          proj.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase()));

      const matchesSearch =
        !searchQuery.trim() ||
        proj.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(proj.tags) &&
          proj.tags.some((t) =>
            t.toLowerCase().includes(searchQuery.toLowerCase()),
          ));

      return matchesTag && matchesSearch;
    });
  }, [originalProjects, activeTag, searchQuery]);

  if (!rawPortfolio) return null;

  const templatePortfolio = {
    ...actualPortfolio,
    _showDiff: Boolean(safePortfolio._showDiff),
    projects: filteredProjects,
  };

  const templateName = (
    templateOverride ||
    templateId ||
    actualPortfolio.template ||
    (actualPortfolio.customHtml ? "original" : "modern")
  ).toLowerCase();

  const renderTemplateContent = (p) => {
    const effectiveDevice = previewDevice || p?._previewDevice;
    const commonProps = {
      portfolio: p,
      onEditPhoto,
      isOwner,
      previewDevice: effectiveDevice,
    };
    switch (templateName) {
      case "original":
        return (
          <div className="w-full min-h-screen bg-[#06080F] flex flex-col relative">
            <iframe
              id="portfolioai-original-theme-iframe"
              srcDoc={p.customHtml || undefined}
              src={!p.customHtml ? (p.sourceUrl || p.website || p.analysisReport?.sourceUrl) : undefined}
              title={p.title || "Original Portfolio"}
              className="w-full min-h-screen border-0 flex-1 bg-[#06080F]"
              sandbox="allow-scripts allow-popups allow-forms"
              loading="lazy"
            />
          </div>
        );
      case "custom":
        return <CustomPortfolioTemplate {...commonProps} />;
      case "minimal":
        return <MinimalTemplate {...commonProps} />;
      case "developer":
        return <DeveloperTemplate {...commonProps} />;
      case "corporate":
        return <CorporateTemplate {...commonProps} />;
      case "apple":
        return <AppleInspiredTemplate {...commonProps} />;
      case "google":
        return <GoogleInspiredTemplate {...commonProps} />;
      case "designer":
        return <DesignerTemplate {...commonProps} />;
      case "startup":
        return <StartupFounderTemplate {...commonProps} />;
      case "creative":
        return <CreativeTemplate {...commonProps} />;
      case "glassmorphism":
        return <GlassmorphismTemplate {...commonProps} />;
      case "dark":
        return <DarkThemeTemplate {...commonProps} />;
      case "cyberpunk":
        return <CyberpunkTemplate {...commonProps} />;
      case "academic":
        return <AcademicResearchTemplate {...commonProps} />;
      case "animated":
        return <AnimatedTemplate {...commonProps} />;
      case "professional":
        return <ProfessionalTemplate {...commonProps} />;
      case "responsive":
        return <ResponsiveTemplate {...commonProps} />;
      case "modern":
      default:
        return <ModernTemplate {...commonProps} />;
    }
  };

  const effectiveDevice = previewDevice || actualPortfolio?._previewDevice;

  return (
    <TemplateErrorBoundary portfolio={actualPortfolio} templateKey={templateName}>
      {interactive ? (
        <InteractivePortfolioOverlay
          portfolio={actualPortfolio}
          templateKey={templateName}
          activeTag={activeTag}
          searchQuery={searchQuery}
          totalProjectsCount={originalProjects.length}
          filteredProjectsCount={filteredProjects.length}
          onFilterChange={({ tag, query }) => {
            if (tag !== undefined) setActiveTag(tag);
            if (query !== undefined) setSearchQuery(query);
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={templateName}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className={`w-full max-w-full overflow-x-hidden ${effectiveDevice === "mobile" ? "preview-device-mobile" : effectiveDevice === "tablet" ? "preview-device-tablet" : ""}`}
            >
              {renderTemplateContent(templatePortfolio)}
            </motion.div>
          </AnimatePresence>
        </InteractivePortfolioOverlay>
      ) : (
        <div className={`w-full max-w-full relative overflow-x-hidden ${effectiveDevice === "mobile" ? "preview-device-mobile" : effectiveDevice === "tablet" ? "preview-device-tablet" : ""}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={templateName}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full max-w-full overflow-x-hidden"
            >
              {renderTemplateContent(templatePortfolio)}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
      <DocumentViewerModal
        doc={viewingDoc}
        onClose={() => setViewingDoc(null)}
      />
    </TemplateErrorBoundary>
  );
};

export default TemplateRenderer;

