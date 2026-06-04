function shapeUser(user) {
  if (!user) return null;
  const u = user.toObject?.() ?? user;
  const pd = u.profileData || {};
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    isVerified: u.isVerified,
    status: u.status,
    rejectionReason: u.rejectionReason || "",
    isActive: u.isActive !== false,
    phone: u.phone ?? "",
    university: u.university ?? "",
    major: u.major ?? "",
    bio: u.bio ?? "",
    gpa: u.gpa ?? null,
    skills: u.skills ?? [],
    companyName: u.companyName ?? "",
    profileData: {
      degree: pd.degree ?? "",
      graduationYear: pd.graduationYear ?? null,
      resumeUrl: pd.resumeUrl ?? "",
      resumeFilename: pd.resumeFilename ?? "",
      companyRegistrationNumber: pd.companyRegistrationNumber ?? "",
      industry: pd.industry ?? "",
      website: pd.website ?? "",
      address: pd.address ?? "",
    },
  };
}

module.exports = { shapeUser };
