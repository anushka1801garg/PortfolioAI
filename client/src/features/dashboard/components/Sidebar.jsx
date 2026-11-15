import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Briefcase,
  Settings,
  Sparkles,
  LogOut,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Bot,
} from 'lucide-react';
import { logout } from "../../../redux/auth/authSlice";
import { clearGeneratedPortfolio } from "../../../redux/portfolioGenerator/portfolioGeneratorSlice";
import UpgradeModal from "../../../components/modals/UpgradeModal";
import CyberBotAvatar from "../../../components/chat/CyberBotAvatar";
import { useState } from "react";

const menu = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: Bot,
    title: "AI Career Chatbot",
    path: "/chat",
    badge: "COPILOT",
  },
  {
    icon: Briefcase,
    title: "Portfolio Library",
    path: "/portfolio",
    badge: "LIBRARY",
  },
  {
    icon: Sparkles,
    title: "AI Studio Builder",
    path: "/portfolio-generator",
    badge: "14 THEMES",
  },
  {
    icon: ShieldCheck,
    title: "Portfolio Analyzer",
    path: "/analyzer",
    badge: "7 PILLARS",
  },
  {
    icon: Settings,
    title: "Settings",
    path: "/settings",
  },
];

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { profile } = useSelector((state) => state.profile);
  const { user } = useSelector((state) => state.auth);
  const { portfolios = [] } = useSelector((state) => state.portfolio || {});

  const currentUser = profile || user;

  const initials = (currentUser?.fullName || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isPro = currentUser?.plan && currentUser.plan.toLowerCase() !== "free";

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <aside className="w-64 lg:w-72 h-screen sticky top-0 bg-[#0B0E17]/90 border-r border-white/[0.08] flex flex-col justify-between shrink-0 z-30 overflow-hidden backdrop-blur-2xl">
      {/* Background radial glow */}
      <div className="absolute -left-20 -top-20 w-48 h-48 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="p-4 lg:p-5 shrink-0 border-b border-zinc-900/80">
        <Link to="/" className="flex items-center gap-3 group" title="Back to Home Page">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-all">
              P
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950 ring-1 ring-emerald-400/50"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black text-white tracking-tight">
                Portfolio<span className="text-indigo-400">AI</span>
              </h1>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>ENGINE ONLINE</span>
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 lg:px-4 py-4 space-y-1.5">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
          Workspace Navigation
        </div>

        {menu.map((item) => {
          const isActive =
            item.path === "/dashboard"
              ? location.pathname === "/dashboard"
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.title}
              to={item.path}
              onClick={() => {
                if (item.path === "/portfolio-generator") {
                  dispatch(clearGeneratedPortfolio());
                }
              }}
              className={`relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-lg shadow-indigo-600/25"
                  : "text-zinc-400 hover:bg-zinc-900/90 hover:text-white"
              }`}
            >
              {/* Active Indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-indigo-300 shadow-sm" />
              )}

              <div className="flex items-center gap-3">
                {item.title === "AI Career Chatbot" ? (
                  <div className="relative shrink-0 flex items-center justify-center">
                    <CyberBotAvatar size="xs" interactive={false} />
                    <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                  </div>
                ) : (
                  <item.icon
                    size={17}
                    className={`transition-colors ${
                      isActive ? "text-white" : "text-zinc-400 group-hover:text-indigo-400"
                    }`}
                  />
                )}
                <span>{item.title}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 group-hover:border-indigo-500/40"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* AI Quick Generator action in sidebar */}
        <div className="pt-3">
          <Link
            to="/portfolio-generator"
            onClick={() => dispatch(clearGeneratedPortfolio())}
            className="flex items-center justify-between rounded-xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 hover:border-purple-500/50 p-3 text-xs text-purple-200 hover:text-white transition group"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-purple-400 group-hover:rotate-12 transition-transform" />
              <span className="font-semibold">Quick AI Build</span>
            </div>
            <ArrowUpRight size={13} className="text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* Storage & Plan Quota Widget (Section 12 & 17) */}
      <div className="px-3 lg:px-4 pb-2">
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-850 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <Zap size={13} className="text-amber-400" />
              <span>{isPro ? `${currentUser?.plan?.toUpperCase() || "PRO"} Plan` : "Free Plan"}</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              {portfolios.length} / {isPro ? "∞" : "2"} Slots
            </span>
          </div>

          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
              style={{
                width: isPro ? "100%" : `${Math.min(100, (portfolios.length / 2) * 100)}%`,
              }}
            />
          </div>

          <button
            onClick={() => setShowUpgradeModal(true)}
            className="block text-center w-full py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white text-[11px] font-semibold transition cursor-pointer"
          >
            {isPro ? "Manage Plan Tiers" : "Upgrade to Pro (Unlimited)"}
          </button>
        </div>
      </div>

      {/* User Profile & Quick Sign Out Footer */}
      <div className="p-3 lg:p-4 border-t border-zinc-900 bg-zinc-950 shrink-0">
        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-2.5 flex items-center justify-between gap-2.5 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs overflow-hidden shadow">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-900"></span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser?.fullName || "Developer"}
                </p>
              </div>
              <p className="text-[10px] text-zinc-400 truncate">
                {currentUser?.email || "Account"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="flex items-center justify-center w-8 h-8 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/15 transition cursor-pointer shrink-0"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        targetFeature="Unlimited Portfolios & Pro Access"
      />
    </aside>
  );
};

export default Sidebar;