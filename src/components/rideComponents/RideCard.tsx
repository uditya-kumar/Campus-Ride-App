import Button from "@/components/rideComponents/Button";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Tables } from "@/database.types";
import { CalendarDays, Car, MapPinned, Users } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

type Ride = Tables<"rides">;

type RideCardProps = {
  ride: Ride;
  onJoinRide?: () => void;
};

export default function RideCard({ ride, onJoinRide }: RideCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  
  const departureDate = new Date(ride.departure_date);
  const date = departureDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
  const time = departureDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
      {/* Date and Time Row */}
      <View style={styles.row}>
        <CalendarDays color={colors.text} size={18} />
        <Text style={[styles.primaryText, { color: colors.text }]}>
          {date}, {time}
        </Text>
      </View>

      {/* Route Row */}
      <View style={styles.row}>
        <MapPinned color={colors.text} size={18} />
        <Text style={[styles.primaryText, { color: colors.text }]}>
          {ride.origin} To {ride.destination}
        </Text>
      </View>

      {/* Seats and Car Row */}
      <View style={styles.rowSpaceBetween}>
        <View style={styles.row}>
          <Users color={colors.text} size={18} />
          <Text style={styles.secondaryText}>
            {ride.available_seats}/{ride.total_seats} seats left
          </Text>
        </View>
        <View style={styles.row}>
          <Car color={colors.text} size={22} />
          <Text style={styles.secondaryText}>{ride.vehicle_type}</Text>
        </View>
      </View>

      {/* Price and Button Row */}
      <View style={styles.rowSpaceBetween}>
        <Text style={[styles.priceText, { color: colors.tint }]}>
          ₹{ride.cost_per_person}/person
        </Text>
        <Button
          text="Join Ride"
          textColor={colors.background}
          backgroundColor={colors.tint}
          onPress={onJoinRide}
          paddingVertical={10}
        />
      </View>
    </View>
  );
}

// ...existing code...

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    gap: 13,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowSpaceBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  primaryText: {
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryText: {
    fontSize: 16,
    color: "#6B7280",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "700",
  },
});
