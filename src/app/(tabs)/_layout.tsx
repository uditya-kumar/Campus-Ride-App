import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Tabs } from "expo-router";
import {
  CarTaxiFront,
  House,
  MessageCircleMore,
  User,
} from "lucide-react-native";
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
          animation: "shift",
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => <House size={25} color={color} />,
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          animation: "shift",
          title: "Message",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MessageCircleMore size={25} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          animation: "shift",
          title: "My Ride",
          headerShown: false,
          tabBarIcon: ({ color }) => <CarTaxiFront size={25} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          animation: "shift",
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={25} color={color} />,
        }}
      />
    </Tabs>
  );
}
