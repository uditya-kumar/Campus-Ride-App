import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import Ionicons from "@react-native-vector-icons/ionicons/static";
import Button from "@/components/rideComponents/Button";
import RadioOption from "@/components/rideComponents/RadioOption";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { supabase } from "@/libs/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";

type Gender = "male" | "female";

export default function GenderScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const { session } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState<Gender | null>(null);
  const [saving, setSaving] = useState(false);

  const onContinue = async () => {
    if (!selected || !session) return;
    setSaving(true);
    // `gender` is not in database.types.ts yet (regenerate types to drop the cast).
    const { error } = await supabase
      .from("users")
      .update({ gender: selected } as never)
      .eq("id", session.user.id);
    setSaving(false);
    if (error) {
      showToast(error.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["profile", session.user.id] });
    router.replace("/(tabs)/home");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: colors.buttonBackgroundSecondary },
            ]}
          >
            <Ionicons
              name="people-sharp"
              size={28}
              color={colors.buttonBackground}
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Select Gender
          </Text>
          <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
            This helps other riders know who they're traveling with.
          </Text>
        </View>

        <View style={styles.options}>
          <RadioOption
            label="Male"
            active={selected === "male"}
            onPress={() => setSelected("male")}
          />
          <RadioOption
            label="Female"
            active={selected === "female"}
            onPress={() => setSelected("female")}
          />
        </View>

        <Button
          text="Continue"
          textColor={colors.buttonText}
          backgroundColor={
            selected ? colors.buttonBackground : colors.tabIconDefault
          }
          onPress={onContinue}
          paddingVertical={15}
          loading={saving}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  content: {
    gap: 24,
  },
  header: {
    gap: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    paddingHorizontal: 16,
    textAlign: "center",
  },
  options: {
    gap: 12,
    marginBottom: 16,
  },
});
