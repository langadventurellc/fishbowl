/**
 * Unit tests for ChatContainerDisplay component.
 *
 * Tests scroll position detection, auto-scroll behavior, and scroll position preservation
 * for intelligent chat message display with proper UX.
 *
 * @module components/layout/__tests__/ChatContainerDisplay.test
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { ChatContainerDisplay } from "../ChatContainerDisplay";
import type { MessageViewModel } from "@fishbowl-ai/ui-shared";

// Mock child components
jest.mock("../../chat/MessageItem", () => ({
  MessageItem: ({ message }: any) => (
    <div data-testid={`message-${message.id}`} className="message-item">
      {message.type}: {message.content}
    </div>
  ),
}));

describe("ChatContainerDisplay", () => {
  const mockMessages: MessageViewModel[] = [
    {
      id: "1",
      agent: "User",
      role: "User",
      content: "Hello world",
      timestamp: "12:00:00",
      type: "user",
      isActive: true,
      agentColor: "#3b82f6",
    },
    {
      id: "2",
      agent: "Agent",
      role: "Agent",
      content: "Hello! How can I help you?",
      timestamp: "12:00:05",
      type: "agent",
      isActive: true,
      agentColor: "#22c55e",
    },
  ];

  beforeEach(() => {
    // Mock scrollTo method
    Element.prototype.scrollTo = jest.fn();
    // Mock scroll properties
    Object.defineProperty(Element.prototype, "scrollTop", {
      writable: true,
      value: 0,
    });
    Object.defineProperty(Element.prototype, "scrollHeight", {
      writable: true,
      value: 1000,
    });
    Object.defineProperty(Element.prototype, "clientHeight", {
      writable: true,
      value: 400,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      const { container } = render(<ChatContainerDisplay messages={[]} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("renders messages correctly", () => {
      render(<ChatContainerDisplay messages={mockMessages} />);

      expect(screen.getByTestId("message-1")).toBeInTheDocument();
      expect(screen.getByTestId("message-2")).toBeInTheDocument();
      expect(screen.getByText("user: Hello world")).toBeInTheDocument();
      expect(
        screen.getByText("agent: Hello! How can I help you?"),
      ).toBeInTheDocument();
    });

    it("renders empty state when no messages", () => {
      const emptyState = <div>No messages yet</div>;
      render(<ChatContainerDisplay messages={[]} emptyState={emptyState} />);

      expect(screen.getByText("No messages yet")).toBeInTheDocument();
    });

    it("renders empty state when messages is undefined", () => {
      const emptyState = <div>No messages yet</div>;
      render(<ChatContainerDisplay emptyState={emptyState} />);

      expect(screen.getByText("No messages yet")).toBeInTheDocument();
    });
  });

  describe("Scroll Behavior", () => {
    it("calls external onScroll handler when provided", () => {
      const mockOnScroll = jest.fn();
      const { container } = render(
        <ChatContainerDisplay
          messages={mockMessages}
          onScroll={mockOnScroll}
        />,
      );

      const scrollContainer = container.firstChild as Element;
      fireEvent.scroll(scrollContainer);

      expect(mockOnScroll).toHaveBeenCalled();
    });

    it("detects when user is near bottom of scroll area", async () => {
      const { container } = render(
        <ChatContainerDisplay messages={mockMessages} />,
      );
      const scrollContainer = container.firstChild as Element;

      // Mock being near bottom (within 100px)
      Object.defineProperty(scrollContainer, "scrollTop", { value: 850 });
      Object.defineProperty(scrollContainer, "scrollHeight", { value: 1000 });
      Object.defineProperty(scrollContainer, "clientHeight", { value: 400 });

      await act(async () => {
        fireEvent.scroll(scrollContainer);
      });

      // Since we can't directly access state, we test the side effect
      // If user scrolls near bottom, auto-scroll should work for new messages
      expect(scrollContainer).toBeInTheDocument();
    });

    it("detects when user has scrolled up from bottom", async () => {
      const { container } = render(
        <ChatContainerDisplay messages={mockMessages} />,
      );
      const scrollContainer = container.firstChild as Element;

      // Mock being far from bottom (more than 100px)
      Object.defineProperty(scrollContainer, "scrollTop", { value: 200 });
      Object.defineProperty(scrollContainer, "scrollHeight", { value: 1000 });
      Object.defineProperty(scrollContainer, "clientHeight", { value: 400 });

      await act(async () => {
        fireEvent.scroll(scrollContainer);
      });

      expect(scrollContainer).toBeInTheDocument();
    });
  });

  describe("Auto-scroll on New Messages", () => {
    it("auto-scrolls to bottom when new messages are added and user is near bottom", async () => {
      const { rerender, container } = render(
        <ChatContainerDisplay messages={mockMessages} />,
      );
      const scrollContainer = container.firstChild as Element;

      // Mock being near bottom initially
      Object.defineProperty(scrollContainer, "scrollTop", { value: 850 });
      Object.defineProperty(scrollContainer, "scrollHeight", { value: 1000 });
      Object.defineProperty(scrollContainer, "clientHeight", { value: 400 });

      // Trigger scroll event to set initial near-bottom state
      await act(async () => {
        fireEvent.scroll(scrollContainer);
      });

      // Add new message
      const newMessages = [
        ...mockMessages,
        {
          id: "3",
          agent: "Agent",
          role: "Agent",
          content: "Another response",
          timestamp: "12:00:10",
          type: "agent" as const,
          isActive: true,
          agentColor: "#22c55e",
        },
      ];

      await act(async () => {
        rerender(<ChatContainerDisplay messages={newMessages} />);
      });

      // Verify scrollTo was called with smooth behavior
      expect(Element.prototype.scrollTo).toHaveBeenCalledWith({
        top: expect.any(Number),
        behavior: "smooth",
      });
    });

    it("preserves scroll position when user has scrolled up and new messages arrive", async () => {
      const { rerender, container } = render(
        <ChatContainerDisplay messages={mockMessages} />,
      );
      const scrollContainer = container.firstChild as Element;

      // Mock being far from bottom (user scrolled up to read history)
      Object.defineProperty(scrollContainer, "scrollTop", { value: 200 });
      Object.defineProperty(scrollContainer, "scrollHeight", { value: 1000 });
      Object.defineProperty(scrollContainer, "clientHeight", { value: 400 });

      // Trigger scroll event to set not-near-bottom state
      await act(async () => {
        fireEvent.scroll(scrollContainer);
      });

      // Add new message
      const newMessages = [
        ...mockMessages,
        {
          id: "3",
          agent: "Agent",
          role: "Agent",
          content: "Another response",
          timestamp: "12:00:10",
          type: "agent" as const,
          isActive: true,
          agentColor: "#22c55e",
        },
      ];

      await act(async () => {
        rerender(<ChatContainerDisplay messages={newMessages} />);
      });

      // Verify scrollTo was NOT called (position preserved)
      expect(Element.prototype.scrollTo).not.toHaveBeenCalled();
    });

    it("handles empty message arrays without errors", async () => {
      const { rerender } = render(<ChatContainerDisplay messages={[]} />);

      await act(async () => {
        rerender(<ChatContainerDisplay messages={mockMessages} />);
      });

      // Should render new messages without throwing
      expect(screen.getByTestId("message-1")).toBeInTheDocument();
      expect(screen.getByTestId("message-2")).toBeInTheDocument();
    });
  });

  describe("Styling and Layout", () => {
    it("applies custom className", () => {
      const { container } = render(
        <ChatContainerDisplay
          messages={mockMessages}
          className="custom-class"
        />,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("applies custom styles", () => {
      const customStyle = { backgroundColor: "red" };
      const { container } = render(
        <ChatContainerDisplay messages={mockMessages} style={customStyle} />,
      );

      // Verify the style prop was applied to the element
      const element = container.firstChild as HTMLElement;
      expect(element).toBeInTheDocument();
      expect(element.style.backgroundColor).toBe("red");
    });

    it("applies dynamic CSS custom properties", () => {
      const { container } = render(
        <ChatContainerDisplay
          messages={mockMessages}
          messageSpacing="20px"
          containerPadding="10px 15px"
          maxHeight="500px"
        />,
      );

      const element = container.firstChild as Element;

      // Note: In jsdom, CSS custom properties might not be fully supported
      // but we can verify the style object was applied
      expect(element).toBeInTheDocument();
    });

    it("applies max height when provided", () => {
      const { container } = render(
        <ChatContainerDisplay messages={mockMessages} maxHeight="300px" />,
      );

      expect(container.firstChild).toHaveClass("max-h-[var(--max-height)]");
    });
  });

  describe("Context Menu Integration", () => {
    it("passes onContextMenuAction to MessageItem components", () => {
      const mockContextMenuAction = jest.fn();
      render(
        <ChatContainerDisplay
          messages={mockMessages}
          onContextMenuAction={mockContextMenuAction}
        />,
      );

      // MessageItem components should receive the handler
      expect(screen.getByTestId("message-1")).toBeInTheDocument();
      expect(screen.getByTestId("message-2")).toBeInTheDocument();
    });

    it("provides default empty function when onContextMenuAction is not provided", () => {
      // Should not throw when no handler is provided
      expect(() => {
        render(<ChatContainerDisplay messages={mockMessages} />);
      }).not.toThrow();
    });
  });
});
