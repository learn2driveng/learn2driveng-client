import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";

type BookingStepIndicatorProps = {
  steps: readonly string[];
  currentStep: number;
};

export function BookingStepIndicator({
  steps,
  currentStep,
}: BookingStepIndicatorProps) {
  const { colors } = useAppTheme();

  return (
    <View className="flex-row items-start">
      {steps.map((step, index) => {
        const active = index <= currentStep;

        return (
          <View key={step} className="flex-1 items-center">
            <View className="w-full flex-row items-center">
              <View
                className="h-0.5 flex-1"
                style={{
                  backgroundColor:
                    index === 0
                      ? "transparent"
                      : active
                        ? colors.primary
                        : colors.border,
                }}
              />
              <View
                className="h-8 w-8 items-center justify-center rounded-full border-2"
                style={{
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primary : colors.background,
                }}
              >
                <Text
                  className="font-figtree-bold text-[12px]"
                  style={{ color: active ? colors.onPrimary : colors.textSubtle }}
                >
                  {index + 1}
                </Text>
              </View>
              <View
                className="h-0.5 flex-1"
                style={{
                  backgroundColor:
                    index === steps.length - 1
                      ? "transparent"
                      : index < currentStep
                        ? colors.primary
                        : colors.border,
                }}
              />
            </View>
            <Text
              className="mt-2 font-figtree-medium text-[10px]"
              style={{
                color: index === currentStep ? colors.text : colors.textSubtle,
              }}
            >
              {step}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
