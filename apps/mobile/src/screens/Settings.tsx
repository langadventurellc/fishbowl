import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function Settings() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello from Fishbowl Mobile!</Text>
      <Text style={styles.subtitle}>Settings Screen</Text>
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
