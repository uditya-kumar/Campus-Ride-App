import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

type RadioOptionProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: ReactNode;
};

export default function RadioOption({
  label,
  active,
  onPress,
  icon,
}: RadioOptionProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.option,
        {
          borderColor: active ? colors.buttonBackground : colors.borderColor,
          backgroundColor: colors.cardBackground,
        },
      ]}
    >
      <View style={styles.labelGroup}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      </View>
      <View
        style={[
          styles.radioOuter,
          {
            borderColor: active
              ? colors.buttonBackground
              : colors.tabIconDefault,
          },
        ]}
      >
        {active ? (
          <View
            style={[
              styles.radioInner,
              { backgroundColor: colors.buttonBackground },
            ]}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
