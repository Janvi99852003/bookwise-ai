const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    // Client details — clients don't have accounts, they just book
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    clientEmail: {
      type: String,
      required: [true, "Client email is required"],
      trim: true,
      lowercase: true,
    },
    clientPhone: {
      type: String,
      trim: true,
      default: "",
    },
    // Stored as YYYY-MM-DD + HH:mm so slot math never has timezone surprises
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format"],
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
    // pending_payment: booking created, awaiting Razorpay payment (Day 6)
    // confirmed: payment received (or provider manually confirmed)
    // cancelled / completed / no_show: outcome after the fact
    status: {
      type: String,
      enum: ["pending_payment", "confirmed", "cancelled", "completed", "no_show"],
      default: "pending_payment",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    // Filled in on Day 6 once Razorpay is wired in
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Fast lookup of a provider's bookings on a given date (used constantly in slot math)
bookingSchema.index({ provider: 1, date: 1 });

module.exports = mongoose.model("Booking", bookingSchema);