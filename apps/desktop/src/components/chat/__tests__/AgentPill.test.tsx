import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AgentPill } from "../AgentPill";
import { AgentPillViewModel } from "@fishbowl-ai/ui-shared";

// Mock lucide-react
jest.mock("lucide-react", () => ({
  X: ({ size, className, ...props }: any) => (
    <svg
      data-testid="x-icon"
      width={size}
      height={size}
      className={className}
      {...props}
    />
  ),
}));

// Mock the useChatStore hook
jest.mock("@fishbowl-ai/ui-shared", () => ({
  ...jest.requireActual("@fishbowl-ai/ui-shared"),
  useChatStore: () => ({
    agentThinking: {},
    lastError: {},
  }),
}));

describe("AgentPill", () => {
  const mockAgent: AgentPillViewModel = {
    name: "Test Agent",
    role: "Helper",
    color: "#3B82F6",
    enabled: true,
    isThinking: false,
    status: "idle",
  };

  const mockOnClick = jest.fn();
  const mockOnToggleEnabled = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("renders agent pill with basic information", () => {
      render(<AgentPill agent={mockAgent} />);

      expect(screen.getByText("Test Agent | Helper")).toBeInTheDocument();

      // Find the container div with the background color style
      const pillContainer = screen
        .getByText("Test Agent | Helper")
        .closest("div");
      expect(pillContainer).toHaveStyle({
        backgroundColor: "rgb(59, 130, 246)",
      });
    });

    it("renders as clickable button when onClick prop provided", () => {
      render(<AgentPill agent={mockAgent} onClick={mockOnClick} />);

      const pill = screen.getByRole("button", { name: /Test Agent \| Helper/ });
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveAttribute("tabIndex", "0");
    });

    it("renders as clickable button when onToggleEnabled prop provided", () => {
      render(
        <AgentPill
          agent={mockAgent}
          onToggleEnabled={mockOnToggleEnabled}
          conversationAgentId="conv-agent-1"
        />,
      );

      const pill = screen.getByRole("button", { name: /Test Agent \| Helper/ });
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("Delete Button Functionality", () => {
    it("does not render delete button when onDelete prop not provided", () => {
      render(<AgentPill agent={mockAgent} />);

      expect(screen.queryByTestId("x-icon")).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText("Delete Test Agent from conversation"),
      ).not.toBeInTheDocument();
    });

    it("renders delete button when onDelete prop provided", () => {
      render(
        <AgentPill
          agent={mockAgent}
          onDelete={mockOnDelete}
          conversationAgentId="conv-agent-1"
        />,
      );

      const deleteButton = screen.getByLabelText(
        "Delete Test Agent from conversation",
      );
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveAttribute("title", "Delete Test Agent");
      expect(deleteButton).toHaveAttribute("tabIndex", "-1");
      expect(screen.getByTestId("x-icon")).toBeInTheDocument();
    });

    it("calls onDelete with correct conversationAgentId when delete button clicked", () => {
      render(
        <AgentPill
          agent={mockAgent}
          onDelete={mockOnDelete}
          conversationAgentId="conv-agent-1"
        />,
      );

      const deleteButton = screen.getByLabelText(
        "Delete Test Agent from conversation",
      );
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith("conv-agent-1");
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it("does not call onDelete when conversationAgentId not provided", () => {
      render(<AgentPill agent={mockAgent} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByLabelText(
        "Delete Test Agent from conversation",
      );
      fireEvent.click(deleteButton);

      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });

  describe("Event Handling", () => {
    it("prevents event propagation when delete button clicked", () => {
      const mockMainClick = jest.fn();

      render(
        <AgentPill
          agent={mockAgent}
          onClick={mockMainClick}
          onDelete={mockOnDelete}
          conversationAgentId="conv-agent-1"
        />,
      );

      const deleteButton = screen.getByLabelText(
        "Delete Test Agent from conversation",
      );
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith("conv-agent-1");
      expect(mockMainClick).not.toHaveBeenCalled();
    });

    it("calls main pill click handler when main area clicked", () => {
      render(
        <AgentPill
          agent={mockAgent}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
          conversationAgentId="conv-agent-1"
        />,
      );

      const pill = screen.getByRole("button", { name: /Test Agent \| Helper/ });
      fireEvent.click(pill);

      expect(mockOnClick).toHaveBeenCalledWith("Test Agent");
      expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it("calls onToggleEnabled when main pill clicked with toggle handler", () => {
      render(
        <AgentPill
          agent={mockAgent}
          onToggleEnabled={mockOnToggleEnabled}
          onDelete={mockOnDelete}
          conversationAgentId="conv-agent-1"
        />,
      );

      const pill = screen.getByRole("button", { name: /Test Agent \| Helper/ });
      fireEvent.click(pill);

      expect(mockOnToggleEnabled).toHaveBeenCalledWith("conv-agent-1");
      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA label for delete button", () => {
      render(
        <AgentPill
          agent={mockAgent}
          onDelete={mockOnDelete}
          conversationAgentId="conv-agent-1"
        />,
      );

      const deleteButton = screen.getByLabelText(
        "Delete Test Agent from conversation",
      );
      expect(deleteButton).toHaveAttribute(
        "aria-label",
        "Delete Test Agent from conversation",
      );
    });

    it("has proper title attribute for delete button", () => {
      render(
        <AgentPill
          agent={mockAgent}
          onDelete={mockOnDelete}
          conversationAgentId="conv-agent-1"
        />,
      );

      const deleteButton = screen.getByLabelText(
        "Delete Test Agent from conversation",
      );
      expect(deleteButton).toHaveAttribute("title", "Delete Test Agent");
    });

    it("sets tabIndex to -1 for delete button to prevent keyboard navigation", () => {
      render(
        <AgentPill
          agent={mockAgent}
          onDelete={mockOnDelete}
          conversationAgentId="conv-agent-1"
        />,
      );

      const deleteButton = screen.getByLabelText(
        "Delete Test Agent from conversation",
      );
      expect(deleteButton).toHaveAttribute("tabIndex", "-1");
    });
  });

  describe("Visual States", () => {
    it("applies proper CSS classes to delete button", () => {
      render(
        <AgentPill
          agent={mockAgent}
          onDelete={mockOnDelete}
          conversationAgentId="conv-agent-1"
        />,
      );

      const deleteButton = screen.getByLabelText(
        "Delete Test Agent from conversation",
      );
      expect(deleteButton).toHaveClass(
        "ml-2",
        "opacity-0",
        "group-hover:opacity-100",
        "transition-opacity",
        "duration-150",
        "hover:opacity-80",
        "w-6",
        "h-6",
        "flex",
        "items-center",
        "justify-center",
        "rounded-full",
        "hover:bg-black/10",
      );
    });

    it("renders X icon with correct size", () => {
      render(
        <AgentPill
          agent={mockAgent}
          onDelete={mockOnDelete}
          conversationAgentId="conv-agent-1"
        />,
      );

      const xIcon = screen.getByTestId("x-icon");
      expect(xIcon).toHaveAttribute("width", "16");
      expect(xIcon).toHaveAttribute("height", "16");
    });
  });
});
