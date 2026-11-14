import Container from "../../../../components/ui/Container/Container";

const Footer = () => {
  return (
    <footer className="border-t border-zinc-800 bg-[#09090B] py-12 md:py-16">
      <Container>
        <div className="grid gap-8 md:gap-12 md:grid-cols-4">
          <div>
            <h2 className="text-3xl font-bold text-white">PortfolioAI</h2>

            <p className="mt-4 text-zinc-400 leading-relaxed text-sm">
              Build beautiful AI-powered developer portfolios within minutes.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-base font-semibold text-white">Product</h3>

            <div className="space-y-2.5 text-sm text-zinc-400">
              <p>Features</p>
              <p>Templates</p>
              <p>Pricing</p>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-base font-semibold text-white">Company</h3>

            <div className="space-y-2.5 text-sm text-zinc-400">
              <p>About</p>
              <p>Careers</p>
              <p>Contact</p>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-base font-semibold text-white">Resources</h3>

            <div className="space-y-2.5 text-sm text-zinc-400">
              <p>Documentation</p>
              <p>Privacy Policy</p>
              <p>Terms</p>
            </div>
          </div>
        </div>

        <div className="mt-10 md:mt-12 border-t border-zinc-800/80 pt-6 text-center text-xs text-zinc-500">
          © 2026 PortfolioAI. All Rights Reserved.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
