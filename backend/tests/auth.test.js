const request = require("supertest");
const app = require("../src/app");

describe("Authentication", () => {
  test("should register a new student", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        fullName: "Test User",
        email: `test${Date.now()}@example.com`,
        password: "Candidate123!",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);

    expect(res.body.data.token).toBeDefined();

    expect(res.body.data.user.fullName).toBe(
      "Test User"
    );
  });
});