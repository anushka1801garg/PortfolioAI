const WorkspaceBackdrop = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden z-0"
    >
      {/* Top-left indigo ambient glow */}
      <div className="absolute -top-32 -left-24 h-[480px] w-[480px] rounded-full bg-indigo-600/18 blur-[150px]" />
      {/* Top-right purple ambient glow */}
      <div className="absolute top-12 -right-24 h-[440px] w-[440px] rounded-full bg-purple-600/15 blur-[150px]" />
      {/* Lower-center cyan accent glow */}
      <div className="absolute bottom-0 left-1/3 h-[420px] w-[520px] rounded-full bg-cyan-500/10 blur-[160px]" />
      {/* Subtle architectural grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_at_top,black_45%,transparent_90%)]" />
    </div>
  );
};

export default WorkspaceBackdrop;

