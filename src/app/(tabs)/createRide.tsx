import DateFilter from "@/components/filters/DateFilter";
import RouteSelector from "@/components/filters/RouteSelector";
import Button from "@/components/rideComponents/Button";
import CustomTextInput from "@/components/rideComponents/CustomTextInput";
import Dropdown from "@/components/rideComponents/Dropdown";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Tables } from "@/database.types";
import { locations } from "@assets/data/rides";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const vehicleOptions = ["Eco Van", "Ertiga", "Bolero", "Swift"];

type Ride = Tables<"rides">;

const createRide = () => {
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

  // Derive costPerPerson from totalCost and availableSeats
  const costPerPerson =
    availableSeats && totalCost && availableSeats > 0 && totalCost > 0
      ? Math.round((totalCost / availableSeats) * 100) / 100
      : 0;

  const containerStyle = [styles.container, { backgroundColor: colors.background }];

  const labelStyle = [styles.label, { color: colors.text }];

  const handleSubmit = () => {
    // Validate form
    if (
      !origin ||
      !destination ||
      !departureDate ||
      !availableSeats ||
      !totalCost ||
      !vehicleType
    ) {
      alert("Please fill in all fields");
      return;
    }

    // Create ride object
    const rideData = {
      origin,
      destination,
      departure_date: departureDate,
      available_seats: availableSeats,
      total_cost: totalCost,
      vehicle_type: vehicleType,
      cost_per_person: costPerPerson,
    };

    console.log("Ride data:", rideData);
    // TODO: Submit to backend

    router.push("/(tabs)/home");
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
          {/* Vehicle Type Input */}
          <Dropdown
            labelText="Vehicle Type"
            options={vehicleOptions}
            selectedOption={vehicleType}
            onSelect={setVehicleType}
          />
        </View>

        {/* Available Seats Input */}
        <CustomTextInput
          labelText="Available Seats"
          value={availableSeats ? availableSeats.toString() : ""}
          onChangeText={(text) => setAvailableSeats(parseInt(text) || 0)}
          placeholder="Enter number of seats"
          keyboardType="numeric"
        />

        {/* Total Cost Input */}
        <CustomTextInput
          labelText="Total Cost"
          value={totalCost ? totalCost.toString() : ""}
          onChangeText={(text) => setTotalCost(parseFloat(text) || 0)}
          placeholder="Enter total cost"
          keyboardType="numeric"
        />

        {/* Cost Per Person (Calculated) */}
        <Text style={labelStyle}>
          Cost Per Person is:- Rs {costPerPerson.toFixed(2)} /-
        </Text>

        {/* Submit Button */}
        <Button
          text="Create Ride"
          textColor={colors.buttonText}
          backgroundColor={colors.buttonBackground}
          onPress={handleSubmit}
          paddingVertical={13}
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

export default createRide;
