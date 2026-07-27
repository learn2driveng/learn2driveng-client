import type { MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * Client-only progress models. No matching server module yet —
 * do not treat these as API DTOs during integration.
 */
export type ProgressSkill = {
  id: string;
  name: string;
  progress: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  note: string;
};

export type LearnerAssessment = {
  id: string;
  title: string;
  category: string;
  score: number;
  status: "passed" | "needs_practice";
  completedAt: string;
  summary: string;
};

export type LearnerProgressLesson = {
  id: string;
  title: string;
  schoolName: string;
  instructorName: string;
  completedAt: string;
  duration: string;
  score: number;
  focusAreas: string[];
  feedback: string;
};
