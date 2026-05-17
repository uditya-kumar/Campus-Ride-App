import ChatScreen from "@/components/rideComponents/ChatScreen";
import { useHeaderHeight } from "@react-navigation/elements";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useSendMessage } from "@/hooks/useSendMessage";
import { useRide } from "@/hooks/useRide";
import { useAuth } from "@/providers/AuthProvider";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Platform, View } from "react-native";
import { IMessage } from "react-native-gifted-chat";

export default function ChatDetails() {
  const { id: rideId } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const headerHeight = useHeaderHeight();
  const { data: ride } = useRide(rideId);
  const { data: messages, isLoading } = useChatMessages(rideId);
  const { mutate: sendMessage } = useSendMessage(rideId);

  const headerTitle = ride
    ? `${ride.origin} → ${ride.destination}`
    : "Chat";

  const keyboardVerticalOffset = Platform.select({
    ios: headerHeight,
    android: 95,
    default: 0,
  });

  if (isLoading || !session) {
    return (
      <>
        <Stack.Screen options={{ title: headerTitle }} />
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
        name: m.user?.full_name ?? "Unknown",
      },
    }))
    .reverse();

  const onSend = (newMessages: IMessage[]) => {
    newMessages.forEach((msg) => sendMessage(msg.text));
  };

  return (
    <>
      <Stack.Screen options={{ title: headerTitle }} />
      <ChatScreen
        messages={giftedMessages}
        currentUserId={session.user.id}
        currentUserName="You"
        onSendMessage={onSend}
        keyboardVerticalOffset={keyboardVerticalOffset}
      />
    </>
  );
}
