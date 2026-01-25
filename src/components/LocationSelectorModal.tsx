import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type LocationSelectorModalProps = {
  visible: boolean;
  onClose: () => void;
  locations: string[];
  selectionMode: "origin" | "destination" | null;
  selectedLocation: string | null;
  onSelectLocation: (location: string) => void;
};

export default function LocationSelectorModal({
  visible,
  onClose,
  locations,
  selectionMode,
  selectedLocation,
  onSelectLocation,
}: LocationSelectorModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLocations = locations.filter((location) =>
    location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelect = (location: string) => {
    onSelectLocation(location);
    setSearchQuery("");
    onClose();
  };

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View
        style={[
          styles.modalOverlay,
          {
            backgroundColor:
              colorScheme === "dark"
                ? "rgba(82, 82, 82, 0.7)"
                : "rgba(177, 177, 177, 0.7)",
          },
        ]}
      >
        <View
          style={[styles.modalContent, { backgroundColor: colors.background }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {selectionMode === "origin"
                ? "Select Pick-up Location"
                : "Select Destination"}
            </Text>
            <Pressable onPress={handleClose}>
              <Text style={[styles.closeButton, { color: colors.tint }]}>
                Done
              </Text>
            </Pressable>
          </View>

          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: colors.cardBackground,
                color: colors.text,
                borderColor: colors.borderColor,
              },
            ]}
            placeholder="Search locations..."
            placeholderTextColor={colors.tabIconDefault}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <ScrollView style={styles.locationList}>
            {filteredLocations.map((location) => {
              const isSelected = selectedLocation === location;
              return (
                <Pressable
                  key={location}
                  style={[
                    styles.locationItem,
                    { backgroundColor: colors.cardBackground },
                  ]}
                  onPress={() => handleSelect(location)}
                >
                  <Text
                    style={[
                      styles.locationItemText,
                      {
                        color: isSelected ? colors.tint : colors.text,
                        fontWeight: isSelected ? "600" : "400",
                      },
                    ]}
                  >
                    {location}
                  </Text>
                </Pressable>
              );
            })}
            {filteredLocations.length === 0 && (
              <Text
                style={[styles.noResults, { color: colors.tabIconDefault }]}
              >
                No locations found
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: "50%",
    maxHeight: "80%",
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
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  locationList: {
    flex: 1,
  },
  locationItem: {
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  locationItemText: {
    fontSize: 16,
  },
  noResults: {
    textAlign: "center",
    paddingVertical: 20,
    fontSize: 16,
  },
});
