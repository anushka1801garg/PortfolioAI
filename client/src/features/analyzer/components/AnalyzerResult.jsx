import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Sparkles, ArrowRight } from "lucide-react";

import { generatePortfolio } from "../../../redux/portfolioGenerator/portfolioGeneratorSlice";

import ATSScoreCard from "./ATSScoreCard";
import MissingKeywords from "./MissingKeywords";
import SuggestionsCard from "./SuggestionsCard";
import ResumePreview from "./ResumePreview";

const AnalyzerResult = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { analysis, loading, resumeFile } = useSelector(
    (state) => state.analyzer,
  );

  const { loading: generatorLoading } = useSelector(
    (state) => state.portfolioGenerator,
  );

  const handleGeneratePortfolio = async () => {
    if (!resumeFile) {
      toast.error("Please upload and analyze a resume first.");
      return;
    }

    toast.loading("Generating your AI portfolio...", { id: "portfolio-gen" });

    const formData = new FormData();
    formData.append("resume", resumeFile);

    const result = await dispatch(generatePortfolio(formData));

    toast.dismiss("portfolio-gen");

    if (generatePortfolio.fulfilled.match(result)) {
      toast.success("Portfolio generated successfully! ✨");
      navigate("/portfolio-generator", { state: { fromAnalyzer: true } });
    } else {
      toast.error(result.payload || "Failed to generate portfolio.");
    }
  };

  if (loading) {
    return (
      <div className="mt-10 rounded-2xl bg-zinc-900/90 p-12 text-center border border-zinc-800 shadow-xl">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-white mb-2">
          AI is analyzing your resume...
        </h2>
        <p className="text-zinc-400 max-w-md mx-auto">
          Parsing technical skills, experience depth, ATS formatting, and keyword density.
        </p>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="mt-10 max-w-7xl mx-auto space-y-8">
      <ResumePreview file={resumeFile} analysis={analysis} />

      <ATSScoreCard score={analysis.atsScore} />

      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-white">Professional Summary</h2>
        <p className="text-zinc-300 leading-8 text-lg">{analysis.summary}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="rounded-2xl bg-zinc-900/90 border border-emerald-500/20 shadow-lg p-8">
          <h2 className="text-2xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
            <span>✅</span> Strengths
          </h2>

          <ul className="space-y-4">
            {analysis.strengths?.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-zinc-300 leading-relaxed">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-zinc-900/90 border border-rose-500/20 shadow-lg p-8">
          <h2 className="text-2xl font-bold text-rose-400 mb-6 flex items-center gap-2">
            <span>⚠️</span> Areas for Improvement
          </h2>

          <ul className="space-y-4">
            {analysis.weaknesses?.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-zinc-300 leading-relaxed">
                <span className="text-rose-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <MissingKeywords keywords={analysis.missingKeywords} />

      <SuggestionsCard improvements={analysis.improvements} />

      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-indigo-950/40 p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-2">
          Turn This Resume Into a Live Portfolio
        </h3>
        <p className="text-zinc-400 max-w-xl mx-auto mb-6">
          Our AI will convert your extracted skills, experiences, and projects into a polished developer portfolio website in seconds.
        </p>

        <button
          onClick={handleGeneratePortfolio}
          disabled={generatorLoading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 transition px-8 py-4 rounded-xl text-lg font-semibold text-white inline-flex items-center gap-3 shadow-lg shadow-indigo-600/30 cursor-pointer"
        >
          {generatorLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating Portfolio...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Generate AI Portfolio</span>
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AnalyzerResult;
