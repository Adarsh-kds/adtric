const rateLimit = require("express-rate-limit");

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many login attempts. Please try again in 15 minutes.",
    });
  },
});

module.exports = loginRateLimit;
