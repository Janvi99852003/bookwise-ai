const Service = require("../models/Service");

// @route  POST /api/services
// @desc   Create a new service for the logged-in provider
const createService = async (req, res) => {
  try {
    const { title, description, durationMinutes, price, currency } = req.body;

    if (!title || !durationMinutes || price === undefined) {
      return res.status(400).json({
        message: "title, durationMinutes and price are required",
      });
    }

    const service = await Service.create({
      provider: req.provider._id,
      title,
      description,
      durationMinutes,
      price,
      currency: currency || "INR",
    });

    return res.status(201).json(service);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/services/mine
// @desc   Get all services (active + inactive) belonging to the logged-in provider
const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.provider._id }).sort({
      createdAt: -1,
    });
    return res.json(services);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/services/:id
// @desc   Get a single service (must belong to the logged-in provider)
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      provider: req.provider._id,
    });
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    return res.json(service);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/services/:id
// @desc   Update a service
const updateService = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      provider: req.provider._id,
    });
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const { title, description, durationMinutes, price, currency, isActive } = req.body;

    if (title !== undefined) service.title = title;
    if (description !== undefined) service.description = description;
    if (durationMinutes !== undefined) service.durationMinutes = durationMinutes;
    if (price !== undefined) service.price = price;
    if (currency !== undefined) service.currency = currency;
    if (isActive !== undefined) service.isActive = isActive;

    await service.save();
    return res.json(service);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/services/:id
const deleteService = async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({
      _id: req.params.id,
      provider: req.provider._id,
    });
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    return res.json({ message: "Service deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/services/public/:slug
// @desc   Get all ACTIVE services for a provider by their public slug (no auth — used on booking page)
const getPublicServicesBySlug = async (req, res) => {
  try {
    const Provider = require("../models/Provider");
    const provider = await Provider.findOne({ slug: req.params.slug });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const services = await Service.find({
      provider: provider._id,
      isActive: true,
    }).select("title description durationMinutes price currency");

    return res.json({
      provider: {
        name: provider.name,
        businessName: provider.businessName,
        bio: provider.bio,
        slug: provider.slug,
      },
      services,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createService,
  getMyServices,
  getServiceById,
  updateService,
  deleteService,
  getPublicServicesBySlug,
};