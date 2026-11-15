import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Check,
  Lock,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Tablet,
  Smartphone,
} from 'lucide-react';
import { TEMPLATES } from "./templateList";
import TemplateRenderer from "./TemplateRenderer";
import { demoPortfolioData } from "./demoPortfolioData";

const TemplateDemoModal = ({
  isOpen,
  onClose,
  initialTemplateId = "modern",
  selectedTemplateId,
  onSelectTemplate,
  userPlan = "free",
  onUpgrade,
}) => {
  const [activeTemplateId, setActiveTemplateId] = useState(initialTemplateId);
  const [viewport, setViewport] = useState("desktop"); // 'desktop' | 'tablet' | 'mobile'

  // Synchronize active template whenever modal opens or initialTemplateId changes
  useEffect(() => {
    if (initialTemplateId) {
      setActiveTemplateId(initialTemplateId);
    }
  }, [initialTemplateId, isOpen]);

  if (!isOpen) return null;

  const currentIndex = Math.max(
    0,
    TEMPLATES.findIndex((t) => t.id === activeTemplateId)
  );
  const currentTemplate = TEMPLATES[currentIndex] || TEMPLATES[0];

  const isProUser = userPlan && userPlan.toLowerCase() !== "free";
  const isLocked =
    (currentTemplate.plan === "pro" || currentTemplate.tier === "pro") &&
    !isProUser;
  const isCurrentlySelected = selectedTemplateId === currentTemplate.id;

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + TEMPLATES.length) % TEMPLATES.length;
    setActiveTemplateId(TEMPLATES[nextIdx].id);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % TEMPLATES.length;
    setActiveTemplateId(TEMPLATES[nextIdx].id);
  };

  const handleSelect = () => {
    if (isLocked) {
      if (onUpgrade) onUpgrade();
      return;
    }
    if (onSelectTemplate) {
      onSelectTemplate(currentTemplate.id);
    }
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/95 backdrop-blur-2xl text-white animate-in fade-in duration-200 overflow-hidden">
      {/* Top Floating Control Bar */}
      <header className="shrink-0 h-16 border-b border-zinc-800 bg-zinc-950/95 px-4 sm:px-6 flex items-center justify-between gap-4 z-20">
        {/* Left: Close & Current Template Info */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer shrink-0"
            title="Close Preview"
          >
            <X size={20} />
          </button>

          <div className="h-5 w-px bg-zinc-800 hidden sm:block shrink-0" />

          {/* Template Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm ring-2 ring-white/10"
              style={{ backgroundColor: currentTemplate.accent || "#6366f1" }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white truncate">
                  {currentTemplate.name}
                </h2>
                {currentTemplate.plan === "pro" ||
                currentTemplate.tier === "pro" ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center gap-1 shrink-0">
                    <Lock size={10} />
                    <span>PRO</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold shrink-0">
                    FREE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 truncate hidden md:block">
                {currentTemplate.description}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Template Switcher Carousel & Viewport Controls */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Prev / Next template carousel arrows */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              title="Previous Template"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-mono font-bold px-2 text-zinc-300">
              {currentIndex + 1} / {TEMPLATES.length}
            </span>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              title="Next Template"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Device Viewport Switcher */}
          <div className="hidden lg:flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button
              onClick={() => setViewport("desktop")}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer flex items-center gap-1 ${
                viewport === "desktop"
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
              title="Desktop View"
            >
              <Monitor size={15} />
            </button>
            <button
              onClick={() => setViewport("tablet")}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer flex items-center gap-1 ${
                viewport === "tablet"
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
              title="Tablet View"
            >
              <Tablet size={15} />
            </button>
            <button
              onClick={() => setViewport("mobile")}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer flex items-center gap-1 ${
                viewport === "mobile"
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
              title="Mobile View"
            >
              <Smartphone size={15} />
            </button>
          </div>
        </div>

        {/* Right: Action Buttons (Select or Upgrade) */}
        <div className="flex items-center gap-3 shrink-0">
          {isLocked ? (
            <button
              onClick={handleSelect}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 transition cursor-pointer"
            >
              <Lock size={13} />
              <span>Upgrade to Pro to Unlock</span>
            </button>
          ) : isCurrentlySelected ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs">
              <Check size={14} />
              <span>Currently Selected</span>
            </div>
          ) : (
            <button
              onClick={handleSelect}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Check size={14} />
              <span>Use This Template</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Preview Container */}
      <div className="flex-1 overflow-y-auto bg-zinc-950 flex justify-center items-start">
        {viewport === "desktop" && (
          <div className="w-full bg-zinc-950 min-h-full">
            <TemplateRenderer
              portfolio={demoPortfolioData}
              templateOverride={currentTemplate.id}
              previewDevice="desktop"
            />
          </div>
        )}

        {viewport === "tablet" && (
          <div className="w-[768px] max-w-full my-6 border-[10px] border-zinc-800 rounded-[32px] shadow-2xl bg-zinc-950 overflow-hidden ring-1 ring-zinc-700 shrink-0">
            <div className="h-6 bg-zinc-800 flex items-center justify-center">
              <div className="w-12 h-1 bg-zinc-700 rounded-full" />
            </div>
            <div className="max-h-[78vh] overflow-y-auto">
              <TemplateRenderer
                portfolio={demoPortfolioData}
                templateOverride={currentTemplate.id}
                previewDevice="tablet"
              />
            </div>
          </div>
        )}

        {viewport === "mobile" && (
          <div className="w-[390px] max-w-full my-6 border-[10px] border-zinc-800 rounded-[44px] shadow-2xl bg-zinc-950 overflow-hidden ring-1 ring-zinc-700 shrink-0">
            <div className="h-7 bg-zinc-800 flex items-center justify-center">
              <div className="w-20 h-4 bg-zinc-900 rounded-full" />
            </div>
            <div className="max-h-[78vh] overflow-y-auto">
              <TemplateRenderer
                portfolio={demoPortfolioData}
                templateOverride={currentTemplate.id}
                previewDevice="mobile"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default TemplateDemoModal;
