import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, type ComponentProps } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { fontFamily } from "@/constants/fonts";
import { borderRadius } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type AuthFieldProps = Omit<
  TextInputProps,
  "placeholderTextColor" | "secureTextEntry" | "style"
> & {
  label: string;
  icon: IconName;
  isPassword?: boolean;
};

export function AuthField({
  label,
  icon,
  isPassword = false,
  ...inputProps
}: AuthFieldProps) {
  const { colors } = useAppTheme();
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <View>
      <Text
        className="mb-3 ml-1 font-figtree-bold text-[12px] tracking-[1.7px]"
        style={{ color: colors.text }}
      >
        {label}
      </Text>
      <View
        className="h-16 flex-row items-center rounded-full border px-5"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.surface,
          borderRadius: borderRadius.button,
          overflow: "hidden",
        }}
      >
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={colors.textSubtle}
        />
        <TextInput
          {...inputProps}
          accessibilityLabel={inputProps.accessibilityLabel ?? label}
          placeholderTextColor={colors.textFaint}
          secureTextEntry={isPassword && !passwordVisible}
          className="ml-4 flex-1 text-[17px]"
          style={{ color: colors.text, fontFamily: fontFamily.regular }}
        />
        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              passwordVisible ? "Hide password" : "Show password"
            }
            hitSlop={12}
            onPress={() => setPasswordVisible((visible) => !visible)}
          >
            <MaterialCommunityIcons
              name={passwordVisible ? "eye-off" : "eye"}
              size={23}
              color={colors.textSubtle}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
