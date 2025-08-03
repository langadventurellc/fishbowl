import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { GeneralSettings } from "../GeneralSettings";

// Mock the desktop adapter
jest.mock("../../../adapters/desktopSettingsAdapter", () => ({
  desktopSettingsAdapter: {
    save: jest.fn(),
    load: jest.fn(),
    reset: jest.fn(),
  },
}));

// Mock the shared package
jest.mock("@fishbowl-ai/ui-shared", () => {
  const { z } = require("zod");

  const mockSchema = z.object({
    responseDelay: z.number().min(1000).max(30000),
    maximumMessages: z.number().min(0).max(500),
    maximumWaitTime: z.number().min(5000).max(120000),
    defaultMode: z.enum(["manual", "auto"]),
    maximumAgents: z.number().min(1).max(8),
    checkUpdates: z.boolean(),
  });

  return {
    generalSettingsSchema: mockSchema,
    defaultGeneralSettings: {
      responseDelay: 2000,
      maximumMessages: 50,
      maximumWaitTime: 30000,
      defaultMode: "manual",
      maximumAgents: 5,
      checkUpdates: true,
    },
    useUnsavedChanges: jest.fn(() => ({
      hasUnsavedChanges: false,
      setUnsavedChanges: jest.fn(),
    })),
    useSettingsPersistence: jest.fn(() => ({
      settings: {
        general: {
          responseDelay: 3000,
          maximumMessages: 75,
          maximumWaitTime: 45000,
          defaultMode: "auto",
          maximumAgents: 6,
          checkUpdates: false,
        },
        appearance: {},
        advanced: {},
      },
      saveSettings: jest.fn(),
      isLoading: false,
      error: null,
    })),
    SettingsFormData: {} as any,
  };
});

// Mock the utils function
jest.mock("@/utils", () => ({
  getAccessibleDescription: jest.fn().mockReturnValue("Test description"),
}));

describe("GeneralSettings Persistence Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays loading state when settings are loading", async () => {
    const { useSettingsPersistence } = require("@fishbowl-ai/ui-shared");
    useSettingsPersistence.mockReturnValue({
      settings: null,
      saveSettings: jest.fn(),
      isLoading: true,
      error: null,
    });

    render(<GeneralSettings />);

    expect(screen.getByText("Loading settings...")).toBeInTheDocument();
  });

  it("integrates with useSettingsPersistence hook correctly", async () => {
    const mockSaveSettings = jest.fn();
    const { useSettingsPersistence } = require("@fishbowl-ai/ui-shared");

    useSettingsPersistence.mockReturnValue({
      settings: {
        general: {
          responseDelay: 3000,
          maximumMessages: 75,
          maximumWaitTime: 45000,
          defaultMode: "auto",
          maximumAgents: 6,
          checkUpdates: false,
        },
        appearance: {},
        advanced: {},
      },
      saveSettings: mockSaveSettings,
      isLoading: false,
      error: null,
    });

    render(<GeneralSettings />);

    // Verify the component rendered successfully
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Configure general application preferences and behavior.",
      ),
    ).toBeInTheDocument();
  });

  it("uses persistence hook correctly", async () => {
    const mockSaveSettings = jest.fn().mockResolvedValue(undefined);
    const { useSettingsPersistence } = require("@fishbowl-ai/ui-shared");

    useSettingsPersistence.mockReturnValue({
      settings: {
        general: {
          responseDelay: 2000,
          maximumMessages: 50,
          maximumWaitTime: 30000,
          defaultMode: "manual",
          maximumAgents: 5,
          checkUpdates: true,
        },
        appearance: {},
        advanced: {},
      },
      saveSettings: mockSaveSettings,
      isLoading: false,
      error: null,
    });

    render(<GeneralSettings />);

    // Verify persistence hook was called with correct adapter
    expect(useSettingsPersistence).toHaveBeenCalledWith({
      adapter: expect.any(Object),
      onError: expect.any(Function),
    });
  });
});
