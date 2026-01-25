import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { CircleDot, MapPin } from "lucide-react-native";
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

type RouteSelectorProps = {
  locations: string[];
  origin: string | null;
  destination: string | null;
  onSelectOrigin: (location: string | null) => void;
  onSelectDestination: (location: string | null) => void;
};

type SelectionMode = "origin" | "destination" | null;

export default function RouteSelector({
  locations,
  origin,
  destination,
  onSelectOrigin,
  onSelectDestination,
}: RouteSelectorProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);

  const filteredLocations = locations.filter((location) =>
    location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const openModal = (mode: "origin" | "destination") => {
    setSelectionMode(mode);
    setModalVisible(true);
  };

  const handleSelect = (location: string) => {
    if (selectionMode === "origin") {
      onSelectOrigin(location);
    } else if (selectionMode === "destination") {
      onSelectDestination(location);
    }
    setModalVisible(false);
    setSearchQuery("");
  };

  const handleClearOrigin = () => {
    onSelectOrigin(null);
  };

  const handleClearDestination = () => {
    onSelectDestination(null);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.borderColor,
          },
        ]}
      >
        {/* Origin */}
        <View style={styles.routeRow}>
          <View style={styles.iconContainer}>
            <CircleDot color={colors.text} size={16} strokeWidth={2.5}/>
          </View>
          <View style={styles.locationContent}>
            <Text style={[styles.label, { color: colors.text }]}>
              Pick-up
            </Text>
            <Pressable
              style={styles.locationButton}
              onPress={() => openModal("origin")}
            >
              <Text
                style={[
                  styles.locationText,
                  {
                    color: origin ? colors.text : colors.tabIconDefault,
                  },
                ]}
              >
                {origin || "Where from?"}
              </Text>
            </Pressable>
          </View>
          {origin && (
            <Pressable onPress={handleClearOrigin} style={styles.clearButton}>
              <Text style={{ color: colors.tabIconDefault, fontSize: 20 }}>
                ×
              </Text>
            </Pressable>
          )}
        </View>

        {/* Connecting Line */}
        <View style={styles.lineContainer}>
          <View
            style={[styles.connectingLine, { backgroundColor: colors.text }]}
          />
        </View>

        {/* Destination */}
        <View style={styles.routeRow}>
          <View style={styles.iconContainer}>
            <MapPin color={colors.text} size={16} strokeWidth={2.5}/>
          </View>
          <View style={styles.locationContent}>
            <Text style={[styles.label, { color: colors.text }]}>
              Destination
            </Text>
            <Pressable
              style={styles.locationButton}
              onPress={() => openModal("destination")}
            >
              <Text
                style={[
                  styles.locationText,
                  {
                    color: destination ? colors.text : colors.tabIconDefault,
                  },
                ]}
              >
                {destination || "Where to?"}
              </Text>
            </Pressable>
          </View>
          {destination && (
            <Pressable
              onPress={handleClearDestination}
              style={styles.clearButton}
            >
              <Text style={{ color: colors.tabIconDefault, fontSize: 20 }}>
                ×
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectionMode === "origin"
                  ? "Select Pick-up Location"
                  : "Select Destination"}
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
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
                const isSelected =
                  selectionMode === "origin"
                    ? origin === location
                    : destination === location;
                return (
                  <Pressable
                    key={location}
                    style={[
                      styles.locationItem,
                      { borderBottomColor: colors.borderColor },
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconContainer: {
    width: 20,
    alignItems: "center",
  },
  locationContent: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  locationButton: {
    paddingVertical: 2,
  },
  locationText: {
    fontSize: 14,
  },
  clearButton: {
    padding: 2,
  },
  lineContainer: {
    flexDirection: "row",
    paddingLeft: 8,
  },
  connectingLine: {
    width: 2,
    height: 20,
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
    borderBottomWidth: 1,
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
