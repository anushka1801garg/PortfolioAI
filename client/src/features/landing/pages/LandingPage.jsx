import Navbar from "../../../components/layout/Navbar/Navbar";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-white">
      <Navbar />

      <main>
        <section className="h-[90vh] flex items-center justify-center">
          <h1 className="text-6xl font-bold">Hero Section Coming Soon</h1>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
