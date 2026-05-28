import Avatar from "@/components/Avatar";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useProfile } from "@/hooks/useProfile";
import { signOut } from "@/libs/auth";
import { useToast } from "@/providers/ToastProvider";
import Feather from "@react-native-vector-icons/feather/static";
import Ionicons from "@react-native-vector-icons/ionicons/static";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const isDark = colorScheme === "dark";

  const { data: profile, isLoading } = useProfile();
  const { showToast } = useToast();
  const [signingOut, setSigningOut] = useState(false);

  if (isLoading || !profile) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  const chevronColor = isDark ? "#9ca3af" : "#6b7280";

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    const { error } = await signOut();
    if (error) {
      showToast(error.message);
      setSigningOut(false);
    }
    // On success the auth gate unmounts this screen — no need to clear state.
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Avatar uri={profile.avatar_url} size={100} />

      <Text style={[styles.username, { color: colors.text }]}>
        {profile.full_name}
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.borderColor,
          },
        ]}
      >
        <Pressable
          style={[styles.row, { borderBottomColor: colors.borderColor }]}
          onPress={() => router.push("/(tabs)/profile/reportBug")}
        >
          <View style={styles.rowLeft}>
            <Ionicons
              name="bug-outline"
              size={20}
              color={colors.text}
              style={styles.icon}
            />
            <Text style={[styles.rowText, { color: colors.text }]}>
              Report a Bug
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={chevronColor} />
        </Pressable>

        <Pressable
          style={[
            styles.row,
            styles.lastRow,
            { borderBottomColor: colors.borderColor },
          ]}
          onPress={() =>
            WebBrowser.openBrowserAsync("https://github.com/uditya-kumar", {
              createTask: false,
            })
          }
        >
          <View style={styles.rowLeft}>
            <Feather
              name="info"
              size={20}
              color={colors.text}
              style={styles.icon}
            />
            <Text style={[styles.rowText, { color: colors.text }]}>
              About DEV
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={chevronColor} />
        </Pressable>
      </View>
      <Pressable
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          <View style={styles.rowLeft}>
            <Feather
              name="log-out"
              size={20}
              color={colors.error}
              style={styles.icon}
            />
            <Text style={[styles.signOutText, { color: colors.error }]}>
              Sign Out
            </Text>
            {signingOut && (
              <ActivityIndicator
                size="small"
                color={colors.error}
                style={styles.signOutSpinner}
              />
            )}
          </View>
        </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  centered: { justifyContent: "center" },
  username: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    width: "100%",
    marginTop: 24,
    borderWidth: 1,
    borderRadius: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderBottomWidth: 1
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  rowText: {
    fontSize: 16,
  },
  signOutButton: {
    marginTop: 30,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
  },
  signOutSpinner: {
    marginLeft: 10,
  }
});
