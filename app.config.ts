import type { ConfigContext, ExpoConfig } from "expo/config";

import appJson from "./app.json";

type ReactNativeMapsPluginOptions = {
  androidGoogleMapsApiKey?: string;
  iosGoogleMapsApiKey?: string;
};

function configuredValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const baseConfig = { ...config, ...appJson.expo } as ExpoConfig;
  const androidGoogleMapsApiKey = configuredValue(
    process.env.GOOGLE_MAPS_ANDROID_API_KEY ??
      process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  );
  const iosGoogleMapsApiKey = configuredValue(
    process.env.GOOGLE_MAPS_IOS_API_KEY,
  );
  const mapOptions: ReactNativeMapsPluginOptions = {
    ...(androidGoogleMapsApiKey ? { androidGoogleMapsApiKey } : {}),
    ...(iosGoogleMapsApiKey ? { iosGoogleMapsApiKey } : {}),
  };
  const plugins = (baseConfig.plugins ?? []).filter((plugin) => {
    const name = Array.isArray(plugin) ? plugin[0] : plugin;
    return name !== "react-native-maps";
  });

  return {
    ...baseConfig,
    extra: {
      ...baseConfig.extra,
      maps: {
        androidGoogleMapsConfigured: Boolean(androidGoogleMapsApiKey),
        iosGoogleMapsConfigured: Boolean(iosGoogleMapsApiKey),
      },
    },
    plugins: [...plugins, ["react-native-maps", mapOptions]],
  };
};
