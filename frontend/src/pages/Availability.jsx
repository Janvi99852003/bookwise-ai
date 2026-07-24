import { useEffect, useState } from "react";
import api from "../api/axios";

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const Availability = () => {
  const [schedule, setSchedule] = useState({}); // { [dayValue]: { isActive, startTime, endTime } }
  const [bufferMinutes, setBufferMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/availability/mine").then((res) => {
      const initial = {};
      DAYS.forEach((d) => {
        const existing = res.data.weeklySchedule?.find((s) => s.dayOfWeek === d.value);
        initial[d.value] = existing
          ? { isActive: true, startTime: existing.startTime, endTime: existing.endTime }
          : { isActive: false, startTime: "09:00", endTime: "17:00" };
      });
      setSchedule(initial);
      setBufferMinutes(res.data.bufferMinutes || 0);
      setLoading(false);
    });
  }, []);

  const toggleDay = (day) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], isActive: !schedule[day].isActive },
    });
  };

  const updateTime = (day, field, value) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], [field]: value },
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const weeklySchedule = Object.entries(schedule)
      .filter(([, v]) => v.isActive)
      .map(([day, v]) => ({
        dayOfWeek: Number(day),
        startTime: v.startTime,
        endTime: v.endTime,
        isActive: true,
      }));

    try {
      await api.put("/availability", { weeklySchedule, bufferMinutes });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-cream/40 font-mono text-sm">Loading...</p>;
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-cream mb-1">Availability</h1>
      <p className="text-cream/50 mb-8">Set your regular working hours each week.</p>

      <div className="ledger-card p-6 mb-6">
        {DAYS.map((day) => {
          const entry = schedule[day.value];
          return (
            <div key={day.value} className="ledger-row items-center">
              <label className="flex items-center gap-3 w-36 shrink-0 cursor-pointer">
                <input
                  type="checkbox"
                  checked={entry.isActive}
                  onChange={() => toggleDay(day.value)}
                  className="accent-brass w-4 h-4"
                />
                <span className={entry.isActive ? "font-medium" : "text-ink/40"}>
                  {day.label}
                </span>
              </label>
              {entry.isActive ? (
                <div className="flex items-center gap-2 font-mono text-sm">
                  <input
                    type="time"
                    value={entry.startTime}
                    onChange={(e) => updateTime(day.value, "startTime", e.target.value)}
                    className="input-field !py-1.5 !w-32"
                  />
                  <span className="text-ink/40">to</span>
                  <input
                    type="time"
                    value={entry.endTime}
                    onChange={(e) => updateTime(day.value, "endTime", e.target.value)}
                    className="input-field !py-1.5 !w-32"
                  />
                </div>
              ) : (
                <span className="text-ink/30 text-sm">Not available</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="ledger-card p-6 mb-6">
        <label className="block text-sm font-medium mb-1.5">
          Buffer between bookings (minutes)
        </label>
        <input
          type="number"
          min={0}
          value={bufferMinutes}
          onChange={(e) => setBufferMinutes(Number(e.target.value))}
          className="input-field max-w-[160px]"
        />
        <p className="text-ink/40 text-xs mt-2">
          Gap enforced between consecutive bookings, e.g. for travel or notes.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="btn-brass">
          {saving ? "Saving..." : "Save availability"}
        </button>
        {saved && <span className="text-sage text-sm font-medium">Saved</span>}
      </div>
    </div>
  );
};

export default Availability;