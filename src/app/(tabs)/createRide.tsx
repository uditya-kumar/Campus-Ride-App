import { createRide } from "@/api/rides";
import DateFilter from "@/components/filters/DateFilter";
import RouteSelector from "@/components/filters/RouteSelector";
import TimeFilter from "@/components/filters/TimeFilter";
import Button from "@/components/rideComponents/Button";
import CustomTextInput from "@/components/rideComponents/CustomTextInput";
import Dropdown from "@/components/rideComponents/Dropdown";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { locations } from "@/constants/locations";
import { MAX_DEPARTURE_DAYS_AHEAD, MAX_TOTAL_COST, MAX_RIDE_SEATS } from "@/constants/rides";
import { vehicleOptions } from "@/constants/vehicles";
import { Tables } from "@/database.types";
import { daysFromNow, toIsoIST } from "@/libs/datetime";
import { useAuth } from "@/providers/AuthProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

type Ride = Tables<"rides">;

const CreateRideScreen = () => {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  // Form state
  const [origin, setOrigin] = useState<Ride["origin"] | null>(null);
  const [destination, setDestination] = useState<Ride["destination"] | null>(
    null,
  );
  const [departureDate, setDepartureDate] = useState<
    Ride["departure_date"] | null
  >(null);
  const [totalSeats, setTotalSeats] = useState<Ride["total_seats"] | null>(0);
  const [totalCost, setTotalCost] = useState<Ride["total_cost"] | null>(0);
  const [vehicleType, setVehicleType] =
    useState<Ride["vehicle_type"]>("Eco Van");
  const [departureTime, setDepartureTime] = useState<string | null>(null); // "HH:mm"

  const queryClient = useQueryClient();
  const { session } = useAuth();

  const resetForm = () => {
    setOrigin(null);
    setDestination(null);
    setDepartureDate(null);
    setDepartureTime(null);
    setTotalSeats(0);
    setTotalCost(0);
    setVehicleType("Eco Van");
  };

  const { mutate, isPending } = useMutation({
    mutationFn: createRide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      resetForm();
      router.push("/(tabs)/home");
    },
    onError: (err) => {
      Alert.alert("Could not create ride", err.message);
    },
  });

  // Live preview only — Postgres stores the authoritative value (generated column).
  const costPerPerson =
    totalSeats && totalCost && totalSeats > 0 && totalCost > 0
      ? Math.round((totalCost / totalSeats) * 100) / 100
      : 0;

  const maxDepartureDate = daysFromNow(MAX_DEPARTURE_DAYS_AHEAD);

  const handleSubmit = () => {
    if (
      !origin ||
      !destination ||
      !departureDate ||
      !departureTime ||
      !vehicleType
    ) {
      Alert.alert("Please fill in all fields");
      return;
    }

    if (origin === destination) {
      Alert.alert("Origin and destination must be different");
      return;
    }

    const departure = new Date(toIsoIST(departureDate, departureTime));
    if (departure.getTime() <= Date.now()) {
      Alert.alert("Departure must be in the future");
      return;
    }

    if (departure.getTime() > maxDepartureDate.getTime()) {
      Alert.alert(
        `Departure must be within ${MAX_DEPARTURE_DAYS_AHEAD} days from today`,
      );
      return;
    }

    if (!totalSeats || totalSeats <= 0) {
      Alert.alert("Total seats must be greater than 0");
      return;
    }

    if (totalSeats > MAX_RIDE_SEATS) {
      Alert.alert(`Total seats can't exceed ${MAX_RIDE_SEATS}`);
      return;
    }

    if (!totalCost || totalCost <= 0) {
      Alert.alert("Total cost must be greater than 0");
      return;
    }

    if (totalCost > MAX_TOTAL_COST) {
      Alert.alert(`Total cost can't exceed ₹${MAX_TOTAL_COST}`);
      return;
    }

    if (!session) {
      Alert.alert("You must be signed in to create a ride");
      return;
    }

    mutate({
      origin,
      destination,
      departure_date: toIsoIST(departureDate, departureTime),
      // available_seats starts equal to total_seats — bookings will decrement it.
      available_seats: totalSeats,
      total_seats: totalSeats,
      total_cost: totalCost,
      vehicle_type: vehicleType,
      status: "active",
      created_by_user_id: session.user.id,
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.formContainer}>
        {/* Origin & Destination Selector */}
        <RouteSelector
          locations={locations}
          origin={origin}
          destination={destination}
          onSelectOrigin={setOrigin}
          onSelectDestination={setDestination}
        />

        {/* Departure Date Input */}
        <View style={styles.rowSpaceBetween}>
          <DateFilter
            labelText="Departure Date"
            selectedDate={departureDate}
            onSelectDate={setDepartureDate}
            maximumDate={maxDepartureDate}
          />
          <TimeFilter
            labelText="Departure Time"
            selectedTime={departureTime}
            onSelectTime={setDepartureTime}
          />
          {/* Vehicle Type Input */}
        </View>

        {/* Available Seats + Total Cost */}
        <View style={styles.row}>
          <View style={styles.flex1}>
            <CustomTextInput
              labelText="Total Seats"
              value={totalSeats ? totalSeats.toString() : ""}
              onChangeText={(text) =>
                setTotalSeats(
                  Math.min(
                    MAX_RIDE_SEATS,
                    Math.max(0, parseInt(text, 10) || 0),
                  ),
                )
              }
              placeholder="eg. 4"
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.flex1}>
            <CustomTextInput
              labelText="Total Cost (₹)"
              value={totalCost ? totalCost.toString() : ""}
              onChangeText={(text) =>
                setTotalCost(
                  Math.min(MAX_TOTAL_COST, Math.max(0, parseFloat(text) || 0)),
                )
              }
              placeholder={`eg. 1600`}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <Dropdown
          labelText="Vehicle Type"
          options={vehicleOptions}
          selectedOption={vehicleType}
          onSelect={setVehicleType}
        />

        {/* Cost Per Person (Calculated) */}
        <Text style={[styles.label, { color: colors.text }]}>
          Cost Per Person is:- Rs {costPerPerson.toFixed(2)} /-
        </Text>

        {/* Submit Button */}
        <Button
          text={isPending ? "Creating..." : "Create Ride"}
          textColor={colors.buttonText}
          backgroundColor={colors.buttonBackground}
          onPress={handleSubmit}
          paddingVertical={13}
          loading={isPending}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    gap: 25,
  },
  rowSpaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    gap: 15,
  },
  flex1: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
  },
});

export default CreateRideScreen;
