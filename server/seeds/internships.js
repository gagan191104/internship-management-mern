/**
 * 20 internship listings — tech, finance, healthcare, media, engineering, design, marketing, law.
 */
const base = require("../data/internships20");

const industrySkills = {
  "Software Engineering Intern": ["java", "algorithms", "git"],
  "Data Science Intern": ["python", "sql", "statistics"],
  "Finance Intern": ["excel", "finance", "analysis"],
  "Marketing Intern": ["marketing", "communication", "analytics"],
  "Legal Research Intern": ["research", "writing", "law"],
};

/** Override first entries to match auditor examples; keep 20 total from base. */
const headline = [
  {
    title: "Software Engineering Intern",
    company: "Google",
    location: "Bangalore",
    type: "Remote",
    duration: "3 months",
    stipend: "₹50,000/month",
    description: "Work on scalable systems and product features with mentorship from senior engineers.",
    skills: ["java", "python", "algorithms", "git"],
    requirements: ["CS or related degree", "Data structures", "Problem solving"],
    eligibilityCriteria: { minCgpa: 7.5, degreeRequired: "Computer Science", requiredSkills: ["java", "python"], minSkillMatchCount: 1 },
    openings: 8,
    deadlineDaysFromNow: 40,
  },
  {
    title: "Data Science Intern",
    company: "Flipkart",
    location: "Bangalore",
    type: "Hybrid",
    duration: "6 months",
    stipend: "₹35,000/month",
    description: "Build ML models and analytics pipelines for e-commerce personalization.",
    skills: ["python", "sql", "machine learning"],
    requirements: ["Python", "SQL", "Statistics"],
    eligibilityCriteria: { minCgpa: 7.0, degreeRequired: "STEM", requiredSkills: ["python", "sql"], minSkillMatchCount: 2 },
    openings: 5,
    deadlineDaysFromNow: 45,
  },
  {
    title: "UI/UX Design Intern",
    company: "Swiggy",
    location: "Mumbai",
    type: "On-site",
    duration: "3 months",
    stipend: "₹25,000/month",
    description: "Design consumer flows for food delivery apps with user research and prototyping.",
    skills: ["figma", "ui", "ux research"],
    requirements: ["Figma", "Portfolio", "User empathy"],
    eligibilityCriteria: { minCgpa: 6.5, requiredSkills: ["figma", "ui"], minSkillMatchCount: 2 },
    openings: 3,
    deadlineDaysFromNow: 30,
  },
  {
    title: "Finance Intern",
    company: "HDFC Bank",
    location: "Mumbai",
    type: "On-site",
    duration: "2 months",
    stipend: "₹15,000/month",
    description: "Support retail banking analytics, reporting, and regulatory documentation.",
    skills: ["excel", "finance", "analysis"],
    requirements: ["Finance or Commerce background", "Excel", "Attention to detail"],
    eligibilityCriteria: { minCgpa: 6.5, degreeRequired: "Finance", requiredSkills: ["excel", "finance"], minSkillMatchCount: 2 },
    openings: 4,
    deadlineDaysFromNow: 25,
  },
  {
    title: "Marketing Intern",
    company: "HUL",
    location: "Delhi",
    type: "Hybrid",
    duration: "3 months",
    stipend: "₹20,000/month",
    description: "Assist brand campaigns, social content, and market research for FMCG products.",
    skills: ["marketing", "communication", "analytics"],
    requirements: ["Marketing interest", "Communication", "Creativity"],
    eligibilityCriteria: { minCgpa: 6.0, requiredSkills: ["marketing", "communication"], minSkillMatchCount: 2 },
    openings: 6,
    deadlineDaysFromNow: 35,
  },
];

const rest = base.slice(5).map((row, i) => ({
  ...row,
  skills: row.eligibilityCriteria?.requiredSkills?.length
    ? [...row.eligibilityCriteria.requiredSkills]
    : ["communication"],
  openings: 2 + (i % 6),
}));

module.exports = [...headline, ...rest].map((row) => {
  const { deadlineDaysFromNow, deadline: existingDeadline, ...restRow } = row;
  const deadline =
    existingDeadline instanceof Date && !Number.isNaN(existingDeadline.getTime())
      ? existingDeadline
      : deadlineDaysFromNow != null
        ? new Date(Date.now() + deadlineDaysFromNow * 24 * 60 * 60 * 1000)
        : undefined;
  return { ...restRow, isActive: true, deadline };
});
