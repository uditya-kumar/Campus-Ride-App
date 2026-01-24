import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

type SortByDropdownProps = {
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
};

export default function SortByDropdown({
  options,
  selectedOption,
  onSelect,
}: SortByDropdownProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (option: string) => {
    onSelect(option);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Sort By</Text>
      <Pressable
        style={[
          styles.selector,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.borderColor,
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.selectorText, { color: colors.text }]}>
          {selectedOption}
        </Text>
      </Pressable>

      {/* Dropdown implementation */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectorText: {
    flex: 1,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  optionList: {
    flex: 1,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
  },
});
