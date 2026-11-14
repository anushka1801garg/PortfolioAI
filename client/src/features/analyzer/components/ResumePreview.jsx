import { FileText, CheckCircle2 } from "lucide-react";

const ResumePreview = ({ file, analysis }) => {
  if (!file && !analysis) return null;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
          <FileText size={24} />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">
            {file ? file.name : "Analyzed Resume"}
          </h3>
          <p className="text-sm text-zinc-400">
            {file ? `${(file.size / 1024).toFixed(1)} KB • PDF Document` : "PDF Document"}
          </p>
        </div>

        {analysis && (
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={14} />
            <span>Analysis Complete</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
