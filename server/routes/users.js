const express = require("express");
const User = require("../models/User");
const { protectRoute } = require("../middleware/auth");
const { shapeUser } = require("../utils/userShape");

const router = express.Router();

router.get("/profile", protectRoute([]), async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json({ user: shapeUser(user) });
});

router.patch("/profile", protectRoute([]), async (req, res) => {
  const { name, phone, university, major, bio, gpa, skills, companyName, profileData } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = String(name).trim();
  if (phone !== undefined) updates.phone = String(phone);
  if (university !== undefined) updates.university = String(university);
  if (major !== undefined) updates.major = String(major);
  if (bio !== undefined) updates.bio = String(bio);
  if (companyName !== undefined && req.user.role === "employer") {
    updates.companyName = String(companyName).trim();
  }
  if (req.user.role === "student") {
    if (gpa !== undefined) {
      const n = gpa === "" || gpa === null ? null : Number(gpa);
      if (n != null && (Number.isNaN(n) || n < 0 || n > 4)) {
        return res.status(400).json({ message: "GPA must be between 0 and 4" });
      }
      updates.gpa = n;
    }
    if (skills !== undefined) {
      updates.skills = Array.isArray(skills)
        ? skills.map((s) => String(s).toLowerCase().trim()).filter(Boolean)
        : String(skills)
            .split(/[,;\n]/)
            .map((s) => s.toLowerCase().trim())
            .filter(Boolean);
    }
  }
  if (profileData && typeof profileData === "object") {
    updates.profileData = { ...req.user.profileData?.toObject?.() ?? req.user.profileData ?? {}, ...profileData };
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select(
    "-password"
  );
  res.json({ user: shapeUser(user) });
});

module.exports = router;
