import Container from "../../../../components/ui/Container/Container";
import HeroContent from "./HeroContent";
import PortfolioPreview from "./PortfolioPreview";

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#09090B]">
      {/* Ambient Glows */}
      <div className="absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-indigo-600/15 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[180px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[700px] bg-purple-600/10 blur-[160px] pointer-events-none" />

      {/* Cybernetic Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-60" />

      <Container className="relative z-10 grid min-h-screen items-center gap-10 lg:gap-14 pt-28 pb-12 md:pb-16 lg:grid-cols-2">
        <HeroContent />
        <PortfolioPreview />
      </Container>
    </section>
  );
};

export default Hero;
