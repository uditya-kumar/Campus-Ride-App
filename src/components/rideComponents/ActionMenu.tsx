import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

type ActionItem = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  items: ActionItem[];
  // Anchor the menu under this screen-space coordinate.
  anchor: { top: number; right: number };
};

export default function ActionMenu({ visible, onClose, items, anchor }: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <Modal transparent statusBarTranslucent visible={visible} animationType="none" onRequestClose={onClose}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <View
          style={[
            styles.menu,
            {
              top: anchor.top,
              right: anchor.right,
              backgroundColor: colors.cardBackground,
              borderColor: colors.borderColor,
            },
          ]}
        >
          {items.map((item, idx) => (
            <Pressable
              key={item.label}
              onPress={() => {
                onClose();
                item.onPress();
              }}
              style={[
                styles.item,
                idx < items.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.borderColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.label,
                  { color: item.destructive ? colors.error : colors.text },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    minWidth: 160,
    borderRadius: 12,
    borderWidth: 1,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
  },
});