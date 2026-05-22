import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Stack } from "expo-router";

// Hoisted static screen options
const indexScreenOptions = {
  title: "Profile",
  headerShown: true,
};
export default function ProfileLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.tabBackground },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={indexScreenOptions} />
      <Stack.Screen name="reportBug" options={{ title: "Report Bug" }} />
    </Stack>
  );
}
