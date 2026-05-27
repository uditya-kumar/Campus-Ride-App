import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GoogleButton from "@/components/rideComponents/GoogleButton";
import Colors from "@/constants/Colors";
import { googleSignIn } from "@/libs/auth";
import { useToast } from "@/providers/ToastProvider";

export default function SignInScreen() {
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

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
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <Image
        source={require("@assets/images/onboarding.jpg")}
        style={[StyleSheet.absoluteFill, styles.image]}
        contentFit="cover"
      />

      <View style={styles.bottomButton}>
        <GoogleButton onPress={onSignin} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "#EAF2FF"
  },
  bottomButton: {
    paddingBottom: 45,
    width: "90%",
  },
  image: {
    top: 50,
  },
});
