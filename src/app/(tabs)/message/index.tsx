import Chip from "@/components/rideComponents/Chip";
import ChatRoomCard from "@/components/rideComponents/ChatRoomCard";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { FlashList } from "@shopify/flash-list";
import { Link } from "expo-router";
import Feather from '@react-native-vector-icons/feather';
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useMyRides } from "@/hooks/useMyRides";
import type { ChatRide, MyRidesView } from "@/api/rides";

const renderChatItem = ({ item }: { item: ChatRide }) => (
  <Link href={`/message/${item.id}`} asChild withAnchor>
    <Pressable style={styles.chatItemPressable}>
      <ChatRoomCard ride={item} unreadCount={item.unread_count} />
    </Pressable>
  </Link>
);

export default function MessagesScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const [view, setView] = useState<MyRidesView>("upcoming");
  const { data: rides, isLoading, isError, error } = useMyRides(view);

  const emptyTextStyle = [styles.emptyText, { color: colors.text }];
  const emptySubtextStyle = [
    styles.emptySubtext,
    { color: colors.tabIconDefault },
  ];

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Feather name="message-circle" size={74} color={colors.tabIconDefault} />
      <Text style={emptyTextStyle}>
        {view === "upcoming" ? "No upcoming rides" : "No past rides yet"}
      </Text>
      <Text style={emptySubtextStyle}>
        {view === "upcoming"
          ? "Join or create a ride to start chatting."
          : "Past ride chats will show up here."}
      </Text>
    </View>
  );

  let body;
  if (isLoading) {
    body = (
      <View style={[styles.bodyFill, styles.centered]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  } else if (isError) {
    body = (
      <View style={[styles.bodyFill, styles.centered]}>
        <Text style={[styles.emptyText, { color: colors.text }]} selectable>
          Couldn't load chats
        </Text>
        <Text
          style={[styles.emptySubtext, { color: colors.tabIconDefault }]}
          selectable
        >
          {error?.message ?? "Please try again."}
        </Text>
      </View>
    );
  } else {
    body = (
      <FlashList
        data={rides}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContent}
        contentInsetAdjustmentBehavior="automatic"
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.chipsRow}>
        <Chip
          label="Upcoming"
          active={view === "upcoming"}
          onPress={() => setView("upcoming")}
          activeColor={colors.buttonBackground}
          inactiveColor={colors.buttonBackgroundSecondary}
          activeTextColor={colors.buttonText}
        />
        <Chip
          label="Past"
          active={view === "past"}
          onPress={() => setView("past")}
          activeColor={colors.buttonBackground}
          inactiveColor={colors.buttonBackgroundSecondary}
          activeTextColor={colors.buttonText}
        />
      </View>
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 14,
    paddingBottom: 6,
  },
  bodyFill: { flex: 1 },
  centered: { alignItems: "center", justifyContent: "center" },
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
  chatItemPressable: {
    marginBottom: 14,
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
