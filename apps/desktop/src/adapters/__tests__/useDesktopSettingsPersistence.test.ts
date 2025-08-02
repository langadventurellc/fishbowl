import { renderHook } from "@testing-library/react";
import { useDesktopSettingsPersistence } from "../useDesktopSettingsPersistence";
import { useSettingsPersistence } from "@fishbowl-ai/ui-shared";
import type { UseSettingsPersistenceReturn } from "@fishbowl-ai/ui-shared/dist/hooks/UseSettingsPersistenceReturn";
import { desktopSettingsAdapter } from "../desktopSettingsAdapter";

// Mock the ui-shared hook
jest.mock("@fishbowl-ai/ui-shared", () => ({
  useSettingsPersistence: jest.fn(),
}));

// Mock the desktop adapter
jest.mock("../desktopSettingsAdapter", () => ({
  desktopSettingsAdapter: {
    save: jest.fn(),
    load: jest.fn(),
    reset: jest.fn(),
  },
}));

const mockUseSettingsPersistence =
  useSettingsPersistence as jest.MockedFunction<typeof useSettingsPersistence>;

describe("useDesktopSettingsPersistence", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call useSettingsPersistence with desktop adapter", () => {
    const mockReturn: UseSettingsPersistenceReturn = {
      settings: null,
      isLoading: false,
      error: null,
      saveSettings: jest.fn(),
      loadSettings: jest.fn(),
      resetSettings: jest.fn(),
    };

    mockUseSettingsPersistence.mockReturnValue(mockReturn);

    renderHook(() => useDesktopSettingsPersistence());

    expect(mockUseSettingsPersistence).toHaveBeenCalledWith({
      adapter: desktopSettingsAdapter,
    });
  });

  it("should pass onError callback to useSettingsPersistence", () => {
    const mockReturn: UseSettingsPersistenceReturn = {
      settings: null,
      isLoading: false,
      error: null,
      saveSettings: jest.fn(),
      loadSettings: jest.fn(),
      resetSettings: jest.fn(),
    };

    mockUseSettingsPersistence.mockReturnValue(mockReturn);

    const onError = jest.fn();
    renderHook(() => useDesktopSettingsPersistence({ onError }));

    expect(mockUseSettingsPersistence).toHaveBeenCalledWith({
      adapter: desktopSettingsAdapter,
      onError,
    });
  });

  it("should return the result from useSettingsPersistence", () => {
    const mockReturn: UseSettingsPersistenceReturn = {
      settings: { general: {}, appearance: {}, advanced: {} } as any,
      isLoading: true,
      error: null,
      saveSettings: jest.fn(),
      loadSettings: jest.fn(),
      resetSettings: jest.fn(),
    };

    mockUseSettingsPersistence.mockReturnValue(mockReturn);

    const { result } = renderHook(() => useDesktopSettingsPersistence());

    expect(result.current).toBe(mockReturn);
  });

  it("should work without any options", () => {
    const mockReturn: UseSettingsPersistenceReturn = {
      settings: null,
      isLoading: false,
      error: null,
      saveSettings: jest.fn(),
      loadSettings: jest.fn(),
      resetSettings: jest.fn(),
    };

    mockUseSettingsPersistence.mockReturnValue(mockReturn);

    const { result } = renderHook(() => useDesktopSettingsPersistence());

    expect(mockUseSettingsPersistence).toHaveBeenCalledWith({
      adapter: desktopSettingsAdapter,
    });
    expect(result.current).toBe(mockReturn);
  });
});
