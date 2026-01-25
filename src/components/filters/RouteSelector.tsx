import LocationSelectorModal from "@/components/LocationSelectorModal";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { CircleDot, MapPin, X } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);

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
            <CircleDot color={colors.text} size={16} strokeWidth={2.5} />
          </View>
          <View style={styles.locationContent}>
            <Text style={[styles.label, { color: colors.text }]}>Pick-up</Text>
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
              <X size = {15} color={colors.tabIconDefault}/>
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
            <MapPin color={colors.text} size={16} strokeWidth={2.5} />
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
              <X size = {15} color={colors.tabIconDefault}/>
            </Pressable>
          )}
        </View>
      </View>

      <LocationSelectorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        locations={locations}
        selectionMode={selectionMode}
        selectedLocation={selectionMode === "origin" ? origin : destination}
        onSelectLocation={handleSelect}
      />
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
});
