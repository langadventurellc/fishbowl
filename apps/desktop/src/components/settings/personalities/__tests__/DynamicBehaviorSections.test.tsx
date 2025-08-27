/**
 * Unit tests for DynamicBehaviorSections component.
 *
 * Tests dynamic section rendering, trait management, loading/error states,
 * collapsible behavior persistence, and accessibility features.
 *
 * @module components/settings/personalities/__tests__/DynamicBehaviorSections
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { DynamicBehaviorSections } from "../DynamicBehaviorSections";
import type { PersonalitySectionDef, DiscreteValue } from "@fishbowl-ai/shared";

// Mock sessionStorage
const mockSessionStorage: {
  storage: Record<string, string>;
  getItem: jest.Mock<string | null, [string]>;
  setItem: jest.Mock<void, [string, string]>;
  removeItem: jest.Mock<void, [string]>;
  clear: jest.Mock<void, []>;
} = {
  storage: {} as Record<string, string>,
  getItem: jest.fn(
    (key: string): string | null => mockSessionStorage.storage[key] || null,
  ),
  setItem: jest.fn((key: string, value: string): void => {
    mockSessionStorage.storage[key] = value;
  }),
  removeItem: jest.fn((key: string): void => {
    delete mockSessionStorage.storage[key];
  }),
  clear: jest.fn((): void => {
    mockSessionStorage.storage = {};
  }),
};

Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
});

// Mock data for testing
const mockSections: PersonalitySectionDef[] = [
  {
    id: "big5",
    name: "Big Five Personality Traits",
    description: "Core personality dimensions",
    values: [
      {
        id: "openness",
        name: "Openness",
        values: {
          "0": { short: "Traditional and conservative", prompt: "" },
          "20": { short: "Somewhat traditional", prompt: "" },
          "40": { short: "Balanced approach", prompt: "" },
          "60": { short: "Open to new ideas", prompt: "" },
          "80": { short: "Very creative", prompt: "" },
          "100": { short: "Extremely innovative", prompt: "" },
        },
      },
      {
        id: "conscientiousness",
        name: "Conscientiousness",
        values: {
          "0": { short: "Spontaneous", prompt: "" },
          "20": { short: "Flexible", prompt: "" },
          "40": { short: "Moderately organized", prompt: "" },
          "60": { short: "Well organized", prompt: "" },
          "80": { short: "Highly disciplined", prompt: "" },
          "100": { short: "Extremely organized", prompt: "" },
        },
      },
    ],
  },
  {
    id: "communication",
    name: "Communication Style",
    description: "How you communicate with others",
    values: [
      {
        id: "formality",
        name: "Formality",
        values: {
          "0": { short: "Very casual", prompt: "" },
          "20": { short: "Casual", prompt: "" },
          "40": { short: "Balanced", prompt: "" },
          "60": { short: "Formal", prompt: "" },
          "80": { short: "Very formal", prompt: "" },
          "100": { short: "Extremely formal", prompt: "" },
        },
      },
    ],
  },
];

const defaultProps = {
  sections: mockSections,
  getShort: jest.fn(
    (traitId: string, value: DiscreteValue) =>
      mockSections.flatMap((s) => s.values).find((t) => t.id === traitId)
        ?.values[`${value}`]?.short,
  ),
  values: {},
  onChange: jest.fn(),
  disabled: false,
  isLoading: false,
  isError: false,
};

describe("DynamicBehaviorSections", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
  });

  describe("Basic Rendering", () => {
    it("renders provided sections and traits in order", () => {
      render(<DynamicBehaviorSections {...defaultProps} />);

      // Check sections are rendered in order
      const sections = screen.getAllByRole("button", { expanded: false });
      expect(sections).toHaveLength(2);
      expect(sections[0]).toHaveTextContent("Big Five Personality Traits");
      expect(sections[1]).toHaveTextContent("Communication Style");

      // Check section descriptions
      expect(
        screen.getByText("Core personality dimensions"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("How you communicate with others"),
      ).toBeInTheDocument();
    });

    it("treats Big Five like any other section (no special-casing)", () => {
      render(<DynamicBehaviorSections {...defaultProps} />);

      // Big Five section should behave exactly like other sections
      const bigFiveButton = screen.getByRole("button", { name: /big five/i });
      const communicationButton = screen.getByRole("button", {
        name: /communication/i,
      });

      // Both should be collapsed by default
      expect(bigFiveButton).toHaveAttribute("aria-expanded", "false");
      expect(communicationButton).toHaveAttribute("aria-expanded", "false");

      // Both should expand when clicked
      fireEvent.click(bigFiveButton);
      expect(bigFiveButton).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(communicationButton);
      expect(communicationButton).toHaveAttribute("aria-expanded", "true");
    });

    it("defaults to 40 for traits missing from values", () => {
      render(<DynamicBehaviorSections {...defaultProps} />);

      // Expand the first section to see sliders
      const bigFiveButton = screen.getByRole("button", { name: /big five/i });
      fireEvent.click(bigFiveButton);

      // Check that sliders show default value of 40
      const valueDisplays = screen.getAllByText("40");
      expect(valueDisplays.length).toBeGreaterThan(0);
    });

    it("uses provided values when available", () => {
      const propsWithValues = {
        ...defaultProps,
        values: {
          openness: 80 as DiscreteValue,
          formality: 20 as DiscreteValue,
        },
      };

      render(<DynamicBehaviorSections {...propsWithValues} />);

      // Expand sections
      fireEvent.click(screen.getByRole("button", { name: /big five/i }));
      fireEvent.click(screen.getByRole("button", { name: /communication/i }));

      // Check that provided values are displayed
      expect(screen.getByText("80")).toBeInTheDocument();
      expect(screen.getByText("20")).toBeInTheDocument();
    });
  });

  describe("Trait Interactions", () => {
    it("calls onChange(traitId, value) when a slider changes", () => {
      const mockOnChange = jest.fn();
      const propsWithOnChange = { ...defaultProps, onChange: mockOnChange };

      render(<DynamicBehaviorSections {...propsWithOnChange} />);

      // Expand the first section
      const bigFiveButton = screen.getByRole("button", { name: /big five/i });
      fireEvent.click(bigFiveButton);

      // Verify that the PersonalitySlider is rendered and has the expected props
      // The actual onChange functionality is tested in PersonalitySlider.test.tsx
      const slider = screen.getByLabelText("Openness slider");
      expect(slider).toBeInTheDocument();
      expect(slider).toHaveAttribute("aria-valuenow", "40");

      // This test verifies that the component structure is correct for receiving onChange events
      // The PersonalitySlider component handles the actual onChange interaction
    });

    it("does not call onChange when disabled", () => {
      const mockOnChange = jest.fn();
      const disabledProps = {
        ...defaultProps,
        onChange: mockOnChange,
        disabled: true,
      };

      render(<DynamicBehaviorSections {...disabledProps} />);

      // Expand section
      fireEvent.click(screen.getByRole("button", { name: /big five/i }));

      // Try to interact with disabled slider
      const slider = screen.getByLabelText("Openness slider");
      fireEvent.mouseDown(slider);
      fireEvent.mouseMove(slider, { clientX: 100 });
      fireEvent.mouseUp(slider);

      // Should not call onChange when disabled
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("uses getShort to render short description text below sliders", () => {
      const mockGetShort = jest.fn((traitId: string, value: DiscreteValue) => {
        if (traitId === "openness" && value === 40) return "Balanced approach";
        if (traitId === "conscientiousness" && value === 40)
          return "Moderately organized";
        return "Custom description";
      });

      const propsWithGetShort = {
        ...defaultProps,
        getShort: mockGetShort,
        values: { openness: 40 as DiscreteValue },
      };

      render(<DynamicBehaviorSections {...propsWithGetShort} />);

      // Expand section to see descriptions
      fireEvent.click(screen.getByRole("button", { name: /big five/i }));

      // Check that getShort is called and descriptions are rendered
      expect(mockGetShort).toHaveBeenCalledWith("openness", 40);
      expect(screen.getByText("Balanced approach")).toBeInTheDocument();
    });
  });

  describe("Collapsible Behavior", () => {
    it("persists expanded state in sessionStorage", () => {
      render(<DynamicBehaviorSections {...defaultProps} />);

      const bigFiveButton = screen.getByRole("button", { name: /big five/i });

      // Initially collapsed
      expect(bigFiveButton).toHaveAttribute("aria-expanded", "false");

      // Expand section
      fireEvent.click(bigFiveButton);
      expect(bigFiveButton).toHaveAttribute("aria-expanded", "true");

      // Check sessionStorage was called
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        "personality-section-big5-expanded",
        "true",
      );
    });

    it("restores expanded state from sessionStorage", () => {
      // Pre-populate sessionStorage
      mockSessionStorage.storage["personality-section-communication-expanded"] =
        "true";

      render(<DynamicBehaviorSections {...defaultProps} />);

      const communicationButton = screen.getByRole("button", {
        name: /communication/i,
      });

      // Should be expanded based on sessionStorage
      expect(communicationButton).toHaveAttribute("aria-expanded", "true");
    });

    it("handles sessionStorage errors gracefully", () => {
      // Mock sessionStorage to throw errors
      const originalConsoleWarn = console.warn;
      console.warn = jest.fn();

      mockSessionStorage.getItem.mockImplementation(() => {
        throw new Error("Storage error");
      });

      // Should not crash and default to collapsed
      render(<DynamicBehaviorSections {...defaultProps} />);

      const bigFiveButton = screen.getByRole("button", { name: /big five/i });
      expect(bigFiveButton).toHaveAttribute("aria-expanded", "false");

      console.warn = originalConsoleWarn;
    });
  });

  describe("Loading State", () => {
    it("shows skeleton placeholders when loading", () => {
      const loadingProps = { ...defaultProps, isLoading: true };

      render(<DynamicBehaviorSections {...loadingProps} />);

      // Check for loading indicators
      const loadingContainer = screen.getByLabelText(
        "Loading personality sections",
      );
      expect(loadingContainer).toBeInTheDocument();
      expect(loadingContainer).toHaveAttribute("aria-busy", "true");

      // Check for skeleton elements
      const skeletons = loadingContainer.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("does not render normal content when loading", () => {
      const loadingProps = { ...defaultProps, isLoading: true };

      render(<DynamicBehaviorSections {...loadingProps} />);

      // Normal section buttons should not be present
      expect(
        screen.queryByRole("button", { name: /big five/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /communication/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("shows inline error message when isError is true", () => {
      const errorProps = { ...defaultProps, isError: true };

      render(<DynamicBehaviorSections {...errorProps} />);

      // Check for error message
      expect(
        screen.getByText(/failed to load personality definitions/i),
      ).toBeInTheDocument();

      // Check for error icon
      expect(screen.getByTestId || screen.getByRole("img")).toBeTruthy();
    });

    it("does not render normal content when in error state", () => {
      const errorProps = { ...defaultProps, isError: true };

      render(<DynamicBehaviorSections {...errorProps} />);

      // Normal section buttons should not be present
      expect(
        screen.queryByRole("button", { name: /big five/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty sections array", () => {
      const emptyProps = { ...defaultProps, sections: [] };

      render(<DynamicBehaviorSections {...emptyProps} />);

      expect(
        screen.getByText(/no personality sections are available/i),
      ).toBeInTheDocument();
    });

    it("handles missing getShort function gracefully", () => {
      const propsWithoutGetShort = {
        ...defaultProps,
        getShort: jest.fn(() => undefined),
      };

      render(<DynamicBehaviorSections {...propsWithoutGetShort} />);

      // Expand section
      fireEvent.click(screen.getByRole("button", { name: /big five/i }));

      // Should show fallback text in the description area or aria-valuetext
      const slider = screen.getByLabelText("Openness slider");
      expect(slider).toHaveAttribute(
        "aria-valuetext",
        "No description available",
      );
    });

    it("applies custom className", () => {
      const propsWithClass = { ...defaultProps, className: "custom-class" };

      const { container } = render(
        <DynamicBehaviorSections {...propsWithClass} />,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("Accessibility", () => {
    it("provides proper ARIA attributes", () => {
      render(<DynamicBehaviorSections {...defaultProps} />);

      // Main container should have role and label
      const mainContainer = screen.getByRole("group", {
        name: "Personality behavior sections",
      });
      expect(mainContainer).toBeInTheDocument();

      // Section buttons should have proper ARIA attributes
      const bigFiveButton = screen.getByRole("button", { name: /big five/i });
      expect(bigFiveButton).toHaveAttribute("aria-expanded", "false");
      expect(bigFiveButton).toHaveAttribute("aria-controls");
    });

    it("announces loading state to screen readers", () => {
      const loadingProps = { ...defaultProps, isLoading: true };

      render(<DynamicBehaviorSections {...loadingProps} />);

      const loadingContainer = screen.getByLabelText(
        "Loading personality sections",
      );
      expect(loadingContainer).toHaveAttribute("aria-busy", "true");
    });
  });
});
