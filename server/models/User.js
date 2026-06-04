const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, default: "" },
    role: {
      type: String,
      enum: ["student", "employer", "admin"],
      required: true,
      default: "student",
    },
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, default: "" },
    isActive: { type: Boolean, default: true },

    // Student-specific fields
    university: { type: String, default: "" },
    degree: { type: String, default: "" },
    branch: { type: String, default: "" },
    graduationYear: { type: Number, default: null },
    gpa: { type: Number, min: 0, max: 10, default: null },
    skills: [{ type: String, trim: true, lowercase: true }],
    resume: { type: String, default: "" },
    profilePhoto: { type: String, default: "" },

    // Employer-specific fields
    companyName: { type: String, default: "", trim: true },
    companyRegistrationNumber: { type: String, default: "" },
    industry: { type: String, default: "" },
    companySize: { type: String, default: "" },
    website: { type: String, default: "" },
    address: { type: String, default: "" },
    companyLogo: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

userSchema.pre("save", function setAdminDefaults(next) {
  if (this.isNew && this.role === "admin") {
    this.isVerified = true;
    this.status = "approved";
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
