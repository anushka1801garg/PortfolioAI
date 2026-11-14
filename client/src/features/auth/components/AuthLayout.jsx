import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-[#09090B] relative overflow-hidden flex items-center justify-center px-6 py-16">
      {/* Background Blur */}
      <div className="absolute left-0 top-0 h-[450px] w-[450px] rounded-full bg-indigo-600/20 blur-[180px]" />

      <div className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[160px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <Link
          to="/"
          className="mb-8 inline-block text-3xl font-bold text-white"
        >
          PortfolioAI
        </Link>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-xl p-10 shadow-2xl">
          <h1 className="text-4xl font-bold text-white">{title}</h1>

          <p className="mt-3 text-zinc-400">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
