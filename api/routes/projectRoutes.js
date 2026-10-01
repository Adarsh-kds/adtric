const express = require("express");
const {
  getProjects,
  getLocations,
  getProjectOptions,
  getProjectBySlug,
} = require("../controllers/projectController");

const router = express.Router();

router.get("/", getProjects);
router.get("/locations", getLocations);
router.get("/options/list", getProjectOptions);
router.get("/:slug", getProjectBySlug);

module.exports = router;
