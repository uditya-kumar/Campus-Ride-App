import { Stack } from "expo-router";

// Hoisted static options to prevent new object references
const hiddenHeaderOptions = { headerShown: false };

// Auth gating lives in the root layout's Stack.Protected guard — this group is
// only mounted when there's no session, so no redirect is needed here.
export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="signin" options={hiddenHeaderOptions} />
    </Stack>
  );
}
