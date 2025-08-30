import type { MessageViewModel } from "@fishbowl-ai/ui-shared";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { ContextStatistics } from "../ContextStatistics";

// Helper function to create mock messages
const createMockMessage = (
  id: string,
  isActive: boolean,
  type: "user" | "agent" | "system" = "user",
): MessageViewModel => ({
  id,
  agent: type === "user" ? "User" : type === "system" ? "System" : "Assistant",
  role: type === "user" ? "User" : type === "system" ? "System" : "Assistant",
  content: `Message ${id} content`,
  timestamp: "2:15 PM",
  type,
  isActive,
  agentColor: type === "user" ? "#6b7280" : "#3b82f6",
});

describe("ContextStatistics", () => {
  describe("Message counting logic", () => {
    it("should display correct count with single included message", () => {
      const messages: MessageViewModel[] = [createMockMessage("1", true)];

      render(<ContextStatistics messages={messages} />);

      expect(
        screen.getByText("1 message included in context"),
      ).toBeInTheDocument();
    });

    it("should display correct count with multiple included messages", () => {
      const messages: MessageViewModel[] = [
        createMockMessage("1", true),
        createMockMessage("2", false),
        createMockMessage("3", true),
        createMockMessage("4", true),
      ];

      render(<ContextStatistics messages={messages} />);

      expect(
        screen.getByText("3 messages included in context"),
      ).toBeInTheDocument();
    });

    it("should display correct count with all messages excluded", () => {
      const messages: MessageViewModel[] = [
        createMockMessage("1", false),
        createMockMessage("2", false),
      ];

      render(<ContextStatistics messages={messages} />);

      expect(
        screen.getByText("No messages included in context"),
      ).toBeInTheDocument();
    });

    it("should handle empty message array", () => {
      render(<ContextStatistics messages={[]} />);

      expect(
        screen.getByText("No messages in conversation"),
      ).toBeInTheDocument();
    });

    it("should handle mixed message types correctly", () => {
      const messages: MessageViewModel[] = [
        createMockMessage("1", true, "user"),
        createMockMessage("2", true, "agent"),
        createMockMessage("3", false, "system"),
        createMockMessage("4", true, "user"),
      ];

      render(<ContextStatistics messages={messages} />);

      expect(
        screen.getByText("3 messages included in context"),
      ).toBeInTheDocument();
    });
  });

  describe("Warning state display", () => {
    it("should show warning text when no messages are included", () => {
      const messages: MessageViewModel[] = [
        createMockMessage("1", false),
        createMockMessage("2", false),
      ];

      render(<ContextStatistics messages={messages} showWarningIcon={true} />);

      expect(
        screen.getByText("No messages included in context"),
      ).toBeInTheDocument();
    });

    it("should show warning icon when showWarningIcon is true and no messages included", () => {
      const messages: MessageViewModel[] = [createMockMessage("1", false)];

      render(<ContextStatistics messages={messages} showWarningIcon={true} />);

      // Warning icon should be present
      const warningIcon = screen.getByText(
        "No messages included in context",
      ).previousElementSibling;
      expect(warningIcon).toHaveClass("text-orange-500");
    });

    it("should not show warning icon when showWarningIcon is false", () => {
      const messages: MessageViewModel[] = [createMockMessage("1", false)];

      const { container } = render(
        <ContextStatistics messages={messages} showWarningIcon={false} />,
      );

      // No warning icon should be present
      const icons = container.querySelectorAll("svg");
      const warningIcons = Array.from(icons).filter((icon) =>
        icon.classList.contains("text-orange-500"),
      );
      expect(warningIcons).toHaveLength(0);
    });
  });

  describe("Display variants", () => {
    const messages = [
      createMockMessage("1", true),
      createMockMessage("2", true),
    ];

    it("should render default variant correctly", () => {
      const { container } = render(
        <ContextStatistics messages={messages} variant="default" />,
      );

      const rootElement = container.firstChild as HTMLElement;
      expect(rootElement).toHaveClass("px-3", "py-2");
    });

    it("should render compact variant correctly", () => {
      const { container } = render(
        <ContextStatistics messages={messages} variant="compact" />,
      );

      const rootElement = container.firstChild as HTMLElement;
      expect(rootElement).toHaveClass("px-2", "py-1");

      // Text should be smaller in compact mode
      const textElement = screen.getByText("2 messages included in context");
      expect(textElement).toHaveClass("text-xs");
    });

    it("should render minimal variant correctly", () => {
      const { container } = render(
        <ContextStatistics messages={messages} variant="minimal" />,
      );

      const rootElement = container.firstChild as HTMLElement;
      expect(rootElement).toHaveClass("p-0");

      // Should not show icon in minimal variant
      const icons = container.querySelectorAll("svg");
      expect(icons).toHaveLength(0);
    });

    it("should show message icon in default variant when messages are included", () => {
      const { container } = render(
        <ContextStatistics messages={messages} variant="default" />,
      );

      // Message icon should be present
      const icons = container.querySelectorAll("svg");
      const messageIcons = Array.from(icons).filter((icon) =>
        icon.classList.contains("text-muted-foreground"),
      );
      expect(messageIcons.length).toBeGreaterThan(0);
    });

    it("should not show message icon in compact variant", () => {
      const { container } = render(
        <ContextStatistics messages={messages} variant="compact" />,
      );

      // No message icon should be present in compact mode
      const icons = container.querySelectorAll("svg");
      const messageIcons = Array.from(icons).filter((icon) =>
        icon.classList.contains("text-muted-foreground"),
      );
      expect(messageIcons).toHaveLength(0);
    });
  });

  describe("Component props handling", () => {
    const messages = [createMockMessage("1", true)];

    it("should apply custom className", () => {
      const { container } = render(
        <ContextStatistics messages={messages} className="custom-stats" />,
      );

      const rootElement = container.firstChild as HTMLElement;
      expect(rootElement).toHaveClass("custom-stats");
    });

    it("should handle default props correctly", () => {
      render(<ContextStatistics messages={messages} />);

      expect(
        screen.getByText("1 message included in context"),
      ).toBeInTheDocument();
    });

    it("should combine custom className with base classes", () => {
      const { container } = render(
        <ContextStatistics
          messages={messages}
          className="custom-stats another-class"
          variant="compact"
        />,
      );

      const rootElement = container.firstChild as HTMLElement;
      expect(rootElement).toHaveClass(
        "custom-stats",
        "another-class",
        "px-2",
        "py-1",
      );
    });
  });

  describe("Accessibility features", () => {
    it("should have proper ARIA role and labels", () => {
      const messages = [
        createMockMessage("1", true),
        createMockMessage("2", false),
      ];

      render(<ContextStatistics messages={messages} />);

      const statusElement = screen.getByRole("status");
      expect(statusElement).toHaveAttribute("aria-live", "polite");
      expect(statusElement).toHaveAttribute(
        "aria-label",
        "Context statistics: 1 message included in context",
      );
    });

    it("should update ARIA label for warning state", () => {
      const messages = [createMockMessage("1", false)];

      render(<ContextStatistics messages={messages} />);

      const statusElement = screen.getByRole("status");
      expect(statusElement).toHaveAttribute(
        "aria-label",
        "Context statistics: No messages included in context",
      );
    });

    it("should update ARIA label for empty state", () => {
      render(<ContextStatistics messages={[]} />);

      const statusElement = screen.getByRole("status");
      expect(statusElement).toHaveAttribute(
        "aria-label",
        "Context statistics: No messages in conversation",
      );
    });

    it("should mark icons as decorative with aria-hidden", () => {
      const messages = [createMockMessage("1", true)];
      const { container } = render(
        <ContextStatistics messages={messages} variant="default" />,
      );

      const icons = container.querySelectorAll("svg");
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute("aria-hidden", "true");
      });
    });
  });

  describe("Styling integration", () => {
    it("should apply warning styling when context is empty", () => {
      const messages = [createMockMessage("1", false)];
      const { container } = render(<ContextStatistics messages={messages} />);

      const rootElement = container.firstChild as HTMLElement;
      expect(rootElement).toHaveClass("text-orange-600");
    });

    it("should apply muted styling for normal state", () => {
      const messages = [createMockMessage("1", true)];
      const { container } = render(<ContextStatistics messages={messages} />);

      const rootElement = container.firstChild as HTMLElement;
      expect(rootElement).toHaveClass("text-muted-foreground");
    });

    it("should apply gray styling for empty conversation", () => {
      const { container } = render(<ContextStatistics messages={[]} />);

      const rootElement = container.firstChild as HTMLElement;
      expect(rootElement).toHaveClass("text-gray-500");
    });

    it("should apply font-medium for warning states", () => {
      const messages = [createMockMessage("1", false)];

      render(<ContextStatistics messages={messages} />);

      const textElement = screen.getByText("No messages included in context");
      expect(textElement).toHaveClass("font-medium");
    });
  });
});
