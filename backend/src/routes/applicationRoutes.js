const express = require("express");
const { requireAuth } = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  createApplication,
  listApplications,
  updateApplicationStatus,
} = require("../controllers/applicationController");

const router = express.Router();

router.get("/", listApplications);
router.post("/", createApplication);
router.patch(
  "/:id/status",
  requireAuth,
  authorize("counselor"),
  updateApplicationStatus
);

module.exports = router;
