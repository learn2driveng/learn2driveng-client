import { fetchMyProfile } from "@/lib/api/users";
import { fetchInstructorAssignedSessions } from "@/lib/api/training-sessions";
import { fetchInstructorAvailability } from "@/lib/api/instructor-availability";
import { useInstructorOperationsStore } from "@/store/instructor-operations.store";

export async function hydrateInstructorOperations() {
  const [user, assignedSessions, availability] = await Promise.all([
    fetchMyProfile(),
    fetchInstructorAssignedSessions(),
    fetchInstructorAvailability().catch(() => null),
  ]);

  useInstructorOperationsStore.getState().hydrateFromApi({
    user,
    assignedSessions,
  });
  if (availability) {
    useInstructorOperationsStore.getState().setAvailableToday(
      availability.acceptingAssignments,
    );
  }
}

export async function refreshInstructorOperations() {
  await useInstructorOperationsStore.getState().refreshAssignedSessions();
}
