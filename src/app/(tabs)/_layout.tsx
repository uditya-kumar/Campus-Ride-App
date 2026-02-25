import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Tabs } from "expo-router";
import { House, MessageCircleMore, SquarePlus } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarShowLabel: true,
        tabBarLabelPosition: "below-icon",
        tabBarStyle: {
          paddingTop: 10,
          height: 68,
          backgroundColor: colors.tabBackground,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          animation: "none",
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => <House size={25} color={color} />,
        }}
      />
      <Tabs.Screen
        name="createRide"
        options={{
          animation: "none",
          title: "Create Ride",
          tabBarIcon: ({ color }) => <SquarePlus size={25} color={color} />,
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          animation: "none",
          title: "Message",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MessageCircleMore size={25} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
