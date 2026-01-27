import RideCard from "@/components/rideComponents/RideCard";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Tables } from "@/database.types";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ride = Tables<"rides">;

const MyRides = () => {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const [myRides, setMyRides] = useState<ride[]>([]);

  const onCreateRide = () => {
    router.push("/createRide");
  };

  const onJoinRide = (rideId: string) => {
    console.log("Joined ride", rideId);
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.text }]}>
        You haven't created or joined any rides. Tap + to create your first ride!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlashList
        data={myRides}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyComponent}
        renderItem={({ item }) => (
          <RideCard ride={item} onJoinRide={() => onJoinRide(item.id)} />
        )}
        contentContainerStyle={[{ gap: 22, paddingBottom: 15 }]}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      />
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
    flex: 1,
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
  emptyText: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 530,
  },
});

export default MyRides;
