import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";

// Simple logging for mobile to avoid Node.js compatibility issues
const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(`[INFO] ${message}`, data ? JSON.stringify(data) : "");
  },
  debug: (message: string, data?: Record<string, unknown>) => {
    console.log(`[DEBUG] ${message}`, data ? JSON.stringify(data) : "");
  },
};

export function Dashboard() {
  React.useEffect(() => {
    logger.info("Dashboard screen mounted", {
      platform: Platform.OS,
      platformVersion: Platform.Version,
      timestamp: new Date().toISOString(),
    });
  }, []);
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
