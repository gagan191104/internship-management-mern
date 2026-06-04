const express = require("express");
const User = require("../models/User");
const Internship = require("../models/Internship");
const Application = require("../models/Application");
const { protectRoute } = require("../middleware/auth");
const { sendApprovalEmail, sendRejectionEmail } = require("../utils/email");
const { shapeUser } = require("../utils/userShape");

const router = express.Router();
const adminOnly = protectRoute(["admin"]);

const APP_STATUSES = ["applied", "shortlisted", "rejected", "hired"];

// GET /api/admin/pending-users
router.get("/pending-users", adminOnly, async (req, res) => {
  const users = await User.find({
    role: { $in: ["student", "employer"] },
    status: "pending",
  })
    .select("-password")
    .sort({ createdAt: -1 });
  res.json({ users: users.map(shapeUser) });
});

// GET /api/admin/users?role=student|employer&status=approved|pending|rejected
router.get("/users", adminOnly, async (req, res) => {
  const { role, status, q } = req.query;
  const filter = { role: { $in: ["student", "employer"] } };
  if (role && ["student", "employer"].includes(role)) filter.role = role;
  if (status && ["pending", "approved", "rejected"].includes(status)) filter.status = status;
  if (q) {
    filter.$or = [
      { name: new RegExp(String(q), "i") },
      { email: new RegExp(String(q), "i") },
      { companyName: new RegExp(String(q), "i") },
    ];
  }
  const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
  res.json({ users: users.map(shapeUser) });
});

// PATCH /api/admin/student/:id/approve
router.patch("/student/:id/approve", adminOnly, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== "student") {
    return res.status(404).json({ message: "Student not found" });
  }
  user.isVerified = true;
  user.status = "approved";
  user.rejectionReason = "";
  await user.save();
  try {
    await sendApprovalEmail(user);
  } catch (e) {
    console.error("Approval email failed:", e.message);
  }
  res.json({ user: shapeUser(user), message: "Student approved" });
});

// PATCH /api/admin/student/:id/reject
router.patch("/student/:id/reject", adminOnly, async (req, res) => {
  const { reason } = req.body;
  const user = await User.findById(req.params.id);
  if (!user || user.role !== "student") {
    return res.status(404).json({ message: "Student not found" });
  }
  user.isVerified = false;
  user.status = "rejected";
  user.rejectionReason = reason ? String(reason).trim() : "Did not meet verification requirements.";
  await user.save();
  try {
    await sendRejectionEmail(user, user.rejectionReason);
  } catch (e) {
    console.error("Rejection email failed:", e.message);
  }
  res.json({ user: shapeUser(user), message: "Student rejected" });
});

// PATCH /api/admin/employer/:id/approve
router.patch("/employer/:id/approve", adminOnly, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== "employer") {
    return res.status(404).json({ message: "Employer not found" });
  }
  user.isVerified = true;
  user.status = "approved";
  user.rejectionReason = "";
  await user.save();
  try {
    await sendApprovalEmail(user);
  } catch (e) {
    console.error("Approval email failed:", e.message);
  }
  res.json({ user: shapeUser(user), message: "Employer approved" });
});

// PATCH /api/admin/employer/:id/reject
router.patch("/employer/:id/reject", adminOnly, async (req, res) => {
  const { reason } = req.body;
  const user = await User.findById(req.params.id);
  if (!user || user.role !== "employer") {
    return res.status(404).json({ message: "Employer not found" });
  }
  user.isVerified = false;
  user.status = "rejected";
  user.rejectionReason = reason ? String(reason).trim() : "Did not meet verification requirements.";
  await user.save();
  try {
    await sendRejectionEmail(user, user.rejectionReason);
  } catch (e) {
    console.error("Rejection email failed:", e.message);
  }
  res.json({ user: shapeUser(user), message: "Employer rejected" });
});

// PATCH /api/admin/users/:userId/deactivate
router.patch("/users/:userId/deactivate", adminOnly, async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user || user.role === "admin") {
    return res.status(404).json({ message: "User not found" });
  }
  user.isActive = false;
  await user.save();
  res.json({ user: shapeUser(user), message: "User deactivated" });
});

// GET /api/admin/applications
router.get("/applications", adminOnly, async (req, res) => {
  const list = await Application.find()
    .populate("user", "name email university profileData status isVerified")
    .populate("internship")
    .populate("reviewedBy", "name email")
    .sort({ createdAt: -1 });
  res.json({ applications: list });
});

// PATCH /api/admin/application/:id/eligibility
router.patch("/application/:id/eligibility", adminOnly, async (req, res) => {
  const { eligible, eligibilityNote } = req.body;
  const ELIGIBLE_STATUSES = ["pending", "eligible", "not_eligible"];
  
  if (!eligible || !ELIGIBLE_STATUSES.includes(eligible)) {
    return res.status(400).json({ message: "Invalid eligibility status" });
  }

  const updates = {
    eligible,
    eligibilityNote: eligibilityNote || "",
    reviewedBy: req.user._id,
    reviewedAt: new Date(),
  };

  const doc = await Application.findByIdAndUpdate(req.params.id, updates, { new: true })
    .populate("user", "name email university degree branch gpa skills")
    .populate("internship", "title company")
    .populate("reviewedBy", "name email");
  
  if (!doc) return res.status(404).json({ message: "Application not found" });
  res.json({ application: doc });
});

// PATCH /api/admin/application/:id/status
router.patch("/application/:id/status", adminOnly, async (req, res) => {
  const { status } = req.body;
  const application = await Application.findById(req.params.id);
  
  if (!application) return res.status(404).json({ message: "Application not found" });

  // Eligibility guard
  if (["shortlisted", "hired"].includes(status)) {
    if (application.eligible !== "eligible") {
      return res.status(400).json({
        message: "Verify eligibility first before shortlisting or hiring."
      });
    }
  }

  // Hire guard - must be shortlisted first
  if (status === "hired" && application.status !== "shortlisted") {
    return res.status(400).json({
      message: "Student must be shortlisted before marking as hired."
    });
  }

  if (!APP_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const updates = {
    status,
    reviewedBy: req.user._id,
    reviewedAt: new Date(),
  };

  const doc = await Application.findByIdAndUpdate(req.params.id, updates, { new: true })
    .populate("user", "name email")
    .populate("internship")
    .populate("reviewedBy", "name email");
  
  res.json({ application: doc });
});

// GET /api/admin/listings
router.get("/listings", adminOnly, async (req, res) => {
  const list = await Internship.find()
    .populate("postedBy", "name email companyName")
    .sort({ createdAt: -1 });
  res.json({ internships: list });
});

// PATCH /api/admin/listings/:id/toggle
router.patch("/listings/:id/toggle", adminOnly, async (req, res) => {
  const doc = await Internship.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Listing not found" });
  doc.isActive = !doc.isActive;
  await doc.save();
  res.json({ internship: doc });
});

module.exports = router;
