import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FileText, ExternalLink, Trash2, Sparkles } from "lucide-react";

import { deleteResume } from "../../../redux/resume/resumeSlice";

const ResumeCard = ({ resume }) => {
  const dispatch = useDispatch();

  const handleDelete = async () => {
    const confirmDelete = window.confirm(`Delete resume "${resume.title}"?`);

    if (!confirmDelete) return;

    const result = await dispatch(deleteResume(resume._id));

    if (deleteResume.fulfilled.match(result)) {
      toast.success("Resume deleted successfully");
    } else {
      toast.error(result.payload || "Delete failed");
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
          <FileText size={24} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white truncate" title={resume.title}>
            {resume.title}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Uploaded {resume.createdAt ? new Date(resume.createdAt).toLocaleDateString() : "Recently"}
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => window.open(resume.resumeUrl, "_blank")}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-medium text-white transition"
          >
            <ExternalLink size={12} />
            <span>View PDF</span>
          </button>

          <Link
            to="/analyzer"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 px-3 py-1.5 text-xs font-medium text-indigo-300 transition"
          >
            <Sparkles size={12} />
            <span>Analyze ATS</span>
          </Link>
        </div>

        <button
          onClick={handleDelete}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          title="Delete Resume"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default ResumeCard;
