import { useColorScheme } from "@/components/useColorScheme";
import ChatScreen from "@/components/rideComponents/ChatScreen";
import Colors from "@/constants/Colors";
import { useHeaderHeight } from "@react-navigation/elements";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useSendMessage } from "@/hooks/useSendMessage";
import { useRide } from "@/hooks/useRide";
import { useAuth } from "@/providers/AuthProvider";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Platform, Pressable, View } from "react-native";
import { IMessage } from "react-native-gifted-chat";
import Entypo from "@expo/vector-icons/Entypo";
import ActionMenu from "@/components/rideComponents/ActionMenu";
import { useLeaveRide } from "@/hooks/useLeaveRide";
import { useState } from "react";
import { Alert } from "react-native";
import { useRideMembers } from "@/hooks/useRideMembers";

const truncate = (s: string, n: number) =>
  s.length > n ? `${s.slice(0, n)}..` : s;

export default function ChatDetails() {
  const { id: rideId } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const headerHeight = useHeaderHeight();
  const { data: ride } = useRide(rideId);
  const { data: messages, isLoading } = useChatMessages(rideId);
  const { mutate: sendMessage } = useSendMessage(rideId);
  const colorScheme = useColorScheme() ?? "light";
  const [menuVisible, setMenuVisible] = useState(false);
  const { mutate: leaveRide, isPending: isLeaving } = useLeaveRide();
  const { data: members } = useRideMembers(rideId);

  const colors = Colors[colorScheme];

  // build the membership Set once
  const memberIds = new Set(members?.map((m) => m.user_id) ?? []);

  const headerTitle = ride
    ? `${truncate(ride.origin, 12)} → ${truncate(ride.destination, 12)}`
    : "Chat";

  const handleExitRide = () => {
    Alert.alert(
      "Leave ride?",
      "You'll lose access to this chat. You can rejoin later if there are seats.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            leaveRide(rideId, {
              onSuccess: () => router.replace("/(tabs)/message"),
              onError: (err) => Alert.alert("Couldn't leave", err.message),
            });
          },
        },
      ],
    );
  };
  const renderHeaderRight = () => (
    <Pressable
      onPress={() => setMenuVisible(true)}
      hitSlop={10}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, paddingRight: 4 })}
    >
      <Entypo name="dots-three-vertical" size={20} color={colors.text} />
    </Pressable>
  );

  const keyboardVerticalOffset = Platform.select({
    ios: headerHeight,
    android: 95,
    default: 0,
  });

  if (isLoading || !session) {
    return (
      <>
        <Stack.Screen
          options={{ title: headerTitle, headerRight: renderHeaderRight }}
        />
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" />
        </View>
      </>
    );
  }

  // Convert DB rows to gifted-chat shape (most recent first because gifted-chat
  // uses an inverted FlatList).
  const giftedMessages: IMessage[] = (messages ?? [])
  .map((m) => ({
    _id: m.id,
    text: m.content,
    createdAt: new Date(m.created_at!),
    user: {
      _id: m.user_id,
      name: memberIds.has(m.user_id)
        ? m.user?.full_name ?? "Unknown"
        : "User left",
    },
  }))
  .reverse();

  const onSend = (newMessages: IMessage[]) => {
    newMessages.forEach((msg) => sendMessage(msg.text));
  };

  return (
    <>
      <Stack.Screen
        options={{ title: headerTitle, headerRight: renderHeaderRight }}
      />
      <ChatScreen
        messages={giftedMessages}
        currentUserId={session.user.id}
        currentUserName="You"
        onSendMessage={onSend}
        keyboardVerticalOffset={keyboardVerticalOffset}
      />
      <ActionMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        anchor={{ top: 54, right: 12 }} // approximate; tune visually
        items={[
          {
            label: "Ride info",
            onPress: () => router.push(`/message/${rideId}/info`),
          },
          {
            label: "Exit ride",
            destructive: true,
            onPress: handleExitRide,
          },
        ]}
      />
    </>
  );
}
