import Constants from "expo-constants";

export function getGoogleMapsApiKey() {
  const fromExtra = (
    Constants.expoConfig?.extra as { googleMapsApiKey?: string } | undefined
  )?.googleMapsApiKey;

  return (
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY ??
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ??
    fromExtra ??
    ""
  ).trim();
}

let loadPromise: Promise<typeof google.maps> | null = null;

export function loadGoogleMaps(apiKey: string) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser."));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.maps) {
          resolve(window.google.maps);
          return;
        }
        reject(new Error("Google Maps failed to initialise."));
      };
      script.onerror = () => reject(new Error("Google Maps script failed to load."));
      document.head.appendChild(script);
    });
  }

  return loadPromise;
}
