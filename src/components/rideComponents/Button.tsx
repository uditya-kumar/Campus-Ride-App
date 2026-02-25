// components/Button.tsx
import React, { memo, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

interface ButtonProps {
  text: string;
  textColor: string;
  backgroundColor: string;
  borderColor?: string;
  onPress?: () => void;
  paddingVertical?: number;
  paddingHorizontal?: number;
  loading?: boolean;
}

const Button = memo(function Button({
  text,
  textColor,
  backgroundColor,
  borderColor = "transparent",
  onPress,
  paddingVertical = 11,
  loading = false,
  paddingHorizontal = 15,
}: ButtonProps) {
  // Memoize dynamic button styles to avoid recreation on each render
  const buttonBaseStyle = useMemo<ViewStyle>(
    () => ({
      paddingVertical,
      paddingHorizontal,
      backgroundColor,
      borderColor,
      borderWidth: borderColor !== "transparent" ? 1 : 0,
    }),
    [paddingVertical, paddingHorizontal, backgroundColor, borderColor],
  );

  // Memoize text color style
  const textColorStyle = useMemo(() => ({ color: textColor }), [textColor]);

  // Pressable style function - returns memoized base + pressed opacity
  const getPressableStyle = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => [
        styles.button,
        buttonBaseStyle,
        { opacity: pressed ? 0.9 : 1 },
      ],
    [buttonBaseStyle],
  );

  return (
    <Pressable
      style={getPressableStyle}
      onPress={!loading ? onPress : undefined}
    >
      <Text style={[styles.text, textColorStyle]}>{text}</Text>

      {loading && (
        <ActivityIndicator
          size="small"
          color={textColor}
          style={styles.spinner}
        />
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    justifyContent: "center",
  },
  spinner: {
    marginLeft: 10,
  },
  text: {
    fontWeight: "600",
    fontSize: 14,
  },
});

export default Button;
