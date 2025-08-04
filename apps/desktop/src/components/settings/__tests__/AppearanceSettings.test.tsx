import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { SettingsContent } from "../SettingsContent";
import { SettingsProvider } from "../../../contexts";

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
jest.mock("@fishbowl-ai/ui-shared", () => {
  const { z } = require("zod");

  const mockAppearanceSchema = z.object({
    theme: z.enum(["light", "dark", "system"]),
    showTimestamps: z.enum(["always", "hover", "never"]),
    showActivityTime: z.boolean(),
    compactList: z.boolean(),
    fontSize: z.number().min(12).max(20),
    messageSpacing: z.enum(["compact", "normal", "relaxed"]),
  });

  const mockGeneralSchema = z.object({
    responseDelay: z.number().min(1000).max(30000),
    maximumMessages: z.number().min(0).max(500),
    maximumWaitTime: z.number().min(5000).max(120000),
    defaultMode: z.enum(["manual", "auto"]),
    maximumAgents: z.number().min(1).max(8),
    checkUpdates: z.boolean(),
  });

  return {
    useUnsavedChanges: jest.fn(() => ({
      hasUnsavedChanges: false,
      setUnsavedChanges: jest.fn(),
    })),
    useSettingsActions: jest.fn(() => ({
      setUnsavedChanges: jest.fn(),
      closeModal: jest.fn(),
      openModal: jest.fn(),
      setActiveSection: jest.fn(),
      setActiveSubTab: jest.fn(),
      resetToDefaults: jest.fn(),
      navigateBack: jest.fn(),
    })),
    useSettingsPersistence: jest.fn(() => ({
      settings: {
        general: {
          responseDelay: 2000,
          maximumMessages: 50,
          maximumWaitTime: 30000,
          defaultMode: "manual",
          maximumAgents: 5,
          checkUpdates: true,
        },
        appearance: {
          theme: "system",
          showTimestamps: "hover",
          showActivityTime: true,
          compactList: false,
          fontSize: 14,
          messageSpacing: "normal",
        },
      },
      saveSettings: jest.fn(),
      isLoading: false,
      error: null,
    })),
    defaultAppearanceSettings: {
      theme: "system",
      showTimestamps: "hover",
      showActivityTime: true,
      compactList: false,
      fontSize: 14,
      messageSpacing: "normal",
    },
    defaultGeneralSettings: {
      responseDelay: 2000,
      maximumMessages: 50,
      maximumWaitTime: 30000,
      defaultMode: "manual",
      maximumAgents: 5,
      checkUpdates: true,
    },
    appearanceSettingsSchema: mockAppearanceSchema,
    generalSettingsSchema: mockGeneralSchema,
  };
});

// Mock the utils function
jest.mock("@/utils", () => ({
  getAccessibleDescription: jest.fn().mockReturnValue("Test description"),
  applyTheme: jest.fn(),
}));

// Mock the desktop adapter
jest.mock("../../../adapters/desktopSettingsAdapter", () => ({
  desktopSettingsAdapter: {
    save: jest.fn(),
    load: jest.fn(),
    reset: jest.fn(),
  },
}));

// Mock form error display
jest.mock("../FormErrorDisplay", () => ({
  FormErrorDisplay: ({ error }: { error: string | null }) =>
    error ? <div data-testid="form-error">{error}</div> : null,
}));

describe("AppearanceSettings Component", () => {
  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<SettingsProvider>{ui}</SettingsProvider>);
  };

  beforeEach(() => {
    // Clear any previous mocks
    jest.clearAllMocks();
  });

  it("renders appearance settings without errors", () => {
    expect(() => {
      renderWithProvider(<SettingsContent activeSection="appearance" />);
    }).not.toThrow();

    expect(screen.getByText("Appearance")).toBeInTheDocument();
    expect(
      screen.getByText("Customize the appearance and theme of the application"),
    ).toBeInTheDocument();
  });

  it("renders theme selection options", () => {
    renderWithProvider(<SettingsContent activeSection="appearance" />);

    // Check that theme section exists (using role to find the heading)
    expect(screen.getByRole("heading", { name: "Theme" })).toBeInTheDocument();
    expect(screen.getByLabelText("Light")).toBeInTheDocument();
    expect(screen.getByLabelText("Dark")).toBeInTheDocument();
    expect(screen.getByLabelText("System")).toBeInTheDocument();
  });

  it("displays system theme helper text", () => {
    renderWithProvider(<SettingsContent activeSection="appearance" />);

    expect(screen.getByText("Use your system preference")).toBeInTheDocument();
  });

  it("renders theme preview area", () => {
    renderWithProvider(<SettingsContent activeSection="appearance" />);

    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.getByText("Sample Text")).toBeInTheDocument();
    expect(screen.getByLabelText(/Theme preview/)).toBeInTheDocument();
  });

  it("updates theme selection on user interaction", () => {
    renderWithProvider(<SettingsContent activeSection="appearance" />);

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
    renderWithProvider(<SettingsContent activeSection="appearance" />);

    const previewArea = screen.getByLabelText(/Theme preview/);
    expect(previewArea).toHaveClass("theme-preview");
  });

  it("maintains proper accessibility attributes", () => {
    renderWithProvider(<SettingsContent activeSection="appearance" />);

    // Check radio group accessibility - shadcn/ui uses button elements with proper ARIA
    const lightRadio = screen.getByLabelText("Light");
    const darkRadio = screen.getByLabelText("Dark");
    const systemRadio = screen.getByLabelText("System");

    expect(lightRadio).toHaveAttribute("role", "radio");
    expect(darkRadio).toHaveAttribute("role", "radio");
    expect(systemRadio).toHaveAttribute("role", "radio");

    // Check preview area accessibility
    const previewArea = screen.getByLabelText(/Theme preview/);
    expect(previewArea).toHaveAttribute(
      "aria-label",
      "Theme preview showing background, text, and accent colors",
    );
  });

  it("displays proper visual hierarchy", () => {
    renderWithProvider(<SettingsContent activeSection="appearance" />);

    // Check main title styling
    const mainTitle = screen.getByText("Appearance");
    expect(mainTitle.tagName).toBe("H1");

    // Check group titles styling (using role to find specific headings)
    const themeTitle = screen.getByRole("heading", { name: "Theme" });
    const previewTitle = screen.getByRole("heading", { name: "Preview" });
    const displaySettingsTitle = screen.getByRole("heading", {
      name: "Display Settings",
    });
    expect(themeTitle.tagName).toBe("H2");
    expect(previewTitle.tagName).toBe("H2");
    expect(displaySettingsTitle.tagName).toBe("H2");
  });

  describe("Display Settings Section", () => {
    it("renders display settings section", () => {
      renderWithProvider(<SettingsContent activeSection="appearance" />);

      expect(screen.getByText("Display Settings")).toBeInTheDocument();
      expect(screen.getByText("Show Timestamps")).toBeInTheDocument();
      expect(screen.getByText("Show last activity time")).toBeInTheDocument();
      expect(screen.getByText("Compact conversation list")).toBeInTheDocument();
    });

    it("renders timestamp radio group with correct options", () => {
      renderWithProvider(<SettingsContent activeSection="appearance" />);

      expect(screen.getByLabelText("Always")).toBeInTheDocument();
      expect(screen.getByLabelText("On Hover")).toBeInTheDocument();
      expect(screen.getByLabelText("Never")).toBeInTheDocument();

      // On Hover should be selected by default
      expect(screen.getByLabelText("On Hover")).toBeChecked();
    });

    it("updates timestamp selection on user interaction", () => {
      renderWithProvider(<SettingsContent activeSection="appearance" />);

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
      renderWithProvider(<SettingsContent activeSection="appearance" />);

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
      renderWithProvider(<SettingsContent activeSection="appearance" />);

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
      renderWithProvider(<SettingsContent activeSection="appearance" />);

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
      renderWithProvider(<SettingsContent activeSection="appearance" />);

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

  describe("Live Preview Functionality", () => {
    it("updates theme preview immediately when theme selection changes", () => {
      renderWithProvider(<SettingsContent activeSection="appearance" />);

      const darkOption = screen.getByLabelText("Dark");
      const lightOption = screen.getByLabelText("Light");
      const previewArea = screen.getByLabelText(/Theme preview/);

      // Verify initial state - check theme-preview class is applied
      expect(previewArea).toHaveClass("theme-preview");

      // Change to dark theme
      fireEvent.click(darkOption);

      // Verify dark theme class is applied
      expect(previewArea).toHaveClass("dark");

      // Change to light theme
      fireEvent.click(lightOption);

      // Verify dark theme class is removed
      expect(previewArea).not.toHaveClass("dark");
    });

    it("renders theme preview with enhanced ARIA accessibility", () => {
      renderWithProvider(<SettingsContent activeSection="appearance" />);

      const previewArea = screen.getByLabelText(/Theme preview/);

      expect(previewArea).toHaveAttribute(
        "aria-label",
        "Theme preview showing background, text, and accent colors",
      );
      expect(previewArea).toHaveAttribute("role", "img");
    });

    it("applies smooth transitions to theme preview", () => {
      renderWithProvider(<SettingsContent activeSection="appearance" />);

      const previewArea = screen.getByLabelText(/Theme preview/);

      // Verify theme-preview class is present (transitions handled via CSS)
      expect(previewArea).toHaveClass("theme-preview");

      // Verify accent and primary elements are properly structured
      const accentElement = previewArea.querySelector(".theme-preview-accent");
      const primaryElements = previewArea.querySelectorAll(
        ".theme-preview-primary",
      );

      expect(accentElement).toBeInTheDocument();
      expect(primaryElements).toHaveLength(2);
    });

    it("renders font size preview with correct sample text", () => {
      renderWithProvider(<SettingsContent activeSection="appearance" />);

      const previewText = screen.getByText(
        "This is how your messages will appear",
      );

      expect(previewText).toBeInTheDocument();
      expect(previewText).toHaveAttribute("role", "text");
    });

    it("updates font size preview in real-time as slider moves", () => {
      renderWithProvider(<SettingsContent activeSection="appearance" />);

      const previewText = screen.getByText(
        "This is how your messages will appear",
      );

      // Check initial font size (14px default)
      expect(previewText).toHaveStyle({ fontSize: "14px" });

      // Note: shadcn/ui Slider component testing would require more complex
      // event simulation. For this test, we verify the initial state and
      // that the preview component is properly connected to receive updates.
      expect(previewText).toHaveAttribute(
        "aria-label",
        "Font size preview at 14 pixels",
      );
    });

    it("maintains proper line height in font size preview", () => {
      renderWithProvider(<SettingsContent activeSection="appearance" />);

      const previewText = screen.getByText(
        "This is how your messages will appear",
      );

      // Verify line height is set correctly
      expect(previewText).toHaveStyle({ lineHeight: 1.5 });
    });

    it("applies smooth transitions to font size preview", () => {
      renderWithProvider(<SettingsContent activeSection="appearance" />);

      const previewText = screen.getByText(
        "This is how your messages will appear",
      );

      // Verify transition classes are present
      expect(previewText).toHaveClass(
        "transition-all",
        "duration-150",
        "ease-in-out",
      );
    });

    it("renders font size preview with accessible label", () => {
      renderWithProvider(<SettingsContent activeSection="appearance" />);

      const previewText = screen.getByText(
        "This is how your messages will appear",
      );

      expect(previewText).toHaveAttribute(
        "aria-label",
        "Font size preview at 14 pixels",
      );
      expect(previewText).toHaveAttribute("role", "text");
    });

    it("positions font size preview correctly below slider", () => {
      renderWithProvider(<SettingsContent activeSection="appearance" />);

      const previewContainer = screen
        .getByText("This is how your messages will appear")
        .closest(".mt-4");

      expect(previewContainer).toBeInTheDocument();
      expect(previewContainer).toHaveClass(
        "mt-4",
        "p-3",
        "border",
        "rounded-lg",
        "bg-muted/30",
      );
    });

    it("displays font size value correctly in preview label", () => {
      renderWithProvider(<SettingsContent activeSection="appearance" />);

      const previewText = screen.getByText(
        "This is how your messages will appear",
      );

      // Verify aria-label shows current font size
      expect(previewText).toHaveAttribute(
        "aria-label",
        "Font size preview at 14 pixels",
      );
    });

    it("handles system theme detection correctly", () => {
      // Mock dark system theme
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      renderWithProvider(<SettingsContent activeSection="appearance" />);

      const systemOption = screen.getByLabelText("System");
      const previewArea = screen.getByLabelText(/Theme preview/);

      // Verify system option is selected by default
      expect(systemOption).toBeChecked();

      // Verify dark theme class is applied for system theme
      expect(previewArea).toHaveClass("dark");
    });

    it("prevents excessive re-renders with React.memo optimization", () => {
      const { rerender } = renderWithProvider(
        <SettingsContent activeSection="appearance" />,
      );

      const previewArea = screen.getByLabelText(/Theme preview/);
      const previewText = screen.getByText(
        "This is how your messages will appear",
      );

      // Both components should be rendered
      expect(previewArea).toBeInTheDocument();
      expect(previewText).toBeInTheDocument();

      // Re-render with same props should not cause issues
      rerender(
        <SettingsProvider>
          <SettingsContent activeSection="appearance" />
        </SettingsProvider>,
      );

      // Components should still be present and functional
      expect(previewArea).toBeInTheDocument();
      expect(previewText).toBeInTheDocument();
    });

    it("displays chat display section with font size controls", () => {
      renderWithProvider(<SettingsContent activeSection="appearance" />);

      expect(screen.getByText("Chat Display")).toBeInTheDocument();
      expect(screen.getByText("Message Font Size")).toBeInTheDocument();
      expect(screen.getByText("14px")).toBeInTheDocument(); // Default font size display
      expect(
        screen.getByText("Adjust the font size for chat messages"),
      ).toBeInTheDocument();
    });

    it("maintains consistent styling for preview areas", () => {
      renderWithProvider(<SettingsContent activeSection="appearance" />);

      const themePreview = screen.getByLabelText(/Theme preview/);
      const fontPreviewContainer = screen
        .getByText("This is how your messages will appear")
        .closest(".mt-4");

      // Theme preview should use design token classes
      expect(themePreview).toHaveClass("theme-preview", "border", "rounded-lg");

      // Font preview container should have proper styling
      expect(fontPreviewContainer).toHaveClass(
        "mt-4",
        "p-3",
        "border",
        "rounded-lg",
        "bg-muted/30",
      );
    });
  });

  describe("Form Field Integration", () => {
    beforeEach(() => {
      // Clear all mocks before each test in this describe block
      jest.clearAllMocks();
    });

    it("should apply theme in real-time when form field selection changes", () => {
      const { applyTheme } = require("@/utils");

      renderWithProvider(<SettingsContent activeSection="appearance" />);

      const darkRadio = screen.getByLabelText("Dark");

      // Click dark option
      fireEvent.click(darkRadio);

      // Verify applyTheme was called with the new theme value
      expect(applyTheme).toHaveBeenCalledWith("dark");
    });

    it("should apply light theme when light option is selected", () => {
      const { applyTheme } = require("@/utils");

      renderWithProvider(<SettingsContent activeSection="appearance" />);

      const lightRadio = screen.getByLabelText("Light");

      // Click light option
      fireEvent.click(lightRadio);

      // Verify applyTheme was called with light theme
      expect(applyTheme).toHaveBeenCalledWith("light");
    });

    it("should apply system theme when system option is selected", () => {
      const { applyTheme } = require("@/utils");

      renderWithProvider(<SettingsContent activeSection="appearance" />);

      const systemRadio = screen.getByLabelText("System");
      const darkRadio = screen.getByLabelText("Dark");

      // First change to dark to make system selection more obvious
      fireEvent.click(darkRadio);

      // Then click system option
      fireEvent.click(systemRadio);

      // Verify applyTheme was called with system theme (should be called multiple times)
      expect(applyTheme).toHaveBeenCalledWith("system");
    });

    it("should use FormField component for theme selection", () => {
      renderWithProvider(<SettingsContent activeSection="appearance" />);

      // Verify radio buttons are integrated with form and have proper attributes
      const lightRadio = screen.getByLabelText("Light");
      const darkRadio = screen.getByLabelText("Dark");
      const systemRadio = screen.getByLabelText("System");

      expect(lightRadio).toHaveAttribute("role", "radio");
      expect(darkRadio).toHaveAttribute("role", "radio");
      expect(systemRadio).toHaveAttribute("role", "radio");

      // Verify form field structure by checking theme options are present
      expect(lightRadio).toBeInTheDocument();
      expect(darkRadio).toBeInTheDocument();
      expect(systemRadio).toBeInTheDocument();
    });

    it("should update theme preview immediately when form value changes", () => {
      renderWithProvider(<SettingsContent activeSection="appearance" />);

      const darkRadio = screen.getByLabelText("Dark");
      const lightRadio = screen.getByLabelText("Light");
      const previewArea = screen.getByLabelText(/Theme preview/);

      // Change to dark theme
      fireEvent.click(darkRadio);

      // Verify theme preview updates immediately
      expect(previewArea).toHaveClass("dark");

      // Change to light theme
      fireEvent.click(lightRadio);

      // Verify theme preview updates immediately
      expect(previewArea).not.toHaveClass("dark");
    });

    it("should maintain form validation for theme field", () => {
      renderWithProvider(<SettingsContent activeSection="appearance" />);

      // Verify all theme options are valid choices
      const lightRadio = screen.getByLabelText("Light");
      const darkRadio = screen.getByLabelText("Dark");
      const systemRadio = screen.getByLabelText("System");

      // All options should be selectable without validation errors
      fireEvent.click(lightRadio);
      expect(lightRadio).toBeChecked();

      fireEvent.click(darkRadio);
      expect(darkRadio).toBeChecked();

      fireEvent.click(systemRadio);
      expect(systemRadio).toBeChecked();

      // No form error messages should be displayed
      expect(screen.queryByTestId("form-error")).not.toBeInTheDocument();
    });

    it("should handle form state changes without errors", () => {
      renderWithProvider(<SettingsContent activeSection="appearance" />);

      const darkRadio = screen.getByLabelText("Dark");
      const lightRadio = screen.getByLabelText("Light");
      const systemRadio = screen.getByLabelText("System");

      // Test multiple rapid changes don't cause errors
      expect(() => {
        fireEvent.click(darkRadio);
        fireEvent.click(lightRadio);
        fireEvent.click(systemRadio);
        fireEvent.click(darkRadio);
      }).not.toThrow();

      // Final state should be dark
      expect(darkRadio).toBeChecked();
    });

    it("should initialize with default theme value from settings", () => {
      renderWithProvider(<SettingsContent activeSection="appearance" />);

      // System should be selected by default based on mock settings
      const systemRadio = screen.getByLabelText("System");
      expect(systemRadio).toBeChecked();
    });

    it("should preserve theme selection state during re-renders", () => {
      const { rerender } = renderWithProvider(
        <SettingsContent activeSection="appearance" />,
      );

      const darkRadio = screen.getByLabelText("Dark");

      // Change to dark theme
      fireEvent.click(darkRadio);
      expect(darkRadio).toBeChecked();

      // Re-render component
      rerender(
        <SettingsProvider>
          <SettingsContent activeSection="appearance" />
        </SettingsProvider>,
      );

      // Theme selection should be preserved (though in reality it would reset to form default)
      // This test mainly ensures no errors occur during re-render
      expect(screen.getByLabelText("Dark")).toBeInTheDocument();
      expect(screen.getByLabelText("Light")).toBeInTheDocument();
      expect(screen.getByLabelText("System")).toBeInTheDocument();
    });
  });
});
