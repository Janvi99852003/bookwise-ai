import { useEffect, useState } from "react";
import api from "../api/axios";

const emptyForm = { title: "", description: "", durationMinutes: 60, price: "" };

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const loadServices = () => {
    api
      .get("/services/mine")
      .then((res) => setServices(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(loadServices, []);

  const openNewForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  const openEditForm = (service) => {
    setForm({
      title: service.title,
      description: service.description,
      durationMinutes: service.durationMinutes,
      price: service.price,
    });
    setEditingId(service._id);
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/services/${editingId}`, form);
      } else {
        await api.post("/services", form);
      }
      setShowForm(false);
      loadServices();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleToggleActive = async (service) => {
    await api.put(`/services/${service._id}`, { isActive: !service.isActive });
    loadServices();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this service? This can't be undone.")) return;
    await api.delete(`/services/${id}`);
    loadServices();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-3xl text-cream">Services</h1>
        <button onClick={openNewForm} className="btn-brass">
          + Add service
        </button>
      </div>
      <p className="text-cream/50 mb-8">What clients can book and pay for.</p>

      {showForm && (
        <div className="ledger-card p-6 mb-6">
          <h2 className="font-display text-xl mb-4">
            {editingId ? "Edit service" : "New service"}
          </h2>
          {error && (
            <div className="bg-clay/10 border border-clay/30 text-clay text-sm rounded-md px-3 py-2 mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field"
                placeholder="1-on-1 Cooking Class"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field"
                rows={2}
                placeholder="What's included in this session"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Duration (minutes)</label>
                <input
                  type="number"
                  required
                  min={5}
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Price (₹)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-brass">
                {editingId ? "Save changes" : "Create service"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-cream/40 font-mono text-sm">Loading...</p>
      ) : services.length === 0 ? (
        <div className="ledger-card p-10 text-center">
          <p className="font-display text-xl mb-2">No services yet</p>
          <p className="text-ink/50 text-sm">Add your first service so clients can start booking.</p>
        </div>
      ) : (
        <div className="ledger-card p-6">
          {services.map((service) => (
            <div key={service._id} className="ledger-row items-center">
              <div className="min-w-0">
                <p className="font-medium truncate">{service.title}</p>
                <p className="text-ink/50 text-xs font-mono">
                  {service.durationMinutes} min · ₹{service.price}
                  {!service.isActive && <span className="text-clay ml-2">· hidden</span>}
                </p>
              </div>
              <div className="dots" />
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleToggleActive(service)}
                  className="text-xs text-ink/50 hover:text-ink underline"
                >
                  {service.isActive ? "Hide" : "Show"}
                </button>
                <button
                  onClick={() => openEditForm(service)}
                  className="text-xs text-brass-dark hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(service._id)}
                  className="text-xs text-clay hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;