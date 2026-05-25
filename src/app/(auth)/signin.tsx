import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import GoogleButton from "@/components/rideComponents/GoogleButton";
import Colors from "@/constants/Colors";
import { googleSignIn } from "@/libs/auth";
import { useToast } from "@/providers/ToastProvider";

export default function SignInScreen() {
  const { showToast } = useToast();

  const onSignin = async () => {
    try {
      await googleSignIn();
      // (auth)/_layout.tsx redirects once the session arrives.
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not sign in with Google";
      showToast(message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Image
          source={require("@assets/images/onboarding.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Welcome to Karpool</Text>
        <Text style={styles.subtitle}>
          Find rides, share costs, and meet people heading the same way.
        </Text>
      </View>

      <View style={styles.bottomButton}>
        <GoogleButton onPress={onSignin} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: Colors.light.background,
  },
  logo: {
    width: 350,
    height: 350,
    borderRadius: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 17,
    color: "#0F172A",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  bottomButton: {
    paddingBottom: 40,
    width: "90%",
  },
});
