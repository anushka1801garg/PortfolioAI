import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const standardFontDataUrl =
  path.resolve(__dirname, "../../node_modules/pdfjs-dist/standard_fonts").replace(/\\/g, "/") + "/";

export const extractTextFromPDF = async (filePath) => {
  const data = new Uint8Array(fs.readFileSync(filePath));

  let pdf;
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(data),
      standardFontDataUrl,
    });
    pdf = await loadingTask.promise;
  } catch (err) {
    console.warn("[PDF Service] Failed with font URL, falling back to basic loader:", err.message);
    const fallbackTask = pdfjsLib.getDocument({
      data: new Uint8Array(data),
    });
    pdf = await fallbackTask.promise;
  }

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);

    const content = await page.getTextContent({
      includeMarkedContent: true,
      disableCombineTextItems: false,
    });

    const pageText = content.items
      .map((item) => item.str || "")
      .join(" ");

    text += pageText + "\n";
  }

  // Normalize MS Word / Wingdings private-use characters (e.g. \uF0B7 -> •, \uF020 -> space)
  text = text
    .replace(/[\uF0B7\uF0A7\uF076\uF0D8]/g, "•")
    .replace(/[\uF020\uF0A0]/g, " ")
    .replace(/[]/g, "•")
    .replace(/[]/g, " ");

  return text;
};


