import { renderHook } from "@testing-library/react";
import { useSettingsPersistence } from "../useSettingsPersistence";
import type { SettingsPersistenceAdapter } from "../../types/settings/persistence/SettingsPersistenceAdapter";

// Mock the dependent hooks
jest.mock("../useSettingsMapper", () => ({
  useSettingsMapper: () => ({
    mapToPersistence: jest.fn((data) => data),
    mapToUI: jest.fn((data) => data),
  }),
}));

jest.mock("../useSettingsValidation", () => ({
  useSettingsValidation: () => ({
    validateSettings: jest.fn(() => ({ isValid: true, errors: [] })),
  }),
}));

describe("useSettingsPersistence", () => {
  let mockAdapter: jest.Mocked<SettingsPersistenceAdapter>;

  beforeEach(() => {
    mockAdapter = {
      load: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
      reset: jest.fn().mockResolvedValue(undefined),
    };
  });

  it("should return the correct interface", () => {
    const { result } = renderHook(() =>
      useSettingsPersistence({ adapter: mockAdapter }),
    );

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

  it("should initialize with expected default state", () => {
    const { result } = renderHook(() =>
      useSettingsPersistence({ adapter: mockAdapter }),
    );

    expect(result.current.settings).toBeNull();
    expect(result.current.error).toBeNull();
    expect(typeof result.current.isLoading).toBe("boolean");
  });
});
