import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";
import { StyleSheet } from "react-native";

export default function ChatDetails() {
  const colorScheme = useColorScheme() ?? "light";
    const colors = Colors[colorScheme];
  const { id } = useLocalSearchParams<{ id: string }>();
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, {color: colors.text}]}>Chat Details Screen</Text>
      <View
        style={styles.separator}
      />
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});