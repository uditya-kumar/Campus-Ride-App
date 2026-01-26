// components/Button.tsx
import React from "react";
import { Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
// import { Plus, SendHorizontal, Eye, UserCheck, Trash2, type LucideProps } from "lucide-react-native";

// export type AllowedIconName = "Plus" | "SendHorizontal" | "Eye" | "UserCheck" | "Trash2";

interface ButtonProps {
  text: string;
  textColor: string;
  backgroundColor: string;
  borderColor?: string;
//   icon: AllowedIconName;
  onPress?: () => void;
  paddingVertical?: number;
  paddingHorizontal?: number,
  loading?: boolean;
//   hideIconOnLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  text,
  textColor,
  backgroundColor,
  borderColor = "transparent",
//   icon,
  onPress,
  paddingVertical = 11,
  loading = false,
  paddingHorizontal = 15,
//   hideIconOnLoading = false,
}) => {
//   const ICONS: Record<AllowedIconName, React.ComponentType<LucideProps>> = {
//     Plus,
//     SendHorizontal,
//     Eye,
//     UserCheck,
//     Trash2,
//   } as const;

//   const IconComponent = ICONS[icon];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          paddingVertical,
          paddingHorizontal,
          backgroundColor,
          borderColor,
          borderWidth: borderColor !== "transparent" ? 1 : 0,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
      onPress={!loading ? onPress : undefined}
    >
      {/* {!(loading && hideIconOnLoading) && (
        <IconComponent color={textColor} size={18} style={styles.icon} />
      )} */}
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>

      {loading && (
        <ActivityIndicator
          size="small"
          color={textColor}
          style={styles.spinner}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    justifyContent: "center",
  },
  spinner: {
    marginLeft: 10, // ← push spinner to right of text
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontWeight: "600",
    fontSize: 14,
  },
});

export default Button;