import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import Colors from "@/constants/Colors";

const GoogleButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <View style={styles.content}>
        <Image
          source={require("@assets/images/googleLogo.png")}
          style={styles.icon}
        />
        <Text style={[styles.text, { color: Colors.light.text }]}>
          Continue with Google
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