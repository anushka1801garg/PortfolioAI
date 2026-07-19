import clsx from "clsx";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  onClick,
  type = "button",
}) => {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 px-6 py-3";

  const variants = {
    primary:
      "bg-[var(--color-primary)] text-white hover:bg-indigo-600 shadow-lg hover:shadow-indigo-500/30",

    secondary: "bg-[var(--color-secondary)] text-white hover:bg-violet-600",

    outline:
      "border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white",

    ghost: "bg-transparent text-white hover:bg-white/10",

    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        (disabled || loading) && "opacity-50 cursor-not-allowed",
      )}
    >
      {leftIcon}

      {loading ? "Loading..." : children}

      {rightIcon}
    </button>
  );
};

export default Button;
