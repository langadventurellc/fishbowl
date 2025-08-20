/**
 * Unit tests for App component.
 *
 * Tests theme loading on startup, routing, and error handling.
 * Ensures themes are applied correctly when settings are loaded.
 *
 * @module App.test
 */

import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import App from "./App";

// Mock all dependencies
jest.mock("@fishbowl-ai/ui-shared", () => ({
  useSettingsModal: jest.fn(() => ({
    isOpen: false,
    openModal: jest.fn(),
    closeModal: jest.fn(),
  })),
}));

jest.mock("./hooks/useElectronIPC", () => ({
  useElectronIPC: jest.fn(),
}));

jest.mock("./utils/testHelpers", () => ({
  setupTestHelpers: jest.fn(),
}));

jest.mock("./utils/applyTheme", () => ({
  applyTheme: jest.fn(),
}));

jest.mock("./adapters/useDesktopSettingsPersistence", () => ({
  useDesktopSettingsPersistence: jest.fn(),
}));

// Mock pages
jest.mock("./pages/Home", () => {
  return function MockHome() {
    return <div data-testid="home-page">Home Page</div>;
  };
});

jest.mock("./pages/showcase/ComponentShowcase", () => {
  return function MockComponentShowcase() {
    return <div data-testid="component-showcase">Component Showcase</div>;
  };
});

jest.mock("./pages/showcase/LayoutShowcase", () => {
  return function MockLayoutShowcase() {
    return <div data-testid="layout-showcase">Layout Showcase</div>;
  };
});

// Mock SettingsModal
jest.mock("./components/settings/SettingsModal", () => ({
  SettingsModal: jest.fn(({ open }) =>
    open ? <div data-testid="settings-modal">Settings Modal</div> : null,
  ),
}));

// Mock contexts
jest.mock("./contexts", () => ({
  SettingsProvider: jest.fn(({ children }) => (
    <div data-testid="settings-provider">{children}</div>
  )),
  RolesProvider: jest.fn(({ children }) => (
    <div data-testid="roles-provider">{children}</div>
  )),
  PersonalitiesProvider: jest.fn(({ children }) => (
    <div data-testid="personalities-provider">{children}</div>
  )),
  AgentsProvider: jest.fn(({ children }) => (
    <div data-testid="agents-provider">{children}</div>
  )),
  useServices: jest.fn(() => ({
    logger: {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
    cryptoUtils: {
      randomBytes: jest.fn(),
      generateId: jest.fn(),
      getByteLength: jest.fn(),
    },
    deviceInfo: {
      getDeviceInfo: jest.fn(),
    },
  })),
}));

// Mock logger
jest.mock("@fishbowl-ai/shared", () => ({
  createLoggerSync: jest.fn(() => ({
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  })),
}));

import { useSettingsModal } from "@fishbowl-ai/ui-shared";
import { useElectronIPC } from "./hooks/useElectronIPC";
import { setupTestHelpers } from "./utils/testHelpers";
import { applyTheme } from "./utils/applyTheme";
import { useDesktopSettingsPersistence } from "./adapters/useDesktopSettingsPersistence";

const mockUseSettingsModal = useSettingsModal as jest.MockedFunction<
  typeof useSettingsModal
>;
const mockUseElectronIPC = useElectronIPC as jest.MockedFunction<
  typeof useElectronIPC
>;
const mockSetupTestHelpers = setupTestHelpers as jest.MockedFunction<
  typeof setupTestHelpers
>;
const mockApplyTheme = applyTheme as jest.MockedFunction<typeof applyTheme>;
const mockUseDesktopSettingsPersistence =
  useDesktopSettingsPersistence as jest.MockedFunction<
    typeof useDesktopSettingsPersistence
  >;

// Helper to create complete mock settings
const createMockSettings = (theme: "light" | "dark" | "system" = "light") => ({
  general: {
    autoMode: {
      enabled: false,
      responseDelay: 2,
      maxMessages: 10,
      maxWaitTime: 30,
    },
    conversationDefaults: { defaultMode: "manual" as const, maxAgents: 5 },
    updates: { checkForUpdates: true },
  },
  appearance: {
    theme,
    accentColor: "#007AFF",
    fontScale: 100,
  },
  advanced: {
    developer: { debugLogging: false },
    experimental: { enableExperimentalFeatures: false },
  },
});

// Helper to create complete mock hook return
const createMockHookReturn = (settings: any = null) => ({
  settings,
  isLoading: false,
  error: null,
  saveSettings: jest.fn(),
  loadSettings: jest.fn(),
  resetSettings: jest.fn(),
});

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockUseSettingsModal.mockReturnValue({
      isOpen: false,
      openModal: jest.fn(),
      closeModal: jest.fn(),
    });

    mockUseElectronIPC.mockReturnValue(undefined);
    mockSetupTestHelpers.mockReturnValue(undefined);

    mockUseDesktopSettingsPersistence.mockReturnValue(createMockHookReturn());

    // Mock window.electronAPI
    Object.defineProperty(window, "electronAPI", {
      value: { platform: "darwin" },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Theme Loading on Startup", () => {
    it("should load and apply theme when settings contain appearance theme", async () => {
      const mockSettings = createMockSettings("dark");
      mockUseDesktopSettingsPersistence.mockReturnValue(
        createMockHookReturn(mockSettings),
      );

      render(<App />);

      await waitFor(() => {
        expect(mockApplyTheme).toHaveBeenCalledWith("dark");
      });
    });

    it("should apply light theme when specified", async () => {
      const mockSettings = createMockSettings("light");
      mockUseDesktopSettingsPersistence.mockReturnValue(
        createMockHookReturn(mockSettings),
      );

      render(<App />);

      await waitFor(() => {
        expect(mockApplyTheme).toHaveBeenCalledWith("light");
      });
    });

    it("should apply system theme when specified", async () => {
      const mockSettings = createMockSettings("system");
      mockUseDesktopSettingsPersistence.mockReturnValue(
        createMockHookReturn(mockSettings),
      );

      render(<App />);

      await waitFor(() => {
        expect(mockApplyTheme).toHaveBeenCalledWith("system");
      });
    });

    it("should not apply theme when settings are null", async () => {
      mockUseDesktopSettingsPersistence.mockReturnValue(
        createMockHookReturn(null),
      );

      render(<App />);

      // Wait a bit to ensure no theme application happens
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockApplyTheme).not.toHaveBeenCalled();
    });

    it("should not apply theme when appearance settings are undefined", async () => {
      const mockSettings = createMockSettings();
      delete (mockSettings as any).appearance;
      mockUseDesktopSettingsPersistence.mockReturnValue(
        createMockHookReturn(mockSettings),
      );

      render(<App />);

      // Wait a bit to ensure no theme application happens
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockApplyTheme).not.toHaveBeenCalled();
    });

    it("should not apply theme when theme property is missing", async () => {
      const mockSettings = createMockSettings();
      delete (mockSettings.appearance as any).theme;
      mockUseDesktopSettingsPersistence.mockReturnValue(
        createMockHookReturn(mockSettings),
      );

      render(<App />);

      // Wait a bit to ensure no theme application happens
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockApplyTheme).not.toHaveBeenCalled();
    });

    it("should handle applyTheme errors gracefully", async () => {
      const mockSettings = createMockSettings("dark");

      const applyThemeError = new Error("Failed to apply theme");
      mockApplyTheme.mockImplementation(() => {
        throw applyThemeError;
      });

      mockUseDesktopSettingsPersistence.mockReturnValue(
        createMockHookReturn(mockSettings),
      );

      // Mock console.error to avoid noise in test output
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      render(<App />);

      await waitFor(() => {
        expect(mockApplyTheme).toHaveBeenCalledWith("dark");
      });

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it("should reapply theme when settings change", async () => {
      const initialSettings = createMockSettings("light");
      const mockHookReturn = createMockHookReturn(initialSettings);
      mockUseDesktopSettingsPersistence.mockReturnValue(mockHookReturn);

      const { rerender } = render(<App />);

      await waitFor(() => {
        expect(mockApplyTheme).toHaveBeenCalledWith("light");
      });

      // Update settings
      const updatedSettings = createMockSettings("dark");
      mockUseDesktopSettingsPersistence.mockReturnValue(
        createMockHookReturn(updatedSettings),
      );

      rerender(<App />);

      await waitFor(() => {
        expect(mockApplyTheme).toHaveBeenCalledWith("dark");
      });

      // Should have been called twice
      expect(mockApplyTheme).toHaveBeenCalledTimes(2);
    });
  });

  describe("Routing", () => {
    it("should render home page by default", () => {
      render(<App />);
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });

    it("should be wrapped in SettingsProvider, RolesProvider, PersonalitiesProvider, and AgentsProvider", () => {
      render(<App />);
      expect(screen.getByTestId("settings-provider")).toBeInTheDocument();
      expect(screen.getByTestId("roles-provider")).toBeInTheDocument();
      expect(screen.getByTestId("personalities-provider")).toBeInTheDocument();
      expect(screen.getByTestId("agents-provider")).toBeInTheDocument();
    });
  });

  describe("Settings Modal", () => {
    it("should render settings modal when open", () => {
      mockUseSettingsModal.mockReturnValue({
        isOpen: true,
        openModal: jest.fn(),
        closeModal: jest.fn(),
      });

      render(<App />);

      expect(screen.getByTestId("settings-modal")).toBeInTheDocument();
    });

    it("should not render settings modal when closed", () => {
      mockUseSettingsModal.mockReturnValue({
        isOpen: false,
        openModal: jest.fn(),
        closeModal: jest.fn(),
      });

      render(<App />);

      expect(screen.queryByTestId("settings-modal")).not.toBeInTheDocument();
    });
  });

  describe("Hooks Integration", () => {
    it("should call useElectronIPC hook", () => {
      render(<App />);
      expect(mockUseElectronIPC).toHaveBeenCalled();
    });

    it("should call useDesktopSettingsPersistence hook", () => {
      render(<App />);
      expect(mockUseDesktopSettingsPersistence).toHaveBeenCalled();
    });

    it("should call setupTestHelpers on mount", () => {
      render(<App />);
      expect(mockSetupTestHelpers).toHaveBeenCalled();
    });
  });
});
