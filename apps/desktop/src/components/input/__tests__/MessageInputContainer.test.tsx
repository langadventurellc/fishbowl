/**
 * Unit tests for MessageInputContainer component.
 *
 * Tests the integration of MessageInputDisplay and SendButtonDisplay with state management
 * for complete message sending functionality.
 *
 * @module components/input/__tests__/MessageInputContainer.test
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import { MessageInputContainer } from "../MessageInputContainer";
import { useCreateMessage } from "@/hooks/messages";
import { useChatStore } from "@fishbowl-ai/ui-shared";
import { useConversationAgents } from "../../../hooks/conversationAgents/useConversationAgents";

// Mock the hooks
jest.mock("@/hooks/messages");
jest.mock("@fishbowl-ai/ui-shared", () => ({
  ...jest.requireActual("@fishbowl-ai/ui-shared"),
  useChatStore: jest.fn(),
}));
jest.mock("../../../hooks/conversationAgents/useConversationAgents");

const mockUseCreateMessage = useCreateMessage as jest.MockedFunction<
  typeof useCreateMessage
>;
const mockUseChatStore = useChatStore as jest.MockedFunction<
  typeof useChatStore
>;
const mockUseConversationAgents = useConversationAgents as jest.MockedFunction<
  typeof useConversationAgents
>;

describe("MessageInputContainer", () => {
  const mockConversationId = "conv-123";
  const mockCreateMessage = jest.fn();
  const mockReset = jest.fn();
  const mockSendToAgents = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock window.electronAPI
    Object.defineProperty(window, "electronAPI", {
      value: {
        chat: {
          sendToAgents: mockSendToAgents,
        },
      },
      writable: true,
      configurable: true,
    });

    // Default mock implementation
    mockUseCreateMessage.mockReturnValue({
      createMessage: mockCreateMessage,
      sending: false,
      error: null,
      reset: mockReset,
    });

    mockUseChatStore.mockReturnValue({
      sendingMessage: false,
      agentThinking: {},
      lastError: {},
      processingConversationId: null,
      setSending: jest.fn(),
      setAgentThinking: jest.fn(),
      setAgentError: jest.fn(),
      setProcessingConversation: jest.fn(),
      clearAgentState: jest.fn(),
      clearAllThinking: jest.fn(),
      clearConversationState: jest.fn(),
    });

    // Default mock implementation for conversation agents
    mockUseConversationAgents.mockReturnValue({
      conversationAgents: [
        {
          id: "ca-1",
          conversationId: mockConversationId,
          agentId: "agent-1",
          agent: {
            id: "agent-1",
            name: "Test Agent 1",
            role: "Assistant",
            personality: "Helpful",
            model: "gpt-4",
            systemPrompt: "You are a helpful assistant",
            createdAt: "2023-01-01T10:00:00.000Z",
            updatedAt: "2023-01-01T10:00:00.000Z",
            llmConfigId: "openai-config-1",
          },
          addedAt: "2023-01-01T12:00:00.000Z",
          isActive: true,
          enabled: true,
          displayOrder: 0,
        },
        {
          id: "ca-2",
          conversationId: mockConversationId,
          agentId: "agent-2",
          agent: {
            id: "agent-2",
            name: "Test Agent 2",
            role: "Developer",
            personality: "Analytical",
            model: "claude-3-sonnet",
            systemPrompt: "You are a coding assistant",
            createdAt: "2023-01-02T10:00:00.000Z",
            updatedAt: "2023-01-02T10:00:00.000Z",
            llmConfigId: "anthropic-config-1",
          },
          addedAt: "2023-01-02T12:00:00.000Z",
          isActive: true,
          enabled: false, // This agent is disabled
          displayOrder: 1,
        },
      ],
      isLoading: false,
      error: null,
      addAgent: jest.fn(),
      removeAgent: jest.fn(),
      toggleEnabled: jest.fn(),
      refetch: jest.fn(),
    });
  });

  describe("Rendering", () => {
    it("should render input container with textarea and send button", () => {
      render(<MessageInputContainer conversationId={mockConversationId} />);

      expect(
        screen.getByPlaceholderText("Type your message here..."),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /send message/i }),
      ).toBeInTheDocument();
    });

    it("should render with custom placeholder when provided", () => {
      render(
        <MessageInputContainer
          conversationId={mockConversationId}
          messageInputProps={{ placeholder: "Ask a question..." }}
        />,
      );

      expect(
        screen.getByPlaceholderText("Ask a question..."),
      ).toBeInTheDocument();
    });

    it("should render with compact layout variant", () => {
      const { container } = render(
        <MessageInputContainer
          conversationId={mockConversationId}
          layoutVariant="compact"
        />,
      );

      expect(container.firstChild?.firstChild).toHaveClass("p-3", "gap-2");
    });
  });

  describe("Form State Management", () => {
    it("should update input value when user types", () => {
      render(<MessageInputContainer conversationId={mockConversationId} />);
      const textarea = screen.getByPlaceholderText("Type your message here...");

      fireEvent.change(textarea, { target: { value: "Hello world" } });

      expect(textarea).toHaveValue("Hello world");
    });

    it("should clear error when user starts typing", () => {
      mockUseCreateMessage.mockReturnValue({
        createMessage: mockCreateMessage,
        sending: false,
        error: new Error("Previous error"),
        reset: mockReset,
      });

      render(<MessageInputContainer conversationId={mockConversationId} />);
      const textarea = screen.getByPlaceholderText("Type your message here...");

      // Error should be displayed initially
      expect(screen.getByText("Previous error")).toBeInTheDocument();

      // Type to clear error
      fireEvent.change(textarea, { target: { value: "New message" } });

      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe("Message Sending", () => {
    it("should call createMessage with correct input when send button is clicked", async () => {
      mockCreateMessage.mockResolvedValueOnce({
        id: "msg-123",
        conversation_id: mockConversationId,
        role: "user",
        content: "Hello world",
        included: true,
        conversation_agent_id: null,
        created_at: new Date().toISOString(),
      });

      render(<MessageInputContainer conversationId={mockConversationId} />);
      const textarea = screen.getByPlaceholderText("Type your message here...");
      const sendButton = screen.getByRole("button", { name: /send message/i });

      // Type message
      fireEvent.change(textarea, { target: { value: "Hello world" } });

      // Click send button
      await act(async () => {
        fireEvent.click(sendButton);
      });

      expect(mockCreateMessage).toHaveBeenCalledWith({
        conversation_id: mockConversationId,
        role: "user",
        content: "Hello world",
        included: true,
      });
    });

    it("should clear input field after successful message creation", async () => {
      mockCreateMessage.mockResolvedValueOnce({
        id: "msg-123",
        conversation_id: mockConversationId,
        role: "user",
        content: "Hello world",
        included: true,
        conversation_agent_id: null,
        created_at: new Date().toISOString(),
      });

      render(<MessageInputContainer conversationId={mockConversationId} />);
      const textarea = screen.getByPlaceholderText("Type your message here...");
      const sendButton = screen.getByRole("button", { name: /send message/i });

      // Type message
      fireEvent.change(textarea, { target: { value: "Hello world" } });
      expect(textarea).toHaveValue("Hello world");

      // Send message
      await act(async () => {
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        expect(textarea).toHaveValue("");
      });
    });

    it("should not send empty message", async () => {
      render(<MessageInputContainer conversationId={mockConversationId} />);
      const sendButton = screen.getByRole("button", { name: /send message/i });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      expect(mockCreateMessage).not.toHaveBeenCalled();
      expect(
        screen.getByText("Message content cannot be empty"),
      ).toBeInTheDocument();
    });

    it("should not send whitespace-only message", async () => {
      render(<MessageInputContainer conversationId={mockConversationId} />);
      const textarea = screen.getByPlaceholderText("Type your message here...");
      const sendButton = screen.getByRole("button", { name: /send message/i });

      // Type whitespace
      fireEvent.change(textarea, { target: { value: "   \n\t  " } });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      expect(mockCreateMessage).not.toHaveBeenCalled();
      expect(
        screen.getByText("Message content cannot be empty"),
      ).toBeInTheDocument();
    });
  });

  describe("Keyboard Shortcuts", () => {
    it("should send message when Enter key is pressed", async () => {
      mockCreateMessage.mockResolvedValueOnce({
        id: "msg-123",
        conversation_id: mockConversationId,
        role: "user",
        content: "Hello world",
        included: true,
        conversation_agent_id: null,
        created_at: new Date().toISOString(),
      });

      render(<MessageInputContainer conversationId={mockConversationId} />);
      const textarea = screen.getByPlaceholderText("Type your message here...");

      // Type message
      fireEvent.change(textarea, { target: { value: "Hello world" } });

      // Press Enter
      await act(async () => {
        fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
      });

      expect(mockCreateMessage).toHaveBeenCalledWith({
        conversation_id: mockConversationId,
        role: "user",
        content: "Hello world",
        included: true,
      });
    });

    it("should add new line when Shift+Enter is pressed", () => {
      render(<MessageInputContainer conversationId={mockConversationId} />);
      const textarea = screen.getByPlaceholderText("Type your message here...");

      // Type message
      fireEvent.change(textarea, { target: { value: "Hello" } });

      // Press Shift+Enter (should not send message)
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

      expect(mockCreateMessage).not.toHaveBeenCalled();
    });

    it("should show validation error when Enter is pressed with empty content", () => {
      render(<MessageInputContainer conversationId={mockConversationId} />);
      const textarea = screen.getByPlaceholderText("Type your message here...");

      // Press Enter with empty content
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

      expect(mockCreateMessage).not.toHaveBeenCalled();
      expect(
        screen.getByText("Message content cannot be empty"),
      ).toBeInTheDocument();
    });
  });

  describe("Loading States", () => {
    it("should disable send button when sending message", () => {
      mockUseCreateMessage.mockReturnValue({
        createMessage: mockCreateMessage,
        sending: true,
        error: null,
        reset: mockReset,
      });

      render(<MessageInputContainer conversationId={mockConversationId} />);
      const sendButton = screen.getByRole("button", { name: /send message/i });

      expect(sendButton).toBeDisabled();
    });

    it("should disable send button when global sendingMessage is true", () => {
      mockUseChatStore.mockReturnValue({
        sendingMessage: true,
        agentThinking: {},
        lastError: {},
        processingConversationId: null,
        setSending: jest.fn(),
        setAgentThinking: jest.fn(),
        setAgentError: jest.fn(),
        setProcessingConversation: jest.fn(),
        clearAgentState: jest.fn(),
        clearAllThinking: jest.fn(),
        clearConversationState: jest.fn(),
      });

      render(<MessageInputContainer conversationId={mockConversationId} />);
      const sendButton = screen.getByRole("button", { name: /send message/i });

      expect(sendButton).toBeDisabled();
    });

    it("should enable send button even when input is empty (for validation)", () => {
      render(<MessageInputContainer conversationId={mockConversationId} />);
      const sendButton = screen.getByRole("button", { name: /send message/i });

      expect(sendButton).toBeEnabled();
    });

    it("should enable send button when input has content and not sending", () => {
      render(<MessageInputContainer conversationId={mockConversationId} />);
      const textarea = screen.getByPlaceholderText("Type your message here...");
      const sendButton = screen.getByRole("button", { name: /send message/i });

      // Type message
      fireEvent.change(textarea, { target: { value: "Hello world" } });

      expect(sendButton).toBeEnabled();
    });
  });

  describe("Error Display", () => {
    it("should display create error when present", () => {
      mockUseCreateMessage.mockReturnValue({
        createMessage: mockCreateMessage,
        sending: false,
        error: new Error("Network error occurred"),
        reset: mockReset,
      });

      render(<MessageInputContainer conversationId={mockConversationId} />);

      expect(screen.getByText("Network error occurred")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("should display validation error when present", () => {
      render(<MessageInputContainer conversationId={mockConversationId} />);
      const sendButton = screen.getByRole("button", { name: /send message/i });

      // Try to send empty message
      act(() => {
        fireEvent.click(sendButton);
      });

      expect(
        screen.getByText("Message content cannot be empty"),
      ).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("should clear validation error when user starts typing", () => {
      render(<MessageInputContainer conversationId={mockConversationId} />);
      const textarea = screen.getByPlaceholderText("Type your message here...");
      const sendButton = screen.getByRole("button", { name: /send message/i });

      // Create validation error
      act(() => {
        fireEvent.click(sendButton);
      });
      expect(
        screen.getByText("Message content cannot be empty"),
      ).toBeInTheDocument();

      // Clear error by typing
      fireEvent.change(textarea, { target: { value: "Hello" } });

      expect(
        screen.queryByText("Message content cannot be empty"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<MessageInputContainer conversationId={mockConversationId} />);

      expect(
        screen.getByRole("button", { name: /send message/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Type your message here..."),
      ).toBeInTheDocument();
    });

    it("should mark error messages with role='alert'", () => {
      mockUseCreateMessage.mockReturnValue({
        createMessage: mockCreateMessage,
        sending: false,
        error: new Error("Test error"),
        reset: mockReset,
      });

      render(<MessageInputContainer conversationId={mockConversationId} />);

      expect(screen.getByRole("alert")).toHaveTextContent("Test error");
    });
  });

  describe("Chat Orchestration Integration", () => {
    const mockCreatedMessage = {
      id: "msg-123",
      conversation_id: mockConversationId,
      role: "user" as const,
      content: "Hello world",
      included: true,
      conversation_agent_id: null,
      created_at: new Date().toISOString(),
    };

    it("should trigger chat orchestration after successful message creation when agents are enabled", async () => {
      mockCreateMessage.mockResolvedValueOnce(mockCreatedMessage);
      mockSendToAgents.mockResolvedValueOnce(undefined);

      render(<MessageInputContainer conversationId={mockConversationId} />);
      const textarea = screen.getByPlaceholderText("Type your message here...");
      const sendButton = screen.getByRole("button", { name: /send message/i });

      // Type and send message
      fireEvent.change(textarea, { target: { value: "Hello world" } });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      // Verify message creation happened first
      expect(mockCreateMessage).toHaveBeenCalledWith({
        conversation_id: mockConversationId,
        role: "user",
        content: "Hello world",
        included: true,
      });

      // Verify orchestration was triggered with correct parameters
      await waitFor(() => {
        expect(mockSendToAgents).toHaveBeenCalledWith(
          mockConversationId,
          mockCreatedMessage.id,
        );
      });
    });

    it("should not trigger chat orchestration when no agents are enabled", async () => {
      // Mock scenario with no enabled agents
      mockUseConversationAgents.mockReturnValue({
        conversationAgents: [
          {
            id: "ca-1",
            conversationId: mockConversationId,
            agentId: "agent-1",
            agent: {
              id: "agent-1",
              name: "Test Agent 1",
              role: "Assistant",
              personality: "Helpful",
              model: "gpt-4",
              systemPrompt: "You are a helpful assistant",
              createdAt: "2023-01-01T10:00:00.000Z",
              updatedAt: "2023-01-01T10:00:00.000Z",
              llmConfigId: "openai-config-1",
            },
            addedAt: "2023-01-01T12:00:00.000Z",
            isActive: true,
            enabled: false, // Disabled
            displayOrder: 0,
          },
        ],
        isLoading: false,
        error: null,
        addAgent: jest.fn(),
        removeAgent: jest.fn(),
        toggleEnabled: jest.fn(),
        refetch: jest.fn(),
      });

      mockCreateMessage.mockResolvedValueOnce(mockCreatedMessage);

      render(<MessageInputContainer conversationId={mockConversationId} />);
      const textarea = screen.getByPlaceholderText("Type your message here...");
      const sendButton = screen.getByRole("button", { name: /send message/i });

      // Type and send message
      fireEvent.change(textarea, { target: { value: "Hello world" } });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      // Verify message creation happened
      expect(mockCreateMessage).toHaveBeenCalledWith({
        conversation_id: mockConversationId,
        role: "user",
        content: "Hello world",
        included: true,
      });

      // Verify orchestration was NOT triggered
      expect(mockSendToAgents).not.toHaveBeenCalled();
    });

    it("should not trigger chat orchestration when no agents exist", async () => {
      // Mock scenario with no agents at all
      mockUseConversationAgents.mockReturnValue({
        conversationAgents: [],
        isLoading: false,
        error: null,
        addAgent: jest.fn(),
        removeAgent: jest.fn(),
        toggleEnabled: jest.fn(),
        refetch: jest.fn(),
      });

      mockCreateMessage.mockResolvedValueOnce(mockCreatedMessage);

      render(<MessageInputContainer conversationId={mockConversationId} />);
      const textarea = screen.getByPlaceholderText("Type your message here...");
      const sendButton = screen.getByRole("button", { name: /send message/i });

      // Type and send message
      fireEvent.change(textarea, { target: { value: "Hello world" } });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      // Verify message creation happened
      expect(mockCreateMessage).toHaveBeenCalled();

      // Verify orchestration was NOT triggered
      expect(mockSendToAgents).not.toHaveBeenCalled();
    });

    it("should handle orchestration errors gracefully without affecting user experience", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockCreateMessage.mockResolvedValueOnce(mockCreatedMessage);
      mockSendToAgents.mockRejectedValueOnce(new Error("Orchestration failed"));

      render(<MessageInputContainer conversationId={mockConversationId} />);
      const textarea = screen.getByPlaceholderText("Type your message here...");
      const sendButton = screen.getByRole("button", { name: /send message/i });

      // Type and send message
      fireEvent.change(textarea, { target: { value: "Hello world" } });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      // Verify message creation still succeeded
      expect(mockCreateMessage).toHaveBeenCalled();

      // Verify orchestration was attempted
      await waitFor(() => {
        expect(mockSendToAgents).toHaveBeenCalled();
      });

      // Verify error was logged but didn't break the UI
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Chat orchestration failed:",
          expect.any(Error),
        );
      });

      // Verify input was still cleared (user experience unaffected)
      expect(textarea).toHaveValue("");

      consoleErrorSpy.mockRestore();
    });

    it("should not trigger orchestration when not in Electron environment", async () => {
      // Remove electronAPI to simulate non-Electron environment
      delete (window as any).electronAPI;

      mockCreateMessage.mockResolvedValueOnce(mockCreatedMessage);

      render(<MessageInputContainer conversationId={mockConversationId} />);
      const textarea = screen.getByPlaceholderText("Type your message here...");
      const sendButton = screen.getByRole("button", { name: /send message/i });

      // Type and send message
      fireEvent.change(textarea, { target: { value: "Hello world" } });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      // Verify message creation still happened
      expect(mockCreateMessage).toHaveBeenCalled();

      // Verify orchestration was NOT triggered (no electronAPI)
      expect(mockSendToAgents).not.toHaveBeenCalled();
    });

    it("should not trigger orchestration when sendToAgents is not available", async () => {
      // Mock electronAPI without sendToAgents method
      Object.defineProperty(window, "electronAPI", {
        value: {
          chat: {
            // Missing sendToAgents method
          },
        },
        writable: true,
        configurable: true,
      });

      mockCreateMessage.mockResolvedValueOnce(mockCreatedMessage);

      render(<MessageInputContainer conversationId={mockConversationId} />);
      const textarea = screen.getByPlaceholderText("Type your message here...");
      const sendButton = screen.getByRole("button", { name: /send message/i });

      // Type and send message
      fireEvent.change(textarea, { target: { value: "Hello world" } });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      // Verify message creation still happened
      expect(mockCreateMessage).toHaveBeenCalled();

      // Verify orchestration was NOT triggered
      expect(mockSendToAgents).not.toHaveBeenCalled();
    });

    it("should only trigger orchestration when message creation succeeds", async () => {
      // Mock message creation failure
      mockCreateMessage.mockRejectedValueOnce(
        new Error("Message creation failed"),
      );

      render(<MessageInputContainer conversationId={mockConversationId} />);
      const textarea = screen.getByPlaceholderText("Type your message here...");
      const sendButton = screen.getByRole("button", { name: /send message/i });

      // Type and send message
      fireEvent.change(textarea, { target: { value: "Hello world" } });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      // Verify message creation was attempted
      expect(mockCreateMessage).toHaveBeenCalled();

      // Verify orchestration was NOT triggered due to message creation failure
      expect(mockSendToAgents).not.toHaveBeenCalled();

      // Verify input content was preserved for retry
      expect(textarea).toHaveValue("Hello world");
    });

    it("should filter agents correctly to determine enabled agents", async () => {
      // Mock scenario with mixed enabled/disabled agents
      mockUseConversationAgents.mockReturnValue({
        conversationAgents: [
          {
            id: "ca-1",
            conversationId: mockConversationId,
            agentId: "agent-1",
            agent: {
              id: "agent-1",
              name: "Enabled Agent",
              role: "Assistant",
              personality: "Helpful",
              model: "gpt-4",
              systemPrompt: "You are helpful",
              createdAt: "2023-01-01T10:00:00.000Z",
              updatedAt: "2023-01-01T10:00:00.000Z",
              llmConfigId: "openai-config-1",
            },
            addedAt: "2023-01-01T12:00:00.000Z",
            isActive: true,
            enabled: true, // Enabled
            displayOrder: 0,
          },
          {
            id: "ca-2",
            conversationId: mockConversationId,
            agentId: "agent-2",
            agent: {
              id: "agent-2",
              name: "Disabled Agent",
              role: "Developer",
              personality: "Analytical",
              model: "claude-3-sonnet",
              systemPrompt: "You are analytical",
              createdAt: "2023-01-02T10:00:00.000Z",
              updatedAt: "2023-01-02T10:00:00.000Z",
              llmConfigId: "anthropic-config-1",
            },
            addedAt: "2023-01-02T12:00:00.000Z",
            isActive: true,
            enabled: false, // Disabled
            displayOrder: 1,
          },
          {
            id: "ca-3",
            conversationId: mockConversationId,
            agentId: "agent-3",
            agent: {
              id: "agent-3",
              name: "Another Enabled Agent",
              role: "Researcher",
              personality: "Curious",
              model: "gpt-4",
              systemPrompt: "You are curious",
              createdAt: "2023-01-03T10:00:00.000Z",
              updatedAt: "2023-01-03T10:00:00.000Z",
              llmConfigId: "openai-config-2",
            },
            addedAt: "2023-01-03T12:00:00.000Z",
            isActive: true,
            enabled: true, // Enabled
            displayOrder: 2,
          },
        ],
        isLoading: false,
        error: null,
        addAgent: jest.fn(),
        removeAgent: jest.fn(),
        toggleEnabled: jest.fn(),
        refetch: jest.fn(),
      });

      mockCreateMessage.mockResolvedValueOnce(mockCreatedMessage);
      mockSendToAgents.mockResolvedValueOnce(undefined);

      render(<MessageInputContainer conversationId={mockConversationId} />);
      const textarea = screen.getByPlaceholderText("Type your message here...");
      const sendButton = screen.getByRole("button", { name: /send message/i });

      // Type and send message
      fireEvent.change(textarea, { target: { value: "Hello world" } });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      // Verify orchestration was triggered (there are enabled agents)
      await waitFor(() => {
        expect(mockSendToAgents).toHaveBeenCalledWith(
          mockConversationId,
          mockCreatedMessage.id,
        );
      });
    });
  });
});
