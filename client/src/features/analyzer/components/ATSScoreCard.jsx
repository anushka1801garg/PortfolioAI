const ATSScoreCard = ({ score }) => {
  let color = "text-red-500";

  if (score >= 80) color = "text-green-500";
  else if (score >= 60) color = "text-yellow-400";

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold">ATS Score</h2>

        <p className="text-zinc-400 mt-2">AI evaluation of your resume.</p>
      </div>

      <div className={`text-7xl font-bold ${color}`}>
        {score}
        <span className="text-3xl text-zinc-500">/100</span>
      </div>
    </div>
  );
};

export default ATSScoreCard;
