import { useState } from "react";
import DesignPrototype from "./pages/DesignPrototype";

export default function App() {
  const electronAPI = window?.electronAPI;
  const [currentView, setCurrentView] = useState<"home" | "prototype">("home");

  if (currentView === "prototype") {
    return <DesignPrototype />;
  }

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

      <button
        onClick={() => setCurrentView("prototype")}
        style={{
          fontSize: "1.1rem",
          padding: "12px 24px",
          backgroundColor: "#6366f1",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "2rem",
          fontWeight: "500",
        }}
      >
        🎨 View Design Prototype
      </button>

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
