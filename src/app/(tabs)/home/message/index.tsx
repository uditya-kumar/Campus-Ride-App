import { Text, View } from "react-native";
import Button from "@/components/rideComponents/Button";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { router } from "expo-router";
import { StyleSheet } from "react-native";

export default function ModalScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const onCreateRide = () => {
    // move to chatdetails screen and pass [id] as parameter
    router.push({ pathname: "/home/message/[id]", params: { id: "123" } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modal</Text>

      <Button
        text="chat details with id"
        textColor={colors.background}
        backgroundColor={colors.buttonBackground}
        onPress={onCreateRide}
        paddingVertical={10}
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
