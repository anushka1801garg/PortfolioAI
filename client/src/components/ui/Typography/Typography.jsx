const Heading = ({ children, level = 1, className = "" }) => {
  const Tag = `h${level}`;

  const sizes = {
    1: "text-6xl md:text-7xl font-bold",
    2: "text-5xl font-bold",
    3: "text-4xl font-semibold",
    4: "text-3xl font-semibold",
    5: "text-2xl font-medium",
    6: "text-xl font-medium",
  };

  return <Tag className={`${sizes[level]} ${className}`}>{children}</Tag>;
};

const Text = ({ children, className = "" }) => {
  return (
    <p className={`text-lg text-[var(--color-muted)] ${className}`}>
      {children}
    </p>
  );
};

export { Heading, Text };
