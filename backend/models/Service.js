const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    // How long one session/appointment takes
    durationMinutes: {
      type: Number,
      required: [true, "Duration in minutes is required"],
      min: 5,
    },
    // Stored in rupees (e.g. 999.00). Converted to paise only when calling Razorpay.
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    // Providers can deactivate a service without deleting it (keeps booking history intact)
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Fast lookup of all active services for a given provider (used on the public booking page)
serviceSchema.index({ provider: 1, isActive: 1 });

module.exports = mongoose.model("Service", serviceSchema);