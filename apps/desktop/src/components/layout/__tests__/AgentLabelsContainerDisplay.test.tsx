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
  AgentPill: ({ agent, onToggleEnabled }: any) => (
    <div data-testid="agent-pill">
      <span>{agent.name}</span>
      {onToggleEnabled && (
        <button onClick={() => onToggleEnabled()} data-testid="toggle-agent">
          Toggle
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
});
