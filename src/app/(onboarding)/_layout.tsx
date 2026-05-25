import { Stack } from "expo-router";

const hiddenHeaderOptions = { headerShown: false };

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen name="gender" options={hiddenHeaderOptions} />
    </Stack>
  );
}
