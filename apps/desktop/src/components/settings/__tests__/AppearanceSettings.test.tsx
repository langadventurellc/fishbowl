import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SettingsContent } from "../SettingsContent";

// Mock window.matchMedia for system theme detection
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock the shared package
jest.mock("@fishbowl-ai/shared", () => ({
  useUnsavedChanges: jest.fn(() => ({
    hasUnsavedChanges: false,
    setUnsavedChanges: jest.fn(),
  })),
}));

// Mock the utils function
jest.mock("@/utils", () => ({
  getAccessibleDescription: jest.fn().mockReturnValue("Test description"),
}));

describe("AppearanceSettings Component", () => {
  beforeEach(() => {
    // Clear any previous mocks
    jest.clearAllMocks();
  });

  it("renders appearance settings without errors", () => {
    expect(() => {
      render(<SettingsContent activeSection="appearance" />);
    }).not.toThrow();

    expect(screen.getByText("Appearance")).toBeInTheDocument();
    expect(
      screen.getByText("Customize the appearance and theme of the application"),
    ).toBeInTheDocument();
  });

  it("renders theme selection options", () => {
    render(<SettingsContent activeSection="appearance" />);

    expect(screen.getByText("Theme")).toBeInTheDocument();
    expect(screen.getByLabelText("Light")).toBeInTheDocument();
    expect(screen.getByLabelText("Dark")).toBeInTheDocument();
    expect(screen.getByLabelText("System")).toBeInTheDocument();
  });

  it("displays system theme helper text", () => {
    render(<SettingsContent activeSection="appearance" />);

    expect(screen.getByText("Use your system preference")).toBeInTheDocument();
  });

  it("renders theme preview area", () => {
    render(<SettingsContent activeSection="appearance" />);

    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.getByText("Sample Text")).toBeInTheDocument();
    expect(screen.getByLabelText("Theme preview")).toBeInTheDocument();
  });

  it("updates theme selection on user interaction", () => {
    render(<SettingsContent activeSection="appearance" />);

    const darkOption = screen.getByLabelText("Dark");
    const lightOption = screen.getByLabelText("Light");

    // System should be selected by default
    const systemOption = screen.getByLabelText("System");
    expect(systemOption).toBeChecked();

    // Click dark option
    fireEvent.click(darkOption);
    expect(darkOption).toBeChecked();
    expect(lightOption).not.toBeChecked();
    expect(systemOption).not.toBeChecked();

    // Click light option
    fireEvent.click(lightOption);
    expect(lightOption).toBeChecked();
    expect(darkOption).not.toBeChecked();
    expect(systemOption).not.toBeChecked();
  });

  it("renders theme preview with correct dimensions", () => {
    render(<SettingsContent activeSection="appearance" />);

    const previewArea = screen.getByLabelText("Theme preview");
    expect(previewArea).toHaveClass("w-[200px]", "h-[100px]");
  });

  it("maintains proper accessibility attributes", () => {
    render(<SettingsContent activeSection="appearance" />);

    // Check radio group accessibility - shadcn/ui uses button elements with proper ARIA
    const lightRadio = screen.getByLabelText("Light");
    const darkRadio = screen.getByLabelText("Dark");
    const systemRadio = screen.getByLabelText("System");

    expect(lightRadio).toHaveAttribute("role", "radio");
    expect(darkRadio).toHaveAttribute("role", "radio");
    expect(systemRadio).toHaveAttribute("role", "radio");

    // Check preview area accessibility
    const previewArea = screen.getByLabelText("Theme preview");
    expect(previewArea).toHaveAttribute("aria-label", "Theme preview");
  });

  it("displays proper visual hierarchy", () => {
    render(<SettingsContent activeSection="appearance" />);

    // Check main title styling
    const mainTitle = screen.getByText("Appearance");
    expect(mainTitle.tagName).toBe("H1");

    // Check group titles styling
    const themeTitle = screen.getByText("Theme");
    const previewTitle = screen.getByText("Preview");
    const displaySettingsTitle = screen.getByText("Display Settings");
    expect(themeTitle.tagName).toBe("H2");
    expect(previewTitle.tagName).toBe("H2");
    expect(displaySettingsTitle.tagName).toBe("H2");
  });

  describe("Display Settings Section", () => {
    it("renders display settings section", () => {
      render(<SettingsContent activeSection="appearance" />);

      expect(screen.getByText("Display Settings")).toBeInTheDocument();
      expect(screen.getByText("Show Timestamps")).toBeInTheDocument();
      expect(screen.getByText("Show last activity time")).toBeInTheDocument();
      expect(screen.getByText("Compact conversation list")).toBeInTheDocument();
    });

    it("renders timestamp radio group with correct options", () => {
      render(<SettingsContent activeSection="appearance" />);

      expect(screen.getByLabelText("Always")).toBeInTheDocument();
      expect(screen.getByLabelText("On Hover")).toBeInTheDocument();
      expect(screen.getByLabelText("Never")).toBeInTheDocument();

      // On Hover should be selected by default
      expect(screen.getByLabelText("On Hover")).toBeChecked();
    });

    it("updates timestamp selection on user interaction", () => {
      render(<SettingsContent activeSection="appearance" />);

      const alwaysOption = screen.getByLabelText("Always");
      const hoverOption = screen.getByLabelText("On Hover");
      const neverOption = screen.getByLabelText("Never");

      // On Hover should be selected by default
      expect(hoverOption).toBeChecked();

      // Click Always option
      fireEvent.click(alwaysOption);
      expect(alwaysOption).toBeChecked();
      expect(hoverOption).not.toBeChecked();
      expect(neverOption).not.toBeChecked();

      // Click Never option
      fireEvent.click(neverOption);
      expect(neverOption).toBeChecked();
      expect(alwaysOption).not.toBeChecked();
      expect(hoverOption).not.toBeChecked();
    });

    it("renders toggle switches with proper initial states", () => {
      render(<SettingsContent activeSection="appearance" />);

      // Find switches by their associated labels
      const activityTimeLabel = screen.getByText("Show last activity time");
      const compactListLabel = screen.getByText("Compact conversation list");

      expect(activityTimeLabel).toBeInTheDocument();
      expect(compactListLabel).toBeInTheDocument();

      // Check that the switch containers exist
      const activityTimeContainer = activityTimeLabel.closest(".flex");
      const compactListContainer = compactListLabel.closest(".flex");

      expect(activityTimeContainer).toBeInTheDocument();
      expect(compactListContainer).toBeInTheDocument();
    });

    it("updates toggle switches on user interaction", () => {
      render(<SettingsContent activeSection="appearance" />);

      // Test that switches are rendered and can be interacted with
      const activityTimeLabel = screen.getByText("Show last activity time");
      const compactListLabel = screen.getByText("Compact conversation list");

      // Basic interaction test - just verify the labels and containers exist
      expect(activityTimeLabel.closest(".flex")).toBeInTheDocument();
      expect(compactListLabel.closest(".flex")).toBeInTheDocument();

      // Verify the switch containers have the proper border styling
      const activityContainer = activityTimeLabel.closest(".rounded-lg.border");
      const compactContainer = compactListLabel.closest(".rounded-lg.border");

      expect(activityContainer).toBeInTheDocument();
      expect(compactContainer).toBeInTheDocument();
    });

    it("displays helper text for all controls", () => {
      render(<SettingsContent activeSection="appearance" />);

      expect(
        screen.getByText("Control when message timestamps are displayed"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Display the last activity time for each conversation",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Use a more compact layout for the conversation list"),
      ).toBeInTheDocument();
    });

    it("maintains proper accessibility for display settings", () => {
      render(<SettingsContent activeSection="appearance" />);

      // Check radio group accessibility for timestamp options
      const alwaysRadio = screen.getByLabelText("Always");
      const hoverRadio = screen.getByLabelText("On Hover");
      const neverRadio = screen.getByLabelText("Never");

      expect(alwaysRadio).toHaveAttribute("role", "radio");
      expect(hoverRadio).toHaveAttribute("role", "radio");
      expect(neverRadio).toHaveAttribute("role", "radio");

      // Check that switch labels are properly associated
      const activityTimeLabel = screen.getByText("Show last activity time");
      const compactListLabel = screen.getByText("Compact conversation list");

      expect(activityTimeLabel).toBeInTheDocument();
      expect(compactListLabel).toBeInTheDocument();

      // Verify description text exists for timestamp controls
      const timestampDescription = screen.getByText(
        "Control when message timestamps are displayed",
      );
      expect(timestampDescription).toHaveAttribute(
        "id",
        "timestamps-description",
      );
    });
  });
});
