const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900/70
        backdrop-blur-xl
        p-8
        lg:p-10
        transition-all
        duration-300
        hover:-translate-y-2
        hover:border-indigo-500
        hover:shadow-[0_0_40px_rgba(99,102,241,0.3)]
        ${className}
        `}
    >
      {children}
    </div>
  );
};

export default Card;
