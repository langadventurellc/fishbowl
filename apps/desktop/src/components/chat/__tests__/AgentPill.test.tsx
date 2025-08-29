import type { AgentPillViewModel } from "@fishbowl-ai/ui-shared";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { AgentPill } from "../AgentPill";

// Mock agent data
const mockAgent: AgentPillViewModel = {
  name: "Test Agent",
  role: "Assistant",
  color: "#3b82f6",
  isThinking: false,
  enabled: true,
};

const mockDisabledAgent: AgentPillViewModel = {
  ...mockAgent,
  enabled: false,
};

const mockThinkingAgent: AgentPillViewModel = {
  ...mockAgent,
  isThinking: true,
};

describe("AgentPill", () => {
  const mockOnClick = jest.fn();
  const mockOnToggleEnabled = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders agent name and role", () => {
    render(<AgentPill agent={mockAgent} />);
    expect(screen.getByText("Test Agent | Assistant")).toBeInTheDocument();
  });

  it("applies agent color as background", () => {
    render(<AgentPill agent={mockAgent} />);
    const pill = screen.getByText("Test Agent | Assistant").parentElement;
    expect(pill).toHaveStyle({ backgroundColor: "#3b82f6" });
  });

  describe("enabled state styling", () => {
    it("shows full opacity when enabled", () => {
      render(<AgentPill agent={mockAgent} />);
      const pill = screen.getByText("Test Agent | Assistant").parentElement;
      expect(pill).toHaveClass("opacity-100");
    });

    it("shows reduced opacity when disabled", () => {
      render(<AgentPill agent={mockDisabledAgent} />);
      const pill = screen.getByText("Test Agent | Assistant").parentElement;
      expect(pill).toHaveClass("opacity-50");
    });
  });

  describe("thinking state", () => {
    it("shows thinking indicator when isThinking is true", () => {
      render(<AgentPill agent={mockThinkingAgent} />);
      const indicator = screen
        .getByText("Test Agent | Assistant")
        .parentElement?.querySelector(".animate-pulse");
      expect(indicator).toBeInTheDocument();
    });

    it("does not show thinking indicator when isThinking is false", () => {
      render(<AgentPill agent={mockAgent} />);
      const indicator = screen
        .getByText("Test Agent | Assistant")
        .parentElement?.querySelector(".animate-pulse");
      expect(indicator).not.toBeInTheDocument();
    });
  });

  describe("toggle functionality", () => {
    it("calls onToggleEnabled with conversationAgentId when clicked", () => {
      render(
        <AgentPill
          agent={mockAgent}
          onToggleEnabled={mockOnToggleEnabled}
          conversationAgentId="conv-agent-123"
        />,
      );

      fireEvent.click(screen.getByText("Test Agent | Assistant"));
      expect(mockOnToggleEnabled).toHaveBeenCalledWith("conv-agent-123");
    });

    it("shows cursor pointer when onToggleEnabled is provided", () => {
      render(
        <AgentPill
          agent={mockAgent}
          onToggleEnabled={mockOnToggleEnabled}
          conversationAgentId="conv-agent-123"
        />,
      );

      const pill = screen.getByText("Test Agent | Assistant").parentElement;
      expect(pill).toHaveClass("cursor-pointer");
    });

    it("sets proper ARIA attributes for toggle functionality", () => {
      render(
        <AgentPill
          agent={mockAgent}
          onToggleEnabled={mockOnToggleEnabled}
          conversationAgentId="conv-agent-123"
        />,
      );

      const pill = screen.getByText("Test Agent | Assistant").parentElement;
      expect(pill).toHaveAttribute("role", "button");
      expect(pill).toHaveAttribute("aria-pressed", "true");
      expect(pill).toHaveAttribute(
        "aria-label",
        "Test Agent | Assistant - enabled",
      );
    });

    it("sets aria-pressed to false when agent is disabled", () => {
      render(
        <AgentPill
          agent={mockDisabledAgent}
          onToggleEnabled={mockOnToggleEnabled}
          conversationAgentId="conv-agent-123"
        />,
      );

      const pill = screen.getByText("Test Agent | Assistant").parentElement;
      expect(pill).toHaveAttribute("aria-pressed", "false");
      expect(pill).toHaveAttribute(
        "aria-label",
        "Test Agent | Assistant - disabled",
      );
    });

    it("handles keyboard events (Enter) for toggle", () => {
      render(
        <AgentPill
          agent={mockAgent}
          onToggleEnabled={mockOnToggleEnabled}
          conversationAgentId="conv-agent-123"
        />,
      );

      const pill = screen.getByText("Test Agent | Assistant").parentElement;
      fireEvent.keyDown(pill!, { key: "Enter" });
      expect(mockOnToggleEnabled).toHaveBeenCalledWith("conv-agent-123");
    });

    it("handles keyboard events (Space) for toggle", () => {
      render(
        <AgentPill
          agent={mockAgent}
          onToggleEnabled={mockOnToggleEnabled}
          conversationAgentId="conv-agent-123"
        />,
      );

      const pill = screen.getByText("Test Agent | Assistant").parentElement;
      fireEvent.keyDown(pill!, { key: " " });
      expect(mockOnToggleEnabled).toHaveBeenCalledWith("conv-agent-123");
    });
  });

  describe("legacy onClick functionality", () => {
    it("calls onClick with agent name when no onToggleEnabled", () => {
      render(<AgentPill agent={mockAgent} onClick={mockOnClick} />);

      fireEvent.click(screen.getByText("Test Agent | Assistant"));
      expect(mockOnClick).toHaveBeenCalledWith("Test Agent");
    });

    it("prioritizes onToggleEnabled over onClick when both are provided", () => {
      render(
        <AgentPill
          agent={mockAgent}
          onClick={mockOnClick}
          onToggleEnabled={mockOnToggleEnabled}
          conversationAgentId="conv-agent-123"
        />,
      );

      fireEvent.click(screen.getByText("Test Agent | Assistant"));
      expect(mockOnToggleEnabled).toHaveBeenCalledWith("conv-agent-123");
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it("handles keyboard events with legacy onClick", () => {
      render(<AgentPill agent={mockAgent} onClick={mockOnClick} />);

      const pill = screen.getByText("Test Agent | Assistant").parentElement;
      fireEvent.keyDown(pill!, { key: "Enter" });
      expect(mockOnClick).toHaveBeenCalledWith("Test Agent");
    });
  });

  describe("accessibility", () => {
    it("sets proper tabIndex when clickable", () => {
      render(<AgentPill agent={mockAgent} onClick={mockOnClick} />);
      const pill = screen.getByText("Test Agent | Assistant").parentElement;
      expect(pill).toHaveAttribute("tabIndex", "0");
    });

    it("does not set tabIndex when not clickable", () => {
      render(<AgentPill agent={mockAgent} />);
      const pill = screen.getByText("Test Agent | Assistant").parentElement;
      expect(pill).not.toHaveAttribute("tabIndex");
    });

    it("does not set role when not clickable", () => {
      render(<AgentPill agent={mockAgent} />);
      const pill = screen.getByText("Test Agent | Assistant").parentElement;
      expect(pill).not.toHaveAttribute("role");
    });
  });

  describe("styling", () => {
    it("applies custom className", () => {
      render(<AgentPill agent={mockAgent} className="custom-class" />);
      const pill = screen.getByText("Test Agent | Assistant").parentElement;
      expect(pill).toHaveClass("custom-class");
    });

    it("applies hover effects when clickable", () => {
      render(<AgentPill agent={mockAgent} onClick={mockOnClick} />);
      const pill = screen.getByText("Test Agent | Assistant").parentElement;
      expect(pill).toHaveClass("hover:opacity-80");
    });
  });
});
