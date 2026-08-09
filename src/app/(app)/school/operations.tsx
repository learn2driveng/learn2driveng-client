import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { HeroSurface, useSurfaceStyles } from "@/components/common/surface";
import { DashboardPageHeader, DashboardScreen, SectionHeader } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSchoolOperationsStore } from "@/store/school-operations.store";

type ToolCardProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  value: string;
  onPress: () => void;
  wide?: boolean;
};

function ToolCard({ icon, title, value, onPress, wide = false }: ToolCardProps) {
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      className={`${wide ? "w-full" : "flex-1"} active:opacity-80`}
      style={[
        surfaces.card,
        {
          minHeight: wide ? 116 : 156,
          borderWidth: 1,
          borderRadius: 24,
          padding: 16,
        },
      ]}
    >
      <View className="flex-row items-start justify-between">
        <View
          className="h-11 w-11 items-center justify-center"
          style={{ backgroundColor: colors.surfaceStrong, borderRadius: 15 }}
        >
          <MaterialCommunityIcons name={icon} size={22} color={colors.primary} />
        </View>
        <MaterialCommunityIcons name="arrow-top-right" size={19} color={colors.textSubtle} />
      </View>
      <View className={wide ? "mt-4 flex-row items-end justify-between gap-3" : "mt-5"}>
        <Text
          className="text-[16px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          {title}
        </Text>
        <Text
          className={`${wide ? "text-right" : "mt-1"} text-[12px]`}
          style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeMedium }}
        >
          {value}
        </Text>
      </View>
    </Pressable>
  );
}

export default function SchoolOperationsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const vehicles = useSchoolOperationsStore((state) => state.vehicles);
  const packages = useSchoolOperationsStore((state) => state.packages);
  const instructors = useSchoolOperationsStore((state) => state.instructors);
  const activeVehicles = vehicles.filter((item) => item.isActive).length;
  const activePackages = packages.filter((item) => item.isActive).length;
  const activeInstructors = instructors.filter((item) => item.status === "active").length;

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Fleet & packages" />

      <HeroSurface
        className="mt-6"
        style={{ borderRadius: 30, padding: 20, overflow: "hidden" }}
      >
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1">
            <Text
              className="text-[11px] uppercase tracking-[1.3px]"
              style={{ color: colors.contrastMuted, fontFamily: fontFamily.figtreeBold }}
            >
              School operations
            </Text>
            <Text
              className="mt-2 text-[22px] leading-7"
              style={{ color: colors.contrastText, fontFamily: fontFamily.figtreeBold }}
            >
              Ready for lessons
            </Text>
          </View>
          <View
            className="h-14 w-14 items-center justify-center"
            style={{ backgroundColor: colors.primary, borderRadius: 18 }}
          >
            <MaterialCommunityIcons name="steering" size={28} color={colors.onPrimary} />
          </View>
        </View>

        <View
          className="mt-6 flex-row"
          style={{ borderTopWidth: 1, borderTopColor: colors.contrastBorder }}
        >
          {[
            [String(activeVehicles), "Cars"],
            [String(activePackages), "Packages"],
            [String(activeInstructors), "Instructors"],
          ].map(([value, label], index) => (
            <View
              key={label}
              className="flex-1 pt-4"
              style={index ? { borderLeftWidth: 1, borderLeftColor: colors.contrastBorder, paddingLeft: 16 } : undefined}
            >
              <Text
                className="text-[20px]"
                style={{ color: colors.contrastText, fontFamily: fontFamily.figtreeBold }}
              >
                {value}
              </Text>
              <Text
                className="mt-1 text-[11px]"
                style={{ color: colors.contrastMuted, fontFamily: fontFamily.figtreeMedium }}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>
      </HeroSurface>

      <View className="mt-8">
        <SectionHeader title="Quick add" />
        <View className="mt-4 flex-row gap-3">
          <Pressable
            onPress={() => router.push("/school/operations/vehicles/new")}
            className="h-14 flex-1 flex-row items-center justify-center gap-2 active:opacity-80"
            style={{ backgroundColor: colors.primary, borderRadius: 18, paddingHorizontal: 16 }}
          >
            <MaterialCommunityIcons name="car" size={20} color={colors.onPrimary} />
            <Text className="text-[13px]" style={{ color: colors.onPrimary, fontFamily: fontFamily.figtreeBold }}>
              Add car
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/school/operations/packages/new")}
            className="h-14 flex-1 flex-row items-center justify-center gap-2 border active:opacity-80"
            style={{ backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, paddingHorizontal: 16 }}
          >
            <MaterialCommunityIcons name="package-variant-closed" size={20} color={colors.text} />
            <Text className="text-[13px]" style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}>
              Add package
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Manage" />
        <View className="mt-4 flex-row gap-3">
          <ToolCard
            icon="car-multiple"
            title="Fleet"
            value={`${activeVehicles} active`}
            onPress={() => router.push("/school/operations/vehicles")}
          />
          <ToolCard
            icon="package-variant-closed"
            title="Packages"
            value={`${activePackages} published`}
            onPress={() => router.push("/school/operations/packages")}
          />
        </View>
        <View className="mt-3">
          <ToolCard
            wide
            icon="calendar"
            title="Lesson schedule"
            value="View generated lessons"
            onPress={() => router.push("/school/operations/schedule")}
          />
        </View>
        <View className="mt-3">
          <ToolCard
            wide
            icon="calendar-edit"
            title="Timetables"
            value="Create, edit or pause"
            onPress={() => router.push("/school/operations/schedule/timetables")}
          />
        </View>
      </View>
    </DashboardScreen>
  );
}
