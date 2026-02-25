import Button from "@/components/rideComponents/Button";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { CalendarDays, Car, MapPinned, Users } from "lucide-react-native";
import { memo, useCallback, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Octicons from '@expo/vector-icons/Octicons';

// Hoist Intl formatters to module scope - expensive to construct, created once
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "2-digit",
});
const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
});

// Props use primitives for optimal memo() shallow comparison
type RideCardProps = {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  availableSeats: number;
  totalSeats: number;
  vehicleType: string;
  totalCost: number;
  onJoinRide?: (rideId: string) => void;
};

// Memoized RideCard - primitives enable effective shallow comparison
const RideCard = memo(function RideCard({
  id,
  origin,
  destination,
  departureDate,
  availableSeats,
  totalSeats,
  vehicleType,
  totalCost,
  onJoinRide,
}: RideCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  // Memoize date formatting - uses hoisted Intl formatters (created once at module scope)
  const { date, time } = useMemo(() => {
    const parsedDate = new Date(departureDate);
    return {
      date: dateFormatter.format(parsedDate),
      time: timeFormatter.format(parsedDate),
    };
  }, [departureDate]);

  // Memoize dynamic styles to avoid creating new objects on each render
  const dynamicStyles = useMemo(
    () => ({
      card: {
        backgroundColor: colors.cardBackground,
        borderColor: colors.borderColor,
      },
      primaryText: { color: colors.text },
      priceText: { color: colors.tint },
    }),
    [colors.cardBackground, colors.borderColor, colors.text, colors.tint],
  );

  // Stabilize callback reference
  const handleJoinRide = useCallback(() => {
    onJoinRide?.(id);
  }, [onJoinRide, id]);

  return (
    <View style={[styles.card, dynamicStyles.card]}>
      {/* Date and Time Row */}
      <View style={styles.row}>
        <FontAwesome5 name="calendar-alt" color={colors.text} size={18} />
        <Text style={[styles.primaryText, dynamicStyles.primaryText]}>
          {date}, {time}
        </Text>
      </View>

      {/* Route Row */}
      <View style={styles.row}>
        <MaterialCommunityIcons name="map-marker-radius-outline" color={colors.text} size={18} />
        <Text style={[styles.primaryText, dynamicStyles.primaryText]}>
          {origin} To {destination}
        </Text>
      </View>

      {/* Seats and Car Row */}
      <View style={styles.rowSpaceBetween}>
        <View style={styles.row}>
          <Octicons name="people" color={colors.text} size={18} />
          <Text style={styles.secondaryText}>
            {availableSeats}/{totalSeats} seats left
          </Text>
        </View>
        <View style={styles.row}>
          <MaterialCommunityIcons name="car-outline" color={colors.text} size={22} />
          <Text style={styles.secondaryText}>{vehicleType}</Text>
        </View>
      </View>

      <View style={styles.rowSpaceBetween}>
        <Text style={[styles.priceText, dynamicStyles.priceText]}>
          Total: ₹{totalCost}
        </Text>
        <Button
          text="Join Ride"
          textColor={colors.buttonText}
          backgroundColor={colors.buttonBackground}
          onPress={handleJoinRide}
          paddingVertical={10}
        />
      </View>
    </View>
  );
});

export default RideCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
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
