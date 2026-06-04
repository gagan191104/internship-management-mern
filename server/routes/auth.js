const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protectRoute } = require("../middleware/auth");
const { uploadResume } = require("../middleware/upload");
const { shapeUser } = require("../utils/userShape");

const router = express.Router();
const PUBLIC_ROLES = ["student", "employer"];

function signToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      isVerified: user.isVerified,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /api/auth/register
router.post("/register", uploadResume.single("resume"), async (req, res) => {
  try {
    const body = req.body || {};
    const { name, email, password, role: roleRaw } = body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    if (roleRaw === "admin") {
      return res.status(403).json({ message: "Admin accounts cannot be registered publicly" });
    }
    const role = PUBLIC_ROLES.includes(roleRaw) ? roleRaw : "student";

    const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 12);
    const profileData = {};
    const skills = [];

    if (role === "student") {
      const { university, degree, graduationYear, skills: skillsRaw } = body;
      if (!university?.trim()) {
        return res.status(400).json({ message: "University is required for students" });
      }
      Object.assign(profileData, {
        degree: degree ? String(degree).trim() : "",
        graduationYear: graduationYear ? Number(graduationYear) : null,
      });
      if (req.file) {
        profileData.resumeFilename = req.file.filename;
        profileData.resumeUrl = `/uploads/resumes/${req.file.filename}`;
      } else if (body.resumeUrl) {
        profileData.resumeUrl = String(body.resumeUrl).trim();
      }
      if (skillsRaw) {
        const parsed =
          typeof skillsRaw === "string"
            ? skillsRaw.split(/[,;\n]/).map((s) => s.trim().toLowerCase()).filter(Boolean)
            : Array.isArray(skillsRaw)
              ? skillsRaw
              : [];
        skills.push(...parsed);
      }
    }

    if (role === "employer") {
      const { companyName, companyRegistrationNumber, industry, website, address } = body;
      if (!companyName?.trim()) {
        return res.status(400).json({ message: "Company name is required for employers" });
      }
      Object.assign(profileData, {
        companyRegistrationNumber: companyRegistrationNumber ? String(companyRegistrationNumber).trim() : "",
        industry: industry ? String(industry).trim() : "",
        website: website ? String(website).trim() : "",
        address: address ? String(address).trim() : "",
      });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password: hashed,
      role,
      isVerified: false,
      status: "pending",
      university: role === "student" ? String(body.university || "").trim() : "",
      major: body.major ? String(body.major).trim() : "",
      skills,
      companyName: role === "employer" ? String(body.companyName || "").trim() : "",
      profileData,
    });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: shapeUser(user),
      message: "Registration submitted. An admin will review your account before you can apply or post listings.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    res.json({ token, user: shapeUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// GET /api/auth/me
router.get("/me", protectRoute([]), async (req, res) => {
  res.json({ user: shapeUser(req.user) });
});

module.exports = router;
