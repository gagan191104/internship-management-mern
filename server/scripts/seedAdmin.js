/**
 * Creates the bootstrap admin from .env (never via public registration).
 * Run: npm run seed:admin
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");

async function run() {
  const uri = process.env.MONGO_URI;
  const email = (process.env.ADMIN_EMAIL || "admin@internhub.com").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "StrongPass@123";
  const name = process.env.ADMIN_NAME || "Platform Admin";

  if (!uri) throw new Error("MONGO_URI missing in .env");
  if (!process.env.JWT_SECRET) {
    console.warn("Warning: JWT_SECRET is not set in .env");
  }

  await mongoose.connect(uri);

  const hash = await bcrypt.hash(password, 12);
  let admin = await User.findOne({ email });

  if (admin) {
    admin.name = name;
    admin.password = hash;
    admin.role = "admin";
    admin.isVerified = true;
    admin.status = "approved";
    admin.isActive = true;
    admin.rejectionReason = "";
    await admin.save();
    console.log("Updated existing admin:", email);
  } else {
    admin = await User.create({
      name,
      email,
      password: hash,
      role: "admin",
      isVerified: true,
      status: "approved",
    });
    console.log("Created admin:", email);
  }

  console.log("Admin credentials (store securely):");
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${password}`);

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
