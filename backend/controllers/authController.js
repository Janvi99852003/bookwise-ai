const jwt = require("jsonwebtoken");
const Provider = require("../models/Provider");
const { sendEmail } = require("../utils/email");
const { generateOTP, OTP_EXPIRY_MINUTES } = require("../utils/otp");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Turns "Janvi Fitness Coaching" into a unique slug like "janvi-fitness-coaching"
// and appends a number if that slug is already taken.
const generateUniqueSlug = async (baseText) => {
  const base = baseText
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  let slug = base;
  let counter = 1;
  while (await Provider.findOne({ slug })) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
};

// @route  POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password, businessName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await Provider.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const slug = await generateUniqueSlug(businessName || name);

    const provider = await Provider.create({
      name,
      email,
      password,
      businessName: businessName || "",
      slug,
    });

    return res.status(201).json({
      _id: provider._id,
      name: provider.name,
      email: provider.email,
      slug: provider.slug,
      plan: provider.plan,
      token: generateToken(provider._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/auth/login
// @desc   Step 1 of login: verify password, then email an OTP. No token issued yet.
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const provider = await Provider.findOne({ email: email.toLowerCase() }).select("+password");
    if (!provider || !(await provider.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const otp = generateOTP();
    provider.otp = otp;
    provider.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await provider.save();

    try {
      await sendEmail({
        to: provider.email,
        subject: "Your BookWise AI login code",
        text: `Your login code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes. If you didn't try to log in, you can ignore this email.`,
      });
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError.message);
      return res.status(500).json({ message: "Could not send OTP email. Please try again." });
    }

    return res.json({
      message: "OTP sent to your email",
      otpRequired: true,
      providerId: provider._id,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/auth/verify-otp
// @desc   Step 2 of login: check the OTP, and only now issue the JWT
const verifyOtp = async (req, res) => {
  try {
    const { providerId, otp } = req.body;

    if (!providerId || !otp) {
      return res.status(400).json({ message: "providerId and otp are required" });
    }

    const provider = await Provider.findById(providerId).select("+otp +otpExpiry");
    if (!provider || !provider.otp) {
      return res.status(400).json({ message: "No OTP request found. Please log in again." });
    }

    if (provider.otpExpiry < new Date()) {
      provider.otp = null;
      provider.otpExpiry = null;
      await provider.save();
      return res.status(400).json({ message: "OTP has expired. Please log in again." });
    }

    if (provider.otp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    // OTP correct — clear it so it can't be reused, then issue the real token
    provider.otp = null;
    provider.otpExpiry = null;
    await provider.save();

    return res.json({
      _id: provider._id,
      name: provider.name,
      email: provider.email,
      slug: provider.slug,
      plan: provider.plan,
      token: generateToken(provider._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/auth/resend-otp
// @desc   Re-send a fresh OTP if the old one expired or the email didn't arrive
const resendOtp = async (req, res) => {
  try {
    const { providerId } = req.body;
    if (!providerId) {
      return res.status(400).json({ message: "providerId is required" });
    }

    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const otp = generateOTP();
    provider.otp = otp;
    provider.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await provider.save();

    await sendEmail({
      to: provider.email,
      subject: "Your new BookWise AI login code",
      text: `Your new login code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    });

    return res.json({ message: "A new OTP has been sent to your email" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/auth/me   (protected)
const getMe = async (req, res) => {
  return res.json(req.provider);
};

// @route  POST /api/auth/forgot-password
// @desc   Sends a reset code to the account's email — reuses the same OTP fields as login
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const provider = await Provider.findOne({ email: email.toLowerCase() });

    // Always respond the same way whether or not the email exists — this avoids
    // leaking which emails are registered (a basic security practice).
    if (provider) {
      const otp = generateOTP();
      provider.otp = otp;
      provider.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
      await provider.save();

      try {
        await sendEmail({
          to: provider.email,
          subject: "Reset your BookWise AI password",
          text: `Your password reset code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes. If you didn't request this, you can ignore this email.`,
        });
      } catch (emailError) {
        console.error("Failed to send reset email:", emailError.message);
      }
    }

    return res.json({
      message: "If that email is registered, a reset code has been sent.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/auth/reset-password
// @desc   Verifies the reset code and sets a new password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "email, otp and newPassword are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const provider = await Provider.findOne({ email: email.toLowerCase() }).select("+otp +otpExpiry");
    if (!provider || !provider.otp) {
      return res.status(400).json({ message: "No reset request found. Please try again." });
    }

    if (provider.otpExpiry < new Date()) {
      provider.otp = null;
      provider.otpExpiry = null;
      await provider.save();
      return res.status(400).json({ message: "Reset code has expired. Please request a new one." });
    }

    if (provider.otp !== otp) {
      return res.status(400).json({ message: "Incorrect reset code" });
    }

    // Setting .password and calling .save() re-triggers the pre-save bcrypt hash hook
    provider.password = newPassword;
    provider.otp = null;
    provider.otpExpiry = null;
    await provider.save();

    return res.json({ message: "Password updated. You can now log in with your new password." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { signup, login, verifyOtp, resendOtp, getMe, forgotPassword, resetPassword };