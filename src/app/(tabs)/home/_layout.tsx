import React from "react";
import { Link, Stack } from "expo-router";
import { Pressable } from "react-native";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { MessageCircleMore } from "lucide-react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.text,
        headerRight: () => (
          <Link href="/home/message" asChild>
            <Pressable>
              {({ pressed }) => (
                <MessageCircleMore
                  size={25}
                  color={Colors[colorScheme ?? "light"].text}
                  style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          </Link>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Campus Ride" }} />
      <Stack.Screen
        name="message"
        options={{
          presentation: "modal",
          title: "Messages",
          headerRight: undefined,
        }}
      />
      <Stack.Screen
        name="createRide"
        options={{ title: "Create Ride", headerRight: undefined }}
      />
    </Stack>
  );
}
