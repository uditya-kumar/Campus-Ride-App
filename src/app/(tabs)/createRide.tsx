import { createRide } from "@/api/rides";
import DateFilter from "@/components/filters/DateFilter";
import RouteSelector from "@/components/filters/RouteSelector";
import TimeFilter from "@/components/filters/TimeFilter";
import Button from "@/components/rideComponents/Button";
import CustomTextInput from "@/components/rideComponents/CustomTextInput";
import Dropdown from "@/components/rideComponents/Dropdown";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Tables } from "@/database.types";
import { toIsoIST } from "@/libs/datetime";
import { useAuth } from "@/providers/AuthProvider";
import { locations } from "@/constants/locations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { vehicleOptions } from "@/constants/vehicles";

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
  const [availableSeats, setAvailableSeats] = useState<
    Ride["total_seats"] | null
  >(0);
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
    setAvailableSeats(0);
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

  // Derive costPerPerson from totalCost and availableSeats
  const costPerPerson =
    availableSeats && totalCost && availableSeats > 0 && totalCost > 0
      ? Math.round((totalCost / availableSeats) * 100) / 100
      : 0;

  const containerStyle = [
    styles.container,
    { backgroundColor: colors.background },
  ];

  const labelStyle = [styles.label, { color: colors.text }];

  const handleSubmit = () => {
    if (
      !origin ||
      !destination ||
      !departureDate ||
      !departureTime ||
      !availableSeats ||
      !totalCost ||
      !vehicleType
    ) {
      Alert.alert("Please fill in all fields");
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
      available_seats: availableSeats,
      total_seats: availableSeats,
      cost_per_person: costPerPerson,
      total_cost: totalCost,
      vehicle_type: vehicleType,
      status: "active",
      created_by_user_id: session.user.id,
    });
  };

  return (
    <ScrollView style={containerStyle}>
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
              labelText="Available Seats"
              value={availableSeats ? availableSeats.toString() : ""}
              onChangeText={(text) => setAvailableSeats(parseInt(text) || 0)}
              placeholder="e.g. 4"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.flex1}>
            <CustomTextInput
              labelText="Total Cost (₹)"
              value={totalCost ? totalCost.toString() : ""}
              onChangeText={(text) => setTotalCost(parseFloat(text) || 0)}
              placeholder="e.g. 1600"
              keyboardType="numeric"
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
        <Text style={labelStyle}>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  calculatedField: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f5f5f5",
  },
  calculatedText: {
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 40,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CreateRideScreen;
