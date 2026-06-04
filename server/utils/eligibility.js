/**
 * Compares a student profile against an internship's eligibilityCriteria.
 * @param {{ gpa?: number|null, skills?: string[] }} student
 * @param {{ eligibilityCriteria?: object }} internship
 * @returns {{ eligible: boolean, reasons: string[] }}
 */
function normalizeSkills(skills) {
  if (!Array.isArray(skills)) return [];
  return skills.map((s) => String(s).toLowerCase().trim()).filter(Boolean);
}

function computeEligibility(student, internship) {
  const criteria = internship.eligibilityCriteria || {};
  const reasons = [];

  const minCgpa = criteria.minCgpa;
  if (minCgpa != null && minCgpa > 0) {
    const cgpa = student.gpa;
    if (cgpa == null || Number(cgpa) < Number(minCgpa)) {
      reasons.push(`Minimum CGPA of ${minCgpa} on a 10.0 scale is required.`);
      return { eligible: false, reasons };
    }
  }

  const required = normalizeSkills(criteria.requiredSkills || []);
  if (required.length > 0) {
    const userSkills = new Set(normalizeSkills(student.skills || []));
    let minMatch = criteria.minSkillMatchCount;
    if (minMatch == null || minMatch <= 0) {
      minMatch = required.length;
    }
    const matched = required.filter((s) => userSkills.has(s));
    if (matched.length < minMatch) {
      reasons.push(
        `At least ${minMatch} required skill(s) must match your profile (${matched.length} matched: ${matched.join(", ") || "none"}).`
      );
      return { eligible: false, reasons };
    }
  }

  return { eligible: true, reasons: [] };
}

module.exports = { computeEligibility, normalizeSkills };
