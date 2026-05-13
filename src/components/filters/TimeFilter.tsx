import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { X } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

type TimeFilterProps = {
  selectedTime: string | null; // "HH:mm" 24h
  onSelectTime: (time: string | null) => void;
  labelText: string;
};

// "HH:mm" → Date (today at that time, local)
const parseTime = (t: string): Date => {
  const [h, m] = t.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

// Date → "HH:mm"
const formatTime = (d: Date): string => {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

// "HH:mm" → "9:30 AM" for display
const displayTime = (t: string): string => {
  const [hh, mm] = t.split(":").map(Number);
  const ampm = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${ampm}`;
};

export default function TimeFilter({ selectedTime, onSelectTime, labelText }: TimeFilterProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{labelText}</Text>
      <Pressable
        style={[styles.selector, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}
        onPress={() => setShowPicker(true)}
      >
        <Text style={[styles.selectorText, { color: selectedTime ? colors.text : colors.tabIconDefault }]}>
          {selectedTime ? displayTime(selectedTime) : "Select time"}
        </Text>
        {selectedTime && (
          <Pressable onPress={() => onSelectTime(null)} style={styles.clearButton}>
            <X size={14} color={colors.tabIconDefault} />
          </Pressable>
        )}
      </Pressable>

      <DateTimePickerModal
        isVisible={showPicker}
        mode="time"
        date={selectedTime ? parseTime(selectedTime) : new Date()}
        onConfirm={(d) => { onSelectTime(formatTime(d)); setShowPicker(false); }}
        onCancel={() => setShowPicker(false)}
        isDarkModeEnabled={colorScheme === "dark"}
        is24Hour={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 140, gap: 8 },
  label: { fontSize: 14, fontWeight: "600" },
  selector: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, height: 40, borderRadius: 10, borderWidth: 1,
  },
  selectorText: { flex: 1, fontSize: 14 },
  clearButton: { padding: 4 },
});