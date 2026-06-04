const mongoose = require("mongoose");

const eligibilityCriteriaSchema = new mongoose.Schema(
  {
    minCgpa: { type: Number, min: 0, max: 10, default: null },
    degreeRequired: { type: String, default: "" },
    branchPreferred: { type: String, default: "" },
    requiredSkills: [{ type: String, trim: true, lowercase: true }],
    minSkillMatchCount: { type: Number, min: 1, default: null },
  },
  { _id: false }
);

const internshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, default: "" },
    type: {
      type: String,
      enum: ["Remote", "On-site", "Hybrid"],
      default: "Remote",
    },
    duration: { type: String, default: "" },
    stipend: { type: String, default: "" },
    description: { type: String, default: "" },
    skills: [{ type: String, trim: true }],
    requirements: [{ type: String, trim: true }],
    eligibilityCriteria: { type: eligibilityCriteriaSchema, default: () => ({}) },
    deadline: { type: Date },
    openings: { type: Number, default: 1, min: 0 },
    isActive: { type: Boolean, default: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

internshipSchema.pre("save", function syncPostedBy(next) {
  if (this.createdBy && !this.postedBy) this.postedBy = this.createdBy;
  if (this.postedBy && !this.createdBy) this.createdBy = this.postedBy;
  next();
});

module.exports = mongoose.model("Internship", internshipSchema);
