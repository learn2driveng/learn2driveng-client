import { create } from "zustand";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type LocationState = {
  coordinates: Coordinates | null;
  setCoordinates: (coordinates: Coordinates | null) => void;
};

export const useLocationStore = create<LocationState>((set) => ({
  coordinates: null,
  setCoordinates: (coordinates) => set({ coordinates }),
}));
