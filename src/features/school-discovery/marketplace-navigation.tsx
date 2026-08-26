import type { Href } from "expo-router";
import { createContext, type PropsWithChildren, useContext } from "react";

export type MarketplaceScope = "public" | "learner";

type MarketplaceNavigation = {
  scope: MarketplaceScope;
  requiresSignIn: boolean;
  accountHref: Href;
  locationHref: Href;
  schoolHref: (schoolId: string, distanceKm: number) => Href;
  packagesHref: (schoolId: string, distanceKm: number) => Href;
  collectionHref: (
    schoolId: string,
    schoolName: string,
    collection: "instructors" | "vehicles",
  ) => Href;
  saveSchoolHref: (schoolId: string, distanceKm: number) => Href | null;
  purchaseHref: (schoolId: string, packageId: string) => Href;
};

function createMarketplaceNavigation(
  scope: MarketplaceScope,
): MarketplaceNavigation {
  const requiresSignIn = scope === "public";
  const routePrefix = requiresSignIn ? "/explore" : "/student/explore";

  const learnerSchoolPath = (schoolId: string, distanceKm: number) =>
    `/student/explore/${schoolId}?distanceKm=${distanceKm}`;

  return {
    scope,
    requiresSignIn,
    accountHref: requiresSignIn ? "/login" : "/student/profile",
    locationHref: requiresSignIn ? "/location" : "/student/profile/location",
    schoolHref: (schoolId, distanceKm) =>
      ({
        pathname: `${routePrefix}/[schoolId]`,
        params: { schoolId, distanceKm: String(distanceKm) },
      }) as Href,
    packagesHref: (schoolId, distanceKm) =>
      ({
        pathname: `${routePrefix}/[schoolId]/packages`,
        params: { schoolId, distanceKm: String(distanceKm) },
      }) as Href,
    collectionHref: (schoolId, schoolName, collection) =>
      ({
        pathname: `${routePrefix}/[schoolId]/${collection}`,
        params: { schoolId, schoolName },
      }) as Href,
    saveSchoolHref: requiresSignIn
      ? (schoolId, distanceKm) => ({
          pathname: "/login",
          params: { returnTo: learnerSchoolPath(schoolId, distanceKm) },
        })
      : () => null,
    purchaseHref: requiresSignIn
      ? (schoolId, packageId) => ({
          pathname: "/login",
          params: {
            returnTo: `/checkout/${schoolId}/payment?packageId=${packageId}`,
          },
        })
      : (schoolId, packageId) => ({
          pathname: "/checkout/[schoolId]/payment",
          params: { schoolId, packageId },
        }),
  };
}

const navigationByScope = {
  public: createMarketplaceNavigation("public"),
  learner: createMarketplaceNavigation("learner"),
} as const;

const MarketplaceNavigationContext =
  createContext<MarketplaceNavigation | null>(null);

export function MarketplaceNavigationProvider({
  children,
  scope,
}: PropsWithChildren<{ scope: MarketplaceScope }>) {
  return (
    <MarketplaceNavigationContext.Provider value={navigationByScope[scope]}>
      {children}
    </MarketplaceNavigationContext.Provider>
  );
}

export function useMarketplaceNavigation() {
  const navigation = useContext(MarketplaceNavigationContext);

  if (!navigation) {
    throw new Error(
      "School discovery routes must be rendered inside MarketplaceNavigationProvider.",
    );
  }

  return navigation;
}
