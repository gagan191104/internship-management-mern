require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");

async function main() {
  const [, , emailArg, nameArg, roleArg, passwordArg] = process.argv;

  if (!emailArg) {
    console.log("Usage:");
    console.log(
      "npm run update-user -- email@example.com [newName|-] [student|employer|admin|-] [newPassword|-]"
    );
    console.log("Tip: use '-' to keep a field unchanged.");
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set in .env");
  }

  const email = emailArg.toLowerCase().trim();
  const updates = {};

  if (nameArg && nameArg !== "-") {
    updates.name = nameArg.trim();
  }

  if (roleArg && roleArg !== "-") {
    if (!["student", "employer", "admin"].includes(roleArg)) {
      throw new Error("Role must be 'student', 'employer', or 'admin'");
    }
    updates.role = roleArg;
  }

  if (passwordArg && passwordArg !== "-") {
    updates.password = await bcrypt.hash(passwordArg, 10);
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No updates provided. Pass name/role/password or use '-' placeholders.");
  }

  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOneAndUpdate({ email }, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new Error("User not found");
  }

  console.log("User updated successfully:");
  console.log(`- id: ${user._id}`);
  console.log(`- name: ${user.name}`);
  console.log(`- email: ${user.email}`);
  console.log(`- role: ${user.role}`);
  if (passwordArg && passwordArg !== "-") {
    console.log("- password: updated");
  }

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
