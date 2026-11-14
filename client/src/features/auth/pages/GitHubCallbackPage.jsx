import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaGithub } from "react-icons/fa";
import { CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { sendGitHubOAuthCode } from "../../portfolio/services/portfolioService";

const GitHubCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("connecting"); // 'connecting' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const hasExchangedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate OAuth code consumption in React StrictMode
    if (hasExchangedRef.current) return;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setErrorMessage(searchParams.get("error_description") || "GitHub authorization was cancelled or denied.");
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMessage("No authorization code received from GitHub.");
      return;
    }

    hasExchangedRef.current = true;
    let redirectTimer;

    const exchangeCode = async () => {
      try {
        const res = await sendGitHubOAuthCode(code, state);
        if (res.data?.success) {
          setStatus("success");
          toast.success(res.data.message || "GitHub connected successfully! 🐙");
          redirectTimer = setTimeout(() => {
            navigate("/portfolio");
          }, 1500);
        } else {
          setStatus("error");
          setErrorMessage(res.data?.message || "Failed to complete GitHub authentication.");
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err.response?.data?.message || "Failed to connect GitHub. Please verify credentials."
        );
      }
    };

    exchangeCode();

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#0B0E17] flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-md p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl text-center space-y-6 backdrop-blur-xl">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
          <FaGithub size={32} />
        </div>

        {status === "connecting" && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">Connecting GitHub...</h2>
            <p className="text-xs text-zinc-400">
              Securing connection and linking your GitHub account.
            </p>
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mt-4"></div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 size={18} />
              <span>Connected Successfully!</span>
            </div>
            <p className="text-xs text-zinc-400">
              Redirecting you back to your portfolios...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-rose-400 font-bold text-sm">
              <AlertCircle size={18} />
              <span>Connection Failed</span>
            </div>
            <p className="text-xs text-zinc-400">{errorMessage}</p>
            <button
              onClick={() => navigate("/portfolio")}
              className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition cursor-pointer"
            >
              Return to Portfolios
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubCallbackPage;
