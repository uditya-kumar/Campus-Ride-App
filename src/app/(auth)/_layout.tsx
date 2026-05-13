import { useAuth } from '../../providers/AuthProvider';
import { Redirect, Stack } from 'expo-router';

// Hoisted static options to prevent new object references
const hiddenHeaderOptions = { headerShown: false };

export default function AuthLayout() {
  const { session } = useAuth();

  if (session) {
    return <Redirect href={'/(tabs)/home'} />;
  }

  return (
    <Stack>
      <Stack.Screen name="signin" options={hiddenHeaderOptions}/>
    </Stack>
  );
}