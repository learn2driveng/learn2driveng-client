import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/use-app-theme';

type ScreenProps = {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  edges?: boolean;
};

/** Full-screen container with theme-aware background (reliable on iOS & Android). */
export function Screen({ children, className = '', style, edges = true }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  return (
    <View
      className={`flex-1 ${className}`}
      style={[
        {
          backgroundColor: colors.background,
          paddingTop: edges ? insets.top : 0,
          paddingBottom: edges ? insets.bottom : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
