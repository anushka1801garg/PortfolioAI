import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Star,
  ArrowRight,
  Users,
  TrendingUp,
  Zap,
} from 'lucide-react';
import Container from "../../../../components/ui/Container/Container";
import Section from "../../../../components/ui/Section/Section";
import TestimonialCard from "./TestimonialCard";

const reviews = [
  {
    id: 1,
    name: "Anushka Sharma",
    role: "Full Stack Engineer",
    company: "Razorpay",
    category: "fullstack",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    review:
      "I uploaded my messy 2-page PDF resume, and within 10 minutes PortfolioAI generated a stunning glassmorphic portfolio with live demo links. Recruiter from Razorpay literally cited my portfolio layout during the interview!",
    metric: "🚀 4 Interview Calls in 1 Week",
    rating: 5,
    tags: ["#FullStack", "#NextJS", "#CareerUpgrade"],
    verified: true,
  },
  {
    id: 2,
    name: "Rahul Verma",
    role: "Software Engineer II",
    company: "Microsoft",
    category: "fullstack",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    review:
      "The ATS analyzer highlighted missing keywords and formatting flaws that were costing me recruiter callbacks. After optimizing and sharing the live portfolio link, my interview response rate skyrocketed.",
    metric: "⚡ ATS Score jumped 61 → 94",
    rating: 5,
    tags: ["#ATSAnalyzer", "#SystemDesign", "#Backend"],
    verified: true,
  },
  {
    id: 3,
    name: "Priya Nair",
    role: "Lead Design Engineer",
    company: "Swiggy",
    category: "frontend",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    review:
      "The Creative Cyberpunk & Minimal Swiss templates are legitimately better designed than 95% of custom portfolios I review as an interviewer. Zero boilerplate, responsive everywhere, pure developer aesthetic.",
    metric: "🎨 Landed Senior Role",
    rating: 5,
    tags: ["#Frontend", "#UIUX", "#DesignSystems"],
    verified: true,
  },
  {
    id: 4,
    name: "Arjun Mehta",
    role: "Machine Learning Engineer",
    company: "Zomato",
    category: "ai",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    review:
      "The AI portfolio generator extracted my Hugging Face models, GitHub repos, and publications with zero errors. The live preview builder saved me at least 3 weekends of tedious frontend coding.",
    metric: "🤖 Built in 3 Minutes",
    rating: 5,
    tags: ["#MachineLearning", "#Python", "#AIProjects"],
    verified: true,
  },
  {
    id: 5,
    name: "Devanshi Patel",
    role: "Open Source & DevRel",
    company: "Postman",
    category: "frontend",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80",
    review:
      "Being able to share a custom portfolio link directly on LinkedIn and GitHub got me inbound freelance contracts within a fortnight. The mobile responsiveness and dark mode are world class.",
    metric: "🌐 25k+ Portfolio Views",
    rating: 5,
    tags: ["#DevRel", "#OpenSource", "#InboundOffers"],
    verified: true,
  },
  {
    id: 6,
    name: "Karan Singhania",
    role: "CS Graduate",
    company: "IIT Delhi → Uber",
    category: "students",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    review:
      "As a student with no professional web design background, I was intimidated by building a portfolio from scratch. PortfolioAI made my projects look like a 5-year veteran dev. Got offers from two dream companies.",
    metric: "💼 3 Offers Received",
    rating: 5,
    tags: ["#CampusHiring", "#FirstJob", "#StudentSuccess"],
    verified: true,
  },
];

const categories = [
  { id: "all", label: "All Stories" },
  { id: "fullstack", label: "Full Stack & Backend" },
  { id: "frontend", label: "Frontend & UI/UX" },
  { id: "ai", label: "AI & Data" },
  { id: "students", label: "Students & Freshers" },
];

const stats = [
  {
    icon: Star,
    value: "4.9 / 5",
    label: "Average Rating",
    detail: "From 12,000+ reviews",
    color: "text-amber-400",
  },
  {
    icon: Users,
    value: "15,000+",
    label: "Developers Hired",
    detail: "At Google, Microsoft, Meta",
    color: "text-indigo-400",
  },
  {
    icon: TrendingUp,
    value: "3.4x",
    label: "Higher Callback Rate",
    detail: "Compared to generic resumes",
    color: "text-emerald-400",
  },
  {
    icon: Zap,
    value: "< 10 Mins",
    label: "Build to Live",
    detail: "Zero manual HTML/CSS",
    color: "text-purple-400",
  },
];

const Testimonials = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredReviews =
    activeCategory === "all"
      ? reviews
      : reviews.filter((r) => r.category === activeCategory);

  return (
    <Section className="relative bg-[#09090B] overflow-hidden">
      {/* Background Radial Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-indigo-600/10 via-purple-600/5 to-transparent blur-[120px] pointer-events-none" />

      <Container>
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles size={13} className="text-indigo-400" />
            <span>Wall of Love • Verified Developer Reviews</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Loved by{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Developers Worldwide
            </span>
          </h2>

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            From junior coders landing their first offer to staff engineers switching roles — see how PortfolioAI helps developers stand out and get hired.
          </p>
        </div>

        {/* Live Social Proof Stats Banner */}
        <div className="mt-8 md:mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-md p-4 sm:p-5 text-center transition-all duration-300 hover:border-indigo-500/40 hover:bg-zinc-900/80 shadow-lg shadow-black/20 group"
              >
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  <Icon size={18} className={`${stat.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {stat.value}
                  </span>
                </div>
                <p className="text-xs font-bold text-zinc-200">{stat.label}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">{stat.detail}</p>
              </div>
            );
          })}
        </div>

        {/* Category Filter Tabs */}
        <div className="mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/50 scale-105"
                  : "bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Testimonials Grid */}
        <motion.div
          layout
          className="mt-6 md:mt-8 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {filteredReviews.map((review) => (
              <TestimonialCard key={review.id} {...review} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Bottom Social Proof Callout Banner */}
        <div className="mt-10 md:mt-12 rounded-3xl border border-indigo-500/25 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-zinc-900/60 p-6 sm:p-8 md:p-10 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-500/5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
            {/* Overlapping Avatar Stack */}
            <div className="flex -space-x-3 overflow-hidden shrink-0">
              {reviews.slice(0, 4).map((r) => (
                <img
                  key={r.name}
                  className="inline-block h-11 w-11 rounded-full ring-2 ring-[#09090B] object-cover"
                  src={r.avatar}
                  alt={r.name}
                />
              ))}
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white ring-2 ring-[#09090B]">
                +15k
              </div>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Ready to build a portfolio that lands high-paying interviews?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Upload your resume, pick a template, and deploy your live developer portfolio in minutes.
              </p>
            </div>
          </div>

          <Link
            to="/portfolio-generator"
            className="shrink-0 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all duration-200 cursor-pointer active:scale-95 group"
          >
            <span>Create Your Portfolio</span>
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </Container>
    </Section>
  );
};

export default Testimonials;
