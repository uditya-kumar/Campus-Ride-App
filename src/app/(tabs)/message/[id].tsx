import ChatScreen from "@/components/rideComponents/ChatScreen";
import {
  MOCK_CURRENT_USER_ID,
  MOCK_MESSAGES,
  MOCK_PARTICIPANTS,
} from "@assets/data/chatdetailsMock";
import { useHeaderHeight } from "@react-navigation/elements";
import { useLocalSearchParams } from "expo-router";
import { memo, useCallback, useMemo } from "react";
import { Platform } from "react-native";
import { IMessage } from "react-native-gifted-chat";

export default memo(function ChatDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const headerHeight = useHeaderHeight();

  // Memoize keyboard offset - only recalculates when headerHeight changes
  const keyboardVerticalOffset = useMemo(
    () =>
      Platform.select({
        ios: headerHeight,
        android: 95,
        default: 0,
      }),
    [headerHeight]
  );

  // Convert mock messages to GiftedChat format
  const giftedChatMessages: IMessage[] = useMemo(() => {
    return MOCK_MESSAGES.map((msg) => {
      const user = MOCK_PARTICIPANTS.find((p) => p.id === msg.user_id);
      return {
        _id: msg.id,
        text: msg.content,
        createdAt: new Date(msg.created_at!),
        user: {
          _id: msg.user_id,
          name: user?.full_name || "Unknown",
          avatar: user?.avatar_url || undefined,
        },
      };
    }).reverse();
  }, []);

  // Memoize callback to prevent recreation on each render
  const handleSendMessage = useCallback((messages: IMessage[]) => {
    // Handle sending message to backend here
    console.log("Messages sent:", messages);
  }, []);

  return (
    <ChatScreen
      messages={giftedChatMessages}
      currentUserId={MOCK_CURRENT_USER_ID}
      currentUserName="You"
      onSendMessage={handleSendMessage}
      keyboardVerticalOffset={keyboardVerticalOffset}
    />
  );
});
