/**
 * Unit tests for the settings modal Zustand store.
 *
 * Tests store initialization, action behavior, state immutability,
 * input validation, and edge case handling.
 *
 * @module stores/settings/__tests__/settingsStore.test
 */

import { useSettingsModalStore } from "../settingsStore";
import { defaultSettingsModalState } from "../defaultSettingsModalState";
import type { SettingsSection, SettingsSubTab } from "../index";
import type { StructuredLogger as IStructuredLogger } from "@fishbowl-ai/shared";

// Mock logger for dependency injection
const mockLoggerWarn = jest.fn();
const mockLoggerInfo = jest.fn();
const mockLogger: IStructuredLogger = {
  warn: mockLoggerWarn,
  info: mockLoggerInfo,
  error: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
  child: jest.fn(),
  setLogLevel: jest.fn(),
  getLogLevel: jest.fn(),
} as unknown as IStructuredLogger;

beforeEach(() => {
  // Reset store to defaults before each test
  useSettingsModalStore.getState().resetToDefaults();

  // Initialize logger for each test
  useSettingsModalStore.getState().initialize(mockLogger);

  // Reset logger mocks
  mockLoggerWarn.mockClear();
  mockLoggerInfo.mockClear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("settingsStore", () => {
  describe("store initialization", () => {
    it("should initialize with correct default values", () => {
      const state = useSettingsModalStore.getState();

      expect(state.isOpen).toBe(false);
      expect(state.activeSection).toBe("general");
      expect(state.activeSubTab).toBe(null);
      expect(state.navigationHistory).toEqual([]);
      expect(state.hasUnsavedChanges).toBe(false);
      expect(state.lastOpenedSection).toBe("general");
    });

    it("should match the default state constant (excluding logger)", () => {
      const state = useSettingsModalStore.getState();

      const currentState = {
        isOpen: state.isOpen,
        activeSection: state.activeSection,
        activeSubTab: state.activeSubTab,
        navigationHistory: state.navigationHistory,
        hasUnsavedChanges: state.hasUnsavedChanges,
        lastOpenedSection: state.lastOpenedSection,
        logger: null, // Compare against default null state, not injected logger
      };

      expect(currentState).toEqual(defaultSettingsModalState);
    });
  });

  describe("openModal action", () => {
    it("should open modal with default section when no section provided", () => {
      const store = useSettingsModalStore.getState();

      store.openModal();

      const state = useSettingsModalStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.activeSection).toBe("general");
      expect(state.activeSubTab).toBe(null);
      expect(state.navigationHistory).toEqual(["general"]);
      expect(state.lastOpenedSection).toBe("general");
    });

    it("should open modal with specified section", () => {
      const store = useSettingsModalStore.getState();

      store.openModal("llm-setup");

      const state = useSettingsModalStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.activeSection).toBe("llm-setup");
      expect(state.activeSubTab).toBe(null);
      expect(state.navigationHistory).toEqual(["llm-setup"]);
      expect(state.lastOpenedSection).toBe("llm-setup");
    });

    it("should warn and not update state for invalid section", () => {
      const store = useSettingsModalStore.getState();

      store.openModal("invalid-section" as SettingsSection);

      expect(mockLoggerWarn).toHaveBeenCalledWith(
        "Invalid section provided to openModal: invalid-section",
      );

      const state = useSettingsModalStore.getState();
      expect(state.isOpen).toBe(false);
    });
  });

  describe("closeModal action", () => {
    it("should close modal and reset transient state", () => {
      const store = useSettingsModalStore.getState();

      // Open modal and set some state
      store.openModal("agents");
      store.setActiveSubTab("templates");

      // Close modal
      store.closeModal();

      const state = useSettingsModalStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.activeSubTab).toBe(null);
      expect(state.navigationHistory).toEqual([]);
      // Should preserve lastOpenedSection
      expect(state.lastOpenedSection).toBe("agents");
    });
  });

  describe("setActiveSection action", () => {
    it("should update active section and add to history", () => {
      const store = useSettingsModalStore.getState();

      store.setActiveSection("appearance");

      const state = useSettingsModalStore.getState();
      expect(state.activeSection).toBe("appearance");
      expect(state.activeSubTab).toBe(null);
      expect(state.navigationHistory).toEqual(["appearance"]);
      expect(state.lastOpenedSection).toBe("appearance");
    });

    it("should warn and not update state for invalid section", () => {
      const store = useSettingsModalStore.getState();

      store.setActiveSection("invalid-section" as SettingsSection);

      expect(mockLoggerWarn).toHaveBeenCalledWith(
        "Invalid section provided to setActiveSection: invalid-section",
      );

      const state = useSettingsModalStore.getState();
      expect(state.activeSection).toBe("general");
    });
  });

  describe("setActiveSubTab action", () => {
    it("should update active sub-tab", () => {
      const store = useSettingsModalStore.getState();

      store.setActiveSubTab("templates");

      const state = useSettingsModalStore.getState();
      expect(state.activeSubTab).toBe("templates");
    });

    it("should warn and not update state for invalid sub-tab", () => {
      const store = useSettingsModalStore.getState();

      store.setActiveSubTab("invalid-tab" as SettingsSubTab);

      expect(mockLoggerWarn).toHaveBeenCalledWith(
        "Invalid sub-tab provided to setActiveSubTab: invalid-tab",
      );

      const state = useSettingsModalStore.getState();
      expect(state.activeSubTab).toBe(null);
    });
  });

  describe("navigateBack action", () => {
    it("should navigate to previous section", () => {
      const store = useSettingsModalStore.getState();

      // Build some history
      store.setActiveSection("llm-setup");
      store.setActiveSection("appearance");

      // Navigate back
      store.navigateBack();

      const state = useSettingsModalStore.getState();
      expect(state.activeSection).toBe("llm-setup");
      expect(state.navigationHistory).toEqual(["llm-setup"]);
    });

    it("should handle empty history gracefully", () => {
      const store = useSettingsModalStore.getState();

      store.navigateBack();

      expect(mockLoggerInfo).toHaveBeenCalledWith(
        "No previous section in navigation history",
      );

      const state = useSettingsModalStore.getState();
      expect(state.activeSection).toBe("general");
    });
  });

  describe("setUnsavedChanges action", () => {
    it("should update unsaved changes flag", () => {
      const store = useSettingsModalStore.getState();

      store.setUnsavedChanges(true);
      expect(useSettingsModalStore.getState().hasUnsavedChanges).toBe(true);

      store.setUnsavedChanges(false);
      expect(useSettingsModalStore.getState().hasUnsavedChanges).toBe(false);
    });
  });

  describe("resetToDefaults action", () => {
    it("should reset all state to defaults", () => {
      const store = useSettingsModalStore.getState();

      // Change state
      store.openModal("agents");
      store.setActiveSubTab("templates");
      store.setUnsavedChanges(true);

      // Reset to defaults
      store.resetToDefaults();

      const state = useSettingsModalStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.activeSection).toBe("general");
      expect(state.activeSubTab).toBe(null);
      expect(state.navigationHistory).toEqual([]);
      expect(state.hasUnsavedChanges).toBe(false);
      expect(state.lastOpenedSection).toBe("general");
    });
  });
});
