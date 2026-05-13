import ChatScreen from "@/components/rideComponents/ChatScreen";
import {
  MOCK_CURRENT_USER_ID,
  MOCK_MESSAGES,
  MOCK_PARTICIPANTS,
} from "@assets/data/chatdetailsMock";
import { useHeaderHeight } from "@react-navigation/elements";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { InteractionManager, Platform, View } from "react-native";
import { IMessage } from "react-native-gifted-chat";

const participantsById = new Map(MOCK_PARTICIPANTS.map((p) => [p.id, p]));

const GIFTED_CHAT_MESSAGES: IMessage[] = MOCK_MESSAGES.map((msg) => {
  const user = participantsById.get(msg.user_id);
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

const handleSendMessage = (messages: IMessage[]) => {
  // Handle sending message to backend here
  console.log("Messages sent:", messages);
};

export default function ChatDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const headerHeight = useHeaderHeight();

  const keyboardVerticalOffset = Platform.select({
    ios: headerHeight,
    android: 95,
    default: 0,
  });

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      setReady(true);
    });
    return () => handle.cancel();
  }, []);

  if (!ready)
    return <View style={{ flex: 1 }} />;

  return (
    <ChatScreen
      messages={GIFTED_CHAT_MESSAGES}
      currentUserId={MOCK_CURRENT_USER_ID}
      currentUserName="You"
      onSendMessage={handleSendMessage}
      keyboardVerticalOffset={keyboardVerticalOffset}
    />
  );
}
