import type { AgentCard as AgentCardType } from "@fishbowl-ai/ui-shared";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { AgentCard } from "../AgentCard";

// Mock the useServices hook
jest.mock("../../../../contexts/useServices");
const mockUseServices = jest.fn();
jest.doMock("../../../../contexts/useServices", () => ({
  useServices: mockUseServices,
}));

// Mock the useLlmModels hook
const mockUseLlmModels = jest.fn();
jest.mock("../../../../hooks/useLlmModels", () => ({
  useLlmModels: () => mockUseLlmModels(),
}));

// Mock data using IDs that will be converted to display names
const mockAgent: AgentCardType = {
  id: "test-agent-1",
  name: "Research Assistant",
  model: "gpt-4-turbo", // ID instead of display name
  role: "project-manager", // ID instead of display name
  llmConfigId: "openai-config-1",
};

const defaultProps = {
  agent: mockAgent,
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

// Mock LLM models data
const mockModels = [
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "openai",
    configId: "openai-config-1",
    configLabel: "OpenAI",
    contextLength: 128000,
  },
  {
    id: "claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "anthropic",
    configId: "anthropic-config-1",
    configLabel: "Anthropic",
    contextLength: 200000,
  },
];

describe("AgentCard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock return values
    mockUseServices.mockReturnValue({
      logger: {
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      },
    });

    mockUseLlmModels.mockReturnValue({
      models: mockModels,
      loading: false,
      error: null,
      refresh: jest.fn(),
    });
  });

  describe("Rendering", () => {
    it("renders agent name prominently", () => {
      render(<AgentCard {...defaultProps} />);

      const nameElement = screen.getByText("Research Assistant");
      expect(nameElement).toBeInTheDocument();
      expect(nameElement).toHaveClass("text-lg");
    });

    it("displays agent model information", () => {
      render(<AgentCard {...defaultProps} />);

      const modelElement = screen.getByText("GPT-4 Turbo");
      expect(modelElement).toBeInTheDocument();
      expect(modelElement).toHaveClass("text-sm", "text-muted-foreground");
    });

    it("displays agent role information", () => {
      render(<AgentCard {...defaultProps} />);

      const roleElement = screen.getByText("Project Manager");
      expect(roleElement).toBeInTheDocument();
      expect(roleElement).toHaveClass("text-sm", "text-muted-foreground");
    });

    it("renders with proper card structure", () => {
      const { container } = render(<AgentCard {...defaultProps} />);

      const card = container.querySelector('[class*="hover:shadow-md"]');
      expect(card).toBeInTheDocument();
    });

    it("applies custom className when provided", () => {
      const { container } = render(
        <AgentCard {...defaultProps} className="custom-class" />,
      );

      const card = container.querySelector(".custom-class");
      expect(card).toBeInTheDocument();
    });
  });

  describe("Action Buttons", () => {
    it("renders edit button with proper accessibility", () => {
      render(<AgentCard {...defaultProps} />);

      const editButton = screen.getByLabelText("Edit Research Assistant agent");
      expect(editButton).toBeInTheDocument();
      expect(editButton).toHaveAttribute(
        "aria-label",
        "Edit Research Assistant agent",
      );
    });

    it("renders delete button with proper accessibility", () => {
      render(<AgentCard {...defaultProps} />);

      const deleteButton = screen.getByLabelText(
        "Delete Research Assistant agent",
      );
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveAttribute(
        "aria-label",
        "Delete Research Assistant agent",
      );
    });

    it("calls onEdit with agent ID when edit button clicked", () => {
      const onEdit = jest.fn();
      render(<AgentCard {...defaultProps} onEdit={onEdit} />);

      const editButton = screen.getByLabelText("Edit Research Assistant agent");
      fireEvent.click(editButton);

      expect(onEdit).toHaveBeenCalledWith("test-agent-1");
      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it("calls onDelete with agent ID when delete button clicked", () => {
      const onDelete = jest.fn();
      render(<AgentCard {...defaultProps} onDelete={onDelete} />);

      const deleteButton = screen.getByLabelText(
        "Delete Research Assistant agent",
      );
      fireEvent.click(deleteButton);

      expect(onDelete).toHaveBeenCalledWith("test-agent-1");
      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("does not crash when onEdit is undefined", () => {
      render(<AgentCard agent={mockAgent} />);

      const editButton = screen.getByLabelText("Edit Research Assistant agent");

      expect(() => {
        fireEvent.click(editButton);
      }).not.toThrow();
    });

    it("does not crash when onDelete is undefined", () => {
      render(<AgentCard agent={mockAgent} />);

      const deleteButton = screen.getByLabelText(
        "Delete Research Assistant agent",
      );

      expect(() => {
        fireEvent.click(deleteButton);
      }).not.toThrow();
    });
  });

  describe("Keyboard Navigation", () => {
    it("edit button is focusable", () => {
      render(<AgentCard {...defaultProps} />);

      const editButton = screen.getByLabelText("Edit Research Assistant agent");
      editButton.focus();

      expect(editButton).toHaveFocus();
    });

    it("delete button is focusable", () => {
      render(<AgentCard {...defaultProps} />);

      const deleteButton = screen.getByLabelText(
        "Delete Research Assistant agent",
      );
      deleteButton.focus();

      expect(deleteButton).toHaveFocus();
    });
  });

  describe("Visual States", () => {
    it("has hover transition classes", () => {
      const { container } = render(<AgentCard {...defaultProps} />);

      const card = container.querySelector('[class*="hover:shadow-md"]');
      expect(card).toHaveClass("transition-all");
      expect(card).toHaveClass(
        "duration-[var(--dt-animation-hover-transition)]",
      );
    });

    it("has group hover behavior for buttons", () => {
      const { container } = render(<AgentCard {...defaultProps} />);

      const buttonContainer = container.querySelector(
        '[class*="group-hover:opacity-100"]',
      );
      expect(buttonContainer).toBeInTheDocument();
      expect(buttonContainer).toHaveClass("transition-opacity");
    });
  });

  describe("Different Agent Data", () => {
    it("handles different agent names correctly", () => {
      const differentAgent = {
        ...mockAgent,
        name: "Code Reviewer",
      };

      render(<AgentCard agent={differentAgent} onEdit={defaultProps.onEdit} />);

      expect(screen.getByText("Code Reviewer")).toBeInTheDocument();
      expect(
        screen.getByLabelText("Edit Code Reviewer agent"),
      ).toBeInTheDocument();
    });

    it("handles different models and roles", () => {
      const differentAgent = {
        ...mockAgent,
        model: "claude-3-sonnet",
        role: "technical-advisor",
        llmConfigId: "anthropic-config-1", // Update to match Claude model's configId
      };

      render(<AgentCard agent={differentAgent} />);

      expect(screen.getByText("Claude 3 Sonnet")).toBeInTheDocument();
      expect(screen.getByText("Technical Advisor")).toBeInTheDocument();
    });

    it("resolves model display using dual-field lookup (configId + model)", () => {
      const agentWithConfig = {
        ...mockAgent,
        model: "gpt-4-turbo",
        llmConfigId: "openai-config-1",
      };

      render(<AgentCard agent={agentWithConfig} />);

      // Should display resolved model name
      expect(screen.getByText("GPT-4 Turbo")).toBeInTheDocument();
    });

    it("falls back to model string when lookup fails", () => {
      const agentWithMissingModel = {
        ...mockAgent,
        model: "unknown-model",
        llmConfigId: "unknown-config",
      };

      render(<AgentCard agent={agentWithMissingModel} />);

      // Should display fallback model string
      expect(screen.getByText("unknown-model")).toBeInTheDocument();
    });

    it("handles missing llmConfigId gracefully", () => {
      const agentWithoutConfigId = {
        ...mockAgent,
        llmConfigId: "",
      };

      render(<AgentCard agent={agentWithoutConfigId} />);

      // Should display fallback model string when configId is empty
      expect(screen.getByText("gpt-4-turbo")).toBeInTheDocument();
    });

    it("handles empty or minimal data gracefully", () => {
      const minimalAgent = {
        id: "minimal",
        name: "",
        model: "",
        role: "",
        llmConfigId: "config-1",
      };

      expect(() => {
        render(<AgentCard agent={minimalAgent} />);
      }).not.toThrow();
    });
  });
});
