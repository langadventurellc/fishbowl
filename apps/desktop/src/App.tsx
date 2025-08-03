import { useSettingsModal } from "@fishbowl-ai/ui-shared";
import { HashRouter, Route, Routes } from "react-router-dom";
import React from "react";
import { SettingsModal } from "./components/settings/SettingsModal";
import { SettingsProvider } from "./contexts";
import { useElectronIPC } from "./hooks/useElectronIPC";
import { setupTestHelpers } from "./utils/testHelpers";
import { applyTheme } from "./utils/applyTheme";
import { useDesktopSettingsPersistence } from "./adapters/useDesktopSettingsPersistence";
import Home from "./pages/Home";
import ComponentShowcase from "./pages/showcase/ComponentShowcase";
import LayoutShowcase from "./pages/showcase/LayoutShowcase";
import { createLoggerSync } from "@fishbowl-ai/shared";

// Initialize structured logger for renderer process
const logger = createLoggerSync({
  config: {
    name: "desktop-renderer",
    level: "debug",
  },
});

export default function App() {
  // Initialize IPC integration for settings modal
  useElectronIPC();

  // Get settings modal state for rendering
  const { isOpen, closeModal } = useSettingsModal();

  // Get settings for theme loading
  const { settings } = useDesktopSettingsPersistence();

  // Load and apply theme on startup
  React.useEffect(() => {
    const loadInitialTheme = async () => {
      try {
        if (settings?.appearance?.theme) {
          applyTheme(settings.appearance.theme);
          logger.debug("Applied theme on startup", {
            theme: settings.appearance.theme,
          });
        }
      } catch (error) {
        logger.error(
          "Failed to apply theme on startup",
          error instanceof Error ? error : new Error(String(error)),
        );
        // Silently fail and use default theme from CSS
      }
    };
    loadInitialTheme();
  }, [settings]);

  // Log app initialization and setup test helpers
  React.useEffect(() => {
    logger.info("Desktop app initialized with structured logger", {
      routes: ["/", "/showcase/components", "/showcase/layout"],
      platform: window?.electronAPI?.platform,
    });

    // Setup test helpers for E2E testing
    setupTestHelpers();
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
