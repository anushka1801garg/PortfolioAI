const Badge = ({ children }) => {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300">
      {children}
    </div>
  );
};

export default Badge;
