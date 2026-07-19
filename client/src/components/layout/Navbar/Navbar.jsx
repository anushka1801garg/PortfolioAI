import { Link } from "react-router-dom";
import Container from "../../ui/Container/Container";
import Button from "../../ui/Button/Button";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-white/10">
      <Container>
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold">
            <span className="text-[var(--color-primary)]">Portfolio</span>
            <span className="text-white">AI</span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/">Home</Link>
            <a href="#features">Features</a>
            <a href="#templates">Templates</a>
            <a href="#pricing">Pricing</a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-[var(--color-muted)] hover:text-white transition"
            >
              Login
            </Link>

            <Button size="sm">Get Started</Button>
          </div>
        </nav>
      </Container>
    </header>
  );
};

export default Navbar;
