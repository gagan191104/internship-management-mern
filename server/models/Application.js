const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    internship: { type: mongoose.Schema.Types.ObjectId, ref: "Internship", required: true },
    coverLetter: { type: String, default: "" },
    resumeLink: { type: String, default: "" },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected", "hired"],
      default: "applied",
    },
    eligible: {
      type: String,
      enum: ["pending", "eligible", "not_eligible"],
      default: "pending",
    },
    eligibilityNote: { type: String, default: "" },
    notes: { type: String, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

applicationSchema.index({ user: 1, internship: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
