import { useState, useRef } from "react";
import {
  Camera,
  Upload,
  Link as LinkIcon,
  Trash2,
  X,
  Check,
  Sparkles,
} from 'lucide-react';
import toast from "react-hot-toast";

// Helper to resize and compress an image file to a lightweight data URL
const compressImageFile = (file, maxWidth = 600, maxHeight = 600, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

const AVATAR_PRESETS = [
  {
    name: "Tech Minimalist",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Modern Executive",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Creative Engineer",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Software Architect",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
];

const PhotoUploadModal = ({
  isOpen,
  onClose,
  currentAvatar = "",
  candidateName = "Developer",
  onApplyPhoto,
}) => {
  const [photoUrl, setPhotoUrl] = useState(currentAvatar || "");
  const [activeTab, setActiveTab] = useState("upload"); // "upload" | "url" | "presets"
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const initials = (candidateName || "D")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please select a valid image file (PNG, JPG, WEBP)");
    }

    try {
      setIsProcessing(true);
      const dataUrl = await compressImageFile(file);
      setPhotoUrl(dataUrl);
      toast.success("Photo loaded! Click 'Apply Photo' to save.");
    } catch {
      toast.error("Failed to process image file");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please drop an image file (PNG, JPG, WEBP)");
    }

    try {
      setIsProcessing(true);
      const dataUrl = await compressImageFile(file);
      setPhotoUrl(dataUrl);
      toast.success("Photo loaded! Click 'Apply Photo' to save.");
    } catch {
      toast.error("Failed to process image file");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    onApplyPhoto(photoUrl.trim());
    toast.success("Profile photo updated on your portfolio! 📸");
    onClose();
  };

  const handleRemove = () => {
    setPhotoUrl("");
    onApplyPhoto("");
    toast.success("Profile photo removed. Reverted to initials.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 p-0.5 flex items-center justify-center text-white shadow-lg shadow-pink-600/20">
              <Camera size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Add / Update Profile Photo</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Personalize {candidateName}&apos;s portfolio with a photo or avatar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Preview Display */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850">
          <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 shadow-xl shrink-0">
            <div className="w-full h-full rounded-full bg-zinc-950 overflow-hidden flex items-center justify-center">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={candidateName}
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
                  photoUrl ? "hidden" : "flex"
                }`}
              >
                {initials}
              </div>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <p className="text-sm font-bold text-white truncate">{candidateName}</p>
            <p className="text-xs text-zinc-400">
              {photoUrl
                ? "Custom photo preview ready"
                : "No photo active — displaying stylized initials"}
            </p>
            {photoUrl && (
              <button
                type="button"
                onClick={() => setPhotoUrl("")}
                className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-semibold pt-1 cursor-pointer"
              >
                <Trash2 size={12} />
                <span>Remove photo &amp; use initials</span>
              </button>
            )}
          </div>
        </div>

        {/* Method Switcher Tabs */}
        <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition cursor-pointer ${
              activeTab === "upload"
                ? "bg-purple-600 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Upload size={13} />
            <span>Upload from Device</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition cursor-pointer ${
              activeTab === "url"
                ? "bg-purple-600 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <LinkIcon size={13} />
            <span>Paste Image URL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition cursor-pointer ${
              activeTab === "presets"
                ? "bg-purple-600 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles size={13} />
            <span>Preset Photos</span>
          </button>
        </div>

        {/* TAB 1: File Upload */}
        {activeTab === "upload" && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 ${
              dragOver
                ? "border-pink-500 bg-pink-500/10"
                : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/40"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-zinc-850 flex items-center justify-center text-pink-400">
              <Upload size={22} className={isProcessing ? "animate-bounce" : ""} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-white">
                {isProcessing
                  ? "Processing and optimizing image..."
                  : "Click to browse or drag & drop photo here"}
              </p>
              <p className="text-[11px] text-zinc-500">
                Supports PNG, JPG, JPEG, WEBP • Automatically optimized
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: Image URL */}
        {activeTab === "url" && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">
                Public Image / Avatar URL
              </label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/profile-picture.jpg"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              💡 You can use an image link from LinkedIn, GitHub, Google Photos, Cloudinary, or any publicly accessible URL.
            </p>
          </div>
        )}

        {/* TAB 3: Preset Avatars */}
        {activeTab === "presets" && (
          <div className="space-y-3">
            <p className="text-xs text-zinc-400">
              Choose a curated, high-resolution portrait for a polished professional presentation:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AVATAR_PRESETS.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => setPhotoUrl(preset.url)}
                  className={`p-2 rounded-2xl border text-center transition cursor-pointer space-y-2 flex flex-col items-center ${
                    photoUrl === preset.url
                      ? "border-pink-500 bg-pink-500/10 shadow-md"
                      : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-14 h-14 rounded-full object-cover border border-zinc-700"
                  />
                  <p className="text-[10px] font-semibold text-zinc-300 truncate w-full">
                    {preset.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-850">
          {currentAvatar ? (
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs font-semibold text-red-400 hover:text-red-300 transition cursor-pointer"
            >
              Clear Current Photo
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-xs font-semibold text-zinc-300 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold transition shadow-lg shadow-pink-600/20 cursor-pointer flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>Apply Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoUploadModal;
