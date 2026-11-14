import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import Button from "../../../../components/ui/Button/Button";
import Card from "../../../../components/ui/Card/Card";

const PricingCard = ({
  plan,
  isAuthenticated,
  isCurrentPlan,
  onSelectPlan,
  billingCycle = "monthly",
}) => {
  const { title, description, features, highlighted } = plan;

  const displayPrice =
    billingCycle === "annual" && plan.annualMonthlyPrice
      ? plan.annualMonthlyPrice
      : plan.price;

  const getButtonText = () => {
    if (isCurrentPlan) return "Current Plan";
    if (!isAuthenticated) return "Get Started";
    if (plan.price === "0") return "Go to Dashboard";
    return highlighted ? "Upgrade to Pro" : `Get Started with ${title}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="h-full flex"
    >
      <Card
        className={`relative flex flex-col justify-between h-full w-full transition-all duration-300 ${
          highlighted
            ? "border-indigo-500/80 shadow-2xl shadow-indigo-500/20 bg-gradient-to-b from-indigo-950/30 to-zinc-900/80 hover:border-indigo-400"
            : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/40"
        } ${isCurrentPlan ? "ring-2 ring-emerald-500/60 border-emerald-500/40" : ""}`}
      >
        <div>
          {highlighted && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/40 flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles size={11} />
              <span>Most Popular Choice</span>
            </div>
          )}

          {isCurrentPlan && (
            <div className="absolute top-4 right-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              <Check size={11} strokeWidth={3} />
              <span>Active Plan</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white tracking-tight">{title}</h3>
            {billingCycle === "annual" && plan.price !== "0" && (
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                25% OFF
              </span>
            )}
          </div>

          <div className="mt-6 flex items-baseline gap-1">
            <span className="text-5xl font-black text-white tracking-tight">₹{displayPrice}</span>
            <span className="text-zinc-400 text-sm font-medium">/month</span>
          </div>

          {billingCycle === "annual" && plan.price !== "0" && (
            <p className="text-[11px] text-emerald-400 font-medium mt-1">
              Billed ₹{plan.annualTotal}/yr • {plan.savings}
            </p>
          )}

          <p className="mt-3 text-zinc-400 text-sm leading-relaxed">{description}</p>

          <div className="mt-8 space-y-3.5 border-t border-zinc-800/80 pt-6">
            {features.map((item) => (
              <div key={item} className="flex items-center gap-3 text-zinc-300 text-sm">
                <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 block w-full">
          <Button
            type="button"
            variant={isCurrentPlan ? "secondary" : highlighted ? "primary" : "secondary"}
            onClick={() => onSelectPlan(plan)}
            className={`w-full justify-center flex items-center gap-2 cursor-pointer transition active:scale-[0.98] py-3 text-sm font-bold ${
              isCurrentPlan
                ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10"
                : highlighted
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30"
                : ""
            }`}
          >
            <span>{getButtonText()}</span>
            {!isCurrentPlan && <ArrowRight size={15} />}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default PricingCard;
