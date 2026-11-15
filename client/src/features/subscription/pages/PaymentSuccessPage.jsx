import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Loader2,
  LayoutDashboard,
  AlertCircle,
} from 'lucide-react';
import toast from "react-hot-toast";

import { verifyPaymentSession } from "../services/paymentService";
import { updateUserPlan } from "../../../redux/auth/authSlice";
import { fetchProfile } from "../../../redux/profile/profileSlice";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const paymentId =
    searchParams.get("payment_id") ||
    searchParams.get("razorpay_payment_id") ||
    searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null);

  const hasVerified = useRef(false);
  const { user } = useSelector((state) => state.auth);
  const userEmailRef = useRef(user?.email);
  useEffect(() => {
    userEmailRef.current = user?.email;
  }, [user?.email]);

  useEffect(() => {
    if (!paymentId) {
      setError("Missing payment identifier in URL parameters.");
      setLoading(false);
      return;
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      try {
        const data = await verifyPaymentSession(paymentId);

        if (data.success) {
          const activePlan =
            data.user?.plan ||
            data.transaction?.plan?.toLowerCase() ||
            "pro";

          // Update local state in Redux
          dispatch(
            updateUserPlan({
              plan: activePlan,
              subscriptionDate: new Date().toISOString(),
            })
          );
          dispatch(fetchProfile());

          setReceipt({
            transactionId: data.transaction?.transactionId || paymentId,
            amount: data.transaction?.amount || 499,
            currency: data.transaction?.currency || "INR",
            date: new Date().toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            }),
            email: userEmailRef.current || "Your account",
          });

          toast.success("🎉 Payment verified! Your Pro Plan is now active!");
        } else {
          setError(data.message || "Failed to verify payment.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError(
          err.response?.data?.message ||
            "Unable to verify Stripe checkout session."
        );
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [paymentId, dispatch]);

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -left-32 -top-32 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-xl rounded-3xl border border-indigo-500/25 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-zinc-950/95 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl relative z-10 text-center"
      >
        {/* Top Accent Gradient Bar */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 rounded-t-3xl" />

        {loading ? (
          <div className="py-16 space-y-4">
            <Loader2 size={44} className="text-indigo-400 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-white">
              Verifying Stripe Payment...
            </h2>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Please wait while we confirm your Stripe checkout session and upgrade your workspace.
            </p>
          </div>
        ) : error ? (
          <div className="py-8 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-lg">
              <AlertCircle size={32} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                Payment Verification Error
              </h2>
              <p className="text-xs text-rose-300 mt-2 max-w-sm mx-auto">
                {error}
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/settings"
                className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition"
              >
                Return to Settings
              </Link>
              <Link
                to="/dashboard"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Animated Celebration Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-2xl shadow-emerald-500/20"
            >
              <CheckCircle2 size={44} strokeWidth={2.5} />
            </motion.div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles size={12} className="text-emerald-400" />
                <span>Stripe Payment Confirmed</span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Welcome to Pro! 🎉
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
                Your payment was successfully processed. Your account is upgraded with unlimited AI portfolios and full ATS model access.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 sm:p-5 text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-zinc-800/70">
                <span className="text-zinc-500">Plan Activated</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono uppercase">
                    PRO TIER
                  </span>
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-zinc-800/70">
                <span className="text-zinc-500">Amount Paid</span>
                <span className="text-emerald-400 font-bold text-sm">
                  ₹{receipt?.amount}.00 {receipt?.currency}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-zinc-800/70">
                <span className="text-zinc-500">Payment Gateway</span>
                <span className="text-indigo-400 font-semibold flex items-center gap-1">
                  <ShieldCheck size={13} />
                  <span>Stripe Secure Checkout</span>
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-zinc-800/70">
                <span className="text-zinc-500">Session ID</span>
                <span className="font-mono text-zinc-300 truncate max-w-[200px]">
                  {receipt?.transactionId}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-500">Date & Time</span>
                <span className="text-zinc-300">{receipt?.date}</span>
              </div>
            </div>

            {/* Unlocked Benefits Chips */}
            <div className="grid grid-cols-2 gap-2 text-left text-xs text-zinc-300 pt-1">
              <div className="flex items-center gap-1.5">
                <Check size={13} className="text-emerald-400" />
                <span>Unlimited Portfolios</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={13} className="text-emerald-400" />
                <span>Nemotron ATS Checks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={13} className="text-emerald-400" />
                <span>Global Edge CDN</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={13} className="text-emerald-400" />
                <span>AI Builder Priority</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex flex-col sm:flex-row gap-3">
              <Link
                to="/dashboard"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <LayoutDashboard size={16} />
                <span>Go to Dashboard</span>
                <ArrowRight size={15} />
              </Link>

              <Link
                to="/portfolio-generator"
                className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-sm transition"
              >
                <Sparkles size={16} className="text-indigo-400" />
                <span>Build with AI</span>
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccessPage;
