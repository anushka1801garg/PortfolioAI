import { useEffect } from "react";

const DEFAULT_TITLE = "PortfolioAI — Executive & Award-Winning AI Portfolios";
const DEFAULT_DESCRIPTION =
  "Transform your resume into a stunning, production-ready developer portfolio in 30 seconds with PortfolioAI. Real-time AI styling, ATS scoring, and edge hosting.";
const DEFAULT_KEYWORDS =
  "AI portfolio builder, developer portfolio, ATS resume analyzer, executive portfolio, portfolio generator, GitHub portfolio, interactive developer website";
const DEFAULT_OG_IMAGE = "https://portfolioai.app/og-image.png";
const BASE_URL = "https://portfolioai.app";

/**
 * Universal SEO component for React 19 Single Page Applications.
 * Manages document head metadata dynamically across client-side routes,
 * including Open Graph, Twitter Cards, canonical URLs, and JSON-LD schema.
 */
const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noIndex = false,
  structuredData = null,
}) => {
  const fullTitle = title
    ? title.includes("PortfolioAI")
      ? title
      : `${title} | PortfolioAI`
    : DEFAULT_TITLE;

  const resolvedKeywords = Array.isArray(keywords)
    ? keywords.join(", ")
    : keywords;

  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "";
  const canonicalUrl = canonical
    ? canonical.startsWith("http")
      ? canonical
      : `${BASE_URL}${canonical}`
    : `${BASE_URL}${currentPath || "/"}`;

  useEffect(() => {
    // 1. Update Document Title
    document.title = fullTitle;

    // Helper: update or create <meta>
    const setMeta = (attrName, attrValue, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Helper: update or create <link>
    const setLink = (rel, href) => {
      if (!href) return;
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // 2. Primary Metadata
    setMeta("name", "title", fullTitle);
    setMeta("name", "description", description);
    setMeta("name", "keywords", resolvedKeywords);
    setMeta(
      "name",
      "robots",
      noIndex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );
    setLink("canonical", canonicalUrl);

    // 3. Open Graph Metadata
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:site_name", "PortfolioAI");

    // 4. Twitter Card Metadata
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);
    setMeta("name", "twitter:card", "summary_large_image");

    // 5. JSON-LD Structured Data
    const scriptId = "dynamic-seo-ldjson";
    let scriptEl = document.getElementById(scriptId);

    if (structuredData) {
      if (!scriptEl) {
        scriptEl = document.createElement("script");
        scriptEl.id = scriptId;
        scriptEl.type = "application/ld+json";
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(structuredData);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [
    fullTitle,
    description,
    resolvedKeywords,
    canonicalUrl,
    ogImage,
    ogType,
    noIndex,
    structuredData,
  ]);

  // React 19 Declarative Head Tags Support
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={resolvedKeywords} />
      <link rel="canonical" href={canonicalUrl} />
      <meta
        name="robots"
        content={
          noIndex
            ? "noindex, nofollow"
            : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        }
      />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </>
  );
};

export default SEO;

