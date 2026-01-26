import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";

const MyRides = () => {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const onCreateRide = () => {
    router.push("/createRide")
  };
  return (
    <View style={styles.container}>
      <Text>myRide</Text>
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.buttonBackground }]}
        onPress={onCreateRide}
        activeOpacity={0.8}
      >
        <Plus color={colors.buttonText} size={28} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default MyRides;
