import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ProcessDataScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Process Data Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0B2E4F",
  },
});
