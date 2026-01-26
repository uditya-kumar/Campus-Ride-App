import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Link, Tabs } from "expo-router";
import {
  CarTaxiFront,
  House,
  MessageCircleMore,
  User,
} from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";

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
          animation:"shift",
          title: "Campus Ride",
          headerShown: false,
          tabBarIcon: ({ color }) => <House size={21} color={color} />,
          headerRight: () => (
            <Link href="/home/message" asChild>
              <Pressable>
                {({ pressed }) => (
                  <MessageCircleMore
                    size={25}
                    color={colors.text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          animation:"shift",
          title: "My Ride",
          headerShown: false,
          tabBarIcon: ({ color }) => <CarTaxiFront size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          animation:"shift",
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={21} color={color} />,
        }}
      />
    </Tabs>
  );
}
