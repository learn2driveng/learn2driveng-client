import { create } from "zustand";

import { fetchInstructorAssignedSessions } from "@/lib/api/training-sessions";
import { fetchMyProfile } from "@/lib/api/users";
import { authUserToInstructorProfile } from "@/lib/instructor/map-api";
import {
  assignedSessionsToScheduleDays,
  countOutstandingReports,
  findLessonContext,
  findLessonContextBySessionId,
  readSchoolNameFromSessions,
  selectTodayLessons,
  sessionsAndParticipantsFromAssigned,
} from "@/lib/instructor/map-sessions";
import { useTrainingSessionStore } from "@/store/training-session.store";
import type {
  AuthUser,
  InstructorLessonSummary,
  InstructorProfileSummary,
  InstructorScheduleDay,
} from "@/types";
import type { InstructorAssignedSession } from "@/types/training-session";

interface InstructorOperationsState {
  profile: InstructorProfileSummary;
  assignedSessions: InstructorAssignedSession[];
  scheduleDays: InstructorScheduleDay[];
  todayLessons: InstructorLessonSummary[];
  hydrated: boolean;
  isRefreshing: boolean;
  hydrateFromApi: (input: {
    user: AuthUser;
    assignedSessions: InstructorAssignedSession[];
  }) => void;
  resetInstructorOperations: () => void;
  refreshAssignedSessions: () => Promise<void>;
  getLessonContext: (lessonId: string | undefined) =>
    | {
        lesson: InstructorLessonSummary;
        day: InstructorScheduleDay;
      }
    | undefined;
  getLessonContextBySessionId: (sessionId: string | undefined) =>
    | {
        lesson: InstructorLessonSummary;
        day: InstructorScheduleDay;
      }
    | undefined;
  setAvailableToday: (availableToday: boolean) => void;
}

const emptyProfile: InstructorProfileSummary = {
  schoolId: "",
  instructorId: "",
  firstName: "",
  lastName: "",
  name: "",
  initials: "",
  email: "",
  phone: "",
  schoolName: "",
  verified: false,
  availableToday: true,
  outstandingReports: 0,
};

function deriveState(input: {
  user: AuthUser;
  assignedSessions: InstructorAssignedSession[];
}) {
  const scheduleDays = assignedSessionsToScheduleDays(input.assignedSessions);
  const todayLessons = selectTodayLessons(scheduleDays);
  const schoolName = readSchoolNameFromSessions(input.assignedSessions);
  const profile = {
    ...authUserToInstructorProfile(input.user, schoolName),
    outstandingReports: countOutstandingReports(input.assignedSessions),
  };
  const { sessions, participantsBySessionId, activeSessionId } =
    sessionsAndParticipantsFromAssigned(input.assignedSessions);

  useTrainingSessionStore.getState().hydrateFromApi({
    sessions,
    participantsBySessionId,
    activeSessionId,
  });

  return {
    profile,
    assignedSessions: input.assignedSessions,
    scheduleDays,
    todayLessons,
    hydrated: true,
  };
}

export const useInstructorOperationsStore = create<InstructorOperationsState>(
  (set, get) => ({
    profile: emptyProfile,
    assignedSessions: [],
    scheduleDays: [],
    todayLessons: [],
    hydrated: false,
    isRefreshing: false,
    hydrateFromApi: (input) => set(deriveState(input)),
    resetInstructorOperations: () => {
      useTrainingSessionStore.getState().resetTrainingSessions();
      set({
        profile: emptyProfile,
        assignedSessions: [],
        scheduleDays: [],
        todayLessons: [],
        hydrated: false,
        isRefreshing: false,
      });
    },
    refreshAssignedSessions: async () => {
      set({ isRefreshing: true });
      try {
        const [user, assignedSessions] = await Promise.all([
          fetchMyProfile(),
          fetchInstructorAssignedSessions(),
        ]);
        get().hydrateFromApi({ user, assignedSessions });
      } finally {
        set({ isRefreshing: false });
      }
    },
    getLessonContext: (lessonId) =>
      findLessonContext(get().scheduleDays, lessonId),
    getLessonContextBySessionId: (sessionId) =>
      findLessonContextBySessionId(get().scheduleDays, sessionId),
    setAvailableToday: (availableToday) =>
      set((state) => ({
        profile: {
          ...state.profile,
          availableToday,
        },
      })),
  }),
);
