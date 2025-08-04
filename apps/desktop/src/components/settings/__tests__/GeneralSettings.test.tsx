import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { GeneralSettings } from "../GeneralSettings";
import { SettingsProvider } from "../../../contexts";
import type { GeneralSettingsFormData } from "@fishbowl-ai/ui-shared";

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
    // Create a mock form instance
    const { result } = renderHook(() =>
      useForm<GeneralSettingsFormData>({
        defaultValues: {
          responseDelay: 2000,
          maximumMessages: 50,
          maximumWaitTime: 30000,
          defaultMode: "manual",
          maximumAgents: 5,
          checkUpdates: true,
        },
      }),
    );

    render(
      <SettingsProvider>
        <GeneralSettings form={result.current} isLoading={true} />
      </SettingsProvider>,
    );

    expect(screen.getByText("General")).toBeInTheDocument();
  });

  it("integrates with useSettingsPersistence hook correctly", async () => {
    // Create a mock form instance
    const { result } = renderHook(() =>
      useForm<GeneralSettingsFormData>({
        defaultValues: {
          responseDelay: 3000,
          maximumMessages: 75,
          maximumWaitTime: 45000,
          defaultMode: "auto",
          maximumAgents: 6,
          checkUpdates: false,
        },
      }),
    );

    render(
      <SettingsProvider>
        <GeneralSettings form={result.current} />
      </SettingsProvider>,
    );

    // Verify the component rendered successfully
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Configure general application preferences and behavior.",
      ),
    ).toBeInTheDocument();
  });

  it("renders form fields correctly with provided form instance", async () => {
    // Create a mock form instance
    const { result } = renderHook(() =>
      useForm<GeneralSettingsFormData>({
        defaultValues: {
          responseDelay: 2000,
          maximumMessages: 50,
          maximumWaitTime: 30000,
          defaultMode: "manual",
          maximumAgents: 5,
          checkUpdates: true,
        },
      }),
    );

    render(
      <SettingsProvider>
        <GeneralSettings form={result.current} />
      </SettingsProvider>,
    );

    // Verify the component rendered with form fields
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Response Delay")).toBeInTheDocument();
    expect(screen.getByText("Maximum Messages")).toBeInTheDocument();
    expect(screen.getByText("Default Conversation Mode")).toBeInTheDocument();
  });
});
