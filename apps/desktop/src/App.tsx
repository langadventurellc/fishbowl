import { useSettingsModal } from "@fishbowl-ai/ui-shared";
import { HashRouter, Route, Routes } from "react-router-dom";
import React from "react";
import { SettingsModal } from "./components/settings/SettingsModal";
import {
  SettingsProvider,
  RolesProvider,
  PersonalitiesProvider,
  AgentsProvider,
  useServices,
} from "./contexts";
import { RolesErrorBoundary } from "./components/errors/RolesErrorBoundary";
import { useElectronIPC } from "./hooks/useElectronIPC";
import { setupTestHelpers } from "./utils/testHelpers";
import { applyTheme } from "./utils/applyTheme";
import { useDesktopSettingsPersistence } from "./adapters/useDesktopSettingsPersistence";
import Home from "./pages/Home";
import ComponentShowcase from "./pages/showcase/ComponentShowcase";
import LayoutShowcase from "./pages/showcase/LayoutShowcase";

export default function App() {
  // Get configured services from context
  const { logger } = useServices();

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
  }, [settings, logger]);

  // Log app initialization and setup test helpers
  React.useEffect(() => {
    logger.info("Desktop app initialized with structured logger", {
      routes: ["/", "/showcase/components", "/showcase/layout"],
      platform: window?.electronAPI?.platform,
    });

    // Setup test helpers for E2E testing
    setupTestHelpers();
  }, [logger]);

  // Log settings modal state changes
  React.useEffect(() => {
    logger.debug("Settings modal state changed", { isOpen });
  }, [isOpen, logger]);

  return (
    <SettingsProvider>
      <RolesErrorBoundary logger={logger}>
        <RolesProvider>
          <PersonalitiesProvider>
            <AgentsProvider>
              <HashRouter>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route
                    path="/showcase/components"
                    element={<ComponentShowcase />}
                  />
                  <Route path="/showcase/layout" element={<LayoutShowcase />} />
                </Routes>
              </HashRouter>

              {/* Settings Modal - rendered globally */}
              <SettingsModal open={isOpen} onOpenChange={closeModal} />
            </AgentsProvider>
          </PersonalitiesProvider>
        </RolesProvider>
      </RolesErrorBoundary>
    </SettingsProvider>
  );
}
