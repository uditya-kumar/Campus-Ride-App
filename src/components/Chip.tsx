import { Pressable, StyleSheet, Text } from "react-native";

type ChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  // Color used for the filled background + label when active.
  activeColor: string;
  // Color used for the border + label when inactive.
  inactiveColor: string;
  // Label color when chip is active (sits on `activeColor` background).
  activeTextColor: string;
};

export default function Chip({
  label,
  active,
  onPress,
  activeColor,
  inactiveColor,
  activeTextColor,
}: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: active ? activeColor : inactiveColor,
          backgroundColor: active ? activeColor : "transparent",
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: active ? activeTextColor : inactiveColor },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
});
