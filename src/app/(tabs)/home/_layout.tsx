import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { signOut } from "@/libs/auth";
import { Stack } from "expo-router";
import { LogOut } from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";

export default function HomeLayout() {
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
          headerRight: () => (
            <Pressable
              onPress={signOut}
              hitSlop={10}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            >
              <LogOut size={22} color={colors.text} />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
