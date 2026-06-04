const express = require("express");
const Application = require("../models/Application");
const Internship = require("../models/Internship");
const User = require("../models/User");
const { protectRoute, auth, requireVerified } = require("../middleware/auth");
const { computeEligibility } = require("../utils/eligibility");

const router = express.Router();

const STATUS_VALUES = ["applied", "shortlisted", "rejected", "hired"];

async function employerOwnsInternship(userId, internshipId) {
  const job = await Internship.findById(internshipId).select("postedBy createdBy");
  const owner = job?.postedBy || job?.createdBy;
  return job && String(owner) === String(userId);
}

async function submitApplication(req, res, internshipId) {
  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Only students may submit applications" });
  }
  if (!req.user.isVerified) {
    return res.status(403).json({ message: "Your account is pending admin approval." });
  }

  const { coverLetter, resumeLink } = req.body;
  const internship = await Internship.findById(internshipId);
  if (!internship || !internship.isActive) {
    return res.status(404).json({ message: "Internship not available" });
  }

  try {
    const app = await Application.create({
      user: req.user._id,
      internship: internshipId,
      coverLetter: coverLetter || "",
      resumeLink: resumeLink || req.user.resume || "",
      status: "applied",
      eligible: "pending",
      eligibilityNote: "",
    });
    await app.populate("internship");
    res.status(201).json({ application: app });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You already applied to this internship" });
    }
    res.status(500).json({ message: err.message || "Server error" });
  }
}

// POST /api/applications
router.post("/", protectRoute(["student"], { requireVerified: true }), async (req, res) => {
  const { internshipId } = req.body;
  if (!internshipId) return res.status(400).json({ message: "internshipId required" });
  return submitApplication(req, res, internshipId);
});

// POST /api/internships/:id/apply (mounted from internships router too)
router.post("/internship/:internshipId", protectRoute(["student"], { requireVerified: true }), async (req, res) => {
  req.body = req.body || {};
  return submitApplication(req, res, req.params.internshipId);
});

router.get("/mine", protectRoute(["student"]), async (req, res) => {
  const list = await Application.find({ user: req.user._id })
    .select("-eligible -eligibilityNote -reviewedBy -reviewedAt")
    .populate("internship")
    .sort({ createdAt: -1 });
  res.json({ applications: list });
});

router.get("/manage", protectRoute(["admin", "employer"]), async (req, res) => {
  let filter = {};
  if (req.user.role === "employer") {
    const mine = await Internship.find({
      $or: [{ postedBy: req.user._id }, { createdBy: req.user._id }],
    }).select("_id");
    filter = { internship: { $in: mine.map((d) => d._id) } };
  }
  const list = await Application.find(filter)
    .populate("user", "name email university major gpa skills profileData status isVerified")
    .populate("internship")
    .sort({ createdAt: -1 });
  res.json({ applications: list });
});

router.get("/employer", protectRoute(["employer"], { requireVerified: true }), async (req, res) => {
  const mine = await Internship.find({
    $or: [{ postedBy: req.user._id }, { createdBy: req.user._id }],
  }).select("_id");
  const list = await Application.find({ internship: { $in: mine.map((d) => d._id) } })
    .populate("user", "name email university profileData skills")
    .populate("internship")
    .sort({ createdAt: -1 });
  res.json({ applications: list });
});

router.patch("/:id", protectRoute(["admin", "employer"]), async (req, res) => {
  const { status, notes } = req.body;
  const app = await Application.findById(req.params.id).populate("internship");
  if (!app) return res.status(404).json({ message: "Not found" });

  if (req.user.role === "employer") {
    const ok = await employerOwnsInternship(req.user._id, app.internship._id);
    if (!ok) return res.status(403).json({ message: "You can only manage applications for your own listings" });
  }

  const updates = {};
  if (status !== undefined) {
    if (!STATUS_VALUES.includes(status)) return res.status(400).json({ message: "Invalid status" });
    updates.status = status;
    updates.reviewedBy = req.user._id;
    updates.reviewedAt = new Date();
  }
  if (notes !== undefined) updates.notes = String(notes);

  const doc = await Application.findByIdAndUpdate(req.params.id, updates, { new: true })
    .populate("user", "name email university major gpa skills")
    .populate("internship");
  res.json({ application: doc });
});

router.delete("/:id", protectRoute(["admin"]), async (req, res) => {
  const doc = await Application.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
});

router.get("/admin/all", protectRoute(["admin"]), async (req, res) => {
  const list = await Application.find()
    .populate("user", "name email university major gpa skills")
    .populate("internship")
    .sort({ createdAt: -1 });
  res.json({ applications: list });
});

module.exports = router;
