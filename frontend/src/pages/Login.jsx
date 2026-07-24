import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeLogin } = useAuth();

  const [step, setStep] = useState("password"); // "password" | "otp"
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [providerId, setProviderId] = useState(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState(
    location.state?.justSignedUp
      ? "Account created — log in to continue."
      : location.state?.justReset
      ? "Password reset — log in with your new password."
      : ""
  );
  const [loading, setLoading] = useState(false);
  const otpInputRef = useRef(null);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      setProviderId(res.data.providerId);
      setStep("otp");
      setInfo(`We sent a 6-digit code to ${email}.`);
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", { providerId, otp });
      completeLogin(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Incorrect code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    try {
      await api.post("/auth/resend-otp", { providerId });
      setInfo("A new code has been sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend code.");
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-cream mb-1">BookWise AI</h1>
          <p className="text-cream/50 font-body text-sm">
            {step === "password" ? "Welcome back" : "Verify it's you"}
          </p>
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

          {step === "password" ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium">Password</label>
                  <Link to="/forgot-password" className="text-xs text-brass-dark hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-brass w-full mt-2">
                {loading ? "Checking..." : "Continue"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">6-digit code</label>
                <input
                  ref={otpInputRef}
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
              <button type="submit" disabled={loading || otp.length !== 6} className="btn-brass w-full">
                {loading ? "Verifying..." : "Verify and log in"}
              </button>
              <button
                type="button"
                onClick={handleResend}
                className="w-full text-sm text-ink/60 hover:text-ink underline mt-1"
              >
                Resend code
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("password");
                  setOtp("");
                  setError("");
                  setInfo("");
                }}
                className="w-full text-sm text-ink/50 hover:text-ink"
              >
                ← Use a different account
              </button>
            </form>
          )}

          {step === "password" && (
            <p className="text-center text-sm text-ink/60 mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="text-brass-dark font-medium hover:underline">
                Sign up
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;