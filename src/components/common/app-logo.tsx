import { Image } from 'expo-image';
import { View, type ImageStyle, type StyleProp } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';

const logoLight = require('../../../assets/images/logo-light.png');
const logoDark = require('../../../assets/images/logo-dark.png');

type AppLogoProps = {
  /** Logo height in points; width scales from image aspect ratio. */
  height?: number;
  className?: string;
  style?: StyleProp<ImageStyle>;
};

export function AppLogo({ height = 36, className = '', style }: AppLogoProps) {
  const { isDark } = useAppTheme();
  const source = isDark ? logoLight : logoDark;

  return (
    <View className={className}>
      <Image
        source={source}
        style={[{ height, width: height * 2.8 }, style]}
        contentFit="contain"
        accessibilityLabel="Learn2Drive"
      />
    </View>
  );
}
