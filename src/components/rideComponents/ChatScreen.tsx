import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { SendHorizontal } from "lucide-react-native";
import { useState } from "react";
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

function ChatScreen({
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

  const user = {
    _id: currentUserId,
    name: currentUserName,
  };

  const onSend = (newMessages: IMessage[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages),
    );
    onSendMessage?.(newMessages);
  };

  const messageContainerStyle = {
    left: { alignItems: "center" as const },
    right: { alignItems: "center" as const },
  };

  const renderMessage = (props: MessageProps<IMessage>) => {
    return <Message {...props} containerStyle={messageContainerStyle} />;
  };

  const bubbleWrapperStyle = {
    left: {
      backgroundColor: colorScheme === "dark" ? "#2C2C2E" : "#F0F0F0",
      paddingBottom: 0,
    },
    right: {
      backgroundColor: colorScheme === "dark" ? "#0A84FF" : "#007AFF",
      paddingBottom: 0,
    },
  };

  const bubbleTextStyle = {
    left: {
      color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
      fontSize: 14,
    },
    right: {
      color: "#FFFFFF",
      fontSize: 14,
    },
  };

  const bubbleTimeTextStyle = {
    left: {
      color: colorScheme === "dark" ? "#8E8E93" : "#999999",
    },
    right: {
      color: "rgba(255,255,255,0.7)",
    },
  };

  const usernameColor = colorScheme === "dark" ? "#8E8E93" : "#666666";

  const renderBubble = (props: BubbleProps<IMessage>) => {
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
  };

  const avatarContainerStyle = {
    left: { marginRight: 2, alignSelf: "center" as const },
    right: { marginLeft: 2, alignSelf: "center" as const },
  };

  const avatarImageStyle = {
    left: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderCurve: "continuous" as const,
    },
    right: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderCurve: "continuous" as const,
    },
  };

  const renderAvatar = (props: AvatarProps<IMessage>) => {
    return (
      <Avatar
        {...props}
        containerStyle={avatarContainerStyle}
        imageStyle={avatarImageStyle}
      />
    );
  };

  const renderSend = (props: SendProps<IMessage>) => {
    return (
      <Send {...props} containerStyle={styles.sendContainer}>
        <View style={styles.sendButton}>
          <SendHorizontal size={24} color={colors.buttonBackground} />
        </View>
      </Send>
    );
  };

  const renderChatEmpty = () => (
    <View style={styles.emptyChatContainer}>
      <Text style={[styles.emptyChatText, { color: colors.text }]}>
        No messages yet. Say hello! 👋
      </Text>
    </View>
  );

  const onSwipe = (message: IMessage) => {
    setReplyMessage({
      _id: message._id,
      text: message.text,
      user: message.user,
    });
  };

  const replyConfig = {
    message: replyMessage,
    onClear: () => setReplyMessage(null),
    swipe: {
      isEnabled: true,
      direction: "right" as const,
      onSwipe,
    },
  };

  const messagesContainerStyle = [
    styles.messagesContainer,
    { backgroundColor: colorScheme === "dark" ? "#000000" : "#FFFFFF" },
  ];

  const textInputProps = {
    style: [
      styles.textInput,
      { color: colorScheme === "dark" ? "#FFFFFF" : "#000000" },
    ],
    placeholderTextColor: colorScheme === "dark" ? "#8E8E93" : "#999999",
    placeholder: "Type a message...",
  };

  const keyboardAvoidingProps = { keyboardVerticalOffset };

  const containerStyle = [styles.container, { backgroundColor: colors.background }];

  const listProps = {
    removeClippedSubviews: true,
    maxToRenderPerBatch: 10,
    updateCellsBatchingPeriod: 50,
    windowSize: 21,
    initialNumToRender: 15,
  };

  return (
    <View style={containerStyle}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={user}
        renderBubble={renderBubble}
        renderMessage={renderMessage}
        renderAvatar={renderAvatar}
        timeTextStyle={bubbleTimeTextStyle}
        renderSend={renderSend}
        renderChatEmpty={renderChatEmpty}
        reply={replyConfig}
        messagesContainerStyle={messagesContainerStyle}
        textInputProps={textInputProps}
        keyboardAvoidingViewProps={keyboardAvoidingProps}
        listProps={listProps}
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

export default ChatScreen;

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
