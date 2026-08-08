import type { AuthUser, InstructorProfileSummary } from "@/types";

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function authUserToInstructorProfile(
  user: AuthUser,
  schoolName: string,
): InstructorProfileSummary {
  const name = `${user.firstName} ${user.lastName}`.trim();

  return {
    schoolId: user.schoolId ?? "",
    instructorId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name,
    initials: initialsFromName(name),
    email: user.email,
    phone: user.phone,
    profilePhoto: user.profilePhoto ?? null,
    status: user.status,
    schoolName,
    verified: user.isEmailVerified,
    availableToday: true,
    outstandingReports: 0,
  };
}
