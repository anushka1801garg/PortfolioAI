import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { UploadCloud, FileText, CheckCircle } from "lucide-react";
import {
  analyzeResume,
  setResumeFile,
} from "../../../redux/analyzer/analyzerSlice";

const ResumeUploadCard = () => {
  const dispatch = useDispatch();
  const inputRef = useRef();
  const [selectedFileName, setSelectedFileName] = useState("");
  const { loading } = useSelector((state) => state.analyzer);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      dispatch(setResumeFile(file));
    }
  };

  const handleAnalyze = async () => {
    const file = inputRef.current?.files?.[0];

    if (!file) {
      return toast.error("Please select a PDF resume first.");
    }

    dispatch(setResumeFile(file));

    const formData = new FormData();
    formData.append("resume", file);

    const result = await dispatch(analyzeResume(formData));

    if (analyzeResume.fulfilled.match(result)) {
      toast.success("Resume analyzed successfully!");
    } else {
      toast.error(result.payload || "Analysis failed");
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
      <h2 className="text-3xl font-bold mb-2">AI Resume Analysis</h2>

      <p className="text-zinc-400 mb-8">
        Upload your resume and receive an AI-powered ATS score, strengths, and actionable improvements.
      </p>

      <div className="border-2 border-dashed border-zinc-700 hover:border-indigo-500/60 transition rounded-xl p-10 flex flex-col items-center">
        <UploadCloud size={56} className="text-indigo-400 mb-4 animate-bounce" />

        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="mb-4 text-sm text-zinc-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
        />

        {selectedFileName && (
          <div className="flex items-center gap-2 text-green-400 mb-4 bg-green-500/10 px-4 py-2 rounded-lg text-sm border border-green-500/20">
            <CheckCircle size={16} />
            <span>Ready: {selectedFileName}</span>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition px-8 py-3 rounded-xl font-semibold flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Analyzing with AI...
            </>
          ) : (
            <>
              <FileText size={18} />
              Analyze Resume
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ResumeUploadCard;
