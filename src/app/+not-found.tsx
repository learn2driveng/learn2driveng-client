import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="flex-1 items-center justify-center gap-4 bg-background-light p-6 dark:bg-background-dark">
        <Text className="font-sans text-title2 font-bold text-neutral-900 dark:text-white">Page not found</Text>
        <Link href="/" className="font-sans text-body font-medium text-primary">
          Go to home
        </Link>
      </View>
    </>
  );
}
