const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getPublicAvailableSlots,
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
} = require("../controllers/bookingController");

// Public routes — no login, used by the client-facing booking page
router.get("/public/available-slots/:slug", getPublicAvailableSlots);
router.post("/public/:slug", createBooking);

// Protected routes — provider dashboard only
router.get("/mine", protect, getMyBookings);
router.get("/:id", protect, getBookingById);
router.put("/:id/status", protect, updateBookingStatus);

module.exports = router;