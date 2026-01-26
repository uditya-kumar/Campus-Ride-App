import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronUp, ChevronDown  } from 'lucide-react-native';

type DropdownProps = {
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
  labelText: string
};

export default function Dropdown({
  options,
  selectedOption,
  onSelect,
  labelText
}: DropdownProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleSelect = (option: string) => {
    onSelect(option);
    setDropdownVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{labelText}</Text>
      <View style={styles.dropdownWrapper}>
        <Pressable
          style={[
            styles.selector,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.borderColor,
            },
          ]}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Text style={[styles.selectorText, { color: colors.text }]}>
            {selectedOption}
          </Text>
          <Text style={{ color: colors.text }}>
            {dropdownVisible ? <ChevronUp size={15} color={colors.text}/> : <ChevronDown size={15} color={colors.text}/>}
          </Text>
        </Pressable>

        {/* Dropdown Box */}
        {dropdownVisible && (
          <>
            <Pressable
              style={styles.backdrop}
              onPress={() => setDropdownVisible(false)}
            />
            <View
              style={[
                styles.dropdownBox,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.borderColor,
                },
              ]}
            >
              {options.map((option, index) => (
                <Pressable
                  key={option}
                  style={[
                    styles.optionItem,
                    index < options.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.borderColor,
                    },
                  ]}
                  onPress={() => handleSelect(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color:
                          selectedOption === option ? colors.tint : colors.text,
                        fontWeight: selectedOption === option ? "600" : "400",
                      },
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    width: 150
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
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 14,
  },
});
