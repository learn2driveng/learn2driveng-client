import { create } from "zustand";

import { fetchLearnerBookings } from "@/lib/api/bookings";
import {
  activeLearnerPackages,
  expiredLearnerPackages,
  learnerPackagesFromBookings,
  type LearnerPackageCredit,
} from "@/lib/learner/map-api";
import type { BookingListItem } from "@/types";

interface LearnerOperationsState {
  bookings: BookingListItem[];
  packages: LearnerPackageCredit[];
  hydrated: boolean;
  isRefreshing: boolean;
  hydrateFromApi: (bookings: BookingListItem[]) => void;
  resetLearnerOperations: () => void;
  refreshBookings: () => Promise<void>;
}

function derivePackages(bookings: BookingListItem[]) {
  return learnerPackagesFromBookings(bookings);
}

export const useLearnerOperationsStore = create<LearnerOperationsState>(
  (set, get) => ({
    bookings: [],
    packages: [],
    hydrated: false,
    isRefreshing: false,
    hydrateFromApi: (bookings) =>
      set({
        bookings,
        packages: derivePackages(bookings),
        hydrated: true,
      }),
    resetLearnerOperations: () =>
      set({
        bookings: [],
        packages: [],
        hydrated: false,
        isRefreshing: false,
      }),
    refreshBookings: async () => {
      set({ isRefreshing: true });
      try {
        const bookings = await fetchLearnerBookings();
        get().hydrateFromApi(bookings);
      } finally {
        set({ isRefreshing: false });
      }
    },
  }),
);

type LearnerPackageGroups = {
  active: LearnerPackageCredit[];
  expired: LearnerPackageCredit[];
  totalRemainingSessions: number;
};

const packageGroupsCache = new WeakMap<
  LearnerPackageCredit[],
  LearnerPackageGroups
>();

function selectLearnerPackageGroups(packages: LearnerPackageCredit[]) {
  const cached = packageGroupsCache.get(packages);
  if (cached) return cached;

  const active = activeLearnerPackages(packages);
  const groups = {
    active,
    expired: expiredLearnerPackages(packages),
    totalRemainingSessions: active.reduce(
      (total, item) => total + item.remainingSessions,
      0,
    ),
  };
  packageGroupsCache.set(packages, groups);
  return groups;
}

export function selectActiveLearnerPackages(state: LearnerOperationsState) {
  return selectLearnerPackageGroups(state.packages).active;
}

export function selectExpiredLearnerPackages(state: LearnerOperationsState) {
  return selectLearnerPackageGroups(state.packages).expired;
}

export function selectTotalRemainingSessions(state: LearnerOperationsState) {
  return selectLearnerPackageGroups(state.packages).totalRemainingSessions;
}
