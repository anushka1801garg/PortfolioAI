import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link, useLocation, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import SEO from "../../../components/common/SEO";
import {
  Sparkles,
  Save,
  Eye,
  Sliders,
  UploadCloud,
  CheckCircle,
  FileText,
  Code2,
  Lock,
  Layers,
  ArrowRight,
  RefreshCw,
  Award,
  ShieldCheck,
  Zap,
  Edit3,
  Bot,
  ArrowLeft,
  Check,
  X,
  Trash2,
  Search,
  Filter,
  Compass,
  Briefcase,
  Building2,
  Wand2,
  FileCode,
  Terminal,
  Layout,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Plus,
  ExternalLink,
  Palette,
  Image as ImageIcon,
  Link2,
  Upload,
  Camera,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

import {
  generatePortfolio,
  setGeneratedPortfolio,
  clearGeneratedPortfolio,
} from "../../../redux/portfolioGenerator/portfolioGeneratorSlice";
import { createPortfolio } from "../../../redux/portfolio/portfolioSlice";
import TemplateRenderer from "../components/templates/TemplateRenderer";
import { TEMPLATES } from "../components/templates/templateList";
import {
  generateFromData,
  fetchGitHubProfile,
  extractGitHubUsername,
  analyzePortfolioReference,
} from "../services/portfolioGeneratorService";
import AIChatAssistant from "../../../components/chat/AIChatAssistant";
import UpgradeModal from "../../../components/modals/UpgradeModal";
import TemplateDemoModal from "../components/templates/TemplateDemoModal";
import MissingInfoPrompt from "../components/MissingInfoPrompt";
import PhotoUploadModal from "../components/PhotoUploadModal";

const TARGET_ROLES = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "AI / ML Engineer",
  "Product Designer",
  "DevOps / Cloud Engineer",
  "Mobile Developer",
  "Data Scientist",
];

const TARGET_COMPANIES = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Netflix",
  "High-Growth Startup",
  "Open Source",
];

const ARCHETYPES = [
  {
    id: "faang-swe",
    title: "FAANG Senior SWE",
    role: "Full Stack Developer",
    company: "Google",
    template: "modern",
    color: "emerald",
    emoji: "🚀",
    tagline: "Distributed scale & cloud microservices",
    badge: "MOST POPULAR",
  },
  {
    id: "ai-engineer",
    title: "AI & ML Researcher",
    role: "AI / ML Engineer",
    company: "Meta",
    template: "academic",
    color: "indigo",
    emoji: "🧠",
    tagline: "Citations, PyTorch models & LLM pipelines",
    badge: "RESEARCH LAB",
  },
  {
    id: "apple-designer",
    title: "Design Systems Lead",
    role: "Product Designer",
    company: "Apple",
    template: "apple",
    color: "cyan",
    emoji: "🎨",
    tagline: "Cupertino minimalism & micro-interactions",
    badge: "DESIGN BAR",
  },
  {
    id: "startup-founder",
    title: "Founding Engineer",
    role: "Full Stack Developer",
    company: "High-Growth Startup",
    template: "minimal",
    color: "amber",
    emoji: "⚡",
    tagline: "Zero-to-one velocity & full-stack ownership",
    badge: "HIGH VELOCITY",
  },
];

const COMPANY_INSIGHTS = {
  Google: {
    tip: "Calibrating for Google's engineering bar: algorithmic complexity, distributed scale & clean architecture.",
    tag: "High Concurrency",
    atsBoost: "96% ATS Match",
  },
  Microsoft: {
    tip: "Calibrating for Microsoft: enterprise resilience, cloud reliability, Azure ecosystems & collaborative impact.",
    tag: "Cloud Scale",
    atsBoost: "94% ATS Match",
  },
  Amazon: {
    tip: "Calibrating for Amazon Leadership Principles: customer obsession, deep architectural ownership & deliver results.",
    tag: "Bar Raiser",
    atsBoost: "97% ATS Match",
  },
  Meta: {
    tip: "Calibrating for Meta: rapid product velocity, large-scale consumer impact & data-driven telemetry.",
    tag: "Move Fast",
    atsBoost: "95% ATS Match",
  },
  Apple: {
    tip: "Calibrating for Apple: human interface guidelines, typographic precision, and flawless pixel craft.",
    tag: "Design Polish",
    atsBoost: "98% Design Bar",
  },
  Netflix: {
    tip: "Calibrating for Netflix: high autonomy, fault-tolerant streaming systems & engineering freedom.",
    tag: "Autonomy",
    atsBoost: "94% ATS Match",
  },
  "High-Growth Startup": {
    tip: "Calibrating for Startups: zero-to-one product velocity, full-stack breadth & pragmatic execution.",
    tag: "0 to 1 Speed",
    atsBoost: "98% Founder Fit",
  },
  "Open Source": {
    tip: "Calibrating for Open Source: GitHub public contributions, documentation rigor & community stewardship.",
    tag: "OSS Impact",
    atsBoost: "96% OSS Match",
  },
};

const TEMPLATE_CATEGORIES = [
  { id: "all", label: "All Themes" },
  { id: "developer", label: "💻 Engineering & CLI" },
  { id: "creative", label: "🎨 Creative & Showcase" },
  { id: "modern", label: "✨ Modern & Minimal" },
  { id: "pro", label: "⭐ Pro & Executive" },
];

const COLOR_PRESETS = [
  { id: "indigo", name: "Indigo Tech", hex: "#6366f1", secondary: "#a855f7" },
  { id: "emerald", name: "Emerald Cyber", hex: "#10b981", secondary: "#06b6d4" },
  { id: "cyan", name: "Electric Cyan", hex: "#06b6d4", secondary: "#ec4899" },
  { id: "rose", name: "Rose Designer", hex: "#ec4899", secondary: "#be185d" },
  { id: "amber", name: "Founder Gold", hex: "#f59e0b", secondary: "#ef4444" },
  { id: "violet", name: "Deep Violet", hex: "#8b5cf6", secondary: "#3b82f6" },
  { id: "crimson", name: "Swiss Crimson", hex: "#e11d48", secondary: "#9f1239" },
  { id: "monochrome", name: "Minimal Mono", hex: "#ffffff", secondary: "#71717a" },
];

const MODULAR_SECTIONS = [
  { id: "hero", label: "Hero & Identity", desc: "Candidate identity, dynamic title, tagline & contact CTAs", required: true },
  { id: "pitch", label: "Executive Value Proposition", desc: "High-impact hook statement for recruiters & clients", required: false },
  { id: "about", label: "About Narrative", desc: "Professional background, mission, and architectural focus", required: false },
  { id: "skills", label: "Technical Arsenal", desc: "Categorized skills, frameworks, and competencies", required: false },
  { id: "projects", label: "Featured Projects", desc: "Production apps with live demo, GitHub & metrics", required: false },
  { id: "experience", label: "Career Trajectory", desc: "Companies, roles, tenure & quantified achievements", required: false },
  { id: "education", label: "Education & Credentials", desc: "Degrees, institutions, and academic honors", required: false },
  { id: "achievements", label: "Honors & Recognitions", desc: "Awards, hackathon wins, and milestones", required: false },
  { id: "blog", label: "Publications & Writing", desc: "Articles, technical blogs, and thought leadership", required: false },
  { id: "contact", label: "Direct Contact Hub", desc: "Direct email, phone, LinkedIn, and GitHub links", required: false },
];

const CUSTOM_LAYOUT_STYLES = [
  {
    id: "bento",
    name: "Bento Studio",
    desc: "Modern asymmetric modular cards with subtle ambient glow and high visual hierarchy.",
    badge: "RECOMMENDED",
    icon: "🍱",
    accent: "#6366f1",
  },
  {
    id: "minimal",
    name: "Minimal Swiss",
    desc: "Clean Swiss typography, sharp high-contrast structure, and zero fluff.",
    badge: "PRECISION",
    icon: "▫️",
    accent: "#e11d48",
  },
  {
    id: "terminal",
    name: "Cyber Terminal",
    desc: "Developer-first CLI accents with monospace syntax and prompt styling.",
    badge: "CODE-FIRST",
    icon: "💻",
    accent: "#10b981",
  },
  {
    id: "glass",
    name: "Floating Glass",
    desc: "Frosted acrylic glass with backdrop blur, translucent borders, and floating depth.",
    badge: "AESTHETIC",
    icon: "🪟",
    accent: "#8b5cf6",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk 2077",
    desc: "High-voltage neon yellow & cyan HUD interface with scanlines and telemetry badges.",
    badge: "HIGH VOLTAGE",
    icon: "⚡",
    accent: "#eab308",
  },
  {
    id: "editorial",
    name: "Modern Editorial",
    desc: "Sophisticated luxury serif typography with generous breathing room and warm accents.",
    badge: "EDITORIAL",
    icon: "📰",
    accent: "#f59e0b",
  },
  {
    id: "brutalist",
    name: "Neo-Brutalist",
    desc: "Bold high-contrast borders, solid drop shadows, and punchy saturated chips.",
    badge: "BOLD",
    icon: "🧱",
    accent: "#ffffff",
  },
  {
    id: "corporate",
    name: "Executive Slate",
    desc: "Refined navy/slate executive layout calibrated for FAANG and leadership milestones.",
    badge: "EXECUTIVE",
    icon: "🏛️",
    accent: "#3b82f6",
  },
];

const PortfolioGenerator = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef();

  const { user } = useSelector((state) => state.auth);
  const { portfolio: reduxPortfolio, missingInfo: reduxMissingInfo } =
    useSelector((state) => state.portfolioGenerator);
  const userPlan = (user?.plan || "free").toLowerCase();
  const isPro = userPlan === "pro" || userPlan === "team";

  // Mode Choice
  const [creationMode, setCreationMode] = useState("template"); // "template"
  const [step, setStep] = useState("setup"); // "setup" | "review"
  const [missingInfo, setMissingInfo] = useState([]);

  // Step 2: Selected Template & Target Context
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [customRole, setCustomRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("Google");
  const [customCompany, setCustomCompany] = useState("");
  const [selectedColor, setSelectedColor] = useState("indigo");
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [previewingTemplateId, setPreviewingTemplateId] = useState("modern");
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // New Interactive Discovery States
  const [activeArchetype, setActiveArchetype] = useState(null);
  const [templateCategory, setTemplateCategory] = useState("all");
  const [templateSearch, setTemplateSearch] = useState("");

  // Step 3: Input Source ("resume" | "form" | "github" | "linkedin")
  const [inputSource, setInputSource] = useState("resume");
  const [resumeFile, setResumeFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // GitHub Import State
  const [githubUsername, setGithubUsername] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);

  // LinkedIn Import State
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinText, setLinkedinText] = useState("");
  const [showLinkedInText, setShowLinkedInText] = useState(true);

  // Custom Architecture Studio State
  const [customOriginMode, setCustomOriginMode] = useState("inspiration"); // "inspiration" | "manual"
  const [referenceUrl, setReferenceUrl] = useState("");
  const [referenceImageFile, setReferenceImageFile] = useState(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState("");
  const [analyzingReference, setAnalyzingReference] = useState(false);
  const [extractedReferenceDesign, setExtractedReferenceDesign] = useState(null);

  const [customLayoutStyle, setCustomLayoutStyle] = useState("bento"); // "bento" | "glass" | "minimal" | "terminal" | "cyberpunk" | "editorial" | "brutalist" | "corporate"
  const [customDensity, setCustomDensity] = useState("balanced"); // "compact" | "balanced" | "spacious"
  const [customFont, setCustomFont] = useState("sans"); // "sans" | "mono" | "serif"
  const [customBorderRadius, setCustomBorderRadius] = useState("rounded"); // "sharp" | "rounded" | "pill"
  const [customCardElevation, setCustomCardElevation] = useState("glow"); // "glow" | "glass" | "minimal" | "solid"
  const [customPrimaryColor, setCustomPrimaryColor] = useState("#6366f1");
  const [customSecondaryColor, setCustomSecondaryColor] = useState("#a855f7");
  const [customBgColor, setCustomBgColor] = useState("#070709");
  const [customPitch, setCustomPitch] = useState("");
  const [customCta, setCustomCta] = useState("Schedule an Intro Call");
  const [customSections, setCustomSections] = useState([
    "hero",
    "pitch",
    "about",
    "skills",
    "projects",
    "experience",
    "education",
    "achievements",
    "blog",
    "contact",
  ]);

  const toggleCustomSection = (sectionId) => {
    if (sectionId === "hero") return; // hero is always required
    setCustomSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((s) => s !== sectionId)
        : [...prev, sectionId],
    );
  };

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    name: user?.fullName || "",
    jobTitle: "",
    bio: "",
    skills: "",
    experienceCompany: "",
    experienceRole: "",
    experienceDuration: "",
    experienceDesc: "",
    projectTitle: "",
    projectDesc: "",
    projectTags: "",
    projectLive: "",
    projectGithub: "",
    educationInstitution: "",
    educationDegree: "",
    educationYear: "",
    email: user?.email || "",
    phone: "",
    github: "",
    linkedin: "",
    avatar: user?.avatar || "",
  });

  // UI States
  const [activeTab, setActiveTab] = useState("preview"); // "preview" | "edit"
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [previewTemplateModal, setPreviewTemplateModal] = useState(null);

  // Generated & Editable Portfolio State
  const [generatedData, setGeneratedData] = useState(null);

  const [editorNewExp, setEditorNewExp] = useState({
    role: "",
    company: "",
    duration: "",
    location: "",
    workplaceType: "Virtual / Remote",
    compensation: "Paid",
    compensationAmount: "",
    description: "",
    projectTitle: "",
    projectLive: "",
    projectGithub: "",
    offerLetter: "",
    certificate: "",
  });
  const [editorNewProj, setEditorNewProj] = useState({ title: "", description: "", tags: "", github: "", live: "" });
  const [editorNewEdu, setEditorNewEdu] = useState({ institution: "", degree: "", year: "", description: "" });
  const [editorNewCert, setEditorNewCert] = useState({ name: "", issuer: "", date: "", description: "", link: "" });
  const [editorNewAch, setEditorNewAch] = useState({ title: "", metric: "", description: "", link: "" });
  const [editorNewBlog, setEditorNewBlog] = useState({ title: "", link: "", excerpt: "" });

  // Reset generator to build a brand new portfolio
  const handleStartNew = () => {
    dispatch(clearGeneratedPortfolio());
    setGeneratedData(null);
    setResumeFile(null);
    setGithubUsername("");
    setLinkedinUrl("");
    setLinkedinText("");
    setCreationMode("template");
    setStep("setup");
    toast.success("Ready to create a new portfolio! ✨");
    navigate("/portfolio-generator", { replace: true });
  };

  // Auto-load portfolio ONLY if freshly generated via Analyzer or explicit navigation
  useEffect(() => {
    const isExplicitNew = searchParams.get("mode") === "new" || searchParams.get("new") === "true";
    if (isExplicitNew) {
      dispatch(clearGeneratedPortfolio());
      setGeneratedData(null);
      setResumeFile(null);
      setGithubUsername("");
      setLinkedinUrl("");
      setLinkedinText("");
      setStep("setup");
      setCreationMode("template");
      return;
    }

    if (location.state?.fromAnalyzer && reduxPortfolio && !generatedData) {
      const port = reduxPortfolio.portfolio || reduxPortfolio;
      setGeneratedData(port);
      if (port.inputSource) {
        setInputSource(port.inputSource);
      } else if (port.linkedin || port.contact?.linkedin) {
        setInputSource("linkedin");
      } else if (port.github || port.contact?.github) {
        setInputSource("github");
      }
      setMissingInfo(reduxMissingInfo || reduxPortfolio.missingInfo || []);
      setStep("review");
    } else if (!location.state?.fromAnalyzer && !generatedData && reduxPortfolio) {
      // Clear any lingering old draft from Redux so clicking AI Studio Builder always opens a fresh creator
      dispatch(clearGeneratedPortfolio());
    }
  }, [location.state, reduxPortfolio, reduxMissingInfo, searchParams, dispatch]);

  const effectiveRole = customRole.trim() || targetRole;
  const effectiveCompany = customCompany.trim() || targetCompany;

  // Real-Time ATS Synergy Score Calculation
  const synergyScore = (() => {
    let score = 86;
    if (customRole.trim() || targetRole) score += 3;
    if (customCompany.trim() || targetCompany) score += 3;
    if (resumeFile || githubUsername.trim() || linkedinUrl.trim() || manualForm.jobTitle.trim()) score += 4;
    const currentTmpl = TEMPLATES.find((t) => t.id === selectedTemplate);
    if (
      currentTmpl?.recommendedFor?.some(
        (r) =>
          r.toLowerCase().includes(effectiveRole.toLowerCase()) ||
          effectiveRole.toLowerCase().includes(r.toLowerCase()),
      )
    ) {
      score += 3;
    }
    return Math.min(score, 99);
  })();

  const currentTemplateObj = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];
  const companyInsight = COMPANY_INSIGHTS[effectiveCompany] || {
    tip: `Calibrating for ${effectiveCompany}: highlighting role alignment, measurable technical achievements, and clear project impact.`,
    tag: "High Caliber",
    atsBoost: "95% Target Fit",
  };

  // Filtered Templates based on search and category
  const filteredTemplates = TEMPLATES.filter((tmpl) => {
    const q = templateSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      tmpl.name.toLowerCase().includes(q) ||
      tmpl.category.toLowerCase().includes(q) ||
      tmpl.description.toLowerCase().includes(q) ||
      (tmpl.recommendedFor || []).some((r) => r.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (templateCategory === "all") return true;
    if (templateCategory === "pro") return tmpl.plan === "pro";
    if (templateCategory === "developer")
      return (
        tmpl.category === "Developer" ||
        tmpl.id === "minimal" ||
        tmpl.id === "developer"
      );
    if (templateCategory === "creative")
      return (
        tmpl.category === "Creative" ||
        tmpl.id === "designer" ||
        tmpl.id === "creative" ||
        tmpl.id === "apple"
      );
    if (templateCategory === "modern")
      return (
        tmpl.category === "Modernist" ||
        tmpl.category === "Modern" ||
        tmpl.category === "Minimalist"
      );
    return true;
  });

  // Archetype 1-Click Fast-Start
  const handleApplyArchetype = (arc) => {
    setActiveArchetype(arc.id);
    setTargetRole(arc.role);
    setCustomRole("");
    setTargetCompany(arc.company);
    setCustomCompany("");
    setSelectedColor(arc.color);
    if (arc.template === "apple" && !isPro) {
      setSelectedTemplate("minimal");
    } else {
      setSelectedTemplate(arc.template);
    }
    toast.success(`Applied "${arc.title}" blueprint! ⚡`, {
      icon: arc.emoji,
    });
  };

  // Demo Data Loaders for instant testing
  const handleLoadDemoResume = () => {
    const content = `Alex Morgan - Senior Full Stack Engineer
alex.morgan@devmail.io | github.com/alexmorgan | San Francisco, CA

SUMMARY
Senior Software Engineer with 6+ years building and scaling fault-tolerant web applications and distributed cloud systems. Specialized in React, TypeScript, Node.js, and AWS.

EXPERIENCE
Staff Engineer @ CloudScale Technologies (2022 - Present)
- Architected distributed microservices gateway handling 45M+ daily requests with 99.99% uptime.
- Reduced p99 latency from 320ms to 42ms via Redis caching and optimized database indexing.
- Mentored 8 engineers and introduced zero-downtime canary deployment pipelines.

Full Stack Engineer @ Nexus Labs (2019 - 2022)
- Built interactive dashboard visualizations serving 120k+ active enterprise users with React and TailwindCSS.
- Designed real-time event streaming pipeline processing 10k events/sec with Kafka and Go.

EDUCATION
B.S. in Computer Science - University of California, Berkeley (2019)

SKILLS
TypeScript, React, Next.js, Node.js, Express, Go, Python, PostgreSQL, Redis, Docker, Kubernetes, AWS, GraphQL, Git`;

    const blob = new Blob([content], { type: "application/pdf" });
    const file = new File([blob], "Alex_Morgan_Senior_FullStack_Resume.pdf", {
      type: "application/pdf",
    });
    setResumeFile(file);
    toast.success("Loaded demo resume: Alex_Morgan_Senior_FullStack_Resume.pdf! 📄");
  };

  const handleAutoFillForm = () => {
    setManualForm({
      name: "Alex Morgan",
      jobTitle: "Senior Full Stack Engineer",
      bio: "Engineering leader focused on scalable distributed systems, high-concurrency cloud architectures, and delightful interactive user experiences. 6+ years shipping production software.",
      skills: "React, TypeScript, Node.js, Python, PostgreSQL, Redis, Docker, Kubernetes, AWS, GraphQL, TailwindCSS",
      experienceCompany: "CloudScale Technologies",
      experienceRole: "Staff Software Engineer",
      experienceDuration: "2022 - Present",
      experienceDesc: "Architected distributed edge microservices processing 45M+ daily requests. Reduced p99 latency by 86% and led infrastructure modernization across 14 services.",
      projectTitle: "OmniFlow Distributed Pipeline",
      projectDesc: "High-throughput asynchronous telemetry processor and real-time analytics streaming engine built with Node.js, Redis, and React.",
      projectTags: "TypeScript, Node.js, Redis, React, WebSockets",
      projectLive: "https://omniflow-demo.dev",
      projectGithub: "https://github.com/alexmorgan/omniflow",
      educationInstitution: "UC Berkeley",
      educationDegree: "B.S. Computer Science",
      educationYear: "2019",
      email: "alex.morgan@devmail.io",
      phone: "+1 (555) 234-5678",
      github: "https://github.com/alexmorgan",
      linkedin: "https://linkedin.com/in/alexmorgan-dev",
    });
    toast.success("Auto-filled structured form with realistic Senior Engineer data! ✨");
  };

  const handleLoadSampleLinkedInUrl = (sample = "alexmorgan-dev") => {
    if (sample === "satyanadella") {
      setLinkedinUrl("https://linkedin.com/in/satyanadella");
      setLinkedinText(
        `Satya Nadella\nChairman & CEO at Microsoft\n\nExperience\nMicrosoft — Chairman and Chief Executive Officer (2014 - Present)\nLeading AI-first transformation and global hyperscale Azure infrastructure.\nMicrosoft — Executive Vice President, Cloud & Enterprise (2011 - 2014)\n\nEducation\nUniversity of Chicago Booth School of Business — Master of Business Administration (MBA) (1997)\nUniversity of Wisconsin–Milwaukee — Master of Science (M.S.) in Computer Science (1990)\nManipal Institute of Technology — Bachelor of Engineering (B.E.) in Electrical Engineering (1988)\n\nLicenses & Certifications\nExecutive Leadership & Board Governance — Microsoft Executive Council (2014)\nCorporate Technology Leadership Fellow — IEEE Computer Society (2018)\n\nSkills\nCloud Infrastructure, Enterprise Software, Artificial Intelligence, Distributed Systems, Strategic Leadership, Platform Engineering`
      );
      setShowLinkedInText(true);
      toast.success("Loaded verified profile for Satya Nadella (Microsoft)! 💼");
    } else {
      setLinkedinUrl("https://linkedin.com/in/alexmorgan-dev");
      setLinkedinText(
        `Alex Morgan\nSenior Full Stack & AI Systems Engineer\n\nExperience\nTechFlow Systems — Senior Full Stack Engineer (2022 - Present)\nArchitected low-latency GraphQL API gateway and AWS EKS microservices.\nNexus Labs — Full Stack Software Developer (2020 - 2022)\nBuilt high-performance React dashboards and automated CI/CD.\n\nEducation\nUniversity of California, Berkeley — Bachelor of Science (B.S.) in Computer Science (2020)\nMagna Cum Laude. Focus on Distributed Systems and Cloud Architecture.\n\nLicenses & Certifications\nAWS Certified Solutions Architect – Associate — Amazon Web Services (AWS) (2023)\nMeta Certified Front-End Developer Specialization — Meta / Coursera (2022)\n\nSkills\nTypeScript, React, Next.js, Node.js, Python, PostgreSQL, Redis, Docker, Kubernetes, AWS, GraphQL, Tailwind CSS`
      );
      setShowLinkedInText(true);
      toast.success("Loaded sample profile & credentials for Alex Morgan! 💼");
    }
  };

  // AI Recommendation Engine
  const handleAIRecommendTemplate = () => {
    const roleLower = effectiveRole.toLowerCase();
    let recommended = "modern";

    if (roleLower.includes("designer") || roleLower.includes("creative")) {
      recommended = isPro ? "designer" : "modern";
    } else if (roleLower.includes("devops") || roleLower.includes("backend")) {
      recommended = "developer";
    } else if (roleLower.includes("founder") || roleLower.includes("lead")) {
      recommended = isPro ? "startup" : "corporate";
    } else if (roleLower.includes("research") || roleLower.includes("data")) {
      recommended = isPro ? "academic" : "minimal";
    } else if (roleLower.includes("mobile") || roleLower.includes("ios") || roleLower.includes("product")) {
      recommended = isPro ? "apple" : "minimal";
    } else if (roleLower.includes("ai") || roleLower.includes("cloud")) {
      recommended = isPro ? "google" : "modern";
    }

    setSelectedTemplate(recommended);
    toast.success(`AI recommends the ${recommended.toUpperCase()} template for ${effectiveRole}! ✨`);
  };

  // Resume File Handlers
  const validateAndSetResume = (file) => {
    if (!file) return;
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast.error("Please select a PDF document (.pdf)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("PDF size exceeds 10MB limit");
      return;
    }
    setResumeFile(file);
    toast.success(`Resume selected: ${file.name} (${(file.size / 1024).toFixed(0)} KB) 📄`);
  };

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetResume(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetResume(file);
    }
  };

  const handleRemoveResume = (e) => {
    e.stopPropagation();
    setResumeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast("Resume removed", { icon: "🗑️" });
  };

  // GitHub Auto-Fetch
  const handleFetchGitHub = async () => {
    const rawInput = githubUsername.trim() || manualForm.github.trim();
    const cleanUser = extractGitHubUsername(rawInput);
    if (!cleanUser) {
      return toast.error("Please enter a valid GitHub username or profile URL");
    }
    setGithubLoading(true);
    toast.loading(`Fetching public repositories & profile for @${cleanUser}...`, { id: "gh" });

    try {
      const res = await fetchGitHubProfile(cleanUser);
      toast.dismiss("gh");
      if (res.data?.success && res.data.importedData) {
        toast.success(`GitHub profile & repositories for @${cleanUser} imported! ✨`);
        const imported = res.data.importedData;
        if (res.data.missingInfo) {
          setMissingInfo(res.data.missingInfo);
        }
        const avatarUrl =
          imported.avatar ||
          imported.hero?.avatar ||
          `https://github.com/${cleanUser}.png`;

        const importedName = imported.hero?.name || imported.name || cleanUser;

        const isUser = Boolean(
          user?.githubUsername &&
          user.githubUsername.toLowerCase().trim() === cleanUser.toLowerCase()
        );

        setManualForm((prev) => ({
          ...prev,
          name: importedName,
          jobTitle: imported.hero?.title || prev.jobTitle || "Full Stack Developer",
          bio: imported.hero?.tagline || imported.about || prev.bio,
          skills: (imported.skills || []).join(", "),
          github: imported.contact?.github || `https://github.com/${cleanUser}`,
          avatar: avatarUrl,
          email: isUser ? (user?.email || "") : (imported.contact?.email || ""),
          projectTitle: imported.projects?.[0]?.title || prev.projectTitle,
          projectDesc: imported.projects?.[0]?.description || prev.projectDesc,
          projectTags: (imported.projects?.[0]?.tags || []).join(", "),
          projectGithub: imported.projects?.[0]?.github || prev.projectGithub,
          projectLive: imported.projects?.[0]?.live || prev.projectLive,
          allProjects: imported.projects || [],
        }));
        setGithubUsername(cleanUser);
        // Switch to manual form review tab so user sees fetched data
        setInputSource("form");
      }
    } catch (err) {
      toast.dismiss("gh");
      toast.error(err.response?.data?.message || `Could not fetch GitHub user @${cleanUser}`);
    } finally {
      setGithubLoading(false);
    }
  };


  // Reference Image Upload & Client-side Palette Extraction
  const handleReferenceImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return toast.error("Please upload an image file (PNG, JPG, WEBP)");
    }
    if (file.size > 10 * 1024 * 1024) {
      return toast.error("Image file must be under 10MB");
    }

    setReferenceImageFile(file);
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target.result;
      setReferenceImagePreview(dataUrl);

      // Instant client-side color extraction using offscreen canvas
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = 64;
          canvas.height = 64;
          ctx.drawImage(img, 0, 0, 64, 64);
          const imageData = ctx.getImageData(0, 0, 64, 64).data;

          let maxColor = "#6366f1";
          let maxScore = -1;

          for (let i = 0; i < imageData.length; i += 16) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            const saturation = Math.max(r, g, b) - Math.min(r, g, b);
            if (brightness > 40 && brightness < 225 && saturation > 35) {
              const score = saturation * 1.5 + (brightness > 80 && brightness < 180 ? 40 : 0);
              if (score > maxScore) {
                maxScore = score;
                maxColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
              }
            }
          }
          if (maxScore > 0) {
            setCustomPrimaryColor(maxColor);
          }
        } catch (err) {
          console.warn("Canvas color extraction:", err);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    toast.success(`Reference image uploaded: ${file.name} 🎨`);
  };

  const handleRemoveReferenceImage = (e) => {
    if (e) e.stopPropagation();
    setReferenceImageFile(null);
    setReferenceImagePreview("");
    toast("Reference image removed", { icon: "🗑️" });
  };

  const handleAnalyzeReference = async () => {
    if (!referenceUrl.trim() && !referenceImageFile && !referenceImagePreview) {
      return toast.error("Please enter a portfolio URL or upload a reference picture first");
    }

    setAnalyzingReference(true);
    toast.loading("Analyzing design DNA, palette, and theme...", { id: "ref-analyze" });

    try {
      let payload;
      if (referenceImageFile) {
        payload = new FormData();
        payload.append("referenceImage", referenceImageFile);
        if (referenceUrl.trim()) payload.append("url", referenceUrl.trim());
      } else if (referenceImagePreview) {
        payload = { imageBase64: referenceImagePreview, url: referenceUrl.trim() };
      } else {
        payload = { url: referenceUrl.trim() };
      }

      const res = await analyzePortfolioReference(payload);
      toast.dismiss("ref-analyze");

      if (res.data?.success && res.data.design) {
        const d = res.data.design;
        setExtractedReferenceDesign(d);
        if (d.theme) setCustomLayoutStyle(d.theme);
        if (d.primaryColor) setCustomPrimaryColor(d.primaryColor);
        if (d.secondaryColor) setCustomSecondaryColor(d.secondaryColor);
        if (d.backgroundColor) setCustomBgColor(d.backgroundColor);
        if (d.fontChoice) setCustomFont(d.fontChoice);
        if (d.density) setCustomDensity(d.density);
        if (d.borderRadius) setCustomBorderRadius(d.borderRadius);
        if (d.cardElevation) setCustomCardElevation(d.cardElevation);

        toast.success(`✨ Design DNA extracted: ${d.theme.toUpperCase()} theme & ${d.primaryColor} palette!`);
      } else {
        throw new Error(res.data?.message || "Could not analyze reference");
      }
    } catch (err) {
      toast.dismiss("ref-analyze");
      toast.error(err.response?.data?.message || "Using client-calibrated design extraction");
      setExtractedReferenceDesign({
        theme: customLayoutStyle,
        primaryColor: customPrimaryColor,
        secondaryColor: customSecondaryColor,
        backgroundColor: customBgColor,
        fontChoice: customFont,
        density: customDensity,
        borderRadius: customBorderRadius,
        summary: "Calibrated custom design parameters based on uploaded asset.",
      });
    } finally {
      setAnalyzingReference(false);
    }
  };

  // Execute Portfolio Generation
  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setGenerating(true);
    toast.loading("AI is generating your tailored portfolio...", { id: "gen" });

    try {
      let resultData = null;

      const customDesignConfig =
        creationMode === "custom"
          ? {
              originMode: customOriginMode,
              referenceUrl: customOriginMode === "inspiration" ? referenceUrl : "",
              referenceImage: customOriginMode === "inspiration" ? referenceImagePreview : "",
              theme: customLayoutStyle,
              primaryColor: customPrimaryColor,
              secondaryColor: customSecondaryColor,
              backgroundColor: customBgColor,
              fontChoice: customFont,
              density: customDensity,
              borderRadius: customBorderRadius,
              cardElevation: customCardElevation,
              customPitch,
              customCta,
            }
          : undefined;

      const customLayoutConfig =
        creationMode === "custom"
          ? {
              layoutStyle: customLayoutStyle,
              density: customDensity,
              font: customFont,
              activeSections: customSections,
              customPitch,
              customCta,
              primaryColor: customPrimaryColor,
              secondaryColor: customSecondaryColor,
              backgroundColor: customBgColor,
              borderRadius: customBorderRadius,
            }
          : undefined;

      if (inputSource === "resume") {
        const file = resumeFile || fileInputRef.current?.files?.[0];
        if (!file) {
          toast.dismiss("gen");
          setGenerating(false);
          return toast.error("Please select a PDF resume first");
        }

        const formData = new FormData();
        formData.append("resume", file);
        if (customRole.trim()) {
          formData.append("targetRole", customRole.trim());
        }
        if (customCompany.trim()) {
          formData.append("targetCompany", customCompany.trim());
        }
        formData.append("template", selectedTemplate);
        formData.append(
          "preferences",
          JSON.stringify({
            template: selectedTemplate,
            colorScheme: selectedColor,
            primaryColor: customPrimaryColor,
            style: creationMode,
            customDesign: customDesignConfig,
            customLayout: customLayoutConfig,
          }),
        );

        const res = await dispatch(generatePortfolio(formData));
        if (generatePortfolio.fulfilled.match(res)) {
          const raw = res.payload?.portfolio || res.payload || {};
          resultData = {
            ...raw,
            inputSource: "resume",
            template: raw.template || selectedTemplate,
          };
          setMissingInfo(res.payload?.missingInfo || []);
          dispatch(setGeneratedPortfolio(resultData));
        } else {
          throw new Error(res.payload || "Generation failed");
        }
      } else {
        // From Form, GitHub, LinkedIn, or URL
        let rawPayload = {};
        if (inputSource === "linkedin") {
          if (!linkedinUrl.trim()) {
            toast.dismiss("gen");
            setGenerating(false);
            return toast.error("Please enter your LinkedIn profile URL");
          }
          let formattedUrl = linkedinUrl.trim();
          if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
            formattedUrl = `https://${formattedUrl}`;
          }
          const slugMatch = formattedUrl.match(/linkedin\.com\/in\/([a-zA-Z0-9_%-]+)/i);
          const rawSlug = slugMatch ? slugMatch[1].toLowerCase().replace(/[^a-z0-9_%-]/g, "") : "";
          const slugName = rawSlug
            .replace(/-[0-9a-f]{6,}$/i, "")
            .replace(/-[0-9]+$/i, "")
            .replace(/-\b[0-9a-z]{7,}\b$/i, "")
            .replace(/[0-9]+$/g, "")
            .replace(/[-_.]+/g, " ")
            .trim();
          const isUser = Boolean(
            slugName &&
            user?.fullName &&
            slugName.toLowerCase() === user.fullName.trim().toLowerCase()
          );

          rawPayload = {
            linkedinUrl: formattedUrl,
            linkedin: formattedUrl,
            linkedinText: linkedinText.trim(),
            targetRole: effectiveRole,
            targetCompany: effectiveCompany,
            avatar: isUser ? (manualForm.avatar || user?.avatar || "") : "",
            github: isUser ? (manualForm.github || user?.github || "") : "",
            email: isUser ? (manualForm.email || user?.email || "") : "",
          };
        } else if (inputSource === "github") {
          const rawGh = githubUsername.trim() || manualForm.github.trim();
          const cleanGh = extractGitHubUsername(rawGh);

          if (!cleanGh) {
            toast.dismiss("gen");
            setGenerating(false);
            return toast.error("Please enter a valid GitHub username or URL");
          }

          toast.loading(`Importing GitHub profile & projects for @${cleanGh}...`, { id: "gen" });
          let ghData = null;
          try {
            const ghRes = await fetchGitHubProfile(cleanGh);
            if (ghRes.data?.success && ghRes.data.importedData) {
              ghData = ghRes.data.importedData;
            }
          } catch (ghErr) {
            console.warn("Direct client GitHub fetch failed, server will fetch:", ghErr.message);
          }

          const isUser = Boolean(
            user?.githubUsername &&
            user.githubUsername.toLowerCase().trim() === cleanGh.toLowerCase()
          );

          const ghName = ghData?.hero?.name || ghData?.name || cleanGh;
          const ghAvatar = ghData?.hero?.avatar || ghData?.avatar || `https://github.com/${cleanGh}.png`;
          const ghSkills = ghData?.skills || [];
          const ghProjects = ghData?.projects || [];

          rawPayload = {
            githubUsername: cleanGh,
            github: `https://github.com/${cleanGh}`,
            name: ghName,
            candidateName: ghName,
            jobTitle: ghData?.hero?.title || effectiveRole,
            bio: ghData?.hero?.tagline || ghData?.about || "",
            avatar: ghAvatar,
            projects: ghProjects,
            skills: ghSkills,
            email: isUser ? (user?.email || "") : (ghData?.contact?.email || ""),
            targetRole: effectiveRole,
            targetCompany: effectiveCompany,
            isUserTheCandidate: isUser,
          };
        } else {
          const ghInput = manualForm.github || "";
          const cleanFormGh = extractGitHubUsername(ghInput);
          const isDifferentGhUser = Boolean(
            cleanFormGh &&
            (!user?.githubUsername || user.githubUsername.toLowerCase().trim() !== cleanFormGh.toLowerCase())
          );

          let effectiveFormName = manualForm.name;
          let effectiveFormProjects = manualForm.allProjects?.length ? manualForm.allProjects : undefined;
          let effectiveFormSkills = manualForm.skills;
          let effectiveFormAvatar = manualForm.avatar;
          let isCandidateUser = !isDifferentGhUser;

          if (isDifferentGhUser && (!effectiveFormProjects || effectiveFormProjects.length <= 1)) {
            try {
              const ghRes = await fetchGitHubProfile(cleanFormGh);
              if (ghRes.data?.success && ghRes.data.importedData) {
                const imported = ghRes.data.importedData;
                if (!effectiveFormName || (user?.fullName && effectiveFormName.trim().toLowerCase() === user.fullName.trim().toLowerCase())) {
                  effectiveFormName = imported.hero?.name || imported.name || cleanFormGh;
                }
                effectiveFormProjects = imported.projects;
                if (!effectiveFormSkills) {
                  effectiveFormSkills = (imported.skills || []).join(", ");
                }
                effectiveFormAvatar = imported.hero?.avatar || `https://github.com/${cleanFormGh}.png`;
              }
            } catch (e) {
              console.warn("Could not auto-fetch external form GitHub profile:", e.message);
            }
          }

          rawPayload = {
            ...manualForm,
            name: effectiveFormName,
            candidateName: effectiveFormName,
            github: cleanFormGh ? `https://github.com/${cleanFormGh}` : manualForm.github,
            githubUsername: cleanFormGh,
            avatar: effectiveFormAvatar || (cleanFormGh ? `https://github.com/${cleanFormGh}.png` : (isCandidateUser ? user?.avatar : "")),
            projects: effectiveFormProjects,
            skills: effectiveFormSkills,
            email: isCandidateUser ? manualForm.email : "",
            isUserTheCandidate: isCandidateUser,
            targetRole: effectiveRole,
            targetCompany: effectiveCompany,
          };
        }

        const res = await generateFromData({
          rawData: rawPayload,
          targetRole: effectiveRole,
          targetCompany: effectiveCompany,
          template: selectedTemplate,
          inputSource,
          preferences: {
            template: selectedTemplate,
            colorScheme: selectedColor,
            primaryColor: customPrimaryColor,
            style: creationMode,
            customDesign: customDesignConfig,
            customLayout: customLayoutConfig,
          },
        });

        if (res.data?.success && res.data.portfolio) {
          const raw = res.data.portfolio;
          resultData = {
            ...raw,
            inputSource: inputSource,
            template: raw.template || selectedTemplate,
          };
          if (creationMode === "custom") {
            resultData.template = "custom";
            resultData.preferences = {
              ...(resultData.preferences || {}),
              colorScheme: selectedColor,
              primaryColor: customPrimaryColor,
              style: "custom",
              customDesign: customDesignConfig,
              customLayout: customLayoutConfig,
            };
          }
          setMissingInfo(res.data.missingInfo || []);
          dispatch(setGeneratedPortfolio(resultData));
        } else {
          throw new Error("Failed to generate portfolio from provided data");
        }
      }

      if (creationMode === "custom" && resultData) {
        resultData = {
          ...resultData,
          template: "custom",
          preferences: {
            ...(resultData.preferences || {}),
            colorScheme: selectedColor,
            primaryColor: customPrimaryColor,
            style: "custom",
            customDesign: customDesignConfig,
            customLayout: customLayoutConfig,
          },
        };
      }

      toast.dismiss("gen");
      toast.success("Portfolio generated successfully! ✨");
      setGeneratedData(resultData);
      if (resultData?.hero?.title) {
        setTargetRole(resultData.hero.title);
        setCustomRole(resultData.hero.title);
      }
      setStep("review");
    } catch (err) {
      toast.dismiss("gen");
      toast.error(err.message || "Portfolio generation encountered an issue");
    } finally {
      setGenerating(false);
    }
  };

  // Field edit handler in review screen
  const handleFieldChange = (field, value) => {
    const updated = { ...generatedData, [field]: value };
    setGeneratedData(updated);
    dispatch(setGeneratedPortfolio(updated));
  };

  const handleHeroChange = (field, value) => {
    const updatedHero = { ...(generatedData?.hero || {}), [field]: value };
    const updated = { ...generatedData, hero: updatedHero };
    setGeneratedData(updated);
    dispatch(setGeneratedPortfolio(updated));
  };

  const handleContactChange = (field, value) => {
    const updatedContact = { ...(generatedData?.contact || {}), [field]: value };
    const updated = {
      ...generatedData,
      [field]: value,
      contact: updatedContact,
    };
    setGeneratedData(updated);
    dispatch(setGeneratedPortfolio(updated));
  };

  const handleSeoChange = (field, value) => {
    const updatedSeo = { ...(generatedData?.seo || {}), [field]: value };
    const updated = { ...generatedData, seo: updatedSeo };
    setGeneratedData(updated);
    dispatch(setGeneratedPortfolio(updated));
  };

  // Section item handlers for Live Field Editor
  const handleAddExperienceItem = (e) => {
    e?.preventDefault();
    if (!editorNewExp.role.trim() && !editorNewExp.company.trim()) {
      return toast.error("Please enter a role or company name");
    }
    const newEntry = {
      role: editorNewExp.role.trim() || "Software Engineer",
      company: editorNewExp.company.trim() || "Company",
      duration: editorNewExp.duration.trim() || "2023 - Present",
      location: editorNewExp.location?.trim() || "",
      workplaceType: editorNewExp.workplaceType || "Virtual / Remote",
      compensation: editorNewExp.compensation || "Paid",
      compensationAmount: (editorNewExp.compensation !== "Unpaid" && editorNewExp.compensationAmount?.trim()) ? editorNewExp.compensationAmount.trim() : "",
      description: editorNewExp.description.trim() || "",
      highlights: editorNewExp.description.trim() ? [editorNewExp.description.trim()] : [],
      projectTitle: editorNewExp.projectTitle?.trim() || "",
      projectLive: editorNewExp.projectLive?.trim() || "",
      projectGithub: editorNewExp.projectGithub?.trim() || "",
      offerLetter: editorNewExp.offerLetter?.trim() || "",
      certificate: editorNewExp.certificate?.trim() || "",
    };
    const currentExp = Array.isArray(generatedData?.experience) ? generatedData.experience : [];
    const updated = { ...generatedData, experience: [...currentExp, newEntry] };
    setGeneratedData(updated);
    dispatch(setGeneratedPortfolio(updated));
    setEditorNewExp({
      role: "",
      company: "",
      duration: "",
      location: "",
      workplaceType: "Virtual / Remote",
      compensation: "Paid",
      compensationAmount: "",
      description: "",
      projectTitle: "",
      projectLive: "",
      projectGithub: "",
      offerLetter: "",
      certificate: "",
    });
    setMissingInfo((prev) => prev.filter((item) => item.section !== "Experience"));
    toast.success("Experience added! 💼");
  };

  const handleRemoveExperienceItem = (idx) => {
    const currentExp = Array.isArray(generatedData?.experience) ? generatedData.experience : [];
    const updated = {
      ...generatedData,
      experience: currentExp.filter((_, i) => i !== idx),
    };
    setGeneratedData(updated);
    dispatch(setGeneratedPortfolio(updated));
    toast.success("Experience removed");
  };

  const handleAddProjectItem = (e) => {
    e?.preventDefault();
    if (!editorNewProj.title.trim()) {
      return toast.error("Please enter a project title");
    }
    const tags = editorNewProj.tags
      ? editorNewProj.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : ["React", "JavaScript"];
    const newEntry = {
      title: editorNewProj.title.trim(),
      description: editorNewProj.description.trim() || "Full-stack software application.",
      tags,
      github: editorNewProj.github.trim() || "",
      live: editorNewProj.live.trim() || "",
    };
    const currentProj = Array.isArray(generatedData?.projects) ? generatedData.projects : [];
    const updated = { ...generatedData, projects: [...currentProj, newEntry] };
    setGeneratedData(updated);
    dispatch(setGeneratedPortfolio(updated));
    setEditorNewProj({ title: "", description: "", tags: "", github: "", live: "" });
    setMissingInfo((prev) => prev.filter((item) => item.section !== "Projects"));
    toast.success("Project added! 🚀");
  };

  const handleRemoveProjectItem = (idx) => {
    const currentProj = Array.isArray(generatedData?.projects) ? generatedData.projects : [];
    const updated = {
      ...generatedData,
      projects: currentProj.filter((_, i) => i !== idx),
    };
    setGeneratedData(updated);
    dispatch(setGeneratedPortfolio(updated));
    toast.success("Project removed");
  };

  const handleAddEducationItem = (e) => {
    e?.preventDefault();
    if (!editorNewEdu.degree.trim() && !editorNewEdu.institution.trim()) {
      return toast.error("Please enter an institution or degree");
    }
    const newEntry = {
      degree: editorNewEdu.degree.trim() || "Bachelor of Science",
      institution: editorNewEdu.institution.trim() || "University",
      year: editorNewEdu.year.trim() || "2024",
      description: editorNewEdu.description.trim() || "",
    };
    const currentEdu = Array.isArray(generatedData?.education) ? generatedData.education : [];
    const updated = { ...generatedData, education: [...currentEdu, newEntry] };
    setGeneratedData(updated);
    dispatch(setGeneratedPortfolio(updated));
    setEditorNewEdu({ institution: "", degree: "", year: "", description: "" });
    setMissingInfo((prev) => prev.filter((item) => item.section !== "Education"));
    toast.success("Education credential added! 🎓");
  };

  const handleRemoveEducationItem = (idx) => {
    const currentEdu = Array.isArray(generatedData?.education) ? generatedData.education : [];
    const updated = {
      ...generatedData,
      education: currentEdu.filter((_, i) => i !== idx),
    };
    setGeneratedData(updated);
    dispatch(setGeneratedPortfolio(updated));
    toast.success("Education credential removed");
  };

  const handleAddCertItem = (e) => {
    e?.preventDefault();
    if (!editorNewCert.name.trim()) {
      return toast.error("Please enter a certification name");
    }
    const certLink = editorNewCert.link?.trim() || editorNewCert.url?.trim() || "";
    const newEntry = {
      name: editorNewCert.name.trim(),
      issuer: editorNewCert.issuer.trim() || "Authority",
      date: editorNewCert.date.trim() || new Date().getFullYear().toString(),
      description: editorNewCert.description?.trim() || "",
      link: certLink,
      url: certLink,
    };
    const currentCerts = Array.isArray(generatedData?.certifications) ? generatedData.certifications : [];
    const updated = { ...generatedData, certifications: [...currentCerts, newEntry] };
    setGeneratedData(updated);
    dispatch(setGeneratedPortfolio(updated));
    setEditorNewCert({ name: "", issuer: "", date: "", description: "", link: "" });
    setMissingInfo((prev) => prev.filter((item) => item.section !== "Certifications"));
    toast.success("Certification added! 📜");
  };

  const handleRemoveCertItem = (idx) => {
    const currentCerts = Array.isArray(generatedData?.certifications) ? generatedData.certifications : [];
    const updated = {
      ...generatedData,
      certifications: currentCerts.filter((_, i) => i !== idx),
    };
    setGeneratedData(updated);
    dispatch(setGeneratedPortfolio(updated));
    toast.success("Certification removed");
  };

  const handleAddAchItem = (e) => {
    e?.preventDefault();
    if (!editorNewAch.title.trim()) {
      return toast.error("Please enter an achievement title");
    }
    const achLink = editorNewAch.link?.trim() || editorNewAch.url?.trim() || "";
    const newEntry = {
      title: editorNewAch.title.trim(),
      metric: editorNewAch.metric.trim() || "",
      description: editorNewAch.description.trim() || "",
      link: achLink,
      url: achLink,
      date: new Date().getFullYear().toString(),
    };
    const currentAch = Array.isArray(generatedData?.achievements) ? generatedData.achievements : [];
    const updated = { ...generatedData, achievements: [...currentAch, newEntry] };
    setGeneratedData(updated);
    dispatch(setGeneratedPortfolio(updated));
    setEditorNewAch({ title: "", metric: "", description: "", link: "" });
    setMissingInfo((prev) => prev.filter((item) => item.section !== "Achievements"));
    toast.success("Achievement added! 🏆");
  };

  const handleRemoveAchItem = (idx) => {
    const currentAch = Array.isArray(generatedData?.achievements) ? generatedData.achievements : [];
    const updated = {
      ...generatedData,
      achievements: currentAch.filter((_, i) => i !== idx),
    };
    setGeneratedData(updated);
    dispatch(setGeneratedPortfolio(updated));
    toast.success("Achievement removed");
  };

  const handleAddBlogItem = (e) => {
    e?.preventDefault();
    if (!editorNewBlog.title.trim()) {
      return toast.error("Please enter an article title");
    }
    const newEntry = {
      title: editorNewBlog.title.trim(),
      link: editorNewBlog.link.trim() || "",
      excerpt: editorNewBlog.excerpt.trim() || "",
      summary: editorNewBlog.excerpt.trim() || "",
      readTime: "5 min read",
      date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    };
    const currentBlog = Array.isArray(generatedData?.blog) ? generatedData.blog : [];
    const updated = { ...generatedData, blog: [...currentBlog, newEntry] };
    setGeneratedData(updated);
    dispatch(setGeneratedPortfolio(updated));
    setEditorNewBlog({ title: "", link: "", excerpt: "" });
    setMissingInfo((prev) => prev.filter((item) => item.section !== "Blog"));
    toast.success("Publication added! 📝");
  };

  const handleRemoveBlogItem = (idx) => {
    const currentBlog = Array.isArray(generatedData?.blog) ? generatedData.blog : [];
    const updated = {
      ...generatedData,
      blog: currentBlog.filter((_, i) => i !== idx),
    };
    setGeneratedData(updated);
    dispatch(setGeneratedPortfolio(updated));
    toast.success("Publication removed");
  };

  // Save Portfolio to Library
  const handleSavePortfolio = async () => {
    if (!generatedData) return;
    setSaving(true);

    const heroName = generatedData.hero?.name || "Developer";
    const heroTagline = generatedData.hero?.tagline || generatedData.hero?.title || "";

    // Accurately determine the inputSource:
    let resolvedInputSource = "form";
    if (inputSource === "form" || generatedData.inputSource === "form") {
      resolvedInputSource = "form";
    } else if (inputSource === "github" || generatedData.inputSource === "github") {
      resolvedInputSource = "github";
    } else if (inputSource === "linkedin" || generatedData.inputSource === "linkedin") {
      resolvedInputSource = "linkedin";
    } else if (inputSource === "resume" || generatedData.inputSource === "resume") {
      resolvedInputSource = "resume";
    } else if (generatedData.inputSource) {
      resolvedInputSource = generatedData.inputSource;
    } else if (resumeFile) {
      resolvedInputSource = "resume";
    } else if (inputSource) {
      resolvedInputSource = inputSource;
    } else {
      resolvedInputSource = "form";
    }

    const finalRole = generatedData.hero?.title || (customRole.trim() ? customRole.trim() : effectiveRole);
    const finalCompany = generatedData.targetCompany || effectiveCompany;

    const payload = {
      title: generatedData.title || `${heroName}'s Portfolio (${finalRole})`,
      name: heroName,
      tagline: heroTagline,
      about: generatedData.about || "",
      description: generatedData.about || "",
      template: creationMode === "custom" ? "custom" : selectedTemplate,
      status: "Published",
      isPublic: true,
      creationType: creationMode || "template",
      inputSource: resolvedInputSource,
      targetRole: finalRole,
      targetCompany: finalCompany,
      preferences: {
        colorScheme: selectedColor,
        primaryColor: creationMode === "custom" ? customPrimaryColor : (COLOR_PRESETS.find((c) => c.id === selectedColor)?.hex || "#6366f1"),
        style: creationMode,
        customDesign:
          creationMode === "custom"
            ? {
                originMode: customOriginMode,
                referenceUrl: customOriginMode === "inspiration" ? referenceUrl : "",
                referenceImage: customOriginMode === "inspiration" ? referenceImagePreview : "",
                theme: customLayoutStyle,
                primaryColor: customPrimaryColor,
                secondaryColor: customSecondaryColor,
                backgroundColor: customBgColor,
                fontChoice: customFont,
                density: customDensity,
                borderRadius: customBorderRadius,
                cardElevation: customCardElevation,
                customPitch,
                customCta,
              }
            : undefined,
        customLayout:
          creationMode === "custom"
            ? {
                layoutStyle: customLayoutStyle,
                density: customDensity,
                font: customFont,
                activeSections: customSections,
                customPitch,
                customCta,
                primaryColor: customPrimaryColor,
                secondaryColor: customSecondaryColor,
                backgroundColor: customBgColor,
                borderRadius: customBorderRadius,
              }
            : undefined,
      },
      skills: generatedData.skills || [],
      projects: generatedData.projects || [],
      experience: generatedData.experience || [],
      education: generatedData.education || [],
      achievements: generatedData.achievements || [],
      certifications: generatedData.certifications || [],
      blog: generatedData.blog || [],
      seo: generatedData.seo || {},
      avatar: (() => {
        const detectedGh = extractGitHubUsername(generatedData.contact?.github || generatedData.github || "");
        const isUserCandidate = Boolean(
          resolvedInputSource !== "resume" &&
          resolvedInputSource !== "github" &&
          resolvedInputSource !== "linkedin" &&
          (!detectedGh || (user?.githubUsername && user.githubUsername.toLowerCase().trim() === detectedGh.toLowerCase())) &&
          user?.fullName &&
          heroName &&
          user.fullName.trim().toLowerCase() === heroName.trim().toLowerCase()
        );
        return (
          generatedData.avatar ||
          generatedData.hero?.avatar ||
          (detectedGh ? `https://github.com/${detectedGh}.png` : "") ||
          (isUserCandidate ? (user?.avatar || "") : "") ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(heroName)}&backgroundColor=6366f1,8b5cf6,ec4899&textColor=ffffff`
        );
      })(),
      hero: {
        ...(generatedData.hero || {}),
        title: finalRole,
        avatar: (() => {
          const detectedGh = extractGitHubUsername(generatedData.contact?.github || generatedData.github || "");
          const isUserCandidate = Boolean(
            resolvedInputSource !== "resume" &&
            resolvedInputSource !== "github" &&
            resolvedInputSource !== "linkedin" &&
            (!detectedGh || (user?.githubUsername && user.githubUsername.toLowerCase().trim() === detectedGh.toLowerCase())) &&
            user?.fullName &&
            heroName &&
            user.fullName.trim().toLowerCase() === heroName.trim().toLowerCase()
          );
          return (
            generatedData.avatar ||
            generatedData.hero?.avatar ||
            (detectedGh ? `https://github.com/${detectedGh}.png` : "") ||
            (isUserCandidate ? (user?.avatar || "") : "") ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(heroName)}&backgroundColor=6366f1,8b5cf6,ec4899&textColor=ffffff`
          );
        })(),
      },
      github: generatedData.contact?.github || generatedData.github || (extractGitHubUsername(generatedData.githubUsername) ? `https://github.com/${extractGitHubUsername(generatedData.githubUsername)}` : ""),
      linkedin: generatedData.contact?.linkedin || generatedData.linkedin || "",
      website: generatedData.contact?.website || generatedData.website || "",
      email: (() => {
        const detectedGh = extractGitHubUsername(generatedData.contact?.github || generatedData.github || "");
        const isUserCandidate = Boolean(
          resolvedInputSource !== "resume" &&
          resolvedInputSource !== "github" &&
          resolvedInputSource !== "linkedin" &&
          (!detectedGh || (user?.githubUsername && user.githubUsername.toLowerCase().trim() === detectedGh.toLowerCase())) &&
          user?.fullName &&
          heroName &&
          user.fullName.trim().toLowerCase() === heroName.trim().toLowerCase()
        );
        const candidateEmail = generatedData.contact?.email || generatedData.email || "";
        // If not the user, never let account owner's email leak into another person's portfolio
        if (!isUserCandidate && candidateEmail && user?.email && candidateEmail.toLowerCase().trim() === user.email.toLowerCase().trim()) {
          return "";
        }
        return candidateEmail || (isUserCandidate ? (user?.email || "") : "");
      })(),
      phone: generatedData.contact?.phone || generatedData.phone || "",
    };

    const result = await dispatch(createPortfolio(payload));
    setSaving(false);

    if (createPortfolio.fulfilled.match(result)) {
      dispatch(clearGeneratedPortfolio());
      setGeneratedData(null);
      setResumeFile(null);
      setGithubUsername("");
      setLinkedinUrl("");
      setLinkedinText("");
      setStep("setup");
      setCreationMode("template");
      toast.success("Portfolio saved to your personal library! 🎉");
      navigate("/portfolio");
    } else {
      toast.error(result.payload || "Failed to save portfolio.");
    }
  };

  // ==========================================
  // VIEW 1: Setup, Template Selection & Inputs (Sections 1.2 - 1.6, 8, 9)
  // ==========================================
  if (step === "setup") {
    return (
      <div className="min-h-screen bg-[#09090B] text-white p-4 sm:p-8 lg:p-10 py-10 pb-28 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Top navigation bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 font-semibold cursor-pointer shadow-sm group"
              >
                <ArrowLeft size={13} className="text-indigo-400 group-hover:-translate-x-0.5 transition-transform" />
                <span>Dashboard</span>
              </Link>
              <span className="text-zinc-600 text-xs">/</span>
              <Link
                to="/portfolio"
                className="text-xs text-zinc-400 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
              >
                Portfolio Library
              </Link>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-mono">
              <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Template Architecture</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold uppercase shadow-sm">
                Plan: {userPlan}
              </span>
            </div>
          </div>

          {/* Hero Heading */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Sparkles size={13} className="animate-spin text-amber-300" style={{ animationDuration: "6s" }} />
              <span>Step 1 // Curated Theme Selection &amp; AI Calibration</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Select &amp; Configure Your Theme
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 font-light max-w-2xl">
              Select from our 14 signature design templates, preview them in real time, and calibrate for your target company and role.
            </p>
          </div>

              {/* Real-Time AI Calibration & Recruiter Telemetry HUD */}
          <section className="rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-zinc-950 border border-indigo-500/30 p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-indigo-400">
                    Live Telemetry &amp; ATS Calibration
                  </h3>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white">
                  Target Match Barometer: <span className="text-emerald-400 font-mono">{synergyScore}% Synergy</span>
                </h4>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-mono text-zinc-400">ATS PREDICTION</p>
                  <p className="text-xs font-bold text-emerald-400">{companyInsight.atsBoost}</p>
                </div>
                <div className="w-28 bg-zinc-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-zinc-700">
                  <div
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${synergyScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Company Insight Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                  <Building2 size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-200">
                    {companyInsight.tip}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shrink-0 self-start sm:self-center">
                {companyInsight.tag}
              </span>
            </div>

            {/* Real-Time Parameter Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 space-y-1">
                <p className="text-[10px] font-mono uppercase text-zinc-400">Role Target</p>
                <p className="text-xs font-bold text-white truncate">{effectiveRole}</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 space-y-1">
                <p className="text-[10px] font-mono uppercase text-zinc-400">Company Target</p>
                <p className="text-xs font-bold text-white truncate">{effectiveCompany}</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 space-y-1">
                <p className="text-[10px] font-mono uppercase text-zinc-400">Theme Model</p>
                <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: currentTemplateObj.accent }}
                  />
                  <span>{currentTemplateObj.name}</span>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 space-y-1">
                <p className="text-[10px] font-mono uppercase text-zinc-400">Source State</p>
                <p className="text-xs font-bold text-emerald-400 truncate flex items-center gap-1">
                  <Check size={12} />
                  <span className="capitalize">{inputSource}</span>
                </p>
              </div>
            </div>
          </section>

          {/* Career & Role Context (Sections 1.6 & 9) */}
          <section className="rounded-3xl bg-zinc-900/60 border border-zinc-800 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap size={16} className="text-amber-400" />
                  <span>Career &amp; Role Context</span>
                </h2>
                <p className="text-xs text-zinc-400 pt-0.5">
                  Our AI optimizes technical keywords, project framing, and narrative tone for this target audience.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Target Role */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    Target Job Role
                  </label>
                  <span className="text-[10px] font-mono text-zinc-500">Pick or type custom</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TARGET_ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setTargetRole(r);
                        setCustomRole("");
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                        effectiveRole === r
                          ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30 scale-105"
                          : "bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="Or enter custom role (e.g. Lead Blockchain Engineer)..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Target Company */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    Target Company / Culture
                  </label>
                  <span className="text-[10px] font-mono text-zinc-500">Recruiter calibration</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TARGET_COMPANIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setTargetCompany(c);
                        setCustomCompany("");
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                        effectiveCompany === c
                          ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30 scale-105"
                          : "bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                  placeholder="Or enter specific company name (e.g. Stripe, OpenAI)..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Template Selection Grid (Section 1.2 & 2) */}
          <section className="rounded-3xl bg-zinc-900/60 border border-zinc-800 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers size={16} className="text-indigo-400" />
                  <span>Choose Portfolio Template ({TEMPLATES.length} Available)</span>
                </h2>
                <p className="text-xs text-zinc-400 pt-0.5">
                  Explore responsive themes designed for specific technical disciplines and aesthetic preferences.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewingTemplateId(selectedTemplate);
                    setDemoModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Eye size={14} className="text-indigo-400" />
                  <span>Interactive Showcase</span>
                </button>

                <button
                  type="button"
                  onClick={handleAIRecommendTemplate}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition shadow-lg shadow-indigo-600/20 cursor-pointer shrink-0"
                >
                  <Sparkles size={14} className="text-amber-300" />
                  <span>AI Recommend</span>
                </button>
              </div>
            </div>

            {/* Filter Pills & Instant Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setTemplateCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      templateCategory === cat.id
                        ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[200px] sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="Filter by name, tech or style..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {templateSearch && (
                  <button
                    type="button"
                    onClick={() => setTemplateSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Template Cards Grid */}
            {filteredTemplates.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-zinc-950/60 border border-zinc-850 space-y-2">
                <p className="text-sm font-semibold text-zinc-300">No templates found matching &ldquo;{templateSearch}&rdquo;</p>
                <button
                  type="button"
                  onClick={() => {
                    setTemplateSearch("");
                    setTemplateCategory("all");
                  }}
                  className="text-xs text-indigo-400 hover:underline cursor-pointer"
                >
                  Clear search and reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTemplates.map((tmpl) => {
                  const isSelected = selectedTemplate === tmpl.id;
                  const isLocked = tmpl.plan === "pro" && !isPro;
                  const isRoleMatch = (tmpl.recommendedFor || []).some(
                    (r) =>
                      r.toLowerCase().includes(effectiveRole.toLowerCase()) ||
                      effectiveRole.toLowerCase().includes(r.toLowerCase()),
                  );

                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => {
                        if (isLocked) {
                          setShowUpgradeModal(true);
                        } else {
                          setSelectedTemplate(tmpl.id);
                          toast.success(`Selected "${tmpl.name}"`);
                        }
                      }}
                      className={`rounded-3xl p-6 border flex flex-col justify-between space-y-4 transition-all duration-300 cursor-pointer relative group hover:scale-[1.015] shadow-lg ${
                        isSelected
                          ? "bg-gradient-to-b from-indigo-950/60 to-zinc-900 border-indigo-500 shadow-xl shadow-indigo-600/20 ring-2 ring-indigo-500/40"
                          : "bg-zinc-950/80 border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900/80 hover:shadow-xl"
                      }`}
                    >
                      {/* Top Badges Bar */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-4 h-4 rounded-full shrink-0 group-hover:scale-125 transition-transform shadow-md ring-2 ring-white/10"
                            style={{ backgroundColor: tmpl.accent }}
                          />
                          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {tmpl.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isRoleMatch && (
                            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1 shadow-sm">
                              <Check size={10} />
                              <span>ROLE MATCH</span>
                            </span>
                          )}

                          {isLocked ? (
                            <div className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1">
                              <Lock size={11} />
                              <span>PRO</span>
                            </div>
                          ) : isSelected ? (
                            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-indigo-600/50">
                              ✓
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Description & Recommended Roles */}
                      <div className="space-y-3 flex-1">
                        <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed line-clamp-3">
                          {tmpl.description}
                        </p>

                        {tmpl.recommendedFor?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {tmpl.recommendedFor.slice(0, 3).map((roleName, rIdx) => (
                              <span
                                key={rIdx}
                                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400"
                              >
                                {roleName}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Live Demo & Category Info */}
                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-850">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewingTemplateId(tmpl.id);
                            setDemoModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-indigo-600/20 hover:border-indigo-500/50 border border-zinc-800 text-xs font-semibold text-zinc-200 hover:text-indigo-300 flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                          title={`Live Interactive Demo for ${tmpl.name}`}
                        >
                          <Eye size={13} className="text-indigo-400" />
                          <span>Live Demo</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-zinc-400 capitalize hidden sm:inline">
                            {tmpl.category}
                          </span>
                          <span
                            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${
                              tmpl.plan === "pro"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            {tmpl.plan.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Color & Theme Preferences (Section 8) */}
          <section className="rounded-3xl bg-zinc-900/60 border border-zinc-800 p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Color &amp; Accent Preference</h2>
                <p className="text-xs text-zinc-400 pt-0.5">
                  Applied to buttons, badges, timelines, and decorative UI highlights.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {COLOR_PRESETS.map((color) => {
                const isSelected = selectedColor === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setSelectedColor(color.id)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? "bg-zinc-850 border-white text-white shadow-lg ring-2 ring-white/10"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: color.hex, boxShadow: isSelected ? `0 0 10px ${color.hex}` : "none" }}
                    />
                    <span>{color.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Multi-Source Input Section (Section 1.4 & 1.5) */}
          <section className="rounded-3xl bg-zinc-900/60 border border-zinc-800 p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UploadCloud size={16} className="text-indigo-400" />
                <span>Supply Information Source</span>
              </h2>
              <p className="text-xs text-zinc-400 pt-0.5">
                Choose any source to populate your portfolio details. You can review and edit every generated section before publishing.
              </p>
            </div>

            {/* 4 Rich Interactive Source Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: "resume",
                  name: "PDF Resume Upload",
                  tagline: "AI parses all 11 sections instantly",
                  badge: "RECOMMENDED",
                  icon: FileText,
                  color: "indigo",
                  ready: !!resumeFile,
                  readyText: resumeFile ? `${(resumeFile.size / 1024).toFixed(0)} KB Attached` : null,
                },
                {
                  id: "github",
                  name: "GitHub Live Import",
                  tagline: "Sync top repos, languages & commits",
                  badge: "1-CLICK SYNC",
                  icon: FaGithub,
                  color: "emerald",
                  ready: !!githubUsername.trim(),
                  readyText: githubUsername ? `@${githubUsername}` : null,
                },
                {
                  id: "linkedin",
                  name: "LinkedIn Profile URL",
                  tagline: "Sync via your public LinkedIn profile URL",
                  badge: "PROFILE URL",
                  icon: FaLinkedin,
                  color: "sky",
                  ready: !!linkedinUrl.trim(),
                  readyText: linkedinUrl.trim() ? "URL Added" : null,
                },
                {
                  id: "form",
                  name: "Manual Structured Form",
                  tagline: "Granular control over each section",
                  badge: "CUSTOM",
                  icon: Edit3,
                  color: "purple",
                  ready: !!manualForm.name.trim() && !!manualForm.jobTitle.trim(),
                  readyText: manualForm.jobTitle ? "Fields Set" : null,
                },
              ].map((s) => {
                const isSelected = inputSource === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setInputSource(s.id)}
                    className={`relative text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? "bg-gradient-to-b from-indigo-950/60 to-zinc-900 border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-600/10"
                        : "bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-indigo-400 flex items-center justify-center">
                        <s.icon size={16} />
                      </div>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                        {s.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white">{s.name}</h4>
                      <p className="text-[11px] text-zinc-400 font-light pt-0.5 leading-snug">{s.tagline}</p>
                    </div>

                    {s.ready ? (
                      <div className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1 pt-1 border-t border-zinc-850">
                        <Check size={11} />
                        <span className="truncate">{s.readyText}</span>
                      </div>
                    ) : (
                      <div className="text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-850">
                        Ready to configure
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* TAB 1: RESUME PDF */}
            {inputSource === "resume" && (
              <div className="space-y-4 pt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleResumeChange}
                  className="hidden"
                />

                {!resumeFile ? (
                  <div className="space-y-3">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed transition-all rounded-2xl p-8 sm:p-10 flex flex-col items-center text-center space-y-4 cursor-pointer ${
                        isDragging
                          ? "border-indigo-500 bg-indigo-500/10 ring-4 ring-indigo-500/20"
                          : "border-zinc-700 hover:border-indigo-500/70 hover:bg-zinc-900/60"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-600/10 group-hover:scale-110 transition-transform">
                        <UploadCloud size={28} className={isDragging ? "animate-bounce text-indigo-300" : ""} />
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-sm font-bold text-white">
                          {isDragging ? "Drop your PDF Resume here" : "Click to select or drag & drop your PDF resume"}
                        </p>
                        <p className="text-xs text-zinc-400">
                          PDF up to 10MB • Automatically extracts all 11 portfolio sections
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-indigo-600/25 flex items-center gap-2"
                        >
                          <FileText size={14} />
                          <span>Browse PDF Files</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Demo Resume Test Button */}
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={handleLoadDemoResume}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 font-semibold py-1 px-2.5 rounded-lg hover:bg-indigo-500/10 transition cursor-pointer"
                      >
                        <Sparkles size={12} className="text-amber-300" />
                        <span>Quick-Test with Demo Senior SWE Resume</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-950/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                        <FileText size={24} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                            {resumeFile.name}
                          </h4>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                            <Check size={11} />
                            <span>READY</span>
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 pt-0.5">
                          {(resumeFile.size / 1024).toFixed(0)} KB • Ready for AI Parsing &amp; Generation
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition cursor-pointer"
                      >
                        Change File
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveResume}
                        className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold transition cursor-pointer"
                        title="Remove File"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: GITHUB IMPORT */}
            {inputSource === "github" && (
              <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
                    <FaGithub size={14} />
                    <span>GitHub Username or Profile URL</span>
                  </label>
                  <span className="text-[11px] text-zinc-500">Live API Sync</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData("text");
                      const clean = extractGitHubUsername(pasted);
                      if (clean) {
                        setTimeout(() => setGithubUsername(clean), 0);
                      }
                    }}
                    placeholder="e.g. https://github.com/torvalds or username"
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleFetchGitHub}
                    disabled={githubLoading}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow cursor-pointer shrink-0"
                  >
                    {githubLoading ? "Fetching..." : "Import Repos & Profile"}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-400 pt-1">
                  <span className="text-zinc-500">Try sample profiles:</span>
                  {["shadcn", "gaearon", "torvalds"].map((handle) => (
                    <button
                      key={handle}
                      type="button"
                      onClick={() => setGithubUsername(handle)}
                      className="px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-mono text-indigo-300 transition cursor-pointer"
                    >
                      @{handle}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: LINKEDIN PROFILE URL & TEXT */}
            {inputSource === "linkedin" && (
              <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
                {/* LinkedIn Anti-Scraping Advisory Banner */}
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                    <Sparkles size={14} className="text-amber-300" />
                    <span>How LinkedIn Import Works (Zero Fake Data Guarantee)</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    LinkedIn blocks automated web crawlers from reading work histories directly via URLs (HTTP 999).
                    To ensure <strong>100% genuine experience, skills, and education</strong> with zero fabricated details:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-sky-400 uppercase">Method 1 (Instant)</span>
                      <p className="text-[11px] text-zinc-300">Paste the profile summary &amp; experience into the box below.</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Method 2 (1-Click PDF)</span>
                      <p className="text-[11px] text-zinc-300">
                        On LinkedIn, click <strong>&quot;More&quot; &rarr; &quot;Save to PDF&quot;</strong>, then{" "}
                        <button
                          type="button"
                          onClick={() => setInputSource("resume")}
                          className="text-emerald-400 underline font-semibold hover:text-emerald-300 cursor-pointer"
                        >
                          upload to Resume tab
                        </button>.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">Method 3 (Dual API Sync)</span>
                      <p className="text-[11px] text-zinc-300">
                        Plug in <strong>Apify</strong> &amp; <strong>RapidAPI</strong> keys in <code className="text-zinc-400 text-[10px]">.env</code> for fully automated URL scraping.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
                    <FaLinkedin size={15} className="text-sky-400" />
                    <span>Candidate LinkedIn Profile URL</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleLoadSampleLinkedInUrl("alexmorgan-dev")}
                      className="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer transition flex items-center gap-1"
                    >
                      <span>⚡ Sample Profile</span>
                    </button>
                    <span className="text-zinc-600">|</span>
                    <button
                      type="button"
                      onClick={() => handleLoadSampleLinkedInUrl("satyanadella")}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer transition flex items-center gap-1"
                    >
                      <span>⚡ Satya Nadella</span>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <FaLinkedin size={16} className="text-sky-500" />
                  </div>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/in/username"
                    className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition font-mono"
                  />
                </div>

                {/* Profile Text Ingestion */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono flex items-center gap-1.5">
                      <Sparkles size={13} className="text-sky-400" />
                      <span>Paste Authentic LinkedIn Profile Details</span>
                    </label>
                    <span className="text-[10px] font-mono text-zinc-400">Guarantees 100% Real History</span>
                  </div>

                  <textarea
                    rows={6}
                    value={linkedinText}
                    onChange={(e) => setLinkedinText(e.target.value)}
                    placeholder={`Copy and paste text from the candidate's LinkedIn profile here...\n\nExample:\nJob Title / Current Role\nCompany Name\nExperience highlights & years\nEducation & degree\nSkills list`}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 font-mono leading-relaxed"
                  />
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    💡 Our AI extracts authentic job history, skills, and certifications directly from your pasted text.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: MANUAL STRUCTURED FORM (Section 1.5) */}
            {inputSource === "form" && (
              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <p className="text-xs text-zinc-400 font-light">
                    Enter details manually or load our senior engineer demo dataset in 1 click.
                  </p>
                  <button
                    type="button"
                    onClick={handleAutoFillForm}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={12} className="text-amber-300" />
                    <span>Auto-Fill Demo Profile</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Full Name</label>
                    <input
                      type="text"
                      value={manualForm.name}
                      onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Professional Title</label>
                    <input
                      type="text"
                      value={manualForm.jobTitle}
                      onChange={(e) => setManualForm({ ...manualForm, jobTitle: e.target.value })}
                      placeholder="Senior Full Stack Engineer"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">Bio / About Me</label>
                  <textarea
                    rows={3}
                    value={manualForm.bio}
                    onChange={(e) => setManualForm({ ...manualForm, bio: e.target.value })}
                    placeholder="Brief professional summary of your background and technical focus..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">Skills (Comma-separated)</label>
                  <input
                    type="text"
                    value={manualForm.skills}
                    onChange={(e) => setManualForm({ ...manualForm, skills: e.target.value })}
                    placeholder="React, TypeScript, Node.js, Docker, AWS, PostgreSQL, Redis"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Featured Project Title</label>
                    <input
                      type="text"
                      value={manualForm.projectTitle}
                      onChange={(e) => setManualForm({ ...manualForm, projectTitle: e.target.value })}
                      placeholder="Distributed API Gateway"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Project Live Link / GitHub</label>
                    <input
                      type="text"
                      value={manualForm.projectLive}
                      onChange={(e) => setManualForm({ ...manualForm, projectLive: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-zinc-400">GitHub Profile URL</label>
                      {manualForm.github && (
                        <button
                          type="button"
                          onClick={() => {
                            setGithubUsername(manualForm.github);
                            handleFetchGitHub();
                          }}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                        >
                          Sync GitHub Profile ✨
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={manualForm.github}
                      onChange={(e) => setManualForm({ ...manualForm, github: e.target.value })}
                      placeholder="https://github.com/yourhandle"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">LinkedIn Profile URL</label>
                    <input
                      type="text"
                      value={manualForm.linkedin}
                      onChange={(e) => setManualForm({ ...manualForm, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/yourhandle"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Attach Candidate Resume / CV */}
                  <div className="space-y-1.5 md:col-span-2 pt-2 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                        <FileText size={13} className="text-emerald-400" />
                        <span>Candidate Resume / CV Document (Displayed on Live Portfolio)</span>
                      </label>
                      {manualForm.resumeUrl && (
                        <button
                          type="button"
                          onClick={() => setManualForm({ ...manualForm, resumeUrl: "", resumeName: "" })}
                          className="text-[11px] text-red-400 hover:text-red-300 cursor-pointer font-medium"
                        >
                          Remove Attached Resume
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                      <input
                        type="url"
                        value={manualForm.resumeUrl || ""}
                        onChange={(e) =>
                          setManualForm({
                            ...manualForm,
                            resumeUrl: e.target.value,
                            resumeName: manualForm.resumeName || "Resume.pdf",
                          })
                        }
                        placeholder="https://drive.google.com/... or public PDF link"
                        className="w-full sm:flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      <label className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/40 hover:to-teal-600/40 border border-emerald-500/40 text-xs font-semibold text-emerald-300 hover:text-white cursor-pointer transition flex items-center justify-center gap-2 shrink-0 shadow-sm">
                        <Upload size={13} className="text-emerald-400" />
                        <span>{manualForm.resumeName ? `Attached: ${manualForm.resumeName}` : "Upload PDF Resume"}</span>
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setManualForm({
                                ...manualForm,
                                resumeUrl: ev.target.result,
                                resumeName: file.name,
                              });
                              toast.success(`Attached ${file.name} to portfolio! 📄`);
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Floating Bottom Generation Console Deck */}
        <div className="fixed bottom-4 left-0 right-0 z-40 max-w-5xl mx-auto px-4 pointer-events-none">
          <div className="pointer-events-auto rounded-2xl bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800/90 p-4 sm:p-5 shadow-2xl shadow-black/90 flex flex-col sm:flex-row items-center justify-between gap-4 ring-1 ring-white/10">
            <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-md transition-colors"
                style={{
                  backgroundColor: `${currentTemplateObj?.accent || "#6366f1"}25`,
                  borderColor: `${currentTemplateObj?.accent || "#6366f1"}60`,
                  color: currentTemplateObj?.accent || "#6366f1",
                }}
              >
                <Sparkles size={22} className="animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">
                    {currentTemplateObj?.name || selectedTemplate.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800">
                    {effectiveRole} @ {effectiveCompany}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                    {inputSource.toUpperCase()} SOURCE
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate pt-0.5">
                  AI will synthesize 11 comprehensive portfolio sections optimized for {effectiveCompany}.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-white font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2.5 transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0 disabled:opacity-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-indigo-600/30"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>
                    Synthesizing Portfolio ({selectedTemplate.toUpperCase()})...
                  </span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="text-amber-300 animate-pulse" />
                  <span>Generate Complete Portfolio ✨</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Upgrade Modal */}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          targetFeature="Premium Templates"
        />

        {/* Live Template Interactive Demo Showcase Modal */}
        <TemplateDemoModal
          isOpen={demoModalOpen}
          onClose={() => setDemoModalOpen(false)}
          initialTemplateId={previewingTemplateId}
          selectedTemplateId={selectedTemplate}
          onSelectTemplate={(tmplId) => {
            setSelectedTemplate(tmplId);
            toast.success(`Selected template: ${tmplId.toUpperCase()}`);
          }}
          userPlan={userPlan}
          onUpgrade={() => {
            setDemoModalOpen(false);
            setShowUpgradeModal(true);
          }}
        />
      </div>
    );
  }

  // ==========================================
  // VIEW 3: Live Review, Split-Screen Edit, & AI Chat (Section 1.7, 1.8, 6, 7)
  // ==========================================
  const currentData = generatedData;
  const previewPortfolio = {
    ...currentData,
    avatar: currentData?.avatar || currentData?.hero?.avatar || "",
    template: selectedTemplate === "custom" || creationMode === "custom" ? "custom" : selectedTemplate,
    preferences: {
      ...(currentData?.preferences || {}),
      colorScheme: selectedColor,
      themeColor: selectedColor,
      customLayout: {
        layoutStyle: customLayoutStyle,
        density: customDensity,
        font: customFont,
        customPitch,
        customCta,
        activeSections: customSections,
      },
    },
    name: currentData?.hero?.name || "Developer",
    tagline: currentData?.hero?.tagline || currentData?.hero?.title || "",
    email: currentData?.contact?.email || "",
    phone: currentData?.contact?.phone || "",
    github: currentData?.contact?.github || "",
    linkedin: currentData?.contact?.linkedin || "",
    website: currentData?.contact?.website || "",
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col">
      <SEO
        title="AI Portfolio Generator — Build Developer Sites in Seconds"
        description="Upload your resume PDF and generate a custom, production-ready developer portfolio in 30 seconds with PortfolioAI."
        canonical="/portfolio-generator"
        keywords={[
          "AI portfolio generator",
          "resume to portfolio",
          "developer site builder",
          "PDF portfolio generator",
        ]}
      />
      {/* Top sticky action toolbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="text-xs text-zinc-400 hover:text-white transition flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 font-semibold"
              title="Return to Dashboard"
            >
              <ArrowLeft size={12} className="text-indigo-400" />
              <span>Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-zinc-800"></div>
            <button
              onClick={() => setStep("setup")}
              className="text-xs text-zinc-400 hover:text-white transition cursor-pointer"
            >
              ← Edit Source &amp; Roles
            </button>
            <div className="h-4 w-px bg-zinc-800"></div>
            <button
              type="button"
              onClick={handleStartNew}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/25 hover:bg-indigo-500/20 font-semibold cursor-pointer"
              title="Start a new portfolio from scratch"
            >
              <Plus size={12} />
              <span>Create New</span>
            </button>
            <div className="h-4 w-px bg-zinc-800"></div>
            <h2 className="text-sm font-bold text-white truncate max-w-xs">
              {currentData?.hero?.name || "Developer"}&apos;s Portfolio
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              OPTIMIZED FOR {effectiveCompany.toUpperCase()}
            </span>
          </div>

          {/* Template Switcher Pills */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 overflow-x-auto max-w-md scrollbar-none">

            {TEMPLATES.slice(0, 6).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  if (t.tier === "pro" && userPlan !== "pro") {
                    setShowUpgradeModal(true);
                  } else {
                    setSelectedTemplate(t.id);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition whitespace-nowrap cursor-pointer ${
                  selectedTemplate === t.id
                    ? "bg-indigo-600 text-white shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {t.name.split(" ")[0]}
              </button>
            ))}
            <button
              onClick={() => {
                setPreviewingTemplateId(selectedTemplate);
                setDemoModalOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 whitespace-nowrap transition cursor-pointer"
            >
              👁️ All 14 Demos
            </button>
          </div>

          {/* View toggle & Save */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-zinc-900 border border-zinc-800 p-1">
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === "preview"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Eye size={13} />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setActiveTab("edit")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === "edit"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Sliders size={13} />
                <span>Edit Fields</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowPhotoModal(true)}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-pink-500/50 text-xs font-semibold text-pink-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
              title="Upload or Change Profile Photo"
            >
              <Camera size={13} className="text-pink-400" />
              <span>
                {previewPortfolio?.avatar && !previewPortfolio.avatar.includes("dicebear")
                  ? "Change Photo"
                  : "+ Add Photo"}
              </span>
              {(!previewPortfolio?.avatar || previewPortfolio.avatar.includes("dicebear")) && (
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse"></span>
              )}
            </button>

            <Link
              to="/analyzer"
              className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition"
            >
              Analyze Score →
            </Link>

            <button
              type="button"
              onClick={handleStartNew}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
              title="Create another new portfolio from scratch"
            >
              <Plus size={13} />
              <span>Start New</span>
            </button>

            <button
              onClick={handleSavePortfolio}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <Save size={14} />
              <span>{saving ? "Saving..." : "Save to Library"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Missing Information Prompt Bar */}
      {missingInfo && missingInfo.length > 0 && (
        <MissingInfoPrompt
          missingInfo={missingInfo}
          portfolioData={previewPortfolio}
          onUpdatePortfolio={(updated) => {
            setGeneratedData(updated);
            dispatch(setGeneratedPortfolio(updated));
            const stillMissing = missingInfo.filter((item) => {
              if (item.section === "Resume" || item.field === "resumeUrl") {
                const val = updated.resumeUrl || updated.resume;
                return !val || (typeof val === "string" && val.trim() === "");
              }
              if (item.section === "Contact") {
                const val = updated.contact?.[item.field] || updated[item.field];
                return !val || val.trim() === "";
              }
              if (item.section === "Experience") {
                return !updated.experience || updated.experience.length === 0;
              }
              if (item.section === "Projects") {
                return !updated.projects || updated.projects.length === 0;
              }
              if (item.section === "Education") {
                return !updated.education || updated.education.length === 0;
              }
              if (item.section === "Skills") {
                return !updated.skills || updated.skills.length === 0;
              }
              if (item.section === "Certifications") {
                return !updated.certifications || updated.certifications.length === 0;
              }
              if (item.section === "Achievements") {
                return !updated.achievements || updated.achievements.length === 0;
              }
              if (item.section === "Blog") {
                return !updated.blog || updated.blog.length === 0;
              }
              return true;
            });
            setMissingInfo(stillMissing);
          }}
          onDismiss={() => setMissingInfo([])}
        />
      )}

      {/* Main View Area */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Split Left: Editable form fields (shown when activeTab === 'edit') */}
        {activeTab === "edit" && (
          <div className="w-full md:w-96 lg:w-[420px] bg-zinc-950 border-r border-zinc-800 p-6 overflow-y-auto space-y-6 shrink-0 max-h-[calc(100vh-60px)]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Live Field Editor
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Name</label>
                <input
                  type="text"
                  value={currentData?.hero?.name || ""}
                  onChange={(e) => handleHeroChange("name", e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-zinc-400 font-semibold">Profile Photo &amp; Avatar</label>
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(true)}
                    className="text-[11px] text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Camera size={11} />
                    <span>Upload or Pick Photo</span>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  {(currentData?.avatar || currentData?.hero?.avatar) && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                      <img
                        src={currentData?.avatar || currentData?.hero?.avatar}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <input
                    type="url"
                    value={currentData?.avatar || currentData?.hero?.avatar || ""}
                    onChange={(e) => {
                      handleFieldChange("avatar", e.target.value);
                      handleHeroChange("avatar", e.target.value);
                    }}
                    placeholder="https://... or click Upload"
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(true)}
                    className="px-3 py-2 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/40 text-pink-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer shrink-0"
                  >
                    <Upload size={12} />
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              {/* Candidate Resume / CV Document */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-zinc-400 font-semibold flex items-center gap-1.5">
                    <FileText size={12} className="text-emerald-400" />
                    <span>Candidate Resume / CV Document</span>
                  </label>
                  {(currentData?.resumeUrl || currentData?.resume) && (
                    <button
                      type="button"
                      onClick={() => {
                        handleFieldChange("resumeUrl", "");
                        handleFieldChange("resumeName", "");
                        toast("Resume removed", { icon: "🗑️" });
                      }}
                      className="text-[11px] text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={currentData?.resumeUrl || currentData?.resume || ""}
                      onChange={(e) => {
                        handleFieldChange("resumeUrl", e.target.value);
                        if (!currentData?.resumeName) {
                          handleFieldChange("resumeName", "Resume.pdf");
                        }
                      }}
                      placeholder="Paste public PDF URL or upload below"
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <label className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/40 hover:to-teal-600/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0">
                      <Upload size={12} className="text-emerald-400" />
                      <span>Upload PDF</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            handleFieldChange("resumeUrl", ev.target.result);
                            handleFieldChange("resumeName", file.name);
                            toast.success(`Attached ${file.name} to portfolio! 📄`);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>
                  {(currentData?.resumeUrl || currentData?.resume) && (
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px]">
                      <span className="text-emerald-300 truncate max-w-[240px] font-mono">
                        📄 {currentData.resumeName || "Attached_Resume.pdf"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const url = currentData.resumeUrl || currentData.resume;
                          if (url.startsWith("data:")) {
                            window.dispatchEvent(
                              new CustomEvent("portfolio:view-doc", {
                                detail: {
                                  title: currentData.resumeName || "Resume.pdf",
                                  url,
                                  type: "pdf",
                                },
                              })
                            );
                          } else {
                            window.open(url, "_blank", "noopener,noreferrer");
                          }
                        }}
                        className="text-emerald-400 hover:text-white font-semibold cursor-pointer underline ml-2"
                      >
                        Preview ↗
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Professional Tagline</label>
                <input
                  type="text"
                  value={currentData?.hero?.tagline || ""}
                  onChange={(e) => handleHeroChange("tagline", e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400">About Me</label>
                <textarea
                  rows={4}
                  value={currentData?.about || ""}
                  onChange={(e) => handleFieldChange("about", e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={(currentData?.skills || []).join(", ")}
                  onChange={(e) =>
                    handleFieldChange(
                      "skills",
                      e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    )
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Work Experience Section */}
              <div className="pt-2 border-t border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Briefcase size={12} className="text-amber-400" />
                    <span>Work Experience ({currentData?.experience?.length || 0})</span>
                  </h4>
                </div>

                {currentData?.experience?.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {currentData.experience.map((exp, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate">
                            {exp.role} <span className="text-amber-400">@</span> {exp.company}
                          </div>
                          <div className="text-[10px] text-zinc-400">{exp.duration}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExperienceItem(idx)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer shrink-0"
                          title="Remove experience"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Quick Add Experience */}
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
                  <div className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1">
                    <Plus size={11} className="text-amber-400" />
                    <span>Add Experience Entry</span>
                  </div>
                  <input
                    type="text"
                    value={editorNewExp.role}
                    onChange={(e) => setEditorNewExp({ ...editorNewExp, role: e.target.value })}
                    placeholder="Job Role (e.g. Senior Frontend Dev)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editorNewExp.company}
                      onChange={(e) => setEditorNewExp({ ...editorNewExp, company: e.target.value })}
                      placeholder="Company"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="text"
                      value={editorNewExp.duration}
                      onChange={(e) => setEditorNewExp({ ...editorNewExp, duration: e.target.value })}
                      placeholder="Duration"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={editorNewExp.location}
                      onChange={(e) => setEditorNewExp({ ...editorNewExp, location: e.target.value })}
                      placeholder="Location (e.g. SF, CA)"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                    <select
                      value={editorNewExp.workplaceType}
                      onChange={(e) => setEditorNewExp({ ...editorNewExp, workplaceType: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
                    >
                      <option value="Virtual / Remote">Virtual / Remote</option>
                      <option value="On-site">On-site</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                    <select
                      value={editorNewExp.compensation}
                      onChange={(e) => setEditorNewExp({ ...editorNewExp, compensation: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Stipend">Stipend</option>
                    </select>
                  </div>

                  {/* Amount when Paid or Stipend */}
                  {editorNewExp.compensation !== "Unpaid" && (
                    <input
                      type="text"
                      value={editorNewExp.compensationAmount}
                      onChange={(e) => setEditorNewExp({ ...editorNewExp, compensationAmount: e.target.value })}
                      placeholder={editorNewExp.compensation === "Stipend" ? "Stipend Amount (e.g. ₹25,000 / mo or $1,500/mo)" : "Compensation / Salary (e.g. ₹12 LPA or $95k/yr)"}
                      className="w-full bg-zinc-950 border border-emerald-500/40 rounded-lg px-2.5 py-1.5 text-xs text-emerald-300 placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                    />
                  )}

                  {/* Company Project deliverable inputs */}
                  <div className="p-2 rounded-lg bg-zinc-950/70 border border-zinc-800/80 space-y-1.5">
                    <span className="text-[10px] text-cyan-400 font-mono font-semibold block uppercase">
                      Company Project / Deliverable (Optional)
                    </span>
                    <input
                      type="text"
                      value={editorNewExp.projectTitle}
                      onChange={(e) => setEditorNewExp({ ...editorNewExp, projectTitle: e.target.value })}
                      placeholder="Project Name (e.g. Internal Analytics Dashboard)"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="url"
                        value={editorNewExp.projectLive}
                        onChange={(e) => setEditorNewExp({ ...editorNewExp, projectLive: e.target.value })}
                        placeholder="Live Demo URL"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="url"
                        value={editorNewExp.projectGithub}
                        onChange={(e) => setEditorNewExp({ ...editorNewExp, projectGithub: e.target.value })}
                        placeholder="GitHub URL"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="url"
                      value={editorNewExp.offerLetter}
                      onChange={(e) => setEditorNewExp({ ...editorNewExp, offerLetter: e.target.value })}
                      placeholder="Offer Letter URL (Optional)"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="url"
                      value={editorNewExp.certificate}
                      onChange={(e) => setEditorNewExp({ ...editorNewExp, certificate: e.target.value })}
                      placeholder="Certificate URL (Optional)"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <input
                    type="text"
                    value={editorNewExp.description}
                    onChange={(e) => setEditorNewExp({ ...editorNewExp, description: e.target.value })}
                    placeholder="Short description or metrics"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddExperienceItem}
                    className="w-full py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 border border-amber-500/40 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus size={12} />
                    <span>+ Add Experience</span>
                  </button>
                </div>
              </div>

              {/* Projects Section */}
              <div className="pt-2 border-t border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Code2 size={12} className="text-indigo-400" />
                    <span>Software Projects ({currentData?.projects?.length || 0})</span>
                  </h4>
                </div>

                {currentData?.projects?.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {currentData.projects.map((proj, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate">{proj.title}</div>
                          <div className="text-[10px] text-zinc-400 line-clamp-1">{proj.description}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveProjectItem(idx)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer shrink-0"
                          title="Remove project"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Quick Add Project */}
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
                  <div className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1">
                    <Plus size={11} className="text-indigo-400" />
                    <span>Add Project Entry</span>
                  </div>
                  <input
                    type="text"
                    value={editorNewProj.title}
                    onChange={(e) => setEditorNewProj({ ...editorNewProj, title: e.target.value })}
                    placeholder="Project Title"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={editorNewProj.tags}
                    onChange={(e) => setEditorNewProj({ ...editorNewProj, tags: e.target.value })}
                    placeholder="Tags (e.g. React, Node.js, MongoDB)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="url"
                      value={editorNewProj.github}
                      onChange={(e) => setEditorNewProj({ ...editorNewProj, github: e.target.value })}
                      placeholder="GitHub URL"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="url"
                      value={editorNewProj.live}
                      onChange={(e) => setEditorNewProj({ ...editorNewProj, live: e.target.value })}
                      placeholder="Live Demo URL"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <input
                    type="text"
                    value={editorNewProj.description}
                    onChange={(e) => setEditorNewProj({ ...editorNewProj, description: e.target.value })}
                    placeholder="Brief project description"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddProjectItem}
                    className="w-full py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white border border-indigo-500/40 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus size={12} />
                    <span>+ Add Project</span>
                  </button>
                </div>
              </div>

              {/* Education Section */}
              <div className="pt-2 border-t border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <GraduationCap size={12} className="text-emerald-400" />
                    <span>Education ({currentData?.education?.length || 0})</span>
                  </h4>
                </div>

                {currentData?.education?.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {currentData.education.map((edu, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate">{edu.degree}</div>
                          <div className="text-[10px] text-zinc-400">{edu.institution} {edu.year ? `• ${edu.year}` : ""}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEducationItem(idx)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer shrink-0"
                          title="Remove education"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Quick Add Education */}
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
                  <div className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1">
                    <Plus size={11} className="text-emerald-400" />
                    <span>Add Degree / Institution</span>
                  </div>
                  <input
                    type="text"
                    value={editorNewEdu.degree}
                    onChange={(e) => setEditorNewEdu({ ...editorNewEdu, degree: e.target.value })}
                    placeholder="Degree (e.g. B.Tech / B.S. in Computer Science)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editorNewEdu.institution}
                      onChange={(e) => setEditorNewEdu({ ...editorNewEdu, institution: e.target.value })}
                      placeholder="University / Institute"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      value={editorNewEdu.year}
                      onChange={(e) => setEditorNewEdu({ ...editorNewEdu, year: e.target.value })}
                      placeholder="Year"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddEducationItem}
                    className="w-full py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-zinc-950 border border-emerald-500/40 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus size={12} />
                    <span>+ Add Education</span>
                  </button>
                </div>
              </div>

              {/* Certifications Section */}
              <div className="pt-2 border-t border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Award size={12} className="text-purple-400" />
                    <span>Certifications ({currentData?.certifications?.length || 0})</span>
                  </h4>
                </div>

                {currentData?.certifications?.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {currentData.certifications.map((cert, idx) => {
                      const certUrl = cert.link || cert.url;
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="font-semibold text-white truncate">{cert.name}</div>
                            <div className="text-[10px] text-zinc-400">
                              {cert.issuer} {cert.date ? `• ${cert.date}` : ""}
                            </div>
                            {cert.description && (
                              <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                                {cert.description}
                              </p>
                            )}
                            {certUrl && (
                              <a
                                href={certUrl.startsWith("http") ? certUrl : `https://${certUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 hover:underline pt-0.5"
                              >
                                <span>Verify Credential</span>
                                <ExternalLink size={9} />
                              </a>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCertItem(idx)}
                            className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer shrink-0"
                            title="Remove certification"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Inline Quick Add Certification */}
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
                  <div className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1">
                    <Plus size={11} className="text-purple-400" />
                    <span>Add Certification</span>
                  </div>
                  <input
                    type="text"
                    value={editorNewCert.name}
                    onChange={(e) => setEditorNewCert({ ...editorNewCert, name: e.target.value })}
                    placeholder="Certification Name *"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editorNewCert.issuer}
                      onChange={(e) => setEditorNewCert({ ...editorNewCert, issuer: e.target.value })}
                      placeholder="Issuing Organization"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                    <input
                      type="text"
                      value={editorNewCert.date}
                      onChange={(e) => setEditorNewCert({ ...editorNewCert, date: e.target.value })}
                      placeholder="Year / Date"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <input
                    type="text"
                    value={editorNewCert.description || ""}
                    onChange={(e) => setEditorNewCert({ ...editorNewCert, description: e.target.value })}
                    placeholder="Description / Key Skills Covered"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="url"
                    value={editorNewCert.link || editorNewCert.url || ""}
                    onChange={(e) =>
                      setEditorNewCert({ ...editorNewCert, link: e.target.value, url: e.target.value })
                    }
                    placeholder="Credential URL / Verification Link (https://...)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCertItem}
                    className="w-full py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white border border-purple-500/40 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus size={12} />
                    <span>+ Add Certification</span>
                  </button>
                </div>
              </div>

              {/* Achievements Section */}
              <div className="pt-2 border-t border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Award size={12} className="text-pink-400" />
                    <span>Achievements ({currentData?.achievements?.length || 0})</span>
                  </h4>
                </div>

                {currentData?.achievements?.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {currentData.achievements.map((ach, idx) => {
                      const achUrl = ach.link || ach.url;
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="font-semibold text-white truncate">{ach.title}</div>
                            {ach.metric && (
                              <div className="text-[10px] text-pink-400 font-mono font-medium">
                                {ach.metric}
                              </div>
                            )}
                            {ach.description && (
                              <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                                {ach.description}
                              </p>
                            )}
                            {achUrl && (
                              <a
                                href={achUrl.startsWith("http") ? achUrl : `https://${achUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-pink-400 hover:text-pink-300 hover:underline pt-0.5"
                              >
                                <span>Verification Link</span>
                                <ExternalLink size={9} />
                              </a>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAchItem(idx)}
                            className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer shrink-0"
                            title="Remove achievement"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Inline Quick Add Achievement */}
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
                  <div className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1">
                    <Plus size={11} className="text-pink-400" />
                    <span>Add Achievement</span>
                  </div>
                  <input
                    type="text"
                    value={editorNewAch.title}
                    onChange={(e) => setEditorNewAch({ ...editorNewAch, title: e.target.value })}
                    placeholder="Award / Honor Title *"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
                  />
                  <input
                    type="text"
                    value={editorNewAch.metric}
                    onChange={(e) => setEditorNewAch({ ...editorNewAch, metric: e.target.value })}
                    placeholder="Rank / Metric (e.g. 1st Place / 120 Teams)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
                  />
                  <input
                    type="text"
                    value={editorNewAch.description || ""}
                    onChange={(e) => setEditorNewAch({ ...editorNewAch, description: e.target.value })}
                    placeholder="Description (details of the award, project, or win)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
                  />
                  <input
                    type="url"
                    value={editorNewAch.link || editorNewAch.url || ""}
                    onChange={(e) =>
                      setEditorNewAch({ ...editorNewAch, link: e.target.value, url: e.target.value })
                    }
                    placeholder="Proof / Verification Link (https://...)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAchItem}
                    className="w-full py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500 text-pink-300 hover:text-white border border-pink-500/40 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus size={12} />
                    <span>+ Add Achievement</span>
                  </button>
                </div>
              </div>

              {/* Publications & Blog Section */}
              <div className="pt-2 border-t border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <FileText size={12} className="text-cyan-400" />
                    <span>Publications / Blog ({currentData?.blog?.length || 0})</span>
                  </h4>
                </div>

                {currentData?.blog?.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {currentData.blog.map((b, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate">{b.title}</div>
                          <div className="text-[10px] text-zinc-400 truncate">{b.link || b.excerpt}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveBlogItem(idx)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer shrink-0"
                          title="Remove publication"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Quick Add Blog */}
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
                  <input
                    type="text"
                    value={editorNewBlog.title}
                    onChange={(e) => setEditorNewBlog({ ...editorNewBlog, title: e.target.value })}
                    placeholder="Article / Paper Title"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="url"
                      value={editorNewBlog.link}
                      onChange={(e) => setEditorNewBlog({ ...editorNewBlog, link: e.target.value })}
                      placeholder="URL (optional)"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddBlogItem}
                      className="py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-white border border-cyan-500/40 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus size={12} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact Information Fields */}
              <div className="pt-2 border-t border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                  Authentic Contact Info
                </h4>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Email Address</label>
                  <input
                    type="email"
                    value={currentData?.contact?.email || currentData?.email || ""}
                    onChange={(e) => handleContactChange("email", e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Phone Number</label>
                  <input
                    type="tel"
                    value={currentData?.contact?.phone || currentData?.phone || ""}
                    onChange={(e) => handleContactChange("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={currentData?.contact?.linkedin || currentData?.linkedin || ""}
                    onChange={(e) => handleContactChange("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">GitHub Profile URL</label>
                  <input
                    type="url"
                    value={currentData?.contact?.github || currentData?.github || ""}
                    onChange={(e) => handleContactChange("github", e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Website / Portfolio URL</label>
                  <input
                    type="url"
                    value={currentData?.contact?.website || currentData?.website || ""}
                    onChange={(e) => handleContactChange("website", e.target.value)}
                    placeholder="https://yourportfolio.dev"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* SEO Metadata Fields */}
              <div className="pt-2 border-t border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                  SEO Metadata
                </h4>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">SEO Page Title</label>
                  <input
                    type="text"
                    value={currentData?.seo?.title || ""}
                    onChange={(e) => handleSeoChange("title", e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">SEO Meta Description</label>
                  <textarea
                    rows={2}
                    value={currentData?.seo?.description || ""}
                    onChange={(e) => handleSeoChange("description", e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Split Right / Main: Interactive Template Preview */}
        <div className="flex-1 overflow-y-auto bg-zinc-950 min-h-0 relative">
          {(!previewPortfolio?.avatar || previewPortfolio.avatar.includes("dicebear")) && (
            <button
              type="button"
              onClick={() => setShowPhotoModal(true)}
              className="absolute top-4 right-6 z-20 flex items-center gap-2 px-3.5 py-2 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-pink-500/50 hover:border-pink-400 text-white text-xs font-bold shadow-2xl backdrop-blur-md transition-all hover:scale-105 cursor-pointer group"
              title="Add a profile photo for this portfolio"
            >
              <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition">
                <Camera size={12} />
              </div>
              <span className="text-pink-200 group-hover:text-white">+ Add Profile Photo</span>
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse"></span>
            </button>
          )}
          <TemplateRenderer
            portfolio={previewPortfolio}
            templateOverride={selectedTemplate}
          />
        </div>
      </div>

      {/* Profile Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        currentAvatar={previewPortfolio?.avatar || ""}
        candidateName={previewPortfolio?.name || previewPortfolio?.hero?.name || "Developer"}
        onApplyPhoto={(newAvatar) => {
          const updated = {
            ...previewPortfolio,
            avatar: newAvatar,
            hero: {
              ...(previewPortfolio?.hero || {}),
              avatar: newAvatar,
            },
          };
          setGeneratedData(updated);
          dispatch(setGeneratedPortfolio(updated));
        }}
      />

      {/* Embedded Portfolio-Aware AI Copilot (Section 7) */}
      <AIChatAssistant portfolioData={previewPortfolio} />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        targetFeature="Premium Templates"
      />

      {/* Live Template Interactive Demo Showcase Modal */}
      <TemplateDemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        initialTemplateId={previewingTemplateId}
        selectedTemplateId={selectedTemplate}
        onSelectTemplate={(tmplId) => {
          setSelectedTemplate(tmplId);
          toast.success(`Switched to ${tmplId.toUpperCase()} template!`);
        }}
        userPlan={userPlan}
        onUpgrade={() => {
          setDemoModalOpen(false);
          setShowUpgradeModal(true);
        }}
      />
    </div>
  );
};

export default PortfolioGenerator;
