import { fetchLearnerBookings } from "@/lib/api/bookings";
import { useLearnerOperationsStore } from "@/store/learner-operations.store";

export async function hydrateLearnerOperations() {
  const bookings = await fetchLearnerBookings();
  useLearnerOperationsStore.getState().hydrateFromApi(bookings);
}

export async function refreshLearnerBookings() {
  await useLearnerOperationsStore.getState().refreshBookings();
}
