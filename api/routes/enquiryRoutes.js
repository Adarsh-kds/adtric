const express = require("express");
const { createEnquiry } = require("../controllers/enquiryController");
const enquiryRateLimit = require("../middleware/enquiryRateLimit");

const router = express.Router();

router.post("/", enquiryRateLimit, createEnquiry);

module.exports = router;
