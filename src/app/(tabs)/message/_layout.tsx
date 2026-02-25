import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Stack } from "expo-router";
import React, { useMemo } from "react";

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

  const screenOptions = useMemo(
    () => ({
      headerStyle: { backgroundColor: colors.tabBackground },
      headerTitleStyle: { color: colors.text },
      headerTintColor: colors.text,
    }),
    [colors.tabBackground, colors.text],
  );

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={indexScreenOptions} />
      <Stack.Screen name="[id]" options={chatScreenOptions} />
    </Stack>
  );
}
