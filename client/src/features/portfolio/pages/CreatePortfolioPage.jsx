import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Sparkles, Plus, Trash2 } from "lucide-react";

import { createPortfolio } from "../../../redux/portfolio/portfolioSlice";

const CreatePortfolioPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.portfolio);

  const [formData, setFormData] = useState({
    title: "",
    name: "",
    tagline: "",
    about: "",
    template: "modern",
    status: "Published",
    github: "",
    linkedin: "",
    website: "",
    email: "",
    phone: "",
    skillsString: "",
    projects: [
      { title: "", description: "", tags: [], github: "", live: "" },
    ],
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddProject = () => {
    setFormData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { title: "", description: "", tags: [], github: "", live: "" },
      ],
    }));
  };

  const handleRemoveProject = (index) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const handleProjectChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.projects];
      if (field === "tags") {
        updated[index] = {
          ...updated[index],
          tags: value.split(",").map((t) => t.trim()).filter(Boolean),
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return { ...prev, projects: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return toast.error("Please provide a title for your portfolio.");
    }

    const skills = formData.skillsString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const validProjects = formData.projects.filter((p) => p.title.trim());

    const payload = {
      ...formData,
      skills,
      projects: validProjects,
      description: formData.about,
      isPublic: formData.status === "Published",
      creationType: "template",
      inputSource: "form",
    };
    delete payload.skillsString;

    const result = await dispatch(createPortfolio(payload));

    if (createPortfolio.fulfilled.match(result)) {
      toast.success("Portfolio Created Successfully! 🎉");
      navigate(`/portfolio/${result.payload._id}`);
    } else {
      toast.error(result.payload || "Failed to create portfolio.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/portfolio"
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Create New Portfolio</h1>
              <p className="text-zinc-400 text-sm mt-0.5">
                Build your developer showcase from scratch or choose a template.
              </p>
            </div>
          </div>

          <Link
            to="/portfolio-generator"
            className="flex items-center gap-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 px-4 py-2.5 text-sm font-semibold transition"
          >
            <Sparkles size={16} />
            <span>Generate with AI instead</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Information */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-5">
            <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-3">
              Basic Details
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block">Portfolio Title *</label>
                <input
                  required
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 outline-none"
                  placeholder="e.g. Senior Fullstack Portfolio"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block">Your Name</label>
                <input
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 outline-none"
                  placeholder="e.g. Alex Morgan"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">Tagline / Professional Headline</label>
              <input
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 outline-none"
                placeholder="e.g. Full Stack Engineer specializing in React, Node, and Cloud"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">About Biography</label>
              <textarea
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 outline-none"
                placeholder="Write a short, engaging description about your journey and what you build..."
                rows={4}
                name="about"
                value={formData.about}
                onChange={handleChange}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block">Template Style</label>
                <select
                  name="template"
                  value={formData.template}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 outline-none capitalize"
                >
                  <option value="modern">Modern (Dark Glassmorphic)</option>
                  <option value="minimal">Minimal (Clean Monochrome)</option>
                  <option value="creative">Creative (Vibrant & Bold)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block">Visibility Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 outline-none"
                >
                  <option value="Published">Published (Public)</option>
                  <option value="Draft">Draft (Private)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-3">
              Skills & Tech Stack
            </h2>

            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">
                Skills (comma separated)
              </label>
              <input
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 outline-none"
                placeholder="React, TypeScript, Node.js, Express, Tailwind CSS, PostgreSQL, Docker"
                name="skillsString"
                value={formData.skillsString}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Projects */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-xl font-bold text-white">Projects</h2>
              <button
                type="button"
                onClick={handleAddProject}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                <Plus size={16} />
                <span>Add Project</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-400">
                      Project #{idx + 1}
                    </span>
                    {formData.projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(idx)}
                        className="text-zinc-500 hover:text-rose-400 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <input
                    placeholder="Project Title"
                    value={proj.title}
                    onChange={(e) =>
                      handleProjectChange(idx, "title", e.target.value)
                    }
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-sm text-white focus:border-indigo-500 outline-none"
                  />

                  <textarea
                    rows={2}
                    placeholder="Project Description"
                    value={proj.description}
                    onChange={(e) =>
                      handleProjectChange(idx, "description", e.target.value)
                    }
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-sm text-white focus:border-indigo-500 outline-none"
                  />

                  <input
                    placeholder="Tags (comma separated, e.g. React, Redux, Node.js)"
                    value={proj.tags ? proj.tags.join(", ") : ""}
                    onChange={(e) =>
                      handleProjectChange(idx, "tags", e.target.value)
                    }
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-sm text-white focus:border-indigo-500 outline-none"
                  />

                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      placeholder="GitHub Link"
                      value={proj.github}
                      onChange={(e) =>
                        handleProjectChange(idx, "github", e.target.value)
                      }
                      className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-sm text-white focus:border-indigo-500 outline-none"
                    />
                    <input
                      placeholder="Live Demo Link"
                      value={proj.live}
                      onChange={(e) =>
                        handleProjectChange(idx, "live", e.target.value)
                      }
                      className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-sm text-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-3">
              Contact & Links
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block">Email</label>
                <input
                  type="email"
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 outline-none"
                  placeholder="contact@domain.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block">Phone</label>
                <input
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 outline-none"
                  placeholder="+1 (555) 000-0000"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block">GitHub</label>
                <input
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 outline-none"
                  placeholder="https://github.com/..."
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block">LinkedIn</label>
                <input
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 outline-none"
                  placeholder="https://linkedin.com/in/..."
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block">Website</label>
                <input
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 outline-none"
                  placeholder="https://yoursite.com"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link
              to="/portfolio"
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-3 text-sm font-semibold text-zinc-300 hover:text-white transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-8 py-3 text-sm font-semibold text-white transition shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              {loading ? "Creating..." : "Create Portfolio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePortfolioPage;
