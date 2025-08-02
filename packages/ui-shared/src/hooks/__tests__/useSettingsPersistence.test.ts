import { renderHook, act, waitFor } from "@testing-library/react";
import { useSettingsPersistence } from "../useSettingsPersistence";
import type { SettingsPersistenceAdapter } from "../../types/settings/persistence/SettingsPersistenceAdapter";
import type { SettingsFormData } from "../../types/settings/combined/SettingsFormData";
import type { SettingsValidationResult } from "../../types/settings/combined/SettingsValidationResult";

// Mock the dependent hooks
const mockMapToPersistence = jest.fn((data) => data);
const mockMapToUI = jest.fn((data) => data);
const mockValidateSettings = jest.fn<
  SettingsValidationResult,
  [Partial<SettingsFormData>]
>(() => ({
  isValid: true,
  errors: {
    general: [],
    appearance: [],
    advanced: [],
  },
}));

jest.mock("../useSettingsMapper", () => ({
  useSettingsMapper: () => ({
    mapToPersistence: mockMapToPersistence,
    mapToUI: mockMapToUI,
  }),
}));

jest.mock("../useSettingsValidation", () => ({
  useSettingsValidation: () => ({
    validateSettings: mockValidateSettings,
  }),
}));

describe("useSettingsPersistence", () => {
  let mockAdapter: jest.Mocked<SettingsPersistenceAdapter>;
  let mockOnError: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAdapter = {
      load: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
      reset: jest.fn().mockResolvedValue(undefined),
    };

    mockOnError = jest.fn();
  });

  it("should return the correct interface", async () => {
    const { result } = renderHook(() =>
      useSettingsPersistence({ adapter: mockAdapter }),
    );

    // Wait for initial load to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current).toHaveProperty("settings");
    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("saveSettings");
    expect(result.current).toHaveProperty("loadSettings");
    expect(result.current).toHaveProperty("resetSettings");
    expect(typeof result.current.saveSettings).toBe("function");
    expect(typeof result.current.loadSettings).toBe("function");
    expect(typeof result.current.resetSettings).toBe("function");
  });

  it("should initialize with loading state and load default settings", async () => {
    const { result } = renderHook(() =>
      useSettingsPersistence({ adapter: mockAdapter }),
    );

    // Initially should be loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.settings).toBeNull();
    expect(result.current.error).toBeNull();

    // Wait for load to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have loaded default settings
    expect(result.current.settings).not.toBeNull();
    expect(result.current.error).toBeNull();
    expect(mockAdapter.load).toHaveBeenCalledTimes(1);
  });

  it("should load persisted settings when available", async () => {
    const mockPersistedData = {
      schemaVersion: "1.0",
      lastUpdated: "2025-01-01T00:00:00Z",
      general: {
        responseDelay: 2000,
        maximumMessages: 50,
        maximumWaitTime: 30000,
        defaultMode: "manual" as const,
        maximumAgents: 4,
        checkUpdates: true,
      },
      appearance: {
        theme: "dark" as const,
        showTimestamps: "always" as const,
        showActivityTime: true,
        compactList: false,
        fontSize: 14,
        messageSpacing: "normal" as const,
      },
      advanced: {
        debugLogging: true,
        experimentalFeatures: false,
      },
    };

    mockAdapter.load.mockResolvedValue(mockPersistedData);

    const { result } = renderHook(() =>
      useSettingsPersistence({ adapter: mockAdapter }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockMapToUI).toHaveBeenCalledWith(mockPersistedData);
    expect(mockValidateSettings).toHaveBeenCalled();
    expect(result.current.settings).not.toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should save settings atomically", async () => {
    const { result } = renderHook(() =>
      useSettingsPersistence({ adapter: mockAdapter }),
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const testSettings: SettingsFormData = {
      general: {
        responseDelay: 3000,
        maximumMessages: 10,
        maximumWaitTime: 30000,
        defaultMode: "manual" as const,
        maximumAgents: 4,
        checkUpdates: true,
      },
      appearance: {
        theme: "light" as const,
        showTimestamps: "always" as const,
        showActivityTime: true,
        compactList: false,
        fontSize: 14,
        messageSpacing: "normal" as const,
      },
      advanced: {
        debugLogging: false,
        experimentalFeatures: true,
      },
    };

    await act(async () => {
      await result.current.saveSettings(testSettings);
    });

    expect(mockValidateSettings).toHaveBeenCalledWith(testSettings);
    expect(mockMapToPersistence).toHaveBeenCalledWith(testSettings);
    expect(mockAdapter.save).toHaveBeenCalled();
    expect(result.current.settings).toEqual(testSettings);
    expect(result.current.error).toBeNull();
  });

  it("should handle save errors properly", async () => {
    const saveError = new Error("Save failed");
    mockAdapter.save.mockRejectedValue(saveError);

    const { result } = renderHook(() =>
      useSettingsPersistence({ adapter: mockAdapter, onError: mockOnError }),
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const testSettings: SettingsFormData = {
      general: {
        responseDelay: 3000,
        maximumMessages: 10,
        maximumWaitTime: 30000,
        defaultMode: "manual" as const,
        maximumAgents: 4,
        checkUpdates: true,
      },
      appearance: {
        theme: "light" as const,
        showTimestamps: "always" as const,
        showActivityTime: true,
        compactList: false,
        fontSize: 14,
        messageSpacing: "normal" as const,
      },
      advanced: {
        debugLogging: false,
        experimentalFeatures: true,
      },
    };

    await act(async () => {
      try {
        await result.current.saveSettings(testSettings);
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).not.toBeNull();
    expect(mockOnError).toHaveBeenCalled();
  });

  it("should reset settings to defaults", async () => {
    const { result } = renderHook(() =>
      useSettingsPersistence({ adapter: mockAdapter }),
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.resetSettings();
    });

    expect(mockAdapter.reset).toHaveBeenCalled();
    expect(result.current.settings).not.toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should handle reset errors properly", async () => {
    const resetError = new Error("Reset failed");
    mockAdapter.reset.mockRejectedValue(resetError);

    const { result } = renderHook(() =>
      useSettingsPersistence({ adapter: mockAdapter, onError: mockOnError }),
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      try {
        await result.current.resetSettings();
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).not.toBeNull();
    expect(mockOnError).toHaveBeenCalled();
  });

  it("should manually load settings", async () => {
    const { result } = renderHook(() =>
      useSettingsPersistence({ adapter: mockAdapter }),
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Clear the mock to test manual load
    jest.clearAllMocks();

    await act(async () => {
      await result.current.loadSettings();
    });

    expect(mockAdapter.load).toHaveBeenCalledTimes(1);
  });

  it("should handle validation errors during load", async () => {
    const mockPersistedData = {
      schemaVersion: "1.0",
      lastUpdated: "2025-01-01T00:00:00Z",
      general: {
        responseDelay: 2000,
        maximumMessages: 50,
        maximumWaitTime: 30000,
        defaultMode: "manual" as const,
        maximumAgents: 4,
        checkUpdates: true,
      },
      appearance: {
        theme: "dark" as const,
        showTimestamps: "always" as const,
        showActivityTime: true,
        compactList: false,
        fontSize: 14,
        messageSpacing: "normal" as const,
      },
      advanced: {
        debugLogging: true,
        experimentalFeatures: false,
      },
    };
    mockAdapter.load.mockResolvedValue(mockPersistedData);
    mockValidateSettings.mockReturnValue({
      isValid: false,
      errors: {
        general: ["Invalid data"],
        appearance: [],
        advanced: [],
      },
    });

    const { result } = renderHook(() =>
      useSettingsPersistence({ adapter: mockAdapter, onError: mockOnError }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(mockOnError).toHaveBeenCalled();
  });

  it("should handle validation errors during save", async () => {
    mockValidateSettings.mockReturnValue({
      isValid: false,
      errors: {
        general: ["Invalid data"],
        appearance: [],
        advanced: [],
      },
    });

    const { result } = renderHook(() =>
      useSettingsPersistence({ adapter: mockAdapter, onError: mockOnError }),
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const testSettings: SettingsFormData = {
      general: {
        responseDelay: 3000,
        maximumMessages: 10,
        maximumWaitTime: 30000,
        defaultMode: "manual" as const,
        maximumAgents: 4,
        checkUpdates: true,
      },
      appearance: {
        theme: "light" as const,
        showTimestamps: "always" as const,
        showActivityTime: true,
        compactList: false,
        fontSize: 14,
        messageSpacing: "normal" as const,
      },
      advanced: {
        debugLogging: false,
        experimentalFeatures: true,
      },
    };

    await act(async () => {
      try {
        await result.current.saveSettings(testSettings);
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).not.toBeNull();
    expect(mockOnError).toHaveBeenCalled();
    expect(mockAdapter.save).not.toHaveBeenCalled();
  });
});
