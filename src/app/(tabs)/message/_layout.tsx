import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Stack } from "expo-router";

// Treat the chat list as the implicit root of the message stack. Without this,
// deep-linking straight to /message/[id] (e.g. from a ride card's Chat button)
// pushes [id] without `index` underneath — breaking the back button and the
// "tap tab to see chat list" behavior.
export const unstable_settings = {
  initialRouteName: "index",
};

// Hoisted static screen options
const indexScreenOptions = {
  title: "Messages",
  headerShown: true,
};

const chatScreenOptions = {
  title: "Chat",
  headerShown: true,
};

export default function MessageLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const screenOptions = {
    headerStyle: { backgroundColor: colors.tabBackground },
    headerTitleStyle: { color: colors.text },
    headerTintColor: colors.text,
  };

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={indexScreenOptions} />
      <Stack.Screen name="[id]" options={chatScreenOptions} />
    </Stack>
  );
}
