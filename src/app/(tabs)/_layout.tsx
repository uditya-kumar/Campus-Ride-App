import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Tabs } from "expo-router";
import Feather from "@react-native-vector-icons/feather/static";
import AntDesign from "@react-native-vector-icons/ant-design/static";
import { useUnreadTotal } from "@/hooks/useUnreadTotal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Auth + onboarding access control lives in the root layout's Stack.Protected
// guards — this group only renders when the user is signed in AND onboarded, so
// no redirect/loading gate is needed here.
export default function TabLayout() {
  const unreadTotal = useUnreadTotal();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const screenOptions = {
    tabBarActiveTintColor: colors.tabIconSelected,
    tabBarInactiveTintColor: colors.tabIconDefault,
    tabBarShowLabel: true,
    tabBarLabelPosition: "below-icon" as const,
    tabBarStyle: {
      paddingTop: 10,
      paddingBottom: insets.bottom,
      height: 68 + insets.bottom,
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
          tabBarBadge: unreadTotal > 0 ? unreadTotal : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          animation: "none",
          title: "profile",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
