import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const base = config as ExpoConfig;
  return {
    ...base,
    extra: {
      ...base.extra,
      googleMapsApiKey:
        process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY ??
        process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ??
        process.env.GOOGLE_MAPS_API_KEY ??
        "",
    },
  };
};
