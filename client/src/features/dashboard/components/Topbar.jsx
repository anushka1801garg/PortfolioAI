import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { 
  Settings, 
  Briefcase, 
  LogOut, 
  Search, 
  Bell, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Globe, 
  Zap,
  ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";

import { logout } from "../../../redux/auth/authSlice";

const Topbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/portfolio`);
    toast(`Searching for "${searchQuery}"...`, { icon: "🔍" });
  };

  return (
    <header className="relative z-40 flex h-20 items-center justify-between border-b border-white/[0.08] bg-[#0B0E17]/75 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
      {/* Search and Command Palette Simulator */}
      <div className="flex items-center gap-4 flex-1 max-w-md mr-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search portfolios, ATS scores, templates..."
            className="w-full h-10 pl-10 pr-12 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 transition"
          />
          <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center px-1.5 py-0.5 rounded border border-zinc-750 bg-zinc-800 text-[10px] font-mono text-zinc-400">
            ⌘K
          </kbd>
        </form>
      </div>

      {/* Right Controls: Status, Notifications, Create Action & User */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Live System Status Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-zinc-300 font-medium text-[11px]">Edge CDN Active</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((prev) => !prev)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
            title="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-zinc-950"></span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-zinc-800 bg-zinc-900/95 p-3 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                <span className="text-xs font-bold text-white">Notifications</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                  3 New
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-start gap-2.5">
                  <Sparkles size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Nemotron ATS Ready</p>
                    <p className="text-zinc-400 text-[11px]">Free AI model active with instant keyword analysis.</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-800/60 border border-zinc-750 flex items-start gap-2.5">
                  <Globe size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Edge CDN Online</p>
                    <p className="text-zinc-400 text-[11px]">Your portfolio links are serving in &lt;50ms worldwide.</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-800/60 border border-zinc-750 flex items-start gap-2.5">
                  <ShieldCheck size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Security & SSL Verified</p>
                    <p className="text-zinc-400 text-[11px]">All portfolios are protected by HTTPS edge certificates.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create Portfolio Quick Button */}
        <Link
          to="/portfolio/create"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-3.5 sm:px-4 py-2 text-xs font-bold transition shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">New Portfolio</span>
        </Link>

        {/* User Avatar & Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs overflow-hidden ring-2 ring-indigo-500/30 hover:ring-indigo-500/60 transition cursor-pointer shadow-md"
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-60 rounded-2xl border border-zinc-800 bg-zinc-900/95 p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2.5 border-b border-zinc-800/80">
                <p className="text-sm font-bold text-white truncate">
                  {currentUser?.fullName || "Developer"}
                </p>
                <p className="text-xs text-zinc-400 truncate">
                  {currentUser?.email || "Account"}
                </p>
                <div className="mt-1.5">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold uppercase">
                    {currentUser?.plan || "Free Plan"}
                  </span>
                </div>
              </div>

              <div className="py-1.5 space-y-0.5">
                <Link
                  to="/portfolio"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                >
                  <Briefcase size={14} className="text-indigo-400" />
                  <span>My Portfolios ({portfolios.length})</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                >
                  <Settings size={14} className="text-indigo-400" />
                  <span>Account Settings</span>
                </Link>

                <Link
                  to="/"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                >
                  <ExternalLink size={14} className="text-purple-400" />
                  <span>Public Landing Page</span>
                </Link>
              </div>

              <div className="pt-1.5 border-t border-zinc-800/80">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer text-left"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
