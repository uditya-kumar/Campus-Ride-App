import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import Colors from "@/constants/Colors";

const GoogleButton = ({
  onPress,
  loading = false,
}: {
  onPress: () => void;
  loading?: boolean;
}) => {
  return (
    <Pressable
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={onPress}
      disabled={loading}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={Colors.light.text}
            style={styles.icon}
          />
        ) : (
          <Image
            source={require("@assets/images/googleLogo.png")}
            style={styles.icon}
          />
        )}
        <Text style={[styles.text, { color: Colors.light.text }]}>
          {loading ? "Signing in..." : "Continue with Google"}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderColor: Colors.light.borderColor,
    backgroundColor: Colors.light.cardBackground,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
  },
});
export default GoogleButton;