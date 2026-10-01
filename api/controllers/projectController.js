const Project = require("../models/Project");

const PROPERTY_TYPES = ["Apartment", "Villa", "Commercial"];

const getProjects = async (req, res, next) => {
  try {
    const { location, propertyType, minPrice, maxPrice, featured, sort } =
      req.query;

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 6, 1), 50);

    const filter = { published: true };

    if (typeof location === "string" && location.trim()) {
      filter.location = new RegExp(location.trim(), "i");
    }

    if (PROPERTY_TYPES.includes(propertyType)) {
      filter.propertyType = propertyType;
    }

    if (featured === "true") {
      filter.featured = true;
    }

    const priceFilter = {};
    if (minPrice && !isNaN(Number(minPrice))) {
      priceFilter.$gte = Number(minPrice);
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      priceFilter.$lte = Number(maxPrice);
    }
    if (Object.keys(priceFilter).length > 0) {
      filter.startingPrice = priceFilter;
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") {
      sortOption = { startingPrice: 1 };
    } else if (sort === "price_desc") {
      sortOption = { startingPrice: -1 };
    }

    const total = await Project.countDocuments(filter);
    const projects = await Project.find(filter)
      .select("-__v")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: projects,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

const getLocations = async (req, res, next) => {
  try {
    const locations = await Project.distinct("location", { published: true });
    locations.sort();
    res.status(200).json({ success: true, data: locations });
  } catch (error) {
    next(error);
  }
};

const getProjectOptions = async (req, res, next) => {
  try {
    const projects = await Project.find({ published: true })
      .select("name slug")
      .sort({ name: 1 });
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

const getProjectBySlug = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      slug: req.params.slug,
      published: true,
    }).select("-__v");

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getLocations,
  getProjectOptions,
  getProjectBySlug,
};
