import { Pressable, StyleSheet, Text } from "react-native";

type ChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  accentColor: string;
  textColor: string;
};

export default function Chip({
  label,
  active,
  onPress,
  accentColor,
  textColor,
}: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: accentColor,
          backgroundColor: active ? accentColor : "transparent",
        },
      ]}
    >
      <Text style={[styles.text, { color: active ? textColor : accentColor }]}>
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
