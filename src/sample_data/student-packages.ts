import type { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

/** Presentation fixtures. Replace with learner package API responses. */
export type StudentPackage = {
  id: string;
  name: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  totalSessions: number;
  remainingSessions: number;
  status: "active" | "expired";
  expiresOn?: string;
};

export const studentPackages: StudentPackage[] = [
  {
    id: "defensive-driving",
    name: "Defensive Driving Package",
    icon: "shield-car",
    totalSessions: 10,
    remainingSessions: 10,
    status: "active",
  },
  {
    id: "professional-driving",
    name: "Professional Driving Package",
    icon: "steering",
    totalSessions: 10,
    remainingSessions: 10,
    status: "active",
  },
  {
    id: "road-ready-starter",
    name: "Road Ready Starter",
    icon: "car-shift-pattern",
    totalSessions: 6,
    remainingSessions: 2,
    status: "expired",
    expiresOn: "12 June 2026",
  },
];
