import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Tables } from "@/database.types";
import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import EvilIcons from '@expo/vector-icons/EvilIcons';

type ChatRoom = Tables<"chat_rooms">;
type Ride = Tables<"rides">;

type ChatRoomWithRide = ChatRoom & {
  ride: Ride;
};

type ChatRoomCardProps = {
  item: ChatRoomWithRide;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

function ChatRoomCard({ item }: ChatRoomCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const cardStyle = useMemo(
    () => [
      styles.chatCard,
      {
        backgroundColor: colors.cardBackground,
        borderColor: colors.borderColor,
      },
    ],
    [colors.cardBackground, colors.borderColor],
  );

  const routeTextStyle = useMemo(
    () => [styles.routeText, { color: colors.text }],
    [colors.text],
  );

  const dateTextStyle = useMemo(
    () => [styles.dateText, { color: colors.tabIconDefault }],
    [colors.tabIconDefault],
  );

  return (
    <View style={cardStyle}>
      <View style={styles.routeHeader}>
        <View style={styles.routeInfo}>
          {/* routes */}
          <Text style={routeTextStyle} numberOfLines={1}>
            {item.ride.origin} → {item.ride.destination}
          </Text>

          {/* Date Row */}
          <View style={styles.dateRow}>
            <FontAwesome5 name="calendar-alt" color={colors.tabIconDefault} size={14} />
            <Text style={dateTextStyle}>
              {formatDate(item.ride.departure_date)},{" "}
              {formatTime(item.ride.departure_date)}
            </Text>
          </View>
        </View>
        <EvilIcons name="chevron-right" color={colors.tabIconDefault} size={30} />
      </View>
    </View>
  );
}

export default memo(ChatRoomCard);

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
});
