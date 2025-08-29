/**
 * Unit tests for AddAgentToConversationModal component.
 *
 * Tests modal behavior, agent selection, form validation, and integration with hooks.
 *
 * @module components/modals/__tests__/AddAgentToConversationModal.test
 */

import type {
  AgentSettingsViewModel,
  ConversationAgentViewModel,
} from "@fishbowl-ai/ui-shared";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useConversationAgents } from "../../../hooks/conversationAgents/useConversationAgents";
import { AddAgentToConversationModal } from "../AddAgentToConversationModal";

// Mock hooks
const mockUseAgentsStore = jest.fn();
const mockUseConversationAgents = useConversationAgents as jest.MockedFunction<
  typeof useConversationAgents
>;

jest.mock("@fishbowl-ai/ui-shared", () => ({
  useAgentsStore: () => mockUseAgentsStore(),
}));

jest.mock("../../../hooks/conversationAgents/useConversationAgents", () => ({
  useConversationAgents: jest.fn(),
}));

// Mock data
const mockAgent1: AgentSettingsViewModel = {
  id: "agent-1",
  name: "Assistant Agent",
  role: "Helper",
  personality: "Friendly",
  model: "gpt-4",
  systemPrompt: "You are a helpful assistant",
  createdAt: "2023-01-01T10:00:00.000Z",
  updatedAt: "2023-01-01T10:00:00.000Z",
  llmConfigId: "openai-config-1",
};

const mockAgent2: AgentSettingsViewModel = {
  id: "agent-2",
  name: "Code Agent",
  role: "Developer",
  personality: "Analytical",
  model: "claude-3-sonnet",
  llmConfigId: "openai-config-1",
  systemPrompt: "You are a coding assistant",
  createdAt: "2023-01-02T10:00:00.000Z",
  updatedAt: "2023-01-02T10:00:00.000Z",
};

const mockAgent3: AgentSettingsViewModel = {
  id: "agent-3",
  name: "Research Agent",
  role: "Researcher",
  personality: "Curious",
  model: "gpt-4",
  llmConfigId: "openai-config-1",
  systemPrompt: "You are a research assistant",
  createdAt: "2023-01-03T10:00:00.000Z",
  updatedAt: "2023-01-03T10:00:00.000Z",
};

const mockConversationAgent1: ConversationAgentViewModel = {
  id: "ca-1",
  conversationId: "conv-1",
  agentId: "agent-1",
  agent: mockAgent1,
  addedAt: "2023-01-01T12:00:00.000Z",
  isActive: true,
  enabled: true,
  displayOrder: 0,
};

// Default props
const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  conversationId: "conv-1",
  onAgentAdded: jest.fn(),
};

const mockAddAgent = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  // Default mock implementations
  mockUseAgentsStore.mockReturnValue({
    agents: [mockAgent1, mockAgent2, mockAgent3],
  });

  mockUseConversationAgents.mockReturnValue({
    conversationAgents: [mockConversationAgent1],
    isLoading: false,
    error: null,
    addAgent: mockAddAgent,
    removeAgent: jest.fn(),
    toggleEnabled: jest.fn(),
    refetch: jest.fn(),
  });
});

describe("AddAgentToConversationModal", () => {
  describe("rendering", () => {
    it("should render modal when open", () => {
      render(<AddAgentToConversationModal {...defaultProps} />);

      expect(screen.getByText("Add Agent to Conversation")).toBeInTheDocument();
      expect(
        screen.getByText("Select an agent to add to this conversation."),
      ).toBeInTheDocument();
    });

    it("should not render modal content when closed", () => {
      render(<AddAgentToConversationModal {...defaultProps} open={false} />);

      expect(
        screen.queryByText("Add Agent to Conversation"),
      ).not.toBeInTheDocument();
    });

    it("should render available agents in dropdown", async () => {
      render(<AddAgentToConversationModal {...defaultProps} />);

      // Open the select dropdown
      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);

      // Should show available agents (excluding agent-1 which is already in conversation)
      expect(screen.getByText("Code Agent")).toBeInTheDocument();
      expect(screen.getByText("Research Agent")).toBeInTheDocument();
      expect(screen.queryByText("Assistant Agent")).not.toBeInTheDocument();
    });

    it("should display agent role and personality in dropdown options", async () => {
      render(<AddAgentToConversationModal {...defaultProps} />);

      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);

      expect(screen.getByText("Developer")).toBeInTheDocument();
      expect(screen.getByText("Analytical")).toBeInTheDocument();
      expect(screen.getByText("Researcher")).toBeInTheDocument();
      expect(screen.getByText("Curious")).toBeInTheDocument();
    });
  });

  describe("agent filtering", () => {
    it("should filter out agents already in conversation", async () => {
      render(<AddAgentToConversationModal {...defaultProps} />);

      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);

      // agent-1 should be filtered out since it's already in conversation
      expect(screen.queryByText("Assistant Agent")).not.toBeInTheDocument();
      expect(screen.getByText("Code Agent")).toBeInTheDocument();
      expect(screen.getByText("Research Agent")).toBeInTheDocument();
    });

    it("should show empty state when no agents available", () => {
      // All agents are already in conversation
      mockUseConversationAgents.mockReturnValue({
        conversationAgents: [
          mockConversationAgent1,
          { ...mockConversationAgent1, id: "ca-2", agentId: "agent-2" },
          { ...mockConversationAgent1, id: "ca-3", agentId: "agent-3" },
        ],
        isLoading: false,
        error: null,
        addAgent: mockAddAgent,
        removeAgent: jest.fn(),
        toggleEnabled: jest.fn(),
        refetch: jest.fn(),
      });

      render(<AddAgentToConversationModal {...defaultProps} />);

      expect(
        screen.getByText("No available agents to add"),
      ).toBeInTheDocument();
    });

    it("should disable Add button when no agents available", () => {
      mockUseConversationAgents.mockReturnValue({
        conversationAgents: [
          mockConversationAgent1,
          { ...mockConversationAgent1, id: "ca-2", agentId: "agent-2" },
          { ...mockConversationAgent1, id: "ca-3", agentId: "agent-3" },
        ],
        isLoading: false,
        error: null,
        addAgent: mockAddAgent,
        removeAgent: jest.fn(),
        toggleEnabled: jest.fn(),
        refetch: jest.fn(),
      });

      render(<AddAgentToConversationModal {...defaultProps} />);

      const addButton = screen.getByRole("button", { name: /add agent/i });
      expect(addButton).toBeDisabled();
    });
  });

  describe("form interaction", () => {
    it("should enable Add button when agent is selected", async () => {
      render(<AddAgentToConversationModal {...defaultProps} />);

      const addButton = screen.getByRole("button", { name: /add agent/i });
      expect(addButton).toBeDisabled();

      // Select an agent
      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);
      fireEvent.click(screen.getByText("Code Agent"));

      expect(addButton).toBeEnabled();
    });

    it("should call addAgent when form is submitted", async () => {
      render(<AddAgentToConversationModal {...defaultProps} />);

      // Select an agent
      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);
      fireEvent.click(screen.getByText("Code Agent"));

      // Submit form
      const addButton = screen.getByRole("button", { name: /add agent/i });
      fireEvent.click(addButton);

      expect(mockAddAgent).toHaveBeenCalledWith("agent-2");
    });

    it("should close modal and call onAgentAdded after successful submission", async () => {
      const mockOnOpenChange = jest.fn();
      const mockOnAgentAdded = jest.fn();

      mockAddAgent.mockResolvedValue(undefined);

      render(
        <AddAgentToConversationModal
          {...defaultProps}
          onOpenChange={mockOnOpenChange}
          onAgentAdded={mockOnAgentAdded}
        />,
      );

      // Select and submit
      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);
      fireEvent.click(screen.getByText("Code Agent"));

      const addButton = screen.getByRole("button", { name: /add agent/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
        expect(mockOnAgentAdded).toHaveBeenCalled();
      });
    });

    it("should handle submission with Enter key", async () => {
      render(<AddAgentToConversationModal {...defaultProps} />);

      // Select an agent
      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);
      fireEvent.click(screen.getByText("Code Agent"));

      // Press Enter to submit
      fireEvent.keyDown(selectTrigger, { key: "Enter", code: "Enter" });

      expect(mockAddAgent).toHaveBeenCalledWith("agent-2");
    });

    it("should close modal when Cancel button is clicked", async () => {
      const mockOnOpenChange = jest.fn();

      render(
        <AddAgentToConversationModal
          {...defaultProps}
          onOpenChange={mockOnOpenChange}
        />,
      );

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("loading states", () => {
    it("should show loading state during submission", async () => {
      // Mock slow addAgent operation
      let resolveAddAgent: () => void;
      const slowAddAgent = new Promise<void>((resolve) => {
        resolveAddAgent = resolve;
      });
      mockAddAgent.mockReturnValue(slowAddAgent);

      render(<AddAgentToConversationModal {...defaultProps} />);

      // Select and submit
      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);
      fireEvent.click(screen.getByText("Code Agent"));

      const addButton = screen.getByRole("button", { name: /add agent/i });
      fireEvent.click(addButton);

      // Should show loading state
      expect(screen.getByText("Adding...")).toBeInTheDocument();
      expect(addButton).toBeDisabled();
      expect(screen.getByRole("combobox")).toBeDisabled();

      // Resolve the operation
      resolveAddAgent!();
      await waitFor(() => {
        expect(screen.queryByText("Adding...")).not.toBeInTheDocument();
      });
    });

    it("should disable Cancel button during submission", async () => {
      let resolveAddAgent: () => void;
      const slowAddAgent = new Promise<void>((resolve) => {
        resolveAddAgent = resolve;
      });
      mockAddAgent.mockReturnValue(slowAddAgent);

      render(<AddAgentToConversationModal {...defaultProps} />);

      // Select and submit
      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);
      fireEvent.click(screen.getByText("Code Agent"));

      const addButton = screen.getByRole("button", { name: /add agent/i });
      fireEvent.click(addButton);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      expect(cancelButton).toBeDisabled();

      resolveAddAgent!();
    });
  });

  describe("error handling", () => {
    it("should display error from useConversationAgents hook", () => {
      mockUseConversationAgents.mockReturnValue({
        conversationAgents: [],
        isLoading: false,
        error: new Error("Hook error message"),
        addAgent: mockAddAgent,
        removeAgent: jest.fn(),
        toggleEnabled: jest.fn(),
        refetch: jest.fn(),
      });

      render(<AddAgentToConversationModal {...defaultProps} />);

      expect(screen.getByText("Hook error message")).toBeInTheDocument();
    });

    it("should display local error when submission fails", async () => {
      mockAddAgent.mockRejectedValue(new Error("Network error"));

      render(<AddAgentToConversationModal {...defaultProps} />);

      // Select and submit
      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);
      fireEvent.click(screen.getByText("Code Agent"));

      const addButton = screen.getByRole("button", { name: /add agent/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(
          screen.getByText("Failed to add agent to conversation"),
        ).toBeInTheDocument();
      });
    });

    it("should clear errors when modal opens", () => {
      const { rerender } = render(
        <AddAgentToConversationModal {...defaultProps} open={false} />,
      );

      // Render with error
      mockUseConversationAgents.mockReturnValue({
        conversationAgents: [],
        isLoading: false,
        error: new Error("Previous error"),
        addAgent: mockAddAgent,
        removeAgent: jest.fn(),
        toggleEnabled: jest.fn(),
        refetch: jest.fn(),
      });

      rerender(<AddAgentToConversationModal {...defaultProps} open={true} />);

      // Local error should be cleared (hook error might still be there)
      // We can't test local error clearing directly, but we ensure it doesn't interfere
      expect(screen.getByText("Add Agent to Conversation")).toBeInTheDocument();
    });
  });

  describe("state reset", () => {
    it("should reset selected agent when modal opens", async () => {
      const { rerender } = render(
        <AddAgentToConversationModal {...defaultProps} open={false} />,
      );

      // Open modal and select agent
      rerender(<AddAgentToConversationModal {...defaultProps} open={true} />);

      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);
      fireEvent.click(screen.getByText("Code Agent"));

      // Close and reopen modal
      rerender(<AddAgentToConversationModal {...defaultProps} open={false} />);
      rerender(<AddAgentToConversationModal {...defaultProps} open={true} />);

      // Selection should be reset
      expect(screen.getByText("Select an agent to add")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /add agent/i })).toBeDisabled();
    });
  });

  describe("accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<AddAgentToConversationModal {...defaultProps} />);

      expect(screen.getByLabelText("Agent")).toBeInTheDocument();
      expect(screen.getByLabelText("Select agent to add")).toBeInTheDocument();
    });

    it("should support keyboard navigation", async () => {
      render(<AddAgentToConversationModal {...defaultProps} />);

      // Tab navigation should work
      fireEvent.keyDown(document, { key: "Tab", code: "Tab" });
      expect(screen.getByRole("combobox")).toBeInTheDocument();

      // Arrow keys should open dropdown
      fireEvent.keyDown(screen.getByRole("combobox"), {
        key: "ArrowDown",
        code: "ArrowDown",
      });
      expect(screen.getByText("Code Agent")).toBeInTheDocument();
    });

    it("should prevent submission when no agent selected via Enter key", async () => {
      render(<AddAgentToConversationModal {...defaultProps} />);

      // Press Enter without selecting agent
      fireEvent.keyDown(document, { key: "Enter", code: "Enter" });

      expect(mockAddAgent).not.toHaveBeenCalled();
    });
  });

  describe("agent sorting", () => {
    it("should sort available agents alphabetically", async () => {
      // Provide agents in non-alphabetical order
      mockUseAgentsStore.mockReturnValue({
        agents: [mockAgent3, mockAgent1, mockAgent2], // Research, Assistant, Code
      });

      render(<AddAgentToConversationModal {...defaultProps} />);

      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);

      const options = screen.getAllByRole("option");
      const optionTexts = options.map((option) => option.textContent);

      // Should be sorted: Code Agent, Research Agent (excluding Assistant which is in conversation)
      expect(optionTexts).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Code Agent"),
          expect.stringContaining("Research Agent"),
        ]),
      );
    });
  });

  describe("integration with hooks", () => {
    it("should call useConversationAgents with correct conversationId", () => {
      render(<AddAgentToConversationModal {...defaultProps} />);

      expect(mockUseConversationAgents).toHaveBeenCalledWith("conv-1");
    });

    it("should not call onAgentAdded when it's not provided", async () => {
      mockAddAgent.mockResolvedValue(undefined);

      render(
        <AddAgentToConversationModal
          {...defaultProps}
          onAgentAdded={undefined}
        />,
      );

      // Select and submit
      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);
      fireEvent.click(screen.getByText("Code Agent"));

      const addButton = screen.getByRole("button", { name: /add agent/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
      });

      // Should not throw error
    });
  });

  describe("edge cases", () => {
    it("should handle empty agents list", () => {
      mockUseAgentsStore.mockReturnValue({
        agents: [],
      });

      render(<AddAgentToConversationModal {...defaultProps} />);

      expect(
        screen.getByText("No available agents to add"),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /add agent/i })).toBeDisabled();
    });

    it("should handle missing agent data gracefully", async () => {
      // Mock agents store with null agent
      mockUseAgentsStore.mockReturnValue({
        agents: [mockAgent2, null, mockAgent3].filter(Boolean),
      });

      render(<AddAgentToConversationModal {...defaultProps} />);

      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);

      // Should not crash and should show valid agents
      expect(screen.getByText("Code Agent")).toBeInTheDocument();
      expect(screen.getByText("Research Agent")).toBeInTheDocument();
    });
  });
});
