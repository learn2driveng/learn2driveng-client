import type { GuardianRelationship } from "@/types";

export const relationshipOptions = [
  { label: "Parent", value: "parent" },
  { label: "Family", value: "family_member" },
  { label: "Partner", value: "other" },
  { label: "Friend", value: "other" },
] as const satisfies ReadonlyArray<{
  label: string;
  value: GuardianRelationship;
}>;

export const expiryOptions = [
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "Until removed", days: null },
] as const;

export function formatGuardianStatus(status: string) {
  return status.replace("_", " ");
}

export function formatGuardianDate(value: string | null) {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function getExpiryDate(days: number | null) {
  if (days === null) return null;

  const date = new Date();
  date.setDate(date.getDate() + days);

  return date.toISOString();
}
