import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import AuthLayout from "../components/AuthLayout";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      return toast.error("Please enter your email address.");
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Password reset instructions sent to your email!");
    }, 1000);
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your account email and we will send you a reset link."
    >
      {submitted ? (
        <div className="text-center space-y-4 py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-3xl">
            ✉️
          </div>
          <h3 className="text-xl font-bold text-white">Check Your Inbox</h3>
          <p className="text-zinc-400 text-sm">
            We've sent a password reset link to{" "}
            <span className="text-indigo-400 font-semibold">{email}</span>.
          </p>
          <div className="pt-4">
            <Link
              to="/login"
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition inline-block"
            >
              Return to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <AuthInput
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <AuthButton type="submit" disabled={loading}>
            {loading ? "Sending link..." : "Send Reset Link"}
          </AuthButton>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-zinc-400">
        Remembered your password?{" "}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Back to Login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
