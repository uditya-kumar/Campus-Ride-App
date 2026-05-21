import { useColorScheme } from "@/components/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, router, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  anchor: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const hiddenHeaderOptions = { headerShown: false };

export default function RootLayout() {
  useEffect(() => {
    // Hide the splash screen after the app is ready
    SplashScreen.hideAsync();
  }, []);

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  // const pathname = usePathname();

  // useEffect(() => {
  //   if (__DEV__) console.log("[route]", pathname);
  // }, [pathname]);

  const lastResponse = Notifications.useLastNotificationResponse();
  const handledRef = useRef<string | null>(null);

  // Cold-start handler: useLastNotificationResponse returns the response that
  // launched the app (if any), then keeps returning it across re-renders.
  // Track the request id so we navigate exactly once.
  useEffect(() => {
    if (!lastResponse) return;
    const id = lastResponse.notification.request.identifier;
    if (handledRef.current === id) return;
    handledRef.current = id;
    const rideId = lastResponse.notification.request.content.data?.rideId as
      | string
      | undefined;
    if (rideId) router.push(`/message/${rideId}`);
  }, [lastResponse]);

  // Warm-state handler: taps that arrive while the app is foregrounded.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((res) => {
      const rideId = res.notification.request.content.data?.rideId as
        | string
        | undefined;
      if (rideId) router.push(`/message/${rideId}`);
    });
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <QueryProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Stack>
              <Stack.Screen name="index" options={hiddenHeaderOptions} />
              <Stack.Screen name="(auth)" options={hiddenHeaderOptions} />
              <Stack.Screen name="(tabs)" options={hiddenHeaderOptions} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </ThemeProvider>
        </QueryProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
