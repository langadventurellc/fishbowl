import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function Dashboard() {
  return (
    <View style={styles.container} testID="Dashboard.container">
      <Text style={styles.title} testID="Dashboard.title">
        Hello from Fishbowl Mobile!
      </Text>
      <Text style={styles.subtitle} testID="Dashboard.subtitle">
        Dashboard Screen
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
});
