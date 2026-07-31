import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ChangeEvent } from "react";
import { Text, View } from "react-native";

import { fontFamily } from "@/constants/fonts";
import { borderRadius } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";

import type { AuthDateOfBirthFieldProps } from "./auth-date-of-birth-field.types";

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AuthDateOfBirthField({
  value,
  onChange,
  label = "DATE OF BIRTH",
}: AuthDateOfBirthFieldProps) {
  const { colors, scheme } = useAppTheme();

  return (
    <View>
      <Text
        className="mb-3 ml-1 font-figtree-bold text-[12px] tracking-[1.7px]"
        style={{ color: colors.text }}
      >
        {label}
      </Text>
      <View
        className="h-16 flex-row items-center border px-5"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.surface,
          borderRadius: borderRadius.button,
        }}
      >
        <MaterialCommunityIcons
          name="calendar"
          size={22}
          color={colors.textSubtle}
        />
        <input
          aria-label={label}
          type="date"
          min="1900-01-01"
          max={formatDate(new Date())}
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChange(event.target.value)
          }
          style={{
            flex: 1,
            height: "100%",
            marginLeft: 16,
            border: 0,
            outline: "none",
            background: "transparent",
            color: colors.text,
            colorScheme: scheme,
            fontFamily: fontFamily.regular,
            fontSize: 17,
          }}
        />
      </View>
    </View>
  );
}
