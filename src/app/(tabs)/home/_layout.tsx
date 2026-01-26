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
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="createRide"
        options={{ title: "Create Ride", headerRight: undefined }}
      />
    </Stack>
  );
}
