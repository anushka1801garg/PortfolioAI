const Heading = ({ title, subtitle, align = "center" }) => {
  const isCenter = align === "center";
  return (
    <div className={`space-y-4 ${isCenter ? "text-center" : "text-left"}`}>
      <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
        {title}
      </h2>

      {subtitle && (
        <p
          className={`text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed ${
            isCenter ? "mx-auto" : ""
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default Heading;
