export const preferredAreas = [
  { id: "lagos", label: "Lagos", city: "Lagos", state: "Lagos" },
  { id: "abuja", label: "Abuja", city: "Abuja", state: "FCT" },
  {
    id: "port-harcourt",
    label: "Port Harcourt",
    city: "Port Harcourt",
    state: "Rivers",
  },
  { id: "ibadan", label: "Ibadan", city: "Ibadan", state: "Oyo" },
  { id: "kano", label: "Kano", city: "Kano", state: "Kano" },
] as const;

export type PreferredAreaId = (typeof preferredAreas)[number]["id"];

export function getPreferredArea(id: PreferredAreaId) {
  return preferredAreas.find((area) => area.id === id) ?? preferredAreas[0];
}
