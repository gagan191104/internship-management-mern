const express = require("express");
const Internship = require("../models/Internship");
const Application = require("../models/Application");
const { auth, protectRoute } = require("../middleware/auth");
const { computeEligibility } = require("../utils/eligibility");
const User = require("../models/User");

const router = express.Router();

function parseList(input) {
  if (Array.isArray(input)) return input.map((s) => String(s).trim()).filter(Boolean);
  if (typeof input === "string") {
    return input
      .split(/[\r\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeBody(body, user) {
  const requirements = parseList(body.requirements);
  const skills = parseList(body.skills);
  const ec = body.eligibilityCriteria || {};
  const eligibilityCriteria = {
    minCgpa: ec.minCgpa === "" || ec.minCgpa == null ? null : Number(ec.minCgpa),
    degreeRequired: ec.degreeRequired ? String(ec.degreeRequired).trim() : "",
    branchPreferred: ec.branchPreferred ? String(ec.branchPreferred).trim() : "",
    requiredSkills: parseList(ec.requiredSkills).map((s) => s.toLowerCase()),
    minSkillMatchCount:
      ec.minSkillMatchCount === "" || ec.minSkillMatchCount == null
        ? null
        : Math.max(1, Number(ec.minSkillMatchCount)),
  };
  if (eligibilityCriteria.minCgpa != null && Number.isNaN(eligibilityCriteria.minCgpa)) {
    eligibilityCriteria.minCgpa = null;
  }

  const company =
    user.role === "employer" && user.companyName
      ? String(user.companyName).trim()
      : String(body.company || "").trim();

  return {
    title: String(body.title || "").trim(),
    company: company || String(body.company || "").trim(),
    location: body.location !== undefined ? String(body.location) : "",
    type: body.type,
    duration: body.duration !== undefined ? String(body.duration) : "",
    stipend: body.stipend !== undefined ? String(body.stipend) : "",
    description: body.description !== undefined ? String(body.description) : "",
    skills,
    requirements,
    eligibilityCriteria,
    openings: body.openings != null ? Math.max(0, Number(body.openings)) : 1,
    deadline: body.deadline ? new Date(body.deadline) : undefined,
    isActive: body.isActive !== false,
  };
}

function ownsListing(user, job) {
  const owner = job.postedBy || job.createdBy;
  return String(owner) === String(user._id);
}

router.get("/employer/listings", protectRoute(["employer"], { requireVerified: true }), async (req, res) => {
  const list = await Internship.find({
    $or: [{ postedBy: req.user._id }, { createdBy: req.user._id }],
  }).sort({ createdAt: -1 });
  res.json({ internships: list });
});

router.get("/", auth(false), async (req, res) => {
  const { search, type, scope } = req.query;
  const filter = {};
  const isAdmin = req.user?.role === "admin";
  if (!isAdmin || scope !== "all") {
    filter.isActive = true;
  }
  if (search) {
    filter.$or = [
      { title: new RegExp(String(search), "i") },
      { company: new RegExp(String(search), "i") },
    ];
  }
  if (type && ["Remote", "On-site", "Hybrid"].includes(type)) {
    filter.type = type;
  }
  const list = await Internship.find(filter)
    .sort({ createdAt: -1 })
    .populate("postedBy", "name email companyName");
  res.json({ internships: list });
});

router.get("/:id", auth(false), async (req, res) => {
  const item = await Internship.findById(req.params.id).populate("postedBy", "name email companyName");
  if (!item) return res.status(404).json({ message: "Internship not found" });
  res.json({ internship: item });
});

router.post(
  "/:id/apply",
  protectRoute(["student"], { requireVerified: true }),
  async (req, res) => {
    const internshipId = req.params.id;
    const internship = await Internship.findById(internshipId);
    if (!internship || !internship.isActive) {
      return res.status(404).json({ message: "Internship not available" });
    }

    const student = await User.findById(req.user._id).select("gpa skills profileData");
    const { eligible, reasons } = computeEligibility(student, internship);
    const { coverLetter, resumeLink } = req.body;

    try {
      const app = await Application.create({
        user: req.user._id,
        internship: internshipId,
        coverLetter: coverLetter || "",
        resumeLink: resumeLink || req.user.profileData?.resumeUrl || "",
        status: "applied",
        eligibilityStatus: eligible,
        eligibilityNotes: reasons.join(" ") || "",
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
);

router.post("/", protectRoute(["admin", "employer"], { requireVerified: true }), async (req, res) => {
  if (req.user.role === "employer" && !req.user.isVerified) {
    return res.status(403).json({ message: "Your account is pending admin approval." });
  }
  const payload = normalizeBody(req.body, req.user);
  if (!payload.title || !payload.company) {
    return res.status(400).json({ message: "title and company are required" });
  }
  const doc = await Internship.create({
    ...payload,
    createdBy: req.user._id,
    postedBy: req.user._id,
  });
  res.status(201).json({ internship: doc });
});

router.put("/:id", protectRoute(["admin", "employer"], { requireVerified: true }), async (req, res) => {
  const existing = await Internship.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Not found" });
  if (req.user.role === "employer" && !ownsListing(req.user, existing)) {
    return res.status(403).json({ message: "You can only edit internships you posted" });
  }
  const payload = normalizeBody({ ...existing.toObject(), ...req.body }, req.user);
  const doc = await Internship.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  res.json({ internship: doc });
});

router.delete("/:id", protectRoute(["admin", "employer"], { requireVerified: true }), async (req, res) => {
  const existing = await Internship.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Not found" });
  if (req.user.role === "employer" && !ownsListing(req.user, existing)) {
    return res.status(403).json({ message: "You can only delete internships you posted" });
  }
  await Application.deleteMany({ internship: req.params.id });
  await Internship.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;
