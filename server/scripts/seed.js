/**
 * Seeds demo users + 20 internships. Admin bootstrap: npm run seed:admin
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const Internship = require("../models/Internship");
const Application = require("../models/Application");
const listings = require("../seeds/internships");

async function ensureUser({ email, data }) {
  const password = await bcrypt.hash("demo1234", 12);
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, password, ...data });
    console.log("Created", data.role + ":", email, "/ demo1234");
  } else {
    Object.assign(user, data);
    user.password = password;
    await user.save();
    console.log("Updated", data.role + ":", email);
  }
  return user;
}

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI missing in .env");
  const resetInternships = process.argv.includes("--reset-internships");

  await mongoose.connect(uri);

  const admin = await ensureUser({
    email: "admin@demo.com",
    data: {
      name: "Demo Admin",
      role: "admin",
      isVerified: true,
      status: "approved",
    },
  });

  const student = await ensureUser({
    email: "student@demo.com",
    data: {
      name: "Demo Student",
      role: "student",
      university: "State University",
      major: "Computer Science",
      gpa: 3.6,
      skills: ["javascript", "react", "nodejs", "mongodb", "python", "sql", "git", "java"],
      isVerified: true,
      status: "approved",
      profileData: {
        degree: "B.Tech Computer Science",
        graduationYear: 2026,
        resumeUrl: "",
      },
    },
  });

  const employer = await ensureUser({
    email: "employer@demo.com",
    data: {
      name: "Demo Employer",
      role: "employer",
      companyName: "Acme Talent Partners",
      isVerified: true,
      status: "approved",
      profileData: {
        companyRegistrationNumber: "REG-DEMO-001",
        industry: "Technology",
        website: "https://example.com",
        address: "Bangalore, India",
      },
    },
  });

  const count = await Internship.countDocuments();
  if (count === 0 || resetInternships) {
    if (resetInternships && count > 0) {
      await Application.deleteMany({});
      await Internship.deleteMany({});
      console.log("Cleared internships and applications.");
    }
    const docs = listings.map((L) => ({
      ...L,
      createdBy: admin._id,
      postedBy: admin._id,
    }));
    await Internship.insertMany(docs);
    console.log("Inserted 20 internship listings.");
  } else {
    console.log(`Skipping internships (${count} exist). Use --reset-internships to reload.`);
  }

  console.log("\nDemo logins (student & employer pre-approved for testing):");
  console.log("  admin@demo.com / demo1234");
  console.log("  student@demo.com / demo1234");
  console.log("  employer@demo.com / demo1234");
  console.log("\nProduction admin: npm run seed:admin (uses ADMIN_EMAIL from .env)");

  await mongoose.disconnect();
  console.log("Seed done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
