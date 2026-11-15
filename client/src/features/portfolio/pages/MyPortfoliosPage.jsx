import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Plus,
  Sparkles,
  Search,
  Edit,
  Trash2,
  Share2,
  Globe,
  Lock,
  Copy,
  Archive,
  Cloud,
  Download,
  ExternalLink,
  Layers,
  ArrowRight,
  Filter,
  FileText,
  Sliders,
  LayoutGrid,
  ArrowUpRight,
  GitBranch,
} from 'lucide-react';
import { FaGithub, FaLinkedin } from "react-icons/fa";

import Sidebar from "../../dashboard/components/Sidebar";
import Topbar from "../../dashboard/components/Topbar";
import WorkspaceBackdrop from "../../../components/layout/WorkspaceBackdrop";
import {
  fetchPortfolios,
  deletePortfolio,
  updatePortfolio,
} from "../../../redux/portfolio/portfolioSlice";
import { clearGeneratedPortfolio } from "../../../redux/portfolioGenerator/portfolioGeneratorSlice";
import {
  duplicatePortfolio,
  downloadPortfolioZip,
  downloadPortfolioHtml,
} from "../services/portfolioService";
import { downloadATSResume } from "../../../utils/atsResume.util";
import VersionHistoryModal from "../components/VersionHistoryModal";
import DeploymentModal from "../components/DeploymentModal";
import AIChatAssistant from "../../../components/chat/AIChatAssistant";
import { formatIndianDate, formatRelativeTime } from "../../../utils/date.util";

// ==========================================
// Origin & Architecture Classifier Helper
// ==========================================
const getPortfolioOrigin = (p) => {
  // Determine Architecture: Custom Bespoke vs Predefined Template
  const isCustom =
    p.creationType === "custom" ||
    p.template === "custom" ||
    Boolean(p.preferences?.customLayout) ||
    p.preferences?.style === "custom";

  const architecture = isCustom ? "custom" : "template";

  const rawSource = (p.inputSource || "").toLowerCase().trim();
  const titleLower = (p.title || "").toLowerCase();
  const taglineLower = (p.tagline || "").toLowerCase();
  const descLower = (p.description || "").toLowerCase();

  let source;

  if (rawSource === "linkedin") {
    source = "linkedin";
  } else if (rawSource === "github") {
    source = "github";
  } else if (rawSource === "resume") {
    source = "resume";
  } else if (rawSource === "form" || rawSource === "manual" || p.creationType === "manual" || p.creationMode === "manual") {
    source = "form";
  } else if (rawSource === "custom" || isCustom) {
    source = "custom";
  } else {
    // Fallback for legacy portfolios that lack inputSource field
    if (titleLower.includes("linkedin") || taglineLower.includes("linkedin")) {
      source = "linkedin";
    } else if (titleLower.includes("github") || taglineLower.includes("github")) {
      source = "github";
    } else if (titleLower.includes("resume") || descLower.includes("resume") || p.resumeText || p.resumeUrl) {
      source = "resume";
    } else if (titleLower.includes("form") || titleLower.includes("manual") || descLower.includes("manual")) {
      source = "form";
    } else if (isCustom) {
      source = "custom";
    } else {
      source = "template";
    }
  }

  return { isCustom, architecture, source };
};

const MyPortfoliosPage = () => {
  const dispatch = useDispatch();
  const { portfolios = [], loading } = useSelector((state) => state.portfolio);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'published' | 'draft'
  const [roleFilter, setRoleFilter] = useState("all");
  const [originFilter, setOriginFilter] = useState("all"); // 'all' | 'resume' | 'github' | 'linkedin' | 'custom' | 'template' | 'form'
  const [viewMode, setViewMode] = useState("grouped"); // 'grouped' | 'grid'

  // Modals state
  const [activeHistoryPortfolio, setActiveHistoryPortfolio] = useState(null);
  const [activeDeployPortfolio, setActiveDeployPortfolio] = useState(null);
  const [deployModalMode, setDeployModalMode] = useState("deploy"); // 'deploy' | 'github'

  // Download menu states
  const [downloadingPortfolioId, setDownloadingPortfolioId] = useState(null);
  const [activeDownloadMenuId, setActiveDownloadMenuId] = useState(null);

  // Close download menu on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".download-menu-container")) {
        setActiveDownloadMenuId(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  useEffect(() => {
    dispatch(fetchPortfolios());
  }, [dispatch]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    const result = await dispatch(deletePortfolio(id));
    if (deletePortfolio.fulfilled.match(result)) {
      toast.success("Portfolio deleted successfully");
    } else {
      toast.error(result.payload || "Failed to delete portfolio");
    }
  };

  const handleDuplicate = async (id) => {
    toast.loading("Duplicating portfolio for career specialization...", { id: "dup" });
    try {
      const res = await duplicatePortfolio(id);
      toast.dismiss("dup");
      if (res.data?.success) {
        toast.success("Portfolio duplicated! Ready for role customization ✨");
        dispatch(fetchPortfolios());
      }
    } catch {
      toast.dismiss("dup");
      toast.error("Failed to duplicate portfolio");
    }
  };

  const handleToggleStatus = async (portfolio) => {
    const newStatus = portfolio.status === "Published" ? "Draft" : "Published";
    const result = await dispatch(
      updatePortfolio({
        id: portfolio._id,
        data: { status: newStatus, isPublic: newStatus === "Published" },
      }),
    );

    if (updatePortfolio.fulfilled.match(result)) {
      toast.success(`Portfolio marked as ${newStatus}`);
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleCopyShareLink = (id) => {
    const publicUrl = `${window.location.origin}/p/${id}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Public link copied to clipboard! 📋");
  };

  const handleDownloadWebsiteHtml = async (p) => {
    try {
      setDownloadingPortfolioId(p._id);
      setActiveDownloadMenuId(null);
      const toastId = toast.loading("Generating standalone portfolio HTML...");
      const res = await downloadPortfolioHtml(p._id);
      const blob = new Blob([res.data], { type: "text/html;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const safeTitle = (p.name || p.title || "portfolio")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeTitle || "portfolio"}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success("Portfolio HTML downloaded! 🌐 (Double-click to view offline)", { id: toastId });
    } catch {
      toast.error("Failed to download portfolio HTML.");
    } finally {
      setDownloadingPortfolioId(null);
    }
  };

  const handleDownloadWebsiteZip = async (p) => {
    try {
      setDownloadingPortfolioId(p._id);
      setActiveDownloadMenuId(null);
      const toastId = toast.loading("Packaging standalone portfolio website (.zip)...");
      const res = await downloadPortfolioZip(p._id);
      const blob = new Blob([res.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const safeTitle = (p.name || p.title || "portfolio")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeTitle || "portfolio"}-website.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success("Portfolio website package downloaded! 🚀 (Contains index.html ready to view offline)", { id: toastId });
    } catch {
      toast.error("Failed to download portfolio website package.");
    } finally {
      setDownloadingPortfolioId(null);
    }
  };

  const handleExportJSON = (p) => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(p, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${(p.title || "portfolio").replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Portfolio JSON exported! 💾");
  };

  // Distinct roles for secondary tab filtering
  const distinctRoles = useMemo(() => {
    return Array.from(
      new Set(
        portfolios
          .map((p) => p.targetRole || p.tagline?.split(" ")[0])
          .filter(Boolean),
      ),
    );
  }, [portfolios]);

  // Statistical counts for origin & architecture tabs
  const counts = useMemo(() => {
    const active = portfolios.filter((p) => !p.isArchived);
    return {
      all: active.length,
      resume: active.filter((p) => getPortfolioOrigin(p).source === "resume").length,
      github: active.filter((p) => getPortfolioOrigin(p).source === "github").length,
      linkedin: active.filter((p) => getPortfolioOrigin(p).source === "linkedin").length,
      custom: active.filter((p) => getPortfolioOrigin(p).architecture === "custom").length,
      template: active.filter((p) => getPortfolioOrigin(p).source === "template").length,
      form: active.filter((p) => getPortfolioOrigin(p).source === "form").length,
    };
  }, [portfolios]);

  // Filtered list based on search, status, target role, and origin
  const filteredPortfolios = useMemo(() => {
    return portfolios.filter((p) => {
      const origin = getPortfolioOrigin(p);

      const matchesSearch =
        (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.template || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.targetRole || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.github || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.linkedin || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (p.status || "Draft").toLowerCase() === filterStatus.toLowerCase();

      const matchesRole =
        roleFilter === "all" ||
        (p.targetRole || "").toLowerCase().includes(roleFilter.toLowerCase());

      let matchesOrigin = true;
      if (originFilter === "resume") {
        matchesOrigin = origin.source === "resume";
      } else if (originFilter === "github") {
        matchesOrigin = origin.source === "github";
      } else if (originFilter === "linkedin") {
        matchesOrigin = origin.source === "linkedin";
      } else if (originFilter === "custom") {
        matchesOrigin = origin.architecture === "custom";
      } else if (originFilter === "template") {
        matchesOrigin = origin.source === "template";
      } else if (originFilter === "form") {
        matchesOrigin = origin.source === "form";
      }

      return matchesSearch && matchesStatus && matchesRole && matchesOrigin && !p.isArchived;
    });
  }, [portfolios, searchQuery, filterStatus, roleFilter, originFilter]);

  // Group definitions for Categorized/Grouped view
  const ORIGIN_GROUPS = [
    {
      id: "resume",
      title: "Created from Uploaded Resumes",
      subtitle: "AI-parsed from authentic CV/Resume documents with verified credentials.",
      icon: FileText,
      iconColor: "text-emerald-400",
      accentBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
      filterFn: (p) => getPortfolioOrigin(p).source === "resume",
      cta: {
        label: "Upload Resume with AI",
        link: "/portfolio-generator?mode=new",
      },
    },
    {
      id: "github",
      title: "Created via GitHub Repositories",
      subtitle: "Synthesized directly from GitHub repos, commits, and language stats.",
      icon: FaGithub,
      iconColor: "text-purple-400",
      accentBg: "bg-purple-500/10 border-purple-500/20 text-purple-300",
      filterFn: (p) => getPortfolioOrigin(p).source === "github",
      cta: {
        label: "Sync GitHub Profile",
        link: "/portfolio-generator?mode=new",
      },
    },
    {
      id: "linkedin",
      title: "Created from LinkedIn Profile",
      subtitle: "Connected directly via public LinkedIn profile URL.",
      icon: FaLinkedin,
      iconColor: "text-sky-400",
      accentBg: "bg-sky-500/10 border-sky-500/20 text-sky-300",
      filterFn: (p) => getPortfolioOrigin(p).source === "linkedin",
      cta: {
        label: "Import from LinkedIn URL",
        link: "/portfolio-generator?mode=new",
      },
    },
    {
      id: "form",
      title: "Created via Manual Details Form",
      subtitle: "Custom-configured by entering authentic roles, credentials, and achievements manually.",
      icon: Edit,
      iconColor: "text-amber-400",
      accentBg: "bg-amber-500/10 border-amber-500/20 text-amber-300",
      filterFn: (p) => getPortfolioOrigin(p).source === "form",
      cta: {
        label: "Create via Manual Form",
        link: "/portfolio-generator?mode=new",
      },
    },
    {
      id: "template",
      title: "Curated Predefined Templates",
      subtitle: "Built with signature themes (Apple, Cyberpunk, Google, Startup, Developer, Minimal).",
      icon: Layers,
      iconColor: "text-indigo-400",
      accentBg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-300",
      filterFn: (p) => getPortfolioOrigin(p).source === "template",
      cta: {
        label: "Browse 14 Themes",
        link: "/portfolio-generator?mode=new",
      },
    },
  ];

  // Helper to render a single portfolio card
  const renderPortfolioCard = (portfolio) => {
    const isPublished = portfolio.status === "Published";
    const origin = getPortfolioOrigin(portfolio);

    const versions = portfolio.versions || [];
    const currentSnapshot = versions.length > 0 ? versions[versions.length - 1] : null;
    const snapshotName = currentSnapshot?.name || "Initial Creation";
    const snapshotSummary = currentSnapshot?.changeSummary || snapshotName;
    const snapshotDate = currentSnapshot?.createdAt || portfolio.updatedAt || portfolio.createdAt;
    const formattedDate = formatIndianDate(snapshotDate);
    const relativeTime = formatRelativeTime(snapshotDate);
    const snapshotInfo = `${snapshotSummary}${formattedDate ? ` • ${formattedDate}` : ""}`;

    const rawCardUrl = portfolio.deployedUrl || "";
    const isCardDeployed = Boolean(rawCardUrl && portfolio.deploymentStatus === "Live");
    const isCloudLive = isCardDeployed && !rawCardUrl.includes("localhost") && !rawCardUrl.includes("127.0.0.1");
    const cardLiveUrl = rawCardUrl || `${window.location.origin}/p/${portfolio._id}`;


    return (
      <div
        key={portfolio._id}
        className="rounded-3xl bg-zinc-900/75 backdrop-blur-md border border-white/[0.08] hover:border-indigo-500/40 p-6 flex flex-col justify-between space-y-5 transition duration-300 shadow-xl group hover:shadow-2xl hover:shadow-indigo-950/30 hover:scale-[1.01]"
      >
        {/* Top Badges Bar: Origin, Mode, Status, Live */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Source Origin Badge */}
            {origin.source === "resume" && (
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                <FileText size={11} />
                <span>Resume Upload</span>
              </span>
            )}
            {origin.source === "github" && (
              <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-300 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                <FaGithub size={11} />
                <span>GitHub Sync</span>
              </span>
            )}
            {origin.source === "linkedin" && (
              <span className="px-2.5 py-1 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-400 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                <FaLinkedin size={11} />
                <span>LinkedIn URL</span>
              </span>
            )}
            {origin.source === "template" && (
              <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                <Layers size={11} />
                <span>Predefined Theme</span>
              </span>
            )}
            {origin.source === "form" && (
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                <Edit size={11} />
                <span>Manual Form</span>
              </span>
            )}

            {/* Architecture Mode Badge */}
            <span className="px-2 py-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
              {portfolio.template || "modern"} theme
            </span>

            {/* Live Deployment Badge */}
            {isCardDeployed && (
              <span
                className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold flex items-center gap-1 uppercase tracking-wider border ${
                  isCloudLive
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                    : "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isCloudLive ? "bg-emerald-400 animate-pulse" : "bg-indigo-400"
                  }`}
                ></span>
                <span>{isCloudLive ? `${(portfolio.deploymentPlatform || "Netlify").toUpperCase()} 24/7 CLOUD` : "LOCAL PREVIEW"}</span>
              </span>
            )}
          </div>

          {/* Status Toggle */}
          <button
            onClick={() => handleToggleStatus(portfolio)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition cursor-pointer shrink-0 ${
              isPublished
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
            }`}
          >
            {isPublished ? <Globe size={10} /> : <Lock size={10} />}
            <span>{portfolio.status || "Draft"}</span>
          </button>
        </div>

        {/* Title & Role Info */}
        <div className="space-y-1.5">
          <Link
            to={`/portfolio/${portfolio._id}`}
            className="text-lg font-bold text-white group-hover:text-indigo-300 transition block truncate"
          >
            {portfolio.title}
          </Link>
          <p className="text-xs text-zinc-400 truncate font-light leading-relaxed">
            {portfolio.tagline || portfolio.description || "Software Engineer"}
          </p>
          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            {portfolio.targetRole && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
                {portfolio.targetRole}
              </span>
            )}
            {portfolio.targetCompany && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Target: {portfolio.targetCompany}
              </span>
            )}
          </div>
        </div>

        {/* Origin Snippet & Quick Verification Info */}
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2 text-xs text-zinc-400">
          {/* Origin detail */}
          <div className="flex items-center justify-between text-[11px] pb-1 border-b border-zinc-900">
            <span className="text-zinc-500 font-mono text-[10px] uppercase">Creation Basis</span>
            {origin.source === "github" && portfolio.github ? (
              <a
                href={portfolio.github.startsWith("http") ? portfolio.github : `https://github.com/${portfolio.github}`}
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:underline flex items-center gap-1 font-mono text-[10px] truncate max-w-[170px]"
              >
                <FaGithub size={11} />
                <span>@{portfolio.github.replace("https://github.com/", "")}</span>
                <ArrowUpRight size={10} />
              </a>
            ) : origin.source === "linkedin" && portfolio.linkedin ? (
              <a
                href={portfolio.linkedin.startsWith("http") ? portfolio.linkedin : `https://${portfolio.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:underline flex items-center gap-1 font-mono text-[10px] truncate max-w-[170px]"
              >
                <FaLinkedin size={11} />
                <span>in/{portfolio.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, "").replace(/\/$/, "")}</span>
                <ArrowUpRight size={10} />
              </a>
            ) : origin.source === "resume" ? (
              <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                <FileText size={11} />
                <span>Parsed Resume Doc</span>
              </span>
            ) : origin.isCustom ? (
              <span className="text-fuchsia-400 font-mono text-[10px] flex items-center gap-1">
                <Sliders size={11} />
                <span>{portfolio.preferences?.customLayout?.layoutStyle?.toUpperCase() || "BENTO"} Canvas</span>
              </span>
            ) : (
              <span className="text-zinc-400 font-mono text-[10px]">
                Predefined Theme ({portfolio.template?.toUpperCase()})
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span>Projects: {portfolio.projects?.length || 0}</span>
            <span>Skills: {portfolio.skills?.length || 0}</span>
            <span
              className="text-zinc-400 font-medium truncate max-w-[150px] text-right"
              title={`${snapshotInfo}${relativeTime && relativeTime !== formattedDate ? ` (${relativeTime})` : ""}`}
            >
              {relativeTime ? `Updated ${relativeTime}` : formattedDate || snapshotSummary}
            </span>
          </div>

          {/* Live Link Display */}
          {isCardDeployed ? (
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-900">
              <a
                href={cardLiveUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline truncate flex items-center gap-1 font-mono min-w-0"
                title={cardLiveUrl}
              >
                <Globe size={11} className="shrink-0" />
                <span className="truncate">Live: {cardLiveUrl}</span>
              </a>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(cardLiveUrl);
                  toast.success("Live portfolio URL copied! 📋");
                }}
                className="p-1 rounded text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition shrink-0 cursor-pointer"
                title="Copy live link"
              >
                <Copy size={12} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-900">
              <span>Edge Status: Offline</span>
              <button
                type="button"
                onClick={() => setActiveDeployPortfolio(portfolio)}
                className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                Deploy Now →
              </button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-2 border-t border-zinc-850 pt-4">
          <div className="grid grid-cols-2 gap-2">
            {isCardDeployed ? (
              <a
                href={cardLiveUrl}
                target="_blank"
                rel="noreferrer"
                className="py-2 text-center rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Open Live Site</span>
                <ExternalLink size={12} />
              </a>
            ) : (
              <Link
                to={`/portfolio/${portfolio._id}`}
                className="py-2 text-center rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white text-xs font-semibold transition"
              >
                Preview
              </Link>
            )}
            <button
              onClick={() => {
                setDeployModalMode("deploy");
                setActiveDeployPortfolio(portfolio);
              }}
              className="py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Cloud size={13} />
              <span>{isCardDeployed ? "Redeploy" : "1-Click Deploy"}</span>
            </button>
          </div>

          {/* Push to GitHub Button */}
          <button
            type="button"
            onClick={() => {
              setDeployModalMode("github");
              setActiveDeployPortfolio(portfolio);
            }}
            className="w-full py-2 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm group"
          >
            <FaGithub size={13} className="text-purple-400 group-hover:scale-110 transition-transform" />
            <span>{portfolio.githubRepoUrl ? "GitHub Synced (Push Update)" : "Push to GitHub"}</span>
            {portfolio.githubRepoUrl && (
              <span className="text-[9px] font-mono bg-purple-500/25 border border-purple-500/30 px-1.5 py-0.5 rounded text-purple-200">
                Synced
              </span>
            )}
          </button>

          <div className="flex items-center justify-between text-zinc-400 text-xs pt-1">
            <button
              onClick={() => setActiveHistoryPortfolio(portfolio)}
              title={`${snapshotInfo} • Click to browse timeline`}
              className="p-2 rounded-lg hover:bg-zinc-800 hover:text-white transition cursor-pointer"
            >
              <GitBranch size={14} />
            </button>

            <button
              onClick={() => handleDuplicate(portfolio._id)}
              title="Duplicate for another role"
              className="p-2 rounded-lg hover:bg-zinc-800 hover:text-white transition cursor-pointer"
            >
              <Copy size={14} />
            </button>

            <button
              onClick={() => handleCopyShareLink(portfolio._id)}
              title="Copy public link"
              className="p-2 rounded-lg hover:bg-zinc-800 hover:text-white transition cursor-pointer"
            >
              <Share2 size={14} />
            </button>

            {/* Download Portfolio Menu & Button */}
            <div className="relative download-menu-container">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDownloadMenuId(
                    activeDownloadMenuId === portfolio._id ? null : portfolio._id
                  );
                }}
                disabled={downloadingPortfolioId === portfolio._id}
                title="Download Portfolio (HTML / ZIP / Resume)"
                className={`p-2 rounded-lg transition cursor-pointer flex items-center justify-center ${
                  activeDownloadMenuId === portfolio._id
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {downloadingPortfolioId === portfolio._id ? (
                  <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download size={14} />
                )}
              </button>

              {activeDownloadMenuId === portfolio._id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-full right-0 mb-2 w-72 p-2 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 shadow-2xl shadow-black/90 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1"
                >
                  <div className="px-2 py-1 border-b border-zinc-800/80 flex items-center justify-between text-[11px] font-bold text-zinc-300">
                    <span className="flex items-center gap-1.5 text-purple-400">
                      <Sparkles size={12} />
                      <span>Download Portfolio</span>
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                      Export
                    </span>
                  </div>

                  {/* 1. Standalone Single-File HTML */}
                  <button
                    type="button"
                    onClick={() => handleDownloadWebsiteHtml(portfolio)}
                    className="w-full p-2.5 rounded-xl hover:bg-zinc-800/90 text-left transition flex items-start gap-2.5 group cursor-pointer border border-transparent hover:border-emerald-500/30"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black transition shrink-0">
                      <Globe size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white group-hover:text-emerald-300 transition">
                          Single-File HTML (.html)
                        </span>
                        <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                          INSTANT
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-tight mt-0.5">
                        Double-click to open &amp; view directly in any browser offline.
                      </p>
                    </div>
                  </button>

                  {/* 2. Full Website Package (.zip) */}
                  <button
                    type="button"
                    onClick={() => handleDownloadWebsiteZip(portfolio)}
                    className="w-full p-2.5 rounded-xl hover:bg-zinc-800/90 text-left transition flex items-start gap-2.5 group cursor-pointer border border-transparent hover:border-purple-500/30"
                  >
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition shrink-0">
                      <Archive size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white group-hover:text-purple-300 transition">
                          Website Package (.zip)
                        </span>
                        <span className="text-[9px] font-mono bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">
                          HOSTING
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-tight mt-0.5">
                        Complete bundle with index.html + Netlify/Vercel configs.
                      </p>
                    </div>
                  </button>

                  {/* 3. ATS-Optimized Markdown Resume */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDownloadMenuId(null);
                      downloadATSResume(portfolio);
                      toast.success("ATS-Optimized Resume (.md) downloaded! 📄");
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-zinc-800/90 text-left transition flex items-start gap-2.5 group cursor-pointer border border-transparent hover:border-blue-500/30"
                  >
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition shrink-0">
                      <FileText size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-white group-hover:text-blue-300 transition block">
                        ATS Resume (.md)
                      </span>
                      <p className="text-[10px] text-zinc-400 leading-tight mt-0.5">
                        Clean markdown text formatted for applications.
                      </p>
                    </div>
                  </button>

                  {/* 4. Raw JSON Backup */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDownloadMenuId(null);
                      handleExportJSON(portfolio);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/70 text-left transition flex items-center justify-between text-[11px] text-zinc-400 hover:text-zinc-200 cursor-pointer border-t border-zinc-800/80 pt-2"
                  >
                    <span>Raw Database Backup (.json)</span>
                    <span className="text-[9px] font-mono text-zinc-500">JSON</span>
                  </button>
                </div>
              )}
            </div>

            <Link
              to={`/portfolio/edit/${portfolio._id}`}
              title="Edit portfolio"
              className="p-2 rounded-lg hover:bg-zinc-800 hover:text-white transition"
            >
              <Edit size={14} />
            </Link>

            <button
              onClick={() => handleDelete(portfolio._id, portfolio.title)}
              title="Delete portfolio"
              className="p-2 rounded-lg hover:bg-rose-500/20 hover:text-rose-400 transition cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#0B0E17] text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <WorkspaceBackdrop />
        <Topbar />

        <main className="relative z-10 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8 pb-36">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-2">
                <Layers size={13} />
                <span>Organized Portfolio Hub</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Portfolio Library
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                Maintain and organize portfolios categorized by creation source (Resume, GitHub, LinkedIn) and architecture (Custom Studio vs Predefined Themes).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/portfolio-generator?mode=new"
                onClick={() => dispatch(clearGeneratedPortfolio())}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-2.5 text-xs font-bold transition shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles size={15} />
                <span>AI Builder Studio</span>
              </Link>

              <Link
                to="/portfolio/create"
                className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white px-4 py-2.5 text-xs font-semibold transition"
              >
                <Plus size={16} />
                <span>Manual Blank</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics / Origin Counter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                id: "all",
                label: "All Portfolios",
                count: counts.all,
                icon: Layers,
                color: "text-white",
                bg: "bg-zinc-900/75 hover:bg-zinc-900/95 border-white/[0.08] backdrop-blur-md",
                activeBg: "bg-zinc-800/90 border-indigo-400/70 text-white shadow-lg shadow-indigo-950/30 backdrop-blur-md",
              },
              {
                id: "resume",
                label: "From Resume",
                count: counts.resume,
                icon: FileText,
                color: "text-emerald-400",
                bg: "bg-zinc-900/70 hover:bg-zinc-900/95 border-white/[0.08] backdrop-blur-md",
                activeBg: "bg-emerald-950/50 border-emerald-500 text-emerald-300 shadow-emerald-500/10 backdrop-blur-md",
              },
              {
                id: "github",
                label: "From GitHub",
                count: counts.github,
                icon: FaGithub,
                color: "text-purple-400",
                bg: "bg-zinc-900/70 hover:bg-zinc-900/95 border-white/[0.08] backdrop-blur-md",
                activeBg: "bg-purple-950/50 border-purple-500 text-purple-300 shadow-purple-500/10 backdrop-blur-md",
              },
              {
                id: "linkedin",
                label: "From LinkedIn",
                count: counts.linkedin,
                icon: FaLinkedin,
                color: "text-sky-400",
                bg: "bg-zinc-900/70 hover:bg-zinc-900/95 border-white/[0.08] backdrop-blur-md",
                activeBg: "bg-sky-950/50 border-sky-500 text-sky-300 shadow-sky-500/10 backdrop-blur-md",
              },
              {
                id: "form",
                label: "Manual Form",
                count: counts.form,
                icon: Edit,
                color: "text-amber-400",
                bg: "bg-zinc-900/70 hover:bg-zinc-900/95 border-white/[0.08] backdrop-blur-md",
                activeBg: "bg-amber-950/50 border-amber-500 text-amber-300 shadow-amber-500/10 backdrop-blur-md",
              },
              {
                id: "template",
                label: "Predefined Themes",
                count: counts.template,
                icon: Layers,
                color: "text-indigo-400",
                bg: "bg-zinc-900/70 hover:bg-zinc-900/95 border-white/[0.08] backdrop-blur-md",
                activeBg: "bg-indigo-950/50 border-indigo-500 text-indigo-300 shadow-indigo-500/10 backdrop-blur-md",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              const isSelected = originFilter === stat.id;
              return (
                <button
                  key={stat.id}
                  onClick={() => setOriginFilter(stat.id)}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected ? stat.activeBg : stat.bg
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 truncate">
                      {stat.label}
                    </span>
                    <Icon size={14} className={stat.color} />
                  </div>
                  <div className="text-xl font-black text-white">
                    {stat.count}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Search, Filter Toolbar & View Mode Toggle */}
          <div className="space-y-4 bg-zinc-900/70 backdrop-blur-md border border-white/[0.08] p-5 rounded-3xl shadow-xl">
            {/* Top Toolbar: Search + View Mode Switcher + Status */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  type="text"
                  placeholder="Search by title, role, template, or @handle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                />
              </div>

              {/* View Layout Switcher & Status Filter */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* View Arrangement Toggle: Grouped vs Grid */}
                <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode("grouped")}
                    className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      viewMode === "grouped"
                        ? "bg-indigo-600 text-white shadow font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                    title="Group portfolios by creation method (Resume, GitHub, LinkedIn, Custom Studio)"
                  >
                    <Layers size={13} />
                    <span>Group by Origin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      viewMode === "grid"
                        ? "bg-indigo-600 text-white shadow font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                    title="View all portfolios in a single unified grid"
                  >
                    <LayoutGrid size={13} />
                    <span>Standard Grid</span>
                  </button>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                  {["all", "published", "draft"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                        filterStatus === status
                          ? "bg-zinc-800 text-white shadow border border-zinc-700"
                          : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Origin & Architecture Filter Bar */}
            <div className="flex items-center gap-2 pt-3 border-t border-zinc-850 overflow-x-auto text-xs scrollbar-none">
              <span className="text-[11px] text-zinc-500 font-mono uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Filter size={11} />
                <span>Filter By:</span>
              </span>

              {[
                { id: "all", label: "All Portfolios", count: counts.all, icon: null },
                { id: "resume", label: "📄 By Resume", count: counts.resume, icon: null },
                { id: "github", label: "🐙 By GitHub", count: counts.github, icon: null },
                { id: "linkedin", label: "💼 By LinkedIn", count: counts.linkedin, icon: null },
                { id: "form", label: "📝 By Manual Form", count: counts.form, icon: null },
                { id: "template", label: "📦 Predefined Themes", count: counts.template, icon: null },
              ].map((pill) => {
                const isActive = originFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => setOriginFilter(pill.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "bg-indigo-600 text-white font-bold shadow"
                        : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800/80 hover:border-zinc-700"
                    }`}
                  >
                    <span>{pill.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? "bg-white/20 text-white" : "bg-zinc-900 text-zinc-500"
                    }`}>
                      {pill.count}
                    </span>
                  </button>
                );
              })}

              {originFilter !== "all" && (
                <button
                  onClick={() => setOriginFilter("all")}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline ml-auto shrink-0 cursor-pointer"
                >
                  Clear Origin Filter
                </button>
              )}
            </div>

            {/* Target Role Pills */}
            {distinctRoles.length > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-850/60 overflow-x-auto text-xs scrollbar-none">
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider shrink-0">
                  Target Roles:
                </span>
                <button
                  onClick={() => setRoleFilter("all")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                    roleFilter === "all"
                      ? "bg-zinc-800 text-white font-bold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  All ({portfolios.length})
                </button>
                {distinctRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                      roleFilter === role
                        ? "bg-zinc-800 text-white font-bold"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Portfolios Display */}
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-zinc-500 text-xs font-mono">Loading your portfolio library...</p>
            </div>
          ) : filteredPortfolios.length === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-12 text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto">
                <Layers size={24} />
              </div>
              <h2 className="text-xl font-bold text-white">No Portfolios Found</h2>
              <p className="text-zinc-400 text-xs max-w-md mx-auto">
                {originFilter !== "all"
                  ? `No portfolios matching the "${originFilter.toUpperCase()}" filter. Create one now or clear the filter.`
                  : "Start by generating your first role-tailored portfolio or create a manual one from scratch."}
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                {originFilter !== "all" && (
                  <button
                    onClick={() => setOriginFilter("all")}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition cursor-pointer"
                  >
                    Show All Portfolios
                  </button>
                )}
                <Link
                  to="/portfolio-generator?mode=new"
                  onClick={() => dispatch(clearGeneratedPortfolio())}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/20"
                >
                  <Sparkles size={14} />
                  <span>Launch AI Builder Studio</span>
                </Link>
              </div>
            </div>
          ) : viewMode === "grouped" && originFilter === "all" ? (
            /* ========================================================= */
            /* VIEW 1: Grouped By Origin (Resume, GitHub, LinkedIn, etc) */
            /* ========================================================= */
            <div className="space-y-12">
              {ORIGIN_GROUPS.map((group) => {
                const groupItems = filteredPortfolios.filter(group.filterFn);
                const GroupIcon = group.icon;

                // Only render group section if it has items or search is empty
                if (groupItems.length === 0) return null;

                return (
                  <section key={group.id} className="space-y-4">
                    {/* Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${group.accentBg}`}>
                          <GroupIcon size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-white tracking-tight">
                              {group.title}
                            </h2>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800 font-bold">
                              {groupItems.length} {groupItems.length === 1 ? "Portfolio" : "Portfolios"}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 font-light">
                            {group.subtitle}
                          </p>
                        </div>
                      </div>

                      <Link
                        to={group.cta.link}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition self-start sm:self-auto"
                      >
                        <span>+ {group.cta.label}</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>

                    {/* Cards Grid for this group */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
                      {groupItems.map((portfolio) => renderPortfolioCard(portfolio))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            /* ========================================================= */
            /* VIEW 2: Standard Unified Grid (or Filtered Sub-View)      */
            /* ========================================================= */
            <div className="space-y-4">
              {originFilter !== "all" && (
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-mono uppercase">Filtered View:</span>
                    <span className="text-sm font-bold text-white capitalize">
                      {originFilter === "resume" && "📄 Created from Uploaded Resume"}
                      {originFilter === "github" && "🐙 Created via GitHub Sync"}
                      {originFilter === "linkedin" && "💼 Created from LinkedIn URL"}
                      {originFilter === "form" && "📝 Created via Manual Details Form"}
                      {originFilter === "template" && "📦 Curated Predefined Themes"}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
                      {filteredPortfolios.length} items
                    </span>
                  </div>
                  <button
                    onClick={() => setOriginFilter("all")}
                    className="text-xs text-indigo-400 hover:text-white transition cursor-pointer"
                  >
                    View All Categories →
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPortfolios.map((portfolio) => renderPortfolioCard(portfolio))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Version History Modal */}
      <VersionHistoryModal
        portfolio={activeHistoryPortfolio}
        isOpen={Boolean(activeHistoryPortfolio)}
        onClose={() => setActiveHistoryPortfolio(null)}
        onRestored={() => dispatch(fetchPortfolios())}
      />

      {/* 1-Click Deployment & GitHub Push Modal */}
      <DeploymentModal
        portfolio={activeDeployPortfolio}
        isOpen={Boolean(activeDeployPortfolio)}
        initialMode={deployModalMode}
        onClose={() => setActiveDeployPortfolio(null)}
        onDeployed={() => dispatch(fetchPortfolios())}
      />

      {/* Floating AI Copilot */}
      <AIChatAssistant portfolios={portfolios} />
    </div>
  );
};

export default MyPortfoliosPage;
