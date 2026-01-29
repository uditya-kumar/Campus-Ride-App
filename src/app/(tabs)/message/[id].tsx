import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import {
  MOCK_CURRENT_USER_ID,
  MOCK_MESSAGES,
  MOCK_PARTICIPANTS,
} from "@assets/data/chatdetailsMock";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View
} from "react-native";
import {
  Avatar,
  Bubble,
  GiftedChat,
  IMessage,
  Send,
} from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatDetails() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  // Calculate keyboard offset for proper input positioning
  // For Android, we need a larger offset to account for the keyboard
  const tabbarHeight = 60; // Your bottom tab bar height
  const keyboardVerticalOffset = Platform.select({
    ios: insets.bottom + tabbarHeight + 44, // 44 for iOS predictive text bar
    android: insets.bottom + 95, // Larger offset for Android
    default: insets.bottom + 70,
  });

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

  const [messages, setMessages] = useState<IMessage[]>(giftedChatMessages);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages),
    );
  }, []);

  const renderBubble = (props: any) => {
    const { currentMessage } = props;
    const isCurrentUser = currentMessage?.user?._id === MOCK_CURRENT_USER_ID;

    return (
      <Bubble
        {...props}
        renderUsername={() =>
          !isCurrentUser ? (
            <View style={styles.usernameContainer}>
              <Text
                style={[
                  styles.username,
                  { color: colorScheme === "dark" ? "#8E8E93" : "#666666" },
                ]}
              >
                {currentMessage?.user?.name}
              </Text>
            </View>
          ) : null
        }
        wrapperStyle={{
          left: {
            backgroundColor: colorScheme === "dark" ? "#2C2C2E" : "#F0F0F0",
          },
          right: {
            backgroundColor: colorScheme === "dark" ? "#0A84FF" : "#007AFF",
          },
        }}
        textStyle={{
          left: {
            color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
          },
          right: {
            color: "#FFFFFF",
          },
        }}
        timeTextStyle={{
          left: {
            color: colorScheme === "dark" ? "#8E8E93" : "#999999",
          },
          right: {
            color: "rgba(255,255,255,0.7)",
          },
        }}
      />
    );
  };

  const renderAvatar = (props: any) => {
    return (
      <Avatar
        {...props}
        containerStyle={{
          left: { marginRight: 8 },
          right: { marginLeft: 8 },
        }}
        imageStyle={{
          left: { width: 36, height: 36, borderRadius: 18 },
          right: { width: 36, height: 36, borderRadius: 18 },
        }}
      />
    );
  };

  const renderSend = (props: any) => {
    return (
      <Send {...props} containerStyle={styles.sendContainer}>
        <View style={styles.sendButton}>
          <Ionicons name="send" size={24} color="#007AFF" />
        </View>
      </Send>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: MOCK_CURRENT_USER_ID,
          name: "You",
        }}
        renderBubble={renderBubble}
        renderAvatar={renderAvatar}
        renderSend={renderSend}
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
        keyboardAvoidingViewProps={{ keyboardVerticalOffset }} // ← Use this instead
        minInputToolbarHeight={60}
        minComposerHeight={40} // ADD THIS
        maxComposerHeight={120} // ADD THIS
        isUserAvatarVisible={false} // Don't show avatar for current user
        isAvatarVisibleForEveryMessage={false} // Only show for different users
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
    paddingBottom: 8,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 20,
    marginTop: Platform.select({ ios: 8, android: 0 }),
    marginBottom: Platform.select({ ios: 8, android: 0 }),
    paddingHorizontal: 12,
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
    marginLeft: 10,
    marginBottom: 4,
  },
  username: {
    fontSize: 12,
    fontWeight: "600",
  },
});
