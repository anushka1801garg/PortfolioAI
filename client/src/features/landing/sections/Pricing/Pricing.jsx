import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shield, CheckCircle2 } from 'lucide-react';
import toast from "react-hot-toast";

import Container from "../../../../components/ui/Container/Container";
import Section from "../../../../components/ui/Section/Section";
import Heading from "../../../../components/ui/Heading/Heading";

import PricingCard from "./PricingCard";
import PaymentModal from "../../../subscription/components/PaymentModal";

const plans = [
  {
    id: "free",
    title: "Free",
    price: "0",
    annualMonthlyPrice: "0",
    annualTotal: "0",
    description: "Perfect for students & freshers building their first portfolio.",
    features: [
      "1 Live Portfolio",
      "Minimal & Creative Templates",
      "Basic ATS Analyzer",
      "Community Support",
    ],
  },
  {
    id: "pro",
    title: "Pro",
    price: "499",
    annualMonthlyPrice: "375",
    annualTotal: "4,499",
    savings: "Save ₹1,489 / yr (25% OFF)",
    description: "Best for active job hunters & developers wanting maximum interview calls.",
    highlighted: true,
    features: [
      "Unlimited Portfolios",
      "All 14 Designer Themes & Templates",
      "Deep ATS Scanner & Keyword Optimizer",
      "AI Portfolio Generator (Resume to Live)",
      "Priority Recruiter Analytics",
      "Custom Subdomain & CDN Edge",
    ],
  },
  {
    id: "team",
    title: "Team",
    price: "999",
    annualMonthlyPrice: "749",
    annualTotal: "8,999",
    savings: "Save ₹2,989 / yr (25% OFF)",
    description: "For agencies, bootcamps, and developer teams hiring at scale.",
    features: [
      "Everything in Pro",
      "Team Workspaces & Shared Repos",
      "Cohort ATS Analytics Dashboard",
      "Admin Controls & Member Invites",
      "Dedicated Onboarding Support",
    ],
  },
];

const upgradeEvents = [
  "⚡ Full Stack Engineer in Bengaluru upgraded to Pro • 2m ago",
  "🚀 Senior Dev in Hyderabad unlocked Pro Templates • 7m ago",
  "💼 Software Engineer at Razorpay subscribed to Pro • 16m ago",
  "🔥 Machine Learning Dev in Pune unlocked All Templates • 28m ago",
];

const Pricing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [billingCycle, setBillingCycle] = useState("monthly"); // 'monthly' | 'annual'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [eventIdx, setEventIdx] = useState(0);

  const userPlan = (user?.plan || "free").toLowerCase();

  useEffect(() => {
    const timer = setInterval(() => {
      setEventIdx((prev) => (prev + 1) % upgradeEvents.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      navigate("/register", {
        state: {
          plan: plan.id,
          billingCycle,
          from: "#pricing",
          message: `Create an account to start with the ${plan.title} plan.`,
        },
      });
      return;
    }

    if (plan.price === "0") {
      if (userPlan === "free") {
        toast("You are currently enjoying the Free Plan! 🚀", {
          icon: "ℹ️",
        });
      }
      navigate("/dashboard");
      return;
    }

    if (userPlan === plan.id) {
      toast.success(`You are already subscribed to the ${plan.title} plan!`);
      navigate("/dashboard");
      return;
    }

    // Pass active plan with calculated price for annual or monthly
    const finalPlan = {
      ...plan,
      billingCycle,
      billedPrice: billingCycle === "annual" ? plan.annualTotal : plan.price,
    };

    setSelectedPlan(finalPlan);
    setIsPaymentModalOpen(true);
  };

  return (
    <Section className="relative overflow-hidden bg-[#09090B]">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-600/10 blur-[180px] pointer-events-none" />

      <Container>
        <div className="text-center max-w-3xl mx-auto space-y-3">
          {/* Live Recent Upgrades Ticker */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-xs text-zinc-300 shadow-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={eventIdx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="font-mono text-[11px] text-zinc-300 truncate"
              >
                {upgradeEvents[eventIdx]}
              </motion.span>
            </AnimatePresence>
          </div>

          <Heading
            title="Simple, Transparent Developer Pricing"
            subtitle="Start free, upgrade when you're actively interviewing. No hidden fees or lock-ins."
          />

          {/* Interactive Billing Frequency Switcher */}
          <div className="pt-4 flex items-center justify-center">
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-900 border border-white/10 shadow-inner">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Monthly Billing
              </button>

              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === "annual"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>Annual (Save 25%)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 font-extrabold uppercase">
                  2 Mo Free
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-10 md:mt-12 grid gap-6 sm:gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard
              key={plan.title}
              plan={plan}
              billingCycle={billingCycle}
              isAuthenticated={isAuthenticated}
              isCurrentPlan={isAuthenticated && userPlan === plan.id}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-emerald-400" />
            <span>14-Day Money Back Guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-400" />
            <span>Instant Plan Activation</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-indigo-400" />
            <span>UPI, NetBanking & Cards Supported</span>
          </div>
        </div>

        {/* Payment Details Modal */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          plan={selectedPlan}
          user={user}
        />
      </Container>
    </Section>
  );
};

export default Pricing;
