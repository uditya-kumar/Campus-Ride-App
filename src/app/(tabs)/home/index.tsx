import { Text, View } from "@/components/Themed";
import DateFilter from "@/components/filters/DateFilter";
import RouteSelector from "@/components/filters/RouteSelector";
import SortByDropdown from "@/components/filters/SortByDropdown";
import RideCard from "@/components/rideComponents/RideCard";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useFilteredRides } from "@/hooks/useFilteredRides";
import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { StyleSheet } from "react-native";
import Button from "@/components/rideComponents/Button";
import { router } from "expo-router";

const locations = [
  "VIT",
  "RKMP Railway",
  "Indore",
  "Bhopal Airport",
  "BPL Junction Railway",
  "Sehore",
  "Sant Hirdaram railway",
  "Chirayu Hospital",
  "Lalghati",
  "Nadra",
];

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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
    router.push('/home/createRide')
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
        textColor={colors.background}
        backgroundColor={colors.buttonBackground}
        onPress={onCreateRide}
        paddingVertical={10}
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
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </View>
          <View style={{ flex: 1 }}>
            <SortByDropdown
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
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 48,
  },
});
