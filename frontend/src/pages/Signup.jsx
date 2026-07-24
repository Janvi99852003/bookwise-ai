import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", businessName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/signup", form);
      navigate("/login", { state: { justSignedUp: true, email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-cream mb-1">BookWise AI</h1>
          <p className="text-cream/50 font-body text-sm">Set up your booking page</p>
        </div>

        <div className="ledger-card p-8">
          <h2 className="font-display text-2xl mb-6">Create your account</h2>

          {error && (
            <div className="bg-clay/10 border border-clay/30 text-clay text-sm rounded-md px-3 py-2 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Your name</label>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Janvi Jaiswal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Business name</label>
              <input
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                className="input-field"
                placeholder="Janvi's Cooking Classes"
              />
              <p className="text-xs text-ink/50 mt-1">
                Used to generate your public booking page link.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={form.password}
                onChange={handleChange}
                className="input-field"
                placeholder="At least 6 characters"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-brass w-full mt-2">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-ink/60 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-brass-dark font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;