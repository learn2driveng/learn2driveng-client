import { fetchLearnerJoinedSessions } from "@/lib/api/training-sessions";
import { useLearnerSessionsStore } from "@/store/learner-sessions.store";

export async function hydrateLearnerSessions() {
  const joinedSessions = await fetchLearnerJoinedSessions();
  useLearnerSessionsStore.getState().hydrateFromApi(joinedSessions);
}

export async function refreshLearnerSessions() {
  await useLearnerSessionsStore.getState().refreshJoinedSessions();
}
