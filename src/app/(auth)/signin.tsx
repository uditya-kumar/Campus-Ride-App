import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import Button from "@/components/rideComponents/Button";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { signIn, signUp } from "@/libs/auth";
import { useToast } from "@/providers/ToastProvider";

export default function SignInScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (mode: "in" | "up") => {
    // Trim email only — passwords may legitimately contain surrounding whitespace.
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      showToast("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const { error } = mode === "in"
        ? await signIn(cleanEmail, password)
        : await signUp(cleanEmail, password);
      if (error) return showToast(error.message);
      // (auth)/_layout.tsx handles redirect once the session arrives.
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.borderColor }]}
        placeholder="Email"
        placeholderTextColor={colors.tabIconDefault}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.borderColor }]}
        placeholder="Password"
        placeholderTextColor={colors.tabIconDefault}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        text="Sign In"
        textColor={colors.buttonText}
        backgroundColor={colors.buttonBackground}
        onPress={() => onSubmit("in")}
        paddingVertical={13}
        loading={loading}
      />
      <Button
        text="Sign Up"
        textColor={colors.text}
        backgroundColor="transparent"
        borderColor={colors.borderColor}
        onPress={() => onSubmit("up")}
        paddingVertical={13}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16, justifyContent: "center" },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, height: 44 },
});