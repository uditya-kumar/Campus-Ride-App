import ChatRoomCard from "@/components/rideComponents/ChatRoomCard";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Tables } from "@/database.types";
import { FlashList } from "@shopify/flash-list";
import { Link } from "expo-router";
import { MessageCircle } from "lucide-react-native";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import mockChatRooms from "@assets/data/chat";

type ChatRoom = Tables<"chat_rooms">;
type Ride = Tables<"rides">;

type ChatRoomWithRide = ChatRoom & {
  ride: Ride;
};

export default function MessagesScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const renderChatItem = useCallback(
    ({ item }: { item: ChatRoomWithRide }) => (
      <Link href={`/message/${item.id}`} asChild>
        <Pressable style={{ marginBottom: 14 }}>
          <ChatRoomCard item={item} />
        </Pressable>
      </Link>
    ),
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

  return (
    <View style={styles.container}>
      <FlashList
        data={mockChatRooms}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContent}
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
    paddingVertical: 200,
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
