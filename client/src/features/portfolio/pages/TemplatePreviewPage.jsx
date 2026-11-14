import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Check,
  Crown,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  ExternalLink,
} from "lucide-react";
import TemplateRenderer from "../components/templates/TemplateRenderer";
import { TEMPLATES } from "../components/templates/templateList";
import { SAMPLE_PORTFOLIO_DATA } from "../components/templates/demoPortfolioData";
import UpgradeModal from "../../../components/modals/UpgradeModal";
import SEO from "../../../components/common/SEO";

const TemplatePreviewPage = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const userPlan = user?.plan || "free";

  const [deviceView, setDeviceView] = useState("desktop");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Validate or fallback to modern
  const currentTemplate =
    TEMPLATES.find((t) => t.id === (templateId || "").toLowerCase()) ||
    TEMPLATES.find((t) => t.id === "modern") ||
    TEMPLATES[0];

  // Check if preview data was passed via session storage
  const sessionPortfolio = useMemo(() => {
    try {
      const saved = sessionStorage.getItem("portfolioai_preview_data");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return null;
  }, []);

  const activePortfolioData = sessionPortfolio || SAMPLE_PORTFOLIO_DATA;

  const isProLocked = currentTemplate.tier === "pro" && userPlan !== "pro";

  const handleSelectTemplate = (id) => {
    navigate(`/templates/preview/${id}`);
  };

  const handleUseTemplate = () => {
    if (isProLocked) {
      setShowUpgradeModal(true);
      return;
    }
    navigate(`/portfolio-generator`);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col">
      <SEO
        title={`${currentTemplate.name} Template Preview — Interactive Developer Portfolio`}
        description={`Live interactive preview of the ${currentTemplate.name} developer portfolio template. Built with responsive layout, fluid micro-interactions, and modern styling.`}
        canonical={`/templates/preview/${currentTemplate.id}`}
        keywords={[
          currentTemplate.name,
          "portfolio template preview",
          "developer portfolio theme",
          "React portfolio",
          "interactive resume site",
        ]}
      />
      {/* Top Floating Control Bar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/95 backdrop-blur-xl px-4 sm:px-6 py-3 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Back & Title */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white transition px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700"
            >
              <ArrowLeft size={14} className="text-indigo-400" />
              <span>Dashboard</span>
            </Link>

            <span className="h-4 w-px bg-zinc-800"></span>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <Layers size={14} className="text-indigo-400" />
                {currentTemplate.name}
              </span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                  currentTemplate.tier === "pro"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                }`}
              >
                {currentTemplate.tier === "pro" ? "PRO TEMPLATE" : "FREE"}
              </span>
            </div>
          </div>

          {/* Viewport controls */}
          <div className="hidden md:flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setDeviceView("desktop")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                deviceView === "desktop"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Desktop View"
            >
              <Monitor size={14} />
              <span className="text-[11px]">Desktop</span>
            </button>
            <button
              onClick={() => setDeviceView("tablet")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                deviceView === "tablet"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Tablet View"
            >
              <Tablet size={14} />
              <span className="text-[11px]">Tablet</span>
            </button>
            <button
              onClick={() => setDeviceView("mobile")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                deviceView === "mobile"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Mobile View"
            >
              <Smartphone size={14} />
              <span className="text-[11px]">Mobile</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isProLocked ? (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold px-4 py-2 text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <Crown size={14} />
                <span>Upgrade to Pro to Use</span>
              </button>
            ) : (
              <button
                onClick={handleUseTemplate}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-4 py-2 text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                <Check size={14} />
                <span>Use Template in Generator</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Templates Pill Bar */}
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-zinc-900 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider shrink-0 pr-1">
            Templates:
          </span>
          {TEMPLATES.map((tmpl) => {
            const isSelected = tmpl.id === currentTemplate.id;
            const isPro = tmpl.tier === "pro";
            return (
              <button
                key={tmpl.id}
                onClick={() => handleSelectTemplate(tmpl.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30"
                    : "bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                <span>{tmpl.name}</span>
                {isPro && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                    PRO
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Preview Container with Responsive Shell if not desktop */}
      <main className="flex-1 bg-zinc-950 flex justify-center p-0 overflow-y-auto">
        {deviceView === "desktop" && (
          <div className="w-full">
            <TemplateRenderer
              portfolio={activePortfolioData}
              templateOverride={currentTemplate.id}
              previewDevice="desktop"
            />
          </div>
        )}

        {deviceView === "tablet" && (
          <div className="w-[768px] my-6 border-8 border-zinc-800 rounded-3xl overflow-hidden shadow-2xl bg-zinc-950 max-h-[85vh] overflow-y-auto">
            <div className="h-6 bg-zinc-800 flex items-center justify-center">
              <div className="w-12 h-1 bg-zinc-700 rounded-full"></div>
            </div>
            <TemplateRenderer
              portfolio={activePortfolioData}
              templateOverride={currentTemplate.id}
              previewDevice="tablet"
            />
          </div>
        )}

        {deviceView === "mobile" && (
          <div className="w-[390px] my-6 border-8 border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl bg-zinc-950 max-h-[85vh] overflow-y-auto">
            <div className="h-7 bg-zinc-800 flex items-center justify-center">
              <div className="w-20 h-4 bg-zinc-900 rounded-full"></div>
            </div>
            <TemplateRenderer
              portfolio={activePortfolioData}
              templateOverride={currentTemplate.id}
              previewDevice="mobile"
            />
          </div>
        )}
      </main>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        targetFeature={currentTemplate.name}
      />
    </div>
  );
};

export default TemplatePreviewPage;
