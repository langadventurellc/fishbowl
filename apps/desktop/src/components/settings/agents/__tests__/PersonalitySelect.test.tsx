/**
 * Test suite for PersonalitySelect component
 *
 * Tests verify:
 * - Component rendering with different states (loading, error, empty, success)
 * - Personality selection functionality
 * - Error handling and retry functionality
 * - Accessibility features (keyboard navigation, ARIA labels)
 * - Props interface functionality
 */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import type { PersonalityViewModel } from "@fishbowl-ai/ui-shared";
import { PersonalitySelect } from "../PersonalitySelect";

// Mock the store hook
jest.mock("@fishbowl-ai/ui-shared", () => ({
  usePersonalitiesStore: jest.fn(),
}));

const { usePersonalitiesStore } = require("@fishbowl-ai/ui-shared");

const mockPersonalities: PersonalityViewModel[] = [
  {
    id: "personality-1",
    name: "Creative Thinker",
    bigFive: {
      openness: 85,
      conscientiousness: 70,
      extraversion: 60,
      agreeableness: 75,
      neuroticism: 30,
    },
    behaviors: {
      creativity: 90,
      analytical: 70,
    },
    customInstructions: "Focus on creative and innovative solutions",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "personality-2",
    name: "Analytical Expert",
    bigFive: {
      openness: 60,
      conscientiousness: 90,
      extraversion: 40,
      agreeableness: 60,
      neuroticism: 20,
    },
    behaviors: {
      analytical: 95,
      creativity: 50,
    },
    customInstructions:
      "Provide detailed analysis and data-driven insights with thorough explanations",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "personality-3",
    name: "Collaborative Assistant",
    bigFive: {
      openness: 75,
      conscientiousness: 80,
      extraversion: 85,
      agreeableness: 95,
      neuroticism: 25,
    },
    behaviors: {
      empathy: 90,
      communication: 85,
    },
    customInstructions: "",
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
  },
];

const defaultProps = {
  value: "",
  onChange: jest.fn(),
  disabled: false,
  placeholder: "Select a personality",
};

describe("PersonalitySelect Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Loading State", () => {
    beforeEach(() => {
      usePersonalitiesStore.mockImplementation((selector: any) => {
        const mockStore = {
          personalities: [],
          isLoading: true,
          error: null,
          retryLastOperation: jest.fn(),
        };
        return typeof selector === "function" ? selector(mockStore) : mockStore;
      });
    });

    it("displays loading spinner with descriptive text", () => {
      render(<PersonalitySelect {...defaultProps} />);

      expect(screen.getByText("Loading personalities...")).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument();

      // Check that the status div has proper aria attributes
      const statusDiv = screen.getByRole("status");
      expect(statusDiv).toHaveAttribute("aria-live", "polite");
    });

    it("does not render select dropdown when loading", () => {
      render(<PersonalitySelect {...defaultProps} />);

      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    const mockRetry = jest.fn();

    beforeEach(() => {
      usePersonalitiesStore.mockImplementation((selector: any) => {
        const mockStore = {
          personalities: [],
          isLoading: false,
          error: { message: "Failed to load personalities from storage" },
          retryLastOperation: mockRetry,
        };
        return typeof selector === "function" ? selector(mockStore) : mockStore;
      });
    });

    it("displays error message with retry button", () => {
      render(<PersonalitySelect {...defaultProps} />);

      expect(
        screen.getByText(/Failed to load personalities/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Failed to load personalities from storage/),
      ).toBeInTheDocument();

      const retryButton = screen.getByRole("button");
      expect(retryButton).toBeInTheDocument();
    });

    it("calls retryLastOperation when retry button is clicked", () => {
      render(<PersonalitySelect {...defaultProps} />);

      const retryButton = screen.getByRole("button");
      fireEvent.click(retryButton);

      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it("does not render select dropdown when in error state", () => {
      render(<PersonalitySelect {...defaultProps} />);

      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    beforeEach(() => {
      usePersonalitiesStore.mockImplementation((selector: any) => {
        const mockStore = {
          personalities: [],
          isLoading: false,
          error: null,
          retryLastOperation: jest.fn(),
        };
        return typeof selector === "function" ? selector(mockStore) : mockStore;
      });
    });

    it("displays appropriate message when no personalities available", () => {
      render(<PersonalitySelect {...defaultProps} />);

      expect(
        screen.getByText("No personalities available"),
      ).toBeInTheDocument();
    });

    it("does not render select dropdown when empty", () => {
      render(<PersonalitySelect {...defaultProps} />);

      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });
  });

  describe("Success State with Personalities", () => {
    beforeEach(() => {
      usePersonalitiesStore.mockImplementation((selector: any) => {
        const mockStore = {
          personalities: mockPersonalities,
          isLoading: false,
          error: null,
          retryLastOperation: jest.fn(),
        };
        return typeof selector === "function" ? selector(mockStore) : mockStore;
      });
    });

    it("renders select dropdown with placeholder", () => {
      render(<PersonalitySelect {...defaultProps} />);

      const selectTrigger = screen.getByRole("combobox");
      expect(selectTrigger).toBeInTheDocument();
      expect(screen.getByText("Select a personality")).toBeInTheDocument();
    });

    it("displays custom placeholder when provided", () => {
      render(
        <PersonalitySelect
          {...defaultProps}
          placeholder="Choose personality..."
        />,
      );

      expect(screen.getByText("Choose personality...")).toBeInTheDocument();
    });

    it("shows personality options when opened", () => {
      render(<PersonalitySelect {...defaultProps} />);

      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);

      expect(screen.getByText("Creative Thinker")).toBeInTheDocument();
      expect(screen.getByText("Analytical Expert")).toBeInTheDocument();
      expect(screen.getByText("Collaborative Assistant")).toBeInTheDocument();
    });

    it("displays custom instructions preview for personalities with instructions", () => {
      render(<PersonalitySelect {...defaultProps} />);

      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);

      // Check truncated custom instructions
      expect(
        screen.getByText("Focus on creative and innovative solutions"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Provide detailed analysis and data-driven insights...",
        ),
      ).toBeInTheDocument();
    });

    it("truncates long custom instructions with ellipsis", () => {
      render(<PersonalitySelect {...defaultProps} />);

      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);

      // The second personality has instructions longer than 50 chars
      expect(
        screen.getByText(
          "Provide detailed analysis and data-driven insights...",
        ),
      ).toBeInTheDocument();
    });

    it("does not show custom instructions when empty", () => {
      render(<PersonalitySelect {...defaultProps} />);

      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);

      // Collaborative Assistant has empty customInstructions
      const collaborativeOption = screen.getByText(
        "Collaborative Assistant",
      ).parentElement;
      expect(collaborativeOption?.textContent).toBe("Collaborative Assistant");
    });

    it("calls onChange with personality ID when option is selected", () => {
      const mockOnChange = jest.fn();
      render(<PersonalitySelect {...defaultProps} onChange={mockOnChange} />);

      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);

      const creativeOption = screen.getByText("Creative Thinker");
      fireEvent.click(creativeOption);

      expect(mockOnChange).toHaveBeenCalledWith("personality-1");
    });

    it("displays selected personality when value is provided", () => {
      render(<PersonalitySelect {...defaultProps} value="personality-2" />);

      expect(screen.getByText("Analytical Expert")).toBeInTheDocument();
    });
  });

  describe("Disabled State", () => {
    beforeEach(() => {
      usePersonalitiesStore.mockImplementation((selector: any) => {
        const mockStore = {
          personalities: mockPersonalities,
          isLoading: false,
          error: null,
          retryLastOperation: jest.fn(),
        };
        return typeof selector === "function" ? selector(mockStore) : mockStore;
      });
    });

    it("disables select when disabled prop is true", () => {
      render(<PersonalitySelect {...defaultProps} disabled={true} />);

      const selectTrigger = screen.getByRole("combobox");
      expect(selectTrigger).toBeDisabled();
    });

    it("allows interaction when disabled prop is false", () => {
      render(<PersonalitySelect {...defaultProps} disabled={false} />);

      const selectTrigger = screen.getByRole("combobox");
      expect(selectTrigger).not.toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      usePersonalitiesStore.mockImplementation((selector: any) => {
        const mockStore = {
          personalities: mockPersonalities,
          isLoading: false,
          error: null,
          retryLastOperation: jest.fn(),
        };
        return typeof selector === "function" ? selector(mockStore) : mockStore;
      });
    });

    it("has proper ARIA attributes", () => {
      render(<PersonalitySelect {...defaultProps} />);

      const selectTrigger = screen.getByRole("combobox");
      expect(selectTrigger).toHaveAttribute("aria-expanded", "false");
    });

    it("supports keyboard navigation", () => {
      const mockOnChange = jest.fn();
      render(<PersonalitySelect {...defaultProps} onChange={mockOnChange} />);

      const selectTrigger = screen.getByRole("combobox");

      // Open with Enter key
      selectTrigger.focus();
      fireEvent.keyDown(selectTrigger, { key: "Enter", code: "Enter" });

      expect(selectTrigger).toHaveAttribute("aria-expanded", "true");
    });

    it("announces loading state to screen readers", () => {
      usePersonalitiesStore.mockImplementation((selector: any) => {
        const mockStore = {
          personalities: [],
          isLoading: true,
          error: null,
          retryLastOperation: jest.fn(),
        };
        return typeof selector === "function" ? selector(mockStore) : mockStore;
      });

      render(<PersonalitySelect {...defaultProps} />);

      expect(screen.getByText("Loading personalities...")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles null personalities array", () => {
      usePersonalitiesStore.mockImplementation((selector: any) => {
        const mockStore = {
          personalities: null,
          isLoading: false,
          error: null,
          retryLastOperation: jest.fn(),
        };
        return typeof selector === "function" ? selector(mockStore) : mockStore;
      });

      render(<PersonalitySelect {...defaultProps} />);

      expect(
        screen.getByText("No personalities available"),
      ).toBeInTheDocument();
    });

    it("handles personalities with missing custom instructions gracefully", () => {
      const personalitiesWithMissingInstructions = [
        {
          ...mockPersonalities[0],
          customInstructions: undefined,
        },
      ];

      usePersonalitiesStore.mockImplementation((selector: any) => {
        const mockStore = {
          personalities: personalitiesWithMissingInstructions,
          isLoading: false,
          error: null,
          retryLastOperation: jest.fn(),
        };
        return typeof selector === "function" ? selector(mockStore) : mockStore;
      });

      render(<PersonalitySelect {...defaultProps} />);

      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);

      expect(screen.getByText("Creative Thinker")).toBeInTheDocument();
    });

    it("validates that selected personality exists in available options", () => {
      render(
        <PersonalitySelect {...defaultProps} value="nonexistent-personality" />,
      );

      // Component should render without errors even with invalid value
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });
});
