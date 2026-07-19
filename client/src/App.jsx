import Container from "./components/ui/Container/Container";
import { Heading, Text } from "./components/ui/Typography/Typography";
import Button from "./components/ui/Button/Button";

function App() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <Container>
        <div className="py-32">
          <Heading>
            Welcome to{" "}
            <span className="text-[var(--color-primary)]">PortfolioAI</span>
          </Heading>

          <Text className="mt-6 max-w-xl">
            AI-powered portfolio builder and analyzer.
          </Text>

          <div className="flex gap-4 mt-10">
            <Button>Generate Portfolio</Button>

            <Button variant="outline">Learn More</Button>

            <Button variant="danger">Delete</Button>
          </div>
        </div>
      </Container>
    </main>
  );
}

export default App;
