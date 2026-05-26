import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Redirect, Tabs, type Href } from "expo-router";
import Feather from "@react-native-vector-icons/feather/static";
import AntDesign from "@react-native-vector-icons/ant-design/static";
import { useAuth } from "@/providers/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { useUnreadTotal } from "@/hooks/useUnreadTotal";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { session, loading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const unreadTotal = useUnreadTotal();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  if (loading || (session && profileLoading)) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }
  if (!session) return <Redirect href="/(auth)/signin" />;
  if (profile && !profile.gender)
    return <Redirect href={"/(onboarding)/gender" as Href} />;

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
