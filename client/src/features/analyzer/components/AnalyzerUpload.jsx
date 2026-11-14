import { useRef } from "react";
import { useDispatch } from "react-redux";

import {
  analyzeResume,
  setResumeFile,
} from "../../../redux/analyzer/analyzerSlice";
import toast from "react-hot-toast";

const AnalyzerUpload = () => {
  const dispatch = useDispatch();
  const inputRef = useRef();

  const handleAnalyze = async () => {
    const file = inputRef.current.files[0];

    if (!file) {
      return toast.error("Select Resume");
    }

    const formData = new FormData();

    formData.append("resume", file);
    dispatch(setResumeFile(file));

    const result = await dispatch(analyzeResume(formData));

    if (analyzeResume.fulfilled.match(result)) {
      toast.success("Analysis Completed");
    } else {
      toast.error(result.payload);
    }
  };

  return (
    <div className="rounded-xl bg-zinc-900 p-6 border border-zinc-700">
      <h2 className="text-2xl font-bold mb-5">ATS Resume Analyzer</h2>

      <input ref={inputRef} type="file" accept=".pdf" className="mb-5" />

      <button
        onClick={handleAnalyze}
        className="bg-indigo-600 px-5 py-2 rounded hover:bg-indigo-700"
      >
        Analyze Resume
      </button>
    </div>
  );
};

export default AnalyzerUpload;
