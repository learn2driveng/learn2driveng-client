import { Redirect, useLocalSearchParams } from "expo-router";

// Preserve old checkout deep links while keeping one payment entry screen.
export default function LegacyPaymentRoute() {
  const { schoolId, packageId } = useLocalSearchParams<{
    schoolId?: string;
    packageId?: string;
  }>();

  if (typeof schoolId !== "string" || typeof packageId !== "string") {
    return <Redirect href="/student/explore" />;
  }

  return (
    <Redirect
      href={{
        pathname: "/checkout/[schoolId]/review",
        params: { schoolId, packageId },
      }}
    />
  );
}
