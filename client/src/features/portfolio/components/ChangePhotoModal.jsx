import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  X,
  Upload,
  Link as LinkIcon,
  User,
  Sparkles,
  Camera,
  Trash2,
  Check,
  RefreshCw,
} from "lucide-react";
import {
  uploadPortfolioAvatar,
  updatePortfolio,
} from "../../../redux/portfolio/portfolioSlice";

const ChangePhotoModal = ({ isOpen, onClose, portfolio }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("upload"); // "upload" | "url" | "presets"
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [githubUser, setGithubUser] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !portfolio) return null;

  const currentAvatar =
    portfolio.avatar ||
    portfolio.hero?.avatar ||
    portfolio.user?.avatar ||
    user?.avatar ||
    "";

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please select a valid image file (PNG, JPG, WEBP)");
    }

    if (file.size > 10 * 1024 * 1024) {
      return toast.error("Image file size must be under 10MB");
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      return toast.error("Please choose an image file to upload");
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const result = await dispatch(
        uploadPortfolioAvatar({ id: portfolio._id, formData }),
      );

      if (uploadPortfolioAvatar.fulfilled.match(result)) {
        toast.success("Profile photo updated successfully! 📸");
        handleClose();
      } else {
        toast.error(result.payload || "Failed to upload photo");
      }
    } catch (err) {
      toast.error(err.message || "Failed to upload photo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    const trimmed = imageUrl.trim();
    if (!trimmed) {
      return toast.error("Please enter a valid image URL");
    }

    try {
      setIsSubmitting(true);
      const result = await dispatch(
        updatePortfolio({
          id: portfolio._id,
          data: { avatar: trimmed },
        }),
      );

      if (updatePortfolio.fulfilled.match(result)) {
        toast.success("Profile photo URL saved! 📸");
        handleClose();
      } else {
        toast.error(result.payload || "Failed to update photo");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update photo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyPreset = async (targetUrl, label) => {
    if (!targetUrl) return;
    try {
      setIsSubmitting(true);
      const result = await dispatch(
        updatePortfolio({
          id: portfolio._id,
          data: { avatar: targetUrl },
        }),
      );

      if (updatePortfolio.fulfilled.match(result)) {
        toast.success(`${label || "Photo"} applied successfully! ✨`);
        handleClose();
      } else {
        toast.error(result.payload || "Failed to apply photo");
      }
    } catch (err) {
      toast.error(err.message || "Failed to apply photo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setIsSubmitting(true);
      const result = await dispatch(
        updatePortfolio({
          id: portfolio._id,
          data: { avatar: "" },
        }),
      );

      if (updatePortfolio.fulfilled.match(result)) {
        toast.success("Photo removed. Initial monogram will be used.");
        handleClose();
      } else {
        toast.error(result.payload || "Failed to remove photo");
      }
    } catch (err) {
      toast.error(err.message || "Failed to remove photo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview("");
    setImageUrl("");
    setGithubUser("");
    onClose();
  };

  const previewSrc = filePreview || imageUrl || currentAvatar;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#0F0F14] p-6 sm:p-8 shadow-2xl text-white space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Camera size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Change Profile Photo</h2>
              <p className="text-xs text-zinc-400">
                Update how your portrait appears across your portfolio
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current / Active Preview */}
        <div className="flex items-center gap-5 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl p-0.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 shadow-lg shadow-indigo-500/20 overflow-hidden flex items-center justify-center bg-zinc-950">
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-[14px]"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span className="text-xl font-black text-indigo-400">
                  {(portfolio.name || portfolio.title || "User")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs uppercase font-mono tracking-wider text-indigo-400 font-semibold">
              Live Preview
            </span>
            <h4 className="text-sm font-semibold text-white">
              {portfolio.name || portfolio.title}
            </h4>
            <p className="text-xs text-zinc-400">
              {previewSrc
                ? "This photo will appear on the left of your name in your portfolio hero."
                : "No photo set yet. Your initials monogram is currently displayed."}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
              activeTab === "upload"
                ? "bg-indigo-600 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Upload size={14} />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
              activeTab === "url"
                ? "bg-indigo-600 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <LinkIcon size={14} />
            <span>Image URL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
              activeTab === "presets"
                ? "bg-indigo-600 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles size={14} />
            <span>Quick Options</span>
          </button>
        </div>

        {/* Tab 1: Upload File */}
        {activeTab === "upload" && (
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer rounded-2xl border-2 border-dashed border-zinc-700 hover:border-indigo-500 bg-zinc-900/40 hover:bg-indigo-600/5 p-6 text-center transition duration-200"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-800 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 flex items-center justify-center mx-auto text-zinc-400 transition mb-3">
                <Upload size={20} />
              </div>
              <p className="text-sm font-medium text-white">
                {selectedFile ? selectedFile.name : "Click or drag & drop to choose photo"}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                PNG, JPG, or WEBP up to 10MB (Cloudinary optimized)
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedFile || isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Upload &amp; Save Photo</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Image URL */}
        {activeTab === "url" && (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">
                Direct Image Link (HTTPS)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/my-photo.jpg"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-white focus:border-indigo-500 outline-none"
              />
              <p className="text-[11px] text-zinc-500 mt-1.5">
                Paste any publicly accessible URL (GitHub avatar, Cloudinary, LinkedIn, Unsplash, etc.)
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!imageUrl.trim() || isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Apply Image URL</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Presets & Account Avatar */}
        {activeTab === "presets" && (
          <div className="space-y-4">
            {/* Account Profile Avatar */}
            {(user?.avatar || portfolio.user?.avatar) && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center gap-3">
                  <img
                    src={user?.avatar || portfolio.user?.avatar}
                    alt="Account Avatar"
                    className="w-10 h-10 rounded-xl object-cover border border-indigo-500/30"
                  />
                  <div>
                    <h5 className="text-xs font-semibold text-white">
                      Your Account Avatar
                    </h5>
                    <p className="text-[11px] text-zinc-400">
                      Sync from your PortfolioAI user profile
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() =>
                    handleApplyPreset(
                      user?.avatar || portfolio.user?.avatar,
                      "Account photo",
                    )
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs font-semibold text-indigo-300 hover:text-white transition cursor-pointer"
                >
                  Use This
                </button>
              </div>
            )}

            {/* GitHub Avatar Quick Fetch */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
              <label className="text-xs font-semibold text-white block">
                Fetch from GitHub Username
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value)}
                  placeholder="e.g. torvalds, anushka1801garg"
                  className="flex-1 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                />
                <button
                  type="button"
                  disabled={!githubUser.trim() || isSubmitting}
                  onClick={() =>
                    handleApplyPreset(
                      `https://github.com/${githubUser.trim()}.png`,
                      "GitHub avatar",
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition disabled:opacity-50 cursor-pointer"
                >
                  Fetch
                </button>
              </div>
            </div>

            {/* Remove photo option */}
            <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isSubmitting || !currentAvatar}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 disabled:opacity-40 transition cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Remove Photo (Use Monogram)</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangePhotoModal;
