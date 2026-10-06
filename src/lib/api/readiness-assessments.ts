import { api } from "@/lib/api/client";
import type {
  ApiSuccessResponse,
  AssessmentAssignment,
  AssessmentAttempt,
  ReadinessAssessment,
} from "@/types";

export type ReadinessSnapshot = {
  assessments: ReadinessAssessment[];
  assignments: AssessmentAssignment[];
  attempts: AssessmentAttempt[];
  completedAssessmentAnswers?: Record<string, ReadinessAssessment>;
};

export type CreateReadinessAssessmentInput = Pick<
  ReadinessAssessment,
  | "title"
  | "description"
  | "area"
  | "kind"
  | "durationMinutes"
  | "passingScore"
  | "questions"
>;

export async function fetchSchoolReadiness() {
  const { data } = await api.get<ApiSuccessResponse<ReadinessSnapshot>>(
    "/readiness-assessments/school",
  );
  return data.data;
}

export async function fetchLearnerReadiness() {
  const { data } = await api.get<ApiSuccessResponse<ReadinessSnapshot>>(
    "/readiness-assessments/learner/me",
  );
  return data.data;
}

export async function createReadinessAssessment(
  input: CreateReadinessAssessmentInput,
) {
  const { data } = await api.post<ApiSuccessResponse<ReadinessAssessment>>(
    "/readiness-assessments/school",
    input,
  );
  return data.data;
}

export async function assignReadinessAssessment(
  assessmentId: string,
  learnerId: string,
) {
  const { data } = await api.post<ApiSuccessResponse<AssessmentAssignment>>(
    `/readiness-assessments/school/${assessmentId}/assign`,
    { learnerId },
  );
  return data.data;
}

export async function startReadinessAssessment(assignmentId: string) {
  const { data } = await api.post<ApiSuccessResponse<AssessmentAssignment>>(
    `/readiness-assessments/learner/me/${assignmentId}/start`,
  );
  return data.data;
}

export async function submitReadinessAssessment(
  assignmentId: string,
  answers: Record<string, string>,
) {
  const { data } = await api.post<
    ApiSuccessResponse<{
      assignment: AssessmentAssignment;
      attempt: AssessmentAttempt;
      assessment: ReadinessAssessment;
    }>
  >(`/readiness-assessments/learner/me/${assignmentId}/submit`, { answers });
  return data.data;
}
