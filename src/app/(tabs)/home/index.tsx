import DateFilter from "@/components/filters/DateFilter";
import RouteSelector from "@/components/filters/RouteSelector";
import Button from "@/components/rideComponents/Button";
import Dropdown from "@/components/rideComponents/Dropdown";
import RideCard from "@/components/rideComponents/RideCard";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useFilteredRides } from "@/hooks/useFilteredRides";
import { locations, Ride } from "@assets/data/rides";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Hoist static data outside component to avoid recreation
const sortOptions: string[] = [
  "Departure Time",
  "Price: Low to High",
  "Price: High to Low",
  "Seats Available",
];

// Hoist keyExtractor outside component for stable reference
const keyExtractor = (item: Ride) => item.id;

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
    router.push("/createRide");
  };

  const EmptyComponent = (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.text }]}>
        No rides found
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
        Try adjusting your filters or Create a new ride.
      </Text>
      <Button
        text="Create Ride"
        textColor={colors.buttonText}
        backgroundColor={colors.buttonBackground}
        onPress={onCreateRide}
        paddingVertical={10}
      />
    </View>
  );

  const renderItem = ({ item }: { item: Ride }) => (
    <View style={styles.cardContainerStyle}>
      <RideCard
        id={item.id}
        origin={item.origin}
        destination={item.destination}
        departureDate={item.departure_date}
        availableSeats={item.available_seats}
        totalSeats={item.total_seats}
        vehicleType={item.vehicle_type}
        totalCost={item.total_cost}
        onJoinRide={onJoinRide}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
          <View style={styles.flex1}>
            <DateFilter
              labelText="Date"
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </View>
          <View style={styles.flex1}>
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
        keyExtractor={keyExtractor}
        ListEmptyComponent={EmptyComponent}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
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
    gap: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  cardContainerStyle: {
    marginBottom: 14,
  },
  flex1: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    gap: 30,
  },
  listContent: {
    paddingVertical: 5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 23,
    fontWeight: "600",
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 18,
    paddingHorizontal: 58,
  },
});
