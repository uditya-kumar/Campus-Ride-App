import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import React from "react";
import {
  KeyboardTypeOptions,
  StyleSheet,
  TextInput,
  View,
  Text,
} from "react-native";

type CustomTextInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  style?: object;
  keyboardType?: KeyboardTypeOptions;
  labelText: string;
};

const CustomTextInput = ({
  value,
  onChangeText,
  placeholder,
  style,
  keyboardType,
  labelText,
}: CustomTextInputProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{labelText}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.tabIconDefault}
        autoCorrect={false}
        keyboardType={keyboardType}
        style={[
          styles.searchInput,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.borderColor,
            color: colors.text,
          },
          style,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  searchInput: {
    height: 47,
    borderRadius: 10,
    borderWidth: 1,
    paddingLeft: 15,
    fontSize: 15,
  },
});

export default CustomTextInput;
