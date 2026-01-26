import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Tabs } from "expo-router";
import React from "react";
import { House, User } from "lucide-react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? "light";
    const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarShowLabel: false,
        tabBarStyle: {
          paddingTop: 10,
          paddingBottom: 45,
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => <House size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color }) => <User size={21} color={color} />,
        }}
      />
    </Tabs>
  );
}
