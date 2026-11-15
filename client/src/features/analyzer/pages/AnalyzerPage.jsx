import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import SEO from "../../../components/common/SEO";
import {
  ShieldCheck,
  Globe,
  Code2,
  Briefcase,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Key,
  Sliders,
  Lock,
  ExternalLink,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  Check,
  Palette,
  Layout,
  Award,
  Search,
  Clock,
  Maximize2,
} from 'lucide-react';

import Sidebar from "../../dashboard/components/Sidebar";
import Topbar from "../../dashboard/components/Topbar";
import WorkspaceBackdrop from "../../../components/layout/WorkspaceBackdrop";
import { fetchPortfolios, updatePortfolio, createPortfolio } from "../../../redux/portfolio/portfolioSlice";
import { TEMPLATES } from "../../portfolio/components/templates/templateList";
import TemplateRenderer from "../../portfolio/components/templates/TemplateRenderer";
import {
  analyzePortfolio,
  analyzeUrl,
  analyzeCode,
  analyzeResume,
  fetchRawHtml,
} from "../services/analyzerService";
import { applyAISuggestions } from "../../portfolio/services/portfolioService";
import UpgradeModal from "../../../components/modals/UpgradeModal";
import AIChatAssistant from "../../../components/chat/AIChatAssistant";

// Circular glowing progress ring matching user's design
const CircularScoreRing = ({ score = 78, label = "ATS Score", size = 150 }) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#16202c"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Active Animated Progress with Glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#10b981"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
            filter: "drop-shadow(0 0 10px rgba(16, 185, 129, 0.6))",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
        <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">{score}%</span>
        <span className="text-[11px] text-zinc-400 font-medium tracking-wide mt-0.5">{label}</span>
      </div>
    </div>
  );
};

const AnalyzerPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlPortfolioId = searchParams.get("portfolioId");
  const autoViewReport = searchParams.get("view") === "report";
  const fileInputRef = useRef();

  const { portfolios = [] } = useSelector((state) => state.portfolio);
  const { user } = useSelector((state) => state.auth);
  const userPlan = (user?.plan || "free").toLowerCase();
  const isPro = userPlan === "pro" || userPlan === "team";

  // Selected input tab ("saved" | "url" | "code" | "pdf")
  const [activeSource, setActiveSource] = useState("saved");
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(urlPortfolioId || "");
  const [portfolioAuditTab, setPortfolioAuditTab] = useState("all"); // "all" | "pending" | "analyzed"
  const [isPortfolioDropdownOpen, setIsPortfolioDropdownOpen] = useState(false);
  const portfolioDropdownRef = useRef(null);
  const [portfolioSearch, setPortfolioSearch] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [pdfFileName, setPdfFileName] = useState("");

  // Target context
  // Target context (auto-synced from active portfolio)
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");

  // Analysis state
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [userClosedReport, setUserClosedReport] = useState(false);

  // Modal & Expandable sections
  const [activeModalCategory, setActiveModalCategory] = useState(null);
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [expandedPillars, setExpandedPillars] = useState({});

  const togglePillarExpand = (key) => {
    setExpandedPillars((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Suggestions application state
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [applyingChanges, setApplyingChanges] = useState(false);
  const [importingPortfolio, setImportingPortfolio] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Recommended Official Credential Claiming State
  const [claimingCert, setClaimingCert] = useState(null);
  const [credentialUrl, setCredentialUrl] = useState("");
  const [credentialDate, setCredentialDate] = useState("");

  // Live Preview Modal State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(true); // whole-screen edge-to-edge view by default
  const [previewViewMode, setPreviewViewMode] = useState("diff"); // "diff" | "after" | "before"
  const [previewOriginalViewType, setPreviewOriginalViewType] = useState("live"); // "live" | "template"
  const [inspectedChangeId, setInspectedChangeId] = useState(null);
  const [previewTemplateOverride, setPreviewTemplateOverride] = useState(null);
  const [siteHtml, setSiteHtml] = useState(report?.rawHtml || "");

  useEffect(() => {
    if (report?.rawHtml) {
      setSiteHtml(report.rawHtml);
      return;
    }
    const targetUrl = report?.sourceUrl || (activeSource === "url" ? urlInput : "");
    if (targetUrl) {
      // First try browser fetch (instant if CORS allowed, like GitHub Pages)
      fetch(targetUrl)
        .then((r) => r.text())
        .then((html) => {
          if (html && html.length > 50) {
            setSiteHtml(html);
          } else {
            throw new Error("Empty HTML response");
          }
        })
        .catch(() => {
          // Fallback to server-side fetchRawHtml without CORS restrictions
          fetchRawHtml(targetUrl)
            .then((res) => {
              if (res.data?.html) setSiteHtml(res.data.html);
            })
            .catch((err) => console.log("Failed to fetch raw HTML:", err));
        });
    }
  }, [report, activeSource, urlInput]);

  useEffect(() => {
    dispatch(fetchPortfolios());
  }, [dispatch]);

  // Close preview modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showPreviewModal) {
        setShowPreviewModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPreviewModal]);

  // Close portfolio dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        portfolioDropdownRef.current &&
        !portfolioDropdownRef.current.contains(e.target)
      ) {
        setIsPortfolioDropdownOpen(false);
      }
    };
    if (isPortfolioDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPortfolioDropdownOpen]);

  // Partition portfolios into Needs Audit vs Already Analyzed
  const unanalyzedPortfolios = useMemo(() => {
    return portfolios.filter((p) => !p.analysisReport?.overallScore);
  }, [portfolios]);

  const analyzedPortfolios = useMemo(() => {
    return portfolios.filter((p) => Boolean(p.analysisReport?.overallScore));
  }, [portfolios]);

  const currentPool = useMemo(() => {
    if (portfolioAuditTab === "analyzed") return analyzedPortfolios;
    if (portfolioAuditTab === "pending") return unanalyzedPortfolios;
    return portfolios;
  }, [portfolioAuditTab, analyzedPortfolios, unanalyzedPortfolios, portfolios]);

  // When user explicitly clicks /analyzer from sidebar or nav without a query param,
  // guarantee they land on the portfolio selection form
  useEffect(() => {
    if (!urlPortfolioId && !autoViewReport) {
      setReport(null);
      setUserClosedReport(true);
    }
  }, [location.key, urlPortfolioId, autoViewReport]);

  useEffect(() => {
    if (urlPortfolioId) {
      setActiveSource("saved");
      setSelectedPortfolioId(urlPortfolioId);
    }
  }, [urlPortfolioId]);

  useEffect(() => {
    if (urlPortfolioId && portfolios.some((p) => p._id === urlPortfolioId)) {
      setSelectedPortfolioId(urlPortfolioId);
      const matched = portfolios.find((p) => p._id === urlPortfolioId);
      if (matched?.analysisReport?.overallScore) {
        setPortfolioAuditTab("analyzed");
      }
    } else if (selectedPortfolioId) {
      const isValidSelection = portfolios.some((p) => p._id === selectedPortfolioId);
      if (!isValidSelection) {
        setSelectedPortfolioId("");
      }
    }
  }, [portfolios, selectedPortfolioId, urlPortfolioId]);

  const selectedPortfolio = portfolios.find((p) => p._id === selectedPortfolioId);

  // Filtered portfolios for library search
  const filteredPortfolios = useMemo(() => {
    if (!portfolioSearch.trim()) return currentPool;
    const q = portfolioSearch.toLowerCase();
    return currentPool.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.targetRole?.toLowerCase().includes(q) ||
        p.template?.toLowerCase().includes(q)
    );
  }, [currentPool, portfolioSearch]);

  // Handle Tab Switch (saved | url | code) - ensures complete isolation between inputs
  const handleTabSwitch = (sourceId) => {
    setActiveSource(sourceId);
    if (sourceId !== "saved") {
      setTargetRole("");
      setTargetCompany("");
      setSelectedPortfolioId("");
    } else {
      if (selectedPortfolio) {
        setTargetRole(selectedPortfolio.targetRole || selectedPortfolio.title || "");
        setTargetCompany(selectedPortfolio.targetCompany || "");
      }
    }
  };

  // Auto-sync targetRole & targetCompany from the selected portfolio
  useEffect(() => {
    if (selectedPortfolio && activeSource === "saved") {
      const detectedRole =
        selectedPortfolio.targetRole ||
        (selectedPortfolio.tagline
          ? selectedPortfolio.tagline.split(/ at | specializing |\|/i)[0].trim()
          : "") ||
        selectedPortfolio.hero?.title ||
        selectedPortfolio.title ||
        "";

      const detectedCompany =
        selectedPortfolio.targetCompany ||
        (selectedPortfolio.tagline && selectedPortfolio.tagline.includes(" at ")
          ? selectedPortfolio.tagline.split(" at ")[1]?.split(/ specializing |\|/i)[0]?.trim()
          : "") ||
        selectedPortfolio.experience?.[0]?.company ||
        "";

      if (detectedRole) setTargetRole(detectedRole);
      if (detectedCompany) setTargetCompany(detectedCompany);
    }
  }, [selectedPortfolio, activeSource]);

  // Auto-load saved analysis report ONLY if explicitly requested via query param (e.g. ?portfolioId=xyz&view=report)
  useEffect(() => {
    if (
      autoViewReport &&
      urlPortfolioId &&
      selectedPortfolio &&
      activeSource === "saved" &&
      selectedPortfolio.analysisReport &&
      !report &&
      !userClosedReport
    ) {
      setReport(selectedPortfolio.analysisReport);
      const rep = selectedPortfolio.analysisReport;
      const themeSug = rep?.contentSuggestions?.find((s) => s.field === "template");
      const currentTmpl = (rep?.themeRecommendation?.currentTemplate || selectedPortfolio?.template || "").toLowerCase();
      const recTmpl = (rep?.themeRecommendation?.recommendedTemplateId || themeSug?.recommendedTemplateId || "").toLowerCase();
      const hasThemeChange =
        activeSource !== "pdf" &&
        rep?.inputType !== "resume" &&
        rep?.sourceType !== "resume" &&
        Boolean(themeSug) &&
        !rep?.themeRecommendation?.isAlreadyOptimal &&
        currentTmpl !== recTmpl;

      const contentSugs = (rep?.contentSuggestions || []).filter(
        (s) =>
          s.field !== "template" &&
          !s.category?.toLowerCase().includes("theme") &&
          !s.targetItem?.toLowerCase().includes("portfolio layout theme")
      );
      setSelectedSuggestions(hasThemeChange && themeSug ? [themeSug, ...contentSugs] : contentSugs);
    }
  }, [autoViewReport, urlPortfolioId, selectedPortfolio, activeSource, report, userClosedReport]);

  const targetPortfolioForPreview = useMemo(() => {
    if (activeSource === "saved") {
      if (!selectedPortfolio) return null;
      return {
        ...selectedPortfolio,
        name:
          selectedPortfolio.name ||
          selectedPortfolio.hero?.name ||
          selectedPortfolio.title?.replace(/portfolio/i, "").trim() ||
          "Candidate",
      };
    }

    if (report && (activeSource === "url" || activeSource === "code")) {
      const candidateName =
        report.candidateName ||
        report.portfolioTitle?.replace(/portfolio/i, "").trim() ||
        "Candidate";

      const origTaglineSug = (report.contentSuggestions || []).find(
        (s) => s.field === "hero" || s.field === "tagline"
      );
      const origAboutSug = (report.contentSuggestions || []).find(
        (s) => s.field === "about" || s.category?.toLowerCase().includes("bio")
      );

      const originalTagline =
        origTaglineSug?.current ||
        report.tagline ||
        `${candidateName} | ${report.targetRole || "Software Engineer"}`;

      const originalAbout =
        origAboutSug?.current ||
        report.summary ||
        report.verdict ||
        "Full Stack Developer passionate about building modern web applications.";

      let baseProjects = [];
      if (report.extractedProjects && report.extractedProjects.length > 0) {
        baseProjects = report.extractedProjects.map((p, idx) => {
          const matchingSug = (report.contentSuggestions || []).find(
            (s) =>
              s.field === "projects" &&
              s.targetItem &&
              (s.targetItem.toLowerCase().includes(p.title?.toLowerCase() || "") ||
                p.title?.toLowerCase().includes(
                  s.targetItem.toLowerCase().replace(/project:?/i, "").trim()
                ))
          );
          return {
            ...p,
            id: p.id || `ext-proj-${idx + 1}`,
            description:
              matchingSug?.current ||
              p.description ||
              "Production-grade project implementation.",
            techStack: p.techStack || [],
            liveUrl: p.liveUrl || (activeSource === "url" ? urlInput : ""),
          };
        });
      } else {
        baseProjects = (report.contentSuggestions || [])
          .filter((s) => s.field === "projects")
          .map((s, idx) => ({
            id: `ext-proj-${idx + 1}`,
            title:
              s.targetItem?.replace(/^Project:?\s*/i, "").trim() ||
              `Featured Project ${idx + 1}`,
            description:
              s.current || "Production-grade project implementation.",
            techStack: [],
            liveUrl: activeSource === "url" ? urlInput : "",
          }));
      }

      let baseExperience = [];
      if (Array.isArray(report.extractedExperience) && report.extractedExperience.length > 0) {
        baseExperience = report.extractedExperience.map((e, idx) => ({
          ...e,
          id: e.id || `ext-exp-${idx + 1}`,
        }));
      } else {
        baseExperience = (report.contentSuggestions || [])
          .filter((s) => s.field === "experience")
          .map((s, idx) => {
            const roleMatch = s.targetItem?.match(/experience:\s*(.*?)\s+at\s+(.*)/i);
            return {
              id: `ext-exp-${idx + 1}`,
              role: roleMatch ? roleMatch[1].trim() : `${report.targetRole || "Software Engineer"} Contributor`,
              company: roleMatch ? roleMatch[2].trim() : "Tech Solutions",
              duration: "2023 - Present",
              description: s.current || "Spearheaded full-lifecycle software delivery and cross-functional team initiatives.",
            };
          });
      }

      let baseCertifications = [];
      if (Array.isArray(report.extractedCertifications) && report.extractedCertifications.length > 0) {
        baseCertifications = report.extractedCertifications;
      } else if (Array.isArray(report.certifications) && report.certifications.length > 0) {
        baseCertifications = report.certifications;
      }

      const resolvedAvatar = report.extractedAvatar || report.avatar || "";
      const effectiveSourceUrl = report.sourceUrl || (activeSource === "url" ? urlInput : "");

      return {
        _id: "preview-external",
        isExternalPreview: true,
        title: report.portfolioTitle || `${candidateName}'s Portfolio`,
        name: candidateName,
        targetRole: report.targetRole || "Software Engineer",
        targetCompany: report.targetCompany || "",
        tagline: originalTagline,
        about: originalAbout,
        description: originalAbout,
        avatar: resolvedAvatar,
        sourceUrl: effectiveSourceUrl,
        education: report.education || [],
        github: report.github || "",
        linkedin: report.linkedin || "",
        // The original template BEFORE AI suggestion:
        template: report.themeRecommendation?.currentTemplate || "modern",
        skills:
          report.extractedSkills && report.extractedSkills.length > 0
            ? report.extractedSkills
            : ["React", "JavaScript", "Node.js", "Web Development", "REST APIs"],
        projects: baseProjects,
        experience: baseExperience,
        certifications: baseCertifications,
        hero: {
          name: candidateName,
          title: report.targetRole || "Software Engineer",
          tagline: originalTagline,
          description: originalAbout,
          avatar: resolvedAvatar,
        },
      };
    }

    return null;
  }, [activeSource, selectedPortfolio, report, urlInput]);

  // Live preview portfolio cloned with selected AI suggestions applied
  const previewPortfolio = useMemo(() => {
    if (!targetPortfolioForPreview) return null;

    // Pure un-optimized original view mode
    if (previewViewMode === "before") {
      const rawOriginal = JSON.parse(JSON.stringify(targetPortfolioForPreview));
      rawOriginal._showDiff = false;
      rawOriginal._previewViewMode = "before";
      rawOriginal._isAboutAIHighlighted = false;
      rawOriginal._isTaglineAIHighlighted = false;
      rawOriginal._isTemplateAIHighlighted = false;
      if (Array.isArray(rawOriginal.projects)) {
        rawOriginal.projects.forEach((p) => {
          p._isAIHighlighted = false;
          p._showDiff = false;
        });
      }
      if (Array.isArray(rawOriginal.experience)) {
        rawOriginal.experience.forEach((e) => {
          e._isAIHighlighted = false;
          e._showDiff = false;
        });
      }
      return rawOriginal;
    }

    const cloned = JSON.parse(JSON.stringify(targetPortfolioForPreview));
    cloned._showDiff = previewViewMode === "diff";
    cloned._previewViewMode = previewViewMode;

    selectedSuggestions.forEach((sug) => {
      // 1. About / Bio Headline Suggestion
      if (
        (sug.field === "about" ||
          sug.field === "bio" ||
          sug.field === "summary" ||
          (sug.targetItem && (sug.targetItem.toLowerCase().includes("bio") || sug.targetItem.toLowerCase().includes("about") || sug.targetItem.toLowerCase().includes("summary"))) ||
          (sug.category && (sug.category.toLowerCase().includes("bio") || sug.category.toLowerCase().includes("about") || sug.category.toLowerCase().includes("summary")))) &&
        sug.suggested
      ) {
        const origAbout =
          (sug.current && sug.current.trim() !== sug.suggested.trim() && sug.current.trim().length > 0)
            ? sug.current
            : (targetPortfolioForPreview.about || targetPortfolioForPreview.description || cloned.about || "Dedicated professional passionate about building impactful intelligent applications.");
        cloned.about = sug.suggested;
        cloned.description = sug.suggested;
        if (cloned.hero) cloned.hero.description = sug.suggested;
        cloned._isAboutAIHighlighted = true;
        cloned._aiOriginalAbout = origAbout;
        cloned._aiSuggestedAbout = sug.suggested;
      }
      // 2. Projects Rewrite Suggestion
      else if (
        (sug.field === "projects" || sug.targetItem?.toLowerCase().includes("project:")) &&
        sug.suggested
      ) {
        if (!Array.isArray(cloned.projects)) cloned.projects = [];
        let targetProj = cloned.projects.find(
          (p) =>
            sug.targetItem &&
            p.title &&
            (sug.targetItem.toLowerCase().includes(p.title.toLowerCase()) ||
              p.title.toLowerCase().includes(
                sug.targetItem.toLowerCase().replace(/project:?/i, "").trim()
              ))
        );
        if (!targetProj) {
          targetProj = cloned.projects.find((p) => !p._isAIHighlighted) || cloned.projects[0];
        }
        if (targetProj) {
          const origDesc =
            (sug.current && sug.current.trim() !== sug.suggested.trim() && sug.current.trim().length > 0)
              ? sug.current
              : (targetProj.description || "Production-grade project implementation.");
          targetProj.description = sug.suggested;
          targetProj._isAIHighlighted = true;
          targetProj._showDiff = previewViewMode === "diff";
          targetProj._aiOriginalDescription = origDesc;
          targetProj._aiSuggestedDescription = sug.suggested;
        } else {
          const newProjTitle = sug.targetItem?.replace(/^project:?\s*/i, "").trim() || "Featured Project";
          targetProj = {
            id: `ext-proj-${cloned.projects.length + 1}`,
            title: newProjTitle,
            description: sug.suggested,
            _isAIHighlighted: true,
            _showDiff: previewViewMode === "diff",
            _aiOriginalDescription: sug.current || "Production-grade project implementation.",
            _aiSuggestedDescription: sug.suggested,
            tags: ["Full Stack", "Production"],
            techStack: ["React", "Node.js"],
          };
          cloned.projects.push(targetProj);
        }
      }
      // 3. Hero Headline & Tagline Suggestion
      else if (
        (sug.field === "hero" ||
          sug.field === "tagline" ||
          sug.field === "headline" ||
          (sug.targetItem && (sug.targetItem.toLowerCase().includes("tagline") || sug.targetItem.toLowerCase().includes("headline") || (sug.targetItem.toLowerCase().includes("hero") && !sug.targetItem.toLowerCase().includes("bio")))) ||
          (sug.category && (sug.category.toLowerCase().includes("tagline") || sug.category.toLowerCase().includes("headline") || (sug.category.toLowerCase().includes("hero") && !sug.category.toLowerCase().includes("bio"))))) &&
        sug.suggested
      ) {
        const origTagline =
          (sug.current && sug.current.trim() !== sug.suggested.trim() && sug.current.trim().length > 0)
            ? sug.current
            : (targetPortfolioForPreview.tagline || targetPortfolioForPreview.hero?.tagline || cloned.tagline || `${cloned.name || "Candidate"} | ${cloned.targetRole || "Software Engineer"}`);
        cloned.tagline = sug.suggested;
        if (cloned.hero) cloned.hero.tagline = sug.suggested;
        cloned._isTaglineAIHighlighted = true;
        cloned._aiOriginalTagline = origTagline;
        cloned._aiSuggestedTagline = sug.suggested;
      }
      // 4. Portfolio Layout Theme Suggestion
      else if (
        sug.field === "template" ||
        sug.targetItem?.toLowerCase().includes("portfolio layout theme") ||
        sug.category?.toLowerCase().includes("theme")
      ) {
        const recId = sug.recommendedTemplateId || report?.themeRecommendation?.recommendedTemplateId || "google";
        cloned.template = recId;
        cloned._isTemplateAIHighlighted = true;
        cloned._aiOriginalTemplate =
          report?.themeRecommendation?.currentTemplate ||
          targetPortfolioForPreview.template ||
          "modern";
        cloned._aiSuggestedTemplate = recId;
      }
      // 5. Target Certifications Suggestion
      else if (
        sug.field === "certifications" ||
        sug.targetItem?.toLowerCase().includes("certification") ||
        sug.category?.toLowerCase().includes("certification")
      ) {
        if (!Array.isArray(cloned.certifications)) cloned.certifications = [];
        const certsList =
          (Array.isArray(sug.recommendedCertifications) && sug.recommendedCertifications.length > 0)
            ? sug.recommendedCertifications
            : (Array.isArray(report?.certificationsRecommendation) && report.certificationsRecommendation.length > 0)
            ? report.certificationsRecommendation
            : [
                { name: `Advanced ${cloned.targetRole || "Data Science"} Professional`, issuer: "Google / AWS", relevance: "Industry standard certification" },
                { name: `Certified ${cloned.targetRole || "Data"} Practitioner`, issuer: "Microsoft / Meta", relevance: "Validates technical core mastery" }
              ];

        certsList.forEach((cert) => {
          if (!cloned.certifications.some((c) => c.name?.toLowerCase() === cert.name.toLowerCase())) {
            cloned.certifications.push({
              name: cert.name,
              issuer: cert.issuer || "Industry Recognized",
              date: "Target / In Progress",
              description: cert.relevance || "Core domain qualification",
              _isAICertHighlighted: true,
            });
          }
        });
      }
      // 6. Experience Career Impact Suggestion
      else if (
        (sug.field === "experience" || sug.targetItem?.toLowerCase().includes("experience:")) &&
        sug.suggested
      ) {
        if (!Array.isArray(cloned.experience)) cloned.experience = [];
        let targetExp = cloned.experience.find(
          (e) =>
            sug.targetItem &&
            ((e.company && sug.targetItem.toLowerCase().includes(e.company.toLowerCase())) ||
              (e.role && sug.targetItem.toLowerCase().includes(e.role.toLowerCase())))
        );
        if (!targetExp) {
          targetExp = cloned.experience.find((e) => !e._isAIHighlighted) || cloned.experience[0];
        }
        if (targetExp) {
          const origDesc =
            (sug.current && sug.current.trim() !== sug.suggested.trim() && sug.current.trim().length > 0)
              ? sug.current
              : (targetExp.description || "Spearheaded organizational initiatives and deliverables.");
          targetExp.description = sug.suggested;
          targetExp._isAIHighlighted = true;
          targetExp._showDiff = previewViewMode === "diff";
          targetExp._aiOriginalDescription = origDesc;
          targetExp._aiSuggestedDescription = sug.suggested;
        } else {
          const roleMatch = sug.targetItem?.match(/experience:\s*(.*?)\s+at\s+(.*)/i);
          targetExp = {
            id: `ext-exp-${cloned.experience.length + 1}`,
            role: roleMatch ? roleMatch[1].trim() : `${report?.targetRole || "Software Engineer"} Specialist`,
            company: roleMatch ? roleMatch[2].trim() : "Enterprise Partner",
            duration: "2023 - Present",
            description: sug.suggested,
            _isAIHighlighted: true,
            _showDiff: previewViewMode === "diff",
            _aiOriginalDescription: sug.current || "Enterprise engineering and development contributions.",
            _aiSuggestedDescription: sug.suggested,
          };
          cloned.experience.push(targetExp);
        }
      }
    });

    if (previewTemplateOverride) {
      cloned.template = previewTemplateOverride;
      if (previewTemplateOverride !== (targetPortfolioForPreview.template || "modern")) {
        cloned._isTemplateAIHighlighted = true;
        cloned._aiOriginalTemplate = targetPortfolioForPreview.template || "modern";
        cloned._aiSuggestedTemplate = previewTemplateOverride;
      }
    }

    cloned._showDiff = previewViewMode === "diff";
    return cloned;
  }, [targetPortfolioForPreview, selectedSuggestions, previewViewMode, report, previewTemplateOverride]);

  // Theme Helper Memos & Controls for keeping original vs AI recommended theme
  const themeSuggestion = useMemo(() => {
    return report?.contentSuggestions?.find((s) => s.field === "template") || null;
  }, [report]);

  const originalThemeName = useMemo(() => {
    if (activeSource === "url" || report?.sourceType === "url" || report?.sourceUrl) {
      return "Original Website";
    }
    const raw =
      report?.themeRecommendation?.currentTemplate ||
      selectedPortfolio?.template ||
      "modern";
    const lower = raw.toLowerCase();
    if (lower === "original" || lower === "custom") return "Original Website";
    if (lower === "developer") return "Terminal Dev";
    if (lower === "creative") return "Creative";
    if (lower === "minimal") return "Minimal";
    if (lower === "modern") return "Modern";
    if (lower === "corporate") return "Corporate Executive";
    if (lower === "designer") return "Designer Showcase";
    if (lower === "google") return "Google Inspired";
    if (lower === "startup") return "Startup Founder";
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [report, selectedPortfolio, activeSource]);

  const recommendedThemeName = useMemo(() => {
    const raw =
      report?.themeRecommendation?.recommendedTemplateName ||
      report?.themeRecommendation?.recommendedTemplateId ||
      themeSuggestion?.recommendedTemplateId ||
      "Terminal Dev";
    if (raw.toLowerCase() === "developer") return "Terminal Dev";
    return raw;
  }, [report, themeSuggestion]);

  // Section checks if the AI suggests theme change for the portfolio after analyzing
  const hasAiThemeSuggestion = useMemo(() => {
    // 1. Must have a completed analysis report
    if (!report) return false;

    // 2. Must be a portfolio analysis, NOT a resume PDF analysis
    if (
      activeSource === "pdf" ||
      report?.inputType === "resume" ||
      report?.sourceType === "resume" ||
      report?.isResumeOnly
    ) {
      return false;
    }

    // 3. Must have an actionable theme suggestion from the AI
    if (!themeSuggestion) return false;

    // 4. Must not already be optimal
    if (report?.themeRecommendation?.isAlreadyOptimal) return false;

    // 5. If AI explicitly specified suggestThemeChange === false, do not show
    if (report?.themeRecommendation?.suggestThemeChange === false) return false;

    // 6. Current and recommended templates must differ
    const currentTmpl = (
      report?.themeRecommendation?.currentTemplate ||
      selectedPortfolio?.template ||
      ""
    ).toLowerCase();

    const recTmpl = (
      report?.themeRecommendation?.recommendedTemplateId ||
      themeSuggestion?.recommendedTemplateId ||
      ""
    ).toLowerCase();

    if (currentTmpl && recTmpl && currentTmpl === recTmpl) {
      return false;
    }

    if (originalThemeName.toLowerCase() === recommendedThemeName.toLowerCase()) {
      return false;
    }

    return true;
  }, [report, activeSource, themeSuggestion, selectedPortfolio, originalThemeName, recommendedThemeName]);

  const isThemeSelected = useMemo(() => {
    if (!hasAiThemeSuggestion) return false;
    return selectedSuggestions.some(
      (s) =>
        s.field === "template" ||
        s.id === "sug-theme-dynamic" ||
        (themeSuggestion && s.id === themeSuggestion.id)
    );
  }, [themeSuggestion, hasAiThemeSuggestion, selectedSuggestions]);

  const activeSelectedThemeName = useMemo(() => {
    if (previewTemplateOverride) {
      const t = TEMPLATES.find((tmpl) => tmpl.id === previewTemplateOverride);
      return t ? t.name : previewTemplateOverride;
    }
    if (hasAiThemeSuggestion && isThemeSelected) {
      return recommendedThemeName;
    }
    return originalThemeName;
  }, [hasAiThemeSuggestion, isThemeSelected, recommendedThemeName, originalThemeName, previewTemplateOverride]);

  // Toggle Theme Preference (Keep Original Theme vs Switch to AI Theme)
  const handleToggleThemePreference = (keepOriginal) => {
    setPreviewTemplateOverride(null);
    if (keepOriginal) {
      setSelectedSuggestions((prev) =>
        prev.filter(
          (s) =>
            s.field !== "template" &&
            s.id !== "sug-theme-dynamic" &&
            (!themeSuggestion || s.id !== themeSuggestion.id)
        )
      );
      toast.success(`Theme set to original: "${originalThemeName}". Original layout preserved! 🎨`);
    } else {
      const sug = themeSuggestion || {
        id: "sug-theme-dynamic",
        field: "template",
        recommendedTemplateId: report?.themeRecommendation?.recommendedTemplateId || "developer",
        category: "Portfolio Layout Theme",
        targetItem: "Portfolio Layout Theme",
        current: originalThemeName,
        suggested: recommendedThemeName,
        explanation: report?.themeRecommendation?.rationale || "AI recommended template for your domain.",
      };
      if (!selectedSuggestions.some((s) => s.id === sug.id || s.field === "template")) {
        setSelectedSuggestions((prev) => [sug, ...prev]);
        toast.success(`Theme switched to AI suggested: "${recommendedThemeName}". 🚀`);
      }
    }
  };

  const targetSourceUrl = report?.sourceUrl || (activeSource === "url" ? urlInput : "");

  // Live in-situ injection of AI suggestions directly into authentic external website HTML
  const injectedLiveSiteHtml = useMemo(() => {
    if (!siteHtml || !targetSourceUrl) return "";
    let baseUrl = targetSourceUrl;
    if (!baseUrl.endsWith("/")) baseUrl += "/";

    let modified = siteHtml;

    // Inject base href so all stylesheets, fonts, and assets resolve to the live website
    if (!modified.includes("<base ")) {
      if (modified.includes("<head>")) {
        modified = modified.replace("<head>", `<head><base href="${baseUrl}">`);
      } else if (modified.includes("<head ")) {
        modified = modified.replace(/<head[^>]*>/i, (m) => `${m}<base href="${baseUrl}">`);
      } else {
        modified = `<base href="${baseUrl}">` + modified;
      }
    }

    if (previewViewMode === "before") {
      return modified;
    }

    // Inject top preview notification banner directly inside authentic website
    const bannerHtml = `
      <div id="portfolioai-live-banner" style="position:fixed; top:12px; left:50%; transform:translateX(-50%); z-index:9999999; background:rgba(9,11,18,0.95); backdrop-filter:blur(16px); border:1px solid rgba(99,102,241,0.4); border-radius:9999px; padding:6px 18px; box-shadow:0 12px 30px -4px rgba(0,0,0,0.7); display:flex; align-items:center; gap:12px; font-family:system-ui,-apple-system,sans-serif; font-size:12px; color:#e2e8f0; pointer-events:none;">
        <span style="display:flex; width:8px; height:8px; border-radius:9999px; background:#10b981; box-shadow:0 0 10px #10b981;"></span>
        <span style="font-weight:600; color:#ffffff;">Original Website Theme</span>
        <span style="color:rgba(255,255,255,0.4);">|</span>
        <span>${previewViewMode === "diff" ? "AI Before vs After Diff Preview" : "AI Final Enhancements Applied"}</span>
      </div>
      <script>
        window.addEventListener('message', function(e) {
          if (e.data && e.data.type === 'SCROLL_TO_SUGGESTION') {
            var el = document.getElementById(e.data.id);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.style.outline = '3px solid #6366f1';
              el.style.outlineOffset = '4px';
              setTimeout(function() { el.style.outline = ''; }, 3000);
            }
          }
        });
      </script>
    `;

    if (modified.includes("</body>")) {
      modified = modified.replace("</body>", `${bannerHtml}</body>`);
    } else {
      modified += bannerHtml;
    }

    selectedSuggestions.forEach((sug) => {
      if (!sug.suggested) return;
      const currentText = (sug.current || "").trim();
      const sugAnchorId = `ai-suggestion-${sug.id}`;

      const diffMarker = `<span id="${sugAnchorId}" class="ai-diff-marker" style="display:inline; font-family:inherit; vertical-align:baseline;">` +
        `<span style="background: rgba(239, 68, 68, 0.25); border: 1px solid rgba(239, 68, 68, 0.6); color: #fca5a5; padding: 1px 5px; border-radius: 4px; text-decoration: line-through; margin-right: 4px; display:inline;">${currentText || "Original Text"}</span>` +
        `<span style="background: rgba(16, 185, 129, 0.25); border: 1px solid rgba(16, 185, 129, 0.6); color: #6ee7b7; padding: 1px 5px; border-radius: 4px; font-weight: 600; display:inline;">${sug.suggested}</span>` +
      `</span>`;

      const cleanMarker = `<span id="${sugAnchorId}" class="ai-applied-text" style="color: inherit; border-bottom: 2px dashed #10b981; font-weight: inherit;" title="AI Optimized Enhancement">${sug.suggested}</span>`;

      const replacement = previewViewMode === "diff" ? diffMarker : cleanMarker;

      let didReplace = false;

      // Pass 1: Direct exact match on currentText
      if (currentText && currentText.length >= 4 && modified.includes(currentText)) {
        modified = modified.replace(currentText, replacement);
        didReplace = true;
      }

      // Pass 2: Whitespace-tolerant regex match on currentText
      if (!didReplace && currentText && currentText.length >= 6) {
        const words = currentText.split(/\s+/).filter(Boolean);
        if (words.length >= 2) {
          const escapedPattern = words.map((w) => w.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")).join("\\s+");
          try {
            const regex = new RegExp(escapedPattern, "i");
            if (regex.test(modified)) {
              modified = modified.replace(regex, replacement);
              didReplace = true;
            }
          } catch (_) {}
        }
      }

      // Pass 3: Target by Project / Role Title (e.g. "TrustHire", "Developer Intern", "Google Student Ambassador")
      if (!didReplace && sug.targetItem) {
        const itemTitle = sug.targetItem
          .replace(/^Project:\s*|^Experience:\s*/i, "")
          .replace(/(?:[↗→]|🔗)/g, "")
          .trim();

        if (itemTitle && itemTitle.length >= 3 && modified.includes(itemTitle)) {
          const escapedTitle = itemTitle.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

          // Check if there is a description paragraph following this title
          const descRegex = new RegExp(
            `(${escapedTitle}[\\s\\S]{0,350}?<p[^>]*class=["'][^"']*project-description[^"']*["'][^>]*>)([\\s\\S]*?)(<\\/p>)`,
            "i"
          );
          if (descRegex.test(modified)) {
            modified = modified.replace(descRegex, (match, prefix, oldDesc, suffix) => {
              const diffBlock = previewViewMode === "diff"
                ? `<span id="${sugAnchorId}" class="ai-diff-marker" style="display:inline;"><span style="background:rgba(239,68,68,0.25); text-decoration:line-through; color:#fca5a5; padding:2px 4px; border-radius:4px; display:inline;">${oldDesc.trim()}</span> <span style="background:rgba(16,185,129,0.25); color:#6ee7b7; font-weight:600; padding:2px 4px; border-radius:4px; display:inline;">${sug.suggested}</span></span>`
                : `<span id="${sugAnchorId}" class="ai-applied-text" style="color:inherit; border-bottom:2px dashed #10b981; font-weight:inherit;">${sug.suggested}</span>`;
              return `${prefix}${diffBlock}${suffix}`;
            });
            didReplace = true;
          }

          // Check if there is a timeline-bullets list following this experience title
          if (!didReplace) {
            const bulletsRegex = new RegExp(
              `(${escapedTitle}[\\s\\S]{0,350}?<ul[^>]*class=["'][^"']*timeline-bullets[^"']*["'][^>]*>)([\\s\\S]*?)(<\\/ul>)`,
              "i"
            );
            if (bulletsRegex.test(modified)) {
              modified = modified.replace(bulletsRegex, (match, prefix, oldBullets, suffix) => {
                const diffBlock = previewViewMode === "diff"
                  ? `<li id="${sugAnchorId}" style="list-style:none; padding:4px 0;"><span class="ai-diff-marker" style="display:inline;"><span style="background:rgba(239,68,68,0.2); text-decoration:line-through; color:#fca5a5; padding:2px 6px; border-radius:4px; display:block; margin-bottom:4px; font-size:11px;">Original Scope</span><span style="background:rgba(16,185,129,0.25); color:#6ee7b7; font-weight:600; padding:4px 8px; border-radius:6px; display:block; border:1px solid rgba(16,185,129,0.4);">✨ AI Optimized Impact: ${sug.suggested}</span></span></li>${oldBullets}`
                  : `<li id="${sugAnchorId}" style="list-style:none; padding:4px 0;"><span style="background:rgba(16,185,129,0.15); color:#6ee7b7; font-weight:600; padding:4px 8px; border-radius:6px; display:block; border-left:3px solid #10b981;">✨ ${sug.suggested}</span></li>${oldBullets}`;
                return `${prefix}${diffBlock}${suffix}`;
              });
              didReplace = true;
            }
          }

          // Fallback: Enhance right after the heading tag
          if (!didReplace) {
            const headingRegex = new RegExp(
              `(<h[1-4][^>]*>[\\s\\S]*?${escapedTitle}[\\s\\S]*?<\\/h[1-4]>)`,
              "i"
            );
            if (headingRegex.test(modified)) {
              modified = modified.replace(headingRegex, (match) => {
                const diffBadge = previewViewMode === "diff"
                  ? `<div id="${sugAnchorId}" class="ai-diff-marker" style="margin-top:6px;"><span style="background:rgba(16,185,129,0.25); color:#6ee7b7; font-size:12px; font-weight:600; padding:4px 8px; border-radius:6px; border:1px solid rgba(16,185,129,0.5); display:inline-block;">✨ AI Enhanced: ${sug.suggested}</span></div>`
                  : `<div id="${sugAnchorId}" class="ai-applied-text" style="margin-top:6px; font-size:12px; color:#6ee7b7; border-bottom:2px dashed #10b981; display:inline-block;">✨ ${sug.suggested}</div>`;
                return `${match}${diffBadge}`;
              });
              didReplace = true;
            }
          }
        }
      }

      // Pass 4: Hero headline match
      if (!didReplace && (sug.field === "hero" || (sug.category && sug.category.toLowerCase().includes("hero")))) {
        const heroRegex = /(<span[^>]*class=["'][^"']*(?:hero-gradient-text|hero-role|hero-title)[^"']*["'][^>]*>)([\s\S]*?)(<\/span>)/i;
        if (heroRegex.test(modified)) {
          modified = modified.replace(heroRegex, (match, prefix, oldText, suffix) => {
            const diffBlock = previewViewMode === "diff"
              ? `<span id="${sugAnchorId}" class="ai-diff-marker"><span style="background:rgba(239,68,68,0.25); text-decoration:line-through; color:#fca5a5; padding:1px 4px;">${oldText}</span> <span style="background:rgba(16,185,129,0.25); color:#6ee7b7; font-weight:bold; padding:1px 4px;">${sug.suggested}</span></span>`
              : `<span id="${sugAnchorId}" class="ai-applied-text" style="color:inherit; border-bottom:2px dashed #10b981;">${sug.suggested}</span>`;
            return `${prefix}${diffBlock}${suffix}`;
          });
          didReplace = true;
        }
      }

      // Pass 5: Certifications injection into skills or achievements section
      if (!didReplace && sug.field === "certifications") {
        const targetSec = modified.includes('id="skills"')
          ? 'id="skills"'
          : modified.includes('id="achievements"')
          ? 'id="achievements"'
          : 'id="education"';
        if (modified.includes(targetSec)) {
          const certCard = `
            <div id="${sugAnchorId}" class="glass-card ai-cert-card" style="margin:20px 0; padding:16px 20px; border:1px solid rgba(16,185,129,0.4); border-radius:16px; background:rgba(16,185,129,0.08); box-shadow:0 8px 24px rgba(0,0,0,0.3);">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                <span style="background:#10b981; color:white; font-size:10px; font-weight:bold; padding:2px 8px; border-radius:99px;">AI RECOMMENDED</span>
                <span style="color:#6ee7b7; font-weight:bold; font-size:13px;">Target Industry Certifications:</span>
              </div>
              <div style="font-size:12px; color:#e2e8f0; line-height:1.6;">
                ${previewViewMode === "diff"
                  ? `<span style="text-decoration:line-through; color:#fca5a5; background:rgba(239,68,68,0.2); padding:1px 6px; border-radius:4px; margin-right:8px;">No Certifications Listed</span>`
                  : ""}
                <span style="color:#6ee7b7; font-weight:600; background:rgba(16,185,129,0.2); padding:2px 8px; border-radius:6px; border:1px solid rgba(16,185,129,0.3); display:inline-block;">${sug.suggested}</span>
              </div>
            </div>
          `;
          modified = modified.replace(
            new RegExp(`(<section[^>]*${targetSec}[^>]*>[\\s\\S]*?<div[^>]*class=["'][^"']*container[^"']*["'][^>]*>)`, "i"),
            `$1${certCard}`
          );
          didReplace = true;
        }
      }
    });

    return modified;
  }, [siteHtml, targetSourceUrl, previewViewMode, selectedSuggestions]);

  // Determine whether to preview directly on the authentic live website or in a PortfolioAI template
  const shouldRenderLiveSite = Boolean(
    targetSourceUrl &&
    (activeSource === "url" || report?.sourceType === "url") &&
    (!isThemeSelected || previewViewMode === "before") &&
    !previewTemplateOverride
  );

  // Helper to resolve official issuing certification links
  const getOfficialCertUrl = (cert) => {
    if (cert?.officialUrl) return cert.officialUrl;
    if (cert?.url) return cert.url;
    const name = (cert?.name || "").toLowerCase();
    const issuer = (cert?.issuer || "").toLowerCase();

    // PMI / PMP / PfMP
    if (name.includes("pmp") || name.includes("pfmp") || name.includes("project management") || issuer.includes("pmi")) {
      return "https://www.pmi.org/certifications/project-management-pmp";
    }
    // USGBC / LEED
    if (name.includes("leed") || issuer.includes("usgbc") || issuer.includes("gbci")) {
      return "https://www.usgbc.org/credentials/leed-ap";
    }
    // Autodesk (Revit, Civil 3D, BIM, AutoCAD)
    if (name.includes("autodesk") || name.includes("revit") || name.includes("civil 3d") || name.includes("autocad") || issuer.includes("autodesk")) {
      return "https://www.autodesk.com/certification";
    }
    // Dassault / SOLIDWORKS
    if (name.includes("solidworks") || name.includes("cswp") || issuer.includes("dassault")) {
      return "https://www.solidworks.com/sw/support/mcad-certification-programs.htm";
    }
    // Bentley / STAAD.Pro
    if (name.includes("staad") || issuer.includes("bentley")) {
      return "https://www.bentley.com/software/staad/";
    }
    // CompTIA Security+
    if (name.includes("comptia") || name.includes("security+") || issuer.includes("comptia")) {
      return "https://www.comptia.org/certifications/security";
    }
    // CISSP
    if (name.includes("cissp") || issuer.includes("isc2") || issuer.includes("(isc)²")) {
      return "https://www.isc2.org/certifications/cissp";
    }
    // EC-Council / CEH
    if (name.includes("ceh") || name.includes("ethical hacker") || issuer.includes("ec-council")) {
      return "https://www.eccouncil.org/train-certify/certified-ethical-hacker-ceh/";
    }
    // Terraform / HashiCorp
    if (name.includes("terraform") || issuer.includes("hashicorp")) {
      return "https://www.hashicorp.com/certification/terraform-associate";
    }
    // AWS
    if (name.includes("solutions architect") || name.includes("aws certified") || issuer.includes("amazon")) {
      return "https://aws.amazon.com/certification/";
    }
    // CNCF / Kubernetes
    if (name.includes("kubernetes") || name.includes("cka") || name.includes("ckad") || name.includes("cks") || issuer.includes("cncf")) {
      return "https://www.cncf.io/certification/cka/";
    }
    // Meta
    if (name.includes("meta certified") || issuer.includes("meta")) {
      return name.includes("front")
        ? "https://www.coursera.org/professional-certificates/meta-front-end-developer"
        : "https://www.coursera.org/professional-certificates/meta-back-end-developer";
    }
    // Google Cloud
    if (name.includes("google cloud") || issuer.includes("google cloud")) {
      return "https://cloud.google.com/learn/certification";
    }
    // Android
    if (name.includes("android") || (issuer.includes("google") && !name.includes("cloud"))) {
      return "https://developers.google.com/certification/associate-android-developer";
    }
    // Microsoft / Azure
    if (name.includes("azure") || issuer.includes("microsoft")) {
      return "https://learn.microsoft.com/credentials/certifications/";
    }
    // ISTQB
    if (name.includes("istqb") || issuer.includes("istqb")) {
      return "https://www.istqb.org/certifications/certified-tester-foundation-level";
    }
    // ISACA / CISA
    if (name.includes("cisa") || issuer.includes("isaca")) {
      return "https://www.isaca.org/credentialing/cisa";
    }
    // SHRM
    if (name.includes("shrm") || issuer.includes("shrm")) {
      return "https://www.shrm.org/certification";
    }
    // ICAI / GST
    if (name.includes("gst") || issuer.includes("icai")) {
      return "https://www.icai.org/";
    }
    // SAP
    if (name.includes("sap") || issuer.includes("sap")) {
      return "https://learning.sap.com/certification";
    }
    // Nielsen Norman Group (NN/g)
    if (name.includes("nielsen") || name.includes("nn/g") || issuer.includes("nielsen")) {
      return "https://www.nngroup.com/ux-certification/";
    }
    // IAAP (Accessibility)
    if (name.includes("accessibility") || name.includes("cpwa") || name.includes("was") || issuer.includes("iaap")) {
      return "https://www.accessibilityassociation.org/page/CPWACertification";
    }
    // DeepLearning.AI
    if (name.includes("deeplearning") || issuer.includes("deeplearning")) {
      return "https://www.deeplearning.ai/";
    }
    return `https://www.google.com/search?q=${encodeURIComponent((cert?.name || "") + " " + (cert?.issuer || "") + " official certification exam")}`;
  };

  // Add Officially Claimed Certification (with authentic verification link)
  const handleSubmitClaimedCert = async () => {
    if (!claimingCert) return;
    if (!credentialUrl.trim()) {
      return toast.error("Please provide your official credential verification URL or certificate link.");
    }
    if (activeSource !== "saved" || !selectedPortfolioId) {
      return toast.error("Please select a portfolio from your library to add certifications.");
    }

    const effectiveId = selectedPortfolioId;
    const currentPortfolio = portfolios.find((p) => p._id === effectiveId) || targetPortfolioForPreview;
    const existingCerts = Array.isArray(currentPortfolio?.certifications) ? [...currentPortfolio.certifications] : [];

    if (existingCerts.some((c) => c.name?.toLowerCase() === claimingCert.name.toLowerCase())) {
      return toast("This certification is already present in your portfolio!", { icon: "ℹ️" });
    }

    const updatedCerts = [
      ...existingCerts,
      {
        name: claimingCert.name,
        issuer: claimingCert.issuer,
        date: credentialDate.trim() || new Date().getFullYear().toString(),
        description: claimingCert.relevance,
        url: credentialUrl.trim(),
        link: credentialUrl.trim(),
      },
    ];

    try {
      toast.loading(`Verifying and adding "${claimingCert.name}"...`, { id: "cert-add" });
      const res = await dispatch(updatePortfolio({ id: effectiveId, data: { certifications: updatedCerts } }));
      toast.dismiss("cert-add");
      if (updatePortfolio.fulfilled.match(res)) {
        toast.success(`Verified credential "${claimingCert.name}" added to your portfolio! 📜`);
        dispatch(fetchPortfolios());
        setClaimingCert(null);
        setCredentialUrl("");
        setCredentialDate("");
      } else {
        toast.error("Failed to add certification");
      }
    } catch (err) {
      toast.dismiss("cert-add");
      toast.error(err.message || "Failed to add certification");
    }
  };

  // Open Entire Portfolio on Whole Screen in Dedicated Browser Tab
  const handleOpenFullscreenTab = () => {
    if (shouldRenderLiveSite && (injectedLiveSiteHtml || targetSourceUrl)) {
      if (injectedLiveSiteHtml) {
        const blob = new Blob([injectedLiveSiteHtml], { type: "text/html;charset=utf-8" });
        const blobUrl = URL.createObjectURL(blob);
        const win = window.open(blobUrl, "_blank");
        if (!win) {
          toast.error("Pop-up blocked. Please allow pop-ups for whole-screen preview.");
        } else {
          toast.success("Opened portfolio in whole screen new tab! 🚀");
        }
      } else {
        window.open(targetSourceUrl, "_blank");
      }
    } else if (previewPortfolio) {
      try {
        sessionStorage.setItem(
          "portfolioai_preview_data",
          JSON.stringify({ ...previewPortfolio, _previewDevice: "desktop" })
        );
        const win = window.open(
          `/templates/preview/${previewPortfolio.template || "modern"}?mode=fullpreview`,
          "_blank"
        );
        if (!win) {
          toast.error("Pop-up blocked. Please allow pop-ups for whole-screen preview.");
        } else {
          toast.success("Opened template portfolio in whole screen tab! 🚀");
        }
      } catch (_) {
        window.open(`/templates/preview/${previewPortfolio.template || "modern"}`, "_blank");
      }
    }
  };

  // Handle Analysis Execution
  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    toast.loading("Running comprehensive AI audit...", { id: "audit" });

    try {
      let res;
      if (activeSource === "saved") {
        if (!selectedPortfolioId) {
          throw new Error("Please select the portfolio from your library");
        }
        const effectiveId = selectedPortfolioId;
        const effectiveRole = targetRole || report?.targetRole || selectedPortfolio?.targetRole || "";
        const effectiveCompany = targetCompany || report?.targetCompany || selectedPortfolio?.targetCompany || "";
        res = await analyzePortfolio({
          portfolioId: effectiveId,
          targetRole: effectiveRole,
          targetCompany: effectiveCompany,
        });
      } else if (activeSource === "url") {
        if (!urlInput.trim()) throw new Error("Please enter a valid website URL");
        res = await analyzeUrl({
          url: urlInput.trim(),
          targetRole,
          targetCompany,
        });
      } else if (activeSource === "code") {
        if (!codeInput.trim()) throw new Error("Please paste HTML, React, or CSS code");
        res = await analyzeCode({
          code: codeInput.trim(),
          targetRole,
          targetCompany,
        });
      } else if (activeSource === "pdf") {
        const file = fileInputRef.current?.files?.[0];
        if (!file) throw new Error("Please select a PDF resume file");
        const formData = new FormData();
        formData.append("resume", file);
        formData.append("targetRole", targetRole);
        formData.append("targetCompany", targetCompany);
        res = await analyzeResume(formData);
      }

      toast.dismiss("audit");
      if (res.data?.success && res.data.analysis) {
        toast.success("Comprehensive portfolio audit completed! 🎯");
        setReport(res.data.analysis);
        setUserClosedReport(false);

        const rep = res.data.analysis;
        const themeSug = rep?.contentSuggestions?.find((s) => s.field === "template");
        const currentTmpl = (rep?.themeRecommendation?.currentTemplate || selectedPortfolio?.template || "").toLowerCase();
        const recTmpl = (rep?.themeRecommendation?.recommendedTemplateId || themeSug?.recommendedTemplateId || "").toLowerCase();
        const hasThemeChange =
          activeSource !== "pdf" &&
          rep?.inputType !== "resume" &&
          rep?.sourceType !== "resume" &&
          Boolean(themeSug) &&
          !rep?.themeRecommendation?.isAlreadyOptimal &&
          currentTmpl !== recTmpl;

        // Pre-select suggestions (including theme suggestion only if AI suggested theme change)
        const contentSugs = (res.data.analysis.contentSuggestions || []).filter(
          (s) =>
            s.field !== "template" &&
            !s.category?.toLowerCase().includes("theme") &&
            !s.targetItem?.toLowerCase().includes("portfolio layout theme")
        );
        setSelectedSuggestions(hasThemeChange && themeSug ? [themeSug, ...contentSugs] : contentSugs);
        await dispatch(fetchPortfolios());
      } else {
        throw new Error(res.data?.message || "Analysis could not be completed");
      }
    } catch (err) {
      toast.dismiss("audit");
      toast.error(err.response?.data?.message || err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  // Re-run AI Audit handler
  const handleReanalyze = async (e) => {
    if (e) e.preventDefault();
    setUserClosedReport(false);
    await handleAnalyze(e);
  };

  // Toggle selection of individual suggestion
  const toggleSuggestion = (sug) => {
    const exists = selectedSuggestions.some((s) => s.id === sug.id);
    if (exists) {
      setSelectedSuggestions((prev) => prev.filter((s) => s.id !== sug.id));
    } else {
      setSelectedSuggestions((prev) => [...prev, sug]);
    }
  };

  // AI Apply Changes (strictly for saved library portfolios)
  const handleApplyChanges = async () => {
    if (activeSource !== "saved" || !selectedPortfolioId) {
      return toast.error("Please select a Saved Portfolio from your library to apply changes, or click 'Import to Library'.");
    }

    if (!isPro) {
      return setShowUpgradeModal(true);
    }

    const effectiveId = selectedPortfolioId;

    if (selectedSuggestions.length === 0) {
      return toast.error("Please select at least one suggestion to apply.");
    }

    setApplyingChanges(true);
    toast.loading("Applying approved AI changes & creating version snapshot...", {
      id: "apply",
    });

    try {
      const res = await applyAISuggestions(effectiveId, selectedSuggestions);
      toast.dismiss("apply");
      if (res.data?.success) {
        toast.success("AI changes applied successfully! Snapshot v2 created. 🎉");
        setShowPreviewModal(false);
        navigate(`/portfolio/${effectiveId}`);
      }
    } catch (err) {
      toast.dismiss("apply");
      toast.error(err.response?.data?.message || "Failed to apply changes");
    } finally {
      setApplyingChanges(false);
    }
  };

  // Import external audited portfolio into user's library with suggestions
  const handleImportAsPortfolio = async () => {
    if (!report) return;
    setImportingPortfolio(true);
    toast.loading("Importing analyzed portfolio into your library...", { id: "import" });

    try {
      const candidateName =
        report.candidateName ||
        report.portfolioTitle?.replace(/portfolio/i, "").trim() ||
        "Imported";

      const isImportingOriginal = Boolean(
        shouldRenderLiveSite ||
        (!previewTemplateOverride && !isThemeSelected && (activeSource === "url" || report?.sourceType === "url" || targetSourceUrl))
      );

      const effectiveTemplate = isImportingOriginal
        ? "original"
        : previewTemplateOverride
        ? previewTemplateOverride
        : isThemeSelected
        ? (report.themeRecommendation?.recommendedTemplateId || "developer")
        : (report.themeRecommendation?.currentTemplate || selectedPortfolio?.template || "modern");

      const portfolioData = {
        title: report.portfolioTitle || `${candidateName}'s Portfolio`,
        targetRole: report.targetRole || targetRole || "Full Stack Developer",
        targetCompany: targetCompany || report.targetCompany || "",
        tagline: report.tagline || `${report.targetRole || "Full Stack Developer"} Portfolio`,
        about: report.summary || report.verdict || "",
        description: report.summary || report.verdict || "",
        template: effectiveTemplate,
        website: targetSourceUrl || (activeSource === "url" ? urlInput : "") || "",
        sourceUrl: targetSourceUrl || (activeSource === "url" ? urlInput : "") || "",
        customHtml: isImportingOriginal ? (injectedLiveSiteHtml || siteHtml || "") : "",
        creationType: isImportingOriginal ? "custom" : "template",
        inputSource: activeSource || "url",
        skills: report.extractedSkills || [],
        projects:
          report.extractedProjects && report.extractedProjects.length > 0
            ? report.extractedProjects
            : (report.contentSuggestions || [])
                .filter((s) => s.field === "projects")
                .map((s, idx) => ({
                  title: s.targetItem?.replace(/^Project:?\s*/i, "").trim() || `Featured Project ${idx + 1}`,
                  description: s.suggested || s.current || "",
                  techStack: [],
                  liveUrl: activeSource === "url" ? urlInput : "",
                })),
        analysisReport: {
          ...report,
          sourceUrl: targetSourceUrl || (activeSource === "url" ? urlInput : "") || report.sourceUrl,
          rawHtml: siteHtml || report.rawHtml,
        },
      };

      const res = await dispatch(createPortfolio(portfolioData));
      toast.dismiss("import");
      if (createPortfolio.fulfilled.match(res)) {
        toast.success(`Successfully imported "${portfolioData.title}" into your library! 🎉`);
        await dispatch(fetchPortfolios());
        navigate(`/portfolio/${res.payload._id}`);
      } else {
        toast.error("Failed to import portfolio");
      }
    } catch (err) {
      toast.dismiss("import");
      toast.error(err.message || "Failed to import portfolio");
    } finally {
      setImportingPortfolio(false);
    }
  };

  // Extract metrics & lists for Results View matching the screenshot
  const overallScore = report?.overallScore || report?.atsScore || 78;
  const verdict =
    report?.verdict ||
    report?.summary ||
    "Good job! Your portfolio is well-structured and includes relevant information. With a few improvements, you can increase your chances of getting shortlisted.";

  const getAssessmentBadge = (score) => {
    if (score >= 85) {
      return {
        label: "Excellent",
        className: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
      };
    }
    if (score >= 70) {
      return {
        label: "Good",
        className: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
      };
    }
    return {
      label: "Needs Polish",
      className: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    };
  };

  const assessmentBadge = getAssessmentBadge(overallScore);

  const metricBars = [
    {
      id: "format",
      label: "Portfolio UX & Presentation",
      score:
        report?.categories?.uiDesign?.score ||
        report?.categories?.responsiveness?.score ||
        86,
    },
    {
      id: "keywords",
      label: "ATS & Recruiter Keywords",
      score: report?.categories?.recruiterReadiness?.score || 72,
    },
    {
      id: "skills",
      label: "Technical Depth & Architecture",
      score: report?.categories?.content?.score || 80,
    },
    {
      id: "experience",
      label: "Project Proof & Impact",
      score: report?.categories?.accessibility?.score || 76,
    },
    {
      id: "education",
      label: "SEO, Performance & Deployment",
      score:
        report?.categories?.performance?.score ||
        report?.categories?.seo?.score ||
        90,
    },
  ];

  const isFinanceHRDomain = useMemo(() => {
    // When activeSource is 'url' or 'code', DO NOT check selectedPortfolio from library!
    if (activeSource !== "saved") {
      const combined = [
        targetRole,
        report?.targetRole || "",
        report?.portfolioTitle || "",
        report?.candidateName || "",
        report?.verdict || "",
        report?.summary || "",
      ].join(" ").toLowerCase();

      const isExplicitTech = /\b(software|developer|engineer|full-stack|fullstack|frontend|backend|web dev|programmer|coder|computer science|cs undergraduate|cs student|b\.?tech cs)\b/i.test(combined);
      if (isExplicitTech) return false;

      return /\b(corporate finance|financial accounting|chartered accountant|company secretary|cfo|chro|statutory audit|corporate tax|taxation|payroll governance|\bepf\b|\besic\b|human resources management|\bhris\b|balance sheet|general ledger)\b/i.test(combined);
    }

    const combined = [
      targetRole,
      report?.targetRole || "",
      selectedPortfolio?.title || "",
      selectedPortfolio?.about || "",
      selectedPortfolio?.tagline || "",
      (selectedPortfolio?.skills || []).join(" "),
    ].join(" ").toLowerCase();

    const isExplicitTech = /\b(software|developer|engineer|full-stack|fullstack|frontend|backend|web dev|programmer|coder|computer science|cs undergraduate|cs student|b\.?tech cs)\b/i.test(combined);
    if (isExplicitTech) return false;

    return /\b(corporate finance|financial accounting|chartered accountant|company secretary|cfo|chro|statutory audit|corporate tax|taxation|payroll governance|\bepf\b|\besic\b|human resources management|\bhris\b|balance sheet|general ledger|chief manager)\b/i.test(combined);
  }, [targetRole, report, selectedPortfolio, activeSource]);

  const strengthsList =
    report?.strengths && report.strengths.length > 0
      ? report.strengths
      : isFinanceHRDomain
      ? [
          "Demonstrates dual-domain executive mastery across Corporate Finance & Accounts (F&A) and Human Resources.",
          "Verifiable track record managing complex statutory compliances, multi-tier tax audits, and financial risk.",
          "Strong leadership footprint in capital expenditure control and payroll governance across large operations.",
        ]
      : [
          "Demonstrates modern full-stack web and API architecture.",
          "Includes verifiable public code repositories and live project demos.",
          "Strong technical positioning for target software engineering roles.",
          "Fluid responsive layouts and consistent visual styling.",
        ];

  const weaknessesList =
    report?.weaknesses && report.weaknesses.length > 0
      ? report.weaknesses
      : isFinanceHRDomain
      ? [
          "Project descriptions focus on operational responsibilities rather than quantified financial ROI and cycle time reduction.",
          "Could explicitly document modern enterprise ERP systems (SAP, Oracle Financials, Tally Prime) and automated HRIS integrations.",
          "Recommend highlighting talent retention rates and executive succession frameworks alongside statutory compliance milestones.",
        ]
      : [
          "Project descriptions focus on functional features rather than quantified engineering metrics (latency, scale, throughput).",
          "Limited architectural documentation explaining framework trade-offs or scalability decisions.",
          "Missing automated CI/CD pipeline proof, containerization (Docker), or unit testing.",
          "Hero headline could more specifically define your core technical niche and value proposition.",
        ];

  const missingKeywordsList =
    report?.missingKeywords && report.missingKeywords.length > 0
      ? report.missingKeywords
      : isFinanceHRDomain
      ? ["Statutory Audits", "Corporate Taxation & GST", "Enterprise Risk Management", "EPF & ESI Compliance", "Payroll Automation & HRIS", "Working Capital Optimization"]
      : ["Docker", "CI/CD Pipelines", "Redis", "System Architecture", "PostgreSQL", "Unit Testing"];

  const suggestionsList =
    report?.improvements && report.improvements.length > 0
      ? report.improvements
      : report?.contentSuggestions && report.contentSuggestions.length > 0
      ? report.contentSuggestions.map((s) => s.suggested)
      : isFinanceHRDomain
      ? [
          "Quantify audit turnaround acceleration and statutory cost-containment metrics across enterprise operations.",
          "Showcase end-to-end payroll automation and multi-tier statutory compliance registers (EPF, ESI, TDS).",
          "Emphasize executive leadership in financial modeling, internal controls, and enterprise risk management.",
          "Sharpen hero headline to highlight dual F&A and HR leadership authority within 5 seconds.",
        ]
      : [
          "Quantify project outcomes using Google's XYZ formula (% latency reduction, queries/sec, uptime).",
          "Document system architecture trade-offs explaining why specific technologies were selected.",
          "Showcase containerization (Docker) and automated CI/CD pipelines to prove production readiness.",
          "Sharpen hero headline to highlight your specialized technical domain within 5 seconds.",
        ];

  const effectiveCertRecs = useMemo(() => {
    if (report?.certificationsRecommendation && report.certificationsRecommendation.length > 0) {
      return report.certificationsRecommendation;
    }

    const roleCombined = [
      targetRole,
      report?.targetRole || "",
      report?.domain || "",
      selectedPortfolio?.title || "",
      selectedPortfolio?.about || "",
      selectedPortfolio?.tagline || "",
      (selectedPortfolio?.skills || []).join(" "),
      report?.verdict || "",
      report?.summary || "",
    ].join(" ").toLowerCase();

    // 1. Civil & Infrastructure Engineering
    if (
      report?.domain === "civil_engineering" ||
      /\b(civil|structural engineer|infrastructure|construction|site engineer|autocad civil|staad|revit|bim coordinator)\b/i.test(roleCombined)
    ) {
      return [
        {
          id: "cert-pmp",
          name: "Project Management Professional (PMP)",
          issuer: "Project Management Institute (PMI)",
          level: "Capital Projects & EPC Delivery",
          atsScoreBoost: "+18% ATS Boost",
          priority: "High",
          relevance: "Validates comprehensive oversight of major civil infrastructure, EPC vendor procurement, and project timelines.",
          officialUrl: "https://www.pmi.org/certifications/project-management-pmp",
        },
        {
          id: "cert-revit-bim",
          name: "Autodesk Certified Professional: Revit for Structural & Architectural Design",
          issuer: "Autodesk",
          level: "BIM Modeling & Digital Engineering",
          atsScoreBoost: "+16% ATS Boost",
          priority: "High",
          relevance: "Industry-standard proof of 3D BIM coordination, structural clash detection, and ISO 19650 technical documentation.",
          officialUrl: "https://www.autodesk.com/certification",
        },
        {
          id: "cert-leed-ap",
          name: "LEED AP Building Design + Construction (BD+C)",
          issuer: "U.S. Green Building Council (USGBC / GBCI)",
          level: "Sustainable Infrastructure",
          atsScoreBoost: "+15% ATS Boost",
          priority: "High",
          relevance: "Crucial for modern eco-certified infrastructure developments, green structural standards, and lifecycle carbon minimization.",
          officialUrl: "https://www.usgbc.org/credentials/leed-ap",
        },
        {
          id: "cert-staad",
          name: "STAAD.Pro Certified Structural Engineer",
          issuer: "Bentley Systems",
          level: "Computational Structural Analysis",
          atsScoreBoost: "+14% ATS Boost",
          priority: "Medium",
          relevance: "Verifies finite-element seismic analysis, dynamic wind load engineering, and RCC frame optimization.",
          officialUrl: "https://www.bentley.com/software/staad/",
        },
      ];
    }

    // 2. Finance, Audit, HR
    if (isFinanceHRDomain || report?.domain === "finance_hr") {
      return [
        {
          id: "cert-cisa",
          name: "Certified Information Systems Auditor (CISA)",
          issuer: "ISACA",
          level: "Executive / Audit Master",
          atsScoreBoost: "+16% ATS Boost",
          priority: "High",
          relevance:
            "Validates corporate audit leadership, internal controls, and enterprise IT governance.",
          officialUrl: "https://www.isaca.org/credentialing/cisa",
        },
        {
          id: "cert-shrm",
          name: "SHRM Senior Certified Professional (SHRM-SCP)",
          issuer: "SHRM",
          level: "Senior HR Leadership",
          atsScoreBoost: "+14% ATS Boost",
          priority: "High",
          relevance:
            "Proves strategic HR governance, statutory labor compliance, and executive talent operations.",
          officialUrl: "https://www.shrm.org/certification",
        },
        {
          id: "cert-gst",
          name: "GST Practitioner & Statutory Tax Compliance",
          issuer: "Ministry of Finance / ICAI",
          level: "National Regulatory",
          atsScoreBoost: "+12% ATS Boost",
          priority: "High",
          relevance:
            "Mandatory compliance proof for Indian corporate taxation, GSTR-1/3B/9 filings, and audit defence.",
          officialUrl: "https://www.icai.org/",
        },
        {
          id: "cert-sap",
          name: "SAP ERP Financial Accounting (FI/CO) Specialist",
          issuer: "SAP SE",
          level: "Enterprise Technology",
          atsScoreBoost: "+10% ATS Boost",
          priority: "Medium",
          relevance:
            "Demonstrates hands-on ERP migration, general ledger automation, and institutional cost-center control.",
          officialUrl: "https://learning.sap.com/certification",
        },
      ];
    }

    // 3. UI/UX & Design
    if (report?.domain === "design" || /\b(ui\/ux|ux designer|product designer|visual designer)\b/i.test(roleCombined)) {
      return [
        {
          id: "cert-nng",
          name: "Nielsen Norman Group UX Master Certified (NN/g)",
          issuer: "Nielsen Norman Group",
          level: "Industry Standard UX",
          atsScoreBoost: "+18% ATS Boost",
          priority: "High",
          relevance: "Globally recognized credential for user research rigor, information architecture, and usability testing.",
          officialUrl: "https://www.nngroup.com/ux-certification/",
        },
        {
          id: "cert-ibm",
          name: "Enterprise Design Thinking - Co-Creator & Leader",
          issuer: "IBM",
          level: "Design Leadership",
          atsScoreBoost: "+14% ATS Boost",
          priority: "High",
          relevance: "Validates facilitating cross-functional product sprints and enterprise design systems.",
          officialUrl: "https://www.ibm.com/design/thinking/",
        },
        {
          id: "cert-cpwa",
          name: "Certified Professional in Web Accessibility (CPWA)",
          issuer: "IAAP",
          level: "WCAG / ADA Regulatory",
          atsScoreBoost: "+15% ATS Boost",
          priority: "High",
          relevance: "Crucial for enterprise design systems requiring ADA, Section 508, and WCAG 2.2 AA compliance.",
          officialUrl: "https://www.accessibilityassociation.org/page/CPWACertification",
        },
      ];
    }

    // 4. Data Science & AI
    if (report?.domain === "data_ai" || /\b(data scientist|machine learning|ai engineer|nlp|deep learning)\b/i.test(roleCombined)) {
      return [
        {
          id: "cert-gcp-data",
          name: "Google Cloud Certified - Professional Data Engineer",
          issuer: "Google Cloud",
          level: "Big Data & Distributed Pipelines",
          atsScoreBoost: "+16% ATS Boost",
          priority: "High",
          relevance: "Validates distributed stream processing, BigQuery data warehousing, and fault-tolerant ETL pipelines.",
          officialUrl: "https://cloud.google.com/learn/certification",
        },
        {
          id: "cert-aws-ml",
          name: "AWS Certified Machine Learning - Specialty",
          issuer: "Amazon Web Services",
          level: "Production ML Systems",
          atsScoreBoost: "+18% ATS Boost",
          priority: "High",
          relevance: "Proves production model deployment, SageMaker infrastructure, and ML inference optimization.",
          officialUrl: "https://aws.amazon.com/certification/",
        },
        {
          id: "cert-deeplearning",
          name: "DeepLearning.AI Generative AI & LLM Systems Specialization",
          issuer: "DeepLearning.AI / Andrew Ng",
          level: "Modern GenAI & RAG",
          atsScoreBoost: "+15% ATS Boost",
          priority: "High",
          relevance: "Demonstrates practical fine-tuning, RAG system design, and vector database embeddings.",
          officialUrl: "https://www.deeplearning.ai/",
        },
      ];
    }

    // 5. Default Tech / Cloud / Backend
    return [
      {
        id: "cert-aws",
        name: "AWS Certified Solutions Architect - Professional",
        issuer: "Amazon Web Services",
        level: "Cloud Infrastructure",
        atsScoreBoost: "+18% ATS Boost",
        priority: "High",
        relevance: "Validates distributed cloud design, multi-region resilience, and microservice scalability.",
        officialUrl: "https://aws.amazon.com/certification/",
      },
      {
        id: "cert-cka",
        name: "Certified Kubernetes Administrator (CKA)",
        issuer: "Cloud Native Computing Foundation (CNCF)",
        level: "Container Orchestration",
        atsScoreBoost: "+16% ATS Boost",
        priority: "High",
        relevance: "Gold standard hands-on credential for container orchestration, cluster networking, and service mesh.",
        officialUrl: "https://www.cncf.io/certification/cka/",
      },
      {
        id: "cert-meta-back",
        name: "Meta Certified Back-End Developer / Front-End Engineer",
        issuer: "Meta",
        level: "Production Engineering",
        atsScoreBoost: "+12% ATS Boost",
        priority: "Medium",
        relevance: "Verifies mastery of production React frameworks, relational database optimization, and REST API design.",
        officialUrl: "https://www.coursera.org/professional-certificates/meta-back-end-developer",
      },
    ];
  }, [
    report,
    isFinanceHRDomain,
    targetRole,
    selectedPortfolio,
  ]);

  const effectiveUISuggestions = useMemo(() => {
    if (report?.uiSuggestions && report.uiSuggestions.length > 0) {
      return report.uiSuggestions;
    }
    if (isFinanceHRDomain) {
      return [
        {
          id: "ui-1",
          component: "Hero Header & Tagline",
          title: "Executive Credibility Within 5 Seconds",
          current: "Casual or generic intro without institutional scale or dual F&A/HR scope.",
          suggested:
            "Prominently state 'Senior Executive — Corporate Finance, Statutory Audits & HR Governance' with enterprise scope metrics.",
          impact: "+24% Recruiter Retention",
        },
        {
          id: "ui-2",
          component: "Projects & Impact Section",
          title: "Replace Generic Descriptions with Audit ROI",
          current: "Descriptive task lists without quantified financial savings or turnaround speed.",
          suggested:
            "Display visual KPI cards: '% Audit Turnaround Acceleration', 'Zero-Penalty Compliance Record', and 'ERP Migration Scale'.",
          impact: "+35% Executive Interview Callbacks",
        },
        {
          id: "ui-3",
          component: "Credentials & Verification Dossier",
          title: "Dedicated Regulatory & Certification Badges",
          current: "Certifications buried in text or missing institutional authority badges.",
          suggested:
            "Dedicated boardroom-ready credentials grid with verification links and statutory registration numbers.",
          impact: "+18% ATS Ranking",
        },
      ];
    }
    return [
      {
        id: "ui-1",
        component: "Projects Section",
        title: "Add Architecture Flow & Live Deployment Badges",
        current: "Code repo links without live system architecture or production metrics.",
        suggested:
          "Embed system architecture diagrams, live demo badges, and performance benchmarks.",
        impact: "+30% Technical Interview Rate",
      },
      {
        id: "ui-2",
        component: "Skills Matrix",
        title: "Group by System Domain vs Alphabetical List",
        current: "Unstructured list of languages and libraries.",
        suggested:
          "Categorize into Distributed Systems, Cloud Architecture, Databases, and Core Languages.",
        impact: "+18% Recruiter Clarity",
      },
    ];
  }, [report, isFinanceHRDomain]);

  return (
    <div className="flex min-h-screen bg-[#0B0E17] text-white">
      <SEO
        title="AI Resume & ATS Portfolio Analyzer — Instant Recruiter Scoring"
        description="Scan your resume PDF or portfolio against recruiter ATS algorithms. Get instant score breakdowns, keyword gap analysis, and tailored bullet point rewrites."
        canonical="/analyzer"
        keywords={[
          "ATS resume analyzer",
          "portfolio ATS checker",
          "recruiter scoring",
          "resume keyword gap analysis",
          "Nemotron AI scoring",
        ]}
      />
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <WorkspaceBackdrop />
        <Topbar />

        <main className="relative z-10 flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8 pb-36">
          {/* ========================================================================= */}
          {/* VIEW A: ANALYSIS RESULTS VIEW (Shown when a report is generated/loaded)  */}
          {/* ========================================================================= */}
          {report ? (
            <div className="space-y-8 animate-fadeIn">
              {/* Back to Analyzer Navigation & Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setUserClosedReport(true);
                      setReport(null);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 font-medium transition cursor-pointer mb-2.5 group"
                  >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Analyzer</span>
                  </button>

                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {activeSource === "pdf" ? "Resume ATS & Career Audit" : "Portfolio Diagnostic & ATS Audit"}
                  </h1>
                  <p className="text-zinc-400 text-xs sm:text-sm">
                    {activeSource === "pdf"
                      ? "Here's how your resume performs with suggestions to make it better."
                      : "Executive-grade review of technical depth, recruiter keywords, and project impact."}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end justify-center pt-1">
                  <span className="text-xs text-zinc-400 font-medium">
                    Analyzed on{" "}
                    {report.analyzedAt
                      ? new Date(report.analyzedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recently"}
                  </span>
                  <button
                    type="button"
                    onClick={handleReanalyze}
                    disabled={loading}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 mt-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={loading ? "animate-spin text-indigo-400" : ""} />
                    <span>{loading ? "Re-analyzing..." : "Run New Audit"}</span>
                  </button>
                </div>
              </div>

              {/* Active Audit Target Context Banner */}
              {activeSource === "url" && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                      <Globe size={15} />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-zinc-400 font-medium">Auditing Live Website:</span>
                      <a
                        href={report.sourceUrl || urlInput}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-300 hover:text-indigo-200 underline font-mono font-medium flex items-center gap-1"
                      >
                        <span>{report.sourceUrl || urlInput}</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                  {report.candidateName && (
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400 text-[11px]">Identified Candidate:</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-white font-semibold text-xs">
                        {report.candidateName}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {activeSource === "saved" && selectedPortfolio && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Briefcase size={15} />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-zinc-400 font-medium">Auditing Library Portfolio:</span>
                      <span className="text-white font-bold">{selectedPortfolio.title}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    Template: <span className="capitalize text-zinc-200">{selectedPortfolio.template || "Modern"}</span>
                  </span>
                </div>
              )}

              {/* TOP SECTION: 2 CARDS (Assessment + Metric Progress Bars) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* CARD 1 (Left): Overall Assessment */}
                <div className="lg:col-span-7 rounded-2xl bg-[#0e1320] border border-zinc-800/80 p-6 sm:p-7 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 shadow-xl">
                  <CircularScoreRing score={overallScore} label="ATS Score" />

                  <div className="space-y-3 flex-1 min-w-0 text-center sm:text-left">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base sm:text-lg font-bold text-white">Overall Assessment</h3>
                      <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${assessmentBadge.className}`}>
                        {assessmentBadge.label}
                      </span>
                    </div>
                    <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed font-light">
                      {verdict}
                    </p>
                  </div>
                </div>

                {/* CARD 2 (Right): Metric Breakdown Bars */}
                <div className="lg:col-span-5 rounded-2xl bg-[#0e1320] border border-zinc-800/80 p-6 sm:p-7 flex flex-col justify-center space-y-3.5 shadow-xl">
                  {metricBars.map((m) => (
                    <div key={m.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300 font-medium">{m.label}</span>
                        <span className="font-mono font-bold text-indigo-400">{m.score}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-800/90 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                          style={{ width: `${m.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ========================================================================= */}
              {/* AI STRATEGIC RECOMMENDATIONS HUB: UI ARCHITECTURE & CERTIFICATIONS */}
              {/* ========================================================================= */}
              {(effectiveCertRecs?.length > 0 || effectiveUISuggestions?.length > 0) && (
                <section className="rounded-2xl bg-gradient-to-b from-[#101528] to-[#0c0f1d] border border-indigo-900/60 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                  {/* Ambient glow accent */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

                  {/* Section Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-900/40 pb-5 relative z-10">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-indigo-500/40 flex items-center gap-1">
                          <Sparkles size={11} className="text-amber-400" />
                          Strategic Advisory
                        </span>
                        {(targetCompany || report.targetCompany) && (
                          <span className="text-[11px] text-zinc-400 font-medium">
                            Calibrated for <strong className="text-white">{targetCompany || report.targetCompany}</strong>
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                        <Layout className="text-indigo-400" size={20} />
                        <span>Role & Company Strategic Recommendations</span>
                      </h2>
                      <p className="text-xs text-zinc-300 max-w-3xl mt-1 leading-relaxed">
                        High-conversion UI & layout components and high-value industry certifications to skyrocket ATS and recruiter conversion for <strong>{targetRole || report.targetRole || "your target role"}</strong>.
                      </p>
                    </div>
                  </div>

                  {/* 2. Recommended High-Value Industry Certifications to Pursue */}
                  {effectiveCertRecs && effectiveCertRecs.length > 0 && (
                    <div className="rounded-xl bg-[#090c16]/90 border border-amber-500/30 p-5 sm:p-6 space-y-4 relative z-10 shadow-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                            <Award size={20} />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                              <span>Recommended Industry Certifications to Pursue</span>
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/40">
                                Target Learning Roadmap
                              </span>
                            </h3>
                            <p className="text-xs text-zinc-400">
                              Target credentials recommended by AI to accelerate your career and maximize ATS scores for <strong>{targetRole || report.targetRole || "your role"}</strong>. Study for and claim these from their official issuing bodies before showcasing them on your portfolio.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {effectiveCertRecs.map((cert) => {
                          const isAlreadyPresent = (selectedPortfolio?.certifications || []).some(
                            (c) => c.name?.toLowerCase() === cert.name.toLowerCase()
                          );

                          return (
                            <div
                              key={cert.id || cert.name}
                              className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/40 transition flex flex-col justify-between space-y-3 group"
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                                      {cert.name}
                                    </h4>
                                    <span className="text-[11px] text-zinc-400 font-mono">
                                      Issued by: <strong className="text-zinc-300">{cert.issuer}</strong> • {cert.level}
                                    </span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold shrink-0">
                                    {cert.atsScoreBoost}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-300 leading-relaxed font-light">
                                  {cert.relevance}
                                </p>
                              </div>

                              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between flex-wrap gap-2">
                                <span className="text-[10px] font-mono text-amber-400/90 font-medium flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                  Recommended Target
                                </span>

                                <div className="flex items-center gap-2">
                                  <a
                                    href={getOfficialCertUrl(cert)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white flex items-center gap-1.5 transition"
                                    title={`Open official ${cert.issuer} certification portal in new tab`}
                                  >
                                    <span>Official Portal</span>
                                    <ExternalLink size={11} className="text-zinc-400" />
                                  </a>

                                  {isAlreadyPresent ? (
                                    <span className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                                      <Check size={12} className="text-emerald-400" />
                                      <span>In Portfolio</span>
                                    </span>
                                  ) : activeSource === "saved" ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setClaimingCert(cert);
                                        setCredentialUrl("");
                                        setCredentialDate(new Date().getFullYear().toString());
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white border border-amber-500/40 flex items-center gap-1.5 transition cursor-pointer"
                                      title="If you have already officially earned this certificate, add your verified credential URL"
                                    >
                                      <Award size={12} />
                                      <span>Already Claimed?</span>
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 3. UI & Layout Design Architecture Upgrades */}
                  {effectiveUISuggestions && effectiveUISuggestions.length > 0 && (
                    <div className="rounded-xl bg-[#090c16]/90 border border-blue-500/30 p-5 sm:p-6 space-y-4 relative z-10 shadow-lg">
                      <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                          <Layout size={20} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>UI & Visual Layout Architecture Upgrades</span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold border border-blue-500/40">
                              Conversion Optimization
                            </span>
                          </h3>
                          <p className="text-xs text-zinc-400">
                            Structural layout enhancements engineered to maximize recruiter scanning speed and C-suite credibility.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {effectiveUISuggestions.map((ui) => (
                          <div
                            key={ui.id || ui.title}
                            className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3 flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold block">
                                {ui.component}
                              </span>
                              <h4 className="text-xs font-bold text-white">{ui.title}</h4>
                              <div className="p-2 rounded bg-rose-950/20 border border-rose-500/20 text-[11px] text-zinc-300">
                                <strong className="text-rose-400 block text-[10px]">Current:</strong>
                                {ui.current}
                              </div>
                              <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-zinc-200">
                                <strong className="text-emerald-400 block text-[10px]">Recommended Layout:</strong>
                                {ui.suggested || ui.recommended}
                              </div>
                            </div>
                            <div className="pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400 flex items-start gap-1.5">
                              <Sparkles size={12} className="text-amber-400 shrink-0 mt-0.5" />
                              <span><strong>Impact:</strong> {ui.impact || ui.expectedImpact}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* BOTTOM SECTION: 4 PILLAR CARDS (Strengths, Weaknesses, Keywords, Suggestions) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Strengths */}
                <div className="rounded-2xl bg-[#0e1320] border border-zinc-800/80 p-5 flex flex-col justify-between shadow-lg hover:border-zinc-700 transition min-h-[220px]">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={16} />
                        </div>
                        <h4 className="text-sm font-bold text-white">Strengths</h4>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {strengthsList.length}
                      </span>
                    </div>
                    <ul className="space-y-2.5">
                      {(expandedPillars.strengths ? strengthsList : strengthsList.slice(0, 2)).map((item, idx) => (
                        <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2.5 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-3 border-t border-zinc-850/60 mt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveModalCategory("strengths")}
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>View all ({strengthsList.length})</span>
                    </button>
                    {strengthsList.length > 2 && (
                      <button
                        type="button"
                        onClick={() => togglePillarExpand("strengths")}
                        className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer transition"
                        title={expandedPillars.strengths ? "Show only 2" : "Expand remaining items"}
                      >
                        <span>{expandedPillars.strengths ? "Show less" : `+${strengthsList.length - 2} more`}</span>
                        {expandedPillars.strengths ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Weaknesses */}
                <div className="rounded-2xl bg-[#0e1320] border border-zinc-800/80 p-5 flex flex-col justify-between shadow-lg hover:border-zinc-700 transition min-h-[220px]">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                          <AlertTriangle size={16} />
                        </div>
                        <h4 className="text-sm font-bold text-white">Weaknesses</h4>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {weaknessesList.length}
                      </span>
                    </div>
                    <ul className="space-y-2.5">
                      {(expandedPillars.weaknesses ? weaknessesList : weaknessesList.slice(0, 2)).map((item, idx) => (
                        <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2.5 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-3 border-t border-zinc-850/60 mt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveModalCategory("weaknesses")}
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>View all ({weaknessesList.length})</span>
                    </button>
                    {weaknessesList.length > 2 && (
                      <button
                        type="button"
                        onClick={() => togglePillarExpand("weaknesses")}
                        className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer transition"
                        title={expandedPillars.weaknesses ? "Show only 2" : "Expand remaining items"}
                      >
                        <span>{expandedPillars.weaknesses ? "Show less" : `+${weaknessesList.length - 2} more`}</span>
                        {expandedPillars.weaknesses ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. Missing Keywords */}
                <div className="rounded-2xl bg-[#0e1320] border border-zinc-800/80 p-5 flex flex-col justify-between shadow-lg hover:border-zinc-700 transition min-h-[220px]">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                          <Key size={16} />
                        </div>
                        <h4 className="text-sm font-bold text-white">Missing Keywords</h4>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {missingKeywordsList.length}
                      </span>
                    </div>
                    <ul className="space-y-2.5">
                      {(expandedPillars.keywords ? missingKeywordsList : missingKeywordsList.slice(0, 2)).map((item, idx) => (
                        <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2.5 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                          <span
                            onClick={() => {
                              navigator.clipboard.writeText(item);
                              toast.success(`Copied keyword "${item}" to clipboard!`);
                            }}
                            title="Click to copy keyword"
                            className="font-mono text-zinc-200 hover:text-amber-300 transition cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{item}</span>
                            <Copy size={11} className="opacity-50 hover:opacity-100" />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-3 border-t border-zinc-850/60 mt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveModalCategory("keywords")}
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>View all ({missingKeywordsList.length})</span>
                    </button>
                    {missingKeywordsList.length > 2 && (
                      <button
                        type="button"
                        onClick={() => togglePillarExpand("keywords")}
                        className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer transition"
                        title={expandedPillars.keywords ? "Show only 2" : "Expand remaining items"}
                      >
                        <span>{expandedPillars.keywords ? "Show less" : `+${missingKeywordsList.length - 2} more`}</span>
                        {expandedPillars.keywords ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* 4. Suggestions */}
                <div className="rounded-2xl bg-[#0e1320] border border-zinc-800/80 p-5 flex flex-col justify-between shadow-lg hover:border-zinc-700 transition min-h-[220px]">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                          <Sparkles size={16} />
                        </div>
                        <h4 className="text-sm font-bold text-white">Suggestions</h4>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {suggestionsList.length}
                      </span>
                    </div>
                    <ul className="space-y-2.5">
                      {(expandedPillars.suggestions ? suggestionsList : suggestionsList.slice(0, 2)).map((item, idx) => (
                        <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2.5 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-3 border-t border-zinc-850/60 mt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveModalCategory("suggestions")}
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>View all ({suggestionsList.length})</span>
                    </button>
                    {suggestionsList.length > 2 && (
                      <button
                        type="button"
                        onClick={() => togglePillarExpand("suggestions")}
                        className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer transition"
                        title={expandedPillars.suggestions ? "Show only 2" : "Expand remaining items"}
                      >
                        <span>{expandedPillars.suggestions ? "Show less" : `+${suggestionsList.length - 2} more`}</span>
                        {expandedPillars.suggestions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>



              {/* ACTIONABLE AI SUGGESTION ENGINE & DIFF VIEWER */}
              {report.contentSuggestions && report.contentSuggestions.length > 0 && (
                <section className="rounded-2xl bg-[#0e1320] border border-zinc-800 p-6 sm:p-8 space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sparkles size={16} className="text-indigo-400" />
                        <span>AI Suggestion Engine (Before vs After Diffs)</span>
                      </h2>
                      <p className="text-xs text-zinc-400 pt-0.5">
                        Select suggestions below and apply them directly to your portfolio with one click.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {activeSource === "saved" ? (
                        <button
                          onClick={handleApplyChanges}
                          disabled={applyingChanges || selectedSuggestions.length === 0}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer shrink-0"
                        >
                          {!isPro && <Lock size={12} />}
                          <span>
                            {applyingChanges
                              ? "Applying Suggestions..."
                              : `Apply Suggestions (${selectedSuggestions.length})`}
                          </span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const textToCopy = selectedSuggestions
                                .map((s) => `[${s.targetItem || s.category}]:\n${s.suggested}`)
                                .join("\n\n");
                              navigator.clipboard.writeText(textToCopy);
                              toast.success("Copied all AI rewrites to clipboard! 📋");
                            }}
                            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Copy size={13} />
                            <span>Copy Rewrites</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleImportAsPortfolio}
                            disabled={importingPortfolio}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer shrink-0"
                          >
                            <Sparkles size={13} />
                            <span>
                              {importingPortfolio
                                ? "Importing to Library..."
                                : "Import to Library with AI Changes"}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interactive Live Preview Callout Banner */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/50 to-purple-950/30 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-indigo-200">
                      <Sparkles size={15} className="text-amber-300 shrink-0" />
                      <span>
                        <strong>{selectedSuggestions.length} suggestions ready to test.</strong> Want to see how your portfolio looks with these changes applied before committing?
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(true)}
                      disabled={selectedSuggestions.length === 0}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition cursor-pointer text-[11px] shrink-0 shadow-md shadow-indigo-600/25"
                    >
                      <Eye size={12} />
                      <span>Live Preview with Highlights</span>
                    </button>
                  </div>

                  {/* Theme Option Bar: Two options - 1. Theme Selected, 2. Switch between original theme and AI suggested theme (if suggested) */}
                  {report && activeSource !== "pdf" && !report?.isResumeOnly && (
                    <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-zinc-900 via-indigo-950/30 to-purple-950/20 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-lg">
                      {/* Option 1: Shows the Theme Selected */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400 shadow-sm">
                          <Palette size={17} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-xs">Theme Selected:</span>
                            <span className="font-bold text-indigo-300 text-xs">
                              {activeSelectedThemeName}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 ${
                                isThemeSelected
                                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              }`}
                            >
                              {isThemeSelected ? (
                                <>
                                  <Sparkles size={10} className="text-purple-300" />
                                  <span>AI Suggested Theme Active</span>
                                </>
                              ) : (
                                <>
                                  <Check size={10} className="text-emerald-300" />
                                  <span>Original Theme Active</span>
                                </>
                              )}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
                            {hasAiThemeSuggestion ? (
                              isThemeSelected ? (
                                <span>
                                  Switching to AI recommended <strong>"{recommendedThemeName}"</strong> theme. Click "Original Theme" to keep <strong>"{originalThemeName}"</strong> instead.
                                </span>
                              ) : (
                                <span>
                                  Original <strong>"{originalThemeName}"</strong> layout is locked. Click "AI Suggested Theme" to switch to <strong>"{recommendedThemeName}"</strong>.
                                </span>
                              )
                            ) : (
                              <span>
                                Original <strong>"{originalThemeName}"</strong> theme is optimal and matches industry standards for your domain.
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Option 2: Switch between Original Theme and AI Suggested Theme (if suggested) */}
                      <div className="shrink-0 self-start md:self-center">
                        {hasAiThemeSuggestion ? (
                          <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 shadow-inner">
                            <button
                              type="button"
                              onClick={() => handleToggleThemePreference(true)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                                !isThemeSelected
                                  ? "bg-indigo-600 text-white shadow-sm"
                                  : "text-zinc-400 hover:text-white"
                              }`}
                              title={`Switch to original ${originalThemeName} theme`}
                            >
                              <Check size={12} className={!isThemeSelected ? "opacity-100" : "opacity-0"} />
                              <span>Original Theme ({originalThemeName})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleThemePreference(false)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                                isThemeSelected
                                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                                  : "text-zinc-400 hover:text-white"
                              }`}
                              title={`Switch to AI suggested ${recommendedThemeName} theme`}
                            >
                              <Sparkles size={12} className={isThemeSelected ? "opacity-100" : "opacity-0"} />
                              <span>AI Suggested Theme ({recommendedThemeName})</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-zinc-950 px-3.5 py-1.5 rounded-xl border border-zinc-800/80 text-[11px] text-zinc-400">
                            <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                            <span>Original Theme Active <em>(No AI theme change suggested)</em></span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {report.contentSuggestions
                      .filter(
                        (sug) =>
                          sug.field !== "template" &&
                          !sug.category?.toLowerCase().includes("theme") &&
                          !sug.targetItem?.toLowerCase().includes("portfolio layout theme")
                      )
                      .map((sug) => {
                      const isSelected = selectedSuggestions.some((s) => s.id === sug.id);

                      return (
                        <div
                          key={sug.id}
                          className={`rounded-xl border p-4 sm:p-5 space-y-3 transition ${
                            isSelected
                              ? "bg-zinc-950 border-indigo-500/50 shadow-md shadow-indigo-500/5"
                              : "bg-zinc-950/40 border-zinc-800/60 opacity-80"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSuggestion(sug)}
                                className="w-4 h-4 rounded text-indigo-600 bg-zinc-900 border-zinc-700 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-white">
                                {sug.category} // <span className="text-indigo-300 font-mono">{sug.targetItem}</span>
                              </span>
                            </div>
                            {sug.impact && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-bold border border-indigo-500/30">
                                {sug.impact}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                                Current Portfolio Text (Before)
                              </span>
                              <p className="text-zinc-300 leading-relaxed font-light">
                                {sug.field === "template" && targetSourceUrl
                                  ? `Your authentic custom website (${targetSourceUrl})`
                                  : sug.current}
                              </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2 flex flex-col justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between pb-1">
                                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                                    AI Suggested Optimization (After)
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(sug.suggested);
                                      toast.success("Copied AI rewrite to clipboard! 📋");
                                    }}
                                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 hover:underline cursor-pointer"
                                  >
                                    <Copy size={11} />
                                    <span>Copy</span>
                                  </button>
                                </div>
                                <p className="text-zinc-100 leading-relaxed font-medium">
                                  {sug.field === "template" && targetSourceUrl
                                    ? `PortfolioAI ${recommendedThemeName} Layout`
                                    : sug.suggested}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Dedicated Theme Preference Helper Callout on the Theme card */}
                          {sug.field === "template" && (
                            <div className="mt-2 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                              <div className="space-y-0.5">
                                <span className="font-semibold text-white flex items-center gap-1.5">
                                  <Palette size={13} className="text-indigo-400" />
                                  <span>Theme Preference Option:</span>
                                </span>
                                <p className="text-[11px] text-zinc-300">
                                  {isSelected ? (
                                    <>
                                      <span className="text-purple-300 font-medium">Checked:</span> Will switch template to <strong>{recommendedThemeName}</strong>. If you want to keep your original <strong>"{originalThemeName}"</strong> theme, uncheck this card above or click the button.
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-emerald-400 font-medium">Unchecked:</span> Original <strong>"{originalThemeName}"</strong> theme will be kept intact! Only text, skills & project improvements will be applied.
                                    </>
                                  )}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggleThemePreference(isSelected)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                                  isSelected
                                    ? "bg-zinc-800 hover:bg-zinc-700 text-indigo-300 border border-indigo-500/30"
                                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                                }`}
                              >
                                {isSelected ? `Keep Original Theme (${originalThemeName})` : `Switch to AI Theme (${recommendedThemeName})`}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* EXPANDABLE 7-PILLAR DETAILED SCORE BREAKDOWN */}
              {report.categories && (
                <section className="rounded-2xl bg-[#0e1320] border border-zinc-800/80 p-5 space-y-4 shadow-xl">
                  <button
                    type="button"
                    onClick={() => setShowDeepDive(!showDeepDive)}
                    className="w-full flex items-center justify-between text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <Sliders size={16} className="text-indigo-400" />
                      <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                        Detailed Audit Breakdown (UI, ATS, SEO & Performance)
                      </span>
                    </div>
                    <div className="text-zinc-400 group-hover:text-white transition">
                      {showDeepDive ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {showDeepDive && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-3 border-t border-zinc-800/70 animate-fadeIn">
                      {Object.entries(report.categories).map(([key, cat]) => (
                        <div
                          key={key}
                          className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-4 flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="text-xs font-bold text-white">{cat.label}</h3>
                              <span className="text-sm font-black font-mono text-emerald-400">
                                {cat.score}/100
                              </span>
                            </div>

                            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                                style={{ width: `${cat.score}%` }}
                              />
                            </div>

                            <p className="text-[11px] text-zinc-400 font-light leading-snug">
                              {cat.reason}
                            </p>
                          </div>

                          {cat.actionableStep && (
                            <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-indigo-300 font-medium flex items-start gap-1.5">
                              <ArrowRight size={11} className="shrink-0 mt-0.5" />
                              <span>Action: {cat.actionableStep}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>
          ) : (
            /* ========================================================================= */
            /* VIEW B: AUDIT INPUT FORM (Shown when no report is active)                 */
            /* ========================================================================= */
            <div className="space-y-8 animate-fadeIn">
              {/* Header */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Diagnostic Engine // 7-Pillar Audit</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                  AI Portfolio &amp; Career Analyzer
                </h1>
                <p className="text-zinc-400 text-sm max-w-2xl font-light leading-relaxed">
                  Submit your saved portfolio, live URL, or GitHub code. Receive quantified Lighthouse &amp; ATS scores, role gap analysis, and 1-click AI optimizations.
                </p>
              </div>

              {/* Submission Card */}
              <section className="rounded-3xl bg-[#0e1320] border border-zinc-800 p-6 sm:p-8 space-y-6 shadow-xl">
                {/* Input tabs */}
                <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
                  {[
                    { id: "saved", name: "Saved Portfolio", icon: Briefcase },
                    { id: "url", name: "Live Website URL", icon: Globe },
                    { id: "code", name: "Source Code / Repo", icon: Code2 },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabSwitch(tab.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                        activeSource === tab.id
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                          : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
                      }`}
                    >
                      <tab.icon size={14} />
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </div>

                {/* Target Role & Target Company Context */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
                        Target Role (Optional)
                      </label>
                      {activeSource === "saved" && selectedPortfolio && targetRole && (
                        <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Auto-synced
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Full Stack Developer, Product Designer, Senior Engineer"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
                        Target Company / Industry (Optional)
                      </label>
                      {activeSource === "saved" && selectedPortfolio && targetCompany && (
                        <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Auto-synced
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      placeholder="e.g. Google, Stripe, Enterprise Tech"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* TAB CONTENT: SAVED */}
                {activeSource === "saved" && (
                  <div className="space-y-4">
                    {portfolios.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                          <Briefcase size={20} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white">No Portfolios Found</h4>
                          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                            You haven't created any portfolios yet. Create your first portfolio to run an intelligent audit.
                          </p>
                        </div>
                        <div className="pt-2 flex items-center justify-center">
                          <Link
                            to="/portfolio-generator"
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-indigo-600/20"
                          >
                            <Sparkles size={14} />
                            <span>Create Your First Portfolio</span>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider block">
                          Select Portfolio
                        </label>

                        {/* Custom Dropdown Menu Selection */}
                        <div className="relative" ref={portfolioDropdownRef}>
                          <button
                            type="button"
                            onClick={() => setIsPortfolioDropdownOpen((prev) => !prev)}
                            className={`w-full text-left bg-zinc-950/80 hover:bg-zinc-900/60 border rounded-2xl p-3.5 transition flex items-center justify-between gap-3 cursor-pointer group shadow-sm focus:outline-none ${
                              isPortfolioDropdownOpen
                                ? "border-indigo-500 ring-2 ring-indigo-500/20"
                                : "border-zinc-800 hover:border-zinc-700"
                            }`}
                          >
                            {selectedPortfolio ? (
                              <span className="text-sm font-medium text-white group-hover:text-indigo-200 transition truncate flex-1">
                                {selectedPortfolio.title}
                              </span>
                            ) : (
                              <span className="text-sm text-zinc-400 font-medium group-hover:text-zinc-300 transition flex-1">
                                Select the portfolio
                              </span>
                            )}

                            <div className="w-8 h-8 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white transition shrink-0">
                              <ChevronDown
                                size={16}
                                className={`transition-transform duration-200 ${
                                  isPortfolioDropdownOpen ? "rotate-180 text-indigo-400" : ""
                                }`}
                              />
                            </div>
                          </button>

                          {/* Dropdown Popover Menu */}
                          {isPortfolioDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                              {/* Search & Filter Header */}
                              <div className="p-3 border-b border-zinc-850/80 space-y-2.5 bg-zinc-900/40">
                                <div className="relative">
                                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                  <input
                                    type="text"
                                    value={portfolioSearch}
                                    onChange={(e) => setPortfolioSearch(e.target.value)}
                                    placeholder="Search portfolios by title, role, or template..."
                                    className="w-full pl-8.5 pr-8 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                                    autoFocus
                                  />
                                  {portfolioSearch && (
                                    <button
                                      type="button"
                                      onClick={() => setPortfolioSearch("")}
                                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs cursor-pointer"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>

                                {/* Filter Tabs */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() => setPortfolioAuditTab("all")}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                                      portfolioAuditTab === "all"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                                    }`}
                                  >
                                    All ({portfolios.length})
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setPortfolioAuditTab("pending")}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                                      portfolioAuditTab === "pending"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                                    }`}
                                  >
                                    <Clock size={11} />
                                    <span>Needs Audit ({unanalyzedPortfolios.length})</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setPortfolioAuditTab("analyzed")}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                                      portfolioAuditTab === "analyzed"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                                    }`}
                                  >
                                    <CheckCircle2 size={11} />
                                    <span>Already Analyzed ({analyzedPortfolios.length})</span>
                                  </button>
                                </div>
                              </div>

                              {/* Portfolio Items List */}
                              <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPortfolioId("");
                                    setTargetRole("");
                                    setTargetCompany("");
                                    setIsPortfolioDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center justify-between gap-3 cursor-pointer group ${
                                    !selectedPortfolioId
                                      ? "bg-indigo-950/60 text-white font-medium"
                                      : "hover:bg-zinc-900/80 text-zinc-400 hover:text-white"
                                  }`}
                                >
                                  <span className={`text-xs truncate flex-1 ${!selectedPortfolioId ? "text-white font-semibold" : "text-zinc-400 group-hover:text-white"}`}>
                                    Select the portfolio
                                  </span>
                                  <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                      !selectedPortfolioId
                                        ? "border-indigo-400 bg-indigo-500 text-white"
                                        : "border-zinc-800 bg-zinc-900/50 group-hover:border-zinc-700"
                                    }`}
                                  >
                                    {!selectedPortfolioId && <Check size={10} className="stroke-[3]" />}
                                  </div>
                                </button>
                                {filteredPortfolios.length > 0 ? (
                                  filteredPortfolios.map((p) => {
                                    const isSelected = p._id === selectedPortfolioId;

                                    return (
                                      <button
                                        key={p._id}
                                        type="button"
                                        onClick={() => {
                                          setSelectedPortfolioId(p._id);
                                          const r =
                                            p.targetRole ||
                                            (p.tagline ? p.tagline.split(/ at | specializing |\|/i)[0].trim() : "") ||
                                            p.hero?.title ||
                                            p.title ||
                                            "";
                                          const c =
                                            p.targetCompany ||
                                            (p.tagline && p.tagline.includes(" at ")
                                              ? p.tagline.split(" at ")[1]?.split(/ specializing |\|/i)[0]?.trim()
                                              : "") ||
                                            p.experience?.[0]?.company ||
                                            "";
                                          if (r) setTargetRole(r);
                                          if (c) setTargetCompany(c);
                                          setIsPortfolioDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center justify-between gap-3 cursor-pointer group ${
                                          isSelected
                                            ? "bg-indigo-950/60 text-white font-medium"
                                            : "hover:bg-zinc-900/80 text-zinc-300 hover:text-white"
                                        }`}
                                      >
                                        <span className={`text-xs truncate flex-1 ${
                                          isSelected ? "text-white font-semibold" : "text-zinc-300 group-hover:text-white"
                                        }`}>
                                          {p.title}
                                        </span>

                                        <div
                                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                            isSelected
                                              ? "border-indigo-400 bg-indigo-500 text-white"
                                              : "border-zinc-800 bg-zinc-900/50 group-hover:border-zinc-700"
                                          }`}
                                        >
                                          {isSelected && <Check size={10} className="stroke-[3]" />}
                                        </div>
                                      </button>
                                    );
                                  })
                                ) : (
                                  <div className="p-6 text-center text-xs text-zinc-400 space-y-2">
                                    <p>No portfolios found matching "{portfolioSearch}".</p>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPortfolioSearch("");
                                        setPortfolioAuditTab("all");
                                      }}
                                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                                    >
                                      Reset Filters
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Dropdown Footer */}
                              <div className="p-2.5 bg-zinc-900/60 border-t border-zinc-850 flex items-center justify-between text-xs">
                                <span className="text-zinc-500 text-[11px] font-mono">
                                  {portfolios.length} portfolio{portfolios.length === 1 ? "" : "s"} in library
                                </span>
                                <Link
                                  to="/portfolio-generator"
                                  className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 transition text-xs"
                                  onClick={() => setIsPortfolioDropdownOpen(false)}
                                >
                                  <Sparkles size={12} />
                                  <span>Create New</span>
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB CONTENT: URL */}
                {activeSource === "url" && (
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
                      Live Portfolio URL
                    </label>
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://yourdomain.com or https://username.github.io"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                {/* TAB CONTENT: CODE */}
                {activeSource === "code" && (
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
                      Paste Code or Component
                    </label>
                    <textarea
                      rows={5}
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      placeholder="Paste HTML, JSX component, or raw portfolio content here..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                )}


                {/* Run Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={loading || (activeSource === "saved" && !selectedPortfolio)}
                    className="px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Auditing Portfolio...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-amber-300" />
                        <span>
                          {activeSource === "saved" && selectedPortfolio?.analysisReport?.overallScore
                            ? "Re-audit Portfolio with AI"
                            : "Run Full AI Portfolio Audit"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>

      {/* VIEW ALL MODAL */}
      {activeModalCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setActiveModalCategory(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl bg-[#0e1320] border border-zinc-800 p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                {activeModalCategory === "strengths" && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 size={16} />
                  </div>
                )}
                {activeModalCategory === "weaknesses" && (
                  <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center">
                    <AlertTriangle size={16} />
                  </div>
                )}
                {activeModalCategory === "keywords" && (
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                    <Key size={16} />
                  </div>
                )}
                {activeModalCategory === "suggestions" && (
                  <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                )}
                <h3 className="text-base font-bold text-white capitalize flex items-center gap-2">
                  <span>All {activeModalCategory === "keywords" ? "Missing Keywords" : activeModalCategory}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                    {activeModalCategory === "strengths"
                      ? strengthsList.length
                      : activeModalCategory === "weaknesses"
                      ? weaknessesList.length
                      : activeModalCategory === "keywords"
                      ? missingKeywordsList.length
                      : suggestionsList.length}
                  </span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalCategory(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {activeModalCategory === "strengths" &&
                strengthsList.map((str, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-300 flex items-start gap-2.5 leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                    <span>{str}</span>
                  </div>
                ))}

              {activeModalCategory === "weaknesses" &&
                weaknessesList.map((weak, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-300 flex items-start gap-2.5 leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                    <span>{weak}</span>
                  </div>
                ))}

              {activeModalCategory === "keywords" && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {missingKeywordsList.map((kw, idx) => (
                    <span
                      key={idx}
                      onClick={() => {
                        navigator.clipboard.writeText(kw);
                        toast.success(`Copied keyword "${kw}" to clipboard!`);
                      }}
                      title="Click to copy keyword"
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs font-mono text-amber-300 hover:bg-amber-500/20 hover:text-amber-200 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>+{kw}</span>
                      <Copy size={11} className="opacity-60" />
                    </span>
                  ))}
                </div>
              )}

              {activeModalCategory === "suggestions" &&
                suggestionsList.map((sug, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-300 flex items-start gap-2.5 leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                    <span>{sug}</span>
                  </div>
                ))}
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModalCategory(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE PREVIEW & CONFIRMATION MODAL */}
      {showPreviewModal && previewPortfolio && (
        <div className="fixed inset-0 z-[99990] flex flex-col bg-black/90 backdrop-blur-md animate-fadeIn overflow-hidden">
          {/* Top Bar Row 1: Identity, Device Viewport, Primary Action, Close Button */}
          <div className="bg-[#0b0e19] border-b border-zinc-800 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shrink-0 shadow-lg relative z-[99996]">
            {/* Left: Portfolio Identity */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                <Eye size={16} />
              </div>
              <div className="min-w-0 flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white truncate max-w-[180px] sm:max-w-xs md:max-w-sm">
                  {previewPortfolio.title || previewPortfolio.name || "Live Portfolio"}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold shrink-0">
                  {selectedSuggestions.length} AI Changes
                </span>
              </div>
            </div>

            {/* Center: Device Viewport & Whole Screen View Controls */}
            <div className="hidden md:flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setPreviewDevice("desktop");
                  setIsFullscreenPreview(true);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  previewDevice === "desktop" && isFullscreenPreview
                    ? "bg-indigo-600 text-white shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Whole Screen View (Full Monitor Width & Height)"
              >
                <Maximize2 size={13} />
                <span className="text-[11px] font-medium">Whole Screen</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewDevice("desktop");
                  setIsFullscreenPreview(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  previewDevice === "desktop" && !isFullscreenPreview
                    ? "bg-indigo-600 text-white shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Desktop Window Mockup"
              >
                <Monitor size={13} />
                <span className="text-[11px]">Window</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewDevice("tablet");
                  setIsFullscreenPreview(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  previewDevice === "tablet"
                    ? "bg-indigo-600 text-white shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Tablet View (768px)"
              >
                <Tablet size={13} />
                <span className="text-[11px]">Tablet</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewDevice("mobile");
                  setIsFullscreenPreview(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  previewDevice === "mobile"
                    ? "bg-indigo-600 text-white shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Mobile View (390px)"
              >
                <Smartphone size={13} />
                <span className="text-[11px]">Mobile</span>
              </button>
            </div>

            {/* Right: Quick Action, Open Full Page in New Tab & Prominent Close Button */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Open in New Tab Button - Whole Screen Full Resolution */}
              <button
                type="button"
                onClick={handleOpenFullscreenTab}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 hover:border-zinc-600 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-sm"
                title="Open portfolio in a separate browser tab at full monitor resolution"
              >
                <ExternalLink size={13} className="text-emerald-400" />
                <span className="hidden sm:inline">Whole Screen View ↗</span>
                <span className="sm:hidden">Full Tab</span>
              </button>

              {activeSource === "saved" ? (
                <button
                  type="button"
                  onClick={handleApplyChanges}
                  disabled={applyingChanges || selectedSuggestions.length === 0}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {applyingChanges ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 size={13} />
                  )}
                  <span>Apply ({selectedSuggestions.length})</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleImportAsPortfolio}
                  disabled={importingPortfolio}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Sparkles size={13} />
                  <span className="hidden sm:inline">{importingPortfolio ? "Importing..." : "Import to Library"}</span>
                  <span className="sm:hidden">{importingPortfolio ? "..." : "Import"}</span>
                </button>
              )}

              {/* Close Button - Distinct, high-contrast, always visible in top right */}
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-rose-600 text-zinc-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0 border border-zinc-700/80 shadow-sm"
                title="Close Preview (Esc)"
              >
                <X size={15} />
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>
          </div>

          {/* Top Bar Row 2: View Mode Switcher & Theme Preference Controls */}
          <div className="bg-[#0e1220] border-b border-zinc-800 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0 relative z-[99995]">
            {/* View Mode Switcher: Before vs After Diff, Clean AI, Original */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 shrink-0">
              <button
                type="button"
                onClick={() => setPreviewViewMode("diff")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  previewViewMode === "diff"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="View side-by-side Before (Red) & After (Green) highlighted diffs"
              >
                <Sparkles size={12} className={previewViewMode === "diff" ? "text-amber-300" : "text-zinc-500"} />
                <span>Before vs After Diff</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewViewMode("after")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  previewViewMode === "after"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="View portfolio with clean AI enhancements applied"
              >
                <Check size={12} />
                <span>AI Final (After)</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewViewMode("before")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  previewViewMode === "before"
                    ? "bg-rose-700 text-white shadow-md shadow-rose-700/30"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="View original portfolio before changes"
              >
                <span>Original (Before)</span>
              </button>
            </div>

            {/* Right: Theme Options (Option 1: Selected Theme, Option 2: Switch between Original & AI Suggested) & Viewport Controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Option 1: Shows the theme selected */}
              <div className="flex items-center gap-2 bg-zinc-950/90 px-3 py-1.5 rounded-xl border border-zinc-800/90 text-xs shadow-inner">
                <Palette size={13} className="text-indigo-400 shrink-0" />
                <span className="text-zinc-400 font-medium hidden sm:inline">Theme Selected:</span>
                <span className="text-zinc-400 font-medium sm:hidden">Theme:</span>
                <span className="font-bold text-white">
                  {activeSelectedThemeName}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 ${
                    isThemeSelected
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  }`}
                >
                  {isThemeSelected ? (
                    <>
                      <Sparkles size={9} className="text-purple-300" />
                      <span>AI Suggested</span>
                    </>
                  ) : (
                    <>
                      <Check size={9} className="text-emerald-300" />
                      <span>Original</span>
                    </>
                  )}
                </span>
              </div>

              {/* Option 2: Switch between Original Theme and AI Suggested Theme (if suggested) */}
              {hasAiThemeSuggestion ? (
                <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 shadow-inner">
                  <button
                    type="button"
                    onClick={() => handleToggleThemePreference(true)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      !isThemeSelected
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                    title={`Switch to original ${originalThemeName} theme`}
                  >
                    <Check size={11} className={!isThemeSelected ? "opacity-100" : "opacity-0"} />
                    <span>Original Theme ({originalThemeName})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleThemePreference(false)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      isThemeSelected
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                    title={`Switch to AI suggested ${recommendedThemeName} theme`}
                  >
                    <Sparkles size={11} className={isThemeSelected ? "opacity-100 text-amber-300" : "opacity-0"} />
                    <span>AI Suggested Theme ({recommendedThemeName})</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-zinc-950/80 px-3 py-1.5 rounded-xl border border-zinc-800 text-[11px] text-zinc-400">
                  <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                  <span>Original Theme Active <span className="text-zinc-500 text-[10px]">(Optimal - no AI theme change suggested)</span></span>
                </div>
              )}

              {/* Mobile device viewport picker when screen is narrow */}
              <div className="flex md:hidden items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1 rounded-lg text-xs ${previewDevice === "desktop" ? "bg-indigo-600 text-white" : "text-zinc-400"}`}
                  title="Desktop"
                >
                  <Monitor size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("tablet")}
                  className={`p-1 rounded-lg text-xs ${previewDevice === "tablet" ? "bg-indigo-600 text-white" : "text-zinc-400"}`}
                  title="Tablet"
                >
                  <Tablet size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1 rounded-lg text-xs ${previewDevice === "mobile" ? "bg-indigo-600 text-white" : "text-zinc-400"}`}
                  title="Mobile"
                >
                  <Smartphone size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Applied Highlights Strip & Diff Explanation Banner */}
          <div className="bg-[#101524] border-b border-indigo-950 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 relative z-[99994]">
            <div className="flex items-center gap-2.5 text-xs text-zinc-200">
              {previewViewMode === "diff" && (
                <>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-mono font-bold">
                    ❌ Red = Before (Original)
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold">
                    ✅ Green = After (AI Optimized)
                  </span>
                  <span className="text-[11px] text-zinc-400 hidden sm:inline">
                    Changes are highlighted directly inside your portfolio sections below:
                  </span>
                </>
              )}
              {previewViewMode === "after" && (
                <span className="text-[11px] text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <strong>AI Final Preview:</strong> Showing your live portfolio with all {selectedSuggestions.length} optimizations applied.
                </span>
              )}
              {previewViewMode === "before" && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-rose-400" />
                    <strong>Original Portfolio:</strong>{" "}
                    {previewOriginalViewType === "live" && (previewPortfolio.sourceUrl || (activeSource === "url" && urlInput))
                      ? "Showing your authentic live website before applying AI suggestions."
                      : "Showing what your portfolio looks like right now before applying AI suggestions."}
                  </span>
                  {(previewPortfolio.sourceUrl || (activeSource === "url" && urlInput)) && (
                    <a
                      href={previewPortfolio.sourceUrl || urlInput}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-mono underline ml-1"
                      title="Open source website in a new tab"
                    >
                      <span>Open live site</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-zinc-400 font-medium">Click to inspect:</span>
              {selectedSuggestions.map((sug) => {
                const isInspected = inspectedChangeId === sug.id;
                return (
                  <button
                    key={sug.id}
                    type="button"
                    onClick={() => {
                      const nextInspected = inspectedChangeId === sug.id ? null : sug.id;
                      setInspectedChangeId(nextInspected);
                      const iframe = document.getElementById("portfolioai-preview-iframe");
                      if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage(
                          { type: "SCROLL_TO_SUGGESTION", id: "ai-suggestion-" + sug.id },
                          "*"
                        );
                      }
                    }}
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono flex items-center gap-1 transition cursor-pointer ${
                      isInspected
                        ? "bg-indigo-600 text-white font-bold ring-2 ring-indigo-400"
                        : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25"
                    }`}
                  >
                    <Check size={10} />
                    <span>{sug.targetItem || sug.category}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Inspector Modal Drawer (if a change badge is clicked) */}
          {inspectedChangeId && (
            <div className="bg-[#0b0e19] border-b border-indigo-900/80 px-4 sm:px-6 py-3 relative z-[99993] animate-fadeIn">
              {(() => {
                const sug = selectedSuggestions.find((s) => s.id === inspectedChangeId);
                if (!sug) return null;
                return (
                  <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          Diff Comparison: <span className="text-indigo-400">{sug.targetItem || sug.category}</span>
                        </span>
                        {sug.impact && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            {sug.impact}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setInspectedChangeId(null)}
                        className="text-zinc-400 hover:text-white text-xs font-bold px-2 py-1 rounded hover:bg-zinc-900 cursor-pointer"
                      >
                        ✕ Close Inspector
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block">
                          ❌ Original Text (Before)
                        </span>
                        <p className="text-zinc-300 leading-relaxed font-light">{sug.current}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                          ✅ AI Optimized Rewrite (After)
                        </span>
                        <p className="text-emerald-100 leading-relaxed font-medium">{sug.suggested}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}


          {/* Interactive Preview Canvas with Strict Stacking Context */}
          <div className={`flex-1 overflow-y-auto flex justify-center bg-[#07090e] ${
            isFullscreenPreview && previewDevice === "desktop" ? "p-0" : "p-3 sm:p-6"
          }`}>
            <div
              className={`transition-all duration-300 bg-[#09090b] flex flex-col relative overflow-hidden ${
                previewDevice === "mobile"
                  ? "w-[390px] max-w-full rounded-2xl border border-zinc-800 shadow-2xl h-fit my-auto"
                  : previewDevice === "tablet"
                  ? "w-[768px] max-w-full rounded-2xl border border-zinc-800 shadow-2xl h-fit my-auto"
                  : isFullscreenPreview
                  ? "w-full h-full min-h-[calc(100vh-140px)] border-0 rounded-none shadow-none my-0 flex-1"
                  : "w-full max-w-7xl rounded-2xl border border-zinc-800 shadow-2xl h-fit my-auto"
              }`}
              style={{
                transform: "translateZ(0)",
                contain: "paint",
              }}
            >
              {/* Browser Window Bar */}
              <div className={`bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center justify-between shrink-0 gap-3 ${
                isFullscreenPreview && previewDevice === "desktop" ? "rounded-none" : "rounded-t-2xl"
              }`}>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <div className="flex items-center gap-2 bg-zinc-950 px-3.5 py-1 rounded-lg border border-zinc-800 text-[10px] text-zinc-400 font-mono min-w-0">
                  <Sparkles size={10} className="text-emerald-400 shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-md">
                    {shouldRenderLiveSite && targetSourceUrl
                      ? targetSourceUrl
                      : `https://portfolioai.me/preview/${
                          previewPortfolio.title
                            ? encodeURIComponent(
                                previewPortfolio.title.toLowerCase().replace(/\s+/g, "-"),
                              )
                            : "live-preview"
                        }`}
                  </span>
                </div>

                {targetSourceUrl && (activeSource === "url" || report?.sourceType === "url") ? (
                  <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[10px] shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        handleToggleThemePreference(true);
                        setPreviewTemplateOverride(null);
                      }}
                      className={`px-2 py-0.5 rounded font-medium transition cursor-pointer flex items-center gap-1 ${
                        shouldRenderLiveSite
                          ? "bg-emerald-600 text-white font-bold shadow-xs"
                          : "text-zinc-400 hover:text-white"
                      }`}
                      title="Preview on your authentic live website without changing your design"
                    >
                      <Globe size={11} />
                      <span>Original Website Theme</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleToggleThemePreference(false);
                        setPreviewTemplateOverride(report?.themeRecommendation?.recommendedTemplateId || "modern");
                      }}
                      className={`px-2 py-0.5 rounded font-medium transition cursor-pointer flex items-center gap-1 ${
                        !shouldRenderLiveSite
                          ? "bg-indigo-600 text-white font-bold shadow-xs"
                          : "text-zinc-400 hover:text-white"
                      }`}
                      title="Preview in PortfolioAI Template layouts"
                    >
                      <Layout size={11} />
                      <span>PortfolioAI Templates</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-mono hidden sm:inline-block shrink-0">
                    ● Live Preview Active
                  </span>
                )}
              </div>

              {/* Rendered Template or Authentic Live Website Iframe */}
              {shouldRenderLiveSite ? (
                <div className={`w-full bg-[#09090b] relative flex flex-col flex-1 ${
                  isFullscreenPreview && previewDevice === "desktop"
                    ? "h-[calc(100vh-150px)] min-h-[820px] rounded-none"
                    : "h-[780px] rounded-b-2xl overflow-hidden"
                }`}>
                  <iframe
                    id="portfolioai-preview-iframe"
                    srcDoc={injectedLiveSiteHtml || undefined}
                    src={!injectedLiveSiteHtml ? targetSourceUrl : undefined}
                    title="Original Live Portfolio with AI Improvements"
                    className="w-full h-full border-0 bg-[#06080F]"
                    sandbox="allow-scripts allow-popups allow-forms"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className={`overflow-x-hidden relative w-full ${
                  isFullscreenPreview && previewDevice === "desktop"
                    ? "p-0 min-h-[calc(100vh-150px)] flex-1"
                    : "p-0"
                }`}>
                  <TemplateRenderer
                    portfolio={{ ...previewPortfolio, _previewDevice: previewDevice }}
                    templateOverride={previewPortfolio.template}
                    isOwner={false}
                    interactive={false}
                    previewDevice={previewDevice}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Confirmation & Action Footer */}
          <div className="bg-[#0b0e19] border-t-2 border-zinc-700/80 p-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-2xl relative z-[99995]">
            <div className="text-left w-full sm:w-auto">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-400" />
                <span>
                  Apply all {selectedSuggestions.length} optimizations to your live portfolio?
                </span>
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Saving will update your live portfolio content and create a rollback version
                snapshot so you can revert anytime.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white transition cursor-pointer border border-zinc-700 shrink-0"
              >
                Discard & Close
              </button>

              <button
                type="button"
                onClick={handleApplyChanges}
                disabled={applyingChanges || selectedSuggestions.length === 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-xl shadow-emerald-500/25 flex items-center gap-2 cursor-pointer shrink-0"
              >
                {applyingChanges ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Applying Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Apply All Changes ({selectedSuggestions.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Credential Claiming Modal */}
      {claimingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-zinc-950 border border-amber-500/30 p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Add Verified Official Credential</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">{claimingCert.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setClaimingCert(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-850 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-[11px] leading-relaxed">
                💡 Certifications must be officially earned from <strong>{claimingCert.issuer}</strong>. Provide your official certificate verification link (e.g. Credly badge, AWS verification URL, or issuer certificate URL) to maintain authentic credibility.
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1 text-[11px]">
                  Official Certificate URL / Verification Link <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://www.credly.com/badges/... or verification URL"
                  value={credentialUrl}
                  onChange={(e) => setCredentialUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-white text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1 text-[11px]">
                  Date Earned / Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2024 or Jan 2025"
                  value={credentialDate}
                  onChange={(e) => setCredentialDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-white text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setClaimingCert(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitClaimedCert}
                disabled={!credentialUrl.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-black font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <ShieldCheck size={13} />
                <span>Verify &amp; Add to Portfolio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        targetFeature="1-Click AI Apply Changes & Version Snapshot"
      />

      {/* Copilot Assistant - Hidden during Live Preview so it doesn't overlap preview controls */}
      {!showPreviewModal && <AIChatAssistant portfolioData={{ targetRole, targetCompany }} />}

    </div>
  );
};

export default AnalyzerPage;
