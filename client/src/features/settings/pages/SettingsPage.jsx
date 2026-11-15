import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import toast from "react-hot-toast";
import {
  User,
  Camera,
  Lock,
  LogOut,
  Save,
  Sparkles,
  Mail,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  Key,
  UploadCloud,
  Briefcase,
  MapPin,
  Phone,
  Globe,
  Code2,
  Plus,
  X,
  Sliders,
  ShieldAlert,
  ShieldCheck,
  BadgeCheck,
  Share2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { FaGithub, FaLinkedin } from "react-icons/fa";

import Sidebar from "../../dashboard/components/Sidebar";
import Topbar from "../../dashboard/components/Topbar";
import WorkspaceBackdrop from "../../../components/layout/WorkspaceBackdrop";
import PaymentModal from "../../subscription/components/PaymentModal";
import { updateProfile, uploadAvatar } from '../../../redux/profile/profileSlice';
import { logout } from "../../../redux/auth/authSlice";

const SUGGESTED_SKILLS = [
  "React",
  "Node.js",
  "TypeScript",
  "Next.js",
  "Python",
  "Tailwind CSS",
  "MongoDB",
  "PostgreSQL",
  "Docker",
  "AWS",
  "GraphQL",
  "Express.js",
];

const SettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'profile' | 'socials' | 'subscription' | 'security'
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan] = useState({
    id: "pro",
    title: "Pro",
    price: "499",
    description: "Best for developers",
    features: [
      "Unlimited Portfolios",
      "Premium Templates",
      "ATS Analyzer",
      "AI Portfolio Generator",
      "Priority Support",
    ],
  });

  const { profile, loading, uploadingAvatar } = useSelector(
    (state) => state.profile
  );
  const { user } = useSelector((state) => state.auth);

  const currentUser = profile || user;

  // Form states
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Mid-Level");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Sync state with current user profile
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || "");
      setJobTitle(currentUser.jobTitle || "");
      setBio(currentUser.bio || "");
      setLocation(currentUser.location || "");
      setPhone(currentUser.phone || "");
      setExperienceLevel(currentUser.experienceLevel || "Mid-Level");
      setGithub(currentUser.github || "");
      setLinkedin(currentUser.linkedin || "");
      setWebsite(currentUser.website || "");
      setSkills(Array.isArray(currentUser.skills) ? currentUser.skills : []);
    }
  }, [currentUser]);

  // Calculate Profile Completeness
  const calculateCompleteness = () => {
    let score = 0;
    if (fullName.trim()) score += 15;
    if (currentUser?.avatar) score += 15;
    if (jobTitle.trim()) score += 15;
    if (bio.trim()) score += 15;
    if (location.trim() || phone.trim()) score += 10;
    if (skills.length >= 3) score += 15;
    if (github.trim() || linkedin.trim() || website.trim()) score += 15;
    return Math.min(100, score);
  };

  const completeness = calculateCompleteness();

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: "", color: "" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1)
      return { score: 1, text: "Weak", color: "bg-rose-500", textCol: "text-rose-400" };
    if (score <= 2)
      return { score: 2, text: "Fair", color: "bg-amber-500", textCol: "text-amber-400" };
    if (score <= 3)
      return { score: 3, text: "Good", color: "bg-indigo-500", textCol: "text-indigo-400" };
    return { score: 4, text: "Strong", color: "bg-emerald-500", textCol: "text-emerald-400" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // Skill management
  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || newSkillInput).trim();
    if (!trimmed) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      return toast.error("Skill already added!");
    }
    setSkills([...skills, trimmed]);
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("File is too large. Max allowed size is 5MB.");
    }

    const formData = new FormData();
    formData.append("avatar", file);

    toast.loading("Uploading avatar to Cloudinary...", { id: "avatar-upload" });
    const result = await dispatch(uploadAvatar(formData));
    toast.dismiss("avatar-upload");

    if (uploadAvatar.fulfilled.match(result)) {
      toast.success("Profile avatar updated! 📸");
    } else {
      toast.error(result.payload || "Failed to upload avatar.");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      return toast.error("Full name cannot be empty.");
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone) {
      const INDIAN_PHONE_REGEX = /^(?:\+91[-\s]?)?[6789]\d{9}$/;
      if (!INDIAN_PHONE_REGEX.test(trimmedPhone)) {
        return toast.error(
          "Please enter a valid 10-digit Indian mobile number (e.g. +91 98765 43210 or 9876543210)."
        );
      }
    }

    const payload = {
      fullName: fullName.trim(),
      jobTitle: jobTitle.trim(),
      bio: bio.trim(),
      location: location.trim(),
      phone: trimmedPhone,
      experienceLevel,
      github: github.trim(),
      linkedin: linkedin.trim(),
      website: website.trim(),
      skills,
    };

    if (newPassword) {
      if (!currentPassword) {
        return toast.error("Please enter your current password to set a new password.");
      }
      if (newPassword !== confirmPassword) {
        return toast.error("New passwords do not match.");
      }
      if (newPassword.length < 8) {
        return toast.error("Password must be at least 8 characters long.");
      }
      if (!/^(?=.*[A-Za-z])(?=.*\d)[\x20-\x7E]{8,}$/.test(newPassword)) {
        return toast.error("Password must contain at least one letter and one number.");
      }
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    const result = await dispatch(updateProfile(payload));

    if (updateProfile.fulfilled.match(result)) {
      toast.success("Profile details saved successfully! ✨");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(result.payload || "Failed to update settings.");
    }
  };

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      dispatch(logout());
      toast.success("Signed out successfully.");
      navigate("/login");
    }
  };

  const avatarUrl = currentUser?.avatar;
  const initials = (currentUser?.fullName || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isPro = currentUser?.plan && currentUser.plan.toLowerCase() !== "free";

  return (
    <div className="flex min-h-screen bg-[#0B0E17] text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <WorkspaceBackdrop />
        <Topbar />

        <main className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-8 pb-36">
          {/* Top Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/60 via-zinc-900 to-zinc-950 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
            {/* Ambient Corner Glow */}
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                  <Sliders size={12} className="text-indigo-400" />
                  <span>Developer Workspace & Identity Hub</span>
                </div>

                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    Account Settings
                  </h1>
                  <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                    Update your professional profile, tech stack, and social profiles. These details auto-populate your AI portfolios and resumes.
                  </p>
                </div>
              </div>

              {/* User Mini Summary Pill */}
              <div className="shrink-0 flex items-center gap-3.5 bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-2xl shadow-lg backdrop-blur">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-base font-bold text-white shadow ring-2 ring-indigo-500/20">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-900"></span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-white truncate max-w-[160px]">
                      {currentUser?.fullName || "Developer"}
                    </p>
                    <BadgeCheck size={15} className="text-indigo-400 shrink-0" />
                  </div>
                  <p className="text-xs text-zinc-400 truncate max-w-[160px]">
                    {jobTitle || "Full Stack Developer"}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.2 rounded-full border ${
                        isPro
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400"
                      }`}
                    >
                      {isPro ? "PRO MEMBER" : "FREE PLAN"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Completeness Progress Bar */}
            <div className="mt-6 pt-5 border-t border-zinc-800/80">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-indigo-400" />
                  <span>Profile Readiness for AI & Recruiters</span>
                </span>
                <span className="font-mono text-indigo-400 font-bold">{completeness}% Complete</span>
              </div>
              <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completeness}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1.5">
                {completeness >= 85
                  ? "🎉 Stellar profile! Your AI-generated portfolios will look deeply personalized and complete."
                  : "💡 Add your job title, bio, skills, and GitHub URL to reach 100% profile power."}
              </p>
            </div>
          </div>

          {/* Quick Jump Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "all", label: "All Settings" },
              { id: "profile", label: "Identity & Photo" },
              { id: "skills", label: "Skills & Experience" },
              { id: "socials", label: "Socials & Links" },
              { id: "subscription", label: "Membership & Plan" },
              { id: "security", label: "Password & Security" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                    : "bg-zinc-900/70 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* 1. Profile Avatar Card */}
            {(activeTab === "all" || activeTab === "profile") && (
              <div className="relative overflow-hidden rounded-3xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-6 sm:p-8 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-indigo-500/30">
                <div className="flex items-center justify-between pb-5 mb-6 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                      <Camera size={18} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Profile Photo</h2>
                      <p className="text-xs text-zinc-400">
                        This avatar will be featured across your portfolios, resume headers, and shared links.
                      </p>
                    </div>
                  </div>

                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={12} />
                    <span>Cloudinary CDN</span>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                  {/* Avatar Graphic with Ring */}
                  <div className="relative group shrink-0">
                    <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-2xl ring-4 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all duration-300">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleAvatarSelect}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute -bottom-2 -right-2 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                      title="Upload photo"
                    >
                      <Camera size={15} />
                    </button>
                  </div>

                  {/* Upload Controls */}
                  <div className="space-y-3 text-center sm:text-left flex-1">
                    <div>
                      <h3 className="font-bold text-white text-sm">Upload New Avatar</h3>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed max-w-md">
                        Supported formats: PNG, JPG, or WEBP (Max 5MB). High-resolution square image (400×400) recommended.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2.5 text-xs font-semibold shadow-md shadow-indigo-600/25 transition cursor-pointer active:scale-95"
                      >
                        <UploadCloud size={14} />
                        <span>{uploadingAvatar ? "Uploading to Cloud..." : "Choose Image File"}</span>
                      </button>

                      {avatarUrl && (
                        <span className="text-xs text-zinc-400 font-mono flex items-center gap-1.5">
                          <Check size={13} className="text-emerald-400" />
                          <span>Photo active</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Personal & Professional Identity Card */}
            {(activeTab === "all" || activeTab === "profile") && (
              <div className="relative overflow-hidden rounded-3xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-6 sm:p-8 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-indigo-500/30">
                <div className="flex items-center justify-between pb-5 mb-6 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                      <User size={18} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Personal & Career Details</h2>
                      <p className="text-xs text-zinc-400">
                        Primary details that introduce you to recruiters and visitors.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                      <span>Full Name</span>
                      <span className="text-[10px] text-zinc-500">Public Display</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl bg-zinc-950/90 border border-zinc-800 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
                        placeholder="e.g. Anushka Garg"
                      />
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    </div>
                  </div>

                  {/* Professional Job Title */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                      <span>Professional Headline / Job Title</span>
                      <span className="text-[10px] text-indigo-400 font-mono">PORTFOLIO HERO</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full rounded-xl bg-zinc-950/90 border border-zinc-800 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
                        placeholder="e.g. Full Stack Engineer | React & Node.js"
                      />
                      <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    </div>
                  </div>

                  {/* Email Input (Readonly) */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                      <span>Email Address</span>
                      <span className="text-[10px] text-emerald-400 font-mono">VERIFIED</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        disabled
                        value={currentUser?.email || ""}
                        className="w-full rounded-xl bg-zinc-950/40 border border-zinc-800/80 pl-10 pr-4 py-3 text-sm text-zinc-500 cursor-not-allowed outline-none"
                      />
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <Lock size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                      <span>Phone Number</span>
                      <span className="text-[10px] text-zinc-500">Contact Card</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`w-full rounded-xl bg-zinc-950/90 border pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition ${
                          phone.trim() && !/^(?:\+91[-\s]?)?[6789]\d{9}$/.test(phone.trim())
                            ? "border-amber-500/70 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                            : "border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
                        }`}
                        placeholder="e.g. +91 98765 43210"
                      />
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    </div>
                    {phone.trim() && !/^(?:\+91[-\s]?)?[6789]\d{9}$/.test(phone.trim()) && (
                      <p className="text-[11px] text-amber-400/90 pl-1">
                        Must be a valid 10-digit Indian mobile number (e.g. +91 98765 43210 or 9876543210).
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                      <span>Location</span>
                      <span className="text-[10px] text-zinc-500">City, Country</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full rounded-xl bg-zinc-950/90 border border-zinc-800 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
                        placeholder="e.g. New Delhi, India"
                      />
                      <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                      <span>Experience Level</span>
                      <span className="text-[10px] text-zinc-500">Target Level</span>
                    </label>
                    <div className="relative">
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full rounded-xl bg-zinc-950/90 border border-zinc-800 pl-10 pr-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none transition cursor-pointer"
                      >
                        <option value="Student / Fresher">Student / Fresher (&lt; 1 yr)</option>
                        <option value="Junior Engineer">Junior Engineer (1 - 2 yrs)</option>
                        <option value="Mid-Level">Mid-Level Engineer (2 - 5 yrs)</option>
                        <option value="Senior Engineer">Senior Engineer (5 - 8 yrs)</option>
                        <option value="Lead / Principal">Lead / Principal Architect (8+ yrs)</option>
                      </select>
                      <Layers size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    </div>
                  </div>
                </div>

                {/* Professional Bio / About Me */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-300">
                      Professional Summary / Bio
                    </label>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {bio.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write a compelling 2-3 sentence overview of your technical background, projects you're passionate about, and what you're looking for..."
                    className="w-full rounded-xl bg-zinc-950/90 border border-zinc-800 p-3.5 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none transition leading-relaxed resize-none"
                  />
                  <p className="text-[11px] text-zinc-500">
                    This summary is used by the AI Builder to generate the "About Me" and hero pitch sections on your portfolio.
                  </p>
                </div>
              </div>
            )}

            {/* 3. Skills & Core Tech Stack Card */}
            {(activeTab === "all" || activeTab === "skills") && (
              <div className="relative overflow-hidden rounded-3xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-6 sm:p-8 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-indigo-500/30">
                <div className="flex items-center justify-between pb-5 mb-6 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                      <Code2 size={18} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Core Skills & Tech Stack</h2>
                      <p className="text-xs text-zinc-400">
                        Languages, frameworks, and developer tools you master.
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-zinc-400">
                    {skills.length} skills added
                  </span>
                </div>

                {/* Input to add skill */}
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        placeholder="Add a technology (e.g. React, Docker, Python)..."
                        className="w-full rounded-xl bg-zinc-950/90 border border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
                      />
                      <Code2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddSkill()}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Add Skill</span>
                    </button>
                  </div>

                  {/* Active Skill Chips */}
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-xs font-medium group transition hover:border-indigo-400"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                            title="Remove"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">No skills added yet. Add a few below or type custom ones.</p>
                  )}

                  {/* Suggested quick-add skills */}
                  <div className="pt-2">
                    <p className="text-[11px] text-zinc-500 mb-2 font-mono uppercase tracking-wider">
                      Quick Add Suggestions:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_SKILLS.map((suggested) => {
                        const isAdded = skills.some(
                          (s) => s.toLowerCase() === suggested.toLowerCase()
                        );
                        if (isAdded) return null;

                        return (
                          <button
                            key={suggested}
                            type="button"
                            onClick={() => handleAddSkill(suggested)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-850 text-[11px] text-zinc-400 hover:text-indigo-300 transition cursor-pointer"
                          >
                            <Plus size={10} />
                            <span>{suggested}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Social & Professional Profiles Card */}
            {(activeTab === "all" || activeTab === "socials") && (
              <div className="relative overflow-hidden rounded-3xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-6 sm:p-8 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-indigo-500/30">
                <div className="flex items-center justify-between pb-5 mb-6 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                      <Share2 size={18} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Social & Online Presence</h2>
                      <p className="text-xs text-zinc-400">
                        Link your code repositories and professional networks.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  {/* GitHub */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                      <span>GitHub Profile</span>
                      <span className="text-[10px] text-zinc-500">Repositories</span>
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        className="w-full rounded-xl bg-zinc-950/90 border border-zinc-800 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
                        placeholder="https://github.com/yourhandle"
                      />
                      <FaGithub size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    </div>
                  </div>

                  {/* LinkedIn */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                      <span>LinkedIn Profile</span>
                      <span className="text-[10px] text-zinc-500">Network</span>
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        className="w-full rounded-xl bg-zinc-950/90 border border-zinc-800 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
                        placeholder="https://linkedin.com/in/yourhandle"
                      />
                      <FaLinkedin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" />
                    </div>
                  </div>

                  {/* Personal Website */}
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                      <span>Personal Portfolio / Blog URL</span>
                      <span className="text-[10px] text-zinc-500">Custom Domain or Blog</span>
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full rounded-xl bg-zinc-950/90 border border-zinc-800 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
                        placeholder="https://anushkagarg.dev"
                      />
                      <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Subscription & Membership Card */}
            {(activeTab === "all" || activeTab === "subscription") && (
              <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 via-zinc-900/80 to-zinc-950 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-indigo-600/10 blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Subscription & Membership</h2>
                      <p className="text-xs text-zinc-400">
                        Manage your active plan, unlock unlimited portfolios, and access ATS models.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                        isPro
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                          : "bg-indigo-500/10 border-indigo-500/20 text-indigo-300"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isPro ? "bg-amber-400" : "bg-indigo-400 animate-pulse"
                        }`}
                      ></span>
                      <span>Plan: {currentUser?.plan?.toUpperCase() || "FREE TIER"}</span>
                    </div>
                  </div>
                </div>

                {isPro ? (
                  <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                        <CheckCircle2 size={16} />
                        <span>Pro Plan Active</span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                        Renews Monthly (₹499)
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300">
                      Your account enjoys unlimited portfolio builds, instant Nemotron ATS resume checks, and global edge CDN hosting.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-white">₹499</span>
                        <span className="text-xs text-zinc-400 font-medium">/ month</span>
                        <span className="ml-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 uppercase">
                          Recommended
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 max-w-md leading-relaxed">
                        Upgrade to <strong className="text-white">Pro</strong> to build unlimited portfolios, run automated ATS resume optimizations, and host on custom subdomains.
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Check size={13} className="text-indigo-400" />
                          <span>Unlimited Portfolios</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check size={13} className="text-indigo-400" />
                          <span>ATS Resume Audit</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check size={13} className="text-indigo-400" />
                          <span>AI Instant Builder</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check size={13} className="text-indigo-400" />
                          <span>Priority Processing</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm px-6 py-3.5 shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                      >
                        <Sparkles size={16} />
                        <span>Upgrade to Pro (₹499)</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. Password & Security Card */}
            {(activeTab === "all" || activeTab === "security") && (
              <div className="relative overflow-hidden rounded-3xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-6 sm:p-8 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-indigo-500/30">
                <div className="flex items-center justify-between pb-5 mb-6 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                      <Lock size={18} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Security & Password</h2>
                      <p className="text-xs text-zinc-400">
                        Leave blank if you do not wish to update your login password.
                      </p>
                    </div>
                  </div>

                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 bg-zinc-800/60 border border-zinc-700/60 px-2.5 py-1 rounded-full">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    <span>256-bit Hash</span>
                  </span>
                </div>

                <div className="space-y-5 max-w-xl">
                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 block">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full rounded-xl bg-zinc-950/90 border border-zinc-800 pl-10 pr-10 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
                      />
                      <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass((prev) => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition cursor-pointer"
                      >
                        {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-300 block">
                        New Password
                      </label>
                      {newPassword && (
                        <span className={`text-[11px] font-bold font-mono ${passwordStrength.textCol}`}>
                          Strength: {passwordStrength.text}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="w-full rounded-xl bg-zinc-950/90 border border-zinc-800 pl-10 pr-10 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
                      />
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <button
                        type="button"
                        onClick={() => setShowNewPass((prev) => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition cursor-pointer"
                      >
                        {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    {/* Password Strength Meter Bars */}
                    {newPassword && (
                      <div className="pt-1.5 flex gap-1.5">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              passwordStrength.score >= step
                                ? passwordStrength.color
                                : "bg-zinc-800"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 block">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full rounded-xl bg-zinc-950/90 border border-zinc-800 pl-10 pr-10 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none transition"
                      />
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass((prev) => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition cursor-pointer"
                      >
                        {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sticky/Prominent Save Settings Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800/80">
              <span className="text-xs text-zinc-400 text-center sm:text-left">
                Your profile updates sync live to all your portfolios, AI generators, and resumes.
              </span>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 px-8 py-3.5 text-sm font-bold text-white transition shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Save size={16} />
                <span>{loading ? "Saving Changes..." : "Save Settings"}</span>
              </button>
            </div>
          </form>

          {/* 5. Danger Zone / Sign Out */}
          <div className="relative overflow-hidden rounded-3xl border border-rose-500/25 bg-gradient-to-r from-rose-950/20 via-zinc-900/60 to-zinc-950 p-6 sm:p-7 backdrop-blur-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0">
                <ShieldAlert size={18} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Active Session & Security
                </h3>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Sign out to terminate your current authenticated session on this browser.
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600/20 border border-rose-500/30 hover:bg-rose-600 text-rose-300 hover:text-white px-5 py-2.5 text-xs font-bold transition duration-200 cursor-pointer shadow-sm active:scale-95"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Page Footer */}
          <footer className="pt-8 pb-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-600/30">
                P
              </div>
              <p className="text-zinc-400">© 2026 PortfolioAI Engine. Production Grade SaaS.</p>
            </div>

            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="hover:text-indigo-400 transition">
                Dashboard
              </Link>
              <Link to="/portfolio" className="hover:text-indigo-400 transition">
                Portfolios
              </Link>
              <Link to="/portfolio-generator" className="hover:text-indigo-400 transition">
                AI Generator
              </Link>
              <Link to="/analyzer" className="hover:text-indigo-400 transition">
                ATS Analyzer
              </Link>
            </div>
          </footer>
        </main>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          plan={selectedPlan}
          user={currentUser}
        />
      </div>
    </div>
  );
};

export default SettingsPage;
