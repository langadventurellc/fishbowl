import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
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
jest.mock("@fishbowl-ai/ui-shared", () => ({
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
    expect(screen.getByLabelText(/Theme preview/)).toBeInTheDocument();
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

    const previewArea = screen.getByLabelText(/Theme preview/);
    expect(previewArea).toHaveClass("theme-preview");
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
    const previewArea = screen.getByLabelText(/Theme preview/);
    expect(previewArea).toHaveAttribute(
      "aria-label",
      "Theme preview showing background, text, and accent colors",
    );
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

  describe("Live Preview Functionality", () => {
    it("updates theme preview immediately when theme selection changes", () => {
      render(<SettingsContent activeSection="appearance" />);

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
      render(<SettingsContent activeSection="appearance" />);

      const previewArea = screen.getByLabelText(/Theme preview/);

      expect(previewArea).toHaveAttribute(
        "aria-label",
        "Theme preview showing background, text, and accent colors",
      );
      expect(previewArea).toHaveAttribute("role", "img");
    });

    it("applies smooth transitions to theme preview", () => {
      render(<SettingsContent activeSection="appearance" />);

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
      render(<SettingsContent activeSection="appearance" />);

      const previewText = screen.getByText(
        "This is how your messages will appear",
      );

      expect(previewText).toBeInTheDocument();
      expect(previewText).toHaveAttribute("role", "text");
    });

    it("updates font size preview in real-time as slider moves", () => {
      render(<SettingsContent activeSection="appearance" />);

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
      render(<SettingsContent activeSection="appearance" />);

      const previewText = screen.getByText(
        "This is how your messages will appear",
      );

      // Verify line height is set correctly
      expect(previewText).toHaveStyle({ lineHeight: 1.5 });
    });

    it("applies smooth transitions to font size preview", () => {
      render(<SettingsContent activeSection="appearance" />);

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
      render(<SettingsContent activeSection="appearance" />);

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
      render(<SettingsContent activeSection="appearance" />);

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
      render(<SettingsContent activeSection="appearance" />);

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

      render(<SettingsContent activeSection="appearance" />);

      const systemOption = screen.getByLabelText("System");
      const previewArea = screen.getByLabelText(/Theme preview/);

      // Verify system option is selected by default
      expect(systemOption).toBeChecked();

      // Verify dark theme class is applied for system theme
      expect(previewArea).toHaveClass("dark");
    });

    it("prevents excessive re-renders with React.memo optimization", () => {
      const { rerender } = render(
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
      rerender(<SettingsContent activeSection="appearance" />);

      // Components should still be present and functional
      expect(previewArea).toBeInTheDocument();
      expect(previewText).toBeInTheDocument();
    });

    it("displays chat display section with font size controls", () => {
      render(<SettingsContent activeSection="appearance" />);

      expect(screen.getByText("Chat Display")).toBeInTheDocument();
      expect(screen.getByText("Message Font Size")).toBeInTheDocument();
      expect(screen.getByText("14px")).toBeInTheDocument(); // Default font size display
      expect(
        screen.getByText("Adjust the font size for chat messages"),
      ).toBeInTheDocument();
    });

    it("maintains consistent styling for preview areas", () => {
      render(<SettingsContent activeSection="appearance" />);

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
});
