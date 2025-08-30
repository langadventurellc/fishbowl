/**
 * Unit tests for MainContentPanelDisplay component.
 *
 * Tests the integration of useMessagesWithAgentData hook with loading and error states,
 * and display of resolved message data with agent names and roles.
 *
 * @module components/layout/__tests__/MainContentPanelDisplay.test
 */

import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { MainContentPanelDisplay } from "../MainContentPanelDisplay";
import { useMessagesWithAgentData } from "../../../hooks/messages/useMessagesWithAgentData";
import { useChatEventIntegration } from "../../../hooks/chat/useChatEventIntegration";
import type { MessageViewModel } from "@fishbowl-ai/ui-shared";

// Mock the hooks
jest.mock("../../../hooks/messages/useMessagesWithAgentData");
jest.mock("../../../hooks/chat/useChatEventIntegration");

// Mock child components
jest.mock("../AgentLabelsContainerDisplay", () => ({
  AgentLabelsContainerDisplay: ({ selectedConversationId }: any) => (
    <div data-testid="agent-labels-container">
      Agent Labels for conversation: {selectedConversationId || "none"}
    </div>
  ),
}));

jest.mock("../ChatContainerDisplay", () => ({
  ChatContainerDisplay: ({ messages, emptyState }: any) => (
    <div data-testid="chat-container">
      {messages && messages.length > 0 ? (
        messages.map((msg: any) => (
          <div key={msg.id} data-testid={`message-${msg.id}`}>
            {msg.type}: {msg.content} ({msg.timestamp})
          </div>
        ))
      ) : emptyState ? (
        <div data-testid="empty-state">{emptyState}</div>
      ) : null}
    </div>
  ),
}));

jest.mock("../../input/MessageInputContainer", () => ({
  MessageInputContainer: () => (
    <div data-testid="input-container">Input Container</div>
  ),
}));

const mockUseMessagesWithAgentData =
  useMessagesWithAgentData as jest.MockedFunction<
    typeof useMessagesWithAgentData
  >;
const mockUseChatEventIntegration =
  useChatEventIntegration as jest.MockedFunction<
    typeof useChatEventIntegration
  >;

describe("MainContentPanelDisplay", () => {
  const mockConversationId = "test-conversation-123";
  const mockRefetch = jest.fn();

  const mockMessages: MessageViewModel[] = [
    {
      id: "msg-1",
      agent: "Test Agent",
      role: "Assistant",
      content: "Hello from agent",
      timestamp: "12:34 PM",
      type: "agent",
      isActive: true,
      agentColor: "#22c55e",
    },
    {
      id: "msg-2",
      agent: "User",
      role: "User",
      content: "Hello from user",
      timestamp: "12:35 PM",
      type: "user",
      isActive: true,
      agentColor: "#3b82f6",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation for useMessagesWithAgentData
    mockUseMessagesWithAgentData.mockReturnValue({
      messages: mockMessages,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      isEmpty: false,
    });

    // Default mock for chat event integration
    mockUseChatEventIntegration.mockReturnValue({
      isConnected: true,
      lastEventTime: null,
    });
  });

  describe("basic rendering", () => {
    it("passes correct conversationId to useMessagesWithAgentData hook", () => {
      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      expect(mockUseMessagesWithAgentData).toHaveBeenCalledWith(
        mockConversationId,
      );
    });

    it("passes null to useMessagesWithAgentData when no conversation selected", () => {
      render(<MainContentPanelDisplay selectedConversationId={null} />);

      expect(mockUseMessagesWithAgentData).toHaveBeenCalledWith(null);
    });

    it("renders agent labels container", () => {
      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      expect(screen.getByTestId("agent-labels-container")).toBeInTheDocument();
      expect(
        screen.getByText(
          `Agent Labels for conversation: ${mockConversationId}`,
        ),
      ).toBeInTheDocument();
    });

    it("renders chat container with messages", () => {
      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      const chatContainer = screen.getByTestId("chat-container");
      expect(chatContainer).toBeInTheDocument();

      expect(screen.getByTestId("message-msg-1")).toBeInTheDocument();
      expect(screen.getByTestId("message-msg-2")).toBeInTheDocument();
    });

    it("renders input container when conversation is selected", () => {
      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      expect(screen.getByTestId("input-container")).toBeInTheDocument();
    });

    it("does not render input container when no conversation selected", () => {
      render(<MainContentPanelDisplay selectedConversationId={null} />);

      expect(screen.queryByTestId("input-container")).not.toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("shows loading skeleton when data is loading", () => {
      mockUseMessagesWithAgentData.mockReturnValue({
        messages: [],
        isLoading: true,
        error: null,
        refetch: mockRefetch,
        isEmpty: true,
      });

      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      // Check for loading skeleton elements with animate-pulse class
      const loadingElements = document.querySelectorAll(".animate-pulse");
      expect(loadingElements.length).toBeGreaterThan(0);
    });
  });

  describe("error state", () => {
    it("shows error message when there is an error", () => {
      const testError = new Error("Test error message");
      mockUseMessagesWithAgentData.mockReturnValue({
        messages: [],
        isLoading: false,
        error: testError,
        refetch: mockRefetch,
        isEmpty: true,
      });

      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      expect(screen.getByText("Failed to load messages")).toBeInTheDocument();
      expect(screen.getByText("Test error message")).toBeInTheDocument();
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });

    it("calls refetch when retry button is clicked", () => {
      const testError = new Error("Test error");
      mockUseMessagesWithAgentData.mockReturnValue({
        messages: [],
        isLoading: false,
        error: testError,
        refetch: mockRefetch,
        isEmpty: true,
      });

      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      const retryButton = screen.getByText("Try Again");
      fireEvent.click(retryButton);

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe("empty state", () => {
    it("shows empty conversation state when no messages and conversation selected", () => {
      mockUseMessagesWithAgentData.mockReturnValue({
        messages: [],
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isEmpty: true,
      });

      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      expect(screen.getByText("Start a conversation")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Type a message below to begin chatting with your AI agents.",
        ),
      ).toBeInTheDocument();
    });

    it("shows no conversation selected state when no conversation ID", () => {
      render(<MainContentPanelDisplay selectedConversationId={null} />);

      expect(screen.getByText("No conversation selected")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Select a conversation from the sidebar or create a new one to get started.",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("message display", () => {
    it("displays messages with agent names and roles", () => {
      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      expect(
        screen.getByText("agent: Hello from agent (12:34 PM)"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("user: Hello from user (12:35 PM)"),
      ).toBeInTheDocument();
    });
  });
});
