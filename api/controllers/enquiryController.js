const mongoose = require("mongoose");
const Enquiry = require("../models/Enquiry");
const Project = require("../models/Project");
const sendToCrm = require("../utils/sendToCrm");
const sendEmail = require("../utils/sendEmail");

const asText = (value) => (typeof value === "string" ? value : "");

const createEnquiry = async (req, res, next) => {
  try {
    const name = asText(req.body.name);
    const mobile = asText(req.body.mobile);
    const email = asText(req.body.email);
    const message = asText(req.body.message);
    const projectId = asText(req.body.project);

    const projectIdIsValid = mongoose.isValidObjectId(projectId);

    const enquiry = new Enquiry({
      name,
      mobile,
      email: email || undefined,
      message: message || undefined,
      project: projectIdIsValid ? projectId : undefined,
    });

    const errors = {};
    try {
      await enquiry.validate();
    } catch (error) {
      if (error.name !== "ValidationError") {
        throw error;
      }
      Object.keys(error.errors).forEach((field) => {
        errors[field] = error.errors[field].message;
      });
    }

    if (projectId && !projectIdIsValid) {
      errors.project = "Select a valid project";
    }

    if (Object.keys(errors).length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Validation failed", errors });
    }

    const project = await Project.findOne({
      _id: projectId,
      published: true,
    }).select("name");

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const duplicate = await Enquiry.findOne({
      mobile,
      project: project._id,
      createdAt: { $gte: oneDayAgo },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "We have already received your enquiry.",
      });
    }

    await enquiry.save();

    const crmWorked = await sendToCrm(enquiry, project.name);
    enquiry.crmStatus = crmWorked ? "Sent" : "Failed";
    await enquiry.save();

    sendEmail(enquiry, project.name);

    res.status(201).json({
      success: true,
      message: "Thank you! Your enquiry has been received.",
      data: { id: enquiry._id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createEnquiry };
