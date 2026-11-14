import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  Sparkles,
  Zap,
  Shield,
  X,
  Star,
  Crown,
  Layers,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../../services/api";
import {
  openRazorpayCheckout,
  getPaymentConfig,
} from "../../features/subscription/services/paymentService";
import { updateUserPlan } from "../../redux/auth/authSlice";
import { fetchProfile } from "../../redux/profile/profileSlice";

const TIERS = [
  {
    id: "free",
    name: "Free Starter",
    category: "Individual",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Perfect for getting started and test-driving the AI portfolio builder.",
    features: [
      "2 Active Portfolios",
      "4 Core Templates (Minimal, Modern, Dev, Corp)",
      "Standard AI Resume Parsing & Generation",
      "ATS Score & Keyword Health Check",
      "Standard Portfolio Hosting URL",
      "Community Discord Support",
    ],
    highlight: false,
    badge: null,
    buttonText: "Current Plan",
  },
  {
    id: "pro",
    name: "Pro Engineer",
    category: "Most Popular",
    monthlyPrice: 19,
    annualPrice: 14,
    description: "Designed for engineers, designers, and tech talent aiming for top-tier offers.",
    features: [
      "Unlimited Active Portfolios",
      "All 14 Premium Templates (Apple, Cyberpunk, Glass, Google...)",
      "Unlimited AI Tailor Generations (by Role & Company)",
      "7-Category AI Portfolio Analyzer & Lighthouse Diagnostics",
      "AI Apply Changes with 1-Click Before vs After Diff",
      "Full Automated Version Snapshots & 1-Click Rollback",
      "Custom Domain & Free SSL Provisioning",
      "GitHub Live Repository Sync & Auto-Import",
      "Priority AI Generation Queue",
    ],
    highlight: true,
    badge: "RECOMMENDED",
    buttonText: "Upgrade to Pro",
  },
  {
    id: "team",
    name: "Team & Studio",
    category: "Organizations",
    monthlyPrice: 49,
    annualPrice: 39,
    description: "For design agencies, bootcamps, university cohorts, and recruitment teams.",
    features: [
      "Everything included in Pro",
      "Up to 10 Shared Team Member Seats",
      "Shared Custom Company Branding & Templates",
      "Batch Portfolio Generation from Candidate Resumes",
      "Collaborative Peer & Recruiter Feedback Mode",
      "Talent Analytics & Profile View Telemetry",
      "Dedicated Fast-Track Support & SLA",
    ],
    highlight: false,
    badge: "ENTERPRISE",
    buttonText: "Upgrade to Team",
  },
];

const UpgradeModal = ({
  isOpen,
  onClose,
  targetFeature = "Unlimited Portfolios & Pro Access",
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [upgrading, setUpgrading] = useState(false);
  const [billingCycle, setBillingCycle] = useState("annual"); // 'monthly' | 'annual'
  const currentPlan = (user?.plan || "free").toLowerCase();

  // Close on Escape & Lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectPlan = async (planId) => {
    if (planId === currentPlan) return;
    setUpgrading(true);

    try {
      // Check if Razorpay is configured on the backend
      const config = await getPaymentConfig().catch(() => null);

      if (config?.isConfigured) {
        setUpgrading(false);
        onClose();
        await openRazorpayCheckout({
          plan: { id: planId, price: planId === "team" ? 999 : 499 },
          user,
          onSuccess: (verification) => {
            dispatch(
              updateUserPlan({
                plan: planId,
                subscriptionDate: new Date().toISOString(),
              })
            );
            dispatch(fetchProfile());
            toast.success(`Welcome to PortfolioAI ${planId.toUpperCase()}! 🎉`);
            setTimeout(() => {
              window.location.reload();
            }, 600);
          },
          onError: (err) => {
            toast.error(err.message || "Payment cancelled or failed.");
          },
        });
        return;
      }

      // Demo / Direct fallback activation when payment keys are not yet configured in .env
      toast.loading(`Activating ${planId.toUpperCase()} subscription...`, {
        id: "plan-upgrade",
      });
      const res = await api.put("/users/profile", { plan: planId });
      toast.dismiss("plan-upgrade");
      if (res.data?.success) {
        toast.success(`Welcome to PortfolioAI ${planId.toUpperCase()}! 🎉`);
        setTimeout(() => {
          window.location.reload();
        }, 600);
      }
    } catch (err) {
      toast.dismiss("plan-upgrade");
      toast.error(err.response?.data?.message || "Failed to initiate checkout");
    } finally {
      setUpgrading(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-3xl bg-zinc-950 border border-zinc-800 shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden my-auto max-h-[92vh] relative text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-xl text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center transition cursor-pointer"
          title="Close Modal"
        >
          <X size={18} />
        </button>

        {/* Header Section */}
        <div className="pt-8 pb-6 px-6 sm:px-10 text-center relative z-10 border-b border-zinc-900/80">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide mb-3 shadow-inner">
            <Sparkles size={13} className="text-amber-300 animate-pulse" />
            <span>LEVEL UP YOUR CAREER TOOLKIT</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Unlock Full Career Potential
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto pt-2 leading-relaxed">
            {targetFeature} is reserved for premium subscribers. Get unrestricted access to all 14 cutting-edge templates, AI auto-customization, and live 7-category portfolio audits.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="mt-5 inline-flex items-center p-1 rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-sm">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400 text-zinc-950">
                SAVE 25%
              </span>
            </button>
          </div>
        </div>

        {/* Tiers Grid */}
        <div className="p-6 sm:p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 bg-zinc-950/60">
          {TIERS.map((tier) => {
            const isCurrent = currentPlan === tier.id;
            const price =
              billingCycle === "annual" ? tier.annualPrice : tier.monthlyPrice;

            return (
              <div
                key={tier.id}
                className={`rounded-2xl p-6 flex flex-col justify-between relative transition-all duration-200 border ${
                  tier.highlight
                    ? "bg-gradient-to-b from-indigo-950/40 via-zinc-900/90 to-zinc-900/90 border-indigo-500/60 shadow-xl shadow-indigo-600/15 ring-1 ring-indigo-500/40 md:-translate-y-1"
                    : "bg-zinc-900/50 hover:bg-zinc-900/80 border-zinc-850 hover:border-zinc-700/80"
                }`}
              >
                {/* Floating Top Badge */}
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1 ${
                        tier.highlight
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                          : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                      }`}
                    >
                      {tier.highlight && <Crown size={11} className="text-amber-300" />}
                      <span>{tier.badge}</span>
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Tier Title & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center justify-between">
                      <span>{tier.name}</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 min-h-[32px] leading-relaxed">
                      {tier.description}
                    </p>
                  </div>

                  {/* Pricing Box */}
                  <div className="py-2 border-y border-zinc-800/80 flex items-baseline gap-1.5">
                    <span className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                      ${price}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">
                      {tier.id === "free"
                        ? "forever free"
                        : billingCycle === "annual"
                        ? "/mo, billed yearly"
                        : "/month"}
                    </span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 pt-2">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      Included with this plan:
                    </p>
                    {tier.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-zinc-300 leading-snug">
                        <CheckCircle2
                          size={14}
                          className={`shrink-0 mt-0.5 ${
                            tier.highlight ? "text-indigo-400" : "text-emerald-400"
                          }`}
                        />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action CTA */}
                <div className="pt-6 mt-6 border-t border-zinc-850">
                  <button
                    onClick={() => handleSelectPlan(tier.id)}
                    disabled={isCurrent || upgrading}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                      isCurrent
                        ? "bg-zinc-800 text-zinc-400 border border-zinc-700/60 cursor-default"
                        : tier.highlight
                        ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30 hover:scale-[1.02]"
                        : "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <Check size={14} className="text-emerald-400" />
                        <span>Current Active Plan</span>
                      </>
                    ) : (
                      <>
                        {tier.highlight && <Zap size={14} className="text-amber-300" />}
                        <span>{tier.buttonText}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer Note */}
        <div className="px-6 py-3.5 bg-zinc-900/90 border-t border-zinc-850 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-emerald-400" />
            <span>Instant activation • 14-day money-back guarantee • Cancel anytime</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white underline transition cursor-pointer"
          >
            Continue with Free Plan
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default UpgradeModal;
