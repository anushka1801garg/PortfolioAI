import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { LogOut, LayoutDashboard, ArrowRight, Menu, X } from "lucide-react";
import toast from "react-hot-toast";
import Container from "../../ui/Container/Container";
import { logout } from "../../../redux/auth/authSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/");
    setMobileMenuOpen(false);
  };

  const displayName = user?.fullName ? user.fullName.split(" ")[0] : null;

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features" },
    { name: "Templates", href: "#templates" },
    { name: "Pricing", href: "#pricing" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-zinc-950/75 backdrop-blur-2xl transition-all duration-300">
      {/* Top ambient glow line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      <Container>
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-2.5 text-2xl font-extrabold tracking-tight"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-lg shadow-md shadow-indigo-500/30 ring-1 ring-white/20 transition-transform duration-200 group-hover:scale-105">
              P
            </div>

            <span className="font-bold tracking-tight text-white">
              Portfolio
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">
                AI
              </span>
            </span>
          </Link>

          {/* Navigation Dock */}
          <div className="hidden md:flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1.5 backdrop-blur-md shadow-inner">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="px-4 py-1.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] rounded-full transition-all duration-200"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {displayName && (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-zinc-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
                    <span>Hi, {displayName}</span>
                    {user?.plan && user.plan !== "free" && (
                      <span className="ml-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-[10px] font-extrabold uppercase text-white shadow-sm tracking-wider">
                        {user.plan}
                      </span>
                    )}
                  </div>
                )}

                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-indigo-600 hover:border-indigo-500 text-zinc-200 hover:text-white px-3.5 py-2 text-sm font-medium transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
                >
                  <LayoutDashboard size={15} />
                  <span>Dashboard</span>
                </Link>

                <button
                  id="navbar-signout-btn"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-rose-500/15 hover:border-rose-500/30 text-zinc-300 hover:text-rose-400 px-3.5 py-2 text-sm font-medium transition-all duration-200 cursor-pointer active:scale-95"
                  title="Sign Out"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-indigo-600 hover:border-indigo-500 text-zinc-200 hover:text-white active:bg-indigo-700 active:border-indigo-600 active:scale-95 hover:shadow-lg hover:shadow-indigo-500/25 px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer"
                >
                  Log In
                </Link>

                <Link
                  to="/register"
                  className="group inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-indigo-600 hover:border-indigo-500 text-zinc-200 hover:text-white active:bg-indigo-700 active:border-indigo-600 active:scale-95 hover:shadow-lg hover:shadow-indigo-500/25 px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:text-white transition cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-white/10 py-4 px-2 space-y-3">
            <div className="flex flex-col space-y-2">
              {navLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition"
                >
                  {item.name}
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  {displayName && (
                    <div className="px-3 py-1.5 text-xs text-zinc-400 flex items-center justify-between">
                      <span>
                        Signed in as{" "}
                        <span className="text-white font-medium">
                          {displayName}
                        </span>
                      </span>
                      {user?.plan && user.plan !== "free" && (
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-[10px] font-extrabold uppercase text-white shadow-sm tracking-wider">
                          {user.plan}
                        </span>
                      )}
                    </div>
                  )}
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-indigo-600 hover:border-indigo-500 active:bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-zinc-200 hover:text-white transition"
                  >
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 px-4 py-2.5 text-sm font-semibold text-rose-400 transition"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-indigo-600 hover:border-indigo-500 active:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/25 px-4 py-2.5 text-sm font-semibold text-zinc-200 hover:text-white transition active:scale-95"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-indigo-600 hover:border-indigo-500 active:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/25 px-4 py-2.5 text-sm font-semibold text-zinc-200 hover:text-white transition active:scale-95"
                  >
                    <span>Get Started</span>
                    <ArrowRight size={15} />
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </Container>
    </header>
  );
};

export default Navbar;


