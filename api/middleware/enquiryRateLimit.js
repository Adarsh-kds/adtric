const rateLimit = require("express-rate-limit");

const enquiryRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again in a minute.",
    });
  },
});

module.exports = enquiryRateLimit;
