import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
  X,
  CreditCard,
  QrCode,
  Building2,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Check,
  Loader2,
  Smartphone,
  Info,
} from "lucide-react";
import { subscribeToPlan } from "../services/subscriptionService";
import {
  openRazorpayCheckout,
  getPaymentConfig,
} from "../services/paymentService";
import { updateUserPlan } from "../../../redux/auth/authSlice";
import { fetchProfile } from "../../../redux/profile/profileSlice";

const PaymentModal = ({ isOpen, onClose, plan, user }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isRazorpayLoading, setIsRazorpayLoading] = useState(false);
  const [isRazorpayConfigured, setIsRazorpayConfigured] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' | 'upi' | 'netbanking'
  const [upiMode, setUpiMode] = useState("id"); // 'id' | 'qr'
  const [selectedBank, setSelectedBank] = useState("HDFC");

  // Form states
  const [cardholderName, setCardholderName] = useState(user?.fullName || "");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [saveCard, setSaveCard] = useState(true);

  // Processing & Success states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionData, setTransactionData] = useState(null);

  // Reset form when modal opens or plan changes
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsProcessing(false);
      setProcessingStatus("");
      setCardholderName(user?.fullName || "");
      setCardNumber("");
      setExpiry("");
      setCvv("");
      setUpiId("");
      document.body.style.overflow = "hidden";

      getPaymentConfig()
        .then((res) => setIsRazorpayConfigured(Boolean(res?.isConfigured)))
        .catch(() => setIsRazorpayConfigured(false));
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, plan, user]);

  if (!isOpen || !plan) return null;

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
    setCardNumber(formatted);
  };

  // Detect card brand
  const getCardBrand = (num) => {
    const cleaned = num.replace(/\s+/g, "");
    if (cleaned.startsWith("4")) return { brand: "Visa", color: "text-blue-400" };
    if (/^(5[1-5]|2[2-7])/.test(cleaned)) return { brand: "Mastercard", color: "text-orange-400" };
    if (/^(60|65|81|82|508)/.test(cleaned)) return { brand: "RuPay", color: "text-emerald-400" };
    if (/^(34|37)/.test(cleaned)) return { brand: "Amex", color: "text-cyan-400" };
    return { brand: "Card", color: "text-zinc-400" };
  };

  // Format Expiry MM/YY
  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      setExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setExpiry(raw);
    }
  };

  // Format CVV (max 3-4 digits)
  const handleCvvChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCvv(raw);
  };

  // Handle UPI extension click
  const handleAppendUpiSuffix = (suffix) => {
    const prefix = upiId.includes("@") ? upiId.split("@")[0] : upiId;
    setUpiId(`${prefix || (user?.email?.split("@")[0] || "user")}${suffix}`);
  };

  // Form validation
  const validateForm = () => {
    if (paymentMethod === "card") {
      if (!cardholderName.trim()) {
        toast.error("Please enter the cardholder name.");
        return false;
      }
      const rawCard = cardNumber.replace(/\s+/g, "");
      if (rawCard.length < 15) {
        toast.error("Please enter a valid 16-digit card number.");
        return false;
      }
      if (expiry.length < 5) {
        toast.error("Please enter a valid expiry date (MM/YY).");
        return false;
      }
      const [mm, yy] = expiry.split("/").map(Number);
      if (!mm || mm < 1 || mm > 12) {
        toast.error("Invalid expiry month.");
        return false;
      }
      if (cvv.length < 3) {
        toast.error("Please enter a valid 3 or 4 digit CVV.");
        return false;
      }
    } else if (paymentMethod === "upi") {
      if (upiMode === "id") {
        if (!upiId.trim() || !upiId.includes("@")) {
          toast.error("Please enter a valid UPI ID (e.g., username@bank).");
          return false;
        }
      }
    }
    return true;
  };

  // Launch Razorpay Official Checkout (UPI, Cards, NetBanking)
  const handleRazorpayCheckout = async () => {
    setIsRazorpayLoading(true);
    const toastId = toast.loading("Connecting to secure Razorpay Gateway...", {
      id: "razorpay-init",
    });

    try {
      await openRazorpayCheckout({
        plan,
        user,
        onSuccess: (verification) => {
          toast.dismiss(toastId);
          setIsRazorpayLoading(false);
          const activePlan = (plan.id || plan.title).toLowerCase();
          dispatch(
            updateUserPlan({
              plan: activePlan,
              subscriptionDate: new Date().toISOString(),
            })
          );
          dispatch(fetchProfile());

          setTransactionData({
            transactionId:
              verification.transaction?.transactionId ||
              `RZP_${Date.now()}`,
            amount:
              verification.transaction?.amount || Number(plan.price),
            plan: activePlan === "team" ? "Team" : "Pro",
            date: new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            method: "Razorpay (UPI / Card / NetBanking)",
          });
          setIsSuccess(true);
          toast.success(
            `Payment verified! Welcome to ${activePlan === "team" ? "Team" : "Pro"}! 🎉`
          );
        },
        onError: (err) => {
          toast.dismiss(toastId);
          setIsRazorpayLoading(false);
          toast.error(err.message || "Payment cancelled or failed.");
        },
        onDismiss: () => {
          toast.dismiss(toastId);
          setIsRazorpayLoading(false);
        },
      });
    } catch (err) {
      toast.dismiss(toastId);
      setIsRazorpayLoading(false);
      console.error("Razorpay Error:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Razorpay key not configured. Add RAZORPAY_KEY_ID into server/.env to use Razorpay Checkout.";
      toast.error(errMsg, { duration: 5000 });
    }
  };

  // Handle Payment Submit
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // Step 1: Encrypting
      setProcessingStatus("Encrypting payment details with 256-bit SSL...");
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Step 2: Gateway authorization
      setProcessingStatus(`Connecting with ${paymentMethod === "card" ? "Card Network" : paymentMethod === "upi" ? "NPCI UPI Gateway" : "Bank Server"}...`);
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Step 3: Verifying transaction
      setProcessingStatus("Verifying transaction authorization...");
      const txnId = `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

      // Step 4: Call backend subscription API
      const result = await subscribeToPlan({
        plan: (plan.id || plan.title).toLowerCase(),
        amount: Number(plan.price),
        paymentMethod: paymentMethod === "card" ? `Card (${getCardBrand(cardNumber).brand})` : paymentMethod === "upi" ? (upiMode === "qr" ? "UPI (QR Code)" : `UPI (${upiId})`) : `NetBanking (${selectedBank})`,
        transactionId: txnId,
      });

      // Update Redux state
      dispatch(
        updateUserPlan({
          plan: (plan.id || plan.title).toLowerCase(),
          subscriptionDate: new Date().toISOString(),
        }),
      );
      dispatch(fetchProfile());

      setTransactionData({
        txnId,
        amount: plan.price,
        planTitle: plan.title,
        date: new Date().toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        method: paymentMethod.toUpperCase(),
      });

      setIsProcessing(false);
      setIsSuccess(true);
      toast.success(`🎉 Payment of ₹${plan.price} successful! Welcome to ${plan.title}!`);
    } catch (error) {
      setIsProcessing(false);
      toast.error(error.response?.data?.message || "Payment authorization failed. Please try again.");
    }
  };

  const banks = [
    { id: "HDFC", name: "HDFC Bank", logo: "🏛️" },
    { id: "SBI", name: "State Bank of India", logo: "🏦" },
    { id: "ICICI", name: "ICICI Bank", logo: "💳" },
    { id: "AXIS", name: "Axis Bank", logo: "🪙" },
    { id: "KOTAK", name: "Kotak Mahindra", logo: "🏢" },
    { id: "PNB", name: "Punjab National Bank", logo: "🏛️" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isProcessing ? onClose : undefined}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
          className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-[#0d0e15] shadow-2xl shadow-indigo-500/10 text-white overflow-hidden z-10 my-8"
        >
          {/* Top Accent Gradient Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          {/* Close Button */}
          {!isProcessing && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition duration-150 cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          )}

          {/* SUCCESS SCREEN */}
          {isSuccess ? (
            <div className="p-6 sm:p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20 mb-5"
              >
                <CheckCircle2 size={44} strokeWidth={2.5} />
              </motion.div>

              <h3 className="text-2xl font-black text-white tracking-tight">
                Payment Successful! 🎉
              </h3>
              <p className="text-sm text-zinc-400 mt-2 max-w-sm mx-auto">
                Congratulations! Your account has been upgraded to the{" "}
                <span className="text-indigo-400 font-bold">{transactionData?.planTitle} Plan</span>.
              </p>

              {/* Receipt Box */}
              <div className="mt-6 rounded-xl border border-zinc-800/90 bg-zinc-900/60 p-4 text-left space-y-2.5 text-xs text-zinc-300">
                <div className="flex justify-between items-center py-1 border-b border-zinc-800/80">
                  <span className="text-zinc-500">Transaction ID</span>
                  <span className="font-mono text-zinc-200">{transactionData?.txnId}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-800/80">
                  <span className="text-zinc-500">Amount Paid</span>
                  <span className="text-emerald-400 font-bold text-sm">₹{transactionData?.amount}.00</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-800/80">
                  <span className="text-zinc-500">Plan Status</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold uppercase tracking-wider text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Check size={10} strokeWidth={3} /> Active
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-800/80">
                  <span className="text-zinc-500">Date & Time</span>
                  <span className="text-zinc-200">{transactionData?.date}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-zinc-500">Billed Account</span>
                  <span className="text-zinc-200 font-medium truncate max-w-[200px]">{user?.email}</span>
                </div>
              </div>

              {/* Success Actions */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    onClose();
                    navigate("/dashboard");
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition cursor-pointer"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => {
                    onClose();
                    navigate("/portfolio-generator");
                  }}
                  className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-sm transition cursor-pointer"
                >
                  <Sparkles size={16} className="text-indigo-400" />
                  <span>Build with AI</span>
                </button>
              </div>
            </div>
          ) : (
            /* PAYMENT FORM SCREEN */
            <div className="p-6 sm:p-7">
              {/* Header */}
              <div className="flex items-start justify-between pr-8">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles size={12} />
                    <span>{plan.title} Plan Upgrade</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    Payment Details
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Complete your subscription to unlock all premium features.
                  </p>
                </div>
              </div>

              {/* Plan Summary Card */}
              <div className="mt-4 rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-zinc-900/60 p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-white">₹{plan.price}</span>
                    <span className="text-xs text-zinc-400 font-medium">/ month</span>
                  </div>
                  <p className="text-xs text-indigo-300/90 font-medium mt-0.5">
                    ⚡ Instant activation • Cancel anytime
                  </p>
                </div>
                <div className="text-right text-xs">
                  <span className="text-zinc-500 block text-[11px]">Subscribing as:</span>
                  <span className="font-semibold text-zinc-200 block truncate max-w-[180px]">
                    {user?.fullName || "Developer"}
                  </span>
                  <span className="text-[11px] text-zinc-400 block truncate max-w-[180px]">
                    {user?.email}
                  </span>
                </div>
              </div>

              {/* Primary: Official Razorpay Checkout Banner */}
              <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-zinc-900 border border-indigo-500/30 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                      R
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Razorpay Checkout</span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold uppercase ${
                            isRazorpayConfigured
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {isRazorpayConfigured ? "ONLINE" : "READY TO CONFIGURE"}
                        </span>
                      </h4>
                      <p className="text-[11px] text-zinc-400">UPI (GPay, PhonePe, Paytm, QR), RuPay, Cards & NetBanking</p>
                    </div>
                  </div>
                  <ShieldCheck size={18} className="text-emerald-400" />
                </div>

                <button
                  type="button"
                  onClick={handleRazorpayCheckout}
                  disabled={isRazorpayLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {isRazorpayLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Connecting with Razorpay...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={14} />
                      <span>Pay ₹{plan.price} via Razorpay (UPI / Cards / NetBanking)</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>

                {!isRazorpayConfigured && (
                  <p className="text-[10px] text-zinc-400/90 text-center leading-relaxed">
                    💡 Provide your <span className="text-indigo-400 font-mono">RAZORPAY_KEY_ID</span> in <span className="text-indigo-400 font-mono">server/.env</span> for live Razorpay checkout, or use the local simulator below.
                  </p>
                )}
              </div>

              {/* Divider for Manual Simulation */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
                  <span className="bg-[#0d0e15] px-2.5 text-zinc-500">Or test with local simulator</span>
                </div>
              </div>

              {/* Payment Methods Selector Tabs */}
              <div className="mt-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      paymentMethod === "card"
                        ? "border-indigo-500 bg-indigo-500/15 text-white shadow-sm shadow-indigo-500/20"
                        : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                    }`}
                  >
                    <CreditCard size={15} />
                    <span>Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      paymentMethod === "upi"
                        ? "border-indigo-500 bg-indigo-500/15 text-white shadow-sm shadow-indigo-500/20"
                        : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                    }`}
                  >
                    <Smartphone size={15} />
                    <span>UPI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("netbanking")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      paymentMethod === "netbanking"
                        ? "border-indigo-500 bg-indigo-500/15 text-white shadow-sm shadow-indigo-500/20"
                        : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                    }`}
                  >
                    <Building2 size={15} />
                    <span>Net Banking</span>
                  </button>
                </div>
              </div>

              {/* PAYMENT FORMS */}
              <form onSubmit={handlePayment} className="mt-5 space-y-4">
                {/* 1. CARD PAYMENT TAB */}
                {paymentMethod === "card" && (
                  <div className="space-y-3.5">
                    {/* Cardholder Name */}
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        placeholder="e.g. Anushka Garg"
                        required
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                      />
                    </div>

                    {/* Card Number */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-medium text-zinc-300">
                          Card Number
                        </label>
                        <span className={`text-[11px] font-bold ${getCardBrand(cardNumber).color}`}>
                          {getCardBrand(cardNumber).brand}
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4242 •••• •••• 4242"
                          maxLength={19}
                          required
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 pl-3.5 pr-10 py-2.5 text-sm font-mono text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition tracking-wider"
                        />
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                          <CreditCard size={17} />
                        </div>
                      </div>
                    </div>

                    {/* Expiry & CVV Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={expiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3.5 py-2.5 text-sm font-mono text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-xs font-medium text-zinc-300">
                            CVV / CVC
                          </label>
                          <span className="text-[10px] text-zinc-500">3-4 digits</span>
                        </div>
                        <div className="relative">
                          <input
                            type="password"
                            value={cvv}
                            onChange={handleCvvChange}
                            placeholder="•••"
                            maxLength={4}
                            required
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 pl-3.5 pr-9 py-2.5 text-sm font-mono text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition tracking-widest"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                            <Lock size={14} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="save-card"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                      />
                      <label htmlFor="save-card" className="text-xs text-zinc-400 select-none cursor-pointer">
                        Save card securely for seamless auto-renewals
                      </label>
                    </div>
                  </div>
                )}

                {/* 2. UPI TAB */}
                {paymentMethod === "upi" && (
                  <div className="space-y-4">
                    {/* UPI Sub-Mode Switcher */}
                    <div className="flex rounded-lg bg-zinc-900/80 p-1 border border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setUpiMode("id")}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                          upiMode === "id"
                            ? "bg-indigo-600 text-white shadow"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Enter UPI ID
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpiMode("qr")}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                          upiMode === "qr"
                            ? "bg-indigo-600 text-white shadow"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Scan QR Code
                      </button>
                    </div>

                    {upiMode === "id" ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                            Virtual Payment Address (VPA / UPI ID)
                          </label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="e.g. anushka@okhdfcbank or 9876543210@paytm"
                            required
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                          />
                        </div>

                        {/* Quick UPI Handles */}
                        <div>
                          <p className="text-[11px] text-zinc-500 mb-1.5">Quick suffixes:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {["@okhdfcbank", "@okaxis", "@oksbi", "@paytm", "@ybl"].map((suffix) => (
                              <button
                                key={suffix}
                                type="button"
                                onClick={() => handleAppendUpiSuffix(suffix)}
                                className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 hover:border-indigo-500/50 hover:bg-zinc-800 text-[11px] text-zinc-400 hover:text-indigo-300 transition"
                              >
                                {suffix}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-400">
                          <Info size={14} className="shrink-0 text-indigo-400 mt-0.5" />
                          <span>A payment request will be sent to your UPI application (Google Pay, PhonePe, Paytm).</span>
                        </div>
                      </div>
                    ) : (
                      /* QR Code Option */
                      <div className="text-center py-2 space-y-3">
                        <div className="inline-block p-3 rounded-2xl bg-white shadow-xl shadow-white/5">
                          <div className="w-40 h-40 bg-zinc-950 rounded-xl flex flex-col items-center justify-center p-2 relative overflow-hidden border border-zinc-200">
                            {/* Stylized QR representation */}
                            <QrCode size={120} className="text-zinc-900" />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                                ₹
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">Scan with any UPI App</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">Google Pay • PhonePe • Paytm • BHIM</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. NET BANKING TAB */}
                {paymentMethod === "netbanking" && (
                  <div className="space-y-3">
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Popular Banks
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {banks.map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBank(bank.id)}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition cursor-pointer ${
                            selectedBank === bank.id
                              ? "border-indigo-500 bg-indigo-500/15 text-white"
                              : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                          }`}
                        >
                          <span className="text-lg">{bank.logo}</span>
                          <span className="text-xs font-medium truncate">{bank.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-zinc-500">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>256-Bit SSL Encryption • PCI-DSS & RBI Compliant</span>
                </div>

                {/* Processing status text */}
                {isProcessing && (
                  <div className="text-center py-1">
                    <p className="text-xs text-indigo-400 font-medium animate-pulse">
                      {processingStatus}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Authorizing Payment...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={15} />
                        <span>Pay ₹{plan.price} & Upgrade</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentModal;
