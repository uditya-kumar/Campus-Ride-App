import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Link, Tabs } from "expo-router";
import React from "react";
import { Pressable } from "react-native";
import { House, User, MessageCircleMore } from "lucide-react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Campus Ride",
          tabBarIcon: ({ color }) => <House size={23} color={color} />,
          headerRight: () => (
            <Link href="/message" asChild>
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
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={23} color={color} />,
        }}
      />
    </Tabs>
  );
}
