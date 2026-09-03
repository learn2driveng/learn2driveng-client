import * as Location from "expo-location";
import { Platform } from "react-native";

export type InstructorLocationPermissionResult = {
  foregroundGranted: boolean;
  backgroundGranted: boolean;
  servicesEnabled: boolean;
};

export async function requestInstructorLocationPermissions(): Promise<InstructorLocationPermissionResult> {
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    return {
      foregroundGranted: false,
      backgroundGranted: false,
      servicesEnabled: false,
    };
  }

  let foreground = await Location.getForegroundPermissionsAsync();
  if (!foreground.granted && foreground.canAskAgain) {
    foreground = await Location.requestForegroundPermissionsAsync();
  }
  if (!foreground.granted || Platform.OS === "web") {
    return {
      foregroundGranted: foreground.granted,
      backgroundGranted: false,
      servicesEnabled: true,
    };
  }

  const backgroundAvailable =
    await Location.isBackgroundLocationAvailableAsync();
  if (!backgroundAvailable) {
    return {
      foregroundGranted: true,
      backgroundGranted: false,
      servicesEnabled: true,
    };
  }

  let background = await Location.getBackgroundPermissionsAsync();
  if (!background.granted && background.canAskAgain) {
    background = await Location.requestBackgroundPermissionsAsync();
  }

  return {
    foregroundGranted: true,
    backgroundGranted: background.granted,
    servicesEnabled: true,
  };
}
