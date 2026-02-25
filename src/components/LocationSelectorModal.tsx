import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { FlashList } from "@shopify/flash-list";
import { memo, useCallback, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
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

// Memoized location item to prevent re-renders when other items change
type LocationItemProps = {
  location: string;
  isSelected: boolean;
  onSelect: (location: string) => void;
  colors: {
    cardBackground: string;
    tint: string;
    text: string;
  };
};

const LocationItem = memo(function LocationItem({
  location,
  isSelected,
  onSelect,
  colors,
}: LocationItemProps) {
  const handlePress = useCallback(() => {
    onSelect(location);
  }, [onSelect, location]);

  const itemStyle = useMemo(
    () => ({ backgroundColor: colors.cardBackground }),
    [colors.cardBackground],
  );

  const textStyle = useMemo(
    () => ({
      color: isSelected ? colors.tint : colors.text,
      fontWeight: isSelected ? ("600" as const) : ("400" as const),
    }),
    [isSelected, colors.tint, colors.text],
  );

  return (
    <Pressable style={[styles.locationItem, itemStyle]} onPress={handlePress}>
      <Text style={[styles.locationItemText, textStyle]}>{location}</Text>
    </Pressable>
  );
});

const LocationSelectorModal = memo(function LocationSelectorModal({
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

  // Memoize filtered locations to avoid recalculation on every render
  const filteredLocations = useMemo(
    () =>
      locations.filter((location) =>
        location.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [locations, searchQuery],
  );

  // Stabilize callback references
  const handleSelect = useCallback(
    (location: string) => {
      onSelectLocation(location);
      setSearchQuery("");
      onClose();
    },
    [onSelectLocation, onClose],
  );

  const handleClose = useCallback(() => {
    setSearchQuery("");
    onClose();
  }, [onClose]);

  // Memoize dynamic styles
  const dynamicStyles = useMemo(
    () => ({
      overlay: {
        backgroundColor:
          colorScheme === "dark"
            ? "rgba(82, 82, 82, 0.7)"
            : "rgba(177, 177, 177, 0.7)",
      },
      content: { backgroundColor: colors.background },
      title: { color: colors.text },
      closeButton: { color: colors.tint },
      searchInput: {
        backgroundColor: colors.cardBackground,
        color: colors.text,
        borderColor: colors.borderColor,
      },
      noResults: { color: colors.tabIconDefault },
    }),
    [
      colorScheme,
      colors.background,
      colors.text,
      colors.tint,
      colors.cardBackground,
      colors.borderColor,
      colors.tabIconDefault,
    ],
  );

  // Memoize colors object for LocationItem
  const itemColors = useMemo(
    () => ({
      cardBackground: colors.cardBackground,
      tint: colors.tint,
      text: colors.text,
    }),
    [colors.cardBackground, colors.tint, colors.text],
  );

  // Memoize renderItem for FlashList
  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <LocationItem
        location={item}
        isSelected={selectedLocation === item}
        onSelect={handleSelect}
        colors={itemColors}
      />
    ),
    [selectedLocation, handleSelect, itemColors],
  );

  // Memoize keyExtractor
  const keyExtractor = useCallback((item: string) => item, []);

  // Memoize empty component
  const ListEmptyComponent = useMemo(
    () => (
      <Text style={[styles.noResults, dynamicStyles.noResults]}>
        No locations found
      </Text>
    ),
    [dynamicStyles.noResults],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={[styles.modalOverlay, dynamicStyles.overlay]}>
        <View style={[styles.modalContent, dynamicStyles.content]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, dynamicStyles.title]}>
              {selectionMode === "origin"
                ? "Select Pick-up Location"
                : "Select Destination"}
            </Text>
            <Pressable onPress={handleClose}>
              <Text style={[styles.closeButton, dynamicStyles.closeButton]}>
                Done
              </Text>
            </Pressable>
          </View>

          <TextInput
            style={[styles.searchInput, dynamicStyles.searchInput]}
            placeholder="Search locations..."
            placeholderTextColor={colors.tabIconDefault}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <FlashList
            data={filteredLocations}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListEmptyComponent={ListEmptyComponent}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>
    </Modal>
  );
});

export default LocationSelectorModal;

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
  listContent: {
    paddingBottom: 20,
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
