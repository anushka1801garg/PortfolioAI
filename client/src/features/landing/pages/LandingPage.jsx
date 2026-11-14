import Hero from "../sections/Hero";
import TrustedCompanies from "../sections/TrustedCompanies";
import Features from "../sections/Features";
import Templates from "../sections/Templates";
import Pricing from "../sections/Pricing";
import Testimonials from "../sections/Testimonials";
import CTA from "../sections/CTA";
import Footer from "../sections/Footer";
import Navbar from "../../../components/layout/Navbar/Navbar";
import SEO from "../../../components/common/SEO";

const LandingPage = () => {
  return (
    <div className="bg-[#09090B] text-white">
      <SEO
        title="PortfolioAI — Executive & Award-Winning AI Portfolios"
        description="Transform your resume into a stunning, production-ready developer portfolio in 30 seconds with PortfolioAI. Real-time AI styling, ATS scoring, and edge CDN hosting."
        keywords={[
          "AI portfolio builder",
          "developer portfolio",
          "ATS resume analyzer",
          "executive portfolio",
          "portfolio generator",
          "GitHub portfolio sync",
          "award winning developer websites",
        ]}
        canonical="/"
      />
      <Navbar />

      <div id="home">
        <Hero />
      </div>

      <TrustedCompanies />

      <div id="features">
        <Features />
      </div>

      <div id="templates">
        <Templates />
      </div>

      <div id="pricing">
        <Pricing />
      </div>

      <Testimonials />

      <CTA />

      <Footer />
    </div>
  );
};

export default LandingPage;
