import type { MessageItemProps } from "@fishbowl-ai/ui-shared";
import type { MessageViewModel } from "@fishbowl-ai/ui-shared";
import type { Message } from "@fishbowl-ai/shared";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MessageItem } from "../MessageItem";

// Mock child components
jest.mock("../MessageContent", () => ({
  MessageContent: ({
    content,
    messageType,
  }: {
    content: string;
    messageType: string;
  }) => (
    <div data-testid="message-content" data-message-type={messageType}>
      {content}
    </div>
  ),
}));

jest.mock("../MessageContextMenu", () => ({
  MessageContextMenu: ({ onCopy, onDelete, onRegenerate }: any) => (
    <div data-testid="message-context-menu">
      <button onClick={onCopy} data-testid="copy-button">
        Copy
      </button>
      <button onClick={onDelete} data-testid="delete-button">
        Delete
      </button>
      <button onClick={onRegenerate} data-testid="regenerate-button">
        Regenerate
      </button>
    </div>
  ),
}));

jest.mock("../MessageHeader", () => ({
  MessageHeader: ({ agentName, agentRole, timestamp }: any) => (
    <div data-testid="message-header">
      {agentName} | {agentRole} - {timestamp}
    </div>
  ),
}));

// Mock useUpdateMessage hook
const mockUpdateInclusion = jest.fn();
const mockReset = jest.fn();
const mockUseUpdateMessage = {
  updateInclusion: mockUpdateInclusion,
  updating: false,
  error: null as Error | null,
  reset: mockReset,
};

jest.mock("../../../hooks/messages/useUpdateMessage", () => ({
  useUpdateMessage: jest.fn(() => mockUseUpdateMessage),
}));

// Mock message data
const createMockMessage = (
  overrides: Partial<MessageViewModel> = {},
): MessageViewModel => ({
  id: "msg-123",
  agent: "Test Agent",
  role: "Assistant",
  content: "This is a test message",
  timestamp: "2:15 PM",
  type: "agent",
  isActive: true,
  agentColor: "#3b82f6",
  ...overrides,
});

const createMockProps = (
  overrides: Partial<MessageItemProps> = {},
): MessageItemProps => ({
  message: createMockMessage(),
  canRegenerate: true,
  onContextMenuAction: jest.fn(),
  ...overrides,
});

describe("MessageItem", () => {
  const mockOnContextMenuAction = jest.fn();

  // Mock response message for updateInclusion
  const mockUpdatedMessage: Message = {
    id: "msg-123",
    conversation_id: "conv-123",
    conversation_agent_id: null,
    role: "user",
    content: "Test message",
    included: false,
    created_at: "2023-01-01T10:00:00.000Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock hook state
    mockUseUpdateMessage.updating = false;
    mockUseUpdateMessage.error = null;
    mockUpdateInclusion.mockResolvedValue(mockUpdatedMessage);
  });

  describe("Basic Message Rendering", () => {
    it("renders agent messages with header and content", () => {
      const props = createMockProps({
        message: createMockMessage({ type: "agent" }),
      });

      render(<MessageItem {...props} />);

      expect(screen.getByTestId("message-header")).toBeInTheDocument();
      expect(screen.getByTestId("message-content")).toBeInTheDocument();
      expect(screen.getByTestId("message-context-menu")).toBeInTheDocument();
    });

    it("renders user messages with right-aligned layout", () => {
      const props = createMockProps({
        message: createMockMessage({ type: "user", agent: "User" }),
      });

      render(<MessageItem {...props} />);

      expect(screen.getByTestId("message-header")).toBeInTheDocument();
      expect(screen.getByTestId("message-content")).toBeInTheDocument();
      const container = screen.getByRole("article");
      expect(container).toHaveAttribute("aria-label", "user message from User");
    });

    it("renders regular system messages with simple styling", () => {
      const props = createMockProps({
        message: createMockMessage({
          type: "system",
          agent: "System",
          content: "User joined the conversation",
        }),
      });

      render(<MessageItem {...props} />);

      expect(
        screen.getByText("User joined the conversation"),
      ).toBeInTheDocument();
      expect(screen.queryByTestId("message-header")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("message-context-menu"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Error System Message Detection", () => {
    it("detects error system messages starting with 'Agent'", () => {
      const props = createMockProps({
        message: createMockMessage({
          type: "system",
          agent: "System",
          content:
            "Agent Technical Advisor: Network connection failed. Please try again.",
        }),
      });

      render(<MessageItem {...props} />);

      // Should render error styling instead of regular system message
      const errorMessage = screen.getByText(
        "Network connection failed. Please try again.",
      );
      expect(errorMessage).toBeInTheDocument();

      // Should show agent name
      const agentName = screen.getByText("Technical Advisor");
      expect(agentName).toBeInTheDocument();
    });

    it("does not treat non-agent system messages as errors", () => {
      const props = createMockProps({
        message: createMockMessage({
          type: "system",
          agent: "System",
          content: "User joined the conversation",
        }),
      });

      render(<MessageItem {...props} />);

      const message = screen.getByText("User joined the conversation");
      expect(message).toBeInTheDocument();

      // Should not have error styling elements
      expect(
        document.querySelector('svg[aria-hidden="true"]'),
      ).not.toBeInTheDocument();
    });
  });

  describe("Error Message Parsing", () => {
    it("extracts agent name from error messages correctly", () => {
      const props = createMockProps({
        message: createMockMessage({
          type: "system",
          agent: "System",
          content:
            "Agent Research Assistant: Rate limit exceeded. Please wait before trying again.",
        }),
      });

      render(<MessageItem {...props} />);

      expect(screen.getByText("Research Assistant")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Rate limit exceeded. Please wait before trying again.",
        ),
      ).toBeInTheDocument();
    });

    it("handles agent names with spaces and special characters", () => {
      const props = createMockProps({
        message: createMockMessage({
          type: "system",
          agent: "System",
          content:
            "Agent Creative Writing Bot-v2: Authentication failed. Please check your API key.",
        }),
      });

      render(<MessageItem {...props} />);

      expect(screen.getByText("Creative Writing Bot-v2")).toBeInTheDocument();
      expect(
        screen.getByText("Authentication failed. Please check your API key."),
      ).toBeInTheDocument();
    });

    it("handles malformed error messages gracefully", () => {
      const props = createMockProps({
        message: createMockMessage({
          type: "system",
          agent: "System",
          content: "Agent : Missing agent name error message.",
        }),
      });

      render(<MessageItem {...props} />);

      expect(
        screen.getByText("Agent : Missing agent name error message."),
      ).toBeInTheDocument();
    });
  });

  describe("Error Message Styling", () => {
    it("applies error styling to error system messages", () => {
      const props = createMockProps({
        message: createMockMessage({
          type: "system",
          agent: "System",
          content: "Agent Data Analyzer: Connection timeout. Please try again.",
        }),
      });

      render(<MessageItem {...props} />);

      const container = screen.getByText(
        "Connection timeout. Please try again.",
      ).parentElement?.parentElement;
      expect(container).toHaveClass(
        "bg-red-50",
        "border-red-200",
        "text-red-700",
      );
    });

    it("includes warning icon for error messages", () => {
      const props = createMockProps({
        message: createMockMessage({
          type: "system",
          agent: "System",
          content: "Agent Code Helper: Validation error occurred.",
        }),
      });

      render(<MessageItem {...props} />);

      const warningIcon = document.querySelector('svg[aria-hidden="true"]');
      expect(warningIcon).toBeInTheDocument();
      expect(warningIcon).toHaveClass("text-red-500");
    });

    it("applies different styling for regular system messages", () => {
      const props = createMockProps({
        message: createMockMessage({
          type: "system",
          agent: "System",
          content: "User joined the conversation",
        }),
      });

      render(<MessageItem {...props} />);

      const container = screen
        .getByText("User joined the conversation")
        .closest("div");
      expect(container).toHaveClass("italic", "text-muted-foreground");
      expect(container).not.toHaveClass("bg-red-50");
    });
  });

  describe("Context Toggle Functionality", () => {
    it("shows active state toggle button for agent messages", () => {
      const props = createMockProps({
        message: createMockMessage({ isActive: true }),
      });

      render(<MessageItem {...props} />);

      const toggleButton = screen.getByRole("checkbox", {
        name: /exclude message from conversation context/i,
      });
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton.querySelector("svg")).toBeInTheDocument(); // Check icon
    });

    it("shows inactive state toggle button for agent messages", () => {
      const props = createMockProps({
        message: createMockMessage({ isActive: false }),
      });

      render(<MessageItem {...props} />);

      const toggleButton = screen.getByRole("checkbox", {
        name: /include message in conversation context/i,
      });
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton.querySelector("svg")).toBeNull(); // No icon for unchecked state
    });

    it("toggles message context state when clicked", () => {
      const props = createMockProps({
        message: createMockMessage({ isActive: true }),
      });

      render(<MessageItem {...props} />);

      const toggleButton = screen.getByRole("checkbox", {
        name: /exclude message from conversation context/i,
      });
      fireEvent.click(toggleButton);

      // Checkbox should change to indicate new state
      expect(
        screen.getByRole("checkbox", {
          name: /include message in conversation context/i,
        }),
      ).toBeInTheDocument();
    });

    it("does not show toggle button for system messages", () => {
      const props = createMockProps({
        message: createMockMessage({
          type: "system",
          content: "Agent Helper: Error occurred.",
        }),
      });

      render(<MessageItem {...props} />);

      expect(
        screen.queryByRole("button", { name: /context/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Context Menu Actions", () => {
    it("calls onContextMenuAction when copy is clicked", () => {
      const props = createMockProps({
        onContextMenuAction: mockOnContextMenuAction,
      });

      render(<MessageItem {...props} />);

      fireEvent.click(screen.getByTestId("copy-button"));
      expect(mockOnContextMenuAction).toHaveBeenCalledWith("copy", "msg-123");
    });

    it("calls onContextMenuAction when delete is clicked", () => {
      const props = createMockProps({
        onContextMenuAction: mockOnContextMenuAction,
      });

      render(<MessageItem {...props} />);

      fireEvent.click(screen.getByTestId("delete-button"));
      expect(mockOnContextMenuAction).toHaveBeenCalledWith("delete", "msg-123");
    });

    it("calls onContextMenuAction when regenerate is clicked", () => {
      const props = createMockProps({
        onContextMenuAction: mockOnContextMenuAction,
      });

      render(<MessageItem {...props} />);

      fireEvent.click(screen.getByTestId("regenerate-button"));
      expect(mockOnContextMenuAction).toHaveBeenCalledWith(
        "regenerate",
        "msg-123",
      );
    });
  });

  describe("Accessibility", () => {
    it("sets proper ARIA labels for messages", () => {
      const props = createMockProps({
        message: createMockMessage({
          type: "agent",
          agent: "Technical Advisor",
        }),
      });

      render(<MessageItem {...props} />);

      const article = screen.getByRole("article");
      expect(article).toHaveAttribute(
        "aria-label",
        "agent message from Technical Advisor",
      );
    });

    it("provides proper ARIA labels for context toggle buttons", () => {
      const props = createMockProps({
        message: createMockMessage({ isActive: true }),
      });

      render(<MessageItem {...props} />);

      const toggleButton = screen.getByRole("checkbox", {
        name: /exclude message from conversation context/i,
      });
      expect(toggleButton).toHaveAttribute(
        "title",
        "Click to exclude from context",
      );
    });

    it("ensures error system messages are accessible", () => {
      const props = createMockProps({
        message: createMockMessage({
          type: "system",
          agent: "System",
          content: "Agent Helper: Network error occurred.",
        }),
      });

      render(<MessageItem {...props} />);

      const warningIcon = document.querySelector('svg[aria-hidden="true"]');
      expect(warningIcon).toBeInTheDocument();
      expect(warningIcon).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Custom Styling", () => {
    it("applies custom className to message container", () => {
      const props = createMockProps({
        className: "custom-message-class",
      });

      render(<MessageItem {...props} />);

      const container = screen.getByRole("article");
      expect(container).toHaveClass("custom-message-class");
    });
  });

  describe("Checkbox Integration with useUpdateMessage Hook", () => {
    it("calls updateInclusion when checkbox is clicked to exclude message", async () => {
      const props = createMockProps({
        message: createMockMessage({ isActive: true }),
      });

      render(<MessageItem {...props} />);

      const toggleButton = screen.getByRole("checkbox", {
        name: /exclude message from conversation context/i,
      });
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(mockUpdateInclusion).toHaveBeenCalledWith("msg-123", false);
      });
      expect(mockReset).toHaveBeenCalled();
    });

    it("calls updateInclusion when checkbox is clicked to include message", async () => {
      const props = createMockProps({
        message: createMockMessage({ isActive: false }),
      });

      render(<MessageItem {...props} />);

      const toggleButton = screen.getByRole("checkbox", {
        name: /include message in conversation context/i,
      });
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(mockUpdateInclusion).toHaveBeenCalledWith("msg-123", true);
      });
      expect(mockReset).toHaveBeenCalled();
    });

    it("shows loading state during inclusion update", async () => {
      // Set mock to return loading state
      mockUseUpdateMessage.updating = true;

      const props = createMockProps({
        message: createMockMessage({ isActive: true }),
      });

      render(<MessageItem {...props} />);

      const toggleButton = screen.getByRole("checkbox", {
        name: /updating message inclusion status/i,
      });
      expect(toggleButton).toBeDisabled();
      expect(toggleButton).toHaveAttribute("title", "Updating...");
      expect(toggleButton.querySelector("svg")).toBeInTheDocument();
      expect(toggleButton).toHaveClass(
        "animate-pulse",
        "opacity-60",
        "cursor-not-allowed",
      );
    });

    it("displays error message when inclusion update fails", async () => {
      const testError = new Error("Update failed");
      mockUseUpdateMessage.error = testError;

      const props = createMockProps({
        message: createMockMessage({ isActive: true }),
      });

      render(<MessageItem {...props} />);

      const errorElement = screen.getByText("Failed to update: Update failed");
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveAttribute("role", "alert");
      expect(errorElement).toHaveAttribute("aria-live", "polite");
      expect(errorElement).toHaveAttribute("id", "error-msg-123");
    });

    it("has proper checkbox role and ARIA attributes", () => {
      const props = createMockProps({
        message: createMockMessage({ isActive: true }),
      });

      render(<MessageItem {...props} />);

      const toggleButton = screen.getByRole("checkbox");
      expect(toggleButton).toHaveAttribute("role", "checkbox");
      expect(toggleButton).toHaveAttribute("aria-checked", "true");
      expect(toggleButton).toHaveAttribute("tabIndex", "0");
    });

    it("updates aria-checked when inclusion state changes", () => {
      const props = createMockProps({
        message: createMockMessage({ isActive: false }),
      });

      render(<MessageItem {...props} />);

      const toggleButton = screen.getByRole("checkbox");
      expect(toggleButton).toHaveAttribute("aria-checked", "false");
    });

    it("handles keyboard navigation with Space key", async () => {
      const props = createMockProps({
        message: createMockMessage({ isActive: false }),
      });

      render(<MessageItem {...props} />);

      const toggleButton = screen.getByRole("checkbox");
      fireEvent.keyDown(toggleButton, { key: " " });

      await waitFor(() => {
        expect(mockUpdateInclusion).toHaveBeenCalledWith("msg-123", true);
      });
    });

    it("handles keyboard navigation with Enter key", async () => {
      const props = createMockProps({
        message: createMockMessage({ isActive: true }),
      });

      render(<MessageItem {...props} />);

      const toggleButton = screen.getByRole("checkbox");
      fireEvent.keyDown(toggleButton, { key: "Enter" });

      await waitFor(() => {
        expect(mockUpdateInclusion).toHaveBeenCalledWith("msg-123", false);
      });
    });

    it("does not trigger on other key presses", () => {
      const props = createMockProps({
        message: createMockMessage({ isActive: false }),
      });

      render(<MessageItem {...props} />);

      const toggleButton = screen.getByRole("checkbox");
      fireEvent.keyDown(toggleButton, { key: "Tab" });

      expect(mockUpdateInclusion).not.toHaveBeenCalled();
    });

    it("prevents keyboard action when updating", () => {
      mockUseUpdateMessage.updating = true;

      const props = createMockProps({
        message: createMockMessage({ isActive: false }),
      });

      render(<MessageItem {...props} />);

      const toggleButton = screen.getByRole("checkbox");
      fireEvent.keyDown(toggleButton, { key: " " });

      expect(mockUpdateInclusion).not.toHaveBeenCalled();
    });

    it("has proper aria-describedby when error exists", () => {
      const testError = new Error("Update failed");
      mockUseUpdateMessage.error = testError;

      const props = createMockProps({
        message: createMockMessage({ isActive: true }),
      });

      render(<MessageItem {...props} />);

      const toggleButton = screen.getByRole("checkbox");
      expect(toggleButton).toHaveAttribute("aria-describedby", "error-msg-123");
    });

    it("shows checkmark icon when message is included", () => {
      const props = createMockProps({
        message: createMockMessage({ isActive: true }),
      });

      render(<MessageItem {...props} />);

      const toggleButton = screen.getByRole("checkbox");
      expect(toggleButton.querySelector("svg")).toBeInTheDocument();
      expect(toggleButton).toHaveClass(
        "bg-primary",
        "border-primary",
        "text-primary-foreground",
      );
    });

    it("applies proper styling for excluded state", () => {
      const props = createMockProps({
        message: createMockMessage({ isActive: false }),
      });

      render(<MessageItem {...props} />);

      const toggleButton = screen.getByRole("checkbox");
      expect(toggleButton).toHaveClass(
        "bg-muted/30",
        "border-muted-foreground/30",
        "text-muted-foreground",
      );
    });

    it("shows optimistic updates immediately before database call", async () => {
      const props = createMockProps({
        message: createMockMessage({ isActive: true }),
      });

      render(<MessageItem {...props} />);

      const toggleButton = screen.getByRole("checkbox", {
        name: /exclude message from conversation context/i,
      });

      fireEvent.click(toggleButton);

      // Should immediately show the optimistic state (unchecked)
      await waitFor(() => {
        expect(
          screen.getByRole("checkbox", {
            name: /include message in conversation context/i,
          }),
        ).toBeInTheDocument();
      });
    });

    it("handles updateInclusion errors gracefully with rollback", async () => {
      const testError = new Error("Network error");
      mockUpdateInclusion.mockRejectedValue(testError);

      const props = createMockProps({
        message: createMockMessage({ isActive: true }),
      });

      render(<MessageItem {...props} />);

      const toggleButton = screen.getByRole("checkbox", {
        name: /exclude message from conversation context/i,
      });
      fireEvent.click(toggleButton);

      // Should rollback to original state after error
      await waitFor(() => {
        expect(
          screen.getByRole("checkbox", {
            name: /exclude message from conversation context/i,
          }),
        ).toBeInTheDocument();
      });
    });

    it("applies correct styling based on displayIsActive state", () => {
      const props = createMockProps({
        message: createMockMessage({ isActive: false }),
      });

      render(<MessageItem {...props} />);

      const messageWrapper = screen
        .getByRole("article")
        .querySelector(".opacity-50");
      expect(messageWrapper).toBeInTheDocument();
    });

    it("shows correct accessibility labels during loading", () => {
      mockUseUpdateMessage.updating = true;

      const props = createMockProps({
        message: createMockMessage({ isActive: true }),
      });

      render(<MessageItem {...props} />);

      const toggleButton = screen.getByRole("checkbox", {
        name: /updating message inclusion status/i,
      });
      expect(toggleButton).toHaveAttribute(
        "aria-label",
        "Updating message inclusion status",
      );
    });
  });

  describe("Edge Cases", () => {
    it("handles empty message content", () => {
      const props = createMockProps({
        message: createMockMessage({ content: "" }),
      });

      render(<MessageItem {...props} />);

      const messageContent = screen.getByTestId("message-content");
      expect(messageContent).toHaveTextContent("");
    });

    it("handles very long error messages", () => {
      const longErrorMessage = "Agent Long Name Helper: " + "A".repeat(500);
      const props = createMockProps({
        message: createMockMessage({
          type: "system",
          content: longErrorMessage,
        }),
      });

      render(<MessageItem {...props} />);

      expect(screen.getByText("Long Name Helper")).toBeInTheDocument();
      expect(screen.getByText("A".repeat(500))).toBeInTheDocument();
    });

    it("handles error messages without colons", () => {
      const props = createMockProps({
        message: createMockMessage({
          type: "system",
          content: "Agent Helper Network error",
        }),
      });

      render(<MessageItem {...props} />);

      // Should still be treated as error message but parsing might not work perfectly
      expect(
        screen.getByText("Agent Helper Network error"),
      ).toBeInTheDocument();
    });
  });
});
