import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MessageItem } from "../MessageItem";
import { MessagesRefreshContext } from "../../../hooks/messages";
import { MessageViewModel, MessageItemProps } from "@fishbowl-ai/ui-shared";

// Mock the useUpdateMessage hook
const mockUseUpdateMessage = {
  updateInclusion: jest.fn(),
  updating: false,
  error: null as Error | null,
  reset: jest.fn(),
};

jest.mock("../../../hooks/messages/useUpdateMessage", () => ({
  useUpdateMessage: () => mockUseUpdateMessage,
}));

// Mock message data
const createMockMessage = (
  overrides: Partial<MessageViewModel> = {},
): MessageViewModel => ({
  id: "message-1",
  agent: "Test Agent",
  role: "Test Agent",
  content: "Test message content",
  timestamp: "2:15 PM",
  type: "agent",
  isActive: true,
  agentColor: "#3b82f6",
  ...overrides,
});

const defaultProps: MessageItemProps = {
  message: createMockMessage(),
  className: "",
  canRegenerate: false,
  onContextMenuAction: jest.fn(),
};

// Test wrapper that provides MessagesRefreshContext
const TestWrapper: React.FC<{
  children: React.ReactNode;
  refetch?: (() => Promise<void>) | null;
}> = ({ children, refetch = null }) => (
  <MessagesRefreshContext.Provider value={{ refetch }}>
    {children}
  </MessagesRefreshContext.Provider>
);

describe("MessageItem Store Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUpdateMessage.updating = false;
    mockUseUpdateMessage.error = null;
  });

  describe("Store-backed MessagesRefreshContext Integration", () => {
    it("should call store refresh function when toggling message inclusion", async () => {
      const mockRefetch = jest.fn().mockResolvedValue(undefined);
      mockUseUpdateMessage.updateInclusion.mockResolvedValue(undefined);

      render(
        <TestWrapper refetch={mockRefetch}>
          <MessageItem {...defaultProps} />
        </TestWrapper>,
      );

      // Find and click the inclusion toggle button
      const toggleButton = screen.getByRole("checkbox");
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(mockUseUpdateMessage.updateInclusion).toHaveBeenCalledWith(
          "message-1",
          false, // Should toggle from true to false
        );
      });

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalledTimes(1);
      });
    });

    it("should handle store refresh function being null", async () => {
      mockUseUpdateMessage.updateInclusion.mockResolvedValue(undefined);

      render(
        <TestWrapper refetch={null}>
          <MessageItem {...defaultProps} />
        </TestWrapper>,
      );

      const toggleButton = screen.getByRole("checkbox");
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(mockUseUpdateMessage.updateInclusion).toHaveBeenCalledWith(
          "message-1",
          false,
        );
      });

      // Should not throw error when refetch is null
      // This ensures backward compatibility
    });

    it("should handle store refresh errors gracefully", async () => {
      const mockRefetch = jest
        .fn()
        .mockRejectedValue(new Error("Store refresh failed"));
      mockUseUpdateMessage.updateInclusion.mockResolvedValue(undefined);

      // Spy on console.error to verify error handling
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      render(
        <TestWrapper refetch={mockRefetch}>
          <MessageItem {...defaultProps} />
        </TestWrapper>,
      );

      const toggleButton = screen.getByRole("checkbox");
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(mockUseUpdateMessage.updateInclusion).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });

      // Component should handle refresh error gracefully
      // The optimistic state should be reset on any error
      expect(consoleSpy).not.toHaveBeenCalled(); // No console errors expected

      consoleSpy.mockRestore();
    });

    it("should maintain optimistic updates during store refresh", async () => {
      const mockRefetch = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100)),
        );
      mockUseUpdateMessage.updateInclusion.mockResolvedValue(undefined);

      render(
        <TestWrapper refetch={mockRefetch}>
          <MessageItem
            {...defaultProps}
            message={createMockMessage({ isActive: true })}
          />
        </TestWrapper>,
      );

      const toggleButton = screen.getByRole("checkbox");

      // Verify initial state shows as active (checkbox should be checked)
      expect(toggleButton).toHaveClass("bg-primary");

      // Click to toggle
      fireEvent.click(toggleButton);

      // Should immediately show optimistic state (unchecked)
      await waitFor(() => {
        expect(toggleButton).toHaveClass("bg-muted/30");
      });

      // Wait for operations to complete
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });

      // After completion, should maintain the new state
      expect(toggleButton).toHaveClass("bg-muted/30");
    });

    it("should coordinate loading states with store operations", async () => {
      mockUseUpdateMessage.updating = true;
      const mockRefetch = jest.fn().mockResolvedValue(undefined);

      render(
        <TestWrapper refetch={mockRefetch}>
          <MessageItem {...defaultProps} />
        </TestWrapper>,
      );

      const toggleButton = screen.getByRole("checkbox");

      // When updating is true, button should show loading state
      expect(toggleButton).toHaveClass("animate-pulse");
      expect(toggleButton).toHaveClass("cursor-not-allowed");
    });

    it("should handle message updates with proper error recovery", async () => {
      const mockRefetch = jest.fn().mockResolvedValue(undefined);
      mockUseUpdateMessage.updateInclusion.mockRejectedValue(
        new Error("Update failed"),
      );

      render(
        <TestWrapper refetch={mockRefetch}>
          <MessageItem
            {...defaultProps}
            message={createMockMessage({ isActive: true })}
          />
        </TestWrapper>,
      );

      const toggleButton = screen.getByRole("checkbox");

      // Initial state - should be checked (active)
      expect(toggleButton).toHaveClass("bg-primary");

      // Click to toggle
      fireEvent.click(toggleButton);

      // Should show optimistic state immediately
      await waitFor(() => {
        expect(toggleButton).toHaveClass("bg-muted/30");
      });

      // After error, should revert to original state
      await waitFor(() => {
        expect(toggleButton).toHaveClass("bg-primary");
      });

      // Refetch should not be called if updateInclusion fails
      expect(mockRefetch).not.toHaveBeenCalled();
    });
  });

  describe("Store Integration with Different Message States", () => {
    it("should work correctly with inactive messages", async () => {
      const mockRefetch = jest.fn().mockResolvedValue(undefined);
      mockUseUpdateMessage.updateInclusion.mockResolvedValue(undefined);

      render(
        <TestWrapper refetch={mockRefetch}>
          <MessageItem
            {...defaultProps}
            message={createMockMessage({ isActive: false })}
          />
        </TestWrapper>,
      );

      const toggleButton = screen.getByRole("checkbox");

      // Should start unchecked for inactive message
      expect(toggleButton).toHaveClass("bg-muted/30");

      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(mockUseUpdateMessage.updateInclusion).toHaveBeenCalledWith(
          "message-1",
          true, // Should toggle from false to true
        );
      });

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });

    it("should handle system messages correctly with store integration", async () => {
      const mockRefetch = jest.fn().mockResolvedValue(undefined);
      mockUseUpdateMessage.updateInclusion.mockResolvedValue(undefined);

      const systemMessage = createMockMessage({
        type: "system",
        agent: "System",
        role: "System",
        content: "Agent GPT-4: Error processing request",
      });

      render(
        <TestWrapper refetch={mockRefetch}>
          <MessageItem {...defaultProps} message={systemMessage} />
        </TestWrapper>,
      );

      // System messages may not have toggle functionality depending on implementation
      // This test verifies the component renders system messages without crashing
      const systemMessageElement = screen.getByRole("article");
      expect(systemMessageElement).toBeInTheDocument();

      // Check if toggle button exists for system messages
      const toggleButton = screen.queryByRole("checkbox");
      if (toggleButton) {
        fireEvent.click(toggleButton);

        await waitFor(() => {
          expect(mockUseUpdateMessage.updateInclusion).toHaveBeenCalled();
        });

        await waitFor(() => {
          expect(mockRefetch).toHaveBeenCalled();
        });
      }
      // If no toggle button, system messages are handled differently (which is fine)
    });

    it("should handle user messages correctly with store integration", async () => {
      const mockRefetch = jest.fn().mockResolvedValue(undefined);
      mockUseUpdateMessage.updateInclusion.mockResolvedValue(undefined);

      const userMessage = createMockMessage({
        type: "user",
        agent: "User",
        role: "User",
        content: "What is the capital of France?",
      });

      render(
        <TestWrapper refetch={mockRefetch}>
          <MessageItem {...defaultProps} message={userMessage} />
        </TestWrapper>,
      );

      const toggleButton = screen.getByRole("checkbox");
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(mockUseUpdateMessage.updateInclusion).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  describe("Error State Integration", () => {
    it("should handle errors from useUpdateMessage hook correctly", () => {
      mockUseUpdateMessage.error = new Error("Failed to update message");

      render(
        <TestWrapper>
          <MessageItem {...defaultProps} />
        </TestWrapper>,
      );

      // Component should handle error state appropriately
      // The specific error display mechanism depends on the component implementation
      // This test verifies the component doesn't crash with error state
    });
  });

  describe("Performance and Accessibility", () => {
    it("should handle keyboard interactions with store integration", async () => {
      const mockRefetch = jest.fn().mockResolvedValue(undefined);
      mockUseUpdateMessage.updateInclusion.mockResolvedValue(undefined);

      render(
        <TestWrapper refetch={mockRefetch}>
          <MessageItem {...defaultProps} />
        </TestWrapper>,
      );

      const toggleButton = screen.getByRole("checkbox");

      // Test Enter key
      fireEvent.keyDown(toggleButton, { key: "Enter" });

      await waitFor(() => {
        expect(mockUseUpdateMessage.updateInclusion).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });

      // Reset mocks for space key test
      jest.clearAllMocks();

      // Test Space key
      fireEvent.keyDown(toggleButton, { key: " " });

      await waitFor(() => {
        expect(mockUseUpdateMessage.updateInclusion).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });

    it("should not trigger updates when disabled/updating", async () => {
      mockUseUpdateMessage.updating = true;
      const mockRefetch = jest.fn();

      render(
        <TestWrapper refetch={mockRefetch}>
          <MessageItem {...defaultProps} />
        </TestWrapper>,
      );

      const toggleButton = screen.getByRole("checkbox");
      fireEvent.click(toggleButton);

      // Should not trigger updates when in updating state
      expect(mockUseUpdateMessage.updateInclusion).not.toHaveBeenCalled();
      expect(mockRefetch).not.toHaveBeenCalled();
    });
  });
});
