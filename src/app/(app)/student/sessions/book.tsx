import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import {
  BookingOptionCard,
  BookingStepIndicator,
} from "@/features/session-booking";
import { useAppTheme } from "@/hooks/use-app-theme";

const steps = ["Schedule", "Instructor", "Review"] as const;
const dateOptions = ["Mon 24", "Tue 25", "Wed 26"] as const;
const timeOptions = ["9:00 AM", "11:30 AM", "2:00 PM", "4:30 PM"] as const;

export default function BookSessionScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { packageName, schoolName } = useLocalSearchParams<{
    packageName?: string;
    schoolName?: string;
  }>();
  const [step, setStep] = useState(0);
  const selectedPackage = packageName ?? "Selected package";
  const [selectedDate, setSelectedDate] = useState("Tue 25");
  const [selectedTime, setSelectedTime] = useState("11:30 AM");
  const [selectedLocation, setSelectedLocation] = useState(
    "Lekki Training Centre",
  );
  const [selectedInstructor, setSelectedInstructor] = useState(
    "Best available instructor",
  );

  const canGoBack = step > 0;
  const isReview = step === steps.length - 1;

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Book a session" />
      <View className="mt-8">
        <BookingStepIndicator steps={steps} currentStep={step} />
      </View>

      <View
        className="mt-7 flex-row items-center gap-3 rounded-2xl border p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <View
          className="h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: colors.surfaceStrong }}
        >
          <MaterialCommunityIcons
            name="package-variant-closed"
            size={21}
            color={colors.primary}
          />
        </View>
        <View className="flex-1">
          <Text
            className="font-figtree text-[11px] tracking-[0.8px]"
            style={{ color: colors.textSubtle }}
          >
            BOOKING FROM
          </Text>
          <Text
            className="mt-1 font-figtree-semibold text-[14px]"
            style={{ color: colors.text }}
          >
            {selectedPackage}
          </Text>
        </View>
      </View>

      <View className="mt-8">
        {step === 0 ? (
          <View>
            <Text
              accessibilityRole="header"
              className="font-figtree-bold text-[24px]"
              style={{ color: colors.text }}
            >
              Choose a schedule
            </Text>
            <Text
              className="mt-2 font-figtree text-[14px]"
              style={{ color: colors.textMuted }}
            >
              Available times are based on your package and school.
            </Text>

            <Text
              className="mb-3 mt-7 font-figtree-bold text-[12px] tracking-[1.2px]"
              style={{ color: colors.textSubtle }}
            >
              DATE
            </Text>
            <View className="flex-row gap-3">
              {dateOptions.map((date) => (
                <Pressable
                  key={date}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selectedDate === date }}
                  onPress={() => setSelectedDate(date)}
                  className="h-14 flex-1 items-center justify-center rounded-2xl border-2 active:opacity-70"
                  style={{
                    borderColor:
                      selectedDate === date ? colors.primary : colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Text
                    className="font-figtree-semibold text-[13px]"
                    style={{ color: colors.text }}
                  >
                    {date}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text
              className="mb-3 mt-7 font-figtree-bold text-[12px] tracking-[1.2px]"
              style={{ color: colors.textSubtle }}
            >
              TIME
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {timeOptions.map((time) => (
                <Pressable
                  key={time}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selectedTime === time }}
                  onPress={() => setSelectedTime(time)}
                  className="h-12 w-[47%] items-center justify-center rounded-2xl border-2 active:opacity-70"
                  style={{
                    borderColor:
                      selectedTime === time ? colors.primary : colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Text
                    className="font-figtree-semibold text-[13px]"
                    style={{ color: colors.text }}
                  >
                    {time}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text
              className="mb-3 mt-7 font-figtree-bold text-[12px] tracking-[1.2px]"
              style={{ color: colors.textSubtle }}
            >
              LOCATION
            </Text>
            <BookingOptionCard
              icon="map-marker-outline"
              title="Lekki Training Centre"
              description="12 Admiralty Way, Lekki Phase 1"
              selected={selectedLocation === "Lekki Training Centre"}
              onPress={() => setSelectedLocation("Lekki Training Centre")}
            />
          </View>
        ) : null}

        {step === 1 ? (
          <View>
            <Text
              accessibilityRole="header"
              className="font-figtree-bold text-[24px]"
              style={{ color: colors.text }}
            >
              Choose an instructor
            </Text>
            <Text
              className="mt-2 font-figtree text-[14px]"
              style={{ color: colors.textMuted }}
            >
              Select an instructor or let the school assign the best available
              match.
            </Text>
            <View className="mt-6 gap-3">
              <BookingOptionCard
                icon="account-star-outline"
                title="Best available instructor"
                description="The school will assign a qualified instructor"
                meta="Recommended"
                selected={selectedInstructor === "Best available instructor"}
                onPress={() =>
                  setSelectedInstructor("Best available instructor")
                }
              />
              <BookingOptionCard
                icon="account-outline"
                title="John Adeyemi"
                description="4.9 rating · 8 years experience"
                meta="Available at 11:30 AM"
                selected={selectedInstructor === "John Adeyemi"}
                onPress={() => setSelectedInstructor("John Adeyemi")}
              />
              <BookingOptionCard
                icon="account-outline"
                title="Grace Okafor"
                description="4.8 rating · 6 years experience"
                meta="Available at 11:30 AM"
                selected={selectedInstructor === "Grace Okafor"}
                onPress={() => setSelectedInstructor("Grace Okafor")}
              />
            </View>
          </View>
        ) : null}

        {step === 2 ? (
          <View>
            <Text
              accessibilityRole="header"
              className="font-figtree-bold text-[24px]"
              style={{ color: colors.text }}
            >
              Review your booking
            </Text>
            <Text
              className="mt-2 font-figtree text-[14px]"
              style={{ color: colors.textMuted }}
            >
              One session credit will be reserved after confirmation.
            </Text>
            <View
              className="mt-6 overflow-hidden rounded-3xl border p-5"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
              {[
                ["School", schoolName ?? "Elite Safety Driving Academy"],
                ["Package", selectedPackage],
                ["Date", selectedDate],
                ["Time", selectedTime],
                ["Location", selectedLocation],
                ["Instructor", selectedInstructor],
                ["Credit balance", "10 → 9 sessions"],
              ].map(([label, value], index, values) => (
                <View key={label}>
                  <View className="flex-row items-start justify-between gap-5 py-3">
                    <Text
                      className="font-figtree text-[13px]"
                      style={{ color: colors.textMuted }}
                    >
                      {label}
                    </Text>
                    <Text
                      className="max-w-[62%] text-right font-figtree-semibold text-[13px]"
                      style={{ color: colors.text }}
                    >
                      {value}
                    </Text>
                  </View>
                  {index < values.length - 1 ? (
                    <View
                      className="h-px"
                      style={{ backgroundColor: colors.border }}
                    />
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>

      <View className="mt-10 flex-row gap-3">
        {canGoBack ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setStep((current) => current - 1)}
            className="h-14 flex-1 items-center justify-center rounded-2xl border active:opacity-70"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <Text
              className="font-figtree-bold text-[15px]"
              style={{ color: colors.text }}
            >
              Back
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (!isReview) {
              setStep((current) => current + 1);
              return;
            }

            router.replace({
              pathname: "/student/sessions/confirmation",
              params: {
                packageName: selectedPackage,
                schoolName: schoolName ?? "Elite Safety Driving Academy",
                date: selectedDate,
                time: selectedTime,
                instructor: selectedInstructor,
              },
            });
          }}
          className="h-14 flex-[2] flex-row items-center justify-center gap-2 rounded-2xl active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="font-figtree-bold text-[15px]"
            style={{ color: colors.onPrimary }}
          >
            {isReview ? "Confirm booking" : "Continue"}
          </Text>
          <MaterialCommunityIcons
            name={isReview ? "check" : "arrow-right"}
            size={20}
            color={colors.onPrimary}
          />
        </Pressable>
      </View>
    </DashboardScreen>
  );
}
