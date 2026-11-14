const SuggestionsCard = ({ improvements }) => {
  return (
    <div className="rounded-xl bg-zinc-900 p-6">
      <h2 className="text-2xl font-bold mb-4">Suggestions</h2>

      <ul className="space-y-3 list-disc ml-5">
        {improvements.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default SuggestionsCard;
