import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { SettingsContent } from "../SettingsContent";

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
  };
});

// Mock the utils function
jest.mock("@/utils", () => ({
  getAccessibleDescription: jest.fn().mockReturnValue("Test description"),
}));

describe("GeneralSettings Form Foundation", () => {
  beforeEach(() => {
    // Clear any previous console logs
    jest.clearAllMocks();
  });

  it("renders form structure without errors", () => {
    expect(() => {
      render(<SettingsContent activeSection="general" />);
    }).not.toThrow();

    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Auto Mode Settings")).toBeInTheDocument();
    expect(screen.getByText("Conversation Defaults")).toBeInTheDocument();
    expect(screen.getByText("Other Settings")).toBeInTheDocument();
  });

  it("creates form infrastructure successfully", () => {
    render(<SettingsContent activeSection="general" />);

    // Check that form wrapper exists
    const forms = document.querySelectorAll("form");
    expect(forms.length).toBeGreaterThan(0);
  });

  it("maintains visual structure and styling", () => {
    render(<SettingsContent activeSection="general" />);

    // Check that the general text is rendered (indicating structure is maintained)
    const title = screen.getByText("General");
    expect(title).toBeInTheDocument();

    // Check that the main container has proper styling structure
    const main = document.querySelector('main[role="main"]');
    expect(main).toBeInTheDocument();
  });
});
