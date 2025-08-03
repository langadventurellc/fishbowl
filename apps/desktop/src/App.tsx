import { useSettingsModal } from "@fishbowl-ai/ui-shared";
import { HashRouter, Route, Routes } from "react-router-dom";
import React from "react";
import { SettingsModal } from "./components/settings/SettingsModal";
import { SettingsProvider } from "./contexts";
import { useElectronIPC } from "./hooks/useElectronIPC";
import Home from "./pages/Home";
import ComponentShowcase from "./pages/showcase/ComponentShowcase";
import LayoutShowcase from "./pages/showcase/LayoutShowcase";

// Simple logging for renderer process to avoid Node.js compatibility issues
const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(`[INFO] ${message}`, data ? JSON.stringify(data) : "");
  },
  debug: (message: string, data?: Record<string, unknown>) => {
    console.log(`[DEBUG] ${message}`, data ? JSON.stringify(data) : "");
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn(`[WARN] ${message}`, data ? JSON.stringify(data) : "");
  },
  error: (message: string, error?: Error, data?: Record<string, unknown>) => {
    console.error(
      `[ERROR] ${message}`,
      error,
      data ? JSON.stringify(data) : "",
    );
  },
};

export default function App() {
  // Initialize IPC integration for settings modal
  useElectronIPC();

  // Get settings modal state for rendering
  const { isOpen, closeModal } = useSettingsModal();

  // Log app initialization
  React.useEffect(() => {
    logger.info("Desktop app initialized", {
      routes: ["/", "/showcase/components", "/showcase/layout"],
      platform: window?.electronAPI?.platform,
    });
  }, []);

  // Log settings modal state changes
  React.useEffect(() => {
    logger.debug("Settings modal state changed", { isOpen });
  }, [isOpen]);

  return (
    <SettingsProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/showcase/components" element={<ComponentShowcase />} />
          <Route path="/showcase/layout" element={<LayoutShowcase />} />
        </Routes>
      </HashRouter>

      {/* Settings Modal - rendered globally */}
      <SettingsModal open={isOpen} onOpenChange={closeModal} />
    </SettingsProvider>
  );
}
