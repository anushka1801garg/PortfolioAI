import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Camera,
  Upload,
  FileText,
  Briefcase,
  Code2,
  GraduationCap,
  Award,
  BookOpen,
  Globe,
  Phone,
  ShieldCheck,
  Sparkles,
  Eye,
  Sliders,
} from 'lucide-react';
import { FaGithub, FaLinkedin } from "react-icons/fa";

import {
  fetchPortfolioById,
  updatePortfolio,
  uploadPortfolioAvatar,
  uploadPortfolioResume,
} from "../../../redux/portfolio/portfolioSlice";
import MissingInfoPrompt from "../components/MissingInfoPrompt";
import {
  detectPortfolioMissingInfo,
  filterStillMissing,
} from "../utils/missingInfoUtils";
import { DocumentViewerModal } from "../components/templates/motionComponents";

const EditPortfolioPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { portfolios, currentPortfolio, loading } = useSelector(
    (state) => state.portfolio,
  );

  const existing =
    portfolios.find((p) => p._id === id) ||
    (currentPortfolio?._id === id ? currentPortfolio : null);

  const resumeInputRef = useRef(null);
  const photoInputRef = useRef(null);

  const [missingInfo, setMissingInfo] = useState([]);
  const [showVerificationDrawer, setShowVerificationDrawer] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  // Comprehensive Form State Covering All Authentic Sections
  const [formData, setFormData] = useState({
    title: "",
    name: "",
    avatar: "",
    resumeUrl: "",
    resumeName: "",
    tagline: "",
    about: "",
    description: "",
    template: "modern",
    status: "Draft",
    email: "",
    phone: "",
    github: "",
    linkedin: "",
    website: "",
    skillsString: "",
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    achievements: [],
    blog: [],
  });

  // Populate form data from existing portfolio
  useEffect(() => {
    if (!existing) {
      dispatch(fetchPortfolioById(id));
    } else {
      const contact = existing.contact || {};
      setFormData({
        title: existing.title || "",
        name: existing.name || existing.hero?.name || "",
        avatar: existing.avatar || existing.hero?.avatar || "",
        resumeUrl: existing.resumeUrl || existing.resume || "",
        resumeName: existing.resumeName || (existing.name ? `${existing.name}_Resume.pdf` : "Resume.pdf"),
        tagline: existing.tagline || existing.hero?.tagline || "",
        about: existing.about || existing.description || "",
        description: existing.description || "",
        template: existing.template || "modern",
        status: existing.status || "Draft",
        email: existing.email || contact.email || "",
        phone: existing.phone || contact.phone || "",
        github: existing.github || contact.github || "",
        linkedin: existing.linkedin || contact.linkedin || "",
        website: existing.website || contact.website || "",
        skillsString: Array.isArray(existing.skills) ? existing.skills.join(", ") : "",
        skills: Array.isArray(existing.skills) ? existing.skills : [],
        experience: Array.isArray(existing.experience) ? existing.experience : [],
        projects: Array.isArray(existing.projects) ? existing.projects : [],
        education: Array.isArray(existing.education) ? existing.education : [],
        certifications: Array.isArray(existing.certifications) ? existing.certifications : [],
        achievements: Array.isArray(existing.achievements) ? existing.achievements : [],
        blog: Array.isArray(existing.blog) ? existing.blog : [],
      });

      const detected = detectPortfolioMissingInfo(existing);
      setMissingInfo(detected);
    }
  }, [dispatch, existing, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Profile Photo Upload Handlers
  const handlePhotoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      return toast.error("Photo size must be under 8MB");
    }

    setUploadingPhoto(true);
    toast.loading("Uploading headshot to Cloudinary...", { id: "photo-up" });

    try {
      const uploadData = new FormData();
      uploadData.append("avatar", file);

      const res = await dispatch(
        uploadPortfolioAvatar({ id, formData: uploadData })
      );

      toast.dismiss("photo-up");
      if (uploadPortfolioAvatar.fulfilled.match(res)) {
        const photoUrl = res.payload?.avatarUrl || res.payload?.portfolio?.avatar;
        setFormData((prev) => ({ ...prev, avatar: photoUrl }));
        toast.success("Profile photo updated successfully! 📸");
      } else {
        throw new Error(res.payload || "Upload failed");
      }
    } catch {
      toast.dismiss("photo-up");
      // Fallback to local Data URL
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData((prev) => ({ ...prev, avatar: ev.target.result }));
        toast.success("Applied photo locally! 📸");
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Resume Document Upload Handlers
  const handleResumeFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["application/pdf", ".doc", ".docx"];
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf && !validTypes.some((t) => file.name.toLowerCase().endsWith(t))) {
      return toast.error("Please upload a PDF resume document");
    }

    if (file.size > 15 * 1024 * 1024) {
      return toast.error("Resume file size must be under 15MB");
    }

    setUploadingResume(true);
    toast.loading("Uploading resume to cloud storage...", { id: "res-up" });

    try {
      const uploadData = new FormData();
      uploadData.append("resume", file);

      const res = await dispatch(
        uploadPortfolioResume({ id, formData: uploadData })
      );

      toast.dismiss("res-up");
      if (uploadPortfolioResume.fulfilled.match(res)) {
        const url = res.payload?.resumeUrl;
        const name = res.payload?.resumeName || file.name;
        setFormData((prev) => ({ ...prev, resumeUrl: url, resumeName: name }));
        setMissingInfo((prev) => prev.filter((item) => item.section !== "Resume" && item.field !== "resumeUrl"));
        toast.success(`Attached ${file.name}! Visible on portfolio 📄`);
      } else {
        throw new Error(res.payload || "Upload failed");
      }
    } catch {
      toast.dismiss("res-up");
      // Fallback to Data URL
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData((prev) => ({
          ...prev,
          resumeUrl: ev.target.result,
          resumeName: file.name,
        }));
        setMissingInfo((prev) => prev.filter((item) => item.section !== "Resume" && item.field !== "resumeUrl"));
        toast.success(`Attached ${file.name}! Visible on portfolio 📄`);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingResume(false);
    }
  };

  // Section Array Handlers
  const handleAddExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          role: "Software Engineer",
          company: "New Company",
          duration: "2023 - Present",
          location: "Remote",
          workplaceType: "Virtual / Remote",
          compensation: "Paid",
          compensationAmount: "",
          description: "Engineered scalable features and full-stack services.",
          projectTitle: "",
          projectLive: "",
          projectGithub: "",
          offerLetter: "",
          certificate: "",
        },
      ],
    }));
  };

  const handleRemoveExperience = (idx) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== idx),
    }));
  };

  const handleExperienceChange = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.experience];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  const handleAddProject = () => {
    setFormData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { title: "New Project", description: "Full-stack software application.", tags: ["React", "Node.js"], github: "", live: "" },
      ],
    }));
  };

  const handleRemoveProject = (idx) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== idx),
    }));
  };

  const handleProjectChange = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.projects];
      if (field === "tags") {
        updated[idx] = {
          ...updated[idx],
          tags: Array.isArray(value) ? value : value.split(",").map((t) => t.trim()).filter(Boolean),
        };
      } else {
        updated[idx] = { ...updated[idx], [field]: value };
      }
      return { ...prev, projects: updated };
    });
  };

  const handleAddEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { institution: "University / College", degree: "B.S. Computer Science", year: "2024", description: "" },
      ],
    }));
  };

  const handleRemoveEducation = (idx) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== idx),
    }));
  };

  const handleEducationChange = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.education];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const handleAddCertification = () => {
    setFormData((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        { name: "Certified Developer", issuer: "Authority / Cloud Provider", date: new Date().getFullYear().toString(), link: "" },
      ],
    }));
  };

  const handleRemoveCertification = (idx) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== idx),
    }));
  };

  const handleCertificationChange = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.certifications];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, certifications: updated };
    });
  };

  const handleAddAchievement = () => {
    setFormData((prev) => ({
      ...prev,
      achievements: [
        ...prev.achievements,
        { title: "Hackathon Winner / Recognition", metric: "1st Place", description: "Recognized for innovative engineering design.", link: "" },
      ],
    }));
  };

  const handleRemoveAchievement = (idx) => {
    setFormData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== idx),
    }));
  };

  const handleAchievementChange = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.achievements];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, achievements: updated };
    });
  };

  const handleAddBlog = () => {
    setFormData((prev) => ({
      ...prev,
      blog: [
        ...prev.blog,
        { title: "Building High-Throughput Web Platforms", link: "", excerpt: "Architectural insights on designing resilient web applications.", readTime: "5 min read" },
      ],
    }));
  };

  const handleRemoveBlog = (idx) => {
    setFormData((prev) => ({
      ...prev,
      blog: prev.blog.filter((_, i) => i !== idx),
    }));
  };

  const handleBlogChange = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.blog];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, blog: updated };
    });
  };

  // Sync update from MissingInfoPrompt verification banner directly into the form & DB
  const handleUpdateFromVerification = async (updatedData) => {
    const contact = updatedData.contact || {};
    setFormData((prev) => ({
      ...prev,
      ...updatedData,
      email: updatedData.email || contact.email || prev.email,
      phone: updatedData.phone || contact.phone || prev.phone,
      github: updatedData.github || contact.github || prev.github,
      linkedin: updatedData.linkedin || contact.linkedin || prev.linkedin,
      website: updatedData.website || contact.website || prev.website,
      resumeUrl: updatedData.resumeUrl || updatedData.resume || prev.resumeUrl,
      resumeName: updatedData.resumeName || prev.resumeName,
      skills: Array.isArray(updatedData.skills) ? updatedData.skills : prev.skills,
      skillsString: Array.isArray(updatedData.skills) ? updatedData.skills.join(", ") : prev.skillsString,
      experience: Array.isArray(updatedData.experience) ? updatedData.experience : prev.experience,
      projects: Array.isArray(updatedData.projects) ? updatedData.projects : prev.projects,
      education: Array.isArray(updatedData.education) ? updatedData.education : prev.education,
      certifications: Array.isArray(updatedData.certifications) ? updatedData.certifications : prev.certifications,
      achievements: Array.isArray(updatedData.achievements) ? updatedData.achievements : prev.achievements,
      blog: Array.isArray(updatedData.blog) ? updatedData.blog : prev.blog,
    }));

    const remaining = filterStillMissing(missingInfo, updatedData);
    setMissingInfo(remaining);

    // Save to server
    const res = await dispatch(updatePortfolio({ id, data: updatedData }));
    if (updatePortfolio.fulfilled.match(res)) {
      toast.success("Profile verified & saved! ✨");
    }
  };

  // Submit full portfolio updates
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    toast.loading("Saving portfolio changes...", { id: "save-pf" });

    const skills = formData.skillsString
      ? formData.skillsString.split(",").map((s) => s.trim()).filter(Boolean)
      : formData.skills;

    const payload = {
      ...formData,
      skills,
      contact: {
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        github: formData.github.trim(),
        linkedin: formData.linkedin.trim(),
        website: formData.website.trim(),
      },
      hero: {
        ...(existing?.hero || {}),
        name: formData.name.trim(),
        tagline: formData.tagline.trim(),
        avatar: formData.avatar.trim(),
      },
      isPublic: formData.status === "Published",
    };
    delete payload.skillsString;

    try {
      const result = await dispatch(
        updatePortfolio({
          id,
          data: payload,
        }),
      );

      toast.dismiss("save-pf");
      if (updatePortfolio.fulfilled.match(result)) {
        toast.success("Portfolio Updated Successfully! ✨");
        navigate(`/portfolio/${id}`);
      } else {
        toast.error(result.payload || "Failed to update portfolio");
      }
    } catch (err) {
      toast.dismiss("save-pf");
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (!existing && loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!existing && !loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Portfolio Not Found</h2>
          <Link
            to="/portfolio"
            className="inline-block rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white"
          >
            Back to Portfolios
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white pb-32">
      {/* Top Header Toolbar */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to={`/portfolio/${id}`}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
              title="Return to Portfolio View"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </Link>
            <div className="h-4 w-[1px] bg-zinc-800"></div>
            <div>
              <h1 className="text-sm font-bold text-white max-w-xs truncate">
                Editing: {formData.title || "Portfolio"}
              </h1>
              <p className="text-[11px] text-zinc-400 font-mono">
                {formData.template.toUpperCase()} THEME • {formData.status.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Authentic Profile Verification Drawer Trigger */}
            <button
              type="button"
              onClick={() => setShowVerificationDrawer((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition cursor-pointer shadow-sm ${
                missingInfo.length > 0
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                  : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
              }`}
              title="Verify & Authenticate Profile Details"
            >
              <ShieldCheck
                size={14}
                className={missingInfo.length > 0 ? "text-amber-400" : "text-emerald-400"}
              />
              <span>
                {missingInfo.length > 0
                  ? `Verify Profile (${missingInfo.length})`
                  : "Profile Complete"}
              </span>
              {missingInfo.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              )}
            </button>

            <Link
              to={`/portfolio/${id}`}
              className="rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 px-5 py-2 text-xs font-bold text-white transition shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              <Save size={14} />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Authentic Profile Verification Banner (Available during portfolio edit) */}
      {showVerificationDrawer && (
        <MissingInfoPrompt
          missingInfo={missingInfo}
          portfolioData={{ ...existing, ...formData }}
          onUpdatePortfolio={handleUpdateFromVerification}
          onDismiss={() => setShowVerificationDrawer(false)}
        />
      )}

      {/* Main Edit Canvas */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SECTION 1: PROFILE PHOTO & CANDIDATE RESUME / CV */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Camera size={18} className="text-pink-400" />
                  <span>Profile Photo &amp; Candidate Resume</span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Manage your authentic visual headshot and attached resume document displayed across your portfolio.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Photo */}
              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-pink-300 font-mono">
                    Profile Photo / Avatar
                  </label>
                  {formData.avatar && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: "" })}
                      className="text-[11px] text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      Reset Photo
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-tr from-pink-500 to-indigo-500 overflow-hidden flex items-center justify-center bg-zinc-900 shrink-0 shadow-md">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover rounded-[14px]"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <Camera size={22} className="text-zinc-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="url"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleChange}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-pink-500 outline-none font-mono"
                    />
                    <div className="flex items-center gap-2">
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
                        disabled={uploadingPhoto}
                        className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                      >
                        <Upload size={12} />
                        <span>{uploadingPhoto ? "Uploading..." : "Upload Device Photo"}</span>
                      </button>
                      <span className="text-[10px] text-zinc-500">Auto-saved to cloud</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Candidate Resume / CV Document */}
              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-300 font-mono flex items-center gap-1.5">
                    <FileText size={13} className="text-emerald-400" />
                    <span>Candidate Resume / CV Document</span>
                  </label>
                  {formData.resumeUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, resumeUrl: "", resumeName: "" })}
                      className="text-[11px] text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      Remove Resume
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileText size={16} className="text-emerald-400 shrink-0" />
                      <span className="font-semibold text-zinc-200 truncate">
                        {formData.resumeName || (formData.resumeUrl ? "Attached_Resume.pdf" : "No resume attached")}
                      </span>
                    </div>
                    {formData.resumeUrl ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold shrink-0">
                        Live on Portfolio
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 shrink-0">
                        Optional
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      name="resumeUrl"
                      value={formData.resumeUrl}
                      onChange={handleChange}
                      placeholder="Paste Google Drive or PDF link"
                      className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none font-mono"
                    />
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="file"
                        ref={resumeInputRef}
                        onChange={handleResumeFileUpload}
                        accept="application/pdf,.doc,.docx"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => resumeInputRef.current?.click()}
                        disabled={uploadingResume}
                        className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                      >
                        <Upload size={12} />
                        <span>{uploadingResume ? "Uploading..." : "Upload PDF"}</span>
                      </button>
                      {formData.resumeUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.resumeUrl.startsWith("data:")) {
                              setViewingDoc({
                                title: formData.resumeName || "Resume.pdf",
                                url: formData.resumeUrl,
                                type: "pdf",
                              });
                            } else {
                              window.open(formData.resumeUrl, "_blank", "noopener,noreferrer");
                            }
                          }}
                          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-emerald-400 hover:text-white transition cursor-pointer"
                          title="Preview Document"
                        >
                          <Eye size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: GENERAL DETAILS & POSITIONING */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Sliders size={18} className="text-indigo-400" />
              <span>General Details &amp; Career Positioning</span>
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Portfolio Title</label>
                <input
                  required
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 outline-none"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior Full-Stack Portfolio"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Candidate Full Name</label>
                <input
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 outline-none"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Anushka Garg"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Professional Tagline / Hook</label>
              <input
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 outline-none"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="e.g. Distributed Systems Engineer &amp; Full-Stack Architect"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block font-medium">About Me / Career Pitch</label>
              <textarea
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 outline-none leading-relaxed"
                rows={4}
                name="about"
                value={formData.about}
                onChange={handleChange}
                placeholder="Share your technical journey, engineering achievements, and passions..."
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Template Theme</label>
                <select
                  name="template"
                  value={formData.template}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 outline-none capitalize"
                >
                  <option value="modern">Modern (Dark Glassmorphic)</option>
                  <option value="minimal">Minimal (Monochrome Clean)</option>
                  <option value="developer">Cyber Terminal (CLI Theme)</option>
                  <option value="corporate">Executive Corporate</option>
                  <option value="apple">Apple Inspired</option>
                  <option value="google">Google Clean Material</option>
                  <option value="designer">Creative Designer</option>
                  <option value="cyberpunk">Cyberpunk 2077</option>
                  <option value="academic">Academic &amp; Research</option>
                  <option value="animated">Animated Interactive</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Visibility Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 outline-none"
                >
                  <option value="Draft">Draft (Private View)</option>
                  <option value="Published">Published (Public URL Active)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: TECHNICAL SKILLS */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400" />
              <span>Technical Skills &amp; Frameworks</span>
            </h2>

            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">
                Skills &amp; Technologies (comma separated)
              </label>
              <input
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 outline-none"
                name="skillsString"
                value={formData.skillsString}
                onChange={handleChange}
                placeholder="React, TypeScript, Node.js, Python, PostgreSQL, Redis, Docker, AWS"
              />
            </div>

            {formData.skillsString && (
              <div className="flex flex-wrap gap-2 pt-2">
                {formData.skillsString.split(",").map((s) => s.trim()).filter(Boolean).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-indigo-300"
                  >
                    #{skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 4: WORK EXPERIENCE */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase size={18} className="text-amber-400" />
                  <span>Work Experience &amp; Internships</span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Document your authentic career trajectory, roles, deliverables, and proof documents.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddExperience}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Experience</span>
              </button>
            </div>

            {formData.experience.length === 0 ? (
              <p className="text-zinc-500 text-xs italic py-2">
                No work experience added yet. Click &quot;Add Experience&quot; to highlight your past roles.
              </p>
            ) : (
              <div className="space-y-4">
                {formData.experience.map((exp, idx) => (
                  <div key={idx} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        Experience #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(idx)}
                        className="text-zinc-500 hover:text-rose-400 transition cursor-pointer p-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3">
                      <input
                        placeholder="Role / Title (e.g. Senior Software Engineer)"
                        value={exp.role || ""}
                        onChange={(e) => handleExperienceChange(idx, "role", e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                      />
                      <input
                        placeholder="Company / Organization"
                        value={exp.company || ""}
                        onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                      />
                      <input
                        placeholder="Duration (e.g. 2022 - Present)"
                        value={exp.duration || ""}
                        onChange={(e) => handleExperienceChange(idx, "duration", e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                      />
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Key achievements, technologies used, and business impact..."
                      value={exp.description || ""}
                      onChange={(e) => handleExperienceChange(idx, "description", e.target.value)}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                    />

                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <input
                        placeholder="Offer Letter / Document Link (Optional)"
                        value={exp.offerLetter || ""}
                        onChange={(e) => handleExperienceChange(idx, "offerLetter", e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2 text-xs text-zinc-300 font-mono focus:border-amber-500 outline-none"
                      />
                      <input
                        placeholder="Experience Certificate Link (Optional)"
                        value={exp.certificate || ""}
                        onChange={(e) => handleExperienceChange(idx, "certificate", e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2 text-xs text-zinc-300 font-mono focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 5: SOFTWARE PROJECTS */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code2 size={18} className="text-indigo-400" />
                  <span>Featured Software Projects</span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Showcase your flagship open-source repositories and production applications.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddProject}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Project</span>
              </button>
            </div>

            {formData.projects.length === 0 ? (
              <p className="text-zinc-500 text-xs italic py-2">
                No projects added yet. Click &quot;Add Project&quot; to showcase your software builds.
              </p>
            ) : (
              <div className="space-y-4">
                {formData.projects.map((proj, idx) => (
                  <div key={idx} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-indigo-400">
                        Project #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(idx)}
                        className="text-zinc-500 hover:text-rose-400 transition cursor-pointer p-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <input
                        placeholder="Project Title"
                        value={proj.title || ""}
                        onChange={(e) => handleProjectChange(idx, "title", e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-white focus:border-indigo-500 outline-none"
                      />
                      <input
                        placeholder="Tags (comma separated, e.g. React, Node.js)"
                        value={Array.isArray(proj.tags) ? proj.tags.join(", ") : (proj.tags || "")}
                        onChange={(e) => handleProjectChange(idx, "tags", e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-white focus:border-indigo-500 outline-none"
                      />
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Project Description..."
                      value={proj.description || ""}
                      onChange={(e) => handleProjectChange(idx, "description", e.target.value)}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-white focus:border-indigo-500 outline-none"
                    />

                    <div className="grid sm:grid-cols-2 gap-3">
                      <input
                        placeholder="GitHub Repository URL"
                        value={proj.github || ""}
                        onChange={(e) => handleProjectChange(idx, "github", e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2 text-xs text-zinc-300 font-mono focus:border-indigo-500 outline-none"
                      />
                      <input
                        placeholder="Live Demo URL"
                        value={proj.live || ""}
                        onChange={(e) => handleProjectChange(idx, "live", e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2 text-xs text-zinc-300 font-mono focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 6: EDUCATION & DEGREES */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <GraduationCap size={18} className="text-emerald-400" />
                  <span>Education &amp; Degrees</span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Institutions, degrees, academic focus, and graduation years.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddEducation}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Education</span>
              </button>
            </div>

            {formData.education.length === 0 ? (
              <p className="text-zinc-500 text-xs italic py-2">
                No education added yet. Click &quot;Add Education&quot; to include your academic degrees.
              </p>
            ) : (
              <div className="space-y-4">
                {formData.education.map((edu, idx) => (
                  <div key={idx} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        Degree #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(idx)}
                        className="text-zinc-500 hover:text-rose-400 transition cursor-pointer p-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3">
                      <input
                        placeholder="Institution (e.g. University / College)"
                        value={edu.institution || ""}
                        onChange={(e) => handleEducationChange(idx, "institution", e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-white focus:border-emerald-500 outline-none"
                      />
                      <input
                        placeholder="Degree / Major (e.g. B.S. in Computer Science)"
                        value={edu.degree || ""}
                        onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-white focus:border-emerald-500 outline-none"
                      />
                      <input
                        placeholder="Year (e.g. 2024)"
                        value={edu.year || ""}
                        onChange={(e) => handleEducationChange(idx, "year", e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 7: CERTIFICATIONS & CREDENTIALS */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award size={18} className="text-cyan-400" />
                  <span>Certifications &amp; Credentials</span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Industry certifications, professional licenses, and verified credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCertification}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Certification</span>
              </button>
            </div>

            {formData.certifications.length === 0 ? (
              <p className="text-zinc-500 text-xs italic py-2">
                No certifications added yet. Click &quot;Add Certification&quot; to list your licenses.
              </p>
            ) : (
              <div className="space-y-4">
                {formData.certifications.map((cert, idx) => (
                  <div key={idx} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        Certification #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCertification(idx)}
                        className="text-zinc-500 hover:text-rose-400 transition cursor-pointer p-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-4 gap-3">
                      <input
                        placeholder="Certification Name"
                        value={cert.name || ""}
                        onChange={(e) => handleCertificationChange(idx, "name", e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-white focus:border-cyan-500 outline-none"
                      />
                      <input
                        placeholder="Issuing Authority (AWS, Google, etc.)"
                        value={cert.issuer || ""}
                        onChange={(e) => handleCertificationChange(idx, "issuer", e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-white focus:border-cyan-500 outline-none"
                      />
                      <input
                        placeholder="Issue Date / Year"
                        value={cert.date || ""}
                        onChange={(e) => handleCertificationChange(idx, "date", e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-white focus:border-cyan-500 outline-none"
                      />
                      <input
                        placeholder="Verification Link (URL)"
                        value={cert.link || cert.url || ""}
                        onChange={(e) => handleCertificationChange(idx, "link", e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-zinc-300 font-mono focus:border-cyan-500 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 8: ACHIEVEMENTS & PUBLICATIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Achievements */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award size={15} className="text-yellow-400" />
                  <span>Achievements &amp; Honors</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddAchievement}
                  className="text-xs font-semibold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add</span>
                </button>
              </div>

              {formData.achievements.length === 0 ? (
                <p className="text-zinc-500 text-xs italic">No honors or awards recorded.</p>
              ) : (
                <div className="space-y-3">
                  {formData.achievements.map((ach, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-yellow-400">Honor #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAchievement(idx)}
                          className="text-zinc-500 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          placeholder="Title"
                          value={ach.title || ""}
                          onChange={(e) => handleAchievementChange(idx, "title", e.target.value)}
                          className="rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-xs text-white focus:border-yellow-500 outline-none"
                        />
                        <input
                          placeholder="Metric / Recognition"
                          value={ach.metric || ""}
                          onChange={(e) => handleAchievementChange(idx, "metric", e.target.value)}
                          className="rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-xs text-white focus:border-yellow-500 outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Publications */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen size={15} className="text-teal-400" />
                  <span>Publications &amp; Articles</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddBlog}
                  className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add</span>
                </button>
              </div>

              {formData.blog.length === 0 ? (
                <p className="text-zinc-500 text-xs italic">No publications or articles recorded.</p>
              ) : (
                <div className="space-y-3">
                  {formData.blog.map((post, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-teal-400">Article #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBlog(idx)}
                          className="text-zinc-500 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <input
                        placeholder="Article Title"
                        value={post.title || ""}
                        onChange={(e) => handleBlogChange(idx, "title", e.target.value)}
                        className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-xs text-white focus:border-teal-500 outline-none"
                      />
                      <input
                        placeholder="Link / URL"
                        value={post.link || ""}
                        onChange={(e) => handleBlogChange(idx, "link", e.target.value)}
                        className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-xs text-zinc-300 font-mono focus:border-teal-500 outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 9: SOCIAL FOOTPRINT & CONTACT */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-5">
            <h2 className="text-lg font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Phone size={18} className="text-emerald-400" />
              <span>Contact Details &amp; Social Footprint</span>
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block">Contact Email</label>
                <input
                  type="email"
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-emerald-500 outline-none"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@domain.com"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block">Phone Number</label>
                <input
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-emerald-500 outline-none"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block flex items-center gap-1.5">
                  <FaGithub size={13} />
                  <span>GitHub Profile</span>
                </label>
                <input
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 outline-none"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block flex items-center gap-1.5">
                  <FaLinkedin size={13} className="text-blue-400" />
                  <span>LinkedIn Profile</span>
                </label>
                <input
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 outline-none"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block flex items-center gap-1.5">
                  <Globe size={13} className="text-purple-400" />
                  <span>Personal Website / Domain</span>
                </label>
                <input
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 outline-none"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourdomain.com"
                />
              </div>
            </div>
          </div>

          {/* Bottom Floating Save Action Bar */}
          <div className="flex justify-end gap-4 pt-4 border-t border-zinc-800">
            <Link
              to={`/portfolio/${id}`}
              className="rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 px-6 py-3 text-sm font-semibold text-zinc-300 hover:text-white transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 px-8 py-3 text-sm font-bold text-white transition shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              <Save size={16} />
              <span>{saving ? "Saving Changes..." : "Save Portfolio"}</span>
            </button>
          </div>
        </form>
      </main>

      {/* Document Viewer Modal for In-App PDF Preview */}
      <DocumentViewerModal
        doc={viewingDoc}
        onClose={() => setViewingDoc(null)}
      />
    </div>
  );
};

export default EditPortfolioPage;
