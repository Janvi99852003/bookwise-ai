const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  setAvailability,
  getMyAvailability,
  addException,
  removeException,
  getPublicAvailabilityBySlug,
} = require("../controllers/availabilityController");

// Public route — used by the booking page to compute open time slots
router.get("/public/:slug", getPublicAvailabilityBySlug);

// Protected routes — provider dashboard only
router.put("/", protect, setAvailability);
router.get("/mine", protect, getMyAvailability);
router.post("/exceptions", protect, addException);
router.delete("/exceptions/:date", protect, removeException);

module.exports = router;