const multer = require("multer");

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 7 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG and WebP images are allowed"));
    }
  },
}).fields([
  { name: "coverImage", maxCount: 1 },
  { name: "gallery", maxCount: 6 },
]);

const uploadProjectImages = (req, res, next) => {
  upload(req, res, (error) => {
    if (!error) {
      return next();
    }

    let message = error.message;
    let field = error.field || "coverImage";

    if (error.code === "LIMIT_FILE_SIZE") {
      message = "Each image must be 2 MB or smaller";
    } else if (error.code === "LIMIT_UNEXPECTED_FILE" && field === "gallery") {
      message = "You can upload up to 6 gallery images at a time";
    } else if (error.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected file field";
    } else if (error.code === "LIMIT_FILE_COUNT") {
      message = "Too many files";
    }

    res.status(400).json({
      success: false,
      message,
      errors: { [field]: message },
    });
  });
};

module.exports = uploadProjectImages;
