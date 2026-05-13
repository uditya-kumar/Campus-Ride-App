import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Redirect, Tabs } from "expo-router";
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from "@/providers/AuthProvider";

export default function TabLayout() {
  const { session, loading } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  if (loading) return null;
  if (!session) return <Redirect href="/(auth)/signin" />;

  const screenOptions = {
    tabBarActiveTintColor: colors.tabIconSelected,
    tabBarInactiveTintColor: colors.tabIconDefault,
    tabBarShowLabel: true,
    tabBarLabelPosition: "below-icon" as const,
    tabBarStyle: {
      paddingTop: 10,
      height: 68,
      backgroundColor: colors.tabBackground,
    },
  };

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="home"
        options={{
          animation: "none",
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="createRide"
        options={{
          animation: "none",
          title: "Create Ride",
          tabBarIcon: ({ color }) => <Feather name="plus-square" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          animation: "none",
          title: "Message",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <AntDesign name="message" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
