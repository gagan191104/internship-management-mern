const express = require("express");
const Internship = require("../models/Internship");
const Application = require("../models/Application");
const { protectRoute } = require("../middleware/auth");

const router = express.Router();

// GET /api/employer/dashboard
router.get("/dashboard", protectRoute(["employer"], { requireVerified: true }), async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all internships posted by this employer
    const myPostings = await Internship.find({
      $or: [{ postedBy: userId }, { createdBy: userId }],
    }).sort({ createdAt: -1 });

    const internshipIds = myPostings.map((i) => i._id);

    // Get all applications for these internships
    const allApplications = await Application.find({
      internship: { $in: internshipIds },
    }).populate("user", "name email university");

    // Calculate stats
    const totalPostings = myPostings.length;
    const totalApplications = allApplications.length;
    const pending = allApplications.filter((app) => app.status === "applied").length;
    const hired = allApplications.filter((app) => app.status === "hired").length;

    // Get recent applications (last 5)
    const recentApplications = await Application.find({
      internship: { $in: internshipIds },
    })
      .populate("user", "name email university")
      .populate("internship", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalPostings,
        totalApplications,
        pending,
        hired,
      },
      myPostings,
      recentApplications,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// GET /api/employer/postings
router.get("/postings", protectRoute(["employer"], { requireVerified: true }), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {
      $or: [{ postedBy: req.user._id }, { createdBy: req.user._id }],
    };

    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    } else if (status === "deadline-passed") {
      filter.deadline = { $lt: new Date() };
    }

    const skip = (page - 1) * limit;
    const postings = await Internship.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Internship.countDocuments(filter);

    // Get applicant counts for each posting
    const postingsWithCounts = await Promise.all(
      postings.map(async (posting) => {
        const applicantCount = await Application.countDocuments({
          internship: posting._id,
        });
        return {
          ...posting.toObject(),
          applicantCount,
        };
      })
    );

    res.json({
      postings: postingsWithCounts,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// GET /api/employer/applications
router.get("/applications", protectRoute(["employer"], { requireVerified: true }), async (req, res) => {
  try {
    const { status, internshipId, page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    // Get all internships posted by this employer
    const myPostings = await Internship.find({
      $or: [{ postedBy: userId }, { createdBy: userId }],
    }).select("_id");
    const internshipIds = myPostings.map((i) => i._id);

    const filter = { internship: { $in: internshipIds } };

    if (status) {
      filter.status = status;
    }

    if (internshipId) {
      filter.internship = internshipId;
    }

    const skip = (page - 1) * limit;
    const applications = await Application.find(filter)
      .populate("user", "name email university major skills profileData")
      .populate("internship", "title company location")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Application.countDocuments(filter);

    res.json({
      applications,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// PATCH /api/employer/application/:id/status
router.patch("/application/:id/status", protectRoute(["employer"], { requireVerified: true }), async (req, res) => {
  try {
    const { status } = req.body;
    const STATUS_VALUES = ["applied", "shortlisted", "rejected", "hired"];

    if (!status || !STATUS_VALUES.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findById(req.params.id).populate("internship");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Check if the employer owns this internship
    const internship = application.internship;
    const owner = internship.postedBy || internship.createdBy;
    if (String(owner) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only manage applications for your own listings" });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      { status, reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    )
      .populate("user", "name email university major skills")
      .populate("internship", "title company location");

    res.json({ application: updatedApplication });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

module.exports = router;
