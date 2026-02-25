import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Stack } from "expo-router";
import React, { useMemo } from "react";

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
      <Stack.Screen
        name="index"
        options={{
          title: "Messages",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Chat",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
