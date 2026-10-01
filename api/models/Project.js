const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [120, "Name must be at most 120 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    propertyType: {
      type: String,
      required: [true, "Property type is required"],
      enum: {
        values: ["Apartment", "Villa", "Commercial"],
        message: "Property type must be Apartment, Villa or Commercial",
      },
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["Upcoming", "Under Construction", "Ready"],
        message: "Status must be Upcoming, Under Construction or Ready",
      },
    },
    startingPrice: {
      type: Number,
      required: [true, "Starting price is required"],
      min: [0, "Starting price cannot be negative"],
      cast: "Starting price must be a number",
    },
    configuration: {
      type: String,
      required: [true, "Configuration is required"],
      trim: true,
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
      maxlength: [300, "Short description must be at most 300 characters"],
    },
    coverImage: {
      type: String,
      required: [true, "Cover image is required"],
      trim: true,
    },
    gallery: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
