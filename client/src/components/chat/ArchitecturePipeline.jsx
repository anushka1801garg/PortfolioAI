import { useState, useMemo } from "react";
import {
  Layers,
  Check,
  Copy,
  Code,
  Sparkles,
  Globe,
  ShieldCheck,
  Cpu,
  Database,
  ArrowDown,
  ArrowRight,
  Server,
  Zap,
  Boxes,
} from 'lucide-react';
import { isArchitecturePipeline, parseArchitecturePipeline } from "./pipelineParser";

/**
 * Styling themes for layer cards based on role
 */
const LAYER_THEMES = {
  client: {
    border: "border-sky-500/30",
    bg: "bg-sky-950/20",
    headerBg: "bg-sky-500/10",
    text: "text-sky-300",
    badgeBg: "bg-sky-500/20 border-sky-500/40 text-sky-200",
    icon: Globe,
    accent: "#0ea5e9",
  },
  gateway: {
    border: "border-purple-500/30",
    bg: "bg-purple-950/20",
    headerBg: "bg-purple-500/10",
    text: "text-purple-300",
    badgeBg: "bg-purple-500/20 border-purple-500/40 text-purple-200",
    icon: ShieldCheck,
    accent: "#a855f7",
  },
  services: {
    border: "border-indigo-500/30",
    bg: "bg-indigo-950/20",
    headerBg: "bg-indigo-500/10",
    text: "text-indigo-300",
    badgeBg: "bg-indigo-500/20 border-indigo-500/40 text-indigo-200",
    icon: Boxes,
    accent: "#6366f1",
  },
  database: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-950/20",
    headerBg: "bg-emerald-500/10",
    text: "text-emerald-300",
    badgeBg: "bg-emerald-500/20 border-emerald-500/40 text-emerald-200",
    icon: Database,
    accent: "#10b981",
  },
  default: {
    border: "border-zinc-700/60",
    bg: "bg-zinc-900/40",
    headerBg: "bg-zinc-800/40",
    text: "text-zinc-300",
    badgeBg: "bg-zinc-800 border-zinc-700 text-zinc-300",
    icon: Server,
    accent: "#71717a",
  },
};

export default function ArchitecturePipeline({ rawText }) {
  const [activeTab, setActiveTab] = useState("visual"); // "visual" | "code"
  const [copied, setCopied] = useState(false);

  const parsedLayers = useMemo(() => {
    return parseArchitecturePipeline(rawText);
  }, [rawText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If cannot parse cleanly into layers, default to clean monospace code block
  const canRenderVisual = parsedLayers && parsedLayers.length >= 2;

  return (
    <div className="my-5 rounded-2xl border border-zinc-800/90 bg-zinc-950 shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-zinc-700/80">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/90 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
            <Layers size={16} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              Multi-Tier Architecture Pipeline
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hidden sm:inline-flex items-center gap-1">
                <Zap size={10} /> Organized Flow
              </span>
            </h4>
            <p className="text-[10px] text-zinc-400 hidden sm:block">
              Directional system tiers, microservices, protocols & data payloads
            </p>
          </div>
        </div>

        {/* View Switcher & Copy Button */}
        <div className="flex items-center gap-1.5">
          {canRenderVisual && (
            <div className="flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <button
                onClick={() => setActiveTab("visual")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  activeTab === "visual"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Switch to Interactive Visual Diagram"
              >
                <Sparkles size={12} />
                <span>Visual Flow</span>
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  activeTab === "code"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Switch to Monospace Code View"
              >
                <Code size={12} />
                <span>Code</span>
              </button>
            </div>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition"
            title="Copy Pipeline Text"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "visual" && canRenderVisual ? (
        <div className="p-4 sm:p-6 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900/60 overflow-x-auto">
          <div className="max-w-3xl mx-auto space-y-4">
            {parsedLayers.map((layer, idx) => {
              const theme = LAYER_THEMES[layer.type] || LAYER_THEMES.default;
              const IconComp = theme.icon;

              return (
                <div key={layer.id || idx} className="relative">
                  {/* Layer Container Card */}
                  <div
                    className={`rounded-xl border ${theme.border} ${theme.bg} p-4 sm:p-5 transition duration-200 hover:shadow-lg hover:shadow-indigo-500/5`}
                  >
                    {/* Layer Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-zinc-800/80">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-inner font-bold text-xs"
                          style={{ backgroundColor: `${theme.accent}33`, color: theme.accent }}
                        >
                          <IconComp size={15} />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                            Tier 0{layer.id}
                          </span>
                          <h5 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                            {layer.title}
                          </h5>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${theme.badgeBg}`}
                      >
                        {layer.type.toUpperCase()} TIER
                      </span>
                    </div>

                    {/* Layer Body */}
                    {/* Case 1: Horizontal Client Flow (e.g. Browser -> React Frontend) */}
                    {layer.flow && (
                      <div className="flex flex-wrap items-center justify-center gap-3 p-3 rounded-lg bg-zinc-900/80 border border-zinc-800/70 text-xs my-2">
                        <div className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700 text-white font-semibold flex items-center gap-1.5">
                          <Globe size={13} className="text-sky-400" />
                          <span>{layer.flow.from}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-mono px-2 py-1 rounded bg-zinc-950 border border-zinc-800">
                          <span className="text-emerald-400 font-semibold">{layer.flow.protocol}</span>
                          <ArrowRight size={13} className="text-indigo-400 animate-pulse" />
                        </div>
                        <div className="px-3 py-1.5 rounded-md bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 font-semibold flex items-center gap-1.5">
                          <Cpu size={13} className="text-indigo-400" />
                          <span>{layer.flow.to}</span>
                        </div>
                      </div>
                    )}

                    {/* Case 2: Grid of Microservices / Subcomponents */}
                    {layer.components.length > 0 && !layer.flow && (
                      <div
                        className={`grid gap-2.5 my-2 ${
                          layer.components.length >= 3
                            ? "grid-cols-1 sm:grid-cols-3"
                            : layer.components.length === 2
                            ? "grid-cols-1 sm:grid-cols-2"
                            : "grid-cols-1"
                        }`}
                      >
                        {layer.components.map((comp, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800/90 hover:border-zinc-700 transition flex flex-col justify-between"
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                              <span className="text-xs font-bold text-white tracking-wide">
                                {comp.name}
                              </span>
                            </div>
                            {comp.description && (
                              <span className="text-[11px] text-zinc-400 leading-snug">
                                {comp.description}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Case 3: Bulleted Details / Responsibilities */}
                    {layer.bullets.length > 0 && (
                      <ul className="mt-3 space-y-1.5 text-xs text-zinc-300">
                        {layer.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2">
                            <span className="text-indigo-400 font-bold mt-0.5">•</span>
                            <span className="leading-relaxed">{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Inter-Tier Connector to Next Layer */}
                  {idx < parsedLayers.length - 1 && (
                    <div className="flex flex-col items-center justify-center py-2 relative">
                      {/* Vertical line with gradient */}
                      <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-500 to-purple-500" />

                      {/* Directional Arrow / Badge */}
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-indigo-500/40 text-indigo-300 text-[11px] font-mono shadow-md my-0.5">
                        <ArrowDown size={11} className="text-indigo-400 animate-bounce" />
                        <span>
                          {layer.outgoingConnector?.label ||
                            layer.outgoingConnector?.payload ||
                            "Data Dispatch & Wire Protocol"}
                        </span>
                      </div>

                      <div className="w-0.5 h-6 bg-gradient-to-b from-purple-500 to-sky-500" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Monospace Formatted View with strictly aligned font and horizontal scrolling */
        <div className="p-4 sm:p-5 bg-zinc-950 overflow-x-auto">
          <pre
            className="font-mono text-[11.5px] sm:text-xs leading-[1.35] text-zinc-300 select-text"
            style={{
              fontFamily:
                "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, Menlo, Monaco, 'Courier New', monospace",
              whiteSpace: "pre",
              tabSize: 2,
              letterSpacing: "0px",
            }}
          >
            {rawText}
          </pre>
        </div>
      )}
    </div>
  );
}
