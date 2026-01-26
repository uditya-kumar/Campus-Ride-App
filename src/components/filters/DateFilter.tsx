import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { X } from 'lucide-react-native';

type DateFilterProps = {
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
};

export default function DateFilter({
  selectedDate,
  onSelectDate,
}: DateFilterProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const [showPicker, setShowPicker] = useState(false);

  const showDatePicker = () => {
    setShowPicker(true);
  };

  const hideDatePicker = () => {
    setShowPicker(false);
  };

  const handleConfirm = (date: Date) => {
    onSelectDate(date);
    hideDatePicker();
  };

  const handleClear = () => {
    onSelectDate(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Date</Text>
      <Pressable
        style={[
          styles.selector,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.borderColor,
          },
        ]}
        onPress={showDatePicker}
      >
        <Text
          style={[
            styles.selectorText,
            {
              color: selectedDate ? colors.text : colors.tabIconDefault,
            },
          ]}
        >
          {selectedDate ? formatDate(selectedDate) : "Select date"}
        </Text>
        {selectedDate && (
          <Pressable onPress={handleClear} style={styles.clearButton}>
            <X size = {14} color={colors.tabIconDefault}/>
          </Pressable>
        )}
      </Pressable>

      <DateTimePickerModal
        isVisible={showPicker}
        mode="date"
        date={selectedDate || new Date()}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        minimumDate={new Date()}
        isDarkModeEnabled={colorScheme === "dark"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 140,
    gap: 8
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectorText: {
    flex: 1,
    fontSize: 14,
  },
  clearButton: {
    padding: 4,
  },
});
