import { useColorScheme } from "@/components/useColorScheme";
import ChatScreen from "@/components/rideComponents/ChatScreen";
import Colors from "@/constants/Colors";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useSendMessage } from "@/hooks/useSendMessage";
import { useRide } from "@/hooks/useRide";
import { useAuth } from "@/providers/AuthProvider";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  View,
  type View as RNView,
} from "react-native";
import { IMessage } from "react-native-gifted-chat";
import Entypo from "@react-native-vector-icons/entypo/static";
import ActionMenu from "@/components/rideComponents/ActionMenu";
import { useLeaveRide } from "@/hooks/useLeaveRide";
import { useRef, useState } from "react";
import { Alert } from "react-native";
import { useRideMembers } from "@/hooks/useRideMembers";
import { useToast } from "@/providers/ToastProvider";

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
  const [menuAnchor, setMenuAnchor] = useState({ top: 54, right: 12 });
  const triggerRef = useRef<RNView>(null);
  const { mutate: leaveRide, isPending: isLeaving } = useLeaveRide();
  const { data: members } = useRideMembers(rideId);
  const { showToast } = useToast();

  const colors = Colors[colorScheme];

  // Build a user_id → full_name map. Used both for membership checks and to
  // resolve sender names — realtime payloads omit the joined `user` field, so
  // looking up by id keeps names visible without waiting for a refetch.
  const memberNames = new Map(
    members?.map((m) => [m.user_id, m.user?.full_name ?? null]) ?? [],
  );

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
              onError: (err) => showToast(err.message),
            });
          },
        },
      ],
    );
  };
  const openMenu = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const screenWidth = Dimensions.get("window").width;
      setMenuAnchor({
        top: y + height + 50,
        right: screenWidth - (x + width),
      });
      setMenuVisible(true);
    });
  };

  const renderHeaderRight = () => (
    <Pressable
      ref={triggerRef}
      onPress={openMenu}
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
  .map((m) => {
    const isMember = memberNames.has(m.user_id);
    const resolvedName =
      memberNames.get(m.user_id) ?? m.user?.full_name ?? "Unknown";
    return {
      _id: m.id,
      text: m.content,
      createdAt: new Date(m.created_at!),
      user: {
        _id: m.user_id,
        name: isMember ? resolvedName : "User left",
      },
    };
  })
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
        anchor={menuAnchor}
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
