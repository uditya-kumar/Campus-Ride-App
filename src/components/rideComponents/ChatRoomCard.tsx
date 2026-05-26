import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Tables } from "@/database.types";
import { formatDisplayDate, formatDisplayTime } from "@/libs/datetime";
import { StyleSheet, Text, View } from "react-native";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5/static";
import EvilIcons from "@react-native-vector-icons/evil-icons/static";

type Ride = Tables<"rides">;

type ChatRoomCardProps = {
  ride: Ride;
  unreadCount?: number;
};

function ChatRoomCard({ ride, unreadCount = 0 }: ChatRoomCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const cardStyle = [
    styles.chatCard,
    {
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderColor,
    },
  ];

  const routeTextStyle = [styles.routeText, { color: colors.text }];

  const dateTextStyle = [styles.dateText, { color: colors.tabIconDefault }];

  return (
    <View style={cardStyle}>
      <View style={styles.routeHeader}>
        <View style={styles.routeInfo}>
          {/* routes */}
          <Text style={routeTextStyle} numberOfLines={1}>
            {ride.origin} → {ride.destination}
          </Text>

          {/* Date Row */}
          <View style={styles.dateRow}>
            <FontAwesome5 name="calendar-alt" color={colors.tabIconDefault} size={14} />
            <Text style={dateTextStyle}>
              {formatDisplayDate(ride.departure_date)},{" "}
              {formatDisplayTime(ride.departure_date)}
            </Text>
          </View>
        </View>
        {unreadCount > 0 && (
          <View
            style={[
              styles.unreadBadge,
              { backgroundColor: colors.buttonBackground },
            ]}
          >
            <Text style={styles.unreadText}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        )}
        <EvilIcons name="chevron-right" color={colors.tabIconDefault} size={30} />
      </View>
    </View>
  );
}

export default ChatRoomCard;

const styles = StyleSheet.create({
  chatCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderCurve: "continuous",
    padding: 12,
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  routeInfo: {
    flex: 1,
    gap: 4,
  },
  routeText: {
    fontSize: 15,
    fontWeight: "600",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 13,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
