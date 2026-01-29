import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { SendHorizontal } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import {
  Avatar,
  AvatarProps,
  Bubble,
  BubbleProps,
  GiftedChat,
  IMessage,
  Message,
  MessageProps,
  Send,
  SendProps,
} from "react-native-gifted-chat";

interface ReplyMessage {
  _id: string | number;
  text: string;
  user: IMessage["user"];
}

interface ChatScreenProps {
  messages: IMessage[];
  currentUserId: string;
  currentUserName?: string;
  onSendMessage?: (messages: IMessage[]) => void;
  keyboardVerticalOffset?: number;
}

export default function ChatScreen({
  messages: initialMessages,
  currentUserId,
  currentUserName = "You",
  onSendMessage,
  keyboardVerticalOffset = 0,
}: ChatScreenProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [messages, setMessages] = useState<IMessage[]>(initialMessages);
  const [replyMessage, setReplyMessage] = useState<ReplyMessage | null>(null);

  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, newMessages),
      );
      onSendMessage?.(newMessages);
    },
    [onSendMessage],
  );

  // Add this renderMessage callback
  const renderMessage = useCallback((props: MessageProps<IMessage>) => {
    return (
      <Message
        {...props}
        containerStyle={{
          left: { alignItems: "center" }, // Centers avatar vertically with bubble
          right: { alignItems: "center" },
        }}
      />
    );
  }, []);

  // Memoized styles for bubble to prevent recreation on each render
  const bubbleWrapperStyle = useMemo(
    () => ({
      left: {
        backgroundColor: colorScheme === "dark" ? "#2C2C2E" : "#F0F0F0",
        paddingBottom: 0,
      },
      right: {
        backgroundColor: colorScheme === "dark" ? "#0A84FF" : "#007AFF",
        paddingBottom: 0,
      },
    }),
    [colorScheme],
  );

  const bubbleTextStyle = useMemo(
    () => ({
      left: {
        color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
        fontSize: 14,
      },
      right: {
        color: "#FFFFFF",
        fontSize: 14,
      },
    }),
    [colorScheme],
  );

  const bubbleTimeTextStyle = useMemo(
    () => ({
      left: {
        color: colorScheme === "dark" ? "#8E8E93" : "#999999",
      },
      right: {
        color: "rgba(255,255,255,0.7)",
      },
    }),
    [colorScheme],
  );

  const usernameColor = useMemo(
    () => (colorScheme === "dark" ? "#8E8E93" : "#666666"),
    [colorScheme],
  );

  const renderBubble = useCallback(
    (props: BubbleProps<IMessage>) => {
      const { currentMessage } = props;
      const isCurrentUser = currentMessage?.user?._id === currentUserId;

      return (
        <Bubble
          {...props}
          renderUsername={() =>
            !isCurrentUser ? (
              <View style={styles.usernameContainer}>
                <Text style={[styles.username, { color: usernameColor }]}>
                  {currentMessage?.user?.name}
                </Text>
              </View>
            ) : null
          }
          wrapperStyle={bubbleWrapperStyle}
          textStyle={bubbleTextStyle}
        />
      );
    },
    [bubbleWrapperStyle, bubbleTextStyle, usernameColor, currentUserId],
  );

  // Memoized avatar styles
  const avatarContainerStyle = useMemo(
    () => ({
      left: { marginRight: 2, alignSelf: "center" as const },
      right: { marginLeft: 2, alignSelf: "center" as const },
    }),
    [],
  );

  const avatarImageStyle = useMemo(
    () => ({
      left: { width: 36, height: 36, borderRadius: 18 },
      right: { width: 36, height: 36, borderRadius: 18 },
    }),
    [],
  );

  const renderAvatar = useCallback(
    (props: AvatarProps<IMessage>) => {
      return (
        <Avatar
          {...props}
          containerStyle={avatarContainerStyle}
          imageStyle={avatarImageStyle}
        />
      );
    },
    [avatarContainerStyle, avatarImageStyle],
  );

  const renderSend = useCallback(
    (props: SendProps<IMessage>) => {
      return (
        <Send {...props} containerStyle={styles.sendContainer}>
          <View style={styles.sendButton}>
            <SendHorizontal size={24} color={colors.buttonBackground} />
          </View>
        </Send>
      );
    },
    [colors.buttonBackground],
  );

  // Empty chat placeholder
  const renderChatEmpty = useCallback(
    () => (
      <View style={styles.emptyChatContainer}>
        <Text style={[styles.emptyChatText, { color: colors.text }]}>
          No messages yet. Say hello! 👋
        </Text>
      </View>
    ),
    [colors.text],
  );

  const onSwipe = useCallback((message: IMessage) => {
    setReplyMessage({
      _id: message._id,
      text: message.text,
      user: message.user,
    });
  }, []);

  // Swipe-to-reply configuration
  const replyConfig = useMemo(
    () => ({
      message: replyMessage,
      onClear: () => setReplyMessage(null),
      swipe: {
        isEnabled: true,
        direction: "right" as const,
        onSwipe,
      },
    }),
    [replyMessage, onSwipe],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: currentUserId,
          name: currentUserName,
        }}
        renderBubble={renderBubble}
        renderMessage={renderMessage}
        renderAvatar={renderAvatar}
        timeTextStyle={bubbleTimeTextStyle}
        renderSend={renderSend}
        renderChatEmpty={renderChatEmpty}
        reply={replyConfig}
        messagesContainerStyle={[
          styles.messagesContainer,
          { backgroundColor: colorScheme === "dark" ? "#000000" : "#FFFFFF" },
        ]}
        textInputProps={{
          style: [
            styles.textInput,
            { color: colorScheme === "dark" ? "#FFFFFF" : "#000000" },
          ],
          placeholderTextColor: colorScheme === "dark" ? "#8E8E93" : "#999999",
          placeholder: "Type a message...",
        }}
        keyboardAvoidingViewProps={{ keyboardVerticalOffset }}
        minInputToolbarHeight={60}
        minComposerHeight={40}
        maxComposerHeight={120}
        isUserAvatarVisible={false}
        isAvatarVisibleForEveryMessage={false}
        isUsernameVisible={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    paddingBottom: 2,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 20,
    marginTop: Platform.select({ ios: 8, android: 5 }),
    marginBottom: Platform.select({ ios: 8, android: 5 }),
    paddingHorizontal: 16,
  },
  sendContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
  },
  usernameContainer: {
    marginLeft: 1,
    marginBottom: 4,
  },
  username: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyChatContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ scaleY: -1 }],
  },
  emptyChatText: {
    fontSize: 16,
    textAlign: "center",
  },
});
