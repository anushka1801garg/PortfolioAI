import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import AuthLayout from "../components/AuthLayout";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";

import { loginUser } from "../../../redux/auth/authSlice";
import { fetchProfile } from "../../../redux/profile/profileSlice";
import SEO from "../../../components/common/SEO";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      toast.error("Please enter your email and password");
      return;
    }

    const result = await dispatch(
      loginUser({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      }),
    );

    if (loginUser.fulfilled.match(result)) {
      await dispatch(fetchProfile());

      toast.success("Login Successful 🎉");

      const from = location.state?.from || "/dashboard";
      navigate(from);
    } else {
      toast.error(result.payload || "Login Failed");
    }
  };

  return (
    <AuthLayout
      title="Welcome Back 👋"
      subtitle="Sign in to continue building your AI Portfolio."
    >
      <SEO
        title="Sign In — PortfolioAI"
        description="Log in to your PortfolioAI account to manage your developer portfolios, view ATS analytics, and deploy updates."
        canonical="/login"
      />
      {location.state?.message && (
        <div className="mb-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-xs text-indigo-300 flex items-center gap-2">
          <span>ℹ️</span>
          <span>{location.state.message}</span>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <AuthInput
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
        />

        <AuthInput
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
        />

        <div className="mt-6">
          <AuthButton type="submit" disabled={loading}>
            {loading ? "Logging In..." : "Login"}
          </AuthButton>
        </div>
      </form>

      <p className="mt-8 text-center text-zinc-400">
        Don't have an account?
        <Link
          to="/register"
          className="ml-2 text-indigo-400 hover:text-indigo-300"
        >
          Register
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
