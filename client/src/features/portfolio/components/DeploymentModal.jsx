import { useState, useEffect } from "react";
import {
  Cloud,
  Globe,
  Check,
  ExternalLink,
  X,
  Copy,
  CheckCircle2,
  Download,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  EyeOff,
  ShieldCheck,
  Trash2,
  Lock,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import toast from "react-hot-toast";
import {
  deployPortfolio,
  downloadPortfolioZip,
  pushPortfolioToGitHub,
  saveLiveCloudUrl,
  clearPortfolioDeployment,
  getGitHubOAuthUrl,
  getGitHubOAuthStatus,
  disconnectGitHubAccount,
} from "../services/portfolioService";

const DeploymentModal = ({
  portfolio,
  isOpen,
  onClose,
  onDeployed,
  initialMode = "deploy", // "deploy" | "github"
}) => {
  // Top Active Tab: "deploy" | "github"
  const [activeTab, setActiveTab] = useState(initialMode || "deploy");

  // Platform selection: "vercel" (recommended/100% public) | "netlify"
  const [selectedPlatform, setSelectedPlatform] = useState("vercel");
  const [subdomain, setSubdomain] = useState("");
  const [token, setToken] = useState("");
  const [tokenError, setTokenError] = useState("");

  // Deployment state
  const [deploying, setDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState("");
  const [isDeployed, setIsDeployed] = useState(false);
  const [isReDeploying, setIsReDeploying] = useState(false);
  const [copied, setCopied] = useState(false);

  // Manual Drop Live URL State (Method 2: Netlify Drop)
  const [manualLiveUrl, setManualLiveUrl] = useState("");
  const [savingManualUrl, setSavingManualUrl] = useState(false);

  // GitHub Push & OAuth State
  const [oauthStatus, setOauthStatus] = useState({
    isConnected: false,
    githubUsername: "",
    isOAuthConfigured: false,
  });
  const [loadingOAuth, setLoadingOAuth] = useState(false);
  const [showManualToken, setShowManualToken] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  const [githubRepoName, setGithubRepoName] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [showTokenPassword, setShowTokenPassword] = useState(false);
  const [rememberGithubToken, setRememberGithubToken] = useState(true);
  const [pushingToGithub, setPushingToGithub] = useState(false);
  const [githubResult, setGithubResult] = useState(null);
  const [showPagesHelp, setShowPagesHelp] = useState(false);

  // Clear GitHub token from browser storage
  const handleClearGithubToken = () => {
    localStorage.removeItem("portfolioai_github_token");
    setGithubToken("");
    toast.success("GitHub token cleared from browser storage 🔒");
  };

  // Standalone zip downloading state
  const [downloadingZip, setDownloadingZip] = useState(false);

  // Check OAuth status on open
  useEffect(() => {
    if (isOpen) {
      getGitHubOAuthStatus()
        .then((res) => {
          if (res.data?.success) {
            setOauthStatus(res.data);
            if (res.data.githubUsername) {
              setGithubUsername(res.data.githubUsername);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Initialize or reset state when modal opens
  useEffect(() => {
    if (portfolio && isOpen) {
      setActiveTab(initialMode || "deploy");

      const candidateName = (
        portfolio.name ||
        portfolio.title ||
        "portfolio"
      )
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 24);

      setSubdomain(candidateName || "my-portfolio");
      setGithubRepoName(`${candidateName || "my"}-portfolio`);

      // Load cached tokens from localStorage
      const cachedNetlifyToken = localStorage.getItem("portfolioai_netlify_token") || "";
      const cachedVercelToken = localStorage.getItem("portfolioai_vercel_token") || "";
      const cachedGithubToken = localStorage.getItem("portfolioai_github_token") || "";

      if (selectedPlatform === "vercel" && cachedVercelToken) {
        setToken(cachedVercelToken);
      } else if (selectedPlatform === "netlify" && cachedNetlifyToken) {
        setToken(cachedNetlifyToken);
      }

      if (cachedGithubToken) {
        setGithubToken(cachedGithubToken);
      }

      // Detect if portfolio already has a real cloud URL
      const existingUrl = portfolio.deployedUrl || "";
      if (
        existingUrl &&
        !existingUrl.includes("localhost") &&
        !existingUrl.includes("127.0.0.1")
      ) {
        setDeployedUrl(existingUrl);
        setIsDeployed(true);
        setIsReDeploying(false);
        if (existingUrl.includes("vercel.app")) {
          setSelectedPlatform("vercel");
        } else {
          setSelectedPlatform("netlify");
        }
      } else {
        setDeployedUrl("");
        setIsDeployed(false);
        setIsReDeploying(false);
      }

      // Pre-fill github username if user has github in portfolio
      const rawGh = portfolio.github || portfolio.contact?.github || "";
      if (rawGh) {
        const match = rawGh.match(/(?:github\.com\/|^@?)([a-zA-Z0-9_-]+)/i);
        if (match && match[1]) {
          setGithubUsername(match[1]);
        }
      }

      // Check existing githubRepoUrl
      if (portfolio.githubRepoUrl) {
        const repoUrl = portfolio.githubRepoUrl;
        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        const owner = match ? match[1] : "";
        const repo = match ? match[2].replace(/\.git$/, "") : "";
        setGithubResult({
          repoUrl,
          pagesUrl: owner && repo ? `https://${owner}.github.io/${repo}/` : null,
          pagesSettingsUrl: owner && repo ? `https://github.com/${owner}/${repo}/settings/pages` : null,
        });
      } else {
        setGithubResult(null);
      }
    }
  }, [portfolio, isOpen, initialMode]);

  // When user switches platform, update token from localStorage
  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform);
    setTokenError("");
    if (platform === "vercel") {
      setToken(localStorage.getItem("portfolioai_vercel_token") || "");
    } else {
      setToken(localStorage.getItem("portfolioai_netlify_token") || "");
    }
  };

  // 1-Click Connect with GitHub (OAuth)
  const handleConnectGitHubOAuth = async () => {
    try {
      setLoadingOAuth(true);
      const res = await getGitHubOAuthUrl();
      if (res.data?.success && res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error(
          res.data?.message ||
            "GitHub OAuth is not configured on the server yet. You can use the manual token option below."
        );
        setShowManualToken(true);
      }
    } catch {
      toast.error("Failed to connect with GitHub.");
      setShowManualToken(true);
    } finally {
      setLoadingOAuth(false);
    }
  };

  // Disconnect GitHub
  const handleDisconnectGitHub = async () => {
    try {
      await disconnectGitHubAccount();
      localStorage.removeItem("portfolioai_github_token");
      setGithubToken("");
      setOauthStatus({ isConnected: false, githubUsername: "", isOAuthConfigured: oauthStatus.isOAuthConfigured });
      toast.success("GitHub account disconnected & tokens purged 🔒");
    } catch {
      toast.error("Failed to disconnect.");
    }
  };

  if (!isOpen || !portfolio) return null;

  const cleanSubdomain = (subdomain || "portfolio")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const previewLiveUrl =
    selectedPlatform === "vercel"
      ? `https://${cleanSubdomain}.vercel.app/`
      : `https://${cleanSubdomain}.netlify.app/`;

  // Step 1: Handle Automated Cloud Deploy via API
  const handleDeploy = async () => {
    if (!cleanSubdomain) {
      toast.error("Please enter a valid subdomain name.");
      return;
    }

    if (!token.trim()) {
      toast.error(
        `Please enter your free ${selectedPlatform.toUpperCase()} access token, or use the 1-click Netlify Drop below.`
      );
      return;
    }

    try {
      setDeploying(true);
      setTokenError("");

      if (selectedPlatform === "vercel") {
        localStorage.setItem("portfolioai_vercel_token", token.trim());
      } else {
        localStorage.setItem("portfolioai_netlify_token", token.trim());
      }

      const res = await deployPortfolio({
        portfolioId: portfolio._id,
        platform: selectedPlatform,
        subdomain: cleanSubdomain,
        token: token.trim(),
        template: portfolio?.template,
        clientOrigin: window.location.origin,
      });

      if (res.data?.success) {
        const live = res.data.deployedUrl;
        setDeployedUrl(live);
        setIsDeployed(true);
        setIsReDeploying(false);
        setTokenError("");
        toast.success(`Successfully deployed to ${selectedPlatform.toUpperCase()} Cloud! 🚀`);
        if (onDeployed) onDeployed(res.data.portfolio);
      }
    } catch (err) {
      const rawMsg = err.response?.data?.message || err.message || "";
      const isAuthIssue =
        err.response?.data?.isAuthError ||
        err.response?.status === 401 ||
        err.response?.status === 403 ||
        rawMsg.toLowerCase().includes("access denied") ||
        rawMsg.toLowerCase().includes("unauthorized") ||
        rawMsg.toLowerCase().includes("invalid") ||
        rawMsg.toLowerCase().includes("expired") ||
        rawMsg.toLowerCase().includes("token");

      const platformName = selectedPlatform === "vercel" ? "Vercel" : "Netlify";

      if (isAuthIssue) {
        const clearMsg = `Your ${platformName} Personal Access Token is invalid, mistyped, or expired. Please check your token on ${platformName} and try again.`;
        setTokenError(clearMsg);
        toast.error(clearMsg, { duration: 6000 });
      } else {
        toast.error(rawMsg || `Deployment failed. Please verify your settings.`);
      }
    } finally {
      setDeploying(false);
    }
  };

  // Step 2: Handle GitHub Push (Works via OAuth OR Token)
  const handleGitHubPush = async (e) => {
    e?.preventDefault();

    const targetUser = oauthStatus.isConnected
      ? oauthStatus.githubUsername
      : githubUsername.trim();

    if (!targetUser) {
      toast.error("Please connect your GitHub account or enter your GitHub username.");
      return;
    }

    if (!oauthStatus.isConnected && !githubToken.trim()) {
      toast.error("Please provide your GitHub token or click 'Connect GitHub Account'.");
      setShowManualToken(true);
      return;
    }

    try {
      setPushingToGithub(true);

      if (rememberGithubToken && githubToken.trim()) {
        localStorage.setItem("portfolioai_github_token", githubToken.trim());
      } else {
        localStorage.removeItem("portfolioai_github_token");
      }

      const res = await pushPortfolioToGitHub({
        portfolioId: portfolio._id,
        githubUsername: targetUser,
        repoName: githubRepoName.trim() || undefined,
        githubToken: githubToken.trim() || undefined,
        template: portfolio?.template,
      });

      if (res.data?.success) {
        if (res.data.needsToken) {
          toast(res.data.message, { icon: "🔑" });
          setShowManualToken(true);
        } else {
          setGithubResult(res.data);
          toast.success("Portfolio pushed to GitHub successfully! 🐙");
          if (onDeployed && res.data.portfolio) onDeployed(res.data.portfolio);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to push to GitHub.");
    } finally {
      setPushingToGithub(false);
    }
  };

  // Reset / Clear Deployment
  const handleResetDeployment = async () => {
    try {
      await clearPortfolioDeployment(portfolio._id);
      setIsDeployed(false);
      setDeployedUrl("");
      setIsReDeploying(true);
      toast.success("Previous deployment reset. You can now deploy fresh!");
      if (onDeployed) {
        onDeployed({ ...portfolio, deployedUrl: "", deploymentStatus: "Idle" });
      }
    } catch {
      toast.error("Failed to reset deployment.");
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Link copied to clipboard! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Standalone ZIP package & open Netlify Drop
  const handleDownloadAndOpenNetlifyDrop = async () => {
    try {
      setDownloadingZip(true);
      const res = await downloadPortfolioZip(portfolio._id);
      const blob = new Blob([res.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cleanSubdomain}-standalone.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      window.open("https://app.netlify.com/drop", "_blank");

      toast.success(
        "ZIP downloaded & Netlify Drop opened! Drag & drop the ZIP into Netlify Drop to get your live link.",
        { duration: 6000 }
      );
    } catch {
      toast.error("Failed to download standalone bundle.");
    } finally {
      setDownloadingZip(false);
    }
  };

  // Save manual live URL (from Netlify Drop or custom domain)
  const handleSaveManualUrl = async (e) => {
    e?.preventDefault();
    if (!manualLiveUrl.trim()) {
      toast.error("Please enter your live Netlify or Vercel URL.");
      return;
    }

    try {
      setSavingManualUrl(true);
      const res = await saveLiveCloudUrl({
        portfolioId: portfolio._id,
        liveUrl: manualLiveUrl.trim(),
        platform: selectedPlatform,
      });

      if (res.data?.success) {
        setDeployedUrl(res.data.deployedUrl);
        setIsDeployed(true);
        setIsReDeploying(false);
        toast.success("Live URL saved successfully! 🚀");
        if (onDeployed) onDeployed(res.data.portfolio);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save live URL.");
    } finally {
      setSavingManualUrl(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-[#0e121a] border border-zinc-800 shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#121824] border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              {activeTab === "github" ? <FaGithub size={20} className="text-purple-400" /> : <Cloud size={20} />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{activeTab === "github" ? "Push to GitHub" : "Deploy Your Portfolio"}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </h2>
              <p className="text-xs text-zinc-400">
                {activeTab === "github"
                  ? "Push source code & enable GitHub Pages on your personal account."
                  : "Publish globally on Netlify or Vercel — 24/7 access on any device worldwide."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Top Tab Bar: Cloud Deploy vs Push to GitHub */}
        <div className="px-6 pt-4 pb-1 bg-[#0e121a]">
          <div className="grid grid-cols-2 p-1 bg-zinc-950/80 rounded-2xl border border-zinc-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("deploy")}
              className={`py-2 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === "deploy"
                  ? "bg-gradient-to-r from-emerald-600 to-indigo-600 text-white font-bold shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Cloud size={14} />
              <span>Cloud Deploy (Netlify/Vercel)</span>
              {isDeployed && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("github")}
              className={`py-2 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === "github"
                  ? "bg-purple-600 text-white font-bold shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <FaGithub size={14} />
              <span>Push to GitHub</span>
              {(portfolio.githubRepoUrl || oauthStatus.isConnected) && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              )}
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: CLOUD DEPLOY (NETLIFY / VERCEL) */}
          {activeTab === "deploy" && (
            <div className="space-y-6">
              {/* Successfully Deployed Banner */}
              {isDeployed && deployedUrl && !isReDeploying && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <CheckCircle2 size={16} />
                      <span>24/7 Live Cloud Deployment Active</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                      {selectedPlatform}
                    </span>
                  </div>

                  {/* The clean Live URL bar */}
                  <div className="flex items-center justify-between gap-2 p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
                    <a
                      href={deployedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs text-emerald-300 hover:underline truncate font-semibold flex items-center gap-1.5"
                      title={deployedUrl}
                    >
                      <Globe size={13} className="shrink-0 text-emerald-400" />
                      <span className="truncate">{deployedUrl}</span>
                    </a>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(deployedUrl)}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs transition cursor-pointer"
                        title="Copy URL"
                      >
                        {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                      <a
                        href={deployedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition shadow"
                      >
                        <span>Open</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>

                  {/* Netlify Visitor Access / 401 Notice */}
                  {(selectedPlatform === "netlify" || (deployedUrl && deployedUrl.includes("netlify.app"))) && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-amber-300">
                        <Lock size={14} className="shrink-0 text-amber-400" />
                        <span>Crucial: Ensure Site is Set to &quot;Public&quot; on Netlify</span>
                      </div>
                      <p className="text-[11px] text-amber-200/90 leading-relaxed">
                        Netlify teams now default new sites to <strong>&quot;Private (Team members only)&quot;</strong>. If someone visits your link and sees a login screen or 401 error, you must set the site to Public in Netlify:
                      </p>
                      <ol className="list-decimal list-inside text-[11px] space-y-1 text-zinc-300 font-medium">
                        <li>Open your <a href="https://app.netlify.com" target="_blank" rel="noreferrer" className="text-amber-400 underline font-semibold hover:text-amber-300">Netlify Dashboard ↗</a> and select your site.</li>
                        <li>Click <strong>Site configuration</strong> &rarr; <strong>General</strong> &rarr; <strong>Visitor access</strong>.</li>
                        <li>Change <strong>Project visibility</strong> from Private to <span className="text-emerald-400 font-bold">Public (Anyone with link)</span>.</li>
                      </ol>
                      <div className="pt-1 text-[10px] text-amber-400/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                        💡 <strong>Pro-Tip:</strong> In Netlify <strong>Team settings &rarr; General &rarr; Visitor access</strong>, set <strong>Default project visibility</strong> to <strong>Public</strong> so all future deploys are automatically public!
                      </div>
                    </div>
                  )}

                  {/* Re-deploy and Reset options */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setIsReDeploying(true)}
                      className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>Change Subdomain / Re-deploy</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetDeployment}
                      className="text-zinc-500 hover:text-red-400 text-[11px] transition cursor-pointer"
                    >
                      Reset Link
                    </button>
                  </div>
                </div>
              )}

              {/* Platform Choice & Configuration */}
              {(!isDeployed || isReDeploying) && (
                <div className="space-y-5">
                  {isReDeploying && (
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                        <Sparkles size={13} />
                        <span>Configuring New Deployment</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsReDeploying(false)}
                        className="text-[11px] text-zinc-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Question 1: Platform Choice */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                      1. Choose Personal Cloud Platform
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Vercel Option (RECOMMENDED) */}
                      <button
                        type="button"
                        onClick={() => handlePlatformChange("vercel")}
                        className={`p-4 rounded-2xl border transition text-left cursor-pointer flex flex-col justify-between space-y-3 ${
                          selectedPlatform === "vercel"
                            ? "bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                            : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-white">▲</span>
                          <span
                            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              selectedPlatform === "vercel"
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                : "bg-zinc-800 text-zinc-500"
                            }`}
                          >
                            RECOMMENDED · 100% PUBLIC
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Vercel</h4>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            Serverless Edge CDN. 100% public by default with zero login challenges.
                          </p>
                        </div>
                        <div className="text-[10px] font-mono text-indigo-400 font-semibold">
                          *.vercel.app
                        </div>
                      </button>

                      {/* Netlify Option */}
                      <button
                        type="button"
                        onClick={() => handlePlatformChange("netlify")}
                        className={`p-4 rounded-2xl border transition text-left cursor-pointer flex flex-col justify-between space-y-3 ${
                          selectedPlatform === "netlify"
                            ? "bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                            : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-[#00c7b7]">◆</span>
                          <span
                            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              selectedPlatform === "netlify"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-zinc-800 text-zinc-500"
                            }`}
                          >
                            NETLIFY CDN
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Netlify</h4>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            Free hosting on Netlify CDN with HTTPS. Requires setting Visitor Access to Public.
                          </p>
                        </div>
                        <div className="text-[10px] font-mono text-emerald-400 font-semibold">
                          *.netlify.app
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Question 2: Subdomain / Site Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                      2. Choose your unique subdomain
                    </label>
                    <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-2xl px-3 py-2.5 focus-within:border-indigo-500 transition">
                      <span className="text-xs font-mono text-zinc-500 shrink-0 select-none">
                        https://
                      </span>
                      <input
                        type="text"
                        value={subdomain}
                        onChange={(e) =>
                          setSubdomain(
                            e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                          )
                        }
                        placeholder="e.g. 60soul or anushka-garg"
                        className="flex-1 bg-transparent border-0 px-1 text-xs text-white placeholder-zinc-600 focus:outline-none font-mono font-semibold"
                      />
                      <span className="text-xs font-mono text-emerald-400 shrink-0 font-semibold select-none">
                        .{selectedPlatform}.app/
                      </span>
                    </div>

                    {/* Subdomain guidance notice */}
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
                      <Info size={14} className="shrink-0 mt-0.5 text-amber-400" />
                      <span>
                        <strong>Note:</strong> Globally common names like <code>anushka</code> or <code>portfolio</code> are already registered on Netlify by others. Use a unique name like <code>60soul</code>, <code>anushka-garg</code>, or <code>anushka-dev</code> so your website is exclusively yours!
                      </span>
                    </div>
                  </div>

                  {/* Question 3: Deploy Options */}
                  <div className="space-y-3 pt-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                      3. Deploy Options
                    </label>

                    {/* METHOD 1: Automated 1-Click API Deploy */}
                    {selectedPlatform === "netlify" ? (
                      <div className="p-4 rounded-2xl bg-zinc-900/90 border border-teal-500/30 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Sparkles size={13} className="text-teal-400" />
                            <span>Guided Netlify Deployment</span>
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
                            STEP-BY-STEP
                          </span>
                        </div>

                        {/* STEP 1: Generate Access Token */}
                        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold flex items-center justify-center shrink-0">
                                1
                              </span>
                              <span>Generate Netlify Access Token</span>
                            </span>
                            <a
                              href="https://app.netlify.com/user/applications#personal-access-tokens"
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[10px] font-bold flex items-center gap-1 transition shrink-0"
                            >
                              <span>Generate Token ↗</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                          <p className="text-[11px] text-zinc-400">
                            Click <strong>&quot;Generate Token&quot;</strong>, click <strong>&quot;New access token&quot;</strong> in Netlify, name it <code>PortfolioAI</code>, and paste it here:
                          </p>
                          <input
                            type="password"
                            value={token}
                            onChange={(e) => {
                              setToken(e.target.value);
                              if (tokenError) setTokenError("");
                            }}
                            placeholder="Paste Netlify Access Token (e.g. nfp_...)"
                            className={`w-full bg-zinc-900 border ${
                              tokenError
                                ? "border-rose-500/70 focus:border-rose-400"
                                : "border-zinc-800 focus:border-teal-500"
                            } rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none font-mono transition`}
                          />
                        </div>

                        {/* STEP 2: Ensure Team Visitor Access is Public */}
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-amber-300 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center justify-center shrink-0">
                                2
                              </span>
                              <span>Make Your Netlify Sites &quot;Public&quot;</span>
                            </span>
                            <a
                              href="https://app.netlify.com/"
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 transition shrink-0"
                            >
                              <span>Netlify Settings ↗</span>
                              <ExternalLink size={9} />
                            </a>
                          </div>

                          <p className="text-[11px] text-amber-200/90 leading-relaxed">
                            Netlify teams default new sites to <strong>&quot;Private&quot;</strong>. To make sure recruiters and visitors can view your site without hitting a login screen:
                          </p>

                          <ol className="list-decimal list-inside text-[11px] space-y-1 text-zinc-300 font-medium bg-zinc-950/60 p-2.5 rounded-lg border border-amber-500/20">
                            <li>Open your <a href="https://app.netlify.com" target="_blank" rel="noreferrer" className="text-amber-400 underline font-semibold hover:text-amber-300">Netlify Dashboard ↗</a></li>
                            <li>Click <strong>Team settings</strong> &rarr; <strong>General</strong> &rarr; <strong>Visitor access</strong></li>
                            <li>Set <strong>Default project visibility</strong> to <span className="text-emerald-400 font-bold">Public (Anyone with link)</span></li>
                          </ol>

                          <div className="text-[10px] text-amber-300/90 flex items-center gap-1.5 pt-0.5">
                            <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                            <span>Setting this once applies to all current and future portfolio deploys automatically!</span>
                          </div>
                        </div>

                        {tokenError && (
                          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                            <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="font-medium text-rose-200">{tokenError}</p>
                            </div>
                          </div>
                        )}

                        {/* STEP 3: Deploy Button */}
                        <div className="space-y-1.5">
                          <button
                            type="button"
                            onClick={handleDeploy}
                            disabled={deploying}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                          >
                            {deploying ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Uploading &amp; Deploying to Netlify...</span>
                              </>
                            ) : (
                              <>
                                <Cloud size={15} />
                                <span>Deploy Portfolio to Netlify 🚀</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-zinc-900/90 border border-indigo-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Sparkles size={13} className="text-indigo-400" />
                            <span>Direct Automated 1-Click Deploy</span>
                          </span>
                          <a
                            href="https://vercel.com/account/tokens"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-indigo-400 hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>Get free Vercel token (10s)</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>

                        <p className="text-[11px] text-zinc-400">
                          Paste your free VERCEL Personal Access Token. Vercel deploys are 100% public by default with zero login walls.
                        </p>

                        <input
                          type="password"
                          value={token}
                          onChange={(e) => {
                            setToken(e.target.value);
                            if (tokenError) setTokenError("");
                          }}
                          placeholder="Paste VERCEL Access Token"
                          className={`w-full bg-zinc-950 border ${
                            tokenError
                              ? "border-rose-500/70 focus:border-rose-400"
                              : "border-zinc-800 focus:border-indigo-500"
                          } rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none font-mono transition`}
                        />

                        {tokenError && (
                          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                            <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="font-medium text-rose-200">{tokenError}</p>
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleDeploy}
                          disabled={deploying}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                        >
                          {deploying ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Uploading &amp; Deploying to VERCEL...</span>
                            </>
                          ) : (
                            <>
                              <Cloud size={15} />
                              <span>Deploy Now to VERCEL 🚀</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* METHOD 2: Zero-Token Netlify Drop */}
                    {selectedPlatform === "netlify" && (
                      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                            <Download size={13} className="text-emerald-400" />
                            <span>Method B: Netlify Drop (100% Free, No Token Needed)</span>
                          </span>
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                            ZERO-TOKEN
                          </span>
                        </div>

                        <p className="text-[11px] text-zinc-400">
                          Prefer not to use an API token? Click below to download your standalone bundle and open Netlify Drop. Drag and drop the ZIP to instantly get your live HTTPS link!
                        </p>

                        <button
                          type="button"
                          onClick={handleDownloadAndOpenNetlifyDrop}
                          disabled={downloadingZip}
                          className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                        >
                          <Download size={13} />
                          <span>{downloadingZip ? "Packaging ZIP..." : "Download Bundle & Open Netlify Drop ↗"}</span>
                        </button>

                        {/* Input to paste the resulting Netlify URL */}
                        <form onSubmit={handleSaveManualUrl} className="pt-2 space-y-1.5">
                          <label className="text-[11px] text-zinc-400 block font-medium">
                            Paste the live Netlify link assigned to you:
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={manualLiveUrl}
                              onChange={(e) => setManualLiveUrl(e.target.value)}
                              placeholder="https://your-site.netlify.app"
                              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
                            />
                            <button
                              type="submit"
                              disabled={savingManualUrl || !manualLiveUrl.trim()}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer disabled:opacity-40 shrink-0"
                            >
                              {savingManualUrl ? "Saving..." : "Save Link"}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: PUSH TO GITHUB (GLOBAL 1-CLICK OAUTH + TOKEN FALLBACK) */}
          {activeTab === "github" && (
            <div className="space-y-4">
              {/* GitHub Connected Header Status */}
              {oauthStatus.isConnected ? (
                /* Connected State */
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>
                      Connected to GitHub as <strong>@{oauthStatus.githubUsername}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 font-semibold">
                      <ShieldCheck size={11} />
                      <span>AES-256 Encrypted</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleDisconnectGitHub}
                      className="text-[11px] text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : oauthStatus.isOAuthConfigured ? (
                /* 1-Click Connect Button for All Users (OAuth Active) */
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FaGithub size={15} className="text-purple-400" />
                      <span>1-Click Global GitHub Connection</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                      NO TOKENS NEEDED
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400">
                    Authorize once with GitHub. Our app automatically handles repository creation and commits — zero manual tokens or setup required for any user.
                  </p>

                  <button
                    type="button"
                    onClick={handleConnectGitHubOAuth}
                    disabled={loadingOAuth}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
                  >
                    {loadingOAuth ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Connecting with GitHub...</span>
                      </>
                    ) : (
                      <>
                        <FaGithub size={15} />
                        <span>Connect GitHub Account (1-Click)</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Admin / Setup Guide Banner (When GITHUB_CLIENT_ID is not configured in .env yet) */
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-zinc-900 to-zinc-900 border border-purple-500/30 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles size={14} className="text-purple-400" />
                      <span>Activate 1-Click GitHub OAuth for All Users</span>
                    </span>
                    <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full font-bold">
                      FREE SETUP
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    To enable <strong>1-click login without tokens</strong> for all users globally, add your free GitHub OAuth credentials to <code>server/.env</code>.
                  </p>
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>1. Register free GitHub App:</span>
                      <a
                        href="https://github.com/settings/applications/new"
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>Open GitHub Registration</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                    <div className="text-zinc-400 font-mono text-[10px]">
                      Callback URL: <span className="text-purple-300">http://localhost:5173/auth/github/callback</span>
                    </div>
                    <div className="text-zinc-400 font-mono text-[10px]">
                      Add to <span className="text-white">server/.env</span>: <span className="text-emerald-400">GITHUB_CLIENT_ID</span> &amp; <span className="text-emerald-400">GITHUB_CLIENT_SECRET</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Existing or Success Banner */}
              {githubResult && (
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                      <CheckCircle2 size={16} />
                      <span>Repository Synced on GitHub!</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      LIVE
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800 text-xs">
                    <span className="font-mono text-white truncate font-medium">
                      {githubResult.repoUrl}
                    </span>
                    <a
                      href={githubResult.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1 shrink-0"
                    >
                      <FaGithub size={12} />
                      <span>View Repo</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>

                  {githubResult.pagesUrl && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800 text-xs">
                        <span className="font-mono text-emerald-300 truncate font-medium">
                          {githubResult.pagesUrl}
                        </span>
                        <a
                          href={githubResult.pagesUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition shadow-lg shadow-emerald-900/30"
                        >
                          <Globe size={13} />
                          <span>Open GitHub Pages</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>

                      {/* Status indicator & Collapsible Troubleshooting trigger */}
                      <div className="flex items-center justify-between px-1 text-[11px]">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Published on GitHub Pages!</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => setShowPagesHelp(!showPagesHelp)}
                          className="text-zinc-500 hover:text-amber-300 transition flex items-center gap-1 cursor-pointer text-[10.5px]"
                        >
                          <span>Seeing a 404?</span>
                          {showPagesHelp ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      </div>

                      {/* Collapsible 404 / Build Help Card */}
                      {showPagesHelp && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-2 text-zinc-300 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 font-bold text-amber-300 text-[11px]">
                              <Clock size={14} className="text-amber-400 shrink-0" />
                              <span>GitHub Pages Build Guide</span>
                            </div>
                            <a
                              href={
                                githubResult.pagesSettingsUrl ||
                                `${githubResult.repoUrl}/settings/pages`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 text-[11px] font-semibold flex items-center gap-1 shrink-0 transition cursor-pointer"
                            >
                              <span>Open Pages Settings</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>

                          <div className="text-[11px] text-zinc-300 space-y-1.5 leading-relaxed">
                            <p className="text-zinc-400">
                              GitHub takes <strong className="text-white">1–2 minutes</strong> to build after pushing. If this is a new repository, ensure your branch is enabled:
                            </p>
                            <div className="bg-zinc-950/70 p-2 rounded-lg border border-zinc-800/80 space-y-1 text-zinc-300 font-mono text-[10.5px]">
                              <div>1. Click <strong className="text-amber-300">Open Pages Settings</strong> above</div>
                              <div>2. Under <em>Build and deployment &rarr; Branch</em>, pick <span className="text-emerald-400 font-bold">main</span> &amp; <span className="text-emerald-400 font-bold">/(root)</span></div>
                              <div>3. Click <strong className="text-white">Save</strong>. Wait ~45 seconds and refresh your Pages link! 🚀</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* GitHub Push Execution Form */}
              <form
                onSubmit={handleGitHubPush}
                className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <FaGithub size={16} className="text-purple-400" />
                    <span>Push Portfolio Code</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Auto-creates repo &amp; files
                  </span>
                </div>

                {!oauthStatus.isConnected && (
                  <div className="space-y-1 text-xs">
                    <label className="text-[11px] font-semibold text-zinc-300">
                      GitHub Username or Repository URL:
                    </label>
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="e.g. anushka1801garg or https://github.com/anushka1801garg/portfolio"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono"
                      required={!oauthStatus.isConnected}
                    />
                  </div>
                )}

                <div className="space-y-1 text-xs">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    Repository Name:
                  </label>
                  <input
                    type="text"
                    value={githubRepoName}
                    onChange={(e) => setGithubRepoName(e.target.value)}
                    placeholder="e.g. portfolio"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                {/* Token Input: Required if OAuth is not configured, or optional fallback if OAuth is configured */}
                {!oauthStatus.isConnected && (
                  !oauthStatus.isOAuthConfigured ? (
                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                          <Lock size={12} className="text-purple-400" />
                          <span>GitHub Personal Access Token:</span>
                        </label>
                        <a
                          href="https://github.com/settings/tokens/new?scopes=repo&description=PortfolioAI"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-purple-400 hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <span>Generate Free Token (20s)</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>

                      <div className="relative">
                        <input
                          type={showTokenPassword ? "text" : "password"}
                          value={githubToken}
                          onChange={(e) => setGithubToken(e.target.value)}
                          placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 pr-16 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono"
                          required
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          {githubToken && (
                            <button
                              type="button"
                              onClick={handleClearGithubToken}
                              title="Clear Token"
                              className="text-zinc-500 hover:text-rose-400 p-1 rounded transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowTokenPassword(!showTokenPassword)}
                            title={showTokenPassword ? "Hide token" : "Show token"}
                            className="text-zinc-500 hover:text-zinc-300 p-1 rounded transition"
                          >
                            {showTokenPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-0.5 text-[10.5px]">
                        <label className="flex items-center gap-1.5 text-zinc-400 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={rememberGithubToken}
                            onChange={(e) => setRememberGithubToken(e.target.checked)}
                            className="rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500"
                          />
                          <span>Remember token on this device</span>
                        </label>
                        <span className="text-zinc-500 font-mono">repo scope only</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/80">
                        <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                        <span>Used in-memory strictly for this push. Never logged or exposed.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowManualToken(!showManualToken)}
                        className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
                      >
                        <span>Prefer entering a Personal Access Token instead?</span>
                        {showManualToken ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>

                      {showManualToken && (
                        <div className="mt-2 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                              <Lock size={12} className="text-purple-400" />
                              <span>GitHub Personal Access Token:</span>
                            </label>
                            <a
                              href="https://github.com/settings/tokens/new?scopes=repo&description=PortfolioAI"
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-purple-400 hover:underline inline-flex items-center gap-0.5 font-semibold"
                            >
                              <span>Generate Token (repo scope)</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>

                          <div className="relative">
                            <input
                              type={showTokenPassword ? "text" : "password"}
                              value={githubToken}
                              onChange={(e) => setGithubToken(e.target.value)}
                              placeholder="ghp_xxxxxxxxxxxx..."
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 pr-16 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                              {githubToken && (
                                <button
                                  type="button"
                                  onClick={handleClearGithubToken}
                                  title="Clear Token"
                                  className="text-zinc-500 hover:text-rose-400 p-1 rounded transition"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setShowTokenPassword(!showTokenPassword)}
                                title={showTokenPassword ? "Hide token" : "Show token"}
                                className="text-zinc-500 hover:text-zinc-300 p-1 rounded transition"
                              >
                                {showTokenPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-0.5 text-[10.5px]">
                            <label className="flex items-center gap-1.5 text-zinc-400 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={rememberGithubToken}
                                onChange={(e) => setRememberGithubToken(e.target.checked)}
                                className="rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500"
                              />
                              <span>Remember token on this device</span>
                            </label>
                            <span className="text-zinc-500 font-mono">repo scope only</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/80">
                            <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                            <span>Used in-memory strictly for this push. Never logged or exposed.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}

                <button
                  type="submit"
                  disabled={pushingToGithub}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50"
                >
                  {pushingToGithub ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Pushing Code to GitHub...</span>
                    </>
                  ) : (
                    <>
                      <FaGithub size={14} />
                      <span>{githubResult ? "Push Updated Code to GitHub 🚀" : "Confirm & Push to GitHub 🚀"}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#121824] border-t border-zinc-800/80 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleDownloadAndOpenNetlifyDrop}
            disabled={downloadingZip}
            className="text-zinc-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
            title="Download full offline HTML/CSS package"
          >
            <Download size={13} />
            <span>{downloadingZip ? "Packaging ZIP..." : "Download Standalone .ZIP"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white font-medium transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeploymentModal;
