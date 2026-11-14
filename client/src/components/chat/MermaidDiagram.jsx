import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import mermaid from "mermaid";
import {
  Check,
  Copy,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Maximize2,
  Minimize2,
  Eye,
  Code,
  Download,
  Move,
  X,
} from "lucide-react";

// Initialize mermaid with high-definition styling & no max-width squashing
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  flowchart: {
    useMaxWidth: false,
    htmlLabels: true,
    curve: "basis",
    padding: 24,
    nodeSpacing: 50,
    rankSpacing: 60,
  },
  themeVariables: {
    darkMode: true,
    fontSize: "14px",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    primaryColor: "#27272a",
    primaryTextColor: "#ffffff",
    primaryBorderColor: "#6366f1",
    lineColor: "#818cf8",
    secondaryColor: "#1e1b4b",
    tertiaryColor: "#09090b",
    mainBkg: "#18181b",
    nodeBorder: "#6366f1",
    nodeTextColor: "#ffffff",
    edgeLabelBackground: "#09090b",
    labelTextColor: "#e0e7ff",
  },
  securityLevel: "strict",
});

let idCounter = 0;

// Helper: Sanitize SVG markup against embedded script elements and inline event handlers
function sanitizeSvgString(raw) {
  if (!raw || typeof raw !== "string") return "";
  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "")
    .replace(/javascript\s*:/gi, "");
}

// Helper: Parse any color string (hex, rgb, rgba, hsl, hsla, named) to RGB components
function parseColorToRgb(str) {
  if (!str) return null;
  const s = str
    .replace(/!important/gi, "")
    .replace(/['"]/g, "")
    .trim()
    .toLowerCase();
  if (s === "none" || s === "transparent" || s === "") return null;

  // Hex format: #fff, #ffff, #ffffff, #ffffff80
  if (s.startsWith("#")) {
    let hex = s.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .slice(0, 3)
        .split("")
        .map((c) => c + c)
        .join("");
    }
    if (hex.length >= 6) {
      const num = parseInt(hex.slice(0, 6), 16);
      if (!isNaN(num)) {
        return {
          r: (num >> 16) & 255,
          g: (num >> 8) & 255,
          b: num & 255,
        };
      }
    }
  }

  // rgb(...) or rgba(...)
  const rgbMatch = s.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  // hsl(...) or hsla(...)
  const hslMatch = s.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/i);
  if (hslMatch) {
    const l = parseInt(hslMatch[3], 10);
    // Rough RGB approximation based on lightness for contrast check
    const val = Math.round((l / 100) * 255);
    return { r: val, g: val, b: val };
  }

  // Comprehensive named pastel / light / common colors used in Mermaid diagrams
  const namedColors = {
    white: { r: 255, g: 255, b: 255 },
    ivory: { r: 255, g: 255, b: 240 },
    yellow: { r: 255, g: 255, b: 0 },
    lightyellow: { r: 255, g: 255, b: 224 },
    lemonchiffon: { r: 255, g: 250, b: 205 },
    peachpuff: { r: 255, g: 218, b: 185 },
    papayawhip: { r: 255, g: 239, b: 213 },
    moccasin: { r: 255, g: 228, b: 181 },
    orange: { r: 255, g: 165, b: 0 },
    coral: { r: 255, g: 127, b: 80 },
    pink: { r: 255, g: 192, b: 203 },
    lightpink: { r: 255, g: 182, b: 193 },
    hotpink: { r: 255, g: 105, b: 180 },
    lavender: { r: 230, g: 230, b: 250 },
    lightblue: { r: 173, g: 216, b: 230 },
    lightskyblue: { r: 135, g: 206, b: 250 },
    skyblue: { r: 135, g: 206, b: 235 },
    lightcyan: { r: 224, g: 255, b: 255 },
    cyan: { r: 0, g: 255, b: 255 },
    palegreen: { r: 152, g: 251, b: 152 },
    lightgreen: { r: 144, g: 238, b: 144 },
    lightgray: { r: 211, g: 211, b: 211 },
    lightgrey: { r: 211, g: 211, b: 211 },
    silver: { r: 192, g: 192, b: 192 },
    gainsboro: { r: 220, g: 220, b: 220 },
    whitesmoke: { r: 245, g: 245, b: 245 },
    beige: { r: 245, g: 245, b: 220 },
    linen: { r: 250, g: 240, b: 230 },
    antiquewhite: { r: 250, g: 235, b: 215 },
    blanchedalmond: { r: 255, g: 235, b: 205 },
    bisque: { r: 255, g: 228, b: 196 },
    wheat: { r: 245, g: 222, b: 179 },
    honeydew: { r: 240, g: 255, b: 240 },
    mintcream: { r: 245, g: 255, b: 250 },
    azure: { r: 240, g: 255, b: 255 },
    aliceblue: { r: 240, g: 248, b: 255 },
    ghostwhite: { r: 248, g: 248, b: 255 },
    seashell: { r: 255, g: 245, b: 238 },
    snow: { r: 255, g: 250, b: 250 },
    floralwhite: { r: 255, g: 250, b: 240 },
    mistyrose: { r: 255, g: 228, b: 225 },
    khaki: { r: 240, g: 230, b: 140 },
    paleturquoise: { r: 175, g: 238, b: 238 },
    aquamarine: { r: 127, g: 255, b: 212 },
    thistle: { r: 216, g: 191, b: 216 },
    plum: { r: 221, g: 160, b: 221 },
  };
  if (namedColors[s]) return namedColors[s];

  return null;
}

// Helper: Determine if a background color is light based on perceived luminance
function isLightBackground(rgb) {
  if (!rgb) return false;
  // Standard perceived luminance formula (ITU-R BT.601)
  const lum = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return lum > 0.42; // Any color with >42% perceived luminance is light
}

// Helper: Robustly extract fill color from SVG/DOM element across all possible attributes
function extractFillColor(element) {
  if (!element) return null;

  // 1. Direct SVG fill attribute
  const fillAttr = element.getAttribute("fill");
  if (fillAttr && fillAttr !== "none" && fillAttr !== "transparent") {
    return fillAttr;
  }

  // 2. Inline style property
  if (element.style && element.style.fill && element.style.fill !== "none") {
    return element.style.fill;
  }

  // 3. Raw style attribute string e.g. "fill:#bae6fd;stroke:#0284c7"
  const rawStyle = element.getAttribute("style");
  if (rawStyle) {
    const match = rawStyle.match(/(?:^|;|\s)fill\s*:\s*([^;!]+)/i);
    if (match && match[1]) {
      const val = match[1].trim();
      if (val !== "none" && val !== "transparent") {
        return val;
      }
    }
  }

  // 4. getComputedStyle (when mounted in DOM)
  if (typeof window !== "undefined" && typeof window.getComputedStyle === "function") {
    try {
      const computed = window.getComputedStyle(element);
      if (computed && computed.fill && computed.fill !== "none") {
        return computed.fill;
      }
    } catch (_) {}
  }

  return null;
}

// Preprocessor: Ensure any Mermaid style / classDef directive with a light fill explicitly specifies dark text
function ensureMermaidStyleContrast(code) {
  if (!code) return code;
  return code
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      // Match style or classDef lines: e.g., style B fill:#ffedd5,stroke:#f97316
      if (/^(style|classDef)\s+/i.test(trimmed)) {
        const fillMatch = trimmed.match(/fill\s*:\s*([^,; \n]+)/i);
        if (fillMatch && fillMatch[1]) {
          const fillColorStr = fillMatch[1].trim();
          const rgb = parseColorToRgb(fillColorStr);
          if (rgb && isLightBackground(rgb)) {
            // If the line already has color: ...
            if (/color\s*:\s*([^,; \n]+)/i.test(trimmed)) {
              // Replace any white/light color with deep dark black
              return line.replace(/color\s*:\s*([^,; \n]+)/gi, "color:#09090b");
            } else {
              // Append color:#09090b
              return `${line},color:#09090b`;
            }
          }
        }
      }
      return line;
    })
    .join("\n");
}

// Post-processor: Ensures light-colored boxes get bold dark text, and dark boxes get bright white text
function applyNodeContrastToDom(container) {
  if (!container) return;
  const svg = container.querySelector("svg");
  if (!svg) return;

  const nodes = svg.querySelectorAll("g.node");
  nodes.forEach((node) => {
    // 1. Locate the background shape (rect, polygon, circle, ellipse, path)
    const shape = node.querySelector("rect, polygon, circle, ellipse, path.basic, path:not(.flowchart-link)");
    const fillStr = extractFillColor(shape) || extractFillColor(node);

    const rgb = parseColorToRgb(fillStr);
    const isLight = isLightBackground(rgb);

    const textElements = node.querySelectorAll(
      "text, tspan, .label, .nodeLabel, span, div, p, a, b, strong"
    );

    if (isLight) {
      node.setAttribute("data-light-node", "true");
      node.classList.add("light-node");
      if (shape) shape.style.strokeWidth = "2.5px";
      textElements.forEach((el) => {
        el.setAttribute("fill", "#09090b");
        el.style.setProperty("fill", "#09090b", "important");
        el.style.setProperty("color", "#09090b", "important");
        el.style.setProperty("font-weight", "800", "important");
        el.style.setProperty("text-shadow", "none", "important");
        el.style.setProperty("-webkit-text-fill-color", "#09090b", "important");
      });
    } else if (fillStr) {
      // Confirmed dark background
      node.setAttribute("data-light-node", "false");
      node.classList.remove("light-node");
      textElements.forEach((el) => {
        el.setAttribute("fill", "#ffffff");
        el.style.setProperty("fill", "#ffffff", "important");
        el.style.setProperty("color", "#ffffff", "important");
        el.style.setProperty("font-weight", "600", "important");
        el.style.setProperty("-webkit-text-fill-color", "#ffffff", "important");
      });
    }
  });

  // Edge labels badges (HTTP methods and data payloads)
  const edgeLabels = svg.querySelectorAll("g.edgeLabel, .edgeLabel");
  edgeLabels.forEach((edge) => {
    const textEls = edge.querySelectorAll("text, tspan, span, p, div, .edgeLabel");
    textEls.forEach((el) => {
      el.style.setProperty("fill", "#e0e7ff", "important");
      el.style.setProperty("color", "#e0e7ff", "important");
      el.style.setProperty("font-weight", "600", "important");
    });
    const rects = edge.querySelectorAll("rect");
    rects.forEach((r) => {
      r.style.setProperty("fill", "#09090b", "important");
      r.style.setProperty("stroke", "#6366f1", "important");
      r.style.setProperty("stroke-width", "1.5px", "important");
      r.style.setProperty("rx", "4px", "important");
    });
  });
}

const MermaidDiagram = ({ code }) => {
  const containerRef = useRef(null);
  const fullscreenContainerRef = useRef(null);
  const [svgContent, setSvgContent] = useState("");
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Initially small preview
  const [zoom, setZoom] = useState(0.7); // Scaled for compact view
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("diagram"); // "diagram" | "code"

  const handleToggleExpand = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else {
      setIsExpanded(false);
      setZoom(0.7);
      setPan({ x: 0, y: 0 });
    }
  };

  // Render diagram with Mermaid and pre-process contrast
  useEffect(() => {
    let isMounted = true;
    const renderDiagram = async () => {
      if (!code || !code.trim()) return;
      try {
        setError(null);
        const uniqueId = `mermaid-svg-${Date.now()}-${++idCounter}`;
        const rawCleanCode = code
          .replace(/^```(?:mermaid)?/i, "")
          .replace(/```$/, "")
          .trim();

        // 1. Pre-process mermaid code to inject color:#09090b into any light node styling
        const cleanCode = ensureMermaidStyleContrast(rawCleanCode);

        const { svg } = await mermaid.render(uniqueId, cleanCode);
        if (isMounted) {
          // Pre-process SVG with DOMParser to strip max-width and resolve node contrast
          try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(svg, "image/svg+xml");
            const svgEl = doc.querySelector("svg");
            if (svgEl) {
              const existingStyle = svgEl.getAttribute("style") || "";
              const cleanStyle = existingStyle.replace(/max-width:[^;]+;?/gi, "");
              svgEl.setAttribute(
                "style",
                `${cleanStyle}; max-width: none !important; width: auto !important; height: auto !important;`
              );

              // Pre-apply contrast attributes
              const nodes = svgEl.querySelectorAll("g.node");
              nodes.forEach((node) => {
                const shape = node.querySelector(
                  "rect, polygon, circle, ellipse, path.basic, path:not(.flowchart-link)"
                );
                const fillStr = extractFillColor(shape) || extractFillColor(node);
                const rgb = parseColorToRgb(fillStr);
                const isLight = isLightBackground(rgb);

                const textElements = node.querySelectorAll(
                  "text, tspan, .label, .nodeLabel, span, div, p, a, b, strong"
                );
                if (isLight) {
                  node.setAttribute("data-light-node", "true");
                  node.setAttribute(
                    "class",
                    ((node.getAttribute("class") || "") + " light-node").trim()
                  );
                  textElements.forEach((el) => {
                    el.setAttribute("fill", "#09090b");
                    el.setAttribute(
                      "style",
                      `${el.getAttribute("style") || ""}; fill: #09090b !important; color: #09090b !important; font-weight: 800 !important; -webkit-text-fill-color: #09090b !important; text-shadow: none !important;`
                    );
                  });
                } else if (fillStr) {
                  node.setAttribute("data-light-node", "false");
                  textElements.forEach((el) => {
                    el.setAttribute("fill", "#ffffff");
                    el.setAttribute(
                      "style",
                      `${el.getAttribute("style") || ""}; fill: #ffffff !important; color: #ffffff !important; font-weight: 600 !important; -webkit-text-fill-color: #ffffff !important;`
                    );
                  });
                }
              });

              const serializer = new XMLSerializer();
              const processedSvg = serializer.serializeToString(svgEl);
              setSvgContent(sanitizeSvgString(processedSvg));
            } else {
              setSvgContent(sanitizeSvgString(svg));
            }
          } catch (_) {
            setSvgContent(sanitizeSvgString(svg));
          }
        }
      } catch (err) {
        console.warn("[MermaidDiagram] Render error:", err);
        if (isMounted) {
          setError(err.message || "Failed to render diagram");
        }
      }
    };

    renderDiagram();
    return () => {
      isMounted = false;
    };
  }, [code]);

  // Apply live DOM contrast adjustments to catch any late-injected HTML labels
  useLayoutEffect(() => {
    if (!svgContent) return;
    const runContrastCheck = () => {
      applyNodeContrastToDom(containerRef.current);
      if (fullscreenContainerRef.current) {
        applyNodeContrastToDom(fullscreenContainerRef.current);
      }
    };

    // Run immediately and after a short paint delay to handle async HTML labels
    runContrastCheck();
    const timer1 = setTimeout(runContrastCheck, 30);
    const timer2 = setTimeout(runContrastCheck, 150);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [svgContent, isFullscreen, activeTab]);

  // Lock body scroll and listen for Escape key in fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-diagram-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Drag-to-Pan handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left-click
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleFit = () => {
    setZoom(0.85);
    setPan({ x: 0, y: 0 });
  };

  const handle100Percent = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (error) {
    return (
      <div className="my-3 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto shadow-inner">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-zinc-400 text-[11px]">
          <span>Workflow Code</span>
          <button
            onClick={handleCopy}
            className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
        <pre className="text-indigo-300 whitespace-pre-wrap">{code}</pre>
      </div>
    );
  }

  return (
    <>
      {/* Inline Chat Diagram Card */}
      <div className="my-3.5 rounded-xl border border-zinc-700/80 bg-zinc-950/95 shadow-2xl overflow-hidden group">
        {/* Header Toolbar */}
        <div className="px-3 py-2 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
          {/* Left: View Tabs */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab("diagram")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                  activeTab === "diagram"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Eye size={12} />
                <span>Visual Diagram</span>
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                  activeTab === "code"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Code size={12} />
                <span>Code</span>
              </button>
            </div>
          </div>

          {/* Right: Controls, Maximize & Fullscreen Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {activeTab === "diagram" && isExpanded && (
              <>
                <button
                  onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.15).toFixed(2))))}
                  className="p-1 rounded hover:bg-zinc-800 hover:text-zinc-200 text-zinc-400 transition cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="text-[11px] font-mono text-indigo-300 w-10 text-center font-bold">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.15).toFixed(2))))}
                  className="p-1 rounded hover:bg-zinc-800 hover:text-zinc-200 text-zinc-400 transition cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={13} />
                </button>
                <button
                  onClick={handleReset}
                  className="p-1 rounded hover:bg-zinc-800 hover:text-zinc-200 text-zinc-400 transition cursor-pointer"
                  title="Reset Zoom & Position"
                >
                  <RefreshCw size={12} />
                </button>
                <button
                  onClick={handle100Percent}
                  className="px-1.5 py-0.5 rounded bg-zinc-800/60 hover:bg-zinc-800 text-[10px] font-mono text-zinc-300 transition cursor-pointer"
                  title="100% Actual Size"
                >
                  100%
                </button>

                <div className="h-3.5 w-px bg-zinc-800 mx-0.5" />
              </>
            )}

            {/* Inline Maximize / Collapse Button using Magnify Icon */}
            {activeTab === "diagram" && (
              <button
                onClick={handleToggleExpand}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer shadow-sm border ${
                  isExpanded
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
                    : "bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border-indigo-500/40"
                }`}
                title={isExpanded ? "Collapse flowchart" : "Maximize flowchart"}
              >
                {isExpanded ? <Minimize2 size={13} /> : <ZoomIn size={13} className="text-indigo-300 stroke-[2.5]" />}
                <span>{isExpanded ? "Collapse" : "Maximize"}</span>
              </button>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={() => {
                setIsFullscreen(true);
                setZoom(1.15);
                setPan({ x: 0, y: 0 });
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 hover:text-white border border-purple-500/40 text-[11px] font-semibold transition cursor-pointer shadow-sm"
              title="Open Fullscreen View (Full Monitor Resolution)"
            >
              <Maximize2 size={12} className="text-purple-300" />
              <span>Fullscreen</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer text-[11px]"
              title="Copy Mermaid Code"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Content Body: Compact Small vs Expanded Canvas */}
        {activeTab === "diagram" ? (
          isExpanded ? (
            /* 1. Expanded Inline View */
            <div
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`p-4 overflow-auto h-[480px] sm:h-[540px] max-h-[640px] bg-zinc-950 flex items-center justify-center relative select-none scrollbar-thin transition-all duration-300 ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              {svgContent ? (
                <div
                  ref={containerRef}
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: "center center",
                    transition: isDragging ? "none" : "transform 0.12s ease",
                  }}
                  className="mermaid-svg-wrapper select-none [&_svg]:min-w-[700px] [&_svg]:max-w-none [&_svg]:h-auto shadow-xl"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              ) : (
                <div className="flex items-center gap-2 text-zinc-500 text-xs py-10">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
                  <span>Rendering high-definition visual workflow diagram...</span>
                </div>
              )}
            </div>
          ) : (
            /* 2. Compact Small Initial Representation (Completely Static - No Moving On Mouse Hover) */
            <div className="relative h-[210px] sm:h-[230px] overflow-hidden bg-zinc-950 flex items-center justify-center select-none">
              {svgContent ? (
                <div
                  ref={containerRef}
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "center center",
                  }}
                  className="mermaid-svg-wrapper select-none [&_svg]:max-w-[95%] [&_svg]:max-h-[185px] [&_svg]:w-auto [&_svg]:h-auto pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              ) : (
                <div className="flex items-center gap-2 text-zinc-500 text-xs py-10">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
                  <span>Rendering preview...</span>
                </div>
              )}

              {/* Floating Bottom Center: Dedicated Magnify Icon Button ONLY */}
              <div className="absolute inset-x-0 bottom-2.5 flex items-center justify-center pointer-events-auto">
                <button
                  type="button"
                  onClick={handleToggleExpand}
                  className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/25 border border-indigo-400/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title="Maximize Flowchart"
                >
                  <ZoomIn size={14} className="stroke-[2.5]" />
                  <span>Maximize Flowchart</span>
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="p-4 bg-zinc-950 text-xs font-mono text-indigo-300 overflow-x-auto max-h-[450px]">
            <pre className="whitespace-pre-wrap">{code}</pre>
          </div>
        )}
      </div>

      {/* True Fullscreen Modal (Breaks out of all container limits) */}
      {isFullscreen &&
        createPortal(
          <div className="fixed inset-0 z-[99999] bg-zinc-950/98 backdrop-blur-2xl flex flex-col text-zinc-100 select-none animate-in fade-in duration-200">
            {/* Fullscreen Header */}
            <div className="px-5 py-3.5 bg-zinc-900/95 border-b border-zinc-800 flex items-center justify-between shadow-2xl">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>Visual Workflow Architecture Diagram</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/60 font-mono">
                      Full Resolution (100% Vector)
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                    <Move size={12} className="text-indigo-400 inline" />
                    <span>Click & drag anywhere to pan • Use zoom controls for micro-inspection</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Zoom Controls Bar */}
                <div className="flex items-center bg-zinc-800/90 border border-zinc-700/80 rounded-lg p-0.5">
                  <button
                    onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.2).toFixed(2))))}
                    className="p-1.5 rounded hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut size={15} />
                  </button>
                  <span className="text-xs font-mono text-indigo-300 w-14 text-center font-bold">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom((z) => Math.min(3.5, Number((z + 0.2).toFixed(2))))}
                    className="p-1.5 rounded hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn size={15} />
                  </button>
                  <button
                    onClick={handle100Percent}
                    className="px-2.5 py-1 text-xs rounded hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer font-semibold"
                    title="Reset to 100% Actual Scale"
                  >
                    100%
                  </button>
                  <button
                    onClick={handleFit}
                    className="px-2.5 py-1 text-xs rounded hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer font-semibold"
                    title="Fit to Screen"
                  >
                    Fit
                  </button>
                </div>

                {/* Export SVG */}
                <button
                  onClick={handleDownloadSvg}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition cursor-pointer"
                  title="Download SVG file"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Export SVG</span>
                </button>

                {/* Copy Code */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? "Copied" : "Copy Code"}</span>
                </button>

                {/* Close Fullscreen */}
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-200 text-xs font-bold border border-rose-700/80 transition cursor-pointer ml-1"
                  title="Close Fullscreen (Esc)"
                >
                  <X size={15} />
                  <span>Close</span>
                </button>
              </div>
            </div>

            {/* Fullscreen Canvas with Pan & Drag */}
            <div
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`flex-1 overflow-hidden relative flex items-center justify-center bg-zinc-950 p-6 ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              <div
                ref={fullscreenContainerRef}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: isDragging ? "none" : "transform 0.12s ease",
                }}
                className="mermaid-svg-wrapper select-none [&_svg]:max-w-none [&_svg]:h-auto drop-shadow-2xl"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default MermaidDiagram;
