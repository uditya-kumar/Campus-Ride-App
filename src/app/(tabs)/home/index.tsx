import DateFilter from "@/components/filters/DateFilter";
import RouteSelector from "@/components/filters/RouteSelector";
import Button from "@/components/rideComponents/Button";
import Dropdown from "@/components/rideComponents/Dropdown";
import RideCard from "@/components/rideComponents/RideCard";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useFilteredRides } from "@/hooks/useFilteredRides";
import { locations } from "@/constants/locations";
import { MAX_DEPARTURE_DAYS_AHEAD } from "@/constants/rides";
import { daysFromNow } from "@/libs/datetime";
import type { Tables } from "@/database.types";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useJoinRide } from "@/hooks/useJoinRide";
import { Alert } from "react-native";
import { useMyBookings } from "@/hooks/useMyBookings";

type Ride = Tables<"rides">;

// Hoist static data outside component to avoid recreation
const SORT_PLACEHOLDER = "Select Sort";
const sortOptions: string[] = [
  SORT_PLACEHOLDER,
  "Price: Low to High",
  "Price: High to Low",
  "Seats Available",
];

// Hoist keyExtractor outside component for stable reference
const keyExtractor = (item: Ride) => item.id;

// Ride list isn't a chat — opt out of anchor preservation so re-sorts/refilters
// land scrolled to the top instead of pinning the previously-visible item.
const maintainVisibleContentPosition = { disabled: true } as const;

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [origin, setOrigin] = useState<string | null>(null);
  const [destination, setDestination] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("");
  const { data: myBookedRideIds } = useMyBookings();
  const {
    mutate: joinRide,
    isPending: isJoining,
    variables: joiningRideId,
  } = useJoinRide();

  const maxDepartureDate = daysFromNow(MAX_DEPARTURE_DAYS_AHEAD);

  //Filter and sort rides based on selected filters
  const { rides, isLoading, isError, error } = useFilteredRides({
    origin,
    destination,
    selectedDate,
    sortBy,
  });

  const onJoinRide = (rideId: string) => {
    joinRide(rideId, {
      onError: (err) => {
        Alert.alert("Couldn't join ride", err.message);
      },
      onSuccess: () => {
        Alert.alert("Joined!", "You've been added to this ride.");
      },
    });
  };

  const onCreateRide = () => {
    router.push("/createRide");
  };

  const listEmpty = isLoading ? (
    <View style={styles.listCentered}>
      <ActivityIndicator size="large" color={colors.tint} />
    </View>
  ) : isError ? (
    <View style={styles.listCentered}>
      <Text style={[styles.emptyText, { color: colors.text }]} selectable>
        Couldn't load rides
      </Text>
      <Text
        style={[styles.emptySubtext, { color: colors.tabIconDefault }]}
        selectable
      >
        {error?.message ?? "Please try again."}
      </Text>
    </View>
  ) : (
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

  const renderItem = ({ item }: { item: Ride }) => {
    const isMember = !!myBookedRideIds?.has(item.id);

    return (
    <View style={styles.cardContainerStyle}>
      <RideCard
        ride={item}
        onJoinRide={onJoinRide}
        isJoining={isJoining && joiningRideId === item.id}
        isMember={isMember}
      />
    </View>
  );
  };

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
          <View style={styles.flex1}>
            <DateFilter
              labelText="Date"
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              maximumDate={maxDepartureDate}
            />
          </View>
          <View style={styles.flex1}>
            <Dropdown
              labelText="Sort By"
              options={sortOptions}
              selectedOption={sortBy}
              onSelect={(opt) => setSortBy(opt === SORT_PLACEHOLDER ? "" : opt)}
              placeholder={SORT_PLACEHOLDER}
            />
          </View>
        </View>
      </View>

      {/* List  */}
      <FlashList
        data={rides}
        keyExtractor={keyExtractor}
        ListEmptyComponent={listEmpty}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        maintainVisibleContentPosition={maintainVisibleContentPosition}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listCentered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 150,
  },
  filtersContainer: {
    gap: 21,
    marginTop: 14,
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
