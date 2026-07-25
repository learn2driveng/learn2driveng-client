/**
 * Client-only readiness assessment models. No matching server module yet —
 * do not treat these as API DTOs during integration.
 */
export type ReadinessArea =
  | "road_rules"
  | "road_signs"
  | "hazard_perception"
  | "vehicle_safety";

export type SchoolLearnerStatus = "active" | "on_hold" | "completed";
export type AssessmentAssignmentStatus =
  | "assigned"
  | "in_progress"
  | "completed";

export type AssessmentOption = { id: string; text: string };

export type AssessmentQuestion = {
  id: string;
  prompt: string;
  scenario: string | null;
  options: AssessmentOption[];
  correctOptionId: string;
  explanation: string;
};

export type ReadinessAssessment = {
  id: string;
  schoolId: string;
  createdBy: string;
  createdAt: string;
  title: string;
  description: string;
  area: ReadinessArea;
  durationMinutes: number;
  passingScore: number;
  questions: AssessmentQuestion[];
  status: "draft" | "published";
};

export type SchoolLearner = {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  packageName: string;
  instructorId: string | null;
  instructorName: string | null;
  joinedAt: string;
  status: SchoolLearnerStatus;
  completedLessons: number;
  totalLessons: number;
  practicalReadiness: number;
};

export type AssessmentAssignment = {
  id: string;
  assessmentId: string;
  learnerId: string;
  assignedAt: string;
  dueAt: string;
  status: AssessmentAssignmentStatus;
  latestAttemptId: string | null;
};

export type AssessmentAttempt = {
  id: string;
  assignmentId: string;
  answers: Record<string, string>;
  score: number;
  passed: boolean;
  completedAt: string;
};
