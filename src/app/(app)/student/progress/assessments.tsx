import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { DashboardScreen } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { learnerAssessments } from "@/sample_data";

export default function ProgressAssessmentsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <DashboardScreen>
      <View className="flex-row items-center gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full border active:opacity-70"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={20}
            color={colors.text}
          />
        </Pressable>
        <View className="flex-1">
          <Text
            className="text-[10px] uppercase tracking-[2px]"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            Progress
          </Text>
          <Text
            accessibilityRole="header"
            className="mt-1 text-[24px] leading-7 tracking-[-0.6px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            Assessments
          </Text>
        </View>
      </View>

      <Text
        className="mt-5 text-[13px] leading-5"
        style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeMedium }}
      >
        Scores here are learning signals. They help the instructor decide what
        to practise next.
      </Text>

      <View className="mt-6 gap-4">
        {learnerAssessments.map((assessment) => {
          const passed = assessment.status === "passed";

          return (
            <View
              key={assessment.id}
              className="rounded-3xl border p-4"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <View className="flex-row items-start gap-3">
                <View
                  className="h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: passed
                      ? colors.successSoft
                      : colors.surfaceStrong,
                  }}
                >
                  <MaterialCommunityIcons
                    name={passed ? "check-decagram" : "target"}
                    size={24}
                    color={passed ? colors.success : colors.primary}
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text
                        className="text-[15px]"
                        style={{
                          color: colors.text,
                          fontFamily: fontFamily.figtreeBold,
                        }}
                      >
                        {assessment.title}
                      </Text>
                      <Text
                        className="mt-1 text-[11px]"
                        style={{
                          color: colors.textMuted,
                          fontFamily: fontFamily.figtreeMedium,
                        }}
                      >
                        {assessment.category} · {assessment.completedAt}
                      </Text>
                    </View>
                    <View
                      className="rounded-full px-3 py-1.5"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Text
                        className="text-[11px]"
                        style={{
                          color: colors.onPrimary,
                          fontFamily: fontFamily.figtreeBold,
                        }}
                      >
                        {assessment.score}%
                      </Text>
                    </View>
                  </View>
                  <Text
                    className="mt-3 text-[12px] leading-5"
                    style={{
                      color: colors.textMuted,
                      fontFamily: fontFamily.figtree,
                    }}
                  >
                    {assessment.summary}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </DashboardScreen>
  );
}
