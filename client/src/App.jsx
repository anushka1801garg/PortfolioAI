import Container from "./components/ui/Container/Container";

function App() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <Container>
        <div className="py-32">
          <h1 className="text-6xl font-bold">
            Welcome to{" "}
            <span className="text-[var(--color-primary)]">PortfolioAI</span>
          </h1>

          <p className="text-[var(--color-muted)] mt-6 text-xl max-w-xl">
            AI-powered portfolio builder and analyzer.
          </p>
        </div>
      </Container>
    </main>
  );
}

export default App;
