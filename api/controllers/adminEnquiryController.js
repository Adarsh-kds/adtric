const mongoose = require("mongoose");
const Enquiry = require("../models/Enquiry");
const sendToCrm = require("../utils/sendToCrm");

const STATUSES = ["New", "Contacted", "Site Visit Done", "Closed"];

const listEnquiries = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = 10;

    const filter = {};
    if (mongoose.isValidObjectId(req.query.project)) {
      filter.project = req.query.project;
    }
    if (STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    // Date range on the received time. Accepts ISO date-times.
    const from = new Date(req.query.from);
    const to = new Date(req.query.to);
    if (req.query.from && !Number.isNaN(from.getTime())) {
      filter.createdAt = { ...filter.createdAt, $gte: from };
    }
    if (req.query.to && !Number.isNaN(to.getTime())) {
      filter.createdAt = { ...filter.createdAt, $lte: to };
    }

    const total = await Enquiry.countDocuments(filter);
    const enquiries = await Enquiry.find(filter)
      .select("-__v")
      .populate("project", "name slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: enquiries,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

const updateEnquiryStatus = async (req, res, next) => {
  try {
    const status = typeof req.body.status === "string" ? req.body.status : "";

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found" });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("project", "name slug");

    if (!enquiry) {
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found" });
    }

    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    next(error);
  }
};

const retryCrm = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found" });
    }

    const enquiry = await Enquiry.findById(req.params.id).populate(
      "project",
      "name slug"
    );

    if (!enquiry) {
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found" });
    }

    const projectName = enquiry.project ? enquiry.project.name : "Deleted project";
    const crmWorked = await sendToCrm(enquiry, projectName);
    enquiry.crmStatus = crmWorked ? "Sent" : "Failed";
    await enquiry.save();

    res.status(200).json({
      success: true,
      message: crmWorked ? "Sent to CRM" : "CRM push failed again",
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

const deleteEnquiry = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found" });
    }

    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found" });
    }

    res.status(200).json({ success: true, message: "Enquiry deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { listEnquiries, updateEnquiryStatus, retryCrm, deleteEnquiry };
