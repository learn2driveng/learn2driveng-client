import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  DashboardEmptyState,
  DashboardPageHeader,
  DashboardScreen,
} from "@/components/dashboard";
import {
  BookingOptionCard,
  BookingStepIndicator,
} from "@/features/session-booking";
import { useAppTheme } from "@/hooks/use-app-theme";
import { bookingAvailability } from "@/sample_data/session-availability";

const steps = ["Schedule", "Instructor", "Review"] as const;
const initialDate =
  bookingAvailability.find((date) => date.times.length > 0) ??
  bookingAvailability[0];

export default function BookSessionScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { packageName, schoolName } = useLocalSearchParams<{
    packageName?: string;
    schoolName?: string;
  }>();
  const [step, setStep] = useState(0);
  const selectedPackage = packageName ?? "Selected package";
  const [selectedDateId, setSelectedDateId] = useState<string | null>(
    initialDate?.id ?? null,
  );
  const selectedDate = bookingAvailability.find(
    (date) => date.id === selectedDateId,
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(
    initialDate?.times[0] ?? null,
  );
  const [selectedLocation, setSelectedLocation] = useState(
    "Lekki Training Centre",
  );
  const [selectedInstructor, setSelectedInstructor] = useState(
    "Best available instructor",
  );

  const canGoBack = step > 0;
  const isReview = step === steps.length - 1;
  const hasDates = bookingAvailability.length > 0;
  const hasTimes = Boolean(selectedDate?.times.length);
  const canContinue =
    step !== 0 ||
    Boolean(selectedDate && selectedTime && selectedLocation && hasTimes);

  const selectDate = (dateId: string) => {
    const date = bookingAvailability.find((item) => item.id === dateId);
    setSelectedDateId(dateId);
    setSelectedTime(date?.times[0] ?? null);
  };

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

            {!hasDates ? (
              <View className="mt-7">
                <DashboardEmptyState
                  icon="calendar-remove-outline"
                  title="No dates available"
                  description="This school has no open lesson dates for this package right now."
                  actionLabel="Back to sessions"
                  onActionPress={() => router.replace("/student/sessions")}
                />
              </View>
            ) : (
              <>
                <Text
                  className="mb-3 mt-7 font-figtree-bold text-[12px] tracking-[1.2px]"
                  style={{ color: colors.textSubtle }}
                >
                  DATE
                </Text>
                <View className="flex-row gap-3">
                  {bookingAvailability.map((date) => {
                    const selected = selectedDateId === date.id;
                    const availabilityLabel = date.times.length
                      ? `${date.times.length} times available`
                      : "No times available";

                    return (
                      <Pressable
                        key={date.id}
                        accessibilityRole="radio"
                        accessibilityLabel={`${date.label}. ${availabilityLabel}`}
                        accessibilityState={{ selected }}
                        onPress={() => selectDate(date.id)}
                        className="h-14 flex-1 items-center justify-center rounded-2xl border-2 active:opacity-70"
                        style={{
                          borderColor: selected
                            ? colors.primary
                            : colors.border,
                          backgroundColor: colors.surface,
                        }}
                      >
                        <Text
                          className="font-figtree-semibold text-[13px]"
                          style={{
                            color: date.times.length
                              ? colors.text
                              : colors.textSubtle,
                          }}
                        >
                          {date.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text
                  className="mb-3 mt-7 font-figtree-bold text-[12px] tracking-[1.2px]"
                  style={{ color: colors.textSubtle }}
                >
                  TIME
                </Text>
                {hasTimes ? (
                  <View className="flex-row flex-wrap gap-3">
                    {selectedDate?.times.map((time) => (
                      <Pressable
                        key={time}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: selectedTime === time }}
                        onPress={() => setSelectedTime(time)}
                        className="h-12 w-[47%] items-center justify-center rounded-2xl border-2 active:opacity-70"
                        style={{
                          borderColor:
                            selectedTime === time
                              ? colors.primary
                              : colors.border,
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
                ) : (
                  <View
                    accessibilityLiveRegion="polite"
                    className="flex-row items-start gap-3 rounded-2xl border p-4"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="clock-alert-outline"
                      size={22}
                      color={colors.textSubtle}
                    />
                    <View className="flex-1">
                      <Text
                        className="font-figtree-bold text-[14px]"
                        style={{ color: colors.text }}
                      >
                        No times available
                      </Text>
                      <Text
                        className="mt-1 font-figtree text-[13px] leading-5"
                        style={{ color: colors.textMuted }}
                      >
                        Choose another date to see its available lesson times.
                      </Text>
                    </View>
                  </View>
                )}

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
              </>
            )}
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
                ["Date", selectedDate?.label ?? "Not selected"],
                ["Time", selectedTime ?? "Not selected"],
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
          accessibilityState={{ disabled: !canContinue }}
          disabled={!canContinue}
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
                date: selectedDate?.label ?? "",
                time: selectedTime ?? "",
                instructor: selectedInstructor,
              },
            });
          }}
          className="h-14 flex-[2] flex-row items-center justify-center gap-2 rounded-2xl active:opacity-80"
          style={{
            backgroundColor: canContinue
              ? colors.primary
              : colors.surfaceStrong,
          }}
        >
          <Text
            className="font-figtree-bold text-[15px]"
            style={{
              color: canContinue ? colors.onPrimary : colors.textSubtle,
            }}
          >
            {isReview ? "Confirm booking" : "Continue"}
          </Text>
          <MaterialCommunityIcons
            name={isReview ? "check" : "arrow-right"}
            size={20}
            color={canContinue ? colors.onPrimary : colors.textSubtle}
          />
        </Pressable>
      </View>
    </DashboardScreen>
  );
}
