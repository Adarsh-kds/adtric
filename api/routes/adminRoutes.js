const express = require("express");
const auth = require("../middleware/auth");
const loginRateLimit = require("../middleware/loginRateLimit");
const uploadProjectImages = require("../middleware/upload");
const { login } = require("../controllers/adminAuthController");
const {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  removeGalleryImage,
} = require("../controllers/adminProjectController");
const {
  listEnquiries,
  updateEnquiryStatus,
  retryCrm,
  deleteEnquiry,
} = require("../controllers/adminEnquiryController");

const router = express.Router();

router.post("/login", loginRateLimit, login);

router.use(auth);

router.get("/projects", listProjects);
router.get("/projects/:id", getProject);
router.post("/projects", uploadProjectImages, createProject);
router.put("/projects/:id", uploadProjectImages, updateProject);
router.delete("/projects/:id/gallery", removeGalleryImage);
router.delete("/projects/:id", deleteProject);

router.get("/enquiries", listEnquiries);
router.patch("/enquiries/:id/status", updateEnquiryStatus);
router.post("/enquiries/:id/retry-crm", retryCrm);
router.delete("/enquiries/:id", deleteEnquiry);

module.exports = router;
