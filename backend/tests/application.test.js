const request = require("supertest");
const app = require("../src/app");

const Student = require("../src/models/Student");
const Program = require("../src/models/Program");

describe("Application Workflow", () => {
  let student;
  let program;

  beforeAll(async () => {
    student = await Student.findOne();
    program = await Program.findOne();
  });

  test("should create application in draft status", async () => {
    const intake = program.intakes[0];

    const res = await request(app)
      .post("/api/applications")
      .send({
        student: student._id.toString(),
        program: program._id.toString(),
        intake,
      });

    expect(res.statusCode).toBe(201);

    expect(res.body.success).toBe(true);

    expect(res.body.data.status).toBe(
      "draft"
    );

    expect(
      res.body.data.timeline.length
    ).toBeGreaterThan(0);
  });


  test("should prevent duplicate applications", async () => {
  const intake = program.intakes[0];

  await request(app)
    .post("/api/applications")
    .send({
      student: student._id.toString(),
      program: program._id.toString(),
      intake,
    });

  const duplicate = await request(app)
    .post("/api/applications")
    .send({
      student: student._id.toString(),
      program: program._id.toString(),
      intake,
    });

  expect(duplicate.statusCode).toBe(409);

  expect(
    duplicate.body.success
  ).toBe(false);
});

});


