const TemplateCard = ({ template }) => {
  return (
    <div className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-indigo-500">
      <div className="h-64 overflow-hidden">
        <img
          src={template.image}
          alt={template.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />
      </div>

      <div className="p-7">
        <h2 className="text-2xl font-bold text-white">{template.title}</h2>

        <p className="mt-4 text-gray-400">{template.description}</p>

        <button className="mt-8 w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700">
          Use Template
        </button>
      </div>
    </div>
  );
};

export default TemplateCard;
