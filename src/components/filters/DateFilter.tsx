import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import {
  formatDisplayDateNumeric,
  parseDDMMYYYY,
  toDDMMYYYY,
} from "@/libs/datetime";
import { X } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

type DateFilterProps = {
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  labelText: string;
  maximumDate?: Date;
};

export default function DateFilter({
  selectedDate,
  onSelectDate,
  labelText,
  maximumDate,
}: DateFilterProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const [showPicker, setShowPicker] = useState(false);

  const dateValue = selectedDate ? parseDDMMYYYY(selectedDate) : null;

  const showDatePicker = () => {
    setShowPicker(true);
  };

  const hideDatePicker = () => {
    setShowPicker(false);
  };

  const handleConfirm = (date: Date) => {
    onSelectDate(toDDMMYYYY(date));
    hideDatePicker();
  };

  const handleClear = () => {
    onSelectDate(null);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{labelText}</Text>
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
          {dateValue ? formatDisplayDateNumeric(dateValue) : "Select date"}
        </Text>
        {selectedDate && (
          <Pressable onPress={handleClear} style={styles.clearButton}>
            <X size={14} color={colors.tabIconDefault} />
          </Pressable>
        )}
      </Pressable>

      <DateTimePickerModal
        isVisible={showPicker}
        mode="date"
        date={dateValue || new Date()}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        minimumDate={new Date()}
        maximumDate={maximumDate}
        isDarkModeEnabled={colorScheme === "dark"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 140,
    gap: 8,
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
