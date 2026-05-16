import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type View as RNView,
} from "react-native";

type DropdownProps = {
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
  labelText: string;
  placeholder?: string;
};

type TriggerLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function Dropdown({
  options,
  selectedOption,
  onSelect,
  labelText,
  placeholder,
}: DropdownProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState<TriggerLayout | null>(
    null,
  );
  const triggerRef = useRef<RNView>(null);

  const openDropdown = () => {
    // measure trigger position in screen coordinates so the menu can sit under it
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setTriggerLayout({ x, y, width, height });
      setDropdownVisible(true);
    });
  };

  const closeDropdown = () => {
    setDropdownVisible(false);
  };

  const handleSelect = (option: string) => {
    onSelect(option);
    closeDropdown();
  };

  const dynamicStyles = {
    label: { color: colors.text },
    selector: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderColor,
    },
    selectorText: {
      color: selectedOption ? colors.text : colors.tabIconDefault,
    },
    dropdownBox: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderColor,
    },
  };

  const dropdownPositionStyle = triggerLayout
    ? {
        top: triggerLayout.y + triggerLayout.height + 45,
        left: triggerLayout.x,
        width: triggerLayout.width,
      }
    : null;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, dynamicStyles.label]}>{labelText}</Text>
      <Pressable
        ref={triggerRef}
        style={[styles.selector, dynamicStyles.selector]}
        onPress={openDropdown}
      >
        <Text style={[styles.selectorText, dynamicStyles.selectorText]}>
          {selectedOption || placeholder || ""}
        </Text>
        {dropdownVisible ? (
          <ChevronUp size={15} color={colors.text} />
        ) : (
          <ChevronDown size={15} color={colors.text} />
        )}
      </Pressable>

      <Modal
        transparent
        visible={dropdownVisible}
        animationType="none"
        onRequestClose={closeDropdown}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={closeDropdown}>
          {dropdownPositionStyle && (
            <View
              style={[
                styles.dropdownBox,
                dynamicStyles.dropdownBox,
                dropdownPositionStyle,
              ]}
            >
              {options.map((option, index) => {
                const isSelected = selectedOption === option;
                const isLast = index === options.length - 1;
                return (
                  <Pressable
                    key={option}
                    onPress={() => handleSelect(option)}
                    style={[
                      styles.optionItem,
                      !isLast && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.borderColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: isSelected ? colors.tint : colors.text,
                          fontWeight: isSelected ? "600" : "400",
                        },
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

export default Dropdown;

const styles = StyleSheet.create({
  container: {
    gap: 8,
    width: 150,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectorText: {
    flex: 1,
    fontSize: 13,
  },
  dropdownBox: {
    position: "absolute",
    borderRadius: 10,
    borderWidth: 1,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.25)",
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 14,
  },
});
