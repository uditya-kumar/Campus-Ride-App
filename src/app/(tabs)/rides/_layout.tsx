import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Stack } from "expo-router";
import React from "react";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.tabBackground },
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "My Rides", headerShown: true }}
      />
    </Stack>
  );
}
