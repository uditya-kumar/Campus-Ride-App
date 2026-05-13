import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
import { PropsWithChildren } from "react";
import { AppState, Platform, type AppStateStatus } from "react-native";
import {
  onlineManager,
  focusManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

// Refetch on App focus#
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

export function QueryProvider({ children }: PropsWithChildren) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 2,
            refetchOnReconnect: true,
          },
        },
      }),
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", onAppStateChange);
    return () => sub.remove();
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
