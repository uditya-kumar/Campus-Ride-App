import { useColorScheme } from "@/components/useColorScheme";
import ChatScreen from "@/components/rideComponents/ChatScreen";
import Colors from "@/constants/Colors";
import { useHeaderHeight } from "@react-navigation/elements";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useSendMessage } from "@/hooks/useSendMessage";
import { useRide } from "@/hooks/useRide";
import { useAuth } from "@/providers/AuthProvider";
import Feather from "@expo/vector-icons/Feather";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Platform, Pressable, View } from "react-native";
import { IMessage } from "react-native-gifted-chat";

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
  const colors = Colors[colorScheme];

  const headerTitle = ride
    ? `${truncate(ride.origin, 12)} → ${truncate(ride.destination, 12)}`
    : "Chat";

  const renderHeaderRight = () => (
    <Pressable
      onPress={() => router.push(`/message/${rideId}/info`)}
      hitSlop={10}
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
        paddingRight: 4,
      })}
    >
      <Feather name="info" size={24} color={colors.text} />
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
        name: m.user?.full_name ?? "Unknown",
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
    </>
  );
}
