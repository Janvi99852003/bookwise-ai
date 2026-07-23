// Converts "HH:mm" into total minutes since midnight, e.g. "09:30" -> 570
const timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Converts minutes since midnight back into "HH:mm"
const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

/**
 * Computes bookable time slots for one provider, one service, on one date.
 *
 * @param {Object} params
 * @param {string} params.dateStr - "YYYY-MM-DD"
 * @param {Object} params.availability - the provider's Availability document (weeklySchedule, exceptions, bufferMinutes, bookingWindowDays)
 * @param {number} params.durationMinutes - the service's duration
 * @param {Array}  params.existingBookings - bookings already on this date with status NOT cancelled ({ startTime, endTime })
 * @returns {string[]} array of bookable start times in "HH:mm", e.g. ["09:00", "10:00"]
 */
const getAvailableSlots = ({ dateStr, availability, durationMinutes, existingBookings }) => {
  const targetDate = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Reject dates in the past
  if (targetDate < today) return [];

  // Reject dates beyond the provider's booking window
  const windowDays = availability.bookingWindowDays || 30;
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + windowDays);
  if (targetDate > maxDate) return [];

  const dayOfWeek = targetDate.getDay(); // 0=Sunday ... 6=Saturday

  // Check for a date-specific exception first — it overrides the weekly pattern
  const exception = (availability.exceptions || []).find((ex) => ex.date === dateStr);

  let windowStart, windowEnd;

  if (exception) {
    if (!exception.isAvailable) return []; // provider explicitly blocked this date
    if (exception.startTime && exception.endTime) {
      windowStart = timeToMinutes(exception.startTime);
      windowEnd = timeToMinutes(exception.endTime);
    }
  }

  // No usable exception window — fall back to the regular weekly schedule
  if (windowStart === undefined) {
    const weeklySlot = (availability.weeklySchedule || []).find(
      (slot) => slot.dayOfWeek === dayOfWeek && slot.isActive
    );
    if (!weeklySlot) return []; // provider doesn't work this day of week
    windowStart = timeToMinutes(weeklySlot.startTime);
    windowEnd = timeToMinutes(weeklySlot.endTime);
  }

  const buffer = availability.bufferMinutes || 0;
  const step = durationMinutes + buffer;

  // Build every candidate slot start time within the working window
  const candidates = [];
  for (let start = windowStart; start + durationMinutes <= windowEnd; start += step) {
    candidates.push(start);
  }

  // Convert existing bookings to minute ranges for overlap checking
  const bookedRanges = (existingBookings || []).map((b) => ({
    start: timeToMinutes(b.startTime),
    end: timeToMinutes(b.endTime),
  }));

  const isToday = targetDate.getTime() === today.getTime();
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  const openSlots = candidates.filter((slotStart) => {
    const slotEnd = slotStart + durationMinutes;

    // Skip slots that have already passed today
    if (isToday && slotStart <= nowMinutes) return false;

    // Skip slots that overlap any existing (non-cancelled) booking
    const overlaps = bookedRanges.some(
      (b) => slotStart < b.end && slotEnd > b.start
    );
    return !overlaps;
  });

  return openSlots.map(minutesToTime);
};

module.exports = { getAvailableSlots, timeToMinutes, minutesToTime };