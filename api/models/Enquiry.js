const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name must be at most 80 characters"],
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email address"],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message must be at most 500 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ["New", "Contacted", "Site Visit Done", "Closed"],
        message: "Invalid status",
      },
      default: "New",
    },
    crmStatus: {
      type: String,
      enum: {
        values: ["Sent", "Failed"],
        message: "CRM status must be Sent or Failed",
      },
    },
  },
  { timestamps: true }
);

enquirySchema.index({ mobile: 1, project: 1, createdAt: -1 });

module.exports = mongoose.model("Enquiry", enquirySchema);
