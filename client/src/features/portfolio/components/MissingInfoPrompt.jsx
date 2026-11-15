import { useState, useRef } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Phone,
  Globe,
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  Code2,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Trash2,
  ExternalLink,
  Camera,
  Upload,
  FileText,
  MapPin,
  Building2,
  DollarSign,
  Eye,
} from 'lucide-react';
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { DocumentViewerModal } from "./templates/motionComponents";
import { uploadPortfolioResume } from "../services/portfolioService";

const MissingInfoPrompt = ({
  missingInfo = [],
  portfolioData = {},
  onUpdatePortfolio,
  onDismiss,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [viewingDoc, setViewingDoc] = useState(null);
  const photoInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [formData, setFormData] = useState({
    avatar: portfolioData?.avatar || portfolioData?.hero?.avatar || "",
    resumeUrl: portfolioData?.resumeUrl || portfolioData?.resume || "",
    resumeName: portfolioData?.resumeName || "",
    phone: portfolioData?.contact?.phone || portfolioData?.phone || "",
    linkedin: portfolioData?.contact?.linkedin || portfolioData?.linkedin || "",
    github: portfolioData?.contact?.github || portfolioData?.github || "",
    email: portfolioData?.contact?.email || portfolioData?.email || "",
    website: portfolioData?.contact?.website || portfolioData?.website || "",
    // Experience
    expRole: "",
    expCompany: "",
    expDuration: "",
    expLocation: "",
    expWorkplaceType: "Virtual / Remote",
    expCompensation: "Paid",
    expCompensationAmount: "",
    expDescription: "",
    expProjectTitle: "",
    expProjectLive: "",
    expProjectGithub: "",
    expOfferLetterUrl: "",
    expOfferLetterFile: null,
    expOfferLetterFileName: "",
    expCertificateUrl: "",
    expCertificateFile: null,
    expCertificateFileName: "",
    // Projects
    projTitle: "",
    projDesc: "",
    projTags: "",
    projGithub: "",
    projLive: "",
    // Education
    eduInstitution: "",
    eduDegree: "",
    eduYear: "",
    eduDescription: "",
    // Skills
    skillsInput: (portfolioData?.skills || []).join(", "),
    // Certifications
    certName: "",
    certIssuer: "",
    certDate: "",
    certUrl: "",
    certDescription: "",
    // Achievements
    achievementTitle: "",
    achievementDesc: "",
    achievementMetric: "",
    achievementLink: "",
    // Blog
    blogTitle: "",
    blogLink: "",
    blogExcerpt: "",
  });

  const safeMissingInfo = Array.isArray(missingInfo) ? missingInfo : [];

  const [activeTab, setActiveTab] = useState(
    safeMissingInfo.length > 0 ? "overview" : "photo"
  );

  if (!portfolioData) return null;

  const photoMissing = safeMissingInfo.some(
    (item) => item.section === "Profile Photo" || item.field === "avatar"
  );
  const resumeMissing = safeMissingInfo.some(
    (item) => item.section === "Resume" || item.field === "resumeUrl"
  );
  const contactMissing = safeMissingInfo.filter((item) => item.section === "Contact");
  const experienceMissing = safeMissingInfo.some((item) => item.section === "Experience");
  const projectsMissing = safeMissingInfo.some((item) => item.section === "Projects");
  const educationMissing = safeMissingInfo.some((item) => item.section === "Education");
  const skillsMissing = safeMissingInfo.some((item) => item.section === "Skills");
  const certsMissing = safeMissingInfo.some((item) => item.section === "Certifications");
  const achievementsMissing = safeMissingInfo.some((item) => item.section === "Achievements");
  const blogMissing = safeMissingInfo.some((item) => item.section === "Blog");

  const getTabForSection = (section) => {
    switch (section) {
      case "Profile Photo":
        return "photo";
      case "Resume":
        return "resume";
      case "Experience":
        return "experience";
      case "Projects":
        return "projects";
      case "Education":
        return "education";
      case "Skills":
        return "skills";
      case "Certifications":
        return "certifications";
      case "Achievements":
        return "achievements";
      case "Blog":
        return "blog";
      case "Contact":
      default:
        return "contact";
    }
  };

  const getSectionIcon = (section) => {
    switch (section) {
      case "Profile Photo":
        return <Camera size={14} className="text-pink-400" />;
      case "Resume":
        return <FileText size={14} className="text-emerald-400" />;
      case "Experience":
        return <Briefcase size={14} className="text-amber-400" />;
      case "Projects":
        return <Code2 size={14} className="text-indigo-400" />;
      case "Education":
        return <GraduationCap size={14} className="text-emerald-400" />;
      case "Skills":
        return <Sparkles size={14} className="text-cyan-400" />;
      case "Certifications":
        return <Award size={14} className="text-purple-400" />;
      case "Achievements":
        return <Award size={14} className="text-pink-400" />;
      case "Blog":
        return <BookOpen size={14} className="text-blue-400" />;
      case "Contact":
      default:
        return <Phone size={14} className="text-amber-400" />;
    }
  };

  const handlePhotoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return toast.error("Please select an image file (PNG, JPG, WEBP)");
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const max = 600;
        if (width > height && width > max) {
          height = Math.round((height * max) / width);
          width = max;
        } else if (height > max) {
          width = Math.round((width * max) / height);
          height = max;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setFormData((prev) => ({ ...prev, avatar: dataUrl }));
        onUpdatePortfolio({
          ...portfolioData,
          avatar: dataUrl,
          hero: {
            ...(portfolioData?.hero || {}),
            avatar: dataUrl,
          },
        });
        toast.success("Profile photo uploaded and applied! 📸");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPhoto = (urlToApply) => {
    const val = (urlToApply !== undefined ? urlToApply : formData.avatar).trim();
    onUpdatePortfolio({
      ...portfolioData,
      avatar: val,
      hero: {
        ...(portfolioData?.hero || {}),
        avatar: val,
      },
    });
    setFormData((prev) => ({ ...prev, avatar: val }));
    toast.success(val ? "Profile photo applied! 📸" : "Profile photo removed.");
  };

  // Handlers for Resume Document
  const handleResumeFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isPdfOrDoc =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf") ||
      file.name.toLowerCase().endsWith(".doc") ||
      file.name.toLowerCase().endsWith(".docx");

    if (!isPdfOrDoc) {
      return toast.error("Please select a PDF resume document");
    }
    if (file.size > 10 * 1024 * 1024) {
      return toast.error("Resume file size exceeds 10MB limit");
    }

    setUploadingResume(true);
    toast.loading(`Attaching ${file.name}...`, { id: "resUpload" });

    try {
      if (portfolioData?._id) {
        const data = new FormData();
        data.append("resume", file);
        const res = await uploadPortfolioResume(portfolioData._id, data);
        toast.dismiss("resUpload");
        if (res.data?.success) {
          const url = res.data.resumeUrl;
          const fileName = res.data.resumeName || file.name;
          setFormData((prev) => ({ ...prev, resumeUrl: url, resumeName: fileName }));
          onUpdatePortfolio({
            ...portfolioData,
            resumeUrl: url,
            resumeName: fileName,
          });
          toast.success("Resume attached & live on portfolio! 📄");
          return;
        }
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        toast.dismiss("resUpload");
        setFormData((prev) => ({ ...prev, resumeUrl: dataUrl, resumeName: file.name }));
        onUpdatePortfolio({
          ...portfolioData,
          resumeUrl: dataUrl,
          resumeName: file.name,
        });
        toast.success(`Attached ${file.name}! Visible on portfolio 📄`);
      };
      reader.onerror = () => {
        toast.dismiss("resUpload");
        toast.error("Failed to read resume file");
      };
      reader.readAsDataURL(file);
    } catch {
      toast.dismiss("resUpload");
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setFormData((prev) => ({ ...prev, resumeUrl: dataUrl, resumeName: file.name }));
        onUpdatePortfolio({
          ...portfolioData,
          resumeUrl: dataUrl,
          resumeName: file.name,
        });
        toast.success(`Attached ${file.name}! Visible on portfolio 📄`);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleApplyResumeUrl = (urlToApply) => {
    const finalUrl = (urlToApply !== undefined ? urlToApply : formData.resumeUrl).trim();
    if (!finalUrl) {
      setFormData((prev) => ({ ...prev, resumeUrl: "", resumeName: "" }));
      onUpdatePortfolio({
        ...portfolioData,
        resumeUrl: "",
        resumeName: "",
      });
      toast("Resume removed from portfolio", { icon: "🗑️" });
      return;
    }
    const derivedName =
      formData.resumeName ||
      (portfolioData?.name ? `${portfolioData.name}_Resume.pdf` : "Candidate_Resume.pdf");
    setFormData((prev) => ({ ...prev, resumeUrl: finalUrl, resumeName: derivedName }));
    onUpdatePortfolio({
      ...portfolioData,
      resumeUrl: finalUrl,
      resumeName: derivedName,
    });
    toast.success("Resume document link applied to portfolio! 📄");
  };

  // Handler to apply contact changes
  const handleApplyContact = (e) => {
    e?.preventDefault();
    const updatedContact = {
      ...(portfolioData?.contact || {}),
      email: formData.email.trim() || portfolioData?.contact?.email || "",
      phone: formData.phone.trim() || portfolioData?.contact?.phone || "",
      github: formData.github.trim() || portfolioData?.contact?.github || "",
      linkedin: formData.linkedin.trim() || portfolioData?.contact?.linkedin || "",
      website: formData.website.trim() || portfolioData?.contact?.website || "",
    };

    onUpdatePortfolio({
      ...portfolioData,
      email: updatedContact.email,
      phone: updatedContact.phone,
      github: updatedContact.github,
      linkedin: updatedContact.linkedin,
      website: updatedContact.website,
      contact: updatedContact,
    });

    toast.success("Authentic contact details applied to portfolio! ✨");
  };

  // Handler for uploading PDF files / documents (Offer letters, certificates)
  const handlePdfUpload = (e, fieldType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith(".pdf")) {
      return toast.error("Please upload a PDF document (or image proof)");
    }

    if (file.size > 15 * 1024 * 1024) {
      return toast.error("File is too large (max 15MB)");
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      if (fieldType === "offerLetter") {
        setFormData((prev) => ({
          ...prev,
          expOfferLetterFile: dataUrl,
          expOfferLetterFileName: file.name,
        }));
        toast.success(`Offer letter attached: ${file.name} 📄`);
      } else if (fieldType === "experienceCert") {
        setFormData((prev) => ({
          ...prev,
          expCertificateFile: dataUrl,
          expCertificateFileName: file.name,
        }));
        toast.success(`Completion certificate attached: ${file.name} 📜`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handler to add Experience
  const handleAddExperience = (e) => {
    e?.preventDefault();
    if (!formData.expRole.trim() && !formData.expCompany.trim()) {
      return toast.error("Please enter a role or company name");
    }

    const offerDoc = formData.expOfferLetterFile || formData.expOfferLetterUrl.trim();
    const certDoc = formData.expCertificateFile || formData.expCertificateUrl.trim();

    const newExp = {
      role: formData.expRole.trim() || "Software Engineer",
      company: formData.expCompany.trim() || "Company",
      duration: formData.expDuration.trim() || "2023 - Present",
      location: formData.expLocation?.trim() || "",
      workplaceType: formData.expWorkplaceType || "Virtual / Remote",
      compensation: formData.expCompensation || "Paid",
      compensationAmount: (formData.expCompensation !== "Unpaid" && formData.expCompensationAmount?.trim()) ? formData.expCompensationAmount.trim() : "",
      description: formData.expDescription.trim() || "Delivered scalable solutions and full-stack features.",
      highlights: formData.expDescription.trim() ? [formData.expDescription.trim()] : [],
      projectTitle: formData.expProjectTitle?.trim() || "",
      projectLive: formData.expProjectLive?.trim() || "",
      projectGithub: formData.expProjectGithub?.trim() || "",
      offerLetter: offerDoc || "",
      offerLetterName: formData.expOfferLetterFileName || "",
      certificate: certDoc || "",
      certificateName: formData.expCertificateFileName || "",
    };

    const currentExp = Array.isArray(portfolioData?.experience) ? portfolioData.experience : [];
    const updatedExp = [...currentExp, newExp];

    onUpdatePortfolio({
      ...portfolioData,
      experience: updatedExp,
    });

    setFormData((prev) => ({
      ...prev,
      expRole: "",
      expCompany: "",
      expDuration: "",
      expLocation: "",
      expWorkplaceType: "Virtual / Remote",
      expCompensation: "Paid",
      expCompensationAmount: "",
      expDescription: "",
      expProjectTitle: "",
      expProjectLive: "",
      expProjectGithub: "",
      expOfferLetterUrl: "",
      expOfferLetterFile: null,
      expOfferLetterFileName: "",
      expCertificateUrl: "",
      expCertificateFile: null,
      expCertificateFileName: "",
    }));

    toast.success("Authentic work experience added with credentials! 💼");
  };

  const handleRemoveExperience = (idx) => {
    const currentExp = Array.isArray(portfolioData?.experience) ? portfolioData.experience : [];
    const updatedExp = currentExp.filter((_, i) => i !== idx);
    onUpdatePortfolio({
      ...portfolioData,
      experience: updatedExp,
    });
    toast.success("Experience entry removed");
  };

  // Handler to add Project
  const handleAddProject = (e) => {
    e?.preventDefault();
    if (!formData.projTitle.trim()) {
      return toast.error("Please enter a project title");
    }

    const tags = formData.projTags
      ? formData.projTags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const newProj = {
      title: formData.projTitle.trim(),
      description: formData.projDesc.trim() || "Full-stack software application with modern architecture.",
      tags: tags.length > 0 ? tags : ["React", "JavaScript"],
      github: formData.projGithub.trim() || "",
      live: formData.projLive.trim() || "",
    };

    const currentProj = Array.isArray(portfolioData?.projects) ? portfolioData.projects : [];
    const updatedProj = [...currentProj, newProj];

    onUpdatePortfolio({
      ...portfolioData,
      projects: updatedProj,
    });

    setFormData((prev) => ({
      ...prev,
      projTitle: "",
      projDesc: "",
      projTags: "",
      projGithub: "",
      projLive: "",
    }));

    toast.success("Authentic project added! 🚀");
  };

  const handleRemoveProject = (idx) => {
    const currentProj = Array.isArray(portfolioData?.projects) ? portfolioData.projects : [];
    const updatedProj = currentProj.filter((_, i) => i !== idx);
    onUpdatePortfolio({
      ...portfolioData,
      projects: updatedProj,
    });
    toast.success("Project removed");
  };

  // Handler to add Education
  const handleAddEducation = (e) => {
    e?.preventDefault();
    if (!formData.eduInstitution.trim() && !formData.eduDegree.trim()) {
      return toast.error("Please enter an institution or degree name");
    }

    const newEdu = {
      institution: formData.eduInstitution.trim() || "University",
      degree: formData.eduDegree.trim() || "Bachelor of Science",
      year: formData.eduYear.trim() || "",
      description: formData.eduDescription.trim() || "",
    };

    const currentEdu = Array.isArray(portfolioData?.education) ? portfolioData.education : [];
    const updatedEdu = [...currentEdu, newEdu];

    onUpdatePortfolio({
      ...portfolioData,
      education: updatedEdu,
    });

    setFormData((prev) => ({
      ...prev,
      eduInstitution: "",
      eduDegree: "",
      eduYear: "",
      eduDescription: "",
    }));

    toast.success("Authentic education credential added! 🎓");
  };

  const handleRemoveEducation = (idx) => {
    const currentEdu = Array.isArray(portfolioData?.education) ? portfolioData.education : [];
    const updatedEdu = currentEdu.filter((_, i) => i !== idx);
    onUpdatePortfolio({
      ...portfolioData,
      education: updatedEdu,
    });
    toast.success("Education credential removed");
  };

  // Handler to apply Skills
  const handleApplySkills = (e) => {
    e?.preventDefault();
    const skillsList = formData.skillsInput
      .split(/[,|•]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (skillsList.length === 0) {
      return toast.error("Please enter at least one skill");
    }

    const currentSkills = Array.isArray(portfolioData?.skills) ? portfolioData.skills : [];
    const merged = Array.from(new Set([...currentSkills, ...skillsList]));

    onUpdatePortfolio({
      ...portfolioData,
      skills: merged,
    });

    toast.success(`${merged.length} technical skills applied! ⚡`);
  };

  const handleAddQuickSkill = (skill) => {
    const current = formData.skillsInput ? formData.skillsInput.split(",").map((s) => s.trim()).filter(Boolean) : [];
    if (!current.includes(skill)) {
      const updated = [...current, skill].join(", ");
      setFormData({ ...formData, skillsInput: updated });
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const currentSkills = Array.isArray(portfolioData?.skills) ? portfolioData.skills : [];
    const updated = currentSkills.filter((s) => s.toLowerCase() !== skillToRemove.toLowerCase());
    onUpdatePortfolio({
      ...portfolioData,
      skills: updated,
    });
    setFormData((prev) => ({
      ...prev,
      skillsInput: updated.join(", "),
    }));
    toast.success(`Removed ${skillToRemove}`);
  };

  // Handler to add Certification
  const handleAddCertification = (e) => {
    e?.preventDefault();
    if (!formData.certName.trim()) {
      return toast.error("Please enter a certification or credential name");
    }

    const certLink = formData.certUrl.trim();
    const newCert = {
      name: formData.certName.trim(),
      issuer: formData.certIssuer.trim() || "Certifying Authority",
      date: formData.certDate.trim() || "",
      description: formData.certDescription.trim(),
      url: certLink,
      link: certLink,
    };

    const currentCerts = Array.isArray(portfolioData?.certifications) ? portfolioData.certifications : [];
    const updatedCerts = [...currentCerts, newCert];

    onUpdatePortfolio({
      ...portfolioData,
      certifications: updatedCerts,
    });

    setFormData((prev) => ({
      ...prev,
      certName: "",
      certIssuer: "",
      certDate: "",
      certUrl: "",
      certDescription: "",
    }));

    toast.success("Authentic certification added! 📜");
  };

  const handleRemoveCertification = (idx) => {
    const currentCerts = Array.isArray(portfolioData?.certifications) ? portfolioData.certifications : [];
    const updatedCerts = currentCerts.filter((_, i) => i !== idx);
    onUpdatePortfolio({
      ...portfolioData,
      certifications: updatedCerts,
    });
    toast.success("Certification removed");
  };

  // Handler to add an achievement
  const handleAddAchievement = (e) => {
    e?.preventDefault();
    if (!formData.achievementTitle.trim()) {
      return toast.error("Please enter an achievement title");
    }

    const achLink = formData.achievementLink.trim();
    const newAch = {
      title: formData.achievementTitle.trim(),
      description: formData.achievementDesc.trim(),
      metric: formData.achievementMetric.trim(),
      link: achLink,
      url: achLink,
      date: new Date().getFullYear().toString(),
    };

    const currentAch = Array.isArray(portfolioData?.achievements)
      ? portfolioData.achievements
      : [];
    const updatedAch = [...currentAch, newAch];

    onUpdatePortfolio({
      ...portfolioData,
      achievements: updatedAch,
    });

    setFormData((prev) => ({
      ...prev,
      achievementTitle: "",
      achievementDesc: "",
      achievementMetric: "",
      achievementLink: "",
    }));

    toast.success("Authentic achievement added! 🏆");
  };

  const handleRemoveAchievement = (idx) => {
    const currentAch = Array.isArray(portfolioData?.achievements) ? portfolioData.achievements : [];
    const updatedAch = currentAch.filter((_, i) => i !== idx);
    onUpdatePortfolio({
      ...portfolioData,
      achievements: updatedAch,
    });
    toast.success("Achievement removed");
  };

  // Handler to add a blog/publication
  const handleAddBlog = (e) => {
    e?.preventDefault();
    if (!formData.blogTitle.trim()) {
      return toast.error("Please enter a publication or article title");
    }

    const newPost = {
      title: formData.blogTitle.trim(),
      link: formData.blogLink.trim(),
      excerpt: formData.blogExcerpt.trim(),
      summary: formData.blogExcerpt.trim(),
      readTime: "5 min read",
      date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    };

    const currentBlog = Array.isArray(portfolioData?.blog) ? portfolioData.blog : [];
    const updatedBlog = [...currentBlog, newPost];

    onUpdatePortfolio({
      ...portfolioData,
      blog: updatedBlog,
    });

    setFormData((prev) => ({
      ...prev,
      blogTitle: "",
      blogLink: "",
      blogExcerpt: "",
    }));

    toast.success("Authentic publication added! 📝");
  };

  const handleRemoveBlog = (idx) => {
    const currentBlog = Array.isArray(portfolioData?.blog) ? portfolioData.blog : [];
    const updatedBlog = currentBlog.filter((_, i) => i !== idx);
    onUpdatePortfolio({
      ...portfolioData,
      blog: updatedBlog,
    });
    toast.success("Publication removed");
  };

  const currentExperiences = Array.isArray(portfolioData?.experience) ? portfolioData.experience : [];
  const currentProjects = Array.isArray(portfolioData?.projects) ? portfolioData.projects : [];
  const currentEducation = Array.isArray(portfolioData?.education) ? portfolioData.education : [];
  const currentCertifications = Array.isArray(portfolioData?.certifications) ? portfolioData.certifications : [];
  const currentSkills = Array.isArray(portfolioData?.skills) ? portfolioData.skills : [];
  const currentAchievements = Array.isArray(portfolioData?.achievements) ? portfolioData.achievements : [];
  const currentBlog = Array.isArray(portfolioData?.blog) ? portfolioData.blog : [];

  return (
    <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900/90 to-zinc-950 border-b border-amber-500/30 text-white transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-3.5">
        {/* Banner Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono">
                  Authentic Profile Verification &amp; Edit
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                    safeMissingInfo.length > 0
                      ? "bg-amber-500/20 text-amber-200 border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-200 border-emerald-500/30"
                  }`}
                >
                  {safeMissingInfo.length > 0
                    ? `${safeMissingInfo.length} items not detected`
                    : "All sections authenticated ✨"}
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                Click any section below or select a tab to edit your authentic experience, projects, education, skills, and links.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {portfolioData?._id && (
              <Link
                to={`/portfolio/edit/${portfolioData._id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white transition"
                title="Open full page form editor"
              >
                <span>Full Form Editor</span>
                <ExternalLink size={12} className="text-indigo-400" />
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition cursor-pointer"
            >
              <span>{isExpanded ? "Hide Prompts" : "Review Details"}</span>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                title="Dismiss edit options"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Action Drawer */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-4">
            {/* Quick Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                <AlertCircle size={13} className="text-amber-400" />
                <span>Section Status ({safeMissingInfo.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("photo")}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "photo"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                <Camera size={13} className="text-pink-400" />
                <span>Profile Photo</span>
                {photoMissing && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                )}
                {(portfolioData?.avatar || portfolioData?.hero?.avatar) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("resume")}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "resume"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                <FileText size={13} className="text-emerald-400" />
                <span>Resume Document</span>
                {resumeMissing && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                )}
                {(portfolioData?.resumeUrl || formData.resumeUrl) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("experience")}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "experience"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                <Briefcase size={13} />
                <span>Work Experience</span>
                {experienceMissing && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                )}
                {currentExperiences.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300">
                    {currentExperiences.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("projects")}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "projects"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                <Code2 size={13} />
                <span>Software Projects</span>
                {projectsMissing && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                )}
                {currentProjects.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300">
                    {currentProjects.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("education")}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "education"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                <GraduationCap size={13} />
                <span>Education</span>
                {educationMissing && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                )}
                {currentEducation.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300">
                    {currentEducation.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("skills")}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "skills"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                <Sparkles size={13} />
                <span>Skills</span>
                {skillsMissing && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                )}
                {currentSkills.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300">
                    {currentSkills.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("certifications")}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "certifications"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                <Award size={13} />
                <span>Certifications</span>
                {certsMissing && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                )}
                {currentCertifications.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300">
                    {currentCertifications.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("contact")}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "contact"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                <Phone size={13} />
                <span>Contact Details</span>
                {contactMissing.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("achievements")}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "achievements"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                <Award size={13} />
                <span>Achievements</span>
                {achievementsMissing && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                )}
                {currentAchievements.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300">
                    {currentAchievements.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("blog")}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "blog"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                <BookOpen size={13} />
                <span>Publications / Blog</span>
                {blogMissing && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                )}
                {currentBlog.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300">
                    {currentBlog.length}
                  </span>
                )}
              </button>
            </div>

            {/* TAB: SECTION OVERVIEW */}
            {activeTab === "overview" && (
              <div className="bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 text-zinc-300 pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} className="text-amber-400 shrink-0" />
                    <span className="font-semibold text-zinc-200">
                      Select any card below to quickly add and authenticate your details:
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {safeMissingInfo.length} section{safeMissingInfo.length > 1 ? "s" : ""} require attention
                  </span>
                </div>

                {safeMissingInfo.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-zinc-900/60 border border-emerald-500/30 text-zinc-300 space-y-2">
                    <CheckCircle2 size={28} className="mx-auto text-emerald-400" />
                    <p className="font-bold text-white text-sm">All profile sections are completed &amp; authenticated! ✨</p>
                    <p className="text-xs text-zinc-400">
                      Select any tab above to update specific details (Projects, Experience, Skills, Photo, etc.), or use the Full Form Editor.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {safeMissingInfo.map((item, idx) => {
                      const targetTab = getTabForSection(item.section);
                      return (
                        <div
                          key={idx}
                          onClick={() => setActiveTab(targetTab)}
                          className="p-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-amber-500/50 transition cursor-pointer flex flex-col justify-between gap-3 group shadow-sm hover:shadow-amber-500/10"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 font-bold text-white group-hover:text-amber-300 transition">
                                {getSectionIcon(item.section)}
                                <span>{item.label}</span>
                              </div>
                              <span
                                className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                                  item.priority === "recommended"
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                    : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                                }`}
                              >
                                {item.priority}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 pt-1.5 leading-relaxed">
                              {item.message}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTab(targetTab);
                            }}
                            className="w-full py-1.5 px-3 rounded-lg bg-amber-500/15 group-hover:bg-amber-500 text-amber-300 group-hover:text-zinc-950 border border-amber-500/30 group-hover:border-amber-500 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Plus size={13} />
                            <span>Add {item.label.split(" ")[0]} Details →</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: PROFILE PHOTO */}
            {activeTab === "photo" && (
              <div className="bg-zinc-950/70 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <Camera size={16} className="text-pink-400" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Profile Portrait &amp; Photo</h4>
                      <p className="text-[11px] text-zinc-400">
                        Upload a photo from your computer or paste an image link to personalize this portfolio.
                      </p>
                    </div>
                  </div>
                  {formData.avatar && (
                    <button
                      type="button"
                      onClick={() => handleApplyPhoto("")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition cursor-pointer"
                    >
                      <Trash2 size={12} />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* Left: Avatar Preview */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-center space-y-3">
                    <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 shadow-xl shrink-0">
                      <div className="w-full h-full rounded-full bg-zinc-950 overflow-hidden flex items-center justify-center">
                        {formData.avatar ? (
                          <img
                            src={formData.avatar}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              if (e.currentTarget.nextElementSibling) {
                                e.currentTarget.nextElementSibling.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-full items-center justify-center bg-gradient-to-br from-indigo-900/80 to-purple-900/80 text-white font-black text-2xl ${
                            formData.avatar ? "hidden" : "flex"
                          }`}
                        >
                          {(portfolioData?.name || portfolioData?.hero?.name || "D")
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-white text-xs">
                        {portfolioData?.name || portfolioData?.hero?.name || "Candidate"}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {formData.avatar ? "Custom photo active" : "Using fallback initials"}
                      </p>
                    </div>
                  </div>

                  {/* Right: Upload controls */}
                  <div className="md:col-span-8 space-y-4">
                    {/* Method 1: Local file upload */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                        <Upload size={12} className="text-pink-400" />
                        <span>Upload Image File from Device</span>
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="file"
                          ref={photoInputRef}
                          onChange={handlePhotoFileUpload}
                          accept="image/png,image/jpeg,image/webp,image/jpg"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md shadow-pink-600/20"
                        >
                          <Upload size={13} />
                          <span>Choose Image (PNG, JPG, WEBP)</span>
                        </button>
                        <span className="text-[11px] text-zinc-500">Auto-compressed &amp; saved locally</span>
                      </div>
                    </div>

                    {/* Method 2: Public image URL */}
                    <div className="space-y-1.5 pt-2 border-t border-zinc-850">
                      <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                        <Globe size={12} className="text-indigo-400" />
                        <span>Or Paste Public Image URL</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={formData.avatar}
                          onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                          placeholder="https://example.com/headshot.jpg"
                          className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none font-mono text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyPhoto()}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer shadow flex items-center gap-1"
                        >
                          <CheckCircle2 size={13} />
                          <span>Apply</span>
                        </button>
                      </div>
                    </div>

                    {/* Preset Avatars */}
                    <div className="space-y-1.5 pt-2 border-t border-zinc-850">
                      <label className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                        <Sparkles size={12} className="text-amber-400" />
                        <span>Quick Professional Presets:</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { name: "Minimal Tech", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" },
                          { name: "Executive", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" },
                          { name: "Engineering", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80" },
                          { name: "Architect", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80" },
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleApplyPhoto(preset.url)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-pink-500/40 text-[11px] text-zinc-300 hover:text-white transition cursor-pointer"
                          >
                            <img src={preset.url} alt={preset.name} className="w-4 h-4 rounded-full object-cover" />
                            <span>{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ATTACH RESUME / CV DOCUMENT */}
            {activeTab === "resume" && (
              <div className="bg-zinc-950/70 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-emerald-400" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Attach Resume / CV Document</h4>
                      <p className="text-[11px] text-zinc-400">
                        Attach a PDF resume so visitors, recruiters, and clients can view and download it directly from your portfolio.
                      </p>
                    </div>
                  </div>
                  {(formData.resumeUrl || portfolioData?.resumeUrl) && (
                    <button
                      type="button"
                      onClick={() => handleApplyResumeUrl("")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition cursor-pointer"
                    >
                      <Trash2 size={12} />
                      <span>Remove Resume</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* Left: Resume Document Preview Card */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-zinc-900 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center shadow-lg text-emerald-400">
                      <FileText size={32} />
                    </div>

                    <div>
                      <p className="font-bold text-white text-xs truncate max-w-[220px]">
                        {formData.resumeName || portfolioData?.resumeName || (formData.resumeUrl ? "Attached_Resume.pdf" : "No Resume Attached")}
                      </p>
                      <p className="text-[10px] text-zinc-400 pt-0.5">
                        {formData.resumeUrl || portfolioData?.resumeUrl ? (
                          <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Live &amp; Visible on Portfolio
                          </span>
                        ) : (
                          "Awaiting PDF upload or URL link"
                        )}
                      </p>
                    </div>

                    {(formData.resumeUrl || portfolioData?.resumeUrl) && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const url = formData.resumeUrl || portfolioData?.resumeUrl;
                            if (url.startsWith("data:")) {
                              setViewingDoc({
                                title: formData.resumeName || "Resume.pdf",
                                url: url,
                                type: "pdf",
                              });
                            } else {
                              window.open(url, "_blank", "noopener,noreferrer");
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer border border-zinc-700"
                        >
                          <Eye size={12} />
                          <span>Preview Document</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right: Upload controls */}
                  <div className="md:col-span-8 space-y-4">
                    {/* Method 1: Local file upload */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                        <Upload size={12} className="text-emerald-400" />
                        <span>Upload PDF Resume Document from Device</span>
                      </label>
                      <div className="flex flex-wrap gap-2 items-center">
                        <input
                          type="file"
                          ref={resumeInputRef}
                          onChange={handleResumeFileUpload}
                          accept="application/pdf,.doc,.docx"
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={uploadingResume}
                          onClick={() => resumeInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md shadow-emerald-600/20"
                        >
                          <Upload size={13} />
                          <span>{uploadingResume ? "Uploading..." : "Choose Resume (PDF)"}</span>
                        </button>
                        <span className="text-[11px] text-zinc-500">
                          Auto-saved to portfolio • Max 10MB
                        </span>
                      </div>
                    </div>

                    {/* Method 2: Public resume URL */}
                    <div className="space-y-1.5 pt-2 border-t border-zinc-850">
                      <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                        <Globe size={12} className="text-teal-400" />
                        <span>Or Paste Public Resume Link (Google Drive, Cloud Storage, or Web PDF)</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={formData.resumeUrl && !formData.resumeUrl.startsWith("data:") ? formData.resumeUrl : ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, resumeUrl: e.target.value }))}
                          placeholder="https://drive.google.com/... or https://yourdomain.com/resume.pdf"
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyResumeUrl()}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shrink-0 shadow-md shadow-emerald-600/20"
                        >
                          Apply Link
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: WORK EXPERIENCE */}
            {activeTab === "experience" && (
              <div className="bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800 space-y-4 text-xs">
                {currentExperiences.length > 0 && (
                  <div className="space-y-2 pb-3 border-b border-zinc-800">
                    <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px] font-mono">
                      Current Work Experience ({currentExperiences.length})
                    </span>
                    <div className="space-y-2">
                      {currentExperiences.map((exp, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800"
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-white text-sm">
                                {exp.role || "Role"} <span className="text-amber-400">@</span> {exp.company || "Company"}
                              </span>
                              {exp.duration && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                                  {exp.duration}
                                </span>
                              )}
                            </div>

                            {/* Metadata Badges: Location, Workplace, Compensation */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {exp.location && (
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 font-mono">
                                  <MapPin size={10} className="text-cyan-400" />
                                  <span>{exp.location}</span>
                                </span>
                              )}
                              {exp.workplaceType && (
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono">
                                  <Building2 size={9} />
                                  <span>{exp.workplaceType}</span>
                                </span>
                              )}
                              {exp.compensation && (
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                                  <DollarSign size={9} />
                                  <span>
                                    {exp.compensation}
                                    {exp.compensationAmount ? ` · ${exp.compensationAmount}` : ""}
                                  </span>
                                </span>
                              )}
                            </div>

                            {exp.description && (
                              <p className="text-[11px] text-zinc-300 pt-0.5 leading-relaxed">{exp.description}</p>
                            )}

                            {/* Project Carried Out Under Company */}
                            {(exp.projectTitle || exp.projectLive || exp.projectGithub) && (
                              <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-zinc-950/70 border border-zinc-800 text-[11px]">
                                <div className="flex items-center gap-1.5 font-medium min-w-0">
                                  <Code2 size={11} className="text-cyan-400 shrink-0" />
                                  <span className="text-zinc-400">Project:</span>
                                  <span className="text-white font-semibold truncate">{exp.projectTitle || "Key Deliverable"}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {exp.projectLive && (
                                    <a
                                      href={exp.projectLive.startsWith("http") ? exp.projectLive : `https://${exp.projectLive}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold"
                                    >
                                      <span>Live</span>
                                      <ExternalLink size={9} />
                                    </a>
                                  )}
                                  {exp.projectGithub && (
                                    <a
                                      href={exp.projectGithub.startsWith("http") ? exp.projectGithub : `https://${exp.projectGithub}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-[10px] font-semibold"
                                    >
                                      <FaGithub size={10} />
                                      <span>GitHub</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* View Document Buttons: Certificate & Offer Letter */}
                            {(exp.certificate || exp.offerLetter) && (
                              <div className="flex items-center gap-2 pt-1 flex-wrap">
                                {exp.certificate && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setViewingDoc({
                                        title: "Completion Certificate",
                                        company: exp.company,
                                        role: exp.role,
                                        url: exp.certificate,
                                        type: "certificate",
                                        fileName: exp.certificateName,
                                      })
                                    }
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold transition cursor-pointer shadow-sm"
                                    title="View Completion Certificate"
                                  >
                                    <Award size={12} className="text-amber-400" />
                                    <span>View Completion Certificate</span>
                                    <Eye size={11} />
                                  </button>
                                )}

                                {exp.offerLetter && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setViewingDoc({
                                        title: "Offer Letter",
                                        company: exp.company,
                                        role: exp.role,
                                        url: exp.offerLetter,
                                        type: "offerLetter",
                                        fileName: exp.offerLetterName,
                                      })
                                    }
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold transition cursor-pointer shadow-sm"
                                    title="View Offer Letter"
                                  >
                                    <FileText size={12} className="text-emerald-400" />
                                    <span>View Offer Letter</span>
                                    <Eye size={11} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveExperience(idx)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer shrink-0"
                            title="Remove this experience"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleAddExperience} className="space-y-3.5">
                  <span className="text-zinc-200 font-bold flex items-center gap-1.5 text-xs">
                    <Plus size={14} className="text-amber-400" />
                    <span>Add New Work Experience / Internship</span>
                  </span>

                  {/* Row 1: Title, Company, Duration */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-zinc-400">Job Title / Role</label>
                      <input
                        type="text"
                        value={formData.expRole}
                        onChange={(e) => setFormData({ ...formData, expRole: e.target.value })}
                        placeholder="e.g. Software Engineer / SDE Intern"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400">Company / Organization</label>
                      <input
                        type="text"
                        value={formData.expCompany}
                        onChange={(e) => setFormData({ ...formData, expCompany: e.target.value })}
                        placeholder="e.g. Google / Microsoft / TechCorp"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400">Tenure / Duration</label>
                      <input
                        type="text"
                        value={formData.expDuration}
                        onChange={(e) => setFormData({ ...formData, expDuration: e.target.value })}
                        placeholder="e.g. Jan 2023 - Present"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 2: Location, Virtual or On-Site, Paid or Unpaid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-zinc-400 flex items-center gap-1">
                        <MapPin size={11} className="text-cyan-400" />
                        <span>Company Location</span>
                      </label>
                      <input
                        type="text"
                        value={formData.expLocation}
                        onChange={(e) => setFormData({ ...formData, expLocation: e.target.value })}
                        placeholder="e.g. Bengaluru, India or Remote HQ"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 flex items-center gap-1">
                        <Building2 size={11} className="text-purple-400" />
                        <span>Virtual or On-Site</span>
                      </label>
                      <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
                        {[
                          { id: "Virtual / Remote", label: "Virtual" },
                          { id: "On-site", label: "On-site" },
                          { id: "Hybrid", label: "Hybrid" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, expWorkplaceType: item.id })}
                            className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold transition cursor-pointer text-center ${
                              formData.expWorkplaceType === item.id
                                ? "bg-purple-600 text-white shadow"
                                : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 flex items-center gap-1">
                        <DollarSign size={11} className="text-emerald-400" />
                        <span>Paid or Unpaid</span>
                      </label>
                      <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
                        {[
                          { id: "Paid", label: "Paid" },
                          { id: "Unpaid", label: "Unpaid" },
                          { id: "Stipend", label: "Stipend" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, expCompensation: item.id })}
                            className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold transition cursor-pointer text-center ${
                              formData.expCompensation === item.id
                                ? "bg-emerald-600 text-white shadow"
                                : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Conditional Stipend / Salary Amount Input */}
                  {formData.expCompensation !== "Unpaid" && (
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-emerald-400 font-semibold flex items-center gap-1.5 text-xs">
                          <DollarSign size={13} />
                          <span>
                            {formData.expCompensation === "Stipend"
                              ? "Stipend Amount (e.g. per month or total)"
                              : "Compensation / Salary Package"}
                          </span>
                        </label>
                        <span className="text-[10px] text-zinc-500 font-mono">Optional</span>
                      </div>
                      <input
                        type="text"
                        value={formData.expCompensationAmount}
                        onChange={(e) => setFormData({ ...formData, expCompensationAmount: e.target.value })}
                        placeholder={
                          formData.expCompensation === "Stipend"
                            ? "e.g. ₹25,000 / month or $1,500 / mo"
                            : "e.g. ₹12 LPA or $95,000 / year"
                        }
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none text-xs"
                      />
                    </div>
                  )}

                  {/* Row 3: Key Contributions */}
                  <div className="space-y-1">
                    <label className="text-zinc-400">Key Contributions & Impact (Optional)</label>
                    <input
                      type="text"
                      value={formData.expDescription}
                      onChange={(e) => setFormData({ ...formData, expDescription: e.target.value })}
                      placeholder="Architected REST APIs, scaled microservices, and reduced latency by 35%..."
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>

                  {/* Row 3b: Project Carried Out Under Company */}
                  <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-zinc-200 font-semibold flex items-center gap-1.5 text-xs">
                        <Code2 size={13} className="text-cyan-400" />
                        <span>Project Carried Out Under This Company (Optional)</span>
                      </label>
                      <span className="text-[10px] text-zinc-500 font-mono">Optional</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Did you build or contribute to a specific product or deliverable? Enter its name and links:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-zinc-400 text-[11px]">Project Name / Title</label>
                        <input
                          type="text"
                          value={formData.expProjectTitle}
                          onChange={(e) => setFormData({ ...formData, expProjectTitle: e.target.value })}
                          placeholder="e.g. Checkout & Payments Engine"
                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-zinc-400 text-[11px] flex items-center gap-1">
                          <ExternalLink size={10} className="text-cyan-400" />
                          <span>Live Product / Demo URL</span>
                        </label>
                        <input
                          type="url"
                          value={formData.expProjectLive}
                          onChange={(e) => setFormData({ ...formData, expProjectLive: e.target.value })}
                          placeholder="https://app.company.com"
                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-zinc-400 text-[11px] flex items-center gap-1">
                          <FaGithub size={11} className="text-zinc-300" />
                          <span>GitHub / Source URL</span>
                        </label>
                        <input
                          type="url"
                          value={formData.expProjectGithub}
                          onChange={(e) => setFormData({ ...formData, expProjectGithub: e.target.value })}
                          placeholder="https://github.com/company/repo"
                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Offer Letter and Completion Certificate Upload (PDF or URL) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-zinc-850">
                    {/* Offer Letter Section */}
                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-zinc-200 font-semibold flex items-center gap-1.5">
                          <FileText size={13} className="text-emerald-400" />
                          <span>Offer Letter (PDF or URL)</span>
                        </label>
                        <span className="text-[10px] text-zinc-500 font-mono">Optional</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Paste a public/Google Drive link or upload your official offer letter PDF.
                      </p>
                      <div className="space-y-2">
                        <input
                          type="url"
                          value={formData.expOfferLetterUrl}
                          onChange={(e) => setFormData({ ...formData, expOfferLetterUrl: e.target.value })}
                          placeholder="Paste URL (e.g. Google Drive / doc link)"
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                        />
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            type="file"
                            id="offerLetterUploadInput"
                            accept="application/pdf,.pdf,image/*"
                            onChange={(e) => handlePdfUpload(e, "offerLetter")}
                            className="hidden"
                          />
                          <label
                            htmlFor="offerLetterUploadInput"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-[11px] font-semibold transition cursor-pointer"
                          >
                            <Upload size={11} className="text-emerald-400" />
                            <span>{formData.expOfferLetterFileName ? "Change PDF" : "Upload PDF"}</span>
                          </label>
                          {formData.expOfferLetterFileName && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
                              <FileText size={11} />
                              <span className="max-w-[150px] truncate">{formData.expOfferLetterFileName}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    expOfferLetterFile: null,
                                    expOfferLetterFileName: "",
                                  }))
                                }
                                className="text-emerald-400 hover:text-red-400 transition ml-1 cursor-pointer"
                                title="Remove uploaded PDF"
                              >
                                <X size={11} />
                              </button>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Completion Certificate Section */}
                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-zinc-200 font-semibold flex items-center gap-1.5">
                          <Award size={13} className="text-amber-400" />
                          <span>Completion Certificate (PDF or URL)</span>
                        </label>
                        <span className="text-[10px] text-zinc-500 font-mono">Optional</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Paste a certificate URL or upload your completion / relieving certificate PDF.
                      </p>
                      <div className="space-y-2">
                        <input
                          type="url"
                          value={formData.expCertificateUrl}
                          onChange={(e) => setFormData({ ...formData, expCertificateUrl: e.target.value })}
                          placeholder="Paste URL (e.g. Google Drive / certificate link)"
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                        />
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            type="file"
                            id="expCertUploadInput"
                            accept="application/pdf,.pdf,image/*"
                            onChange={(e) => handlePdfUpload(e, "experienceCert")}
                            className="hidden"
                          />
                          <label
                            htmlFor="expCertUploadInput"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-[11px] font-semibold transition cursor-pointer"
                          >
                            <Upload size={11} className="text-amber-400" />
                            <span>{formData.expCertificateFileName ? "Change PDF" : "Upload PDF"}</span>
                          </label>
                          {formData.expCertificateFileName && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono">
                              <Award size={11} />
                              <span className="max-w-[150px] truncate">{formData.expCertificateFileName}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    expCertificateFile: null,
                                    expCertificateFileName: "",
                                  }))
                                }
                                className="text-amber-400 hover:text-red-400 transition ml-1 cursor-pointer"
                                title="Remove uploaded PDF"
                              >
                                <X size={11} />
                              </button>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition cursor-pointer shrink-0 shadow flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Add Experience</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: SOFTWARE PROJECTS */}
            {activeTab === "projects" && (
              <div className="bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800 space-y-4 text-xs">
                {currentProjects.length > 0 && (
                  <div className="space-y-2 pb-3 border-b border-zinc-800">
                    <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px] font-mono">
                      Current Software Projects ({currentProjects.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentProjects.map((proj, idx) => {
                        const liveUrl = proj.live || proj.url || proj.link;
                        const githubUrl = proj.github;
                        return (
                          <div
                            key={idx}
                            className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-white">{proj.title || "Project"}</span>
                                {liveUrl && (
                                  <a
                                    href={liveUrl.startsWith("http") ? liveUrl : `https://${liveUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 transition"
                                    title="Open live link"
                                  >
                                    <ExternalLink size={10} />
                                    <span>Live Demo</span>
                                  </a>
                                )}
                                {githubUrl && (
                                  <a
                                    href={githubUrl.startsWith("http") ? githubUrl : `https://${githubUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition"
                                    title="Open GitHub repo"
                                  >
                                    <FaGithub size={10} />
                                    <span>GitHub</span>
                                  </a>
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-400 pt-0.5 line-clamp-2">{proj.description}</p>
                              {proj.tags && proj.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1.5">
                                  {proj.tags.slice(0, 4).map((tag, tIdx) => (
                                    <span
                                      key={tIdx}
                                      className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveProject(idx)}
                              className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer shrink-0"
                              title="Remove this project"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <form onSubmit={handleAddProject} className="space-y-3">
                  <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                    <Plus size={13} className="text-amber-400" />
                    <span>Add New Software Project</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-zinc-400">Project Title</label>
                      <input
                        type="text"
                        value={formData.projTitle}
                        onChange={(e) => setFormData({ ...formData, projTitle: e.target.value })}
                        placeholder="e.g. Distributed Task Orchestrator"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400">Tech Stack (Comma-separated)</label>
                      <input
                        type="text"
                        value={formData.projTags}
                        onChange={(e) => setFormData({ ...formData, projTags: e.target.value })}
                        placeholder="React, TypeScript, Node.js, Redis"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400">GitHub URL (Optional)</label>
                      <input
                        type="url"
                        value={formData.projGithub}
                        onChange={(e) => setFormData({ ...formData, projGithub: e.target.value })}
                        placeholder="https://github.com/user/project"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400">Live Demo URL (Optional)</label>
                      <input
                        type="url"
                        value={formData.projLive}
                        onChange={(e) => setFormData({ ...formData, projLive: e.target.value })}
                        placeholder="https://myproject.com or https://demo.app"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400">Project Overview & Results</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.projDesc}
                        onChange={(e) => setFormData({ ...formData, projDesc: e.target.value })}
                        placeholder="Built a fault-tolerant job queue system with real-time WebSocket telemetry..."
                        className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition cursor-pointer shrink-0 shadow flex items-center gap-1.5"
                      >
                        <Plus size={14} />
                        <span>Add Project</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: EDUCATION */}
            {activeTab === "education" && (
              <div className="bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800 space-y-4 text-xs">
                {currentEducation.length > 0 && (
                  <div className="space-y-2 pb-3 border-b border-zinc-800">
                    <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px] font-mono">
                      Current Educational Qualifications ({currentEducation.length})
                    </span>
                    <div className="space-y-2">
                      {currentEducation.map((edu, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800"
                        >
                          <div>
                            <div className="font-semibold text-white">
                              {edu.degree || "Degree"} <span className="text-amber-400">—</span> {edu.institution || "Institution"}
                            </div>
                            <div className="text-[11px] text-zinc-400">{edu.year}</div>
                            {edu.description && (
                              <p className="text-[11px] text-zinc-300 pt-0.5">{edu.description}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveEducation(idx)}
                            className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer"
                            title="Remove this credential"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleAddEducation} className="space-y-3">
                  <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                    <Plus size={13} className="text-amber-400" />
                    <span>Add New Degree / University</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-zinc-400">Institution / University</label>
                      <input
                        type="text"
                        value={formData.eduInstitution}
                        onChange={(e) => setFormData({ ...formData, eduInstitution: e.target.value })}
                        placeholder="e.g. University of California, Berkeley"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400">Degree / Major</label>
                      <input
                        type="text"
                        value={formData.eduDegree}
                        onChange={(e) => setFormData({ ...formData, eduDegree: e.target.value })}
                        placeholder="e.g. B.S. in Computer Science"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400">Graduation Year</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.eduYear}
                          onChange={(e) => setFormData({ ...formData, eduYear: e.target.value })}
                          placeholder="e.g. 2024"
                          className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition cursor-pointer shrink-0 shadow flex items-center gap-1"
                        >
                          <Plus size={13} />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: SKILLS */}
            {activeTab === "skills" && (
              <div className="bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800 space-y-4 text-xs">
                {currentSkills.length > 0 && (
                  <div className="space-y-2 pb-3 border-b border-zinc-800">
                    <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px] font-mono">
                      Currently Authenticated Skills ({currentSkills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-zinc-500 hover:text-red-400 transition cursor-pointer"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleApplySkills} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-zinc-400">Technical Skills (Comma-separated)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.skillsInput}
                        onChange={(e) => setFormData({ ...formData, skillsInput: e.target.value })}
                        placeholder="React, TypeScript, Node.js, Python, AWS, Docker, PostgreSQL, GraphQL"
                        className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition cursor-pointer shrink-0 shadow"
                      >
                        Save Skills
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-zinc-400 font-mono">Quick Suggestions:</span>
                    {[
                      "TypeScript",
                      "React",
                      "Node.js",
                      "Next.js",
                      "Python",
                      "AWS",
                      "Docker",
                      "PostgreSQL",
                      "GraphQL",
                      "Tailwind CSS",
                      "Kubernetes",
                      "Go",
                    ].map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleAddQuickSkill(skill)}
                        className="px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-mono text-zinc-300 hover:text-white transition cursor-pointer"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </form>
              </div>
            )}

            {/* TAB: CERTIFICATIONS */}
            {activeTab === "certifications" && (
              <div className="bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800 space-y-4 text-xs">
                {currentCertifications.length > 0 && (
                  <div className="space-y-2 pb-3 border-b border-zinc-800">
                    <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px] font-mono">
                      Current Certifications & Licenses ({currentCertifications.length})
                    </span>
                    <div className="space-y-2">
                      {currentCertifications.map((cert, idx) => {
                        const certUrl = cert.link || cert.url;
                        return (
                          <div
                            key={idx}
                            className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800"
                          >
                            <div className="space-y-0.5">
                              <div className="font-semibold text-white">{cert.name}</div>
                              <div className="text-[11px] text-zinc-400">
                                {cert.issuer} {cert.date ? `• ${cert.date}` : ""}
                              </div>
                              {cert.description && (
                                <p className="text-[11px] text-zinc-300 pt-0.5">{cert.description}</p>
                              )}
                              {certUrl && (
                                <a
                                  href={certUrl.startsWith("http") ? certUrl : `https://${certUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 pt-0.5"
                                >
                                  <span>{certUrl}</span>
                                  <ExternalLink size={10} />
                                </a>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCertification(idx)}
                              className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer shrink-0"
                              title="Remove this certification"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <form onSubmit={handleAddCertification} className="space-y-3">
                  <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                    <Plus size={13} className="text-amber-400" />
                    <span>Add New Certification or Professional License</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-zinc-400">Certification Name</label>
                      <input
                        type="text"
                        value={formData.certName}
                        onChange={(e) => setFormData({ ...formData, certName: e.target.value })}
                        placeholder="e.g. AWS Certified Solutions Architect – Associate"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400">Issuing Body</label>
                      <input
                        type="text"
                        value={formData.certIssuer}
                        onChange={(e) => setFormData({ ...formData, certIssuer: e.target.value })}
                        placeholder="e.g. Amazon Web Services (AWS)"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-zinc-400">Year / Date</label>
                      <input
                        type="text"
                        value={formData.certDate}
                        onChange={(e) => setFormData({ ...formData, certDate: e.target.value })}
                        placeholder="e.g. 2023"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-zinc-400">Credential URL / Certificate Link</label>
                      <input
                        type="url"
                        value={formData.certUrl}
                        onChange={(e) => setFormData({ ...formData, certUrl: e.target.value })}
                        placeholder="e.g. https://www.credly.com/badges/..."
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400">Description (Optional)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.certDescription}
                        onChange={(e) => setFormData({ ...formData, certDescription: e.target.value })}
                        placeholder="Brief overview of skills validated or credential ID..."
                        className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition cursor-pointer shrink-0 shadow flex items-center gap-1"
                      >
                        <Plus size={13} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: CONTACT DETAILS */}
            {activeTab === "contact" && (
              <form
                onSubmit={handleApplyContact}
                className="bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs"
              >
                <div className="space-y-1">
                  <label className="text-zinc-400 flex items-center gap-1 font-medium">
                    <Phone size={12} className="text-amber-400" />
                    <span>Phone Number</span>
                    {!portfolioData?.contact?.phone && (
                      <span className="text-[10px] text-amber-400 font-mono">(Missing)</span>
                    )}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 flex items-center gap-1 font-medium">
                    <FaLinkedin size={12} className="text-sky-400" />
                    <span>LinkedIn URL</span>
                    {!portfolioData?.contact?.linkedin && (
                      <span className="text-[10px] text-amber-400 font-mono">(Missing)</span>
                    )}
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 flex items-center gap-1 font-medium">
                    <FaGithub size={12} className="text-zinc-300" />
                    <span>GitHub Profile</span>
                    {!portfolioData?.contact?.github && (
                      <span className="text-[10px] text-amber-400 font-mono">(Missing)</span>
                    )}
                  </label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 flex items-center gap-1 font-medium">
                    <Globe size={12} className="text-emerald-400" />
                    <span>Portfolio Website</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://yourportfolio.dev"
                      className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition cursor-pointer shrink-0 shadow"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* TAB: ACHIEVEMENTS */}
            {activeTab === "achievements" && (
              <div className="bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800 space-y-4 text-xs">
                {currentAchievements.length > 0 && (
                  <div className="space-y-2 pb-3 border-b border-zinc-800">
                    <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px] font-mono">
                      Current Achievements & Awards ({currentAchievements.length})
                    </span>
                    <div className="space-y-2">
                      {currentAchievements.map((ach, idx) => {
                        const achLink = ach.link || ach.url;
                        return (
                          <div
                            key={idx}
                            className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800"
                          >
                            <div className="space-y-0.5">
                              <div className="font-semibold text-white">
                                {ach.title} {ach.metric ? `(${ach.metric})` : ""}
                              </div>
                              {ach.description && (
                                <p className="text-[11px] text-zinc-300 pt-0.5">{ach.description}</p>
                              )}
                              {achLink && (
                                <a
                                  href={achLink.startsWith("http") ? achLink : `https://${achLink}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 pt-0.5"
                                >
                                  <span>{achLink}</span>
                                  <ExternalLink size={10} />
                                </a>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveAchievement(idx)}
                              className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer shrink-0"
                              title="Remove this achievement"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <form onSubmit={handleAddAchievement} className="space-y-3">
                  <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                    <Plus size={13} className="text-amber-400" />
                    <span>Add New Award, Hackathon Win, or Honor</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-zinc-400">Award / Honor Title</label>
                      <input
                        type="text"
                        value={formData.achievementTitle}
                        onChange={(e) =>
                          setFormData({ ...formData, achievementTitle: e.target.value })
                        }
                        placeholder="e.g. 1st Place - University Hackathon"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400">Metric / Rank (Optional)</label>
                      <input
                        type="text"
                        value={formData.achievementMetric}
                        onChange={(e) =>
                          setFormData({ ...formData, achievementMetric: e.target.value })
                        }
                        placeholder="e.g. 1st / 120 Teams"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-zinc-400">Verification / Certificate Link (Optional)</label>
                      <input
                        type="url"
                        value={formData.achievementLink}
                        onChange={(e) =>
                          setFormData({ ...formData, achievementLink: e.target.value })
                        }
                        placeholder="e.g. https://devpost.com/software/..."
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400">Description / Summary (Optional)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.achievementDesc}
                          onChange={(e) =>
                            setFormData({ ...formData, achievementDesc: e.target.value })
                          }
                          placeholder="Built an automated accessibility scanner..."
                          className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition cursor-pointer shrink-0 shadow flex items-center gap-1"
                        >
                          <Plus size={13} />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: PUBLICATIONS / BLOG */}
            {activeTab === "blog" && (
              <div className="bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800 space-y-4 text-xs">
                {currentBlog.length > 0 && (
                  <div className="space-y-2 pb-3 border-b border-zinc-800">
                    <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px] font-mono">
                      Current Publications & Articles ({currentBlog.length})
                    </span>
                    <div className="space-y-2">
                      {currentBlog.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800"
                        >
                          <div>
                            <div className="font-semibold text-white">{item.title}</div>
                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                              >
                                <span>{item.link}</span>
                                <ExternalLink size={10} />
                              </a>
                            )}
                            {item.excerpt && (
                              <p className="text-[11px] text-zinc-300 pt-0.5">{item.excerpt}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveBlog(idx)}
                            className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer"
                            title="Remove this publication"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleAddBlog} className="space-y-3">
                  <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                    <Plus size={13} className="text-amber-400" />
                    <span>Add New Technical Article or Research Paper</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-zinc-400">Article Title</label>
                      <input
                        type="text"
                        value={formData.blogTitle}
                        onChange={(e) => setFormData({ ...formData, blogTitle: e.target.value })}
                        placeholder="e.g. Optimizing React 19 Hydration"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400">Link URL (Optional)</label>
                      <input
                        type="url"
                        value={formData.blogLink}
                        onChange={(e) => setFormData({ ...formData, blogLink: e.target.value })}
                        placeholder="https://medium.com/@username/article"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-1">
                      <label className="text-zinc-400">Excerpt / Takeaway</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.blogExcerpt}
                          onChange={(e) =>
                            setFormData({ ...formData, blogExcerpt: e.target.value })
                          }
                          placeholder="Deep dive into render cycles and state sync..."
                          className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition cursor-pointer shrink-0 shadow flex items-center gap-1"
                        >
                          <Plus size={13} />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Viewer Modal for Experience & Certificate Credentials */}
      <DocumentViewerModal
        doc={viewingDoc}
        onClose={() => setViewingDoc(null)}
      />
    </div>
  );
};

export default MissingInfoPrompt;
