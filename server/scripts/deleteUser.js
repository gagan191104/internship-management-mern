require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Application = require("../models/Application");

async function main() {
  const [, , emailArg] = process.argv;
  if (!emailArg) {
    console.log("Usage:");
    console.log("npm run delete-user -- email@example.com");
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set in .env");
  }

  const email = emailArg.toLowerCase().trim();
  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const deletedApplications = await Application.deleteMany({ user: user._id });
  await User.deleteOne({ _id: user._id });

  console.log("User deleted successfully:");
  console.log(`- email: ${email}`);
  console.log(`- role: ${user.role}`);
  console.log(`- related applications removed: ${deletedApplications.deletedCount}`);

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err.message || err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
