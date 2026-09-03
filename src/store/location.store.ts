import { create } from "zustand";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type LocationState = {
  coordinates: Coordinates | null;
  placeName: string | null;
  instructorPublishingStatus:
    | "idle"
    | "requesting"
    | "foreground"
    | "background"
    | "error";
  instructorPublishingError: string | null;
  setCoordinates: (coordinates: Coordinates | null) => void;
  setPlaceName: (placeName: string | null) => void;
  setInstructorPublishingStatus: (
    status: LocationState["instructorPublishingStatus"],
    error?: string | null,
  ) => void;
};

export const useLocationStore = create<LocationState>((set) => ({
  coordinates: null,
  placeName: null,
  instructorPublishingStatus: "idle",
  instructorPublishingError: null,
  setCoordinates: (coordinates) => set({ coordinates, placeName: null }),
  setPlaceName: (placeName) => set({ placeName }),
  setInstructorPublishingStatus: (instructorPublishingStatus, error = null) =>
    set({
      instructorPublishingStatus,
      instructorPublishingError: error,
    }),
}));
