import Button from "@/components/rideComponents/Button";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useSubmitBugReport } from "@/hooks/useSubmitBugReport";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function ReportBug() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const { session } = useAuth();
  const { mutate: submitBug, isPending } = useSubmitBugReport(session?.user.id);
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [device, setDevice] = useState("");
  const [error, setError] = useState("");

  const onSubmit = () => {
    setError("");
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }
    if (!description.trim()) {
      setError("Please enter a description");
      return;
    }
    submitBug(
      {
        title: title.trim(),
        description: description.trim(),
        steps_to_reproduce: steps.trim() || undefined,
        expected_behavior: expected.trim() || undefined,
        actual_behavior: actual.trim() || undefined,
        device_info: device.trim() || undefined,
      },
      {
        onSuccess: () => {
          router.back();
          setTimeout(() => {
            showToast("Bug reported successfully.");
          }, 200);
        },
        onError: (e) =>
          setError(e instanceof Error ? e.message : "Failed to submit"),
      },
    );
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderColor,
      color: colors.text,
    },
  ];

  const multilineStyle = [
    styles.input,
    styles.multiline,
    {
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderColor,
      color: colors.text,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
    >
      <ScrollView
        style={styles.flex}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Short summary"
          placeholderTextColor={colors.tabIconDefault}
          style={inputStyle}
        />

        <Text style={[styles.label, { color: colors.text }]}>
          Description *
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the issue"
          placeholderTextColor={colors.tabIconDefault}
          multiline
          style={multilineStyle}
        />

        <Text style={[styles.label, { color: colors.text }]}>
          Steps to Reproduce
        </Text>
        <TextInput
          value={steps}
          onChangeText={setSteps}
          placeholder="1. ... 2. ..."
          placeholderTextColor={colors.tabIconDefault}
          multiline
          style={multilineStyle}
        />

        <Text style={[styles.label, { color: colors.text }]}>
          Expected Behavior
        </Text>
        <TextInput
          value={expected}
          onChangeText={setExpected}
          placeholder="What you expected to happen"
          placeholderTextColor={colors.tabIconDefault}
          multiline
          style={multilineStyle}
        />

        <Text style={[styles.label, { color: colors.text }]}>
          Actual Behavior
        </Text>
        <TextInput
          value={actual}
          onChangeText={setActual}
          placeholder="What actually happened"
          placeholderTextColor={colors.tabIconDefault}
          multiline
          style={multilineStyle}
        />

        <Text style={[styles.label, { color: colors.text }]}>Device Info</Text>
        <TextInput
          value={device}
          onChangeText={setDevice}
          placeholder="OS, device model, app version, etc."
          placeholderTextColor={colors.tabIconDefault}
          style={inputStyle}
        />

        {error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        ) : null}

        <View style={styles.buttonWrap}>
          <Button
            text="Submit Bug"
            textColor={colors.buttonText}
            backgroundColor={colors.buttonBackground}
            onPress={onSubmit}
            paddingVertical={13}
            loading={isPending}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 25,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    marginBottom: -8,
    fontWeight: "500",
    fontSize: 14,
  },
  buttonWrap: {
    marginTop: 25,
  },
});
