const mongoose = require("mongoose");
const connectDatabase = require("../src/config/database");

beforeAll(async () => {
  await connectDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
});