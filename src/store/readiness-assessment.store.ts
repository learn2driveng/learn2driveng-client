import { create } from "zustand";

import {
  assignReadinessAssessment,
  createReadinessAssessment,
  fetchLearnerReadiness,
  fetchSchoolReadiness,
  startReadinessAssessment,
  submitReadinessAssessment,
  type CreateReadinessAssessmentInput,
} from "@/lib/api/readiness-assessments";
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
  completedAssessmentAnswers: Record<string, ReadinessAssessment>;
  loading: boolean;
  error: string | null;
  hydrateLearners: (learners: SchoolLearner[]) => void;
  resetReadinessData: () => void;
  refreshSchool: () => Promise<void>;
  refreshLearner: () => Promise<void>;
  createAssessment: (input: CreateReadinessAssessmentInput) => Promise<ReadinessAssessment>;
  assignAssessment: (assessmentId: string, learnerId: string) => Promise<AssessmentAssignment>;
  startAssessment: (assignmentId: string) => Promise<AssessmentAssignment>;
  submitAssessment: (
    assignmentId: string,
    answers: Record<string, string>,
  ) => Promise<AssessmentAttempt>;
};

let accountGeneration = 0;

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : typeof error === "object" && error !== null && "message" in error
      ? String(error.message)
      : "Could not load assessments. Please try again.";
}

export const useReadinessAssessmentStore = create<ReadinessAssessmentState>(
  (set) => ({
    learners: [],
    assessments: [],
    assignments: [],
    attempts: [],
    completedAssessmentAnswers: {},
    loading: false,
    error: null,
    hydrateLearners: (learners) => set({ learners }),
    resetReadinessData: () => {
      accountGeneration += 1;
      set({
        learners: [],
        assessments: [],
        assignments: [],
        attempts: [],
        completedAssessmentAnswers: {},
        loading: false,
        error: null,
      });
    },
    refreshSchool: async () => {
      const generation = accountGeneration;
      set({ loading: true, error: null });
      try {
        const snapshot = await fetchSchoolReadiness();
        if (generation === accountGeneration) set({ ...snapshot, loading: false });
      } catch (error) {
        if (generation === accountGeneration) {
          set({ loading: false, error: errorMessage(error) });
        }
      }
    },
    refreshLearner: async () => {
      const generation = accountGeneration;
      set({ loading: true, error: null });
      try {
        const snapshot = await fetchLearnerReadiness();
        if (generation === accountGeneration) set({ ...snapshot, loading: false });
      } catch (error) {
        if (generation === accountGeneration) {
          set({ loading: false, error: errorMessage(error) });
        }
      }
    },
    createAssessment: async (input) => {
      const generation = accountGeneration;
      const assessment = await createReadinessAssessment(input);
      if (generation === accountGeneration) {
        set((state) => ({ assessments: [assessment, ...state.assessments] }));
      }
      return assessment;
    },
    assignAssessment: async (assessmentId, learnerId) => {
      const generation = accountGeneration;
      const assignment = await assignReadinessAssessment(assessmentId, learnerId);
      if (generation === accountGeneration) {
        set((state) => ({ assignments: [assignment, ...state.assignments] }));
      }
      return assignment;
    },
    startAssessment: async (assignmentId) => {
      const generation = accountGeneration;
      const assignment = await startReadinessAssessment(assignmentId);
      if (generation === accountGeneration) {
        set((state) => ({
          assignments: state.assignments.map((item) =>
            item.id === assignmentId ? assignment : item,
          ),
        }));
      }
      return assignment;
    },
    submitAssessment: async (assignmentId, answers) => {
      const generation = accountGeneration;
      const result = await submitReadinessAssessment(assignmentId, answers);
      if (generation === accountGeneration) {
        set((state) => ({
          completedAssessmentAnswers: {
            ...state.completedAssessmentAnswers,
            [assignmentId]: result.assessment,
          },
          assignments: state.assignments.map((item) =>
            item.id === assignmentId ? result.assignment : item,
          ),
          attempts: [result.attempt, ...state.attempts],
        }));
      }
      return result.attempt;
    },
  }),
);
