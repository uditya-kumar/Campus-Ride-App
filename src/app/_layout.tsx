import { useColorScheme } from "@/components/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { LogBox } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";

// Suppress edge-to-edge warning (these props are handled automatically)
LogBox.ignoreLogs([
  "statusBarTranslucent and navigationBarTranslucent values are ignored",
]);

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
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

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <AuthProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Stack>
              <Stack.Screen name="index" options={hiddenHeaderOptions} />
              <Stack.Screen name="(auth)" options={hiddenHeaderOptions} />
              <Stack.Screen name="(tabs)" options={hiddenHeaderOptions} />
            </Stack>
          </ThemeProvider>
        </AuthProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
