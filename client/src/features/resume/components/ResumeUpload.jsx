import { useRef } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import { uploadResume } from "../../../redux/resume/resumeSlice";

const ResumeUpload = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const handleUpload = async () => {
    const selectedFile = fileInputRef.current?.files?.[0];

    if (!selectedFile) {
      toast.error("Please select a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", selectedFile);

    const result = await dispatch(uploadResume(formData));

    if (uploadResume.fulfilled.match(result)) {
      toast.success("Resume uploaded successfully");

      // Clear the file input
      fileInputRef.current.value = "";
    } else {
      toast.error(result.payload || "Upload failed");
    }
  };

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-6">
      <h2 className="mb-4 text-2xl font-bold">Upload Resume</h2>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="mb-4 block w-full rounded border border-zinc-600 p-2"
      />

      <button
        onClick={handleUpload}
        className="rounded bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700"
      >
        Upload Resume
      </button>
    </div>
  );
};

export default ResumeUpload;
