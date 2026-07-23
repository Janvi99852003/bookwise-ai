const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Availability = require("../models/Availability");
const Provider = require("../models/Provider");
const { getAvailableSlots, timeToMinutes, minutesToTime } = require("../utils/slotCalculator");

// @route  GET /api/bookings/public/available-slots/:slug?serviceId=...&date=YYYY-MM-DD
// @desc   Compute open time slots for a given provider/service/date (no login needed)
const getPublicAvailableSlots = async (req, res) => {
  try {
    const { slug } = req.params;
    const { serviceId, date } = req.query;

    if (!serviceId || !date) {
      return res.status(400).json({ message: "serviceId and date query params are required" });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "date must be in YYYY-MM-DD format" });
    }

    const provider = await Provider.findOne({ slug });
    if (!provider) return res.status(404).json({ message: "Provider not found" });

    const service = await Service.findOne({
      _id: serviceId,
      provider: provider._id,
      isActive: true,
    });
    if (!service) return res.status(404).json({ message: "Service not found" });

    const availability = await Availability.findOne({ provider: provider._id });
    if (!availability) {
      return res.json({ slots: [] }); // provider hasn't set any availability yet
    }

    // Only bookings that actually hold a slot (not cancelled) block new bookings
    const existingBookings = await Booking.find({
      provider: provider._id,
      date,
      status: { $ne: "cancelled" },
    }).select("startTime endTime");

    const slots = getAvailableSlots({
      dateStr: date,
      availability,
      durationMinutes: service.durationMinutes,
      existingBookings,
    });

    return res.json({ date, serviceId, durationMinutes: service.durationMinutes, slots });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/bookings/public/:slug
// @desc   Create a booking (no login needed — this is the client-facing booking action)
// Note: created as "pending_payment" — Day 6 wires Razorpay to flip this to "confirmed"
const createBooking = async (req, res) => {
  try {
    const { slug } = req.params;
    const { serviceId, date, startTime, clientName, clientEmail, clientPhone } = req.body;

    if (!serviceId || !date || !startTime || !clientName || !clientEmail) {
      return res.status(400).json({
        message: "serviceId, date, startTime, clientName and clientEmail are required",
      });
    }

    const provider = await Provider.findOne({ slug });
    if (!provider) return res.status(404).json({ message: "Provider not found" });

    const service = await Service.findOne({
      _id: serviceId,
      provider: provider._id,
      isActive: true,
    });
    if (!service) return res.status(404).json({ message: "Service not found" });

    const availability = await Availability.findOne({ provider: provider._id });
    if (!availability) {
      return res.status(400).json({ message: "Provider has not set up availability" });
    }

    const existingBookings = await Booking.find({
      provider: provider._id,
      date,
      status: { $ne: "cancelled" },
    }).select("startTime endTime");

    // Re-validate the requested slot is genuinely still open — never trust the client's
    // claim blindly, since two people could be booking the same slot at once.
    const openSlots = getAvailableSlots({
      dateStr: date,
      availability,
      durationMinutes: service.durationMinutes,
      existingBookings,
    });

    if (!openSlots.includes(startTime)) {
      return res.status(409).json({ message: "That slot is no longer available. Please pick another." });
    }

    const endTime = minutesToTime(timeToMinutes(startTime) + service.durationMinutes);

    const booking = await Booking.create({
      provider: provider._id,
      service: service._id,
      clientName,
      clientEmail,
      clientPhone: clientPhone || "",
      date,
      startTime,
      endTime,
      amount: service.price,
      currency: service.currency,
      status: "pending_payment",
      paymentStatus: "pending",
    });

    return res.status(201).json(booking);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/bookings/mine
// @desc   Provider views their own bookings, optionally filtered by date or status
const getMyBookings = async (req, res) => {
  try {
    const { date, status } = req.query;
    const filter = { provider: req.provider._id };
    if (date) filter.date = date;
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("service", "title durationMinutes price")
      .sort({ date: 1, startTime: 1 });

    return res.json(bookings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/bookings/:id
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      provider: req.provider._id,
    }).populate("service", "title durationMinutes price");

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    return res.json(booking);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/bookings/:id/status
// @desc   Provider manually updates a booking's status (e.g. confirm a cash payment, mark no-show)
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending_payment", "confirmed", "cancelled", "completed", "no_show"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${validStatuses.join(", ")}` });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      provider: req.provider._id,
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = status;
    if (status === "confirmed") booking.paymentStatus = "paid"; // manual/offline confirmation
    await booking.save();

    return res.json(booking);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPublicAvailableSlots,
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
};