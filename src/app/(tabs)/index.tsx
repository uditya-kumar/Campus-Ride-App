import { Text, View } from "@/components/Themed";
import DateFilter from "@/components/filters/DateFilter";
import RouteSelector from "@/components/filters/RouteSelector";
import SortByDropdown from "@/components/filters/SortByDropdown";
import RideCard from "@/components/rideComponents/RideCard";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import ridesData from "@assets/data/rides";
import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { StyleSheet } from "react-native";

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
export default function TabOneScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [origin, setOrigin] = useState<string | null>(null);
  const [destination, setDestination] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<string>("Departure Time");

  // Rendered when no result of search found
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No rides found</Text>
      <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
        Try changing your filters
      </Text>
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
        data={ridesData}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyComponent}
        renderItem={({ item }) => (
          <RideCard
            ride={item}
            onJoinRide={() => console.log("Joined ride", item.id)}
          />
        )}
        contentContainerStyle={[{ gap: 25, paddingBottom: 10 }]}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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
    gap: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    gap: 30,
  },
  emptyContainer: {},
  emptySubtext: {},
  emptyText: {},
});
