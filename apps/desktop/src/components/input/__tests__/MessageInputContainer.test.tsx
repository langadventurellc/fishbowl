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

// Mock the hooks
jest.mock("@/hooks/messages");
jest.mock("@fishbowl-ai/ui-shared", () => ({
  ...jest.requireActual("@fishbowl-ai/ui-shared"),
  useChatStore: jest.fn(),
}));

const mockUseCreateMessage = useCreateMessage as jest.MockedFunction<
  typeof useCreateMessage
>;
const mockUseChatStore = useChatStore as jest.MockedFunction<
  typeof useChatStore
>;

describe("MessageInputContainer", () => {
  const mockConversationId = "conv-123";
  const mockCreateMessage = jest.fn();
  const mockReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

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
});
