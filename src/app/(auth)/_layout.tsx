import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

// Hoisted static options to prevent new object references
const hiddenHeaderOptions = { headerShown: false };

export default function AuthLayout() {
  const { session, loading } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (session) {
    return <Redirect href={'/(tabs)/home'} />;
  }

  return (
    <Stack>
      <Stack.Screen name="signin" options={hiddenHeaderOptions}/>
    </Stack>
  );
}