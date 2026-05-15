import Button from "@/components/rideComponents/Button";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import type { Tables } from "@/database.types";
import { formatDisplayDate, formatDisplayTime } from "@/libs/datetime";
import { StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Octicons from "@expo/vector-icons/Octicons";
import { router } from "expo-router";

type Ride = Tables<"rides">;

type RideCardProps = {
  ride: Ride;
  onJoinRide?: (rideId: string) => void;
  isJoining?: boolean;
  isMember?: boolean;
};

function RideCard({ ride, onJoinRide, isJoining, isMember }: RideCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const date = formatDisplayDate(ride.departure_date);
  const time = formatDisplayTime(ride.departure_date);

  const dynamicStyles = {
    card: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderColor,
    },
    primaryText: { color: colors.text },
    priceText: { color: colors.tint },
  };

  const openChat = () => {
    router.push(`/message/${ride.id}`);
  };

  const handleJoinRide = () => {
    onJoinRide?.(ride.id);
  };

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
        <MaterialCommunityIcons
          name="map-marker-radius-outline"
          color={colors.text}
          size={18}
        />
        <Text style={[styles.primaryText, dynamicStyles.primaryText]}>
          {ride.origin} To {ride.destination}
        </Text>
      </View>

      {/* Seats and Car Row */}
      <View style={styles.rowSpaceBetween}>
        <View style={styles.row}>
          <Octicons name="people" color={colors.text} size={18} />
          <Text style={styles.secondaryText}>
            {ride.available_seats}/{ride.total_seats} seats left
          </Text>
        </View>
        <View style={styles.row}>
          <MaterialCommunityIcons
            name="car-outline"
            color={colors.text}
            size={22}
          />
          <Text style={styles.secondaryText}>{ride.vehicle_type}</Text>
        </View>
      </View>

      <View style={styles.rowSpaceBetween}>
        <Text style={[styles.priceText, dynamicStyles.priceText]}>
          Total: ₹{ride.total_cost}
        </Text>
        {isMember ? (
          <Button
            text="Chat"
            textColor={colors.buttonBackgroundSecondary}
            backgroundColor="transparent"
            borderColor={colors.buttonBackgroundSecondary}
            onPress={openChat}
            paddingVertical={10}
            icon={
              <Feather
                name="message-circle"
                size={18}
                color={colors.buttonBackgroundSecondary}
              />
            }
          />
        ) : (
          <Button
            text="Join Ride"
            textColor={colors.buttonText}
            backgroundColor={colors.buttonBackground}
            onPress={handleJoinRide}
            paddingVertical={10}
            loading={isJoining}
          />
        )}
      </View>
    </View>
  );
}

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
