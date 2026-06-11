const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const Student = require("../models/Student");
const jwt = require("jsonwebtoken");

const env = require("../config/env");


function starterMessage(capability) {
  return `${capability} is intentionally left incomplete for the candidate assignment.`;
}

const register = asyncHandler(async (req, res) => {
  const fullName = req.body.fullName?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const { password, role } = req.body;

  // Validating required fields
  if (!fullName || !email || !password) {
    throw new HttpError(
      400,
      "Full name, email and password are required."
    );
  }

  // Validating roles
  const allowedRoles = ["student", "counselor"];

  if (role && !allowedRoles.includes(role)) {
    throw new HttpError(400, "Invalid role.");
  }

  // Checking for existing user ie
  //email duplicacy check:
  const existingStudent = await Student.findOne({ email });

  if (existingStudent) {
    throw new HttpError(409, "Email already registered.");
  }

  //making entry into the db:
  const student = await Student.create({
    fullName,
    email,
    password,
    role: role || "student",
  });

  // Generating token
  const token = jwt.sign(
    {
      sub: student._id,
      role: student.role,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    }
  );

  //successfull response:
  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        role: student.role,
      },
    },
  });

});

const login = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { password } = req.body;

  // Validating input
  if (!email || !password) {
    throw new HttpError(
      400,
      "Email and password are required."
    );
  }

  //finding if email exists in DB
  const student = await Student.findOne({ email });

  if (!student) {
    throw new HttpError(
      401,
      "Invalid email or password."
    );
  }

  // Verifying password
  const isMatch = await student.comparePassword(password);

  if (!isMatch) {
    throw new HttpError(
      401,
      "Invalid email or password."
    );
  }

  //token generation
  const token = jwt.sign(
    {
      sub: student._id,
      role: student.role,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    }
  );

  // Sending response
  res.json({
    success: true,
    data: {
      token,
      user: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        role: student.role,
      },
    },
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

module.exports = {
  register,
  login,
  me,
};
