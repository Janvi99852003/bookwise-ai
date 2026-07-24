import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("request"); // "request" | "reset"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setInfo(res.data.message);
      setStep("reset");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, otp, newPassword });
      navigate("/login", { state: { justReset: true, email } });
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-cream mb-1">BookWise AI</h1>
          <p className="text-cream/50 font-body text-sm">Reset your password</p>
        </div>

        <div className="ledger-card p-8">
          {info && (
            <div className="bg-sage/10 border border-sage/30 text-sage text-sm rounded-md px-3 py-2 mb-4">
              {info}
            </div>
          )}
          {error && (
            <div className="bg-clay/10 border border-clay/30 text-clay text-sm rounded-md px-3 py-2 mb-4">
              {error}
            </div>
          )}

          {step === "request" ? (
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-brass w-full">
                {loading ? "Sending..." : "Send reset code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">6-digit code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="input-field font-mono text-center text-2xl tracking-[0.5em]"
                  placeholder="------"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">New password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  placeholder="At least 6 characters"
                />
              </div>
              <button type="submit" disabled={loading || otp.length !== 6} className="btn-brass w-full">
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-ink/60 mt-6">
            <Link to="/login" className="text-brass-dark font-medium hover:underline">
              ← Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;