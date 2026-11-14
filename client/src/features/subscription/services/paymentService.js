import api from "../../../services/api";

// Dynamically load Razorpay standard checkout script
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Get Payment Configuration Status & Razorpay Key ID
export const getPaymentConfig = async () => {
  const response = await api.get("/payment/config");
  return response.data;
};

// Backward-compatibility alias
export const getStripeConfig = getPaymentConfig;

// Create Razorpay Order
export const createRazorpayOrder = async (planId = "pro") => {
  const response = await api.post("/payment/create-order", {
    planId,
  });
  return response.data;
};

// Backward-compatibility alias
export const createCheckoutSession = createRazorpayOrder;

// Verify Razorpay Payment Signature
export const verifyRazorpayPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  plan = "pro",
}) => {
  const response = await api.post("/payment/verify-payment", {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    plan,
  });
  return response.data;
};

// Backward-compatibility alias
export const verifyPaymentSession = async (payload) => {
  // If string passed (legacy Stripe sessionId), forward as sessionId
  if (typeof payload === "string") {
    const response = await api.post("/payment/verify-session", {
      sessionId: payload,
    });
    return response.data;
  }
  return verifyRazorpayPayment(payload);
};

// High-level automated Razorpay Checkout Launcher
export const openRazorpayCheckout = async ({
  plan,
  user,
  onSuccess,
  onError,
  onDismiss,
}) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    throw new Error(
      "Failed to load Razorpay SDK. Please check your internet connection."
    );
  }

  const orderData = await createRazorpayOrder(plan.id || plan);
  if (!orderData?.success || !orderData?.orderId) {
    throw new Error(orderData?.message || "Failed to create payment order.");
  }

  return new Promise((resolve, reject) => {
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: "PortfolioAI",
      description: orderData.planName || "PortfolioAI Pro Subscription",
      image: "https://portfolioai.app/favicon.png",
      order_id: orderData.orderId,
      prefill: {
        name: user?.fullName || orderData.user?.name || "",
        email: user?.email || orderData.user?.email || "",
        contact: user?.phone || orderData.user?.phone || "",
      },
      notes: {
        plan: orderData.plan,
      },
      theme: {
        color: "#6366f1",
        backdrop_color: "rgba(9, 9, 11, 0.85)",
      },
      modal: {
        ondismiss: () => {
          if (onDismiss) onDismiss();
          resolve({ dismissed: true });
        },
      },
      handler: async (response) => {
        try {
          const verification = await verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan: orderData.plan,
          });

          if (verification?.success) {
            if (onSuccess) onSuccess(verification);
            resolve(verification);
          } else {
            const err = new Error(
              verification?.message || "Payment verification failed."
            );
            if (onError) onError(err);
            reject(err);
          }
        } catch (vErr) {
          if (onError) onError(vErr);
          reject(vErr);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (failedRes) => {
      const err = new Error(
        failedRes.error?.description || "Payment failed. Please try again."
      );
      if (onError) onError(err);
      reject(err);
    });
    rzp.open();
  });
};
