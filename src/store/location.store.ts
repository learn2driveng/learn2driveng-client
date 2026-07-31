import { create } from "zustand";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type LocationState = {
  coordinates: Coordinates | null;
  placeName: string | null;
  setCoordinates: (coordinates: Coordinates | null) => void;
  setPlaceName: (placeName: string | null) => void;
};

export const useLocationStore = create<LocationState>((set) => ({
  coordinates: null,
  placeName: null,
  setCoordinates: (coordinates) => set({ coordinates, placeName: null }),
  setPlaceName: (placeName) => set({ placeName }),
}));
