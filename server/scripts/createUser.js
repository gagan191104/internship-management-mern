require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");

async function main() {
  const [, , name, email, password, roleArg] = process.argv;
  const role = roleArg || "student";

  if (!name || !email || !password) {
    console.log("Usage:");
    console.log("npm run create-user -- \"Full Name\" email@example.com password123 [student|employer|admin]");
    process.exit(1);
  }

  if (!["student", "employer", "admin"].includes(role)) {
    throw new Error("Role must be 'student', 'employer', or 'admin'");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set in .env");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw new Error("User with this email already exists");
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hash,
    role,
  });

  console.log("User created successfully:");
  console.log(`- id: ${user._id}`);
  console.log(`- name: ${user.name}`);
  console.log(`- email: ${user.email}`);
  console.log(`- role: ${user.role}`);

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
