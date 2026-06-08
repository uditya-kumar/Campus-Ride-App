import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useRide } from "@/hooks/useRide";
import { useRideMembers } from "@/hooks/useRideMembers";
import { formatDisplayDate, formatDisplayTime } from "@/libs/datetime";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5/static";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons/static";
import Octicons from "@react-native-vector-icons/octicons/static";
import Feather from "@react-native-vector-icons/feather/static";
import Ionicons from "@react-native-vector-icons/ionicons/static";
import { useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function RideInfo() {
  const { id: rideId } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const { data: ride, isLoading: rideLoading } = useRide(rideId);
  const { data: members, isLoading: membersLoading } = useRideMembers(rideId);

  if (rideLoading || membersLoading || !ride) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  const cardStyle = [
    styles.card,
    {
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderColor,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Route + departure */}
      <View style={cardStyle}>
        <Row
          icon={
            <MaterialCommunityIcons
              name="map-marker-radius-outline"
              color={colors.text}
              size={18}
            />
          }
        >
          <Text style={[styles.primaryText, { color: colors.text }]}>
            {ride.origin} To {ride.destination}
          </Text>
        </Row>
        <Row
          icon={
            <FontAwesome5 name="calendar-alt" color={colors.text} size={18} />
          }
        >
          <Text style={[styles.primaryText, { color: colors.text }]}>
            {formatDisplayDate(ride.departure_date)},{" "}
            {formatDisplayTime(ride.departure_date)}
          </Text>
        </Row>
        <View style={styles.rowSpaceBetween}>
          <Row
            icon={<Octicons name="people" color={colors.text} size={18} />}
          >
            <Text style={styles.secondaryText}>
              {ride.available_seats}/{ride.total_seats} seats left
            </Text>
          </Row>
          <Row
            icon={
              <MaterialCommunityIcons
                name="car-outline"
                color={colors.text}
                size={22}
              />
            }
          >
            <Text style={styles.secondaryText}>{ride.vehicle_type}</Text>
          </Row>
        </View>
      </View>

      {/* Cost */}
      <View style={cardStyle}>
        <View style={styles.rowSpaceBetween}>
          <Text style={[styles.secondaryText, { color: colors.text }]}>
            Total cost
          </Text>
          <Text style={[styles.priceText, { color: colors.tint }]}>
            ₹{ride.total_cost}
          </Text>
        </View>
        <View style={styles.rowSpaceBetween}>
          <Text style={[styles.secondaryText, { color: colors.text }]}>
            Cost per person
          </Text>
          <Text style={[styles.priceText, { color: colors.tint }]}>
            ₹{ride.cost_per_person}
          </Text>
        </View>
      </View>

      {/* Members */}
      <View style={cardStyle}>
        <Text style={[styles.sectionLabel, { color: colors.tabIconDefault }]}>
          Members ({members?.length ?? 0})
        </Text>
        {members?.map((m, idx) => {
          const isHost = m.user_id === ride.created_by_user_id;
          const isLast = idx === (members.length ?? 0) - 1;
          const gender = m.user?.gender;
          const genderColor =
            gender === "male"
              ? colors.genderMale
              : gender === "female"
                ? colors.genderFemale
                : null;
          return (
            <View
              key={m.user_id}
              style={[
                styles.memberRow,
                !isLast && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.borderColor,
                },
              ]}
            >
              <Feather name="user" color={colors.text} size={18} />
              <Text style={[styles.primaryText, { color: colors.text }]}>
                {m.user?.full_name ?? "Unknown"}
              </Text>
              {gender && genderColor && (
                <Ionicons
                  name={gender === "male" ? "male" : "female"}
                  size={19}
                  color={genderColor}
                />
              )}
              {isHost && (
                <View
                  style={[
                    styles.badge,
                    { borderColor: colors.buttonBackgroundSecondary },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: colors.buttonBackgroundSecondary },
                    ]}
                  >
                    Host
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function Row({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <View style={styles.row}>
      {icon}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 14 },
  centered: { alignItems: "center", justifyContent: "center" },
  card: {
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 14,
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
    fontWeight: "500",
    color: "#6B7280",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  badge: {
    marginLeft: "auto",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
