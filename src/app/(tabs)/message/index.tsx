import ChatRoomCard from "@/components/rideComponents/ChatRoomCard";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Tables } from "@/database.types";
import { FlashList } from "@shopify/flash-list";
import { Link } from "expo-router";
import { MessageCircle } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ChatRoom = Tables<"chat_rooms">;
type Ride = Tables<"rides">;

type ChatRoomWithRide = ChatRoom & {
  ride: Ride;
};

// Mock data - Replace with actual Supabase query
const mockChatRooms: ChatRoomWithRide[] = [
  {
    id: "1",
    ride_id: "ride-1",
    status: "active",
    created_at: new Date().toISOString(),
    ride: {
      id: "ride-1",
      created_by_user_id: "user-1",
      origin: "Campus Gate",
      destination: "Railway Station",
      departure_date: new Date(Date.now() + 86400000).toISOString(),
      total_seats: 4,
      available_seats: 2,
      total_cost: 200,
      cost_per_person: 50,
      vehicle_type: "Car",
      status: "active",
      created_at: new Date().toISOString(),
    },
  },
  {
    id: "2",
    ride_id: "ride-2",
    status: "active",
    created_at: new Date().toISOString(),
    ride: {
      id: "ride-2",
      created_by_user_id: "user-2",
      origin: "Library",
      destination: "Airport",
      departure_date: new Date(Date.now() + 172800000).toISOString(),
      total_seats: 3,
      available_seats: 1,
      total_cost: 500,
      cost_per_person: 167,
      vehicle_type: "SUV",
      status: "active",
      created_at: new Date().toISOString(),
    },
  },
];

export default function MessagesScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const [chatRooms, setChatRooms] = useState<ChatRoomWithRide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual Supabase query to fetch chat rooms
    // Example query:
    // const { data, error } = await supabase
    //   .from('chat_rooms')
    //   .select(`
    //     *,
    //     ride:rides(*)
    //   `)
    //   .eq('ride.bookings.user_id', currentUserId)
    //   .eq('status', 'active');

    // Simulating API call with mock data
    setTimeout(() => {
      setChatRooms(mockChatRooms);
      setLoading(false);
    }, 500);
  }, []);

  const renderChatItem = useCallback(
    ({ item }: { item: ChatRoomWithRide }) => (
      <Link href={`/message/${item.id}`} asChild>
        <Pressable>
          <ChatRoomCard item={item} />
        </Pressable>
      </Link>
    ),
    [],
  );

  const ItemSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  const renderEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <MessageCircle color={colors.tabIconDefault} size={64} />
        <Text style={[styles.emptyText, { color: colors.text }]}>
          No chats yet
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
          Join a ride to start chatting with other passengers
        </Text>
      </View>
    ),
    [colors],
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={{ color: colors.text }}>Loading chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={chatRooms}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ItemSeparator}
        contentInsetAdjustmentBehavior="automatic"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingVertical: 15,
  },
  separator: {
    height: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
    gap: 12,
  },
  emptyText: {
    fontSize: 23,
    fontWeight: "600",
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
