import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { memo, useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type DropdownProps = {
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
  labelText: string;
};

// Memoized option item to prevent re-renders when other options change
type OptionItemProps = {
  option: string;
  isSelected: boolean;
  isLast: boolean;
  onSelect: (option: string) => void;
  colors: {
    tint: string;
    text: string;
    borderColor: string;
  };
};

const OptionItem = memo(function OptionItem({
  option,
  isSelected,
  isLast,
  onSelect,
  colors,
}: OptionItemProps) {
  const handlePress = useCallback(() => {
    onSelect(option);
  }, [onSelect, option]);

  const textStyle = useMemo(
    () => ({
      color: isSelected ? colors.tint : colors.text,
      fontWeight: isSelected ? ("600" as const) : ("400" as const),
    }),
    [isSelected, colors.tint, colors.text],
  );

  const itemStyle = useMemo(
    () =>
      !isLast
        ? { borderBottomWidth: 1, borderBottomColor: colors.borderColor }
        : undefined,
    [isLast, colors.borderColor],
  );

  return (
    <Pressable style={[styles.optionItem, itemStyle]} onPress={handlePress}>
      <Text style={[styles.optionText, textStyle]}>{option}</Text>
    </Pressable>
  );
});

const Dropdown = memo(function Dropdown({
  options,
  selectedOption,
  onSelect,
  labelText,
}: DropdownProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Stabilize callback reference
  const handleSelect = useCallback(
    (option: string) => {
      onSelect(option);
      setDropdownVisible(false);
    },
    [onSelect],
  );

  const toggleDropdown = useCallback(() => {
    setDropdownVisible((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setDropdownVisible(false);
  }, []);

  // Memoize dynamic styles to avoid creating new objects on each render
  const dynamicStyles = useMemo(
    () => ({
      label: { color: colors.text },
      selector: {
        backgroundColor: colors.cardBackground,
        borderColor: colors.borderColor,
      },
      selectorText: { color: colors.text },
      dropdownBox: {
        backgroundColor: colors.cardBackground,
        borderColor: colors.borderColor,
      },
    }),
    [colors.text, colors.cardBackground, colors.borderColor],
  );

  // Memoize colors object for OptionItem to prevent reference changes
  const optionColors = useMemo(
    () => ({
      tint: colors.tint,
      text: colors.text,
      borderColor: colors.borderColor,
    }),
    [colors.tint, colors.text, colors.borderColor],
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.label, dynamicStyles.label]}>{labelText}</Text>
      <View style={styles.dropdownWrapper}>
        <Pressable
          style={[styles.selector, dynamicStyles.selector]}
          onPress={toggleDropdown}
        >
          <Text style={[styles.selectorText, dynamicStyles.selectorText]}>
            {selectedOption}
          </Text>
          {dropdownVisible ? (
            <ChevronUp size={15} color={colors.text} />
          ) : (
            <ChevronDown size={15} color={colors.text} />
          )}
        </Pressable>

        {/* Dropdown Box */}
        {dropdownVisible && (
          <>
            <Pressable style={styles.backdrop} onPress={closeDropdown} />
            <View style={[styles.dropdownBox, dynamicStyles.dropdownBox]}>
              {options.map((option, index) => (
                <OptionItem
                  key={option}
                  option={option}
                  isSelected={selectedOption === option}
                  isLast={index === options.length - 1}
                  onSelect={handleSelect}
                  colors={optionColors}
                />
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );
});

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
  dropdownWrapper: {
    position: "relative",
    zIndex: 1000,
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
  backdrop: {
    position: "absolute",
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 999,
  },
  dropdownBox: {
    position: "absolute",
    top: 44,
    left: 0,
    right: 0,
    borderRadius: 10,
    borderWidth: 1,
    zIndex: 1000,
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
