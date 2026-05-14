import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { signOut } from "@/libs/auth";
import { Stack } from "expo-router";
import { LogOut } from "lucide-react-native";
import React from "react";
import { Alert, Pressable } from "react-native";

const handleSignOut = async () => {
  const { error } = await signOut();
  if (error) Alert.alert("Sign out failed", error.message);
};

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
              onPress={handleSignOut}
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
