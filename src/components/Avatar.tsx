import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import Feather from "@react-native-vector-icons/feather/static";
import { Image, StyleSheet, View } from "react-native";

type Props = {
  uri: string | null | undefined;
  size?: number;
};

export default function Avatar({ uri, size = 32 }: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: colors.cardBackground,
    borderColor: colors.borderColor,
  };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.container, containerStyle]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={[styles.container, styles.fallback, containerStyle]}>
      <Feather name="user" size={Math.round(size * 0.55)} color={colors.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: "hidden",
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
});
