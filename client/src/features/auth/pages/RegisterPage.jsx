import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import AuthLayout from "../components/AuthLayout";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";

import { registerUser } from "../../../redux/auth/authSlice";
import SEO from "../../../components/common/SEO";

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName.trim() || !email.trim() || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const result = await dispatch(
      registerUser({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      }),
    );

    if (registerUser.fulfilled.match(result)) {
      toast.success("Account created successfully! Please sign in with your credentials. 🎉");
      navigate("/login", { state: { email: email.trim() } });
    } else {
      toast.error(result.payload || "Registration failed. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="Create Account 🚀"
      subtitle="Join PortfolioAI and build your professional portfolio."
    >
      <SEO
        title="Create Free Account — PortfolioAI"
        description="Join PortfolioAI today. Build executive developer portfolios with AI, scan your resume with Nemotron ATS, and deploy instantly to edge hosting."
        canonical="/register"
      />
      <form onSubmit={handleSubmit}>
        <AuthInput
          label="Full Name"
          name="fullName"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={handleChange}
          required
        />

        <AuthInput
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <AuthInput
          label="Password"
          name="password"
          type="password"
          placeholder="Create a password (min. 6 characters)"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <AuthInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <AuthButton type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </AuthButton>
      </form>

      <p className="mt-8 text-center text-zinc-400">
        Already have an account?
        <Link
          to="/login"
          className="ml-2 text-indigo-400 hover:text-indigo-300 font-medium"
        >
          Login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;

