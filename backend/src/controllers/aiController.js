const Student = require("../models/Student");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");

const {
  buildProgramRecommendations,
} = require("../services/recommendationService");

const {
  generateShortlistSummary,
} = require("../services/aiService");

const getShortlistSummary = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const student = await Student.findById(studentId).lean();

  if (!student) {
    throw new HttpError(404, "Student not found.");
  }

  const recommendationPayload =
    await buildProgramRecommendations(studentId);

  const recommendations =
    recommendationPayload.data.recommendations;

  const summary = await generateShortlistSummary(
    student,
    recommendations
  );

  res.json({
    success: true,
    data: {
      studentId,
      summary,
    },
  });
});

module.exports = {
  getShortlistSummary,
};