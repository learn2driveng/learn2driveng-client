import type { MaterialCommunityIcons } from "@expo/vector-icons";

import type { ReadinessArea } from "@/types";

export const assessmentAreaMeta: Record<
  ReadinessArea,
  {
    label: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
  }
> = {
  road_rules: { label: "Road rules", icon: "road-variant" },
  road_signs: { label: "Road signs", icon: "sign-direction" },
  hazard_perception: {
    label: "Hazard awareness",
    icon: "alert-decagram-outline",
  },
  vehicle_safety: { label: "Vehicle safety", icon: "car-wrench" },
};

export function formatAssessmentDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
