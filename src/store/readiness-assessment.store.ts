import { create } from "zustand";

import {
  assessmentAssignments,
  assessmentAttempts,
  readinessAssessments,
  schoolLearners,
} from "@/sample_data";
import type {
  AssessmentAssignment,
  AssessmentAttempt,
  ReadinessAssessment,
  SchoolLearner,
} from "@/types";

type ReadinessAssessmentState = {
  learners: SchoolLearner[];
  assessments: ReadinessAssessment[];
  assignments: AssessmentAssignment[];
  attempts: AssessmentAttempt[];
  assignAssessment: (assessmentId: string, learnerId: string) => boolean;
  startAssessment: (assignmentId: string) => void;
  submitAssessment: (
    assignmentId: string,
    answers: Record<string, string>,
  ) => AssessmentAttempt | null;
};

export const useReadinessAssessmentStore = create<ReadinessAssessmentState>(
  (set, get) => ({
    learners: schoolLearners,
    assessments: readinessAssessments,
    assignments: assessmentAssignments,
    attempts: assessmentAttempts,
    assignAssessment: (assessmentId, learnerId) => {
      const state = get();
      const assessment = state.assessments.find(
        (item) => item.id === assessmentId && item.status === "published",
      );
      const learner = state.learners.find((item) => item.id === learnerId);
      const alreadyOpen = state.assignments.some(
        (item) =>
          item.assessmentId === assessmentId &&
          item.learnerId === learnerId &&
          item.status !== "completed",
      );

      if (!assessment || !learner || alreadyOpen) return false;

      const now = new Date();
      const dueAt = new Date(now);
      dueAt.setDate(dueAt.getDate() + 7);
      const assignment: AssessmentAssignment = {
        id: `assignment-${learnerId}-${Date.now().toString(36)}`,
        assessmentId,
        learnerId,
        assignedAt: now.toISOString(),
        dueAt: dueAt.toISOString(),
        status: "assigned",
        latestAttemptId: null,
      };

      set((current) => ({
        assignments: [assignment, ...current.assignments],
      }));
      return true;
    },
    startAssessment: (assignmentId) =>
      set((state) => ({
        assignments: state.assignments.map((assignment) =>
          assignment.id === assignmentId && assignment.status === "assigned"
            ? { ...assignment, status: "in_progress" }
            : assignment,
        ),
      })),
    submitAssessment: (assignmentId, answers) => {
      const state = get();
      const assignment = state.assignments.find(
        (item) => item.id === assignmentId,
      );
      const assessment = state.assessments.find(
        (item) => item.id === assignment?.assessmentId,
      );

      if (!assignment || !assessment) return null;

      const correct = assessment.questions.filter(
        (question) => answers[question.id] === question.correctOptionId,
      ).length;
      const score = Math.round((correct / assessment.questions.length) * 100);
      const attempt: AssessmentAttempt = {
        id: `attempt-${Date.now().toString(36)}`,
        assignmentId,
        answers,
        score,
        passed: score >= assessment.passingScore,
        completedAt: new Date().toISOString(),
      };

      set((current) => ({
        attempts: [attempt, ...current.attempts],
        assignments: current.assignments.map((item) =>
          item.id === assignmentId
            ? {
                ...item,
                status: "completed",
                latestAttemptId: attempt.id,
              }
            : item,
        ),
      }));
      return attempt;
    },
  }),
);
