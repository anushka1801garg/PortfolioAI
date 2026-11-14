const MissingKeywords = ({ keywords }) => {
  return (
    <div className="rounded-xl bg-zinc-900 p-6">
      <h2 className="text-2xl font-bold mb-4">Missing Keywords</h2>

      <div className="flex flex-wrap gap-3">
        {keywords.map((item, index) => (
          <span
            key={index}
            className="bg-red-500/20 text-red-400 px-4 py-2 rounded-full font-medium"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MissingKeywords;
