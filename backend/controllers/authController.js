const jwt = require("jsonwebtoken");
const Provider = require("../models/Provider");

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

// @route  GET /api/auth/me   (protected)
const getMe = async (req, res) => {
  return res.json(req.provider);
};

module.exports = { signup, login, getMe };