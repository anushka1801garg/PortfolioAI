import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Edit,
  Share2,
  ExternalLink,
  Globe,
  Lock,
  Cloud,
  History,
  ShieldCheck,
  Copy,
  Camera,
} from 'lucide-react';
import { FaGithub } from "react-icons/fa";

import {
  fetchPortfolioById,
  updatePortfolio,
} from "../../../redux/portfolio/portfolioSlice";
import TemplateRenderer from "../components/templates/TemplateRenderer";
import { TEMPLATES } from "../components/templates/templateList";
import DeploymentModal from "../components/DeploymentModal";
import VersionHistoryModal from "../components/VersionHistoryModal";
import ChangePhotoModal from "../components/ChangePhotoModal";
import AIChatAssistant from "../../../components/chat/AIChatAssistant";
import UpgradeModal from "../../../components/modals/UpgradeModal";
import MissingInfoPrompt from "../components/MissingInfoPrompt";
import {
  detectPortfolioMissingInfo,
  filterStillMissing,
} from "../utils/missingInfoUtils";

const PortfolioDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentPortfolio, loading } = useSelector((state) => state.portfolio);
  const { user } = useSelector((state) => state.auth);

  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deployModalMode, setDeployModalMode] = useState("deploy"); // 'deploy' | 'github'
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [missingInfo, setMissingInfo] = useState([]);
  const [showVerificationDrawer, setShowVerificationDrawer] = useState(false);

  useEffect(() => {
    dispatch(fetchPortfolioById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (currentPortfolio) {
      const detected = detectPortfolioMissingInfo(currentPortfolio);
      setMissingInfo(detected);
    }
  }, [currentPortfolio]);

  const handleUpdateMissingInfo = async (updatedData) => {
    const remaining = filterStillMissing(missingInfo, updatedData);
    setMissingInfo(remaining);

    const result = await dispatch(
      updatePortfolio({
        id,
        data: updatedData,
      }),
    );

    if (updatePortfolio.fulfilled.match(result)) {
      toast.success("Portfolio details updated & verified! ✨");
    } else {
      toast.error(result.payload || "Failed to update portfolio");
    }
  };

  const activeTemplate =
    currentPortfolio?.template ||
    (currentPortfolio?.customHtml || currentPortfolio?.sourceUrl ? "original" : "modern");

  const handleToggleStatus = async () => {
    if (!currentPortfolio) return;
    const newStatus =
      currentPortfolio.status === "Published" ? "Draft" : "Published";

    const result = await dispatch(
      updatePortfolio({
        id,
        data: { status: newStatus, isPublic: newStatus === "Published" },
      }),
    );

    if (updatePortfolio.fulfilled.match(result)) {
      toast.success(`Portfolio marked as ${newStatus}`);
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleCopyShareLink = () => {
    const publicUrl = `${window.location.origin}/p/${id}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Public link copied to clipboard! 📋");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090B] text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-400">Loading portfolio preview...</p>
        </div>
      </div>
    );
  }

  if (!currentPortfolio) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090B] text-white p-6">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold">Portfolio Not Found</h2>
          <p className="text-zinc-400 text-sm">
            This portfolio could not be located or may have been deleted.
          </p>
          <Link
            to="/portfolio"
            className="inline-block rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white"
          >
            Back to Portfolios
          </Link>
        </div>
      </div>
    );
  }

  const isPublished = currentPortfolio.status === "Published";

  // Check ownership: non-owners accessing /portfolio/:id should view public showcase /p/:id
  const currentUserId = (user?._id || user?.id || "").toString();
  const portfolioOwnerId = (
    currentPortfolio?.user?._id ||
    currentPortfolio?.user?.id ||
    currentPortfolio?.user ||
    ""
  ).toString();
  const isOwner = Boolean(currentUserId && portfolioOwnerId && currentUserId === portfolioOwnerId);

  if (currentPortfolio && !isOwner) {
    return <Navigate to={`/p/${id}`} replace />;
  }

  // Compute live URL: resolve legacy mock domain if needed
  const rawDeployedUrl = currentPortfolio.deployedUrl || "";
  const isDeployed = Boolean(rawDeployedUrl && currentPortfolio.deploymentStatus === "Live");
  const isCloudLive = isDeployed && !rawDeployedUrl.includes("localhost") && !rawDeployedUrl.includes("127.0.0.1");
  const liveUrl = rawDeployedUrl || `${window.location.origin}/p/${id}`;


  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      {/* Top Toolbar (Section 2.1 & 13) */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Back & Title */}
          <div className="flex items-center gap-4">
            <Link
              to="/portfolio"
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft size={16} />
              <span>Library</span>
            </Link>

            <div className="h-4 w-[1px] bg-zinc-800"></div>

            <div className="flex items-center gap-3">
              <h1 className="text-sm font-bold text-white max-w-xs truncate">
                {currentPortfolio.title}
              </h1>

              <button
                onClick={handleToggleStatus}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition cursor-pointer ${
                  isPublished
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {isPublished ? <Globe size={11} /> : <Lock size={11} />}
                <span>{currentPortfolio.status || "Draft"}</span>
              </button>
            </div>
          </div>

          {/* Theme Display & Interactive Switcher */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-zinc-500 font-medium">Theme:</span>
            <select
              value={activeTemplate}
              onChange={async (e) => {
                const newTmpl = e.target.value;
                try {
                  toast.loading(`Switching theme to "${TEMPLATES.find((t) => t.id === newTmpl)?.name || newTmpl}"...`, { id: "theme-change" });
                  const res = await dispatch(updatePortfolio({ id, data: { template: newTmpl } }));
                  toast.dismiss("theme-change");
                  if (updatePortfolio.fulfilled.match(res)) {
                    toast.success("Theme updated! 🎨");
                    dispatch(fetchPortfolioById(id));
                  }
                } catch {
                  toast.dismiss("theme-change");
                  toast.error("Failed to update theme");
                }
              }}
              className="bg-transparent text-zinc-100 font-semibold text-xs border-0 focus:outline-none cursor-pointer"
            >
              {(currentPortfolio?.customHtml || currentPortfolio?.sourceUrl || currentPortfolio?.website || currentPortfolio?.template === "original") && (
                <option value="original" className="bg-zinc-900 text-white">🌐 Original Website Theme</option>
              )}
              {TEMPLATES.filter((t) => t.id !== "original").map((t) => (
                <option key={t.id} value={t.id} className="bg-zinc-900 text-white">
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/analyzer?portfolioId=${id}`}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 px-3 py-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition"
              title="Analyze Score & Test Alternative Themes"
            >
              <ShieldCheck size={14} />
              <span>Analyze Score</span>
            </Link>

            {/* Live Site Button if deployed */}
            {isDeployed && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition shadow-sm ${
                  isCloudLive
                    ? "bg-emerald-600/25 border-emerald-500/40 text-emerald-300 hover:text-white"
                    : "bg-indigo-600/20 border-indigo-500/30 text-indigo-300 hover:text-white"
                }`}
                title={isCloudLive ? "Open 24/7 Global Cloud Site" : "Open Local Preview"}
              >
                <Globe size={14} className={isCloudLive ? "text-emerald-400" : "text-indigo-400"} />
                <span>{isCloudLive ? "Cloud Live" : "Local Preview"}</span>
                <ExternalLink size={11} />
              </a>
            )}

            <button
              onClick={() => setShowDeployModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-indigo-500/40 hover:bg-indigo-600/40 px-3.5 py-2 text-xs font-bold text-white transition cursor-pointer shadow-sm"
            >
              <Cloud size={14} className="text-indigo-300" />
              <span>{isCloudLive ? "Cloud Hosting" : "Deploy to Cloud"}</span>
            </button>

            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white transition cursor-pointer"
            >
              <History size={14} />
              <span>Versions</span>
            </button>

            <button
              onClick={handleCopyShareLink}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white transition cursor-pointer"
            >
              <Share2 size={14} />
              <span>Share</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPhotoModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-600/20 hover:bg-indigo-600/30 px-3.5 py-2 text-xs font-semibold text-indigo-300 hover:text-white transition cursor-pointer shadow-sm"
              title="Change Profile Photo / Avatar"
            >
              <Camera size={14} className="text-indigo-400" />
              <span>Change Photo</span>
            </button>

            <Link
              to={`/p/${id}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white transition"
            >
              <ExternalLink size={14} />
              <span>Public</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowVerificationDrawer((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer shadow-md ${
                showVerificationDrawer
                  ? "bg-indigo-700 text-white ring-2 ring-indigo-400/50 shadow-indigo-600/30"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
              }`}
              title="Click to edit portfolio sections and details"
            >
              <Edit size={14} />
              <span>{showVerificationDrawer ? "Close Edit" : "Edit Profile"}</span>
              {missingInfo.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-0.5" title={`${missingInfo.length} items to complete`}></span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Authentic Profile Verification & Section Edit Banner */}
      {showVerificationDrawer && currentPortfolio && (
        <MissingInfoPrompt
          missingInfo={missingInfo}
          portfolioData={currentPortfolio}
          onUpdatePortfolio={handleUpdateMissingInfo}
          onDismiss={() => setShowVerificationDrawer(false)}
        />
      )}

      {/* Persistent Live Deployment Banner */}
      {isDeployed && (
        <div
          className={`border-b px-6 py-2.5 transition ${
            isCloudLive
              ? "bg-gradient-to-r from-emerald-950/70 via-zinc-950 to-zinc-950 border-emerald-500/30"
              : "bg-gradient-to-r from-indigo-950/70 via-zinc-950 to-zinc-950 border-indigo-500/30"
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-2 w-2 relative shrink-0">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isCloudLive ? "bg-emerald-400" : "bg-indigo-400"
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isCloudLive ? "bg-emerald-500" : "bg-indigo-500"
                  }`}
                ></span>
              </span>
              <span
                className={`font-bold font-mono uppercase text-[11px] shrink-0 ${
                  isCloudLive ? "text-emerald-400" : "text-indigo-400"
                }`}
              >
                {isCloudLive
                  ? `24/7 Global Cloud (${(currentPortfolio.deploymentPlatform || "Netlify").toUpperCase()}):`
                  : "Local Dev Route (Active on Laptop):"}
              </span>
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-200 hover:text-white underline truncate max-w-md font-mono text-[11px]"
                title={liveUrl}
              >
                {liveUrl}
              </a>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(liveUrl);
                  toast.success("Live portfolio URL copied to clipboard! 📋");
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1.5 transition text-[11px] font-semibold cursor-pointer"
              >
                <Copy size={12} />
                <span>Copy Link</span>
              </button>
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className={`px-3 py-1 rounded-lg text-white flex items-center gap-1 transition text-[11px] font-bold shadow ${
                  isCloudLive ? "bg-emerald-600 hover:bg-emerald-500" : "bg-indigo-600 hover:bg-indigo-500"
                }`}
              >
                <span>{isCloudLive ? "Open Live Site" : "Preview"}</span>
                <ExternalLink size={11} />
              </a>
              {!isCloudLive ? (
                <button
                  type="button"
                  onClick={() => {
                    setDeployModalMode("deploy");
                    setShowDeployModal(true);
                  }}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition text-[11px] cursor-pointer shadow"
                >
                  Publish to 24/7 Cloud
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDeployModalMode("deploy");
                    setShowDeployModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition text-[11px] cursor-pointer"
                >
                  Manage Cloud
                </button>
              )}

              {/* Push to GitHub Button */}
              <button
                type="button"
                onClick={() => {
                  setDeployModalMode("github");
                  setShowDeployModal(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 hover:text-white transition text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <FaGithub size={12} className="text-purple-400" />
                <span>{currentPortfolio.githubRepoUrl ? "Sync to GitHub" : "Push to GitHub"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render Chosen Template with content preserved */}
      <TemplateRenderer
        portfolio={currentPortfolio}
        templateOverride={activeTemplate}
        onEditPhoto={() => setShowPhotoModal(true)}
        isOwner={true}
      />

      {/* Change Photo Modal */}
      <ChangePhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        portfolio={currentPortfolio}
      />

      {/* 1-Click Deployment & GitHub Push Modal */}
      <DeploymentModal
        portfolio={{ ...currentPortfolio, template: activeTemplate }}
        isOpen={showDeployModal}
        initialMode={deployModalMode}
        onClose={() => setShowDeployModal(false)}
        onDeployed={() => dispatch(fetchPortfolioById(id))}
      />

      {/* Version History & Rollback Modal */}
      <VersionHistoryModal
        portfolio={currentPortfolio}
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onRestored={() => dispatch(fetchPortfolioById(id))}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        targetFeature="Premium Pro Templates"
      />

      {/* Portfolio-Aware Copilot */}
      <AIChatAssistant portfolioData={currentPortfolio} />
    </div>
  );
};

export default PortfolioDetailsPage;
