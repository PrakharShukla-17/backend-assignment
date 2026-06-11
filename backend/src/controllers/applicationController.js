const Application = require("../models/Application");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const Program = require("../models/Program");
const {
  validStatusTransitions,
} = require("../config/constants");

const listApplications = asyncHandler(async (req, res) => {
  const { studentId, status } = req.query;
  const filters = {};

  if (studentId) {
    filters.student = studentId;
  }

  if (status) {
    filters.status = status;
  }

  const applications = await Application.find(filters)
    .populate("student", "fullName email role")
    .populate("program", "title degreeLevel tuitionFeeUsd")
    .populate("university", "name country city")
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: applications,
  });
});

const createApplication = asyncHandler(async (req, res) => {
  const { student, program, intake } = req.body;

  if (!student || !program || !intake) {
    throw new HttpError(
      400,
      "Student, program and intake are required."
    );
  }

  const existingApplication = await Application.findOne({
    student,
    program,
    intake,
  });

  if (existingApplication) {
    throw new HttpError(
      409,
      "Application already exists for this program and intake."
    );
  }

  const selectedProgram = await Program.findById(program);

  if (!selectedProgram) {
    throw new HttpError(
      404,
      "Program not found."
    );
  }
  if (!selectedProgram.intakes.includes(intake)) {
  throw new HttpError(
    400,
    `Program does not offer ${intake} intake.`
  );
}

  const application = await Application.create({
    student,
    program,
    university: selectedProgram.university,
    destinationCountry: selectedProgram.country,
    intake,
    status: "draft",
  });

  res.status(201).json({
    success: true,
    data: application,
  });

});

const updateApplicationStatus = asyncHandler(async (req, res) => {
   const { id } = req.params;
  const { status, note } = req.body;

  const application = await Application.findById(id);

  if (!application) {
    throw new HttpError(
      404,
      "Application not found."
    );
  }

  const allowedTransitions =
    validStatusTransitions[application.status] || [];

  if (!allowedTransitions.includes(status)) {
    throw new HttpError(
      400,
      `Invalid status transition from ${application.status} to ${status}.`
    );
  }

  application.status = status;

  application.timeline.push({
    status,
    note:
      note ||
      `Status changed to ${status}`,
  });

  await application.save();

  res.json({
    success: true,
    data: application,
  });
});

module.exports = {
  createApplication,
  listApplications,
  updateApplicationStatus,
};
