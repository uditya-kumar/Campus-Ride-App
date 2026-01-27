import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Link, Stack } from "expo-router";
import { MessageCircleMore } from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.tabBackground,
        },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Campus Ride",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="message"
        options={{
          animation: "ios_from_right",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="createRide"
        options={{
          title: "Create Ride",
          headerRight: undefined,
        }}
      />
    </Stack>
  );
}
