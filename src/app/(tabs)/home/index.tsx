import DateFilter from "@/components/filters/DateFilter";
import RouteSelector from "@/components/filters/RouteSelector";
import Button from "@/components/rideComponents/Button";
import Dropdown from "@/components/rideComponents/Dropdown";
import RideCard from "@/components/rideComponents/RideCard";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useFilteredRides } from "@/hooks/useFilteredRides";
import { locations } from "@assets/data/rides";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const sortOptions = [
  "Departure Time",
  "Price: Low to High",
  "Price: High to Low",
  "Seats Available",
];
export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [origin, setOrigin] = useState<string | null>(null);
  const [destination, setDestination] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("Departure Time");

  //Filter and sort rides based on selected filters
  const filteredRides = useFilteredRides({
    origin,
    destination,
    selectedDate,
    sortBy,
  });

  const onJoinRide = (rideId: string) => {
    console.log("Joined ride", rideId);
  };

  const onCreateRide = () => {
    router.push("/home/createRide");
  };

  // Rendered when no result of search found
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No rides found</Text>
      <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
        Try adjusting your filters or create a new ride.
      </Text>
      <Button
        text="Create Ride"
        textColor={colors.buttonText}
        backgroundColor={colors.buttonBackground}
        onPress={onCreateRide}
        paddingVertical={10}
        paddingHorizontal={25}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Filters Section */}
      <View style={styles.filtersContainer}>
        <RouteSelector
          locations={locations}
          origin={origin}
          destination={destination}
          onSelectOrigin={setOrigin}
          onSelectDestination={setDestination}
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <DateFilter
              labelText="Date"
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Dropdown
              labelText="Sort By"
              options={sortOptions}
              selectedOption={sortBy}
              onSelect={setSortBy}
            />
          </View>
        </View>
      </View>

      {/* List  */}
      <FlashList
        data={filteredRides}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyComponent}
        renderItem={({ item }) => (
          <RideCard ride={item} onJoinRide={() => onJoinRide(item.id)} />
        )}
        contentContainerStyle={[{ gap: 26, paddingBottom: 15 }]}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    paddingVertical: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  filtersContainer: {
    gap: 22,
    marginTop: 15,
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    gap: 30,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 18,
    paddingHorizontal: 48,
  },
});
