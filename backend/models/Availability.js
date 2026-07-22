const mongoose = require("mongoose");

// One entry per day of the week the provider works.
// dayOfWeek: 0 = Sunday, 1 = Monday, ... 6 = Saturday (matches JS Date.getDay())
const weeklySlotSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "startTime must be in HH:mm format"],
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "endTime must be in HH:mm format"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const exceptionSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format"],
    },
    isAvailable: {
      type: Boolean,
      required: true,
    },
    startTime: { type: String, default: null },
    endTime: { type: String, default: null },
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
      unique: true,
    },
    bufferMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    bookingWindowDays: {
      type: Number,
      default: 30,
      min: 1,
    },
    weeklySchedule: {
      type: [weeklySlotSchema],
      default: [],
    },
    exceptions: {
      type: [exceptionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Availability", availabilitySchema);