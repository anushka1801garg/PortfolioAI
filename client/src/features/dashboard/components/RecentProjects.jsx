import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
  Edit3,
  Trash2,
  Share2,
  Globe,
  Lock,
  Check,
  Sparkles,
  Eye,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

import { deletePortfolio } from "../../../redux/portfolio/portfolioSlice";

const templateColors = {
  modern: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  minimal: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  creative: "bg-pink-500/10 text-pink-300 border-pink-500/20",
  developer: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  executive: "bg-amber-500/10 text-amber-300 border-amber-500/20",
};

const RecentProjects = ({ portfolios = [], loading = false }) => {
  const dispatch = useDispatch();
  const [copiedId, setCopiedId] = useState(null);
  const [filter, setFilter] = useState("all"); // "all" | "published" | "draft"

  const handleDelete = async (id, title) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${title}"?`
    );

    if (!confirmDelete) return;

    const result = await dispatch(deletePortfolio(id));

    if (deletePortfolio.fulfilled.match(result)) {
      toast.success("Portfolio deleted successfully");
    } else {
      toast.error(result.payload || "Failed to delete portfolio");
    }
  };

  const handleCopyShareLink = (id) => {
    const publicUrl = `${window.location.origin}/p/${id}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedId(id);
    toast.success("Share link copied to clipboard! 📋");
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const filteredPortfolios = portfolios.filter((item) => {
    if (filter === "published") return item.status === "Published";
    if (filter === "draft") return item.status !== "Published";
    return true;
  });

  if (loading) {
    return (
      <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-12 text-center backdrop-blur-xl">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-zinc-400 text-sm font-medium">Syncing your portfolios from edge database...</p>
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-zinc-800 bg-gradient-to-b from-zinc-900/50 to-zinc-950 p-10 sm:p-14 text-center backdrop-blur-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto shadow-inner shadow-indigo-500/10">
          <Sparkles size={28} />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-xl font-bold text-white tracking-tight">
            No Portfolios Created Yet
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Your showcase is empty. Build a high-converting portfolio with AI in seconds or pick a designer template.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/portfolio-generator"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:scale-105 transition"
          >
            <Sparkles size={14} />
            <span>Generate with AI (15s)</span>
          </Link>
          <Link
            to="/portfolio/create"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-5 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white transition border border-zinc-700/60"
          >
            <span>Manual Template</span>
          </Link>
        </div>
      </div>
    );
  }

  const publishedCount = portfolios.filter(p => p.status === "Published").length;
  const draftCount = portfolios.length - publishedCount;

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pb-1">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            filter === "all"
              ? "bg-zinc-800 text-white shadow-sm border border-zinc-700"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          All ({portfolios.length})
        </button>
        <button
          onClick={() => setFilter("published")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            filter === "published"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "text-zinc-400 hover:text-emerald-300 hover:bg-zinc-900"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Published ({publishedCount})</span>
        </button>
        <button
          onClick={() => setFilter("draft")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            filter === "draft"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "text-zinc-400 hover:text-amber-300 hover:bg-zinc-900"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>Drafts ({draftCount})</span>
        </button>
      </div>

      {/* Portfolios Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPortfolios.slice(0, 6).map((portfolio) => {
          const isPublished = portfolio.status === "Published";
          const templateStyle =
            templateColors[portfolio.template?.toLowerCase()] ||
            templateColors.modern;
          const isCopied = copiedId === portfolio._id;

          return (
            <div
              key={portfolio._id}
              className="group relative rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/70 to-zinc-950/80 hover:border-indigo-500/40 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50"
            >
              {/* Top Accent Line on Hover */}
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl pointer-events-none" />

              <div className="space-y-4">
                {/* Header: Template & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${templateStyle}`}
                  >
                    {portfolio.template || "modern"}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isPublished ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        <span>Live</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-[11px] font-medium">
                        <Lock size={10} />
                        <span>Draft</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Body: Title, Tagline & Meta */}
                <div>
                  <Link
                    to={`/portfolio/${portfolio._id}`}
                    className="group-hover:text-indigo-300 transition-colors"
                  >
                    <h3 className="text-base font-bold text-white line-clamp-1 flex items-center gap-1">
                      <span>{portfolio.title}</span>
                      <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-indigo-400 shrink-0" />
                    </h3>
                  </Link>

                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {portfolio.tagline || portfolio.description || "Portfolio website configured with custom projects and skills."}
                  </p>
                </div>

                {/* Simulated Activity / Stats */}
                <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-1 font-mono">
                  <div className="flex items-center gap-1">
                    <Clock size={11} className="text-zinc-400" />
                    <span>Updated recently</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
                  <div className="flex items-center gap-1 text-indigo-400">
                    <Globe size={11} />
                    <span>Edge CDN</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="mt-5 pt-3.5 border-t border-zinc-800/70 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/portfolio/${portfolio._id}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition shadow-sm"
                  >
                    <Eye size={12} />
                    <span>View</span>
                  </Link>

                  <Link
                    to={`/portfolio/edit/${portfolio._id}`}
                    className="rounded-lg bg-zinc-800/80 hover:bg-zinc-750 p-1.5 text-zinc-300 hover:text-white transition border border-zinc-750"
                    title="Edit Portfolio"
                  >
                    <Edit3 size={13} />
                  </Link>

                  <button
                    onClick={() => handleCopyShareLink(portfolio._id)}
                    className={`rounded-lg p-1.5 transition cursor-pointer border ${
                      isCopied
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                        : "bg-zinc-800/80 hover:bg-zinc-750 border-zinc-750 text-indigo-400 hover:text-indigo-300"
                    }`}
                    title={isCopied ? "Link Copied!" : "Copy Share Link"}
                  >
                    {isCopied ? <Check size={13} /> : <Share2 size={13} />}
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(portfolio._id, portfolio.title)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                  title="Delete Portfolio"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentProjects;
