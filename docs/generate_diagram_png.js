import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mermaidCode = `flowchart TD
    classDef inputStage fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#fff;
    classDef processStage fill:#0f172a,stroke:#0ea5e9,stroke-width:2px,color:#fff;
    classDef aiStage fill:#3b0764,stroke:#c084fc,stroke-width:2px,color:#fff;
    classDef dbStage fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#fff;
    classDef outStage fill:#451a03,stroke:#fbbf24,stroke-width:2px,color:#fff;

    subgraph P1 [1. Multi-Modal Ingestion]
        A1[📄 PDF Resume Upload]:::inputStage
        A2[🔗 LinkedIn Profile URL]:::inputStage
        A3[🐙 GitHub Username]:::inputStage
        A4[✍️ Manual Form Entry]:::inputStage
    end

    subgraph P2 [2. Preprocessing & Extraction]
        B1[pdfjs-dist Stream Parser]:::processStage
        B2[Token Normalizer & Sanitizer]:::processStage
        B3[Avatar Resolution Engine]:::processStage
    end

    subgraph P3 [3. AI Reasoning & Fallback Cascade]
        C1{OpenRouter: Nemotron 3.5}:::aiStage
        C2[Failover: Liquid LFM 2.5]:::aiStage
        C3[Failover: Google Gemma 4]:::aiStage
        C4[Deterministic Heuristic Fallback]:::aiStage
    end

    subgraph P4 [4. Validation & Missing Info]
        D1[JSON Boundary Extractor]:::processStage
        D2{Missing Info Detector}:::processStage
        D3[Prompt User in UI for Missing Details]:::inputStage
    end

    subgraph P5 [5. Persistence & Versioning]
        E1[(MongoDB Atlas)]:::dbStage
        E2[Immutable Version Snapshot #1]:::dbStage
    end

    subgraph P6 [6. Client Studio & ATS Audit]
        F1[14-Theme Dynamic Template Engine]:::outStage
        F2[7-Pillar ATS Analyzer & Scoring]:::outStage
        F3[Career Copilot Chatbot]:::outStage
    end

    subgraph P7 [7. Multi-Channel Deployment]
        G1[⚡ Native Instant Public Link /p/:id]:::outStage
        G2[▲ Vercel Deploy Edge CDN]:::outStage
        G3[📦 Standalone ZIP archiver]:::outStage
    end

    A1 --> B1
    A2 & A3 & A4 --> B2
    B1 --> B2
    B2 --> B3
    B3 --> C1

    C1 -->|Timeout / 429| C2
    C2 -->|Fail| C3
    C3 -->|Fail| C4

    C1 & C2 & C3 & C4 --> D1
    D1 --> D2
    D2 -->|Missing Info| D3
    D2 -->|Complete Data| E1
    D3 -->|User Fills Details| E1

    E1 --> E2
    E1 --> F1
    F1 <--> F2
    F1 <--> F3

    F1 --> G1
    F1 --> G2
    F1 --> G3`;

async function main() {
  const b64 = Buffer.from(mermaidCode).toString("base64");
  const url = `https://mermaid.ink/img/${b64}?bgColor=09090b`;
  console.log("Fetching image from:", url);

  const res = await fetch(url);
  console.log("HTTP Status:", res.status);
  if (!res.ok) {
    throw new Error(`Failed to fetch diagram: ${res.status} ${res.statusText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const docsPng = path.resolve(__dirname, "architecture-flowchart.png");
  const clientPublic = path.resolve(__dirname, "../client/public/architecture-flowchart.png");
  
  fs.writeFileSync(docsPng, buffer);
  fs.writeFileSync(clientPublic, buffer);
  console.log(`Saved successfully to ${docsPng} (${buffer.length} bytes)!`);
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
