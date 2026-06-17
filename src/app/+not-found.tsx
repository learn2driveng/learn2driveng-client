import { Link, Stack } from 'expo-router';
import { Text } from 'react-native';

import { Screen } from '@/components/common/screen';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <Screen className="items-center justify-center gap-4 p-6">
        <Text className="font-sans text-title2 font-bold text-neutral-900 dark:text-white">Page not found</Text>
        <Link href="/" className="font-sans text-body font-medium text-primary">
          Go to home
        </Link>
      </Screen>
    </>
  );
}
