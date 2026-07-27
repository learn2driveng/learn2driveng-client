import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { useSurfaceStyles } from "@/components/common/surface";
import { fontFamily } from "@/constants/fonts";
import { packageDurationLabel } from "@/lib/school/mappers";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSchoolOperationsStore } from "@/store/school-operations.store";

function formatPrice(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

export default function SchoolPackagesScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const packages = useSchoolOperationsStore((state) => state.packages);

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Packages" />
      <Text
        className="mt-3 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Create and publish the lesson offers learners can purchase.
      </Text>
      <View className="mt-7">
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/school/operations/packages/new")}
          className="h-12 flex-row items-center justify-center gap-2 rounded-2xl active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <MaterialCommunityIcons
            name="plus"
            size={20}
            color={colors.onPrimary}
          />
          <Text
            className="text-[14px]"
            style={{
              color: colors.onPrimary,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            Create package
          </Text>
        </Pressable>
      </View>
      <View className="mt-8">
        <SectionHeader title={`${packages.length} packages`} />
        <View className="mt-4 gap-3">
          {packages.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: "/school/operations/packages/[packageId]",
                  params: { packageId: item.id },
                })
              }
              className="flex-row items-center gap-3 rounded-3xl border p-4 active:opacity-80"
              style={surfaces.card}
            >
              <View
                className="h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: colors.surfaceStrong }}
              >
                <MaterialCommunityIcons
                  name="package-variant"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-[14px]"
                  style={{
                    color: colors.text,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {item.name}
                </Text>
                <Text
                  className="mt-1 text-[11px]"
                  style={{
                    color: colors.textMuted,
                    fontFamily: fontFamily.figtreeMedium,
                  }}
                >
                  {formatPrice(item.price)} · {item.numberOfLessons} lessons ·{" "}
                  {packageDurationLabel(item)}
                </Text>
              </View>
              <View className="items-end">
                <Text
                  className="text-[10px] capitalize"
                  style={{
                    color: item.isActive ? colors.success : colors.textMuted,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {item.isActive ? "active" : "inactive"}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={colors.textSubtle}
                />
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </DashboardScreen>
  );
}
