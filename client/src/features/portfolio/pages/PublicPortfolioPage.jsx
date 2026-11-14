import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

import { getPublicPortfolio } from "../services/portfolioService";
import TemplateRenderer from "../components/templates/TemplateRenderer";
import SEO from "../../../components/common/SEO";

const PublicPortfolioPage = () => {
  const { id } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicPortfolio = async () => {
      try {
        setLoading(true);
        const response = await getPublicPortfolio(id);
        if (response.data?.success && response.data?.portfolio) {
          setPortfolio(response.data.portfolio);
        } else {
          setError("Portfolio not found.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load portfolio.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPublicPortfolio();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090B] text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-400 font-medium">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090B] text-white p-6">
        <div className="max-w-md text-center space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-10">
          <div className="text-5xl">🔍</div>
          <h1 className="text-2xl font-bold text-white">Portfolio Not Found</h1>
          <p className="text-zinc-400 text-sm">
            This portfolio might be private, unpublished, or the link may have expired.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition"
          >
            Create Your Own Portfolio
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const p = portfolio;
  const seoTitle = p.seo?.title || `${p.name || p.title} — Portfolio`;
  const seoDesc =
    p.seo?.description ||
    p.about ||
    p.tagline ||
    `Explore the professional developer portfolio and projects of ${p.name || p.title}.`;
  const seoKeywords = Array.isArray(p.seo?.keywords) && p.seo.keywords.length > 0
    ? p.seo.keywords
    : (p.skills && p.skills.length > 0 ? p.skills : ["Portfolio", "Software Engineer", "Developer"]);
  const ogImage = p.seo?.ogImage || p.avatar || "https://portfolioai.app/og-image.png";

  const sameAsLinks = [p.github, p.linkedin, p.website].filter(Boolean);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "dateCreated": p.createdAt,
    "dateModified": p.updatedAt,
    "mainEntity": {
      "@type": "Person",
      "name": p.name || p.title,
      "description": seoDesc,
      "jobTitle": p.targetRole || p.tagline || "Software Engineer",
      ...(p.avatar ? { "image": p.avatar } : {}),
      ...(sameAsLinks.length > 0 ? { "sameAs": sameAsLinks } : {}),
      ...(p.skills && p.skills.length > 0 ? { "knowsAbout": p.skills } : {}),
    },
  };

  return (
    <div className="relative">
      <SEO
        title={seoTitle}
        description={seoDesc}
        keywords={seoKeywords}
        canonical={`/p/${id}`}
        ogImage={ogImage}
        ogType="profile"
        structuredData={structuredData}
      />
      {/* Floating Badge */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-zinc-950/90 px-4 py-2 text-xs font-semibold text-white shadow-2xl backdrop-blur hover:scale-105 transition"
        >
          <Sparkles size={14} className="text-indigo-400" />
          <span>Made with PortfolioAI</span>
        </Link>
      </div>

      <TemplateRenderer portfolio={portfolio} />
    </div>
  );
};

export default PublicPortfolioPage;
