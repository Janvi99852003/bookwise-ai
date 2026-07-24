import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Overview = () => {
  const { provider } = useAuth();
  const [bookingCount, setBookingCount] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api
      .get("/bookings/mine")
      .then((res) => setBookingCount(res.data.length))
      .catch(() => setBookingCount(0));
  }, []);

  const publicUrl = `${window.location.origin}/book/${provider?.slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <h1 className="font-display text-3xl text-cream mb-1">
        {greeting}, {provider?.name?.split(" ")[0]}
      </h1>
      <p className="text-cream/50 mb-8">Here's what's on your ledger today.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="ledger-card p-6">
          <p className="text-ink/50 text-sm font-medium mb-1">Total bookings</p>
          <p className="font-mono text-4xl font-semibold">
            {bookingCount === null ? "…" : bookingCount}
          </p>
        </div>
        <div className="ledger-card p-6">
          <p className="text-ink/50 text-sm font-medium mb-1">Current plan</p>
          <p className="font-display text-2xl capitalize">{provider?.plan || "free"}</p>
        </div>
      </div>

      <div className="ledger-card p-6">
        <p className="text-ink/50 text-sm font-medium mb-2">Your public booking page</p>
        <div className="flex items-center gap-2 flex-wrap">
          <code className="font-mono text-sm bg-ink/5 px-3 py-2 rounded flex-1 min-w-0 truncate">
            {publicUrl}
          </code>
          <button onClick={handleCopy} className="btn-outline shrink-0">
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
        <p className="text-ink/40 text-xs mt-2">
          Share this with clients so they can book and pay for a session directly.
        </p>
      </div>
    </div>
  );
};

export default Overview;