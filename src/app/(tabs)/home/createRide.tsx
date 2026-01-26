import { View, Text } from "react-native";
import React from "react";

const createRide = () => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text
        style={{
          color: "white",
          fontSize: 30
        }}
      >
        createRide
      </Text>
    </View>
  );
};

export default createRide;
