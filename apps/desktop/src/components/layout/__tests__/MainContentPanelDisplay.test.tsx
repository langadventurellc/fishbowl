/**
 * Unit tests for MainContentPanelDisplay component.
 *
 * Tests the integration of useMessages hook with loading and error states,
 * and message transformation from Message[] to MessageViewModel[].
 *
 * @module components/layout/__tests__/MainContentPanelDisplay.test
 */

import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { MainContentPanelDisplay } from "../MainContentPanelDisplay";
import { useMessages } from "../../../hooks/messages/useMessages";
import { useChatEventIntegration } from "../../../hooks/chat/useChatEventIntegration";
import type { Message } from "@fishbowl-ai/shared";

// Mock the hooks
jest.mock("../../../hooks/messages/useMessages");
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
  ChatContainerDisplay: ({ messages }: any) => (
    <div data-testid="chat-container">
      {messages.map((msg: any) => (
        <div key={msg.id} data-testid={`message-${msg.id}`}>
          {msg.type}: {msg.content} ({msg.timestamp})
        </div>
      ))}
    </div>
  ),
}));

jest.mock("../../input/InputContainerDisplay", () => ({
  InputContainerDisplay: () => (
    <div data-testid="input-container">Input Container</div>
  ),
}));

const mockUseMessages = useMessages as jest.MockedFunction<typeof useMessages>;
const mockUseChatEventIntegration =
  useChatEventIntegration as jest.MockedFunction<
    typeof useChatEventIntegration
  >;

describe("MainContentPanelDisplay", () => {
  const mockConversationId = "conv-123";
  const mockRefetch = jest.fn();

  const mockMessages: Message[] = [
    {
      id: "msg-1",
      conversation_id: mockConversationId,
      conversation_agent_id: null,
      role: "user",
      content: "Hello, how are you?",
      included: true,
      created_at: "2023-01-01T10:00:00.000Z",
    },
    {
      id: "msg-2",
      conversation_id: mockConversationId,
      conversation_agent_id: "ca-1",
      role: "agent",
      content: "I'm doing great, thanks for asking!",
      included: true,
      created_at: "2023-01-01T10:01:00.000Z",
    },
    {
      id: "msg-3",
      conversation_id: mockConversationId,
      conversation_agent_id: null,
      role: "system",
      content: "System notification message",
      included: false,
      created_at: "2023-01-01T10:02:00.000Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation for useChatEventIntegration
    mockUseChatEventIntegration.mockReturnValue({
      isConnected: true,
      lastEventTime: null,
    });

    // Default mock implementation for useMessages
    mockUseMessages.mockReturnValue({
      messages: mockMessages,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      isEmpty: false,
    });
  });

  describe("successful message loading", () => {
    it("renders all components when messages load successfully", () => {
      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      expect(screen.getByTestId("agent-labels-container")).toBeInTheDocument();
      expect(screen.getByTestId("chat-container")).toBeInTheDocument();
      expect(screen.getByTestId("input-container")).toBeInTheDocument();
    });

    it("passes correct conversationId to useMessages hook", () => {
      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      expect(mockUseMessages).toHaveBeenCalledWith(mockConversationId);
    });

    it("handles null conversationId correctly", () => {
      render(<MainContentPanelDisplay selectedConversationId={null} />);

      expect(mockUseMessages).toHaveBeenCalledWith("");
    });

    it("transforms messages correctly for ChatContainerDisplay", () => {
      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      const chatContainer = screen.getByTestId("chat-container");
      expect(chatContainer).toBeInTheDocument();

      // Check that user message is transformed correctly
      expect(screen.getByTestId("message-msg-1")).toHaveTextContent(
        "user: Hello, how are you?",
      );

      // Check that agent message is transformed correctly
      expect(screen.getByTestId("message-msg-2")).toHaveTextContent(
        "agent: I'm doing great, thanks for asking!",
      );

      // Check that system message is transformed correctly
      expect(screen.getByTestId("message-msg-3")).toHaveTextContent(
        "system: System notification message",
      );
    });
  });

  describe("loading state", () => {
    it("shows loading spinner when isLoading is true", () => {
      mockUseMessages.mockReturnValue({
        messages: [],
        isLoading: true,
        error: null,
        refetch: mockRefetch,
        isEmpty: true,
      });

      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      expect(screen.queryByTestId("chat-container")).not.toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("hides chat container during loading", () => {
      mockUseMessages.mockReturnValue({
        messages: mockMessages,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
        isEmpty: false,
      });

      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      expect(screen.queryByTestId("chat-container")).not.toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("shows other components while loading", () => {
      mockUseMessages.mockReturnValue({
        messages: [],
        isLoading: true,
        error: null,
        refetch: mockRefetch,
        isEmpty: true,
      });

      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      expect(screen.getByTestId("agent-labels-container")).toBeInTheDocument();
      expect(screen.getByTestId("input-container")).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    const mockError = new Error("Database connection error");

    it("shows error message when error occurs", () => {
      mockUseMessages.mockReturnValue({
        messages: [],
        isLoading: false,
        error: mockError,
        refetch: mockRefetch,
        isEmpty: true,
      });

      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      expect(screen.getByText("Failed to load messages")).toBeInTheDocument();
      expect(screen.getByText(mockError.message)).toBeInTheDocument();
    });

    it("shows retry button in error state", () => {
      mockUseMessages.mockReturnValue({
        messages: [],
        isLoading: false,
        error: mockError,
        refetch: mockRefetch,
        isEmpty: true,
      });

      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      const retryButton = screen.getByRole("button", { name: "Retry" });
      expect(retryButton).toBeInTheDocument();
    });

    it("calls refetch when retry button is clicked", async () => {
      mockUseMessages.mockReturnValue({
        messages: [],
        isLoading: false,
        error: mockError,
        refetch: mockRefetch,
        isEmpty: true,
      });

      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      const retryButton = screen.getByRole("button", { name: "Retry" });
      fireEvent.click(retryButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it("hides chat container during error state", () => {
      mockUseMessages.mockReturnValue({
        messages: mockMessages,
        isLoading: false,
        error: mockError,
        refetch: mockRefetch,
        isEmpty: false,
      });

      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      expect(screen.queryByTestId("chat-container")).not.toBeInTheDocument();
      expect(screen.getByText("Failed to load messages")).toBeInTheDocument();
    });

    it("shows other components during error state", () => {
      mockUseMessages.mockReturnValue({
        messages: [],
        isLoading: false,
        error: mockError,
        refetch: mockRefetch,
        isEmpty: true,
      });

      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      expect(screen.getByTestId("agent-labels-container")).toBeInTheDocument();
      expect(screen.getByTestId("input-container")).toBeInTheDocument();
    });
  });

  describe("chat event integration", () => {
    it("initializes chat event integration with correct conversationId", () => {
      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      expect(mockUseChatEventIntegration).toHaveBeenCalledWith({
        conversationId: mockConversationId,
      });
    });

    it("passes null to chat event integration when conversationId is null", () => {
      render(<MainContentPanelDisplay selectedConversationId={null} />);

      expect(mockUseChatEventIntegration).toHaveBeenCalledWith({
        conversationId: null,
      });
    });
  });

  describe("message transformation", () => {
    it("transforms user messages correctly", () => {
      const userMessage: Message = {
        id: "user-msg",
        conversation_id: mockConversationId,
        conversation_agent_id: null,
        role: "user",
        content: "User message content",
        included: true,
        created_at: "2023-01-01T10:00:00.000Z",
      };

      mockUseMessages.mockReturnValue({
        messages: [userMessage],
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isEmpty: false,
      });

      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      expect(screen.getByTestId("message-user-msg")).toHaveTextContent(
        "user: User message content",
      );
    });

    it("transforms agent messages correctly", () => {
      const agentMessage: Message = {
        id: "agent-msg",
        conversation_id: mockConversationId,
        conversation_agent_id: "ca-1",
        role: "agent",
        content: "Agent message content",
        included: true,
        created_at: "2023-01-01T10:01:00.000Z",
      };

      mockUseMessages.mockReturnValue({
        messages: [agentMessage],
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isEmpty: false,
      });

      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      expect(screen.getByTestId("message-agent-msg")).toHaveTextContent(
        "agent: Agent message content",
      );
    });

    it("transforms system messages correctly", () => {
      const systemMessage: Message = {
        id: "system-msg",
        conversation_id: mockConversationId,
        conversation_agent_id: null,
        role: "system",
        content: "System message content",
        included: false,
        created_at: "2023-01-01T10:02:00.000Z",
      };

      mockUseMessages.mockReturnValue({
        messages: [systemMessage],
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isEmpty: false,
      });

      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      expect(screen.getByTestId("message-system-msg")).toHaveTextContent(
        "system: System message content",
      );
    });

    it("handles empty messages array", () => {
      mockUseMessages.mockReturnValue({
        messages: [],
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isEmpty: true,
      });

      render(
        <MainContentPanelDisplay selectedConversationId={mockConversationId} />,
      );

      const chatContainer = screen.getByTestId("chat-container");
      expect(chatContainer).toBeInTheDocument();
      expect(chatContainer).toBeEmptyDOMElement();
    });
  });
});
