import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabase } from "@/libs/supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(
  userId: string,
): Promise<string | null> {
  if (!Device.isDevice) return null; // simulators can't receive push

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2c7cfe",
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    final = status;
  }
  if (final !== "granted") return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  if (!projectId) {
    if (__DEV__) console.warn("EAS projectId missing — push disabled");
    return null;
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  // Upsert by expo_push_token so multiple installs / account switches work.
  await supabase
    .from("notification_tokens")
    .upsert(
      {
        user_id: userId,
        expo_push_token: token,
        platform: Platform.OS as "ios" | "android",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "expo_push_token" },
    );

  return token;
}

// Delete this device's row from notification_tokens. MUST run before
// supabase.auth.signOut() — the RLS policy requires user_id = auth.uid(),
// so once the session is gone the delete is silently rejected and the
// device keeps receiving pushes for the previous account.
export async function unregisterPushNotifications(): Promise<void> {
  if (!Device.isDevice) return;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  if (!projectId) return;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") return;

  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  await supabase
    .from("notification_tokens")
    .delete()
    .eq("expo_push_token", token);
}