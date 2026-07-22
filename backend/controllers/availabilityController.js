const Availability = require("../models/Availability");
const Provider = require("../models/Provider");

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const validateWeeklySchedule = (weeklySchedule) => {
  if (!Array.isArray(weeklySchedule)) return "weeklySchedule must be an array";

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  for (const slot of weeklySchedule) {
    if (
      typeof slot.dayOfWeek !== "number" ||
      slot.dayOfWeek < 0 ||
      slot.dayOfWeek > 6
    ) {
      return "Each slot needs a dayOfWeek between 0 (Sunday) and 6 (Saturday)";
    }
    if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
      return "startTime/endTime must be in HH:mm 24-hour format";
    }
    if (slot.startTime >= slot.endTime) {
      return `On ${DAY_NAMES[slot.dayOfWeek]}, startTime must be before endTime`;
    }
  }
  return null;
};

// @route  PUT /api/availability
// @desc   Create or fully replace the logged-in provider's weekly schedule
// Upsert pattern: providers will call this every time they edit their hours in the dashboard,
// so we overwrite rather than requiring separate create/update flows.
const setAvailability = async (req, res) => {
  try {
    const { weeklySchedule, bufferMinutes, bookingWindowDays } = req.body;

    const validationError = validateWeeklySchedule(weeklySchedule || []);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const availability = await Availability.findOneAndUpdate(
      { provider: req.provider._id },
      {
        provider: req.provider._id,
        weeklySchedule,
        ...(bufferMinutes !== undefined && { bufferMinutes }),
        ...(bookingWindowDays !== undefined && { bookingWindowDays }),
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json(availability);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/availability/mine
const getMyAvailability = async (req, res) => {
  try {
    const availability = await Availability.findOne({ provider: req.provider._id });
    if (!availability) {
      return res.json({
        provider: req.provider._id,
        weeklySchedule: [],
        exceptions: [],
        bufferMinutes: 0,
        bookingWindowDays: 30,
      });
    }
    return res.json(availability);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/availability/exceptions
// @desc   Add or update a one-off exception (e.g. block a holiday, or open a special day)
const addException = async (req, res) => {
  try {
    const { date, isAvailable, startTime, endTime } = req.body;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "date is required in YYYY-MM-DD format" });
    }
    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({ message: "isAvailable must be true or false" });
    }

    let availability = await Availability.findOne({ provider: req.provider._id });
    if (!availability) {
      availability = await Availability.create({ provider: req.provider._id });
    }

    // Remove any existing exception for this date, then add the new one
    availability.exceptions = availability.exceptions.filter((ex) => ex.date !== date);
    availability.exceptions.push({ date, isAvailable, startTime, endTime });

    await availability.save();
    return res.json(availability);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/availability/exceptions/:date
const removeException = async (req, res) => {
  try {
    const availability = await Availability.findOne({ provider: req.provider._id });
    if (!availability) {
      return res.status(404).json({ message: "No availability found" });
    }

    availability.exceptions = availability.exceptions.filter(
      (ex) => ex.date !== req.params.date
    );
    await availability.save();
    return res.json(availability);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/availability/public/:slug
// @desc   Public read of a provider's schedule (used to compute open slots on the booking page, Day 3)
const getPublicAvailabilityBySlug = async (req, res) => {
  try {
    const provider = await Provider.findOne({ slug: req.params.slug });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const availability = await Availability.findOne({ provider: provider._id });
    if (!availability) {
      return res.json({ weeklySchedule: [], exceptions: [], bufferMinutes: 0, bookingWindowDays: 30 });
    }

    return res.json({
      weeklySchedule: availability.weeklySchedule,
      exceptions: availability.exceptions,
      bufferMinutes: availability.bufferMinutes,
      bookingWindowDays: availability.bookingWindowDays,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  setAvailability,
  getMyAvailability,
  addException,
  removeException,
  getPublicAvailabilityBySlug,
};