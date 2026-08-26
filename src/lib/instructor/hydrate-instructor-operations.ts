import { fetchMyProfile } from "@/lib/api/users";
import { fetchInstructorAssignedSessions } from "@/lib/api/training-sessions";
import { useInstructorOperationsStore } from "@/store/instructor-operations.store";

export async function hydrateInstructorOperations() {
  const [user, assignedSessions] = await Promise.all([
    fetchMyProfile(),
    fetchInstructorAssignedSessions(),
  ]);

  useInstructorOperationsStore.getState().hydrateFromApi({
    user,
    assignedSessions,
  });
}

export async function refreshInstructorOperations() {
  await useInstructorOperationsStore.getState().refreshAssignedSessions();
}
