const express = require("express");

const {
  getShortlistSummary,
} = require("../controllers/aiController");

const router = express.Router();

router.get(
  "/shortlist-summary/:studentId",
  getShortlistSummary
);

module.exports = router;