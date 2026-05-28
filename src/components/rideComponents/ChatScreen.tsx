import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import Ionicons from "@react-native-vector-icons/ionicons/static";
import { Platform, StyleSheet, Text, View } from "react-native";
import type { ReanimatedScrollEvent } from "react-native-reanimated/lib/typescript/hook/commonTypes";
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

interface ChatScreenProps {
  messages: IMessage[];
  currentUserId: string;
  currentUserName?: string;
  onSendMessage?: (messages: IMessage[]) => void;
  keyboardVerticalOffset?: number;
  onScrolledToBottomChange?: (atBottom: boolean) => void;
}

function ChatScreen({
  messages,
  currentUserId,
  currentUserName = "You",
  onSendMessage,
  keyboardVerticalOffset = 0,
  onScrolledToBottomChange,
}: ChatScreenProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const user = {
    _id: currentUserId,
    name: currentUserName,
  };

  const onSend = (newMessages: IMessage[] = []) => {
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
          <Ionicons name="send-sharp" size={24} color={colors.buttonBackground} />
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

  // GiftedChat uses an inverted FlatList — newest messages live at the top
  // visually, which corresponds to scroll offset ~0. "At bottom" (i.e. the
  // user is looking at the most recent message) means contentOffset.y is
  // close to 0. GiftedChat wires this through Reanimated, which flattens
  // `nativeEvent` onto the event itself.
  const handleScroll = (e: ReanimatedScrollEvent) => {
    if (!onScrolledToBottomChange) return;
    const y = e.contentOffset.y;
    onScrolledToBottomChange(y < 60);
  };

  const listProps = {
    removeClippedSubviews: true,
    maxToRenderPerBatch: 10,
    updateCellsBatchingPeriod: 50,
    windowSize: 11,
    initialNumToRender: 8,
    onScroll: handleScroll,
    scrollEventThrottle: 100,
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
        messagesContainerStyle={messagesContainerStyle}
        textInputProps={textInputProps}
        keyboardAvoidingViewProps={keyboardAvoidingProps}
        listProps={listProps}
        isDayAnimationEnabled={false}
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
    // Container is flipped, so paddingBottom (in flipped space) visually
    // pushes the text up. Tune this number to move the placeholder up/down.
    paddingBottom: 20,
    // Un-flip the empty placeholder. GiftedChat's inverted list applies a
    // scaleY transform to its container; without this, the text renders
    // upside-down/mirrored.
    transform: [{ scaleY: -1 }, { scaleX: -1 }],
  },
  emptyChatText: {
    fontSize: 16,
    textAlign: "center",
  },
});
