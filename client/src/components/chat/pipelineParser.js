/**
 * Architecture Pipeline Parser & Detector
 * Extracts structured multi-tier layers, microservices, protocols, and payloads from raw diagrams
 */

/**
 * Determine if a code block contains an architecture pipeline or multi-tier diagram
 */
export function isArchitecturePipeline(text) {
  try {
    if (!text || typeof text !== "string") return false;
    const s = text.trim();
    if (s.length < 30) return false;

    // Box drawing characters
    const hasBoxChars = /[┌┐└┘│─┼┴┬├┤]/.test(s);
    // Common tier / layer keywords
    const hasLayers = /layer|tier|gateway|microservice|frontend|backend|persistence|database/i.test(s);
    // Directional arrows
    const hasArrows = /[▼▲►◄➔→]|-->|-->|\|\s*v\s*\|/i.test(s);
    // Bracketed numbers like [1. Client] or [Tier 1]
    const hasBracketedTiers = /\[\s*(?:\d+|tier|layer)[^\]]+\]/i.test(s);

    if (hasBoxChars && hasLayers) return true;
    if (hasBracketedTiers && hasArrows) return true;
    if ((s.match(/(?:USER INTERACTION|API GATEWAY|MICROSERVICE|PERSISTENCE|DATABASE)\s*(?:LAYER)?/gi) || []).length >= 2) return true;

    return false;
  } catch {
    return false;
  }
}

/**
 * Helper to clean and strip box drawing characters and extraneous padding
 */
export function cleanLine(line) {
  if (!line || typeof line !== "string") return "";
  return line
    .replace(/[┌┐└┘│─┼┴┬├┤]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parse raw ASCII/Unicode/Tier text into structured architecture layers
 */
export function parseArchitecturePipeline(rawText) {
  try {
    if (!rawText || typeof rawText !== "string") return null;
    const rawLines = rawText.split("\n");

    const layers = [];
    let currentConnector = null;

    // Check if text uses box-drawing structure (outer boxes starting with ┌ and ending with └)
    const isBoxArt = /[┌┐└┘│─]/.test(rawText);

    if (isBoxArt) {
      let inOuterBox = false;
      let boxLines = [];

      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        const trimmed = line.trim();

        // Top of an outer box: starts with ┌ or contains ┌───
        if (/^┌[─\s]+┐?$/.test(trimmed) || (/^┌/.test(trimmed) && trimmed.includes("─") && !inOuterBox)) {
          inOuterBox = true;
          boxLines = [];
          continue;
        }

        // Bottom of an outer box: starts with └ or contains └───
        if (inOuterBox && (/^└[─\s]+┘?$/.test(trimmed) || (/^└/.test(trimmed) && trimmed.includes("─")))) {
          inOuterBox = false;

          // Process completed box
          const processed = processBoxContent(boxLines, layers.length + 1);
          if (processed) {
            if (currentConnector && layers.length > 0) {
              layers[layers.length - 1].outgoingConnector = currentConnector;
              currentConnector = null;
            }
            layers.push(processed);
          }
          boxLines = [];
          continue;
        }

        if (inOuterBox) {
          boxLines.push(line);
        } else {
          // Between boxes: capture connector lines (arrows, protocols, payloads)
          const cleaned = cleanLine(line);
          if (cleaned && !/^[─\s]+$/.test(cleaned)) {
            if (!currentConnector) currentConnector = { label: "", payload: "" };
            if (/payload:/i.test(cleaned)) {
              currentConnector.payload = cleaned.replace(/^[^:]*:\s*/, "").trim();
            } else if (!/^[▼▲│|v\s]+$/.test(cleaned)) {
              const txt = cleaned.replace(/^[▼▲│|v➔\->\s]+/, "").trim();
              if (txt) {
                currentConnector.label = currentConnector.label ? `${currentConnector.label} • ${txt}` : txt;
              }
            }
          }
        }
      }

      // Attach trailing connector
      if (layers.length > 0 && currentConnector) {
        layers[layers.length - 1].outgoingConnector = currentConnector;
      }

      if (layers.length >= 2) return layers;
    }

    // Fallback for bracketed format: [1. Client SPA] \n ▼ \n [2. API Gateway]
    return parseBracketedPipeline(rawLines);
  } catch (err) {
    console.warn("Pipeline parse error fallback:", err);
    return null;
  }
}

/**
 * Helper to process all lines inside a single box
 */
function processBoxContent(lines, layerIndex) {
  if (!lines || lines.length === 0) return null;

  // 1. Identify Title: usually the first non-empty cleaned line
  let title = "";
  let contentStartIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const cl = cleanLine(lines[i]);
    if (cl.length > 2 && !/^[┌┐└┘│─┼┴┬├┤\s]+$/.test(lines[i])) {
      title = cl;
      contentStartIndex = i + 1;
      break;
    }
  }

  if (!title) title = `Layer ${layerIndex}`;

  const getLayerType = (t) => {
    const low = t.toLowerCase();
    if (low.includes("user") || low.includes("client") || low.includes("frontend") || low.includes("browser")) return "client";
    if (low.includes("gateway") || low.includes("api") || low.includes("edge") || low.includes("auth")) return "gateway";
    if (low.includes("microservice") || low.includes("service") || low.includes("backend")) return "services";
    if (low.includes("database") || low.includes("persistence") || low.includes("storage") || low.includes("cache")) return "database";
    return "default";
  };

  const layer = {
    id: layerIndex,
    title,
    type: getLayerType(title),
    components: [],
    bullets: [],
    flow: null,
  };

  const remainingLines = lines.slice(contentStartIndex);

  // Check for multi-column inner boxes (like ResourceFinder | TutorialEngine | AssessmentService)
  const innerBoxHeaderLine = remainingLines.find((l) => (l.match(/┌/g) || []).length >= 2);
  if (innerBoxHeaderLine) {
    // Multi-column grid detected!
    const colNames = [];
    const colDescs = [];

    remainingLines.forEach((l) => {
      // Line with column names inside inner vertical bars: │ Name1 │ │ Name2 │ │ Name3 │
      if (l.includes("│") || l.includes("|")) {
        const segments = l
          .split(/[│|]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 1 && !/^[─\s]+$/.test(s) && !s.startsWith("┌") && !s.startsWith("└"));

        if (segments.length >= 2) {
          if (segments.some((s) => s.startsWith("(") && s.endsWith(")"))) {
            // Parenthetical descriptions: (Course Discovery), (Content Delivery)
            colDescs.push(...segments.map((s) => s.replace(/^\(|\)$/g, "").trim()));
          } else {
            // Component names: ResourceFinder, TutorialEngine, AssessmentService
            colNames.push(...segments);
          }
        }
      }
    });

    if (colNames.length > 0) {
      colNames.forEach((name, idx) => {
        layer.components.push({
          name,
          description: colDescs[idx] || "Microservice",
        });
      });
      return layer;
    }
  }

  // Check for horizontal flow: Browser ---> React.js Frontend (TypeScript, Tailwind)
  for (const l of remainingLines) {
    const low = l.toLowerCase();
    if ((low.includes("browser") && (low.includes("frontend") || low.includes("react"))) || /─+>|-+>|-->|──>|➔/.test(l)) {
      const cleaned = cleanLine(l);
      const parts = cleaned.split(/(?:─+>|-+>|-->|──>|➔|>)/).map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        let fromPart = parts[0].replace(/HTTPS\s+GET\/POST/gi, "").trim();
        let toPart = parts[1].replace(/[|│\s]+$/, "").trim();
        let protocol = /GET|POST/i.test(l) ? "HTTPS GET/POST" : "Client Request";
        layer.flow = {
          from: fromPart || "Browser",
          to: toPart || "React.js Frontend",
          protocol,
        };
        break;
      }
    }
  }

  // Check for bullets and components (skip if already captured as flow)
  if (!layer.flow) {
    for (const l of remainingLines) {
      const cleaned = cleanLine(l);
      if (!cleaned || cleaned === title || /^[┌┐└┘│─┼┴┬├┤\s]+$/.test(l)) continue;

      // Bullet points
      if (/^[•\-*]\s*(.+)/.test(cleaned)) {
        layer.bullets.push(cleaned.replace(/^[•\-*]\s*/, "").trim());
        continue;
      }

      // Component name with description in parentheses: GraphQL API Gateway (Node.js)
      if (cleaned.includes("(") && cleaned.includes(")")) {
        const match = cleaned.match(/([^(]+)\s*\(([^)]+)\)/);
        if (match) {
          layer.components.push({
            name: match[1].trim(),
            description: match[2].trim(),
          });
          continue;
        }
      }

      // Standalone component or detail line
      if (layer.components.length === 0 && !cleaned.startsWith("•")) {
        layer.components.push({
          name: cleaned,
          description: "",
        });
      } else if (!layer.bullets.includes(cleaned)) {
        layer.bullets.push(cleaned);
      }
    }
  }

  return layer;
}

/**
 * Fallback parser for bracketed lines [1. ...] \n ▼ \n [2. ...]
 */
function parseBracketedPipeline(rawLines) {
  try {
    const layers = [];
    let currentLayer = null;
    let currentConnector = null;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) continue;

    const isBracketed = /^\[\s*(?:\d+[.:]?\s*)?([^\]]+)\]$/.test(line);

    if (isBracketed) {
      if (currentLayer && currentConnector) {
        currentLayer.outgoingConnector = currentConnector;
        currentConnector = null;
      }

      const match = line.match(/^\[\s*(?:\d+[.:]?\s*)?([^\]]+)\]$/);
      const title = match ? match[1].trim() : line;

      const low = title.toLowerCase();
      let type = "default";
      if (low.includes("user") || low.includes("client") || low.includes("browser") || low.includes("spa")) type = "client";
      else if (low.includes("gateway") || low.includes("edge") || low.includes("auth")) type = "gateway";
      else if (low.includes("service") || low.includes("controller") || low.includes("query")) type = "services";
      else if (low.includes("database") || low.includes("mongodb") || low.includes("storage") || low.includes("cache")) type = "database";

      currentLayer = {
        id: layers.length + 1,
        title,
        type,
        components: [],
        bullets: [],
        flow: null,
      };
      layers.push(currentLayer);
      continue;
    }

    if (currentLayer) {
      if (/^[▼▲│|v➔\->\s]+/.test(line)) {
        if (!currentConnector) currentConnector = { label: "", payload: "" };
        const cleaned = line.replace(/^[▼▲│|v➔\->\s]+/, "").trim();
        if (/payload:/i.test(cleaned)) {
          currentConnector.payload = cleaned.replace(/^payload:\s*/i, "");
        } else if (cleaned) {
          currentConnector.label = currentConnector.label ? `${currentConnector.label} • ${cleaned}` : cleaned;
        }
      } else if (/^[•\-*]\s*(.+)/.test(line)) {
        currentLayer.bullets.push(line.replace(/^[•\-*]\s*/, "").trim());
      } else {
        currentLayer.bullets.push(line);
      }
    }
  }

  if (currentLayer && currentConnector) {
    currentLayer.outgoingConnector = currentConnector;
  }

  return layers.length >= 2 ? layers : null;
  } catch (err) {
    console.warn("Pipeline parse error fallback:", err);
    return null;
  }
}

