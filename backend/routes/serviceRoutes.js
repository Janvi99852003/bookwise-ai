const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createService,
  getMyServices,
  getServiceById,
  updateService,
  deleteService,
  getPublicServicesBySlug,
} = require("../controllers/serviceController");

// Public route — no login needed, used by the client-facing booking page (Day 3+)
router.get("/public/:slug", getPublicServicesBySlug);

// Protected routes — provider dashboard only
router.post("/", protect, createService);
router.get("/mine", protect, getMyServices);
router.get("/:id", protect, getServiceById);
router.put("/:id", protect, updateService);
router.delete("/:id", protect, deleteService);

module.exports = router;