import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";

// Simple logging for mobile to avoid Node.js compatibility issues
const logger = {
  debug: (message: string, data?: Record<string, unknown>) => {
    console.log(`[DEBUG] ${message}`, data ? JSON.stringify(data) : "");
  },
};

export function Settings() {
  React.useEffect(() => {
    logger.debug("Settings screen mounted", {
      platformVersion: Platform.Version,
      timestamp: new Date().toISOString(),
    });

    return () => {
      logger.debug("Settings screen unmounted");
    };
  }, []);
  return (
    <View style={styles.container} testID="Settings.container">
      <Text style={styles.title} testID="Settings.title">
        Hello from Fishbowl Mobile!
      </Text>
      <Text style={styles.subtitle} testID="Settings.subtitle">
        Settings Screen
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
