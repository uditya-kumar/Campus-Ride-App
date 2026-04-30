// components/Button.tsx
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

function Button({
  text,
  textColor,
  backgroundColor,
  borderColor = "transparent",
  onPress,
  paddingVertical = 11,
  loading = false,
  paddingHorizontal = 15,
}: ButtonProps) {
  const buttonBaseStyle: ViewStyle = {
    paddingVertical,
    paddingHorizontal,
    backgroundColor,
    borderColor,
    borderWidth: borderColor !== "transparent" ? 1 : 0,
  };

  const textColorStyle = { color: textColor };

  const getPressableStyle = ({ pressed }: { pressed: boolean }) => [
    styles.button,
    buttonBaseStyle,
    { opacity: pressed ? 0.9 : 1 },
  ];

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
}

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
