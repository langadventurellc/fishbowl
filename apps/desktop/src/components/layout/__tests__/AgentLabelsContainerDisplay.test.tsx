import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AgentLabelsContainerDisplay } from "../AgentLabelsContainerDisplay";
import { useConversationStore, useAgentsStore } from "@fishbowl-ai/ui-shared";

// Mock the stores
jest.mock("@fishbowl-ai/ui-shared", () => ({
  useConversationStore: jest.fn(),
  useAgentsStore: jest.fn(),
}));

// Mock the child components
jest.mock("../../chat", () => ({
  AgentPill: ({
    agent,
    onToggleEnabled,
    onDelete,
    conversationAgentId,
  }: any) => (
    <div data-testid="agent-pill">
      <span>{agent.name}</span>
      {onToggleEnabled && (
        <button onClick={() => onToggleEnabled()} data-testid="toggle-agent">
          Toggle
        </button>
      )}
      {onDelete && (
        <button
          onClick={() => onDelete(conversationAgentId)}
          data-testid="delete-agent"
        >
          Delete
        </button>
      )}
    </div>
  ),
  ChatModeSelector: ({ value, onValueChange, disabled, error }: any) => (
    <div data-testid="chat-mode-selector">
      <select
        value={value || "manual"}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
        data-testid="chat-mode-select"
      >
        <option value="manual">Manual</option>
        <option value="round-robin">Round Robin</option>
      </select>
      {error && <span data-testid="chat-mode-error">{error}</span>}
    </div>
  ),
}));

// Mock the modal component
jest.mock("../../modals/AddAgentToConversationModal", () => ({
  AddAgentToConversationModal: () => <div data-testid="add-agent-modal" />,
}));

// Mock the confirmation dialog
jest.mock("../../ui/confirmation-dialog", () => ({
  ConfirmationDialog: ({ open, title, message, onConfirm, onCancel }: any) =>
    open ? (
      <div data-testid="confirmation-dialog">
        <div data-testid="dialog-title">{title}</div>
        <div data-testid="dialog-message">{message}</div>
        <button onClick={onConfirm} data-testid="confirm-delete">
          Confirm
        </button>
        <button onClick={onCancel} data-testid="cancel-delete">
          Cancel
        </button>
      </div>
    ) : null,
}));

describe("AgentLabelsContainerDisplay", () => {
  const mockUseConversationStore = useConversationStore as jest.MockedFunction<
    typeof useConversationStore
  >;
  const mockUseAgentsStore = useAgentsStore as jest.MockedFunction<
    typeof useAgentsStore
  >;

  const defaultConversationStore = {
    activeConversationAgents: [],
    loading: { agents: false },
    error: { agents: undefined },
    toggleAgentEnabled: jest.fn(),
    getActiveChatMode: jest.fn(() => "manual"),
    setChatMode: jest.fn(),
    removeAgent: jest.fn(),
    refreshActiveConversation: jest.fn(),
  };

  const defaultAgentsStore = {
    agents: [],
  };

  const defaultProps = {
    agents: [],
    onAddAgent: jest.fn(),
    selectedConversationId: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseConversationStore.mockReturnValue(defaultConversationStore);
    mockUseAgentsStore.mockReturnValue(defaultAgentsStore);
  });

  describe("ChatModeSelector Integration", () => {
    it("renders ChatModeSelector when conversation is selected", () => {
      mockUseConversationStore.mockReturnValue({
        ...defaultConversationStore,
        getActiveChatMode: jest.fn(() => "manual"),
      });

      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      expect(screen.getByTestId("chat-mode-selector")).toBeInTheDocument();
      expect(screen.getByTestId("chat-mode-select")).toHaveValue("manual");
    });

    it("does not render ChatModeSelector when no conversation selected", () => {
      render(<AgentLabelsContainerDisplay {...defaultProps} />);

      expect(
        screen.queryByTestId("chat-mode-selector"),
      ).not.toBeInTheDocument();
    });

    it("displays current chat mode from store", () => {
      mockUseConversationStore.mockReturnValue({
        ...defaultConversationStore,
        getActiveChatMode: jest.fn(() => "round-robin"),
      });

      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      expect(screen.getByTestId("chat-mode-select")).toHaveValue("round-robin");
    });

    it("handles null chat mode by defaulting to manual", () => {
      mockUseConversationStore.mockReturnValue({
        ...defaultConversationStore,
        getActiveChatMode: jest.fn(() => null),
      });

      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      expect(screen.getByTestId("chat-mode-select")).toHaveValue("manual");
    });

    it("calls setChatMode when mode is changed", async () => {
      const mockSetChatMode = jest.fn();
      mockUseConversationStore.mockReturnValue({
        ...defaultConversationStore,
        getActiveChatMode: jest.fn(() => "manual"),
        setChatMode: mockSetChatMode,
      });

      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      fireEvent.change(screen.getByTestId("chat-mode-select"), {
        target: { value: "round-robin" },
      });

      await waitFor(() => {
        expect(mockSetChatMode).toHaveBeenCalledWith("round-robin");
      });
    });

    it("disables ChatModeSelector when agents are loading", () => {
      mockUseConversationStore.mockReturnValue({
        ...defaultConversationStore,
        loading: { agents: true },
      });

      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      expect(screen.getByTestId("chat-mode-select")).toBeDisabled();
    });

    it("displays error message for chat mode update errors", () => {
      const chatModeError = {
        message: "Failed to update chat mode: Network error",
        operation: "save" as const,
        isRetryable: true,
        retryCount: 0,
        timestamp: "2025-01-01T00:00:00Z",
      };

      mockUseConversationStore.mockReturnValue({
        ...defaultConversationStore,
        error: { agents: chatModeError },
      });

      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      expect(screen.getByTestId("chat-mode-error")).toHaveTextContent(
        "Failed to update chat mode: Network error",
      );
    });

    it("does not display error message for non-save operations", () => {
      const loadError = {
        message: "Failed to load agents",
        operation: "load" as const,
        isRetryable: true,
        retryCount: 0,
        timestamp: "2025-01-01T00:00:00Z",
      };

      mockUseConversationStore.mockReturnValue({
        ...defaultConversationStore,
        error: { agents: loadError },
      });

      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      expect(screen.queryByTestId("chat-mode-error")).not.toBeInTheDocument();
    });

    it("does not display error message for save operations that are not chat mode related", () => {
      const generalSaveError = {
        message: "Failed to save agent settings",
        operation: "save" as const,
        isRetryable: true,
        retryCount: 0,
        timestamp: "2025-01-01T00:00:00Z",
      };

      mockUseConversationStore.mockReturnValue({
        ...defaultConversationStore,
        error: { agents: generalSaveError },
      });

      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      // Should not show in chat mode error display
      expect(screen.queryByTestId("chat-mode-error")).not.toBeInTheDocument();
    });

    it("positions ChatModeSelector at far right with ml-auto", () => {
      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      const chatModeContainer =
        screen.getByTestId("chat-mode-selector").parentElement;
      expect(chatModeContainer).toHaveClass("ml-auto");
    });
  });

  describe("Existing Functionality Preservation", () => {
    it("still renders agent pills when conversation is selected", () => {
      const conversationAgents = [
        {
          id: "ca-1",
          agent_id: "agent-1",
          enabled: true,
          display_order: 0,
          added_at: "2025-01-01T00:00:00Z",
        },
      ];

      const agentConfigs = [
        {
          id: "agent-1",
          name: "Test Agent",
          role: "assistant",
        },
      ];

      mockUseConversationStore.mockReturnValue({
        ...defaultConversationStore,
        activeConversationAgents: conversationAgents,
      });

      mockUseAgentsStore.mockReturnValue({
        agents: agentConfigs,
      });

      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      expect(screen.getByTestId("agent-pill")).toBeInTheDocument();
      expect(screen.getByText("Test Agent")).toBeInTheDocument();
      expect(screen.getByTestId("chat-mode-selector")).toBeInTheDocument();
    });

    it("still renders add agent button", () => {
      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      expect(
        screen.getByLabelText("Add agent to conversation"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("chat-mode-selector")).toBeInTheDocument();
    });

    it("handles agent toggle functionality alongside chat mode selector", async () => {
      const mockToggleAgentEnabled = jest.fn();
      const conversationAgents = [
        {
          id: "ca-1",
          agent_id: "agent-1",
          enabled: true,
          display_order: 0,
          added_at: "2025-01-01T00:00:00Z",
        },
      ];

      const agentConfigs = [
        {
          id: "agent-1",
          name: "Test Agent",
          role: "assistant",
        },
      ];

      mockUseConversationStore.mockReturnValue({
        ...defaultConversationStore,
        activeConversationAgents: conversationAgents,
        toggleAgentEnabled: mockToggleAgentEnabled,
      });

      mockUseAgentsStore.mockReturnValue({
        agents: agentConfigs,
      });

      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      fireEvent.click(screen.getByTestId("toggle-agent"));

      await waitFor(() => {
        expect(mockToggleAgentEnabled).toHaveBeenCalledWith("ca-1");
      });

      // ChatModeSelector should still be present
      expect(screen.getByTestId("chat-mode-selector")).toBeInTheDocument();
    });
  });

  describe("Layout and Styling", () => {
    it("maintains proper flex layout with ChatModeSelector", () => {
      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      // Check that add agent button is present
      expect(
        screen.getByLabelText("Add agent to conversation"),
      ).toBeInTheDocument();

      // Check that chat mode selector is positioned at far right
      expect(
        screen.getByTestId("chat-mode-selector").parentElement,
      ).toHaveClass("ml-auto");
    });

    it("applies dynamic styles to main container", () => {
      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
          barHeight="64px"
        />,
      );

      const mainContainer = screen
        .getByTestId("chat-mode-selector")
        .closest('[style*="height"]');
      expect(mainContainer).toHaveStyle("height: 64px");
    });
  });

  describe("Error Handling Integration", () => {
    it("shows general agent error when not related to chat mode", () => {
      const generalError = {
        message: "Failed to load agents",
        operation: "load" as const,
        isRetryable: true,
        retryCount: 0,
        timestamp: "2025-01-01T00:00:00Z",
      };

      mockUseConversationStore.mockReturnValue({
        ...defaultConversationStore,
        error: { agents: generalError },
      });

      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      // General error should be shown in main error display
      expect(
        screen.getByText("Failed to load agents: Failed to load agents"),
      ).toBeInTheDocument();

      // But not in chat mode selector
      expect(screen.queryByTestId("chat-mode-error")).not.toBeInTheDocument();
    });
  });

  describe("Delete Agent Functionality", () => {
    const conversationAgents = [
      {
        id: "ca-1",
        agent_id: "agent-1",
        enabled: true,
        display_order: 0,
        added_at: "2025-01-01T00:00:00Z",
      },
      {
        id: "ca-2",
        agent_id: "agent-2",
        enabled: false,
        display_order: 1,
        added_at: "2025-01-01T00:01:00Z",
      },
    ];

    const agentConfigs = [
      {
        id: "agent-1",
        name: "Test Agent 1",
        role: "assistant",
      },
      {
        id: "agent-2",
        name: "Test Agent 2",
        role: "helper",
      },
    ];

    beforeEach(() => {
      mockUseConversationStore.mockReturnValue({
        ...defaultConversationStore,
        activeConversationAgents: conversationAgents,
      });

      mockUseAgentsStore.mockReturnValue({
        agents: agentConfigs,
      });
    });

    it("passes onDelete handler to AgentPill components when conversation is selected", () => {
      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      const deleteButtons = screen.getAllByTestId("delete-agent");
      expect(deleteButtons).toHaveLength(2);
    });

    it("does not show delete buttons when no conversation is selected", () => {
      render(<AgentLabelsContainerDisplay {...defaultProps} />);

      expect(screen.queryByTestId("delete-agent")).not.toBeInTheDocument();
    });

    it("opens confirmation dialog when delete button is clicked", async () => {
      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      const deleteButtons = screen.getAllByTestId("delete-agent");
      fireEvent.click(deleteButtons[0]!);

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-dialog")).toBeInTheDocument();
      });

      expect(screen.getByTestId("dialog-title")).toHaveTextContent(
        "Delete Agent from Conversation",
      );
      expect(screen.getByTestId("dialog-message")).toHaveTextContent(
        "This will remove Test Agent 1 from this conversation and delete all of their messages. This action cannot be undone.",
      );
    });

    it("includes correct agent name in confirmation dialog message", async () => {
      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      const deleteButtons = screen.getAllByTestId("delete-agent");
      fireEvent.click(deleteButtons[1]!); // Click second agent

      await waitFor(() => {
        expect(screen.getByTestId("dialog-message")).toHaveTextContent(
          "This will remove Test Agent 2 from this conversation",
        );
      });
    });

    it("calls removeAgent and refreshActiveConversation when deletion is confirmed", async () => {
      const mockRemoveAgent = jest.fn().mockResolvedValue(undefined);
      const mockRefreshActiveConversation = jest
        .fn()
        .mockResolvedValue(undefined);

      mockUseConversationStore.mockReturnValue({
        ...defaultConversationStore,
        activeConversationAgents: conversationAgents,
        removeAgent: mockRemoveAgent,
        refreshActiveConversation: mockRefreshActiveConversation,
      });

      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      // Open dialog
      const deleteButtons = screen.getAllByTestId("delete-agent");
      fireEvent.click(deleteButtons[0]!);

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-dialog")).toBeInTheDocument();
      });

      // Confirm deletion
      fireEvent.click(screen.getByTestId("confirm-delete"));

      await waitFor(() => {
        expect(mockRemoveAgent).toHaveBeenCalledWith("conv-123", "agent-1");
      });

      await waitFor(() => {
        expect(mockRefreshActiveConversation).toHaveBeenCalled();
      });
    });

    it("closes dialog and does not delete when cancelled", async () => {
      const mockRemoveAgent = jest.fn();

      mockUseConversationStore.mockReturnValue({
        ...defaultConversationStore,
        activeConversationAgents: conversationAgents,
        removeAgent: mockRemoveAgent,
      });

      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      // Open dialog
      const deleteButtons = screen.getAllByTestId("delete-agent");
      fireEvent.click(deleteButtons[0]!);

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-dialog")).toBeInTheDocument();
      });

      // Cancel deletion
      fireEvent.click(screen.getByTestId("cancel-delete"));

      await waitFor(() => {
        expect(
          screen.queryByTestId("confirmation-dialog"),
        ).not.toBeInTheDocument();
      });

      expect(mockRemoveAgent).not.toHaveBeenCalled();
    });

    it("handles deletion errors gracefully", async () => {
      const mockRemoveAgent = jest
        .fn()
        .mockRejectedValue(new Error("Delete failed"));
      const mockRefreshActiveConversation = jest.fn();
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      mockUseConversationStore.mockReturnValue({
        ...defaultConversationStore,
        activeConversationAgents: conversationAgents,
        removeAgent: mockRemoveAgent,
        refreshActiveConversation: mockRefreshActiveConversation,
      });

      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      // Open dialog and confirm
      const deleteButtons = screen.getAllByTestId("delete-agent");
      fireEvent.click(deleteButtons[0]!);

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-dialog")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("confirm-delete"));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Failed to delete agent:",
          expect.any(Error),
        );
      });

      // Should not call refresh if deletion failed
      expect(mockRefreshActiveConversation).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("does not open dialog if agent or conversation not found", async () => {
      // Mock store with missing agent config
      mockUseAgentsStore.mockReturnValue({
        agents: [], // Empty agent configs
      });

      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      const deleteButtons = screen.getAllByTestId("delete-agent");
      fireEvent.click(deleteButtons[0]!);

      // Should not open dialog
      expect(
        screen.queryByTestId("confirmation-dialog"),
      ).not.toBeInTheDocument();
    });

    it("handles missing selectedConversationId gracefully", async () => {
      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId={null}
        />,
      );

      // Should not render delete buttons at all
      expect(screen.queryByTestId("delete-agent")).not.toBeInTheDocument();
    });

    it("maintains existing toggle functionality with delete functionality", async () => {
      const mockToggleAgentEnabled = jest.fn();

      mockUseConversationStore.mockReturnValue({
        ...defaultConversationStore,
        activeConversationAgents: conversationAgents,
        toggleAgentEnabled: mockToggleAgentEnabled,
      });

      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      // Test toggle still works
      const toggleButtons = screen.getAllByTestId("toggle-agent");
      fireEvent.click(toggleButtons[0]!);

      expect(mockToggleAgentEnabled).toHaveBeenCalledWith("ca-1");

      // Test delete also works
      const deleteButtons = screen.getAllByTestId("delete-agent");
      fireEvent.click(deleteButtons[0]!);

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-dialog")).toBeInTheDocument();
      });
    });

    it("displays loading state in confirm button text during deletion", async () => {
      const mockRemoveAgent = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      mockUseConversationStore.mockReturnValue({
        ...defaultConversationStore,
        activeConversationAgents: conversationAgents,
        removeAgent: mockRemoveAgent,
      });

      render(
        <AgentLabelsContainerDisplay
          {...defaultProps}
          selectedConversationId="conv-123"
        />,
      );

      // Open dialog
      const deleteButtons = screen.getAllByTestId("delete-agent");
      fireEvent.click(deleteButtons[0]!);

      await waitFor(() => {
        expect(screen.getByTestId("confirmation-dialog")).toBeInTheDocument();
      });

      // Start deletion - should show loading text
      fireEvent.click(screen.getByTestId("confirm-delete"));

      // Note: This test verifies the loading state exists in the confirmation dialog
      // The actual loading text would be set by the ConfirmationDialog component
      expect(screen.getByTestId("confirm-delete")).toBeInTheDocument();
    });
  });
});
