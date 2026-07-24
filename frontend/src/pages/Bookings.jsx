import { useEffect, useState } from "react";
import api from "../api/axios";

const STATUS_STYLES = {
  pending_payment: "text-brass-dark",
  confirmed: "text-sage",
  cancelled: "text-clay",
  completed: "text-ink/50",
  no_show: "text-clay",
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/bookings/mine").then((res) => setBookings(res.data));
  };

  useEffect(() => {
    load();
    setLoading(false);
  }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/bookings/${id}/status`, { status });
    load();
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-cream mb-1">Bookings</h1>
      <p className="text-cream/50 mb-8">Every session clients have reserved with you.</p>

      {loading ? (
        <p className="text-cream/40 font-mono text-sm">Loading...</p>
      ) : bookings.length === 0 ? (
        <div className="ledger-card p-10 text-center">
          <p className="font-display text-xl mb-2">No bookings yet</p>
          <p className="text-ink/50 text-sm">
            Share your public booking link to start receiving reservations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((b) => (
            <div key={b._id} className="ticket-stub pl-20">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-display text-lg leading-tight">{b.service?.title}</p>
                  <p className="font-mono text-xs text-ink/50">
                    {b.date} · {b.startTime}–{b.endTime}
                  </p>
                </div>
                {b.status === "confirmed" && <div className="stamp shrink-0">Paid</div>}
              </div>
              <p className="text-sm mb-1">{b.clientName}</p>
              <p className="text-xs text-ink/50 mb-3">{b.clientEmail}</p>
              <p className={`text-xs font-mono uppercase tracking-wide ${STATUS_STYLES[b.status]}`}>
                {b.status.replace("_", " ")}
              </p>

              {b.status === "pending_payment" && (
                <div className="flex gap-3 mt-3 pt-3 border-t border-ink/10">
                  <button
                    onClick={() => updateStatus(b._id, "confirmed")}
                    className="text-xs text-sage hover:underline font-medium"
                  >
                    Mark paid & confirm
                  </button>
                  <button
                    onClick={() => updateStatus(b._id, "cancelled")}
                    className="text-xs text-clay hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              )}
              {b.status === "confirmed" && (
                <div className="flex gap-3 mt-3 pt-3 border-t border-ink/10">
                  <button
                    onClick={() => updateStatus(b._id, "completed")}
                    className="text-xs text-ink/60 hover:underline"
                  >
                    Mark completed
                  </button>
                  <button
                    onClick={() => updateStatus(b._id, "no_show")}
                    className="text-xs text-clay hover:underline"
                  >
                    No-show
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;