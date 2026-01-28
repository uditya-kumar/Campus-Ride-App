import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Tables } from "@/database.types";
import { CalendarDays, ChevronRight } from "lucide-react-native";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

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

  return (
    <View
      style={[
        styles.chatCard,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.borderColor,
        },
      ]}
    >
      <View style={styles.routeHeader}>
        <View style={styles.routeInfo}>
          {/* routes */}
          <Text
            style={[styles.routeText, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.ride.origin} → {item.ride.destination}
          </Text>

          {/* Date Row */}
          <View style={styles.dateRow}>
            <CalendarDays color={colors.tabIconDefault} size={14} />
            <Text style={[styles.dateText, { color: colors.tabIconDefault }]}>
              {formatDate(item.ride.departure_date)},{" "}
              {formatTime(item.ride.departure_date)}
            </Text>
          </View>
        </View>
        <ChevronRight color={colors.tabIconDefault} size={20} />
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
