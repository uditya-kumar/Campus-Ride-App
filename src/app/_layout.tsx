import { useColorScheme } from "@/components/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { router, Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
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
  const pathname = usePathname();

  // useEffect(() => {
  //   if (__DEV__) console.log("[route]", pathname);
  // }, [pathname]);

  const lastResponse = Notifications.useLastNotificationResponse();
  const handledRef = useRef<string | null>(null);

  // Cold-start handler: useLastNotificationResponse returns the response that
  // launched the app (if any), then keeps returning it across re-renders.
  // We have to wait until the user has actually landed inside (tabs) — on a
  // cold start the auth gate at index.tsx redirects "/" → "/(tabs)/home", and
  // navigating *before* that redirect lands creates the message stack with
  // [id] as its only screen (no list underneath, no back button).
  useEffect(() => {
    if (!lastResponse) return;
    if (!pathname.startsWith("/home") && !pathname.startsWith("/message"))
      return;
    const id = lastResponse.notification.request.identifier;
    if (handledRef.current === id) return;
    handledRef.current = id;
    const rideId = lastResponse.notification.request.content.data?.rideId as
      | string
      | undefined;
    if (rideId) {
      // Same call <Link withAnchor> makes internally — withAnchor seeds the
      // message stack with `index` (its `unstable_settings.initialRouteName`)
      // before pushing [id] on top, so the back arrow works.
      router.navigate(`/(tabs)/message/${rideId}` as never, {
        withAnchor: true,
      } as never);
    }
  }, [lastResponse, pathname]);

  // Warm-state handler: taps that arrive while the app is foregrounded.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((res) => {
      const rideId = res.notification.request.content.data?.rideId as
        | string
        | undefined;
      if (rideId) {
        router.navigate(`/(tabs)/message/${rideId}` as never, {
          withAnchor: true,
        } as never);
      }
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
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
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
