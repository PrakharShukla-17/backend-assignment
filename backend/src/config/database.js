const mongoose = require("mongoose");
const env = require("./env");

async function connectDatabase() {
  mongoose.set("strictQuery", true);

  const uri =
    process.env.NODE_ENV === "test"
      ? process.env.MONGODB_URI_TEST
      : env.mongoUri;

  await mongoose.connect(uri);

  console.log("Connected to MongoDB");
}

module.exports = connectDatabase;