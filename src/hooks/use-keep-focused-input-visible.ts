import { useCallback, useEffect, useRef, type RefObject } from "react";
import {
  Keyboard,
  ScrollView,
  type NativeSyntheticEvent,
  type TargetedEvent,
} from "react-native";

type FocusTarget = NativeSyntheticEvent<TargetedEvent>["target"];

export function useKeepFocusedInputVisible(
  scrollViewRef: RefObject<ScrollView | null>,
  additionalOffset = 24,
) {
  const focusedInputRef = useRef<FocusTarget | null>(null);

  const scrollToFocusedInput = useCallback(() => {
    const focusedInput = focusedInputRef.current;
    if (!focusedInput) return;

    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollResponderScrollNativeHandleToKeyboard(
        focusedInput,
        additionalOffset,
        true,
      );
    });
  }, [additionalOffset, scrollViewRef]);

  useEffect(() => {
    const subscription = Keyboard.addListener(
      "keyboardDidShow",
      scrollToFocusedInput,
    );

    return () => subscription.remove();
  }, [scrollToFocusedInput]);

  return useCallback(
    (event: NativeSyntheticEvent<TargetedEvent>) => {
      focusedInputRef.current = event.target;

      if (Keyboard.isVisible()) {
        scrollToFocusedInput();
      }
    },
    [scrollToFocusedInput],
  );
}
