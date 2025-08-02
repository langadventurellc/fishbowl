import { Link } from "react-router-dom";
import React from "react";

// Simple logging for renderer process to avoid Node.js compatibility issues
const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(`[INFO] ${message}`, data ? JSON.stringify(data) : "");
  },
  debug: (message: string, data?: Record<string, unknown>) => {
    console.log(`[DEBUG] ${message}`, data ? JSON.stringify(data) : "");
  },
};

export default function Home() {
  const electronAPI = window?.electronAPI;

  React.useEffect(() => {
    logger.info("Home page rendered", {
      electronIntegration: !!electronAPI,
      platform: electronAPI?.platform,
      electronVersion: electronAPI?.versions?.electron,
    });
  }, [electronAPI]);

  const handleLinkClick = (destination: string) => {
    logger.debug("Navigation link clicked", { destination });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f5f5",
      }}
    >
      <h1
        style={{
          fontSize: "3rem",
          color: "#333",
          marginBottom: "1rem",
        }}
      >
        Hello World!
      </h1>
      <p
        style={{
          fontSize: "1.2rem",
          color: "#666",
          marginBottom: "2rem",
        }}
      >
        Welcome to Fishbowl Desktop
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <Link
          to="/showcase/components"
          onClick={() => handleLinkClick("/showcase/components")}
          style={{
            fontSize: "1.1rem",
            padding: "12px 24px",
            backgroundColor: "#3b82f6",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "500",
            textAlign: "center",
          }}
        >
          📚 Component Showcase
        </Link>

        <Link
          to="/showcase/layout"
          onClick={() => handleLinkClick("/showcase/layout")}
          style={{
            fontSize: "1.1rem",
            padding: "12px 24px",
            backgroundColor: "#22c55e",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "500",
            textAlign: "center",
          }}
        >
          🏗️ Layout Showcase
        </Link>
      </div>

      {electronAPI && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#28a745", fontWeight: "bold" }}>
            ✅ Electron Integration Working
          </p>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>
            Platform: {electronAPI.platform}
          </p>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>
            Electron: {electronAPI.versions.electron}
          </p>
        </div>
      )}
    </div>
  );
}
