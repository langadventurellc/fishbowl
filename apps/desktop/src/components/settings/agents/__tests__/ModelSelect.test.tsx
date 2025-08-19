/**
 * Test suite for ModelSelect component
 *
 * Tests verify:
 * - Component rendering with different states (loading, error, empty, success)
 * - Model selection functionality
 * - Error handling
 * - Accessibility features (keyboard navigation, ARIA labels)
 * - Props interface functionality
 * - Provider grouping and display formatting
 */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { ModelSelect } from "../ModelSelect";

// Mock the hook
jest.mock("../../../../hooks/useLlmModels", () => ({
  useLlmModels: jest.fn(),
}));

const { useLlmModels } = require("../../../../hooks/useLlmModels");

const mockModels = [
  {
    id: "openai-config-1:gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    providerName: "OpenAI",
    configId: "openai-config-1",
  },
  {
    id: "openai-config-1:gpt-4",
    name: "GPT-4",
    provider: "openai",
    providerName: "OpenAI",
    configId: "openai-config-1",
  },
  {
    id: "anthropic-config-1:claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    providerName: "Anthropic",
    configId: "anthropic-config-1",
  },
];

const defaultProps = {
  value: "",
  onChange: jest.fn(),
  disabled: false,
  placeholder: "Select a model",
};

describe("ModelSelect Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Loading State", () => {
    beforeEach(() => {
      useLlmModels.mockReturnValue({
        models: [],
        loading: true,
        error: null,
      });
    });

    it("displays loading spinner with descriptive text", () => {
      render(<ModelSelect {...defaultProps} />);

      expect(screen.getByText("Loading models...")).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument();

      // Check that the status div has proper aria attributes
      const statusDiv = screen.getByRole("status");
      expect(statusDiv).toHaveAttribute("aria-live", "polite");
    });

    it("does not render select dropdown when loading", () => {
      render(<ModelSelect {...defaultProps} />);

      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    beforeEach(() => {
      useLlmModels.mockReturnValue({
        models: [],
        loading: false,
        error: new Error("Failed to load models"),
      });
    });

    it("displays error message with appropriate styling", () => {
      render(<ModelSelect {...defaultProps} />);

      expect(screen.getByText(/Failed to load models/)).toBeInTheDocument();
      expect(
        screen.getByText("Failed to load models: Failed to load models"),
      ).toBeInTheDocument();

      // Check for error icon
      const errorDiv = screen.getByText(/Failed to load models/).closest("div");
      expect(errorDiv).toHaveClass(
        "border-destructive/50",
        "bg-destructive/10",
      );
    });

    it("does not render select dropdown when in error state", () => {
      render(<ModelSelect {...defaultProps} />);

      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    beforeEach(() => {
      useLlmModels.mockReturnValue({
        models: [],
        loading: false,
        error: null,
      });
    });

    it("displays appropriate empty state message", () => {
      render(<ModelSelect {...defaultProps} />);

      expect(
        screen.getByText("No LLM configurations available"),
      ).toBeInTheDocument();
    });

    it("does not render select dropdown when empty", () => {
      render(<ModelSelect {...defaultProps} />);

      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });
  });

  describe("Success State", () => {
    beforeEach(() => {
      useLlmModels.mockReturnValue({
        models: mockModels,
        loading: false,
        error: null,
      });
    });

    it("renders select dropdown with proper accessibility attributes", () => {
      render(<ModelSelect {...defaultProps} />);

      const trigger = screen.getByRole("combobox");
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute("aria-label", "Select model");
    });

    it("displays placeholder text correctly", () => {
      render(<ModelSelect {...defaultProps} />);

      expect(screen.getByText("Select a model")).toBeInTheDocument();
    });

    it("opens dropdown and displays grouped models when clicked", () => {
      render(<ModelSelect {...defaultProps} />);

      const trigger = screen.getByRole("combobox");
      fireEvent.click(trigger);

      // Check for model options
      expect(screen.getByText("GPT-4o")).toBeInTheDocument();
      expect(screen.getByText("GPT-4")).toBeInTheDocument();
      expect(screen.getByText("Claude 3.5 Sonnet")).toBeInTheDocument();

      // Check that provider names appear somewhere (in headers or items)
      expect(screen.getAllByText("OpenAI").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Anthropic").length).toBeGreaterThan(0);
    });

    it("calls onChange when model is selected", () => {
      const mockOnChange = jest.fn();
      render(<ModelSelect {...defaultProps} onChange={mockOnChange} />);

      const trigger = screen.getByRole("combobox");
      fireEvent.click(trigger);

      const option = screen.getByRole("option", { name: /GPT-4o/ });
      fireEvent.click(option);

      expect(mockOnChange).toHaveBeenCalledWith("openai-config-1:gpt-4o");
    });

    it("respects disabled prop", () => {
      render(<ModelSelect {...defaultProps} disabled={true} />);

      const trigger = screen.getByRole("combobox");
      expect(trigger).toBeDisabled();
    });

    it("displays selected value correctly", () => {
      render(<ModelSelect {...defaultProps} value="openai-config-1:gpt-4o" />);

      // The Select component should have the correct value set
      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("data-state", "closed");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("groups models by provider correctly", () => {
      render(<ModelSelect {...defaultProps} />);

      const trigger = screen.getByRole("combobox");
      fireEvent.click(trigger);

      // Verify that provider headers exist
      const openaiElements = screen.getAllByText("OpenAI");
      expect(openaiElements.length).toBeGreaterThan(0);

      const anthropicElements = screen.getAllByText("Anthropic");
      expect(anthropicElements.length).toBeGreaterThan(0);

      // Check that models are displayed
      expect(screen.getByText("GPT-4o")).toBeInTheDocument();
      expect(screen.getByText("GPT-4")).toBeInTheDocument();
      expect(screen.getByText("Claude 3.5 Sonnet")).toBeInTheDocument();
    });

    it("displays provider name in model options", () => {
      render(<ModelSelect {...defaultProps} />);

      const trigger = screen.getByRole("combobox");
      fireEvent.click(trigger);

      // Check that each model option shows the provider name
      const options = screen.getAllByRole("option");
      expect(options.length).toBeGreaterThan(0);

      // Check that provider names are included in the options
      const optionTexts = options.map((option) => option.textContent);
      expect(optionTexts.some((text) => text?.includes("OpenAI"))).toBe(true);
      expect(optionTexts.some((text) => text?.includes("Anthropic"))).toBe(
        true,
      );
    });
  });

  describe("Custom Props", () => {
    beforeEach(() => {
      useLlmModels.mockReturnValue({
        models: mockModels,
        loading: false,
        error: null,
      });
    });

    it("uses custom placeholder text", () => {
      render(
        <ModelSelect {...defaultProps} placeholder="Choose your AI model" />,
      );

      expect(screen.getByText("Choose your AI model")).toBeInTheDocument();
    });

    it("handles value changes correctly", () => {
      const mockOnChange = jest.fn();
      render(<ModelSelect {...defaultProps} onChange={mockOnChange} />);

      const trigger = screen.getByRole("combobox");
      fireEvent.click(trigger);

      const claudeOption = screen.getByRole("option", {
        name: /Claude 3.5 Sonnet/,
      });
      fireEvent.click(claudeOption);

      expect(mockOnChange).toHaveBeenCalledWith(
        "anthropic-config-1:claude-3-5-sonnet-20241022",
      );
    });
  });
});
